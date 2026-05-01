import { useEffect, useState } from 'react';
import { useAchievementStore } from '../stores/achievementStore';
import type { AchievementRarity } from '../types';

const rarityGlow: Record<AchievementRarity, string> = {
  common: 'shadow-lg shadow-gray-300',
  rare: 'shadow-lg shadow-blue-400',
  epic: 'shadow-lg shadow-purple-400',
  legendary: 'shadow-2xl shadow-yellow-400 animate-pulse',
};

export default function AchievementModal() {
  const { showAchievementModal, currentAchievement, dismissAchievement } = useAchievementStore();
  const [showContent, setShowContent] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (showAchievementModal && currentAchievement) {
      setShowContent(false);
      setShowIcon(false);
      setShowText(false);

      const timer1 = setTimeout(() => setShowContent(true), 100);
      const timer2 = setTimeout(() => setShowIcon(true), 300);
      const timer3 = setTimeout(() => setShowText(true), 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [showAchievementModal, currentAchievement]);

  if (!showAchievementModal || !currentAchievement) return null;

  const glowClass = rarityGlow[currentAchievement.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`bg-white rounded-3xl p-6 mx-4 max-w-sm w-full transform transition-all duration-500 ${
          showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {/* 标题 */}
        <div className="text-center">
          <div className="text-5xl mb-2 animate-bounce">
            🎉
          </div>
          <h2 className="text-lg font-bold text-purple-600">
            成就解锁
          </h2>
        </div>

        {/* 徽章 */}
        <div
          className={`flex justify-center my-6 transform transition-all duration-500 ${
            showIcon ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <div
            className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center ${glowClass} transition-transform hover:scale-105`}
          >
            <span className="text-6xl">{currentAchievement.icon}</span>
          </div>
        </div>

        {/* 徽章信息 */}
        <div
          className={`text-center transition-all duration-500 ${
            showText ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-800">
            {currentAchievement.name}
          </h3>
          <p className="text-gray-500 mt-2">
            {currentAchievement.description}
          </p>

          {/* 稀有度标签 */}
          <div className="mt-4">
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                currentAchievement.rarity === 'common' ? 'bg-gray-200 text-gray-600' :
                currentAchievement.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                currentAchievement.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                'bg-yellow-100 text-yellow-600'
              }`}
            >
              {currentAchievement.rarity === 'common' ? '普通' :
               currentAchievement.rarity === 'rare' ? '稀有' :
               currentAchievement.rarity === 'epic' ? '史诗' : '传奇'}
            </span>
          </div>

          {/* 金币奖励 */}
          <div className="mt-4 flex items-center justify-center gap-2 bg-yellow-50 rounded-2xl py-3 px-4">
            <span className="text-2xl">🪙</span>
            <span className="text-xl font-bold text-yellow-600">+{currentAchievement.goldReward}</span>
            <span className="text-yellow-600">金币</span>
          </div>

          {/* 确认按钮 */}
          <button
            onClick={dismissAchievement}
            className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            太棒了！
          </button>
        </div>
      </div>
    </div>
  );
}