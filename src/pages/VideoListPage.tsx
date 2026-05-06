interface Video {
  name: string;
  path: string;
}

const videos: Video[] = [
  { name: 'Unit 1 Feelings', path: '/class-video/Unit 1 Feelings.mp4' },
  { name: 'Unit 2 Family', path: '/class-video/Unit 2 Family.mp4' },
  { name: 'Unit 3 Pets', path: '/class-video/Unit 3 Pets.mp4' },
  { name: 'Unit 4 At the farm', path: '/class-video/Unit 4 At the farm.mp4' },
  { name: 'Unit 5 My room', path: '/class-video/Unit 5 My room.mp4' },
  { name: 'a&b', path: '/class-video/a&b.mp4' },
  { name: 'a-l', path: '/class-video/a-l.mp4' },
  { name: 'e&f', path: '/class-video/e&f.mp4' },
  { name: 'g&h', path: '/class-video/g&h.mp4' },
  { name: 'i&j', path: '/class-video/i&j.mp4' },
  { name: 'k&l', path: '/class-video/k&l.mp4' },
];

interface Props {
  onBack: () => void;
  onVideoSelect: (videoPath: string) => void;
}

export default function VideoListPage({ onBack, onVideoSelect }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 page-content">
      <div className="bg-gradient-primary px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">课堂教学视频</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {videos.map((video) => (
            <button
              key={video.path}
              onClick={() => onVideoSelect(video.path)}
              className="card-modern p-4 text-left card-pressable"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 text-sm">{video.name}</h4>
              <p className="text-xs text-gray-400 mt-1">点击播放</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}