import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, AchievementStats, UnlockedAchievement } from '../types';

const defaultStats: AchievementStats = {
  totalWordsLearned: 0,
  totalCorrect: 0,
  currentStreak: 0,
  maxStreak: 0,
  mistakesMastered: 0,
  totalMistakes: 0,
  streakDays: 0,
  lastStudyDate: '',
  correctInSession: 0,
  dailyWordsLearned: 0,
  learnedWordIds: [],  // 使用数组存储
  correctRecog100: false,
  correctSpell100: false,
  firstStudyDone: false,
  firstMistakeReviewDone: false,
  morningStudy: false,
  nightStudy: false,
};

export const achievements: Achievement[] = [
  // 新手徽章
  {
    id: 'first-study',
    name: '初次学习',
    icon: '🌟',
    description: '完成第一次学习',
    category: 'beginner',
    rarity: 'common',
    condition: (stats) => stats.firstStudyDone,
    goldReward: 10,
  },
  {
    id: 'recog-100',
    name: '认读达人',
    icon: '🎯',
    description: '单词认识正确率100%',
    category: 'beginner',
    rarity: 'common',
    condition: (stats) => stats.correctRecog100,
    goldReward: 15,
  },
  {
    id: 'spell-100',
    name: '拼写小能手',
    icon: '✏️',
    description: '单词拼写正确率100%',
    category: 'beginner',
    rarity: 'common',
    condition: (stats) => stats.correctSpell100,
    goldReward: 20,
  },
  // 连续徽章
  {
    id: 'streak-5',
    name: '连胜新星',
    icon: '⭐',
    description: '连续答对5题',
    category: 'streak',
    rarity: 'common',
    condition: (stats) => stats.maxStreak >= 5,
    getProgress: (stats) => Math.min(stats.maxStreak, 5),
    target: 5,
    goldReward: 10,
  },
  {
    id: 'streak-20',
    name: '连胜达人',
    icon: '🌈',
    description: '连续答对20题',
    category: 'streak',
    rarity: 'rare',
    condition: (stats) => stats.maxStreak >= 20,
    getProgress: (stats) => Math.min(stats.maxStreak, 20),
    target: 20,
    goldReward: 30,
  },
  {
    id: 'streak-50',
    name: '连胜之王',
    icon: '👑',
    description: '连续答对50题',
    category: 'streak',
    rarity: 'epic',
    condition: (stats) => stats.maxStreak >= 50,
    getProgress: (stats) => Math.min(stats.maxStreak, 50),
    target: 50,
    goldReward: 50,
  },
  // 学习徽章
  {
    id: 'daily-10',
    name: '勤奋学习',
    icon: '📚',
    description: '单日学习10个单词',
    category: 'learning',
    rarity: 'common',
    condition: (stats) => stats.dailyWordsLearned >= 10,
    getProgress: (stats) => Math.min(stats.dailyWordsLearned, 10),
    target: 10,
    goldReward: 15,
  },
  {
    id: 'learn-100',
    name: '学霸之路',
    icon: '🏆',
    description: '累计学习100个单词',
    category: 'learning',
    rarity: 'rare',
    condition: (stats) => stats.totalWordsLearned >= 100,
    getProgress: (stats) => Math.min(stats.totalWordsLearned, 100),
    target: 100,
    goldReward: 50,
  },
  {
    id: 'learn-500',
    name: '英语小博士',
    icon: '🎓',
    description: '累计学习500个单词',
    category: 'learning',
    rarity: 'legendary',
    condition: (stats) => stats.totalWordsLearned >= 500,
    getProgress: (stats) => Math.min(stats.totalWordsLearned, 500),
    target: 500,
    goldReward: 100,
  },
  // 复习徽章
  {
    id: 'first-review',
    name: '知错就改',
    icon: '💪',
    description: '首次完成错题复习',
    category: 'review',
    rarity: 'common',
    condition: (stats) => stats.firstMistakeReviewDone,
    goldReward: 15,
  },
  {
    id: 'master-10',
    name: '错题清道夫',
    icon: '🧹',
    description: '掌握10道错题',
    category: 'review',
    rarity: 'rare',
    condition: (stats) => stats.mistakesMastered >= 10,
    getProgress: (stats) => Math.min(stats.mistakesMastered, 10),
    target: 10,
    goldReward: 30,
  },
  {
    id: 'all-mastered',
    name: '完美主义者',
    icon: '💎',
    description: '错题全部掌握',
    category: 'review',
    rarity: 'epic',
    condition: (stats) => stats.totalMistakes === 0 && stats.mistakesMastered > 0,
    goldReward: 50,
  },
  // 时间徽章
  {
    id: 'early-bird',
    name: '早起鸟',
    icon: '🐦',
    description: '早上7点前完成学习',
    category: 'time',
    rarity: 'common',
    condition: (stats) => stats.morningStudy,
    goldReward: 10,
  },
  {
    id: 'night-owl',
    name: '夜猫子',
    icon: '🦉',
    description: '晚上9点后完成学习',
    category: 'time',
    rarity: 'common',
    condition: (stats) => stats.nightStudy,
    goldReward: 10,
  },
  {
    id: 'streak-7',
    name: '坚持7天',
    icon: '🔥',
    description: '连续学习7天',
    category: 'time',
    rarity: 'rare',
    condition: (stats) => stats.streakDays >= 7,
    getProgress: (stats) => Math.min(stats.streakDays, 7),
    target: 7,
    goldReward: 30,
  },
  {
    id: 'streak-30',
    name: '坚持30天',
    icon: '🌟',
    description: '连续学习30天',
    category: 'time',
    rarity: 'legendary',
    condition: (stats) => stats.streakDays >= 30,
    getProgress: (stats) => Math.min(stats.streakDays, 30),
    target: 30,
    goldReward: 100,
  },
];

interface AchievementStore {
  unlockedAchievements: UnlockedAchievement[];
  stats: AchievementStats;
  pendingAchievements: Achievement[];
  showAchievementModal: boolean;
  currentAchievement: Achievement | null;

  unlockAchievement: (achievement: Achievement) => void;
  dismissAchievement: () => void;
  checkAchievements: () => Achievement[];
  getAchievementProgress: (achievementId: string) => { current: number; target: number } | null;
  isAchievementUnlocked: (achievementId: string) => boolean;
  getUnlockedAchievementIds: () => Set<string>;

  // 统计更新方法
  recordWordLearned: (wordId: string) => void;
  recordCorrect: (type: 'recognition' | 'spelling', totalInSession: number, correctInSession: number) => void;
  recordMistakeMastered: () => void;
  recordMistakeReview: () => void;
  checkDailyReset: () => void;
  checkStreakDays: () => void;
  checkTimeBased: () => void;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlockedAchievements: [],
      stats: defaultStats,
      pendingAchievements: [],
      showAchievementModal: false,
      currentAchievement: null,

      unlockAchievement: (achievement) => {
        const { unlockedAchievements } = get();
        if (unlockedAchievements.some(a => a.achievementId === achievement.id)) {
          return;
        }
        set({
          unlockedAchievements: [
            ...unlockedAchievements,
            { achievementId: achievement.id, unlockedAt: new Date().toISOString() }
          ],
          showAchievementModal: true,
          currentAchievement: achievement,
        });
      },

      dismissAchievement: () => {
        const { pendingAchievements } = get();
        if (pendingAchievements.length > 0) {
          const [next, ...rest] = pendingAchievements;
          set({
            currentAchievement: next,
            pendingAchievements: rest,
          });
        } else {
          set({ showAchievementModal: false, currentAchievement: null });
        }
      },


      checkAchievements: () => {
        const { stats, unlockAchievement } = get();
        const newlyUnlocked: Achievement[] = [];
        // 使用动态获取的 unlockedAchievements，避免闭包问题
        const currentlyUnlocked = () => get().unlockedAchievements.map(a => a.achievementId);

        for (const achievement of achievements) {
          const alreadyUnlocked = currentlyUnlocked().includes(achievement.id);
          if (!alreadyUnlocked && achievement.condition(stats)) {
            unlockAchievement(achievement);
            newlyUnlocked.push(achievement);
          }
        }

        return newlyUnlocked;
      },

      getAchievementProgress: (achievementId) => {
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement || !achievement.target || !achievement.getProgress) return null;
        return {
          current: achievement.getProgress!(get().stats),
          target: achievement.target,
        };
      },

      isAchievementUnlocked: (achievementId) => {
        return get().unlockedAchievements.some(a => a.achievementId === achievementId);
      },

      getUnlockedAchievementIds: () => {
        return new Set(get().unlockedAchievements.map(a => a.achievementId));
      },

      recordWordLearned: (wordId) => {
        const { stats } = get();
        const today = new Date().toDateString();
        const isNewDay = stats.lastStudyDate !== today;

        set((state) => {
          // 使用数组而非 Set
          const currentIds = state.stats.learnedWordIds;
          const newLearnedWordIds = currentIds.includes(wordId)
            ? currentIds
            : [...currentIds, wordId];

          return {
            stats: {
              ...state.stats,
              learnedWordIds: newLearnedWordIds,
              totalWordsLearned: newLearnedWordIds.length,
              firstStudyDone: true,
              lastStudyDate: today,
              dailyWordsLearned: isNewDay ? 1 : state.stats.dailyWordsLearned + 1,
              streakDays: isNewDay ? state.stats.streakDays : state.stats.streakDays,
            }
          };
        });

        get().checkStreakDays();
        get().checkTimeBased();
        get().checkAchievements();
      },

      recordCorrect: (type, totalInSession, correctInSession) => {
        const { stats } = get();
        const newStreak = stats.currentStreak + correctInSession;
        const newMaxStreak = Math.max(stats.maxStreak, newStreak);
        const isFullCorrect = correctInSession === totalInSession;

        set((state) => ({
          stats: {
            ...state.stats,
            totalCorrect: state.stats.totalCorrect + correctInSession,
            currentStreak: newStreak,
            maxStreak: newMaxStreak,
            correctInSession: correctInSession,
            correctRecog100: type === 'recognition' && isFullCorrect
              ? true
              : state.stats.correctRecog100,
            correctSpell100: type === 'spelling' && isFullCorrect
              ? true
              : state.stats.correctSpell100,
          }
        }));

        get().checkAchievements();
      },

      recordMistakeMastered: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            mistakesMastered: state.stats.mistakesMastered + 1,
          }
        }));
        get().checkAchievements();
      },

      recordMistakeReview: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            firstMistakeReviewDone: true,
            totalMistakes: state.stats.totalMistakes > 0 ? state.stats.totalMistakes - 1 : 0,
          }
        }));
        get().checkAchievements();
      },

      checkDailyReset: () => {
        const { stats } = get();
        const today = new Date().toDateString();
        if (stats.lastStudyDate !== today) {
          set((state) => ({
            stats: {
              ...state.stats,
              dailyWordsLearned: 0,
              correctInSession: 0,
            }
          }));
        }
      },

      checkStreakDays: () => {
        const { stats } = get();
        const today = new Date();
        const lastStudy = stats.lastStudyDate ? new Date(stats.lastStudyDate) : null;

        if (!lastStudy) return;

        const diffTime = today.getTime() - lastStudy.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          set((state) => ({
            stats: {
              ...state.stats,
              streakDays: state.stats.streakDays + 1,
            }
          }));
        } else if (diffDays > 1) {
          set((state) => ({
            stats: {
              ...state.stats,
              streakDays: 1,
            }
          }));
        }
      },

      checkTimeBased: () => {
        const hour = new Date().getHours();
        set((state) => ({
          stats: {
            ...state.stats,
            morningStudy: hour < 7 || state.stats.morningStudy,
            nightStudy: hour >= 21 || state.stats.nightStudy,
          }
        }));
      },
    }),
    {
      name: 'achievement-storage',
    }
  )
);