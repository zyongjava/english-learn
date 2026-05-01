# 新启航英语

小学生英语单词学习系统（1-3年级），支持单词学习、认识、拼写三种模式，自动收集错题供复习巩固。

## 功能特点

- **单词学习** - 学习单元内单词，掌握发音和含义
- **单词认识** - 选择正确的中文含义
- **单词拼写** - 根据提示拼写单词
- **错题集** - 自动收录答错题目，针对性复习
- **拼读学习** - 26个字母发音和拼读规则学习
- **打卡记录** - 每日学习打卡，培养学习习惯
- **数据管理** - 导入导出学习数据

## 技术栈

- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Zustand（状态管理）
- Capacitor（Android 打包）

## 项目结构

```
src/
├── pages/           # 页面组件
├── stores/          # 状态管理（Zustand）
├── utils/           # 工具函数
├── components/      # 通用组件
├── types/           # TypeScript 类型
└── data/            # 静态数据

public/              # 公共资源
video/               # 字母发音视频
design/              # 设计文件
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 同步到 Android
npx cap sync android

# 打包 APK
cd android && ./gradlew assembleDebug
```

## APK 输出

Android APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

## 数据存储

所有数据存储在浏览器 localStorage 中：
- 单元和单词数据
- 错题记录
- 学习设置
- 打卡记录