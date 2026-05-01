import { usePhonicsStore } from '../stores/phonicsStore';
import { phonicsLetters, getVideoUrl, hasVideo } from '../data/phonics';

interface Props {
  onLetterClick: (letter: string) => void;
  onTabChange: (tab: 'home' | 'phonics' | 'profile') => void;
}

export default function PhonicsPage({ onLetterClick, onTabChange }: Props) {
  const { isLetterLearned, getProgress } = usePhonicsStore();
  const progress = getProgress();
  const progressPercent = Math.round((progress.learned / progress.total) * 100);

  // 环形进度计算
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.learned / progress.total) * circumference;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24">
      {/* 顶部渐变区域 - 新设计风格 */}
      <header
        className="px-4 pt-12 pb-16 text-white rounded-b-[40px] relative z-10"
        style={{ background: 'linear-gradient(135deg, #4F6EF2 0%, #976CF0 100%)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h1 className="text-xl font-bold">自然拼读</h1>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
        <div className="mb-2">
          <p className="text-sm opacity-80">继续加油，同学！</p>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-bold mt-1">学习进度</h2>
            <span className="text-4xl font-bold">{progressPercent}%</span>
          </div>
        </div>
        <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <main className="flex-1 -mt-8 px-5 pb-24 relative z-20">
        {/* 学习进度卡片 - 带环形进度 */}
        <section className="bg-white rounded-xl p-5 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{progress.learned} / {progress.total} 字母</h3>
              <p className="text-sm text-gray-400">Phonics Progress</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* 环形进度 */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-100"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-blue-500"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r="34"
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[14px] font-bold text-gray-800">{progress.learned}/{progress.total}</span>
                <span className="text-[8px] text-gray-400">DONE</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 leading-relaxed">
                继续加油！完成字母的学习，离目标更近一步。
              </p>
            </div>
          </div>
        </section>

        {/* 字母网格 */}
        <section className="grid grid-cols-4 gap-4 mb-6">
          {phonicsLetters.map((item) => {
            const learned = isLetterLearned(item.letter);
            const hasVideoFile = hasVideo(item.letter);

            return (
              <button
                key={item.letter}
                onClick={() => hasVideoFile && onLetterClick(item.letter)}
                disabled={!hasVideoFile}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center
                  font-bold text-2xl transition-all active:scale-95
                  ${learned
                    ? 'text-white shadow-lg'
                    : hasVideoFile
                      ? 'bg-white text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
                style={learned ? { background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' } : undefined}
              >
                <span className="font-bold text-2xl">{item.letter} {item.lowercase}</span>
                <span className={`text-[10px] mt-1 font-medium ${learned ? 'opacity-90' : 'text-gray-400'}`}>
                  {item.pronunciation.split(' for ')[1]}
                </span>
              </button>
            );
          })}
        </section>

        {/* 推广卡片 */}
        <section className="bg-[#2D333F] rounded-xl p-6 relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col gap-2">
            <h4 className="text-white font-bold text-lg">学习新航向</h4>
            <p className="text-white/70 text-sm flex items-center gap-2">
              点击字母开启精彩视频，跟着外教老师大声读！
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
          </div>
        </section>
      </main>

      {/* 底部 Tab 栏 */}
      <nav
        className="fixed bottom-0 w-full z-50 h-[80px] bg-white border-t border-gray-50 flex justify-around items-center px-6 pb-6"
        style={{ boxShadow: '0 -10px 30px rgba(0,0,0,0.03)' }}
      >
        <button
          onClick={() => onTabChange('home')}
          className="flex flex-col items-center justify-center text-gray-400 text-[12px] font-medium active:scale-95 transition-all"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>首页</span>
        </button>
        <button
          className="flex flex-col items-center justify-center text-[#4F6EF2] text-[12px] font-bold active:scale-95 transition-all"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>拼读</span>
        </button>
        <button
          onClick={() => onTabChange('profile')}
          className="flex flex-col items-center justify-center text-gray-400 text-[12px] font-medium active:scale-95 transition-all"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>我的</span>
        </button>
      </nav>
    </div>
  );
}

export { getVideoUrl, hasVideo };