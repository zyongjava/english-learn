---
name: 新启航英语设计系统
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e6e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#424754'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f9f9ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
  gradient-start: '#3B82F6'
  gradient-end: '#8B5CF6'
  success: '#10B981'
  warning: '#F59E0B'
  background-page: '#F3F4F6'
  surface-card: '#FFFFFF'
  text-primary: '#1F2937'
  text-secondary: '#6B7280'
typography:
  nav-title:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-card:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-main:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-secondary:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  button-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  stat-number:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  page-margin: 16px
  component-gap: 16px
  card-gutter: 12px
  section-padding: 20px
  tab-bar-height: 60px
---

# 新启航英语学习系统 - UI 设计文档

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-22 | 底部 Tab 导航设计 |

---

## 1. 整体布局

### 1.1 页面结构

```
┌─────────────────────────────────────┐
│                                     │
│           内容区域                    │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│    🏠 首页    │    👤 我的          │
└─────────────────────────────────────┘
```

- **内容区域**：占据屏幕大部分空间，可滚动
- **底部 Tab 栏**：固定在底部，高度约 60px

### 1.2 底部 Tab 栏

| Tab | 图标 | 名称 | 激活状态 |
|-----|------|------|----------|
| 左侧 | 🏠 | 首页 | 蓝色高亮 + 文字加粗 |
| 右侧 | 👤 | 我的 | 灰色 + 文字正常 |

---

## 2. 首页 Tab

### 2.1 页面结构

```
┌─────────────────────────────────────┐
│  新启航英语                         │  ← 顶部标题栏
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 📊 今日学习                  │   │
│  │ 已完成 3/10 题   连续3天    │   │  ← 学习统计卡片
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      🎯 开始学习            │   │  ← 主按钮（大圆角按钮）
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────┐  ┌─────────┐        │
│  │ 📚错题集│  │ 📅打卡  │        │  ← 功能入口卡片
│  │ (3)    │  │ 已完成  │        │
│  └─────────┘  └─────────┘        │
│                                     │
├─────────────────────────────────────┤
│    🏠 首页    │    👤 我的          │
└─────────────────────────────────────┘
```

### 2.2 组件说明

#### 顶部标题栏
- 标题文字：「新启航英语」
- 字体：加粗，24px
- 颜色：白色

#### 学习统计卡片
- 背景：白色圆角卡片（带阴影）
- 内容：
  - 今日进度：已完成 X/目标 题
  - 连续天数：连续 X 天
- 圆角：16px

#### 开始学习按钮
- 类型：大按钮，全宽
- 背景：渐变色（蓝色→紫色）
- 文字：「🎯 开始学习」
- 高度：60px
- 圆角：16px

#### 功能入口卡片
- 布局：两列网格
- 单卡片包含：
  - 图标
  - 名称
  - 状态/数量（可选）
- 圆角：12px

---

## 3. 我的 Tab

### 3.1 页面结构

```
┌─────────────────────────────────────┐
│  我的                               │  ← 顶部标题栏
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 累计学习：128 个单词         │   │
│  │ 累计正确：456 题            │   │
│  │ 最高连胜：15 题              │   │  ← 统计信息（顶部）
│  │ 学习天数：30 天              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────┐  ┌─────────┐         │
│  │ 🏆成就  │  │ 📖单词  │         │  ← 快捷入口卡片
│  │ 5/16   │  │ 管理    │         │
│  └─────────┘  └─────────┘         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⚙️ 设置                   │   │  ← 设置入口
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│    🏠 首页    │    👤 我的          │
└─────────────────────────────────────┘
```

### 3.2 组件说明

#### 统计信息区域
- 布局：垂直列表
- 4 项数据：累计学习、累计正确、最高连胜、学习天数
- 样式：灰色文字，白色背景卡片
- 圆角：12px

#### 快捷入口卡片
- 布局：两列网格
- 包含功能：
  - 🏆 成就（显示 X/16）
  - 📖 单词管理
- 圆角：12px

#### 设置入口
- 全宽卡片
- 图标 + 文字
- 右侧箭头
- 圆角：12px

---

## 4. 页面跳转结构

```
首页 Tab
├── 学习选择页（单词学习 / 认识 / 拼写）
│   └── 学习/测验页面
├── 错题集
│   └── 错题复习页面
└── 打卡日历

我的 Tab
├── 成就展示页
├── 单词管理页
│   ├── 单元管理
│   ├── 单词增删改
│   └── 批量导入
└── 设置页
    ├── 学习设置
    └── 数据导入/导出
```

---

## 5. 组件设计规范

### 5.1 颜色

| 用途 | 颜色 |
|------|------|
| 主色 | #3B82F6（蓝色） |
| 渐变起始 | #3B82F6 |
| 渐变结束 | #8B5CF6 |
| 成功色 | #10B981（绿色） |
| 警告色 | #F59E0B（橙色） |
| 错误色 | #EF4444（红色） |
| 背景色 | #F3F4F6（浅灰） |
| 卡片背景 | #FFFFFF |
| 文字主色 | #1F2937 |
| 文字次色 | #6B7280 |

### 5.2 圆角

| 组件 | 圆角 |
|------|------|
| 小按钮/标签 | 8px |
| 卡片/入口 | 12px |
| 大按钮/弹窗 | 16px |
| Tab 栏 | 0px（贴底） |

### 5.3 间距

| 用途 | 间距 |
|------|------|
| 页面内边距 | 16px |
| 卡片间距 | 12px |
| 元素垂直间距 | 16px |

---

## 6. 交互规范

### 6.1 Tab 切换
- 点击底部 Tab 切换页面
- 无动画，瞬间切换
- 当前 Tab 高亮显示

### 6.2 按钮状态
- 默认态：正常颜色
- 按下态：缩小至 95%
- 禁用态：50% 透明度

### 6.3 页面返回
- 子页面顶部有返回按钮
- 返回按钮点击返回上一级

---

## 7. 响应式设计

- 设计基于 375px 宽度（iPhone 标准）
- 最大宽度：428px（适配大屏手机）
- 内容区域居中显示

---

## 8. 待确认事项

- [ ] 是否需要在首页添加成就入口？
- [ ] 学习统计卡片是否需要显示更多详情？
- [ ] 打卡入口是否需要显示月历预览？
- [ ] 是否需要添加夜间模式？