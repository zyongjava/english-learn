import { useState, useEffect, useCallback, useRef } from 'react';
import { useUnitStore } from '../stores/unitStore';
import { useMistakeStore } from '../stores/mistakeStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useCheckInStore } from '../stores/checkInStore';
import { generateQuiz, speakWord } from '../utils/quiz';
import type { QuizQuestion, Unit } from '../types';

type Mode = 'select' | 'study' | 'recognition' | 'spelling';
type QuizState = 'answering' | 'correct' | 'wrong' | 'finished' | 'learning';

interface Props {
  onBack: () => void;
}

export default function LearningPage({ onBack }: Props) {
  const [mode, setMode] = useState<Mode>('select');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [studyWords, setStudyWords] = useState<Unit['words']>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ letter: string; index: number }[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ letter: string; index: number; used: boolean }[]>([]);
  const [readingScore, setReadingScore] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [manualEnd, setManualEnd] = useState(false);
  const [hasGraded, setHasGraded] = useState(false);
  const hasGradedRef = useRef(false);
  const manualEndRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gradingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionWaitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenerRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    hasGradedRef.current = hasGraded;
  }, [hasGraded]);

  useEffect(() => {
    manualEndRef.current = manualEnd;
  }, [manualEnd]);

  const { units } = useUnitStore();
  const { addMistake, setAllWords } = useMistakeStore();
  const { questionsPerQuiz, soundEnabled, lastSelectedUnitId, setLastSelectedUnitId, voiceName } = useSettingsStore();
  const { recordWordLearned, recordCorrect, checkDailyReset, checkTimeBased } = useAchievementStore();
  const { recordModuleCompletion } = useCheckInStore();

  useEffect(() => {
    const allWords = units.flatMap((u) => u.words);
    setAllWords(allWords);
  }, [units, setAllWords]);

  useEffect(() => {
    if (lastSelectedUnitId) {
      const unit = units.find((u) => u.id === lastSelectedUnitId);
      if (unit) setSelectedUnit(unit);
    }
    checkDailyReset();
    checkTimeBased();
  }, [units, lastSelectedUnitId]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (gradingTimeoutRef.current) clearTimeout(gradingTimeoutRef.current);
      if (recognitionWaitRef.current) clearTimeout(recognitionWaitRef.current);
      if (listenerRef.current) listenerRef.current.remove();
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentStudyWord = studyWords[currentIndex];

  const startStudy = useCallback((unit: Unit) => {
    if (unit.words.length === 0) {
      alert('该单元没有单词，请先添加单词');
      return;
    }
    setSelectedUnit(unit);
    setStudyWords([...unit.words]);
    setCurrentIndex(0);
    setMode('study');
    setQuizState('learning');
    setReadingScore(null);
    setIsRecording(false);
    setCountdown(null);
    setHasGraded(false);
  }, []);

  const speakWordWithAnimation = (word: string, callback?: () => void) => {
    setIsSpeaking(true);
    const doCallback = () => {
      setIsSpeaking(false);
      callback?.();
    };
    speakWord(word, voiceName || undefined).then(doCallback).catch(() => setIsSpeaking(false));
  };

  const speakFeedback = (score: number) => {
    if (score >= 5) {
      speakWord('Perfect', voiceName || undefined);
    } else if (score >= 4) {
      speakWord('Good', voiceName || undefined);
    } else {
      speakWord('Try again', voiceName || undefined);
    }
  };

  const stopRecording = async () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (gradingTimeoutRef.current) {
      clearTimeout(gradingTimeoutRef.current);
      gradingTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        await (SpeechRecognition as any).stop();
      } catch (e) {}
    }
    setIsRecording(false);
    setCountdown(null);
  };

  const handleStudentRead = () => {
    if (!currentStudyWord) return;
    if (isRecording) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (gradingTimeoutRef.current) {
        clearTimeout(gradingTimeoutRef.current);
        gradingTimeoutRef.current = null;
      }
      setManualEnd(true);
      manualEndRef.current = true;
      stopRecording();
      setIsRecording(false);
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
      if (!hasGradedRef.current) {
        setHasGraded(true);
        if (readingScore === null) {
          const defaultScore = 0;
          setReadingScore(defaultScore);
          speakFeedback(defaultScore);
        }
      }
      return;
    }
    window.speechSynthesis?.cancel();
    setReadingScore(null);
    setHasGraded(false);
    setManualEnd(false);
    startRecordingWithCountdown(currentStudyWord.word);
  };

  const startRecordingWithCountdown = async (targetWord: string) => {
    setReadingScore(null);
    setIsRecording(true);
    setCountdown(5);
    setHasGraded(false);
    setManualEnd(false);
    hasGradedRef.current = false;
    manualEndRef.current = false;
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (gradingTimeoutRef.current) {
      clearTimeout(gradingTimeoutRef.current);
      gradingTimeoutRef.current = null;
    }
    if (recognitionWaitRef.current) {
      clearTimeout(recognitionWaitRef.current);
      recognitionWaitRef.current = null;
    }
    if (listenerRef.current) {
      listenerRef.current.remove();
      listenerRef.current = null;
    }
    let remaining = 5;
    countdownRef.current = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
      }
    }, 1000);
    gradingTimeoutRef.current = setTimeout(() => {
      if (!manualEndRef.current && !hasGradedRef.current) {
        hasGradedRef.current = true;
        stopRecording();
        if (listenerRef.current) {
          listenerRef.current.remove();
          listenerRef.current = null;
        }
        const defaultScore = 0;
        setReadingScore(defaultScore);
        speakFeedback(defaultScore);
        setHasGraded(true);
      }
    }, 5000);
    await startRecording(targetWord);
  };

  const startRecording = async (targetWord: string) => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        const plugin = SpeechRecognition as any;
        if (!plugin.available) {
          throw new Error('Speech recognition not available');
        }
        const resultPromise = new Promise<{ matches: string[] }>((resolve) => {
          SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
            resolve(data);
          }).then((listener: any) => {
            listenerRef.current = { remove: () => listener.remove() };
          });
        });
        await SpeechRecognition.start({
          language: 'en-US',
          maxResults: 1,
          prompt: '',
          partialResults: true,
          popup: false,
        });
        const timeoutPromise = new Promise<'timeout'>((resolve) => {
          recognitionWaitRef.current = setTimeout(() => {
            resolve('timeout');
          }, 5000);
        });
        const result = await Promise.race([resultPromise, timeoutPromise]);
        if (recognitionWaitRef.current) {
          clearTimeout(recognitionWaitRef.current);
          recognitionWaitRef.current = null;
        }
        if (!hasGradedRef.current) {
          hasGradedRef.current = true;
          stopRecording();
          if (listenerRef.current) {
            listenerRef.current.remove();
            listenerRef.current = null;
          }
          if (result !== 'timeout' && result.matches && result.matches.length > 0) {
            const transcript = result.matches[0].toLowerCase().replace(/\s+/g, '');
            const target = targetWord.toLowerCase().replace(/\s+/g, '');
            const similarity = calculateSimilarity(transcript, target);
            const score = Math.max(1, Math.round(similarity * 5));
            setReadingScore(score);
            setHasGraded(true);
            speakFeedback(score);
          } else {
            const score = 0;
            setReadingScore(score);
            setHasGraded(true);
            speakFeedback(score);
          }
        }
        try {
          await SpeechRecognition.stop();
        } catch (e) {}
        if (listenerRef.current) {
          listenerRef.current.remove();
          listenerRef.current = null;
        }
        setIsRecording(false);
        setCountdown(null);
        return;
      } catch (e) {
        console.error('Native speech recognition error:', e);
      }
    }
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('您的浏览器不支持语音识别功能，请使用 Chrome 浏览器');
      setIsRecording(false);
      return;
    }
    try {
      const permission = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
      if (permission?.state === 'denied') {
        alert('请允许使用麦克风权限后重试');
        setIsRecording(false);
        return;
      }
    } catch (e) {}
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      if (hasGradedRef.current) return;
      hasGradedRef.current = true;
      stopRecording();
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
      const transcript = event.results[0][0].transcript.toLowerCase().replace(/\s+/g, '');
      const target = targetWord.toLowerCase().replace(/\s+/g, '');
      const similarity = calculateSimilarity(transcript, target);
      const score = Math.max(1, Math.round(similarity * 5));
      setReadingScore(score);
      setHasGraded(true);
      speakFeedback(score);
    };
    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        return;
      }
      console.error('Speech recognition error:', event.error);
      stopRecording();
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
      if (event.error === 'not-allowed') {
        alert('请允许使用麦克风权限');
      } else if (event.error === 'no-speech') {
        if (hasGradedRef.current) return;
        const score = 0;
        setReadingScore(score);
        setHasGraded(true);
        speakFeedback(score);
      }
    };
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      stopRecording();
      alert('启动录音失败，请重试');
    }
  };

  const calculateSimilarity = (s1: string, s2: string): number => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (s1: string, s2: string): number => {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`text-3xl ${i <= score ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const getScoreText = (score: number | null): { text: string; color: string } => {
    if (score === null) return { text: '', color: '' };
    if (score >= 5) return { text: '太棒了！', color: 'text-green-500' };
    if (score >= 4) return { text: '很好！', color: 'text-blue-500' };
    return { text: '继续努力', color: 'text-orange-500' };
  };

  const nextStudyWord = () => {
    if (currentStudyWord) {
      recordWordLearned(currentStudyWord.id);
    }
    if (currentIndex + 1 >= studyWords.length) {
      setQuizState('finished');
      recordModuleCompletion('learning');
    } else {
      setCurrentIndex((i) => i + 1);
      setReadingScore(null);
      setHasGraded(false);
      setManualEnd(false);
      setIsRecording(false);
      setCountdown(null);
      hasGradedRef.current = false;
      manualEndRef.current = false;
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (gradingTimeoutRef.current) {
        clearTimeout(gradingTimeoutRef.current);
        gradingTimeoutRef.current = null;
      }
    }
  };

  const startQuiz = useCallback((type: 'recognition' | 'spelling', unit: Unit) => {
    const quizQuestions = generateQuiz(unit.words, questionsPerQuiz, type);
    if (quizQuestions.length === 0) {
      alert('该单元没有单词，请先添加单词');
      return;
    }
    setQuestions(quizQuestions);
    setCurrentIndex(0);
    setCorrectCount(0);
    setQuizState('answering');
    setSelectedAnswer('');
    setShowHint(false);
    setMode(type);
    setSelectedUnit(unit);
    if (type === 'spelling' && quizQuestions[0].scrambledLetters) {
      setAvailableLetters(quizQuestions[0].scrambledLetters.map((l, i) => ({ letter: l, index: i, used: false })));
      setSelectedLetters(quizQuestions[0].correctAnswer.split('').map((_, i) => ({ letter: '', index: i })));
    }
  }, [questionsPerQuiz]);

  useEffect(() => {
    if (mode === 'recognition' && quizState === 'answering' && currentQuestion) {
      setTimeout(() => {
        speakWord(currentQuestion.word.word, voiceName || undefined);
      }, 300);
    }
  }, [currentIndex, mode, quizState]);

  useEffect(() => {
    if (mode === 'spelling' && currentQuestion?.scrambledLetters) {
      setAvailableLetters(currentQuestion.scrambledLetters.map((l, i) => ({ letter: l, index: i, used: false })));
      setSelectedLetters(currentQuestion.correctAnswer.split('').map((_, i) => ({ letter: '', index: i })));
      setQuizState('answering');
    }
  }, [currentIndex, mode]);

  const playSound = (type: 'correct' | 'wrong') => {
    if (!soundEnabled) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (type === 'correct') {
      oscillator.frequency.value = 523.25;
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else {
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  };

  const handleRecognitionAnswer = (answer: string) => {
    if (quizState !== 'answering') return;
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion?.correctAnswer;
    if (isCorrect) {
      setQuizState('correct');
      setCorrectCount((c) => c + 1);
      playSound('correct');
      recordCorrect('recognition', 1, 1);
    } else {
      setQuizState('wrong');
      playSound('wrong');
      if (currentQuestion) {
        addMistake(currentQuestion.word, 'recognition', answer);
        recordCorrect('recognition', 1, 0);
      }
    }
  };

  const handleSpellingSubmit = () => {
    if (quizState !== 'answering') return;
    const allFilled = selectedLetters.every((l) => l.letter !== '');
    if (!allFilled) return;
    const userAnswer = selectedLetters.map((l) => l.letter).join('').toLowerCase();
    const isCorrect = userAnswer === currentQuestion?.correctAnswer.toLowerCase();
    if (isCorrect) {
      setQuizState('correct');
      setCorrectCount((c) => c + 1);
      playSound('correct');
      recordCorrect('spelling', 1, 1);
    } else {
      setQuizState('wrong');
      playSound('wrong');
      if (currentQuestion) {
        addMistake(currentQuestion.word, 'spelling', userAnswer);
        recordCorrect('spelling', 1, 0);
      }
    }
  };

  const handleSelectLetter = (item: { letter: string; index: number; used: boolean }) => {
    if (quizState !== 'answering' || item.used) return;
    const emptySlot = selectedLetters.findIndex((l) => l.letter === '');
    if (emptySlot === -1) return;
    setAvailableLetters(availableLetters.map((l) =>
      l.index === item.index ? { ...l, used: true } : l
    ));
    setSelectedLetters(selectedLetters.map((l, i) =>
      i === emptySlot ? { letter: item.letter, index: emptySlot } : l
    ));
  };

  const handleDeselectLetter = (slotIndex: number) => {
    if (quizState !== 'answering') return;
    const slot = selectedLetters[slotIndex];
    if (!slot || slot.letter === '') return;
    setAvailableLetters(availableLetters.map((l) =>
      l.letter === slot.letter && l.used ? { ...l, used: false } : l
    ));
    setSelectedLetters(selectedLetters.map((l, i) =>
      i === slotIndex ? { letter: '', index: slotIndex } : l
    ));
  };

  const resetSpellingLetters = () => {
    if (currentQuestion?.scrambledLetters) {
      setAvailableLetters(currentQuestion.scrambledLetters.map((l, i) => ({ letter: l, index: i, used: false })));
      setSelectedLetters(currentQuestion.correctAnswer.split('').map((_, i) => ({ letter: '', index: i })));
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizState('finished');
      if (mode === 'recognition') {
        recordModuleCompletion('recognition');
      } else if (mode === 'spelling') {
        recordModuleCompletion('spelling');
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setQuizState('answering');
      setSelectedAnswer('');
      setShowHint(false);
    }
  };

  const restartQuiz = () => {
    if (selectedUnit) {
      startQuiz(mode as 'recognition' | 'spelling', selectedUnit);
    }
  };

  const restartStudy = () => {
    if (selectedUnit) {
      startStudy(selectedUnit);
    }
  };

  useEffect(() => {
    if (mode !== 'select' && currentQuestion?.type === 'spelling') {
      speakWord(currentQuestion.word.word, voiceName || undefined);
    }
  }, [currentIndex, mode]);

  useEffect(() => {
    if (mode === 'study' && currentStudyWord) {
      setTimeout(() => {
        speakWordWithAnimation(currentStudyWord.word);
      }, 500);
      setReadingScore(null);
      setHasGraded(false);
      setManualEnd(false);
      setIsRecording(false);
      setCountdown(null);
    }
  }, [currentIndex, mode]);

  useEffect(() => {
    if (hasGraded && isRecording) {
      setIsRecording(false);
    }
  }, [hasGraded, isRecording]);

  if (mode === 'study' && quizState === 'finished') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* 烟花效果背景 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute top-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
          <div className="absolute bottom-40 right-10 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.7s' }} />
          <div className="absolute bottom-60 left-20 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '1.9s', animationDelay: '0.2s' }} />
          {/* 烟花爆炸效果 */}
          <svg className="absolute top-16 left-1/4 w-32 h-32 text-yellow-300 opacity-60" viewBox="0 0 100 100">
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(0 50 50)" />
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(45 50 50)" />
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(90 50 50)" />
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(135 50 50)" />
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(180 50 50)" />
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(225 50 50)" />
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(270 50 50)" />
            <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(315 50 50)" />
          </svg>
          <svg className="absolute top-32 right-8 w-24 h-24 text-pink-300 opacity-50" viewBox="0 0 100 100">
            <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(0 50 50)" />
            <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(60 50 50)" />
            <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(120 50 50)" />
            <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(180 50 50)" />
            <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(240 50 50)" />
            <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(300 50 50)" />
          </svg>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center animate-bounce-in">
            {/* 顶部图标 */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">学完啦！</h2>
            <p className="text-sm text-gray-500 mb-6">已经学习了 {studyWords.length} 个单词</p>

            {/* 得分 */}
            <div className="text-6xl font-bold text-emerald-500 mb-2">100%</div>
            <p className="text-emerald-600 font-medium mb-8">太棒了！继续加油！</p>

            {/* 按钮 */}
            <button onClick={onBack} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg mb-3">
              返回主页
            </button>
            <button onClick={restartStudy} className="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-2xl mb-4">
              再学一遍
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'study' && currentStudyWord) {
    const scoreText = getScoreText(readingScore);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-primary px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <button onClick={() => { window.speechSynthesis?.cancel(); stopRecording(); setMode('select'); }} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-white text-lg font-medium">
              {currentIndex + 1} / {studyWords.length}
            </div>
            <div className="w-10" />
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / studyWords.length) * 100}%` }} />
          </div>
        </div>
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="card-modern min-h-[450px] flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative">
                <div className={`w-64 h-64 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col items-center justify-center shadow-2xl ${isSpeaking ? 'animate-pulse' : ''}`}>
                  <div className="text-5xl font-bold text-white mb-2">{currentStudyWord.word}</div>
                  <div className="text-xl text-white/80">{currentStudyWord.phonetic}</div>
                </div>
                <button
                  onClick={() => speakWordWithAnimation(currentStudyWord.word)}
                  className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center transition-all ${isSpeaking ? 'scale-110' : 'hover:scale-110'}`}
                >
                  <svg className={`w-8 h-8 text-blue-500 ${isSpeaking ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
              <div className="mt-8 text-3xl font-bold text-gray-800">{currentStudyWord.meaning}</div>
              {readingScore !== null && (
                <div className="mt-6 text-center animate-bounce-in">
                  <div className={`text-2xl font-bold mb-2 ${scoreText.color}`}>{scoreText.text}</div>
                  {renderStars(readingScore)}
                </div>
              )}
              <button
                onClick={handleStudentRead}
                className={`mt-6 btn-gradient flex items-center gap-3 transition-all min-h-[60px] ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isRecording ? (
                  <>结束 {countdown !== null ? `${countdown}秒` : ''}</>
                ) : (
                  <>我来跟读</>
                )}
              </button>
              <p className="mt-4 text-gray-500 text-sm">点击按钮，听标准发音，然后跟读</p>
            </div>
            <div className="mt-auto pt-6 border-t border-gray-100">
              <button onClick={nextStudyWord} className="w-full btn-success py-4 text-xl">
                {currentIndex + 1 >= studyWords.length ? '完成学习' : '下一个单词'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 page-content">
        {/* 顶部渐变导航栏 */}
        <div className="bg-gradient-primary px-4 pt-12 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">选择学习模式</h1>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          {/* 选择单元 */}
          <div className="card-modern p-4 mb-4">
            <h2 className="text-sm text-gray-500 mb-3">选择单元</h2>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <select
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-blue-500 appearance-none"
                onChange={(e) => {
                  const unit = units.find((u) => u.id === e.target.value);
                  setSelectedUnit(unit || null);
                  if (unit) setLastSelectedUnitId(unit.id);
                }}
                value={selectedUnit?.id || ''}
              >
                <option value="">请选择单元</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.words.length}个单词)
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 学习模式选择 */}
          <div className="space-y-3 mb-4">
            {/* 单词学习 - 全宽绿色 */}
            <button
              onClick={() => selectedUnit && startStudy(selectedUnit)}
              disabled={!selectedUnit}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 px-6 rounded-2xl text-lg transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              单词学习
            </button>

            {/* 单词认识 & 单词拼写 - 两列 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => selectedUnit && startQuiz('recognition', selectedUnit)}
                disabled={!selectedUnit}
                className="bg-gradient-to-r from-blue-400 to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 px-4 rounded-2xl text-base transition-all duration-200 active:scale-95 shadow-lg flex flex-col items-center gap-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>单词认识</span>
              </button>

              <button
                onClick={() => selectedUnit && startQuiz('spelling', selectedUnit)}
                disabled={!selectedUnit}
                className="bg-gradient-to-r from-green-400 to-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 px-4 rounded-2xl text-base transition-all duration-200 active:scale-95 shadow-lg flex flex-col items-center gap-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>单词拼写</span>
              </button>
            </div>
          </div>

          {/* 学习说明 */}
          <div className="card-modern p-4 mb-4 bg-green-50 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-green-800">学习说明</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">•</span>
                <p><span className="font-semibold text-green-700">单词学习：</span>看单词、听发音，跟读练习，零基础也能学</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">•</span>
                <p><span className="font-semibold text-green-700">单词认识：</span>看英语单词，选择对应的中文意思</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">•</span>
                <p><span className="font-semibold text-green-700">单词拼写：</span>听发音，输入正确的英语单词</p>
              </div>
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                <p className="text-orange-500 text-xs">✨ 答错的题目会自动加入错题集哦！</p>
              </div>
            </div>
          </div>

          {/* 推广卡片 */}
          <div className="card-modern p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">解锁高级学习模式</h3>
                <p className="text-white/80 text-sm">体验AI发音实时测评系统</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'finished') {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const isPerfect = accuracy === 100;
    const isGood = accuracy >= 80;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* 烟花效果背景 */}
        {isGood && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            <div className="absolute top-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
            <div className="absolute bottom-40 right-10 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.7s' }} />
            <div className="absolute bottom-60 left-20 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '1.9s', animationDelay: '0.2s' }} />
            {/* 烟花爆炸效果 */}
            <svg className="absolute top-16 left-1/4 w-32 h-32 text-yellow-300 opacity-60" viewBox="0 0 100 100">
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(0 50 50)" />
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(45 50 50)" />
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(90 50 50)" />
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(135 50 50)" />
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(180 50 50)" />
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(225 50 50)" />
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(270 50 50)" />
              <path d="M50 10 L52 40 L50 50 L48 40 Z" fill="currentColor" transform="rotate(315 50 50)" />
            </svg>
            <svg className="absolute top-32 right-8 w-24 h-24 text-pink-300 opacity-50" viewBox="0 0 100 100">
              <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(0 50 50)" />
              <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(60 50 50)" />
              <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(120 50 50)" />
              <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(180 50 50)" />
              <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(240 50 50)" />
              <path d="M50 10 L52 35 L50 45 L48 35 Z" fill="currentColor" transform="rotate(300 50 50)" />
            </svg>
          </div>
        )}

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center animate-bounce-in">
            {/* 顶部图标 */}
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isPerfect ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
              isGood ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
              'bg-gradient-to-r from-orange-400 to-orange-500'
            }`}>
              {isPerfect ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isGood ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {isPerfect ? '完美！' : isGood ? '太棒了！' : accuracy >= 60 ? '做得不错！' : '继续加油！'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              正确 {correctCount} / 总共 {questions.length} 题
            </p>

            {/* 得分 */}
            <div className={`text-6xl font-bold mb-2 ${
              isPerfect ? 'text-emerald-500' : isGood ? 'text-blue-600' : 'text-orange-500'
            }`}>
              {accuracy}%
            </div>

            {/* 鼓励文字 */}
            <p className={`font-medium mb-8 ${
              isPerfect ? 'text-emerald-600' : isGood ? 'text-blue-600' : 'text-orange-500'
            }`}>
              {isPerfect ? '满分！你真厉害！' : isGood ? '继续加油！' : '再接再厉，你可以的！'}
            </p>

            {/* 按钮 */}
            <button onClick={onBack} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg mb-3">
              返回主页
            </button>
            <button onClick={restartQuiz} className="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-2xl">
              再来一次
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-primary px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('select')} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-white text-lg font-medium">{currentIndex + 1} / {questions.length}</div>
          <div className="w-10" />
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="card-modern min-h-[400px] flex flex-col">
          {currentQuestion && (
            <>
              <div className="flex-1 flex flex-col items-center justify-center">
                {currentQuestion.type === 'recognition' ? (
                  <>
                    <button
                      onClick={() => speakWord(currentQuestion.word.word)}
                      className="mb-4 p-6 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors animate-bounce-in"
                    >
                      <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                    <div className="word-display">{currentQuestion.word.word}</div>
                    <div className="phonetic">{currentQuestion.word.phonetic}</div>
                    <p className="text-gray-500 mb-6">点击播放后，选择正确的中文意思</p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => speakWord(currentQuestion.word.word)}
                      className="mb-8 p-6 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                    <p className="text-gray-500 mb-8">点击播放按钮听发音，然后拼写单词</p>
                    {showHint && (
                      <div className="meaning mb-4">
                        提示：{currentQuestion.correctAnswer[0]}... ({currentQuestion.correctAnswer.length}个字母)
                      </div>
                    )}
                  </>
                )}

                {quizState === 'answering' && currentQuestion.type === 'recognition' && (
                  <div className="w-full space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecognitionAnswer(option)}
                        className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {quizState === 'answering' && currentQuestion.type === 'spelling' && (
                  <div className="w-full space-y-4">
                    <div className="flex justify-center gap-1 sm:gap-2 min-h-[50px] sm:min-h-[60px] flex-wrap">
                      {selectedLetters.map((slot, index) => (
                        slot.letter ? (
                          <button
                            key={`selected-${index}`}
                            onClick={() => handleDeselectLetter(index)}
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500 text-white text-xl sm:text-2xl font-bold shadow-lg hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center"
                          >
                            {slot.letter}
                          </button>
                        ) : (
                          <div
                            key={`empty-${index}`}
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center"
                          />
                        )
                      ))}
                    </div>

                    <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
                      {availableLetters.map((item) => (
                        <button
                          key={`available-${item.index}`}
                          onClick={() => !item.used && handleSelectLetter(item)}
                          disabled={item.used || quizState !== 'answering'}
                          className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl text-xl sm:text-2xl font-bold shadow transition-all flex items-center justify-center ${
                            item.used
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
                          }`}
                        >
                          {item.letter}
                        </button>
                      ))}
                    </div>

                    {showHint && (
                      <div className="text-center text-gray-500">
                        提示：{currentQuestion.correctAnswer} ({currentQuestion.correctAnswer.length}个字母)
                      </div>
                    )}

                    <div className="flex flex-nowrap gap-2">
                      <button onClick={resetSpellingLetters} className="flex-1 bg-white/90 hover:bg-white text-gray-700 font-bold py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-sm sm:text-base transition-all active:scale-95 shadow">
                        重置
                      </button>
                      <button onClick={() => setShowHint(true)} className="flex-1 bg-white/90 hover:bg-white text-gray-700 font-bold py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-sm sm:text-base transition-all active:scale-95 shadow">
                        提示
                      </button>
                      <button
                        onClick={handleSpellingSubmit}
                        disabled={!selectedLetters.every((l) => l.letter !== '')}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow text-white font-bold py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-sm sm:text-base transition-all active:scale-95 disabled:opacity-50"
                      >
                        确认
                      </button>
                    </div>
                  </div>
                )}

                {quizState === 'correct' && (
                  <div className="text-center animate-bounce-in">
                    <div className="text-7xl mb-2 text-green-500">✓</div>
                    <div className="text-3xl font-bold text-green-500 mb-2">正确！</div>
                    <div className="meaning mb-8">{currentQuestion.correctAnswer}</div>
                    <button onClick={nextQuestion} className="btn-gradient">下一题</button>
                  </div>
                )}

                {quizState === 'wrong' && (
                  <div className="text-center animate-shake">
                    <div className="text-6xl mb-4">✗</div>
                    <div className="text-3xl font-bold text-red-500 mb-2">答错了</div>
                    <div className="text-xl text-gray-600 mb-2">
                      你的答案：<span className="text-red-500 font-bold">{selectedAnswer || selectedLetters.map((l) => l.letter).join('')}</span>
                    </div>
                    <div className="meaning mb-8">正确答案：{currentQuestion.correctAnswer}</div>
                    <button onClick={nextQuestion} className="btn-gradient">下一题</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
