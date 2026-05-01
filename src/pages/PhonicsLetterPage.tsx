import { useState, useRef, useEffect } from 'react';
import { phonicsLetters, getVideoUrl, hasVideo } from '../data/phonics';
import { usePhonicsStore } from '../stores/phonicsStore';

interface Props {
  letter: string;
  onBack: () => void;
  onTabChange: (tab: 'home' | 'phonics' | 'profile') => void;
}

export default function PhonicsLetterPage({ letter, onBack, onTabChange }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isLetterLearned, markAsLearned } = usePhonicsStore();

  const letterData = phonicsLetters.find(l => l.letter === letter);
  const videoUrl = getVideoUrl(letter);
  const hasVideoFile = hasVideo(letter);
  const isLearned = isLetterLearned(letter);

  useEffect(() => {
    // 自动播放
    if (videoRef.current && hasVideoFile) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [letter, hasVideoFile]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    setShowCompletion(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowCompletion(true);
  };

  const handleMarkAsLearned = () => {
    markAsLearned(letter);
    setShowCompletion(false);
    onBack();
  };

  if (!letterData) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <p className="text-gray-500">字母不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* 固定顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-sm flex items-center justify-between px-4 h-14">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-lg text-white">Letter {letter}</h1>
        <div className="w-10" />
      </header>

      <main className="pt-14 max-w-md mx-auto">
        {/* 视频播放器区域 */}
        <section className="bg-black mx-4 mt-4 rounded-2xl overflow-hidden">
          {hasVideoFile ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-video"
              playsInline
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnded}
            />
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center text-white/50">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <p>视频正在制作中...</p>
            </div>
          )}
        </section>

        {/* 控制按钮 */}
        <section className="flex items-center justify-center gap-6 px-4 py-4">
          {hasVideoFile ? (
            <>
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleReplay}
                className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 text-gray-600 flex items-center justify-center active:scale-95 transition-transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400 text-sm">视频即将上线，敬请期待</div>
          )}
        </section>

        {/* 字母信息卡片 */}
        <section className="px-4 pb-6">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-gray-800 mb-1">{letter}</div>
              <div className="text-4xl text-gray-400">{letterData.lowercase}</div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="text-base text-blue-500">
                  <span className="text-gray-400">字母音</span> {letterData.letterPhonetic}
                </div>
                <div className="text-gray-300">|</div>
                <div className="text-base text-emerald-500">
                  <span className="text-gray-400">拼读音</span> {letterData.phonicsPhonetic}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📖</span>
                拼读技巧
              </h3>
              <div className="space-y-2 mb-3">
                <p className="text-gray-600">
                  <span className="font-semibold text-blue-500">字母音</span>：{letter} 的名称是 <span className="text-blue-500 font-semibold">{letterData.letterPhonetic}</span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold text-emerald-500">拼读音</span>：{letter} 在单词中的发音是 <span className="text-emerald-500 font-semibold">{letterData.phonicsPhonetic}</span>
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                就像 <span className="font-semibold">{letterData.pronunciation.split(' for ')[1]}</span> 中的 <span className="font-semibold">{letter}</span> 一样
              </p>
              <p className="text-gray-500 text-sm mt-3">
                试试跟读: "{letter}" - "{letterData.pronunciation}"
              </p>
            </div>

            {isLearned && (
              <div className="mt-4 bg-emerald-50 rounded-xl p-3 flex items-center gap-2 text-emerald-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">已学习 ✓</span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 底部 Tab 栏 */}
      <div className="tab-bar flex">
        <button
          onClick={() => onTabChange('home')}
          className="tab-item text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">首页</span>
        </button>
        <button className="tab-item active">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs font-medium">拼读</span>
        </button>
        <button
          onClick={() => onTabChange('profile')}
          className="tab-item text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">我的</span>
        </button>
      </div>

      {/* 学习完成弹窗 */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">太棒了！</h2>
            <p className="text-gray-500 mb-6">你学会了字母 {letter}</p>

            <button
              onClick={handleMarkAsLearned}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-semibold active:scale-95 transition-transform mb-3"
            >
              ✓ 标记为已学习
            </button>
            <button
              onClick={handleReplay}
              className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold active:scale-95 transition-transform"
            >
              再学一次
            </button>
          </div>
        </div>
      )}
    </div>
  );
}