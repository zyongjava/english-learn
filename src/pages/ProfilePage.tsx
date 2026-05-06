import { useRef } from 'react';
import { useAchievementStore } from '../stores/achievementStore';
import { useUnitStore } from '../stores/unitStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useMistakeStore } from '../stores/mistakeStore';
import { useSettingsStore } from '../stores/settingsStore';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
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

// 计算总学习天数（有打卡记录的天数）
function calculateTotalStudyDays(records: Record<string, { completedModules: string[] }>): number {
  return Object.keys(records).filter(date => records[date].completedModules.length > 0).length;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { stats, unlockedAchievements } = useAchievementStore();
  const { units } = useUnitStore();
  const { records } = useCheckInStore();
  const { getActiveMistakes } = useMistakeStore();
  const { avatarUrl, setAvatarUrl } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const streakDays = calculateStreakDays(records);
  const totalWords = units.reduce((sum, unit) => sum + unit.words.length, 0);
  const totalStudyDays = calculateTotalStudyDays(records);

  // 计算积分（基于成就解锁数量 + 学习天数）
  const points = unlockedAchievements.length * 50 + totalStudyDays * 10 + stats.totalWordsLearned * 2;

  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 统计卡片数据
  const statCards = [
    { label: '累计单词', value: stats.totalWordsLearned.toLocaleString(), color: 'text-blue-600' },
    { label: '正确总数', value: stats.totalCorrect.toLocaleString(), color: 'text-green-500' },
    { label: '错题数', value: getActiveMistakes().length.toLocaleString(), color: 'text-orange-500' },
    { label: '坚持天数', value: `${streakDays} 天`, color: 'text-purple-600' },
  ];

  // 快捷入口
  const quickEntries = [
    {
      icon: '🏆',
      title: '成就勋章',
      subtitle: `已获得 ${unlockedAchievements.length} 枚`,
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      onClick: () => onNavigate('achievements'),
    },
    {
      icon: '📚',
      title: '单词管理',
      subtitle: `${totalWords} 个单词`,
      color: 'bg-purple-50',
      iconColor: 'text-purple-500',
      onClick: () => onNavigate('manage'), // 跳转到单词管理
    },
  ];

  // 设置菜单
  const settingsMenus = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: '偏好设置',
      onClick: () => onNavigate('settings'),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '账号与安全',
      onClick: () => {},
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '帮助与反馈',
      onClick: () => {
        alert('若您在使用 APP 过程中遇到功能异常、卡顿闪退、内容问题，或有产品建议、优化想法，欢迎随时提交反馈\nzyongjava@163.com。我们会第一时间查看并跟进处理，持续为您带来更好的使用体验！');
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 page-content">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-primary px-4 pt-12 pb-16 rounded-b-3xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h1 className="text-xl font-bold text-white">我的</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="flex items-center gap-4">
          {/* 头像 */}
          <div
            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 cursor-pointer overflow-hidden hover:opacity-80 transition-opacity"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div>
            <h2 className="text-xl font-bold text-white">年年</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm text-white font-medium">{points.toLocaleString()} 积分</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 -mt-8">
        {/* 统计卡片网格 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statCards.map((card, index) => (
            <div key={index} className="card-modern p-4 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {quickEntries.map((entry, index) => (
            <button
              key={index}
              onClick={entry.onClick}
              className="card-modern p-4 text-left card-pressable animate-slide-up"
              style={{ animationDelay: `${(index + 4) * 0.05}s` }}
            >
              <div className={`w-10 h-10 rounded-xl ${entry.color} flex items-center justify-center mb-3`}>
                <span className="text-xl">{entry.icon}</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1">{entry.title}</h4>
              <p className="text-sm text-gray-400">{entry.subtitle}</p>
            </button>
          ))}
        </div>

        {/* 设置菜单 */}
        <div className="card-modern overflow-hidden mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {settingsMenus.map((menu, index) => (
            <button
              key={index}
              onClick={menu.onClick}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                index !== settingsMenus.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                  {menu.icon}
                </div>
                <span className="font-medium text-gray-800">{menu.title}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* 底部标语 */}
        <div className="text-center py-6">
          <p className="text-sm text-blue-600 font-medium">新启航英语 - 专注小学英语听说读写</p>
          <p className="text-xs text-gray-400 mt-1">陪伴孩子快乐成长</p>
        </div>
      </div>

      {/* 底部 Tab 栏 */}
      <div className="tab-bar flex">
        <button
          onClick={() => onNavigate('home')}
          className="tab-item text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">首页</span>
        </button>
        <button
          onClick={() => onNavigate('phonics')}
          className="tab-item text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs font-medium">拼读</span>
        </button>
        <button className="tab-item active">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">我的</span>
        </button>
      </div>
    </div>
  );
}
