import { useRef, useEffect, useState } from 'react';
import { useLocalVideosStore, saveVideoData, getVideoUrl } from '../stores/localVideosStore';
import type { LocalVideo } from '../stores/localVideosStore';

interface BundledVideo {
  name: string;
  path: string;
}

const bundledVideos: BundledVideo[] = [
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
  onVideoSelect: (videoPath: string, videoName: string) => void;
}

export default function VideoListPage({ onBack, onVideoSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<LocalVideo | null>(null);
  const [editName, setEditName] = useState('');
  const { videos: localVideos, removeVideo, loadVideos, updateVideoName } = useLocalVideosStore();

  // 页面加载时从 IndexedDB 加载视频
  useEffect(() => {
    loadVideos();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Data = reader.result as string;

        // 保存到 IndexedDB
        await saveVideoData({
          id: Date.now().toString(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          path: base64Data,
          size: file.size,
          addedAt: Date.now(),
        }, base64Data);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('保存视频失败:', error);
      alert('保存视频失败，请重试');
    } finally {
      setLoading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLocalVideoClick = async (video: LocalVideo) => {
    const url = await getVideoUrl(video);
    if (url) {
      onVideoSelect(url, video.name);
    } else {
      alert('视频文件不存在，请重新上传');
    }
  };

  const handleBundledVideoClick = (video: BundledVideo) => {
    onVideoSelect(video.path, video.name);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleEditName = (video: LocalVideo) => {
    setEditingVideo(video);
    setEditName(video.name);
  };

  const handleSaveName = () => {
    if (editingVideo && editName.trim()) {
      updateVideoName(editingVideo.id, editName.trim());
      setEditingVideo(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setEditName('');
  };

  return (
    <div className="min-h-screen bg-gray-50 page-content">
      <div className="bg-gradient-primary px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white flex-1 text-center pr-10">课堂教学视频</h1>
          <label className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* 内置视频 */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">内置视频</h3>
          <div className="grid grid-cols-2 gap-3">
            {bundledVideos.map((video) => (
              <button
                key={video.path}
                onClick={() => handleBundledVideoClick(video)}
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

        {/* 本地上传区域 */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">本地上传</h3>
          {localVideos.length === 0 ? (
            <div className="card-modern p-6 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400 text-sm">点击右上角 + 按钮上传本地视频</p>
            </div>
          ) : (
            <div className="space-y-2">
              {localVideos.map((video) => (
                <div key={video.id} className="card-modern p-3 flex items-center justify-between">
                  <button
                    onClick={() => handleLocalVideoClick(video)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{video.name}</h4>
                      <p className="text-xs text-gray-400">{formatSize(video.size)}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditName(video)}
                      className="p-2 text-gray-400 hover:text-blue-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeVideo(video.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 编辑名称弹窗 */}
          {editingVideo && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">修改视频名称</h3>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="请输入视频名称"
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveName}
                    disabled={!editName.trim()}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}