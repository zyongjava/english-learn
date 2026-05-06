import { useState } from 'react';
import { achievements, useAchievementStore } from '../stores/achievementStore';
import type { AchievementRarity } from '../types';

const categoryNames: Record<string, string> = {
  beginner: '新手',
  streak: '连胜',
  learning: '学习',
  review: '复习',
  time: '坚持',
};

const categoryIcons: Record<string, string> = {
  beginner: '🐣',
  streak: '🔥',
  learning: '📚',
  review: '💪',
  time: '⏰',
};

const rarityStyles: Record<AchievementRarity, { bg: string; badge: string; gradient: string }> = {
  common: { bg: 'from-blue-400 to-blue-600', badge: 'bg-blue-50 text-blue-600', gradient: 'from-yellow-400 to-orange-500' },
  rare: { bg: 'from-purple-500 to-indigo-600', badge: 'bg-purple-50 text-purple-600', gradient: 'from-purple-500 to-indigo-600' },
  epic: { bg: 'from-yellow-500 to-orange-600', badge: 'bg-yellow-50 text-yellow-600', gradient: 'from-yellow-500 to-orange-600' },
  legendary: { bg: 'from-amber-400 to-yellow-600', badge: 'bg-amber-50 text-amber-600', gradient: 'from-amber-400 to-yellow-600' },
};

const rarityLabels: Record<AchievementRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传奇',
};

interface Props {
  onBack: () => void;
}

export default function AchievementsPage({ onBack }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isAchievementUnlocked, getAchievementProgress, unlockedAchievements } = useAchievementStore();

  const categories = ['beginner', 'streak', 'learning', 'review', 'time'];
  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* 固定顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 h-14">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-transform active:scale-95"
        >
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-lg text-[#191b23]">成就勋章</h1>
        <div className="w-10" />
      </header>

      <main className="pt-14">
        {/* 渐变头部区域 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] px-4 py-8 text-white rounded-b-[32px] shadow-lg">
          <div className="relative z-10">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-[48px] font-bold leading-none">{unlockedCount}/{totalCount}</span>
              <span className="text-sm opacity-90 mb-2">已解锁成就</span>
            </div>
            {/* 进度条 */}
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs opacity-80">再解锁 {totalCount - unlockedCount} 个成就即可获得更多奖励</p>
          </div>
          {/* 装饰元素 */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-4 bottom-0 w-24 h-24 bg-[#8B5CF6]/30 rounded-full blur-xl" />
        </section>

        {/* 分类筛选 */}
        <div className="mt-6 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-none px-5 py-2.5 rounded-full font-semibold shadow-md transition-all active:scale-95 ${
              selectedCategory === null
                ? 'bg-blue-500 text-white shadow-blue-500/20'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🌟 全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-none px-5 py-2.5 rounded-full font-semibold transition-all active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white shadow-blue-500/20'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {categoryIcons[cat]} {categoryNames[cat]}
            </button>
          ))}
        </div>

        {/* 成就列表 */}
        <div className="mt-6 px-4 space-y-4 pb-6">
          {filteredAchievements.map((achievement) => {
            const unlocked = isAchievementUnlocked(achievement.id);
            const progress = getAchievementProgress(achievement.id);
            const style = rarityStyles[achievement.rarity];

            return (
              <div
                key={achievement.id}
                className={`bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center gap-4 transition-all hover:shadow-md ${
                  !unlocked ? 'opacity-70 grayscale-[0.3]' : ''
                }`}
              >
                {/* 徽章图标 */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shrink-0 shadow-inner`}>
                  {unlocked ? (
                    <span className="text-white text-2xl">{achievement.icon}</span>
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>

                {/* 徽章信息 */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${unlocked ? 'text-[#1F2937]' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${style.badge}`}>
                      {rarityLabels[achievement.rarity]}
                    </span>
                  </div>
                  <p className={`text-sm mb-1 ${unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>

                  {/* 进度条 */}
                  {progress && !unlocked && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>进度</span>
                        <span>{progress.current}/{progress.target}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.current / progress.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 已解锁/未解锁状态 */}
                  {unlocked ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>已解锁 · +{achievement.goldReward}金币</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>未解锁</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}