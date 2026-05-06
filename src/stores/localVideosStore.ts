import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DB_NAME = 'local-videos-db';
const STORE_NAME = 'videos';

export interface LocalVideo {
  id: string;
  name: string;
  path: string;
  size: number;
  addedAt: number;
}

// IndexedDB 操作
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getAllVideos = async (): Promise<LocalVideo[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch {
    return [];
  }
};

export const saveVideo = async (video: LocalVideo): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(video);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const deleteVideoFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getVideoData = async (id: string): Promise<LocalVideo | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

interface LocalVideosStore {
  videos: LocalVideo[];
  loadVideos: () => Promise<void>;
  addVideo: (name: string, path: string, size: number) => void;
  removeVideo: (id: string) => void;
  clearVideos: () => void;
}

// 临时存储，用于页面刷新后恢复 blob URL
const tempBlobUrls: Record<string, string> = {};

export const useLocalVideosStore = create<LocalVideosStore>()(
  persist(
    (set, get) => ({
      videos: [],

      loadVideos: async () => {
        const videos = await getAllVideos();
        set((state) => {
          // 如果已经有数据，避免重复覆盖
          if (state.videos.length > 0 && state.videos.length === videos.length) {
            return state;
          }
          return { videos };
        });
      },

      addVideo: (name, path, size) => {
        const video: LocalVideo = {
          id: Date.now().toString(),
          name,
          path,
          size,
          addedAt: Date.now(),
        };

        // 保存到 IndexedDB
        saveVideo(video).catch(console.error);

        // 保存 blob URL 用于临时访问
        if (path.startsWith('blob:')) {
          tempBlobUrls[video.id] = path;
        }

        set((state) => ({
          videos: [...state.videos, video],
        }));
      },

      removeVideo: async (id) => {
        await deleteVideoFromDB(id).catch(console.error);
        delete tempBlobUrls[id];
        set((state) => ({
          videos: state.videos.filter((v) => v.id !== id),
        }));
      },

      clearVideos: async () => {
        const { videos } = get();
        for (const video of videos) {
          await deleteVideoFromDB(video.id).catch(console.error);
        }
        Object.keys(tempBlobUrls).forEach(key => delete tempBlobUrls[key]);
        set({ videos: [] });
      },
    }),
    {
      name: 'local-videos-metadata',
      partialize: (state) => ({ videos: state.videos }),
    }
  )
);

// 导出获取视频 URL 的函数
export const getVideoUrl = async (video: LocalVideo): Promise<string> => {
  // 1. 如果有临时 blob URL，直接返回
  if (tempBlobUrls[video.id]) {
    return tempBlobUrls[video.id];
  }

  // 2. 从 IndexedDB 获取视频数据并创建 blob URL
  try {
    const fullVideo = await getVideoData(video.id);
    if (fullVideo && fullVideo.path) {
      // 如果 path 是 data URL (base64)，创建 blob URL
      if (fullVideo.path.startsWith('data:')) {
        const response = await fetch(fullVideo.path);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        tempBlobUrls[video.id] = blobUrl;
        return blobUrl;
      }
      return fullVideo.path;
    }
  } catch (error) {
    console.error('获取视频失败:', error);
  }

  return '';
};

// 存储视频数据（base64）
export const saveVideoData = async (video: LocalVideo, base64Data: string): Promise<void> => {
  const videoWithData = { ...video, path: base64Data };
  // 保存到 IndexedDB
  await saveVideo(videoWithData);
  // 直接更新 zustand store（不重新生成 id，不重复保存）
  useLocalVideosStore.setState((state) => ({
    videos: [...state.videos.filter(v => v.id !== video.id), videoWithData]
  }));
};