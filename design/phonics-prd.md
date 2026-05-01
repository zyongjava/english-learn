# 自然拼读模块 - 产品需求文档 & 架构设计

## 1. 模块概述

### 1.1 模块名称
**自然拼读 (Phonics)**

### 1.2 定位
帮助小学生（6-9岁）通过观看26个英文字母的 MP4 视频，学习字母名称、字母发音和拼读规则。

### 1.3 核心功能
- 26个字母选择网格
- MP4视频播放器
- 学习进度追踪
- 发音示例和跟读练习

### 1.4 目标用户
- 小学生1-3年级（6-9岁）
- 英语启蒙学习者

---

## 2. 功能架构

### 2.1 功能模块图

```
┌─────────────────────────────────────────────────────────────┐
│                     自然拼读模块                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  字母选择   │ →  │  视频播放   │ →  │  学习完成   │     │
│  │  26字母网格 │    │  MP4播放    │    │  标记已学   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         ↑                  ↑                                │
│         └──────────────────┘                                │
│                    重播                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   学习进度追踪                       │   │
│  │         已学习字母数 / 总字母数 (8/26)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 用户流程

```
[底部Tab] → [字母选择页] → [点击字母A] → [视频播放页] → [学习完成] → [返回字母表]
                  ↓                                                        ↑
                  └────────────────────────────────────────────────────────┘
                                        重播
```

---

## 3. 语音来源方案

### 3.1 视频资源

**文件要求**
- 格式：MP4 (H.264)
- 命名：A.mp4, B.mp4, ..., Z.mp4
- 内容：每个视频包含
  - 字母大写和小写展示
  - 字母名称发音 (/eɪ/)
  - 拼读发音
  - 示例单词发音
  - 书写演示

**视频命名规范**
```
/public/phonics/
├── A.mp4    # 字母 A 的自然拼读教学视频
├── B.mp4    # 字母 B 的自然拼读教学视频
├── C.mp4
├── ...
└── Z.mp4
```

### 3.2 备选方案

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| MP4本地视频 | 无网络依赖，发音标准 | 需要准备视频资源 | ⭐⭐⭐⭐⭐ |
| 在线视频URL | 无需本地存储 | 需要网络，URL可能失效 | ⭐⭐⭐ |
| Web Speech API | 无需资源 | 只能读字母，无法自然拼读 | ⭐ |

**推荐方案**：本地 MP4 视频资源

### 3.3 视频内容标准

每个字母视频应包含：
1. 字母大写 "A" 动画展示
2. 字母小写 "a" 动画展示
3. 字母名称音标 `/eɪ/`
4. 字母在单词中的发音（如 apple 的 /æ/）
5. 3-5 个例词展示
6. 书写顺序动画

---

## 4. 数据结构设计

### 4.1 字母数据

```typescript
// src/types/phonics.ts

interface LetterData {
  letter: string;        // "A"
  lowercase: string;      // "a"
  name: string;          // "ei"
  phonetic: string;      // "/eɪ/"
  pronunciation: string; // "A as in Apple"
  videoUrl: string;      // "/phonics/A.mp4"
}

interface PhonicsProgress {
  learnedLetters: string[];  // ["A", "B", "C", ...]
  lastLearnedAt: number;     // timestamp
}
```

### 4.2 静态数据

```typescript
// src/data/phonics.ts

export const phonicsLetters: LetterData[] = [
  {
    letter: 'A',
    lowercase: 'a',
    name: 'A',
    phonetic: '/eɪ/',
    pronunciation: 'A for Apple',
    videoUrl: '/phonics/A.mp4'
  },
  // B-Z ...
];
```

### 4.3 状态管理

```typescript
// src/stores/phonicsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PhonicsStore {
  learnedLetters: string[];
  markAsLearned: (letter: string) => void;
  isLetterLearned: (letter: string) => boolean;
  getProgress: () => { learned: number; total: number };
}

export const usePhonicsStore = create<PhonicsStore>()(
  persist(
    (set, get) => ({
      learnedLetters: [],

      markAsLearned: (letter) =>
        set((state) => ({
          learnedLetters: state.learnedLetters.includes(letter)
            ? state.learnedLetters
            : [...state.learnedLetters, letter],
        })),

      isLetterLearned: (letter) =>
        get().learnedLetters.includes(letter),

      getProgress: () => ({
        learned: get().learnedLetters.length,
        total: 26,
      }),
    }),
    { name: 'phonics-progress' }
  )
);
```

---

## 5. 页面设计

### 5.1 页面列表

| 页面 | 路由 | 功能 |
|------|------|------|
| PhonicsPage | /phonics | 字母选择网格 |
| PhonicsLetterPage | /phonics/:letter | 单个字母视频播放 |

### 5.2 底部导航配置

```typescript
// src/App.tsx 或路由配置

const tabs = [
  { key: 'phonics', label: '拼读', icon: '📖', path: '/phonics' },
  { key: 'learning', label: '学习', icon: '📚', path: '/learning' },
  { key: 'home', label: '首页', icon: '🏠', path: '/' },
  { key: 'profile', label: '我的', icon: '👤', path: '/profile' },
];
```

---

## 6. 技术实现要点

### 6.1 视频播放组件

```tsx
// src/components/PhonicsVideoPlayer.tsx

import { useRef, useState } from 'react';

interface Props {
  videoUrl: string;
  letter: string;
  onEnded?: () => void;
}

export function PhonicsVideoPlayer({ videoUrl, letter, onEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        src={videoUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
        playsInline
        className="w-full rounded-xl"
      />
      {/* 控制按钮 */}
      <div className="controls">
        <button onClick={handlePlayPause}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>
    </div>
  );
}
```

### 6.2 字母网格组件

```tsx
// src/components/LetterGrid.tsx

import { phonicsLetters } from '../data/phonics';
import { usePhonicsStore } from '../stores/phonicsStore';

interface Props {
  onLetterClick: (letter: string) => void;
}

export function LetterGrid({ onLetterClick }: Props) {
  const { isLetterLearned } = usePhonicsStore();

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {phonicsLetters.map((item) => (
        <button
          key={item.letter}
          onClick={() => onLetterClick(item.letter)}
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center
            font-bold text-2xl transition-all active:scale-95
            ${isLetterLearned(item.letter)
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
              : 'bg-white border-2 border-gray-200 text-gray-400'
            }
          `}
        >
          {item.letter}
          {isLetterLearned(item.letter) && (
            <span className="absolute top-1 right-1 text-xs">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
```

---

## 7. 目录结构

```
src/
├── pages/
│   ├── PhonicsPage.tsx        # 字母选择页
│   └── PhonicsLetterPage.tsx  # 字母视频页
├── components/
│   ├── LetterGrid.tsx         # 字母网格组件
│   ├── PhonicsVideoPlayer.tsx # 视频播放器
│   ├── ProgressBar.tsx        # 进度条
│   └── CompletionModal.tsx    # 完成弹窗
├── stores/
│   └── phonicsStore.ts        # 学习进度状态
├── data/
│   └── phonics.ts             # 26字母静态数据
└── types/
    └── phonics.ts             # 类型定义

public/
└── phonics/
    ├── A.mp4 ~ Z.mp4          # 26个字母视频
    └── ...
```

---

## 8. 里程碑计划

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| MVP | 字母网格 + 视频播放 + 进度保存 | P0 |
| V1.1 | 学习完成弹窗 + 标记已学 | P1 |
| V1.2 | 重播功能 + 播放控制 | P1 |
| V2.0 | 发音跟读 + 例词展示 | P2 |

---

## 9. 验收标准

- [ ] 底部Tab正确切换到拼读页面
- [ ] 26字母网格正确显示
- [ ] 点击字母能打开对应视频
- [ ] 视频播放流畅（不卡顿）
- [ ] 标记已学后字母状态变为绿色
- [ ] 进度数据正确保存到 localStorage
- [ ] 页面风格与其他模块一致
- [ ] APK打包后视频正常播放

---

## 10. 风险与对策

| 风险 | 应对措施 |
|------|----------|
| 视频文件体积大 | 使用压缩工具优化MP4，控制在2MB/个以内 |
| 部分设备不支持 | 提供降级方案：静态图片 + TTS发音 |
| 视频加载失败 | 显示占位图 + 重试按钮 |
| 存储空间不足 | 视频放在CDN，按需下载 |