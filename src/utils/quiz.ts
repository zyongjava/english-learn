import type { Word, QuizQuestion } from '../types';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateRecognitionQuestion(
  word: Word,
  allWords: Word[]
): QuizQuestion {
  const correctAnswer = word.meaning;
  const otherWords = allWords.filter((w) => w.id !== word.id);

  // 确保有足够的选项
  let wrongAnswers: string[];
  if (otherWords.length >= 3) {
    wrongAnswers = shuffleArray(otherWords)
      .slice(0, 3)
      .map((w) => w.meaning);
  } else {
    // 单词不足时，重复一些选项凑够3个
    const otherMeanings = otherWords.map((w) => w.meaning);
    while (otherMeanings.length < 3) {
      // 从已有选项中重复填充
      otherMeanings.push(correctAnswer === otherMeanings[0] ? '（请添加更多单词）' : otherMeanings[0]);
    }
    wrongAnswers = otherMeanings.slice(0, 3);
  }

  const options = shuffleArray([correctAnswer, ...wrongAnswers]);

  return {
    word,
    options,
    correctAnswer,
    type: 'recognition',
  };
}

export function generateSpellingQuestion(word: Word): QuizQuestion {
  const letters = word.word.split('');
  return {
    word,
    options: [],
    correctAnswer: word.word,
    type: 'spelling',
    scrambledLetters: shuffleArray(letters),
  };
}

export function generateQuiz(
  words: Word[],
  count: number,
  type: 'recognition' | 'spelling'
): QuizQuestion[] {
  if (words.length === 0) return [];

  const shuffledWords = shuffleArray(words);
  const selectedWords = shuffledWords.slice(0, Math.min(count, words.length));

  return selectedWords.map((word) => {
    if (type === 'recognition') {
      return generateRecognitionQuestion(word, words);
    } else {
      return generateSpellingQuestion(word);
    }
  });
}

export async function speakWord(word: string, voiceName?: string): Promise<void> {
  const cleanWord = word.toLowerCase().trim();
  if (!cleanWord) return;

  // 优先尝试 Capacitor TTS（在 Android 上通常可用）
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await TextToSpeech.speak({
      text: cleanWord,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
    });
    return;
  } catch (e) {
    // Capacitor TTS 不可用，继续使用 Web Speech API
  }

  // 使用 Web Speech API
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    // 等待语音列表加载
    const getVoices = (): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      // 优先查找指定名称的语音
      if (voiceName) {
        const namedVoice = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
        if (namedVoice) return namedVoice;
      }
      // 优先使用英文语音，按优先级筛选
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      // 尝试找女声（通常更清晰）
      const female = enVoices.find(v => /female|samantha|zira|victoria|karen|moira|tessa|fei-female/i.test(v.name));
      if (female) return female;
      // 找美式英语
      const usVoice = enVoices.find(v => v.lang === 'en-US');
      if (usVoice) return usVoice;
      // 找任何英文语音
      return enVoices[0] || null;
    };

    // 语音列表可能需要异步加载
    const setVoiceAndSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(cleanWord + '.');
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      const voice = getVoices();
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    };

    // 如果语音列表为空，等待加载
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak);
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', setVoiceAndSpeak);
      }, 5000);
    } else {
      setVoiceAndSpeak();
    }
  }
}

// 获取可用的英文语音列表
export function getAvailableVoices(): { name: string; lang: string }[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices()
    .filter(v => v.lang.startsWith('en'))
    .map(v => ({ name: v.name, lang: v.lang }));
}

// 异步获取语音列表（兼容 Android）
export function getAvailableVoicesAsync(): Promise<{ name: string; lang: string }[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices.filter(v => v.lang.startsWith('en')).map(v => ({ name: v.name, lang: v.lang })));
    } else {
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')).map(v => ({ name: v.name, lang: v.lang })));
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve([]);
      }, 3000);
    }
  });
}