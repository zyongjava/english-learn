import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  soundEnabled: boolean;
  dailyGoal: number;
  questionsPerQuiz: number;
  lastSelectedUnitId: string;
  avatarUrl: string;
  voiceName: string;
  toggleSound: () => void;
  setDailyGoal: (goal: number) => void;
  setQuestionsPerQuiz: (count: number) => void;
  setLastSelectedUnitId: (unitId: string) => void;
  setAvatarUrl: (url: string) => void;
  setVoiceName: (name: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      dailyGoal: 10,
      questionsPerQuiz: 10,
      lastSelectedUnitId: '',
      avatarUrl: '',
      voiceName: '',

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      setQuestionsPerQuiz: (count) => set({ questionsPerQuiz: count }),
      setLastSelectedUnitId: (unitId) => set({ lastSelectedUnitId: unitId }),
      setAvatarUrl: (url) => set({ avatarUrl: url }),
      setVoiceName: (name) => set({ voiceName: name }),
    }),
    { name: 'settings-storage' }
  )
);