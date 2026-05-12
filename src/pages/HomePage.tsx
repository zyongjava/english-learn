import { useState } from 'react';
import { useMistakeStore } from '../stores/mistakeStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useCheckInStore } from '../stores/checkInStore';
import ManagePage from './ManagePage';
import LearningPage from './LearningPage';
import MistakesPage from './MistakesPage';
import SettingsPage from './SettingsPage';
import AchievementsPage from './AchievementsPage';
import CheckInPage from './CheckInPage';
import ProfilePage from './ProfilePage';
import PhonicsPage from './PhonicsPage';
import PhonicsLetterPage from './PhonicsLetterPage';
import VideoListPage from './VideoListPage';
import VideoPlayerPage from './VideoPlayerPage';
import GiftExchangePage from './GiftExchangePage';

type Page = 'home' | 'manage' | 'learning' | 'mistakes' | 'settings' | 'achievements' | 'checkin' | 'phonics' | 'phonics-letter' | 'video-list' | 'video-player' | 'gift';

// 计算学习进度百分比
function calculateProgress(dailyGoal: number, completed: number): number {
  if (dailyGoal === 0) return 0;
  return Math.min(Math.round((completed / dailyGoal) * 100), 100);
}

// 计算连续打卡天数
function calculateStreakDays(records: Record<string, { completedModules: string[] }>): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    if (records[dateStr] && records[dateStr].completedModules.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'phonics'>('home');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoName, setSelectedVideoName] = useState<string>('');
  const { mistakes } = useMistakeStore();
  const { stats } = useAchievementStore();
  const { dailyGoal, nickname } = useSettingsStore();
  const { records } = useCheckInStore();

  const activeMistakes = mistakes.filter((m) => !m.mastered);

  // 今日学习进度（简化：使用今日已学单词数）
  const todayProgress = stats.dailyWordsLearned;
  const progressPercent = calculateProgress(dailyGoal, todayProgress);
  const streakDays = calculateStreakDays(records);

  // 子页面渲染
  if (currentPage === 'manage') return <ManagePage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'learning') return <LearningPage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'mistakes') return <MistakesPage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'settings') return <SettingsPage onBack={() => { setCurrentPage('home'); setShowProfile(true); }} />;
  if (currentPage === 'achievements') return <AchievementsPage onBack={() => { setCurrentPage('home'); setShowProfile(true); }} />;
  if (currentPage === 'checkin') return <CheckInPage onBack={() => setCurrentPage('home')} />;
  if (currentPage === 'phonics-letter' && selectedLetter) {
    return (
      <PhonicsLetterPage
        letter={selectedLetter}
        onBack={() => {
          setSelectedLetter(null);
          setCurrentPage('phonics');
        }}
        onTabChange={(tab) => {
          setActiveTab(tab === 'phonics' ? 'phonics' : 'home');
          if (tab === 'profile') {
            setShowProfile(true);
            setCurrentPage('home');
          } else if (tab === 'home') {
            setShowProfile(false);
            setCurrentPage('home');
          }
        }}
      />
    );
  }
  if (currentPage === 'phonics') {
    return (
      <PhonicsPage
        onLetterClick={(letter) => {
          setSelectedLetter(letter);
          setCurrentPage('phonics-letter');
        }}
        onTabChange={(tab) => {
          setActiveTab(tab === 'phonics' ? 'phonics' : 'home');
          if (tab === 'profile') {
            setShowProfile(true);
            setCurrentPage('home');
          } else if (tab === 'home') {
            setShowProfile(false);
            setCurrentPage('home');
          }
        }}
      />
    );
  }
  if (currentPage === 'video-list') {
    return (
      <VideoListPage
        onBack={() => setCurrentPage('home')}
        onVideoSelect={(videoPath, videoName) => {
          setSelectedVideo(videoPath);
          setSelectedVideoName(videoName || '');
          setCurrentPage('video-player');
        }}
      />
    );
  }
  if (currentPage === 'video-player' && selectedVideo) {
    return (
      <VideoPlayerPage
        videoPath={selectedVideo}
        videoName={selectedVideoName}
        onBack={() => setCurrentPage('video-list')}
      />
    );
  }
  if (currentPage === 'gift') {
    return <GiftExchangePage onBack={() => { setCurrentPage('home'); setShowProfile(true); }} />;
  }

  // 我的页面
  if (showProfile) {
    return (
      <ProfilePage
        onNavigate={(page) => {
          if (page === 'home') {
            setShowProfile(false);
          } else {
            setCurrentPage(page as Page);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-content">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-primary px-4 pt-12 pb-8 rounded-b-3xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h1 className="text-xl font-bold text-white">新启航英语</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* 学习进度 */}
        <div className="mb-4">
          <p className="text-white/70 text-sm mb-1">{nickname ? `${nickname}，加油！` : '继续加油，同学！'}</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">学习进度</h2>
            <span className="text-3xl font-bold text-white">{progressPercent}%</span>
          </div>
          {/* 进度条 */}
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 -mt-4">
        {/* 今日学习卡片 */}
        <div className="card-modern p-4 mb-4 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">今日学习</h3>
              <p className="text-sm text-gray-400">Daily Goal</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4">
            {/* 环形进度 */}
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 progress-ring">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPercent / 100)}`}
                  className="progress-ring-circle"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-800">{todayProgress}/{dailyGoal}</span>
                <span className="text-xs text-gray-400">DONE</span>
              </div>
            </div>

            {/* 学习统计 */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">单词记忆</span>
                <span className="text-sm font-semibold text-gray-800">{stats.dailyWordsLearned}/{dailyGoal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">听力训练</span>
                <span className="text-sm font-semibold text-gray-800">{Math.floor(stats.totalWordsLearned / 10)}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* 开始学习按钮 */}
        <button
          onClick={() => setCurrentPage('learning')}
          className="btn-gradient w-full flex items-center justify-center gap-2 mb-4 card-pressable"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          开始学习
        </button>

        {/* 功能入口卡片 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 错题集 */}
          <button
            onClick={() => setCurrentPage('mistakes')}
            className="card-modern p-4 text-left card-pressable"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-1">错题集</h4>
            <p className="text-sm text-gray-400">{activeMistakes.length} 待复习</p>
          </button>

          {/* 打卡入口 */}
          <button
            onClick={() => setCurrentPage('checkin')}
            className="card-modern p-4 text-left card-pressable"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-1">打卡记录</h4>
            <p className="text-sm text-gray-400">已连续 {streakDays} 天</p>
          </button>
        </div>

        {/* 课堂教学视频卡片 */}
        <button
          onClick={() => setCurrentPage('video-list')}
          className="card-modern p-6 mb-4 relative overflow-hidden text-left w-full card-pressable"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-90" />
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mb-10" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <h4 className="font-bold text-white mb-2">课堂教学视频</h4>
            <p className="text-white/70 text-sm">英语课堂・持续学习不停歇</p>
          </div>
        </button>
      </div>

      {/* 底部 Tab 栏 */}
      <div className="tab-bar flex">
        <button
          onClick={() => {
            setShowProfile(false);
            setCurrentPage('home');
            setActiveTab('home');
          }}
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">首页</span>
        </button>
        <button
          onClick={() => {
            setShowProfile(false);
            setCurrentPage('phonics');
            setActiveTab('phonics');
          }}
          className={`tab-item ${activeTab === 'phonics' ? 'active' : ''}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs font-medium">拼读</span>
        </button>
        <button
          onClick={() => setShowProfile(true)}
          className={`tab-item ${showProfile ? 'active' : ''}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">我的</span>
        </button>
      </div>
    </div>
  );
}
