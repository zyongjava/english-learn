import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mistake, Word } from '../types';
import { shuffleArray } from '../utils/quiz';

interface MistakeStore {
  mistakes: Mistake[];
  allWords: Word[];
  addMistake: (word: Word, type: 'recognition' | 'spelling', wrongAnswer: string) => void;
  removeMistake: (wordId: string, type: 'recognition' | 'spelling') => void;
  reviewMistake: (wordId: string, type: 'recognition' | 'spelling', correct: boolean) => boolean;
  clearAll: () => void;
  getMistakesByUnit: (unitId: string) => Mistake[];
  getActiveMistakes: () => Mistake[];
  setAllWords: (words: Word[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

// 生成认识题选项
const generateRecognitionOptions = (correctMeaning: string, allWords: Word[]): string[] => {
  const otherMeanings = allWords
    .filter((w) => w.meaning !== correctMeaning)
    .map((w) => w.meaning);
  const shuffled = shuffleArray(otherMeanings).slice(0, 3);
  return shuffleArray([correctMeaning, ...shuffled]);
};

export const useMistakeStore = create<MistakeStore>()(
  persist(
    (set, get) => ({
      mistakes: [],
      allWords: [],

      setAllWords: (words) => set({ allWords: words }),

      addMistake: (word, type, wrongAnswer) => {
        const existing = get().mistakes.find(
          (m) => m.wordId === word.id && m.type === type && !m.mastered
        );

        const options = type === 'recognition' ? generateRecognitionOptions(word.meaning, get().allWords) : undefined;

        if (existing) {
          set((state) => ({
            mistakes: state.mistakes.map((m) =>
              m.id === existing.id
                ? { ...m, times: m.times + 1, wrongAnswer, lastReviewAt: Date.now(), nextReviewAt: Date.now() }
                : m
            ),
          }));
        } else {
          const newMistake: Mistake = {
            id: generateId(),
            wordId: word.id,
            unitId: word.unitId,
            type,
            word: word.word,
            meaning: word.meaning,
            wrongAnswer,
            correctAnswer: type === 'recognition' ? word.meaning : word.word,
            options,
            times: 0,
            lastReviewAt: Date.now(),
            nextReviewAt: Date.now(),
            mastered: false,
          };
          set((state) => ({ mistakes: [...state.mistakes, newMistake] }));
        }
      },

      removeMistake: (wordId, type) => set((state) => ({
        mistakes: state.mistakes.filter((m) => !(m.wordId === wordId && m.type === type)),
      })),

      reviewMistake: (wordId, type, correct) => {
        const mistake = get().mistakes.find((m) => m.wordId === wordId && m.type === type);
        if (!mistake) return false;

        let mastered = false;
        if (correct) {
          const newTimes = mistake.times - 1;
          if (newTimes <= 0) {
            mastered = true;
            get().removeMistake(wordId, type);
          } else {
            set((state) => ({
              mistakes: state.mistakes.map((m) =>
                m.id === mistake.id
                  ? { ...m, times: newTimes, lastReviewAt: Date.now() }
                  : m
              ),
            }));
          }
        } else {
          set((state) => ({
            mistakes: state.mistakes.map((m) =>
              m.id === mistake.id
                ? { ...m, times: m.times + 1, lastReviewAt: Date.now() }
                : m
            ),
          }));
        }
        return mastered;
      },

      clearAll: () => set({ mistakes: [] }),

      getMistakesByUnit: (unitId) => get().mistakes.filter((m) => m.unitId === unitId),

      getActiveMistakes: () => get().mistakes.filter((m) => !m.mastered),
    }),
    { name: 'mistake-storage' }
  )
);