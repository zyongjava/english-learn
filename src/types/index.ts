export interface Unit {
  id: string;
  name: string;
  words: Word[];
  createdAt: number;
}

export interface Word {
  id: string;
  unitId: string;
  word: string;
  phonetic: string;
  meaning: string;
  imageUrl?: string;
}

export interface Mistake {
  id: string;
  wordId: string;
  unitId: string;
  type: 'recognition' | 'spelling';
  word: string;
  meaning: string;
  wrongAnswer: string;
  correctAnswer: string;
  options?: string[];
  times: number;
  lastReviewAt: number;
  nextReviewAt: number;
  mastered: boolean;
}

export interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
  type: 'recognition' | 'spelling';
  scrambledLetters?: string[];
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  mistakes: Mistake[];
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'beginner' | 'streak' | 'learning' | 'review' | 'time';
  rarity: AchievementRarity;
  condition: (stats: AchievementStats) => boolean;
  getProgress?: (stats: AchievementStats) => number;
  target?: number;
  goldReward: number;
}

export interface AchievementStats {
  totalWordsLearned: number;
  totalCorrect: number;
  currentStreak: number;
  maxStreak: number;
  mistakesMastered: number;
  totalMistakes: number;
  streakDays: number;
  lastStudyDate: string;
  correctInSession: number;
  dailyWordsLearned: number;
  learnedWordIds: string[];  // 使用数组存储，支持 JSON 序列化
  correctRecog100: boolean;
  correctSpell100: boolean;
  firstStudyDone: boolean;
  firstMistakeReviewDone: boolean;
  morningStudy: boolean;
  nightStudy: boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

export interface CheckInRecord {
  date: string; // YYYY-MM-DD 格式
  completedModules: ('learning' | 'recognition' | 'spelling')[];
  timestamp: number;
}

export interface CheckInState {
  records: Record<string, CheckInRecord>; // key 为日期字符串 YYYY-MM-DD
  currentMonth: number;
  currentYear: number;
}