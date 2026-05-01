import { useState, useEffect } from 'react';
import { useMistakeStore } from '../stores/mistakeStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useSettingsStore } from '../stores/settingsStore';
import { speakWord } from '../utils/quiz';
import type { Mistake } from '../types';

interface Props {
  onBack: () => void;
}

export default function MistakesPage({ onBack }: Props) {
  const [filter, setFilter] = useState<'all' | 'recognition' | 'spelling'>('all');
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<{ letter: string; index: number }[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ letter: string; index: number; used: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const { mistakes, reviewMistake, clearAll } = useMistakeStore();
  const { recordMistakeMastered, recordMistakeReview, stats } = useAchievementStore();
  const { voiceName } = useSettingsStore();

  const filteredMistakes = mistakes.filter((m) => {
    if (filter === 'all') return !m.mastered;
    return m.type === filter && !m.mastered;
  });

  // 已掌握的错题数量
  const masteredCount = mistakes.filter((m) => m.mastered).length;

  useEffect(() => {
    if (selectedMistake) {
      if (selectedMistake.type === 'spelling') {
        const letters = selectedMistake.word.split('').map((l, i) => ({ letter: l.toLowerCase(), index: i }));
        const shuffled = [...letters].sort(() => Math.random() - 0.5).map((l, i) => ({ ...l, index: i }));
        setAvailableLetters(shuffled.map((l) => ({ ...l, used: false })));
        setSelectedLetters(selectedMistake.word.split('').map((_, i) => ({ letter: '', index: i })));
      } else {
        setSelectedOption('');
      }
      setShowResult(false);
      setIsCorrect(false);
      if (selectedMistake.type === 'recognition') {
        setTimeout(() => speakWord(selectedMistake.word, voiceName || undefined), 300);
      }
    }
  }, [selectedMistake]);

  const handleSelectLetter = (item: { letter: string; index: number; used: boolean }) => {
    if (showResult || item.used) return;
    const nextEmptyIndex = selectedLetters.findIndex((l) => l.letter === '');
    if (nextEmptyIndex === -1) return;
    const newSelected = [...selectedLetters];
    newSelected[nextEmptyIndex] = { letter: item.letter, index: nextEmptyIndex };
    setSelectedLetters(newSelected);
    setAvailableLetters(availableLetters.map((l) =>
      l.index === item.index ? { ...l, used: true } : l
    ));
  };

  const handleDeselectLetter = (index: number) => {
    if (showResult) return;
    const slot = selectedLetters[index];
    if (!slot || slot.letter === '') return;
    const letter = slot.letter;
    const newSelected = [...selectedLetters];
    newSelected[index] = { letter: '', index };
    setSelectedLetters(newSelected);
    setAvailableLetters(availableLetters.map((l) =>
      l.letter === letter && l.used ? { ...l, used: false } : l
    ));
  };

  const resetSpelling = () => {
    if (selectedMistake) {
      const letters = selectedMistake.word.split('').map((l, i) => ({ letter: l.toLowerCase(), index: i }));
      const shuffled = [...letters].sort(() => Math.random() - 0.5).map((l, i) => ({ ...l, index: i }));
      setAvailableLetters(shuffled.map((l) => ({ ...l, used: false })));
      setSelectedLetters(selectedMistake.word.split('').map((_, i) => ({ letter: '', index: i })));
    }
  };

  const handleSubmit = () => {
    if (!selectedMistake) return;

    let correct: boolean;
    if (selectedMistake.type === 'recognition') {
      correct = selectedOption === selectedMistake.correctAnswer;
    } else {
      const userAnswer = selectedLetters.map((l) => l.letter).join('').toLowerCase();
      correct = userAnswer === selectedMistake.correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (!stats.firstMistakeReviewDone) {
      recordMistakeReview();
    }

    const mastered = reviewMistake(selectedMistake.wordId, selectedMistake.type, correct);

    if (mastered) {
      recordMistakeMastered();
    }

    setTimeout(() => {
      setSelectedMistake(null);
      setShowResult(false);
    }, 1500);
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有错题吗？')) {
      clearAll();
    }
  };

  // 处理发音
  const handleSpeak = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    speakWord(word, voiceName || undefined);
  };

  if (selectedMistake) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 顶部渐变导航栏 */}
        <div className="bg-gradient-primary px-4 pt-12 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedMistake(null)} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">复习错题</h1>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="card-modern min-h-[400px] flex flex-col">
            {showResult ? (
              <div className={`flex-1 flex flex-col items-center justify-center ${isCorrect ? 'animate-bounce-in' : 'animate-shake'}`}>
                <div className="text-6xl mb-4">{isCorrect ? '✓' : '✗'}</div>
                <div className={`text-3xl font-bold mb-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {isCorrect ? '正确！' : '还是错了'}
                </div>
                {isCorrect ? (
                  <p className="text-gray-600">继续保持！</p>
                ) : (
                  <>
                    <p className="text-gray-600">正确答案是：</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedMistake.correctAnswer}</p>
                  </>
                )}
              </div>
            ) : selectedMistake.type === 'recognition' ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <button
                  onClick={() => speakWord(selectedMistake.word, voiceName || undefined)}
                  className="mb-4 p-6 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors animate-bounce-in"
                >
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                <div className="word-display">{selectedMistake.word}</div>
                <p className="text-gray-500 mb-6">点击播放后，选择正确的中文意思</p>
                <div className="w-full space-y-3">
                  {selectedMistake.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(option)}
                      className={`option-btn w-full ${selectedOption === option ? 'selected' : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="btn-gradient w-full mt-6 disabled:opacity-50"
                >
                  确认答案
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <button
                  onClick={() => speakWord(selectedMistake.word, voiceName || undefined)}
                  className="mb-4 p-6 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                <p className="text-gray-500 mb-4">点击播放，然后选择字母拼写单词</p>

                <div className="flex justify-center gap-1 sm:gap-2 min-h-[50px] sm:min-h-[60px] flex-wrap mb-4">
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

                <div className="flex justify-center gap-1 sm:gap-2 flex-wrap mb-4">
                  {availableLetters.map((item) => (
                    <button
                      key={`available-${item.index}`}
                      onClick={() => !item.used && handleSelectLetter(item)}
                      disabled={item.used}
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

                <div className="flex flex-nowrap gap-2 w-full">
                  <button onClick={resetSpelling} className="flex-1 bg-white/90 hover:bg-white text-gray-700 font-bold py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-sm sm:text-base transition-all active:scale-95 shadow">
                    重置
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedLetters.every((l) => l.letter !== '')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-sm sm:text-base transition-all active:scale-95 disabled:opacity-50"
                  >
                    确认
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-white flex-1">错题集</h1>
          {mistakes.length > 0 && (
            <button onClick={handleClearAll} className="text-white/80 hover:text-white text-sm">
              清空
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Tab 切换 */}
        <div className="flex gap-2 mb-4">
          {(['all', 'recognition', 'spelling'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'recognition' ? '单词认识' : '单词拼写'}
            </button>
          ))}
        </div>

        {/* 复习提示卡片 */}
        <div className="card-modern p-4 mb-4 bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-blue-800 mb-1">复习提示</h3>
              <p className="text-sm text-blue-600">
                连续答对2次后，题目会自动从错题集移除。建议每天复习一次错题集，巩固记忆！
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card-modern p-4">
            <p className="text-sm text-gray-500 mb-1">待温故</p>
            <p className="text-2xl font-bold text-blue-600">{filteredMistakes.length}</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-gray-500 mb-1">已斩获</p>
            <p className="text-2xl font-bold text-green-500">{masteredCount}</p>
          </div>
        </div>

        {/* 错题列表 */}
        {filteredMistakes.length === 0 ? (
          <div className="card-modern text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">太棒了！</h2>
            <p className="text-gray-500">目前没有错题，继续保持！</p>
          </div>
        ) : (
          <div className="space-y-3 mb-24">
            {filteredMistakes.map((mistake) => (
              <div
                key={mistake.id}
                onClick={() => setSelectedMistake(mistake)}
                className="card-modern p-4 flex items-center gap-4 card-pressable"
              >
                {/* 类型标签 */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  mistake.type === 'recognition'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {mistake.type === 'recognition' ? '认' : '拼'}
                </div>

                {/* 单词信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{mistake.word}</span>
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      x{mistake.times} 错误次数
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{mistake.meaning}</p>
                </div>

                {/* 发音按钮 */}
                <button
                  onClick={(e) => handleSpeak(e, mistake.word)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 开始复习按钮 */}
      {filteredMistakes.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto">
          <button
            onClick={() => setSelectedMistake(filteredMistakes[0])}
            className="btn-gradient w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            开始复习
          </button>
        </div>
      )}
    </div>
  );
}
