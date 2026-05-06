import { useState, useRef, useEffect } from 'react';

interface Props {
  videoPath: string;
  videoName?: string;
  onBack: () => void;
}

export default function VideoPlayerPage({ videoPath, videoName, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');

  const displayName = videoName || videoPath.split('/').pop()?.replace('.mp4', '') || '视频';

  // 默认自动播放
  useEffect(() => {
    const tryPlay = () => {
      if (videoRef.current && isLoaded) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // 自动播放失败，可能需要用户交互
        });
      }
    };

    if (isLoaded) {
      tryPlay();
    }
  }, [isLoaded]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progressPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progressPercent);
      setCurrentTime(formatTime(videoRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(formatTime(videoRef.current.duration));
      setIsLoaded(true);
      // 元数据加载完成后自动播放
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // 自动播放失败
      });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const replay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-black page-content flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-black/80 px-4 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">{displayName}</h1>
      </div>

      {/* 视频区域 */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        <video
          ref={videoRef}
          src={videoPath}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* 播放按钮覆盖 */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* 底部控制栏 */}
      <div className="bg-black/80 px-4 py-4">
        {/* 进度条 */}
        <div
          className="h-1 bg-gray-600 rounded-full cursor-pointer mb-3"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white text-sm mb-3">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-8">
          <button onClick={replay} className="text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            {isPlaying ? (
              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}