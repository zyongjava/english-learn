# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

小学生英语单词学习系统（1-3年级），支持单词学习、认识、拼写三种模式，自动收集错题供复习巩固。

## 开发命令

```bash
# 启动开发服务器（自动关闭已占用的 5173 端口）
lsof -ti :5173 | xargs kill -9 2>/dev/null; npm run dev

npm run build    # 构建生产版本到 dist/
npm run preview  # 预览生产构建
```

## 开发流程（重要）

### 功能修改流程

1. **修改代码** - 在 `src/` 目录修改代码
2. **Web 验证** - 先关闭占用端口 `lsof -ti :5173 | xargs kill -9 2>/dev/null`，然后启动 `npm run dev`
3. **询问打包** - 确认功能正常后，询问用户是否需要打包 APK
4. **打包 APK** - 仅在用户确认后才执行 APK 打包

### APK 打包流程

仅在用户明确要求时执行：

```bash
# 1. Web 验证通过后，用户确认打包
# 2. 构建 Web 应用
npm run build

# 3. 同步到 Android
npx cap sync android

# 4. 打包 APK（需设置环境变量）
export JAVA_HOME=~/android-sdk/jdk21/Contents/Home
export ANDROID_HOME=~/android-sdk
export ANDROID_SDK_ROOT=~/android-sdk
cd android && ./gradlew assembleDebug
```

APK 输出位置：`android/app/build/outputs/apk/debug/app-debug.apk`

## 技术栈

- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Zustand（状态管理，数据持久化到 localStorage）
- Capacitor（Android 打包）

## 架构设计

### 状态管理（Zustand + persist）

所有数据存储在 localStorage，stores 目录包含：
- `unitStore.ts` - 单元和单词数据，含示例数据
- `mistakeStore.ts` - 错题记录，自动收录答错题目
- `settingsStore.ts` - 用户设置（音效开关、题目数量等）

### 数据模型

```typescript
Unit { id, name, words[], createdAt }
Word { id, unitId, word, phonetic, meaning }
Mistake { id, wordId, type, wrongAnswer, times, mastered }
QuizQuestion { word, options, correctAnswer, type, scrambledLetters? }
```

### 页面结构

- `HomePage.tsx` - 首页入口
- `LearningPage.tsx` - 学习页面（包含学习单词、单词认识、单词拼写三种模式）
- `MistakesPage.tsx` - 错题集复习
- `ManagePage.tsx` - 单元和单词管理
- `SettingsPage.tsx` - 设置页面（导入导出、每日目标等）

### 工具函数

- `utils/quiz.ts` - 出题算法、字母打乱、发音功能

## 界面设计原则

针对小学生（6-9岁）：
- 大圆角按钮、最小 60x60px
- 高饱和度配色、渐变背景
- 使用 emoji 作为视觉反馈
- 音效反馈（可开关）
- 语音合成（Web Speech API）进行单词发音

## 添加新功能

1. 新页面：在 `pages/` 添加，导入到 `HomePage.tsx` 导航
2. 新状态：在 `stores/` 添加 zustand store，配置 persist middleware
3. 新类型：在 `types/index.ts` 扩展 interface