import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PhonicsProgress } from '../types/phonics';

interface PhonicsStore extends PhonicsProgress {
  markAsLearned: (letter: string) => void;
  isLetterLearned: (letter: string) => boolean;
  getProgress: () => { learned: number; total: number };
}

export const usePhonicsStore = create<PhonicsStore>()(
  persist(
    (set, get) => ({
      learnedLetters: [],
      lastLearnedAt: 0,

      markAsLearned: (letter) =>
        set((state) => ({
          learnedLetters: state.learnedLetters.includes(letter)
            ? state.learnedLetters
            : [...state.learnedLetters, letter],
          lastLearnedAt: Date.now(),
        })),

      isLetterLearned: (letter) =>
        get().learnedLetters.includes(letter),

      getProgress: () => ({
        learned: get().learnedLetters.length,
        total: 26,
      }),
    }),
    { name: 'phonics-progress' }
  )
);