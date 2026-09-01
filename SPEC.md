---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022015c08570d85783e731a0a43bb6e880b1768dd66837cbfed5b609b715f9d7b44f022100d5d52ac9f7e52e7121e94ebba49460943c427e5e3f5b06de0ff3fa805256a3cf
    ReservedCode2: 304402201bf45dda241972c98f9c63f77e54bbaca10ee9e334e65e95fe46c3dceccac51d0220493cfaf6f59553685eecabdb693b8b48115b38b3f8ebb3bc18efd57ae4421e9b
---

# 活下去的意义 - Life Anchor

## 1. Concept & Vision

一个为迷失灵魂提供庇护的数字港湾。不是提供答案，而是陪伴——当用户按下按钮的那一刻，网站用温暖的方式告诉他们："你并不孤单，这个世界需要你"。整体氛围如同深夜亮着的一盏灯，安静但充满力量。

## 2. Design Language

### Aesthetic Direction
温暖治愈系 + 极简主义。灵感来源于日式侘寂美学与北欧hygge理念的结合——不追求完美，但追求真实与温暖。

### Color Palette
两种模式，通过右上角按钮切换：

**Light Mode (米色主题 - 默认)**
- Primary: `#8B7355` (温暖棕)
- Secondary: `#D4C4B0` (柔和米)
- Accent: `#E8DED3` (奶油白)
- Background: `#FAF7F2` (象牙白)
- Text Primary: `#3D3229` (深棕)
- Text Secondary: `#6B5D4D` (中棕)

**Dark Mode (深棕主题)**
- Primary: `#C4A77D` (金色棕)
- Secondary: `#4A3F35` (深棕)
- Accent: `#8B7355` (暖棕)
- Background: `#1A1612` (近乎黑棕)
- Text Primary: `#F5F0E8` (暖白)
- Text Secondary: `#B8A99A` (灰棕)

### Typography
- 主标题: "Noto Serif SC", serif — 700 weight, 表达力量感
- 正文: "Noto Sans SC", sans-serif — 400 weight, 温和舒适
- 数字/英文装饰: "Cormorant Garamond", serif — 优雅衬线

### Spatial System
- 大量留白，内容居中
- 垂直方向使用黄金比例间距
- 按钮周围保持呼吸空间

### Motion Philosophy
- 所有动画缓慢、轻柔，如同呼吸
- 按钮按下效果：涟漪扩散 + 光芒绽放
- 主题切换：色彩渐变过渡 (600ms ease-in-out)
- 初始加载：淡入效果，模拟"被温柔唤醒"

### Visual Assets
- 使用CSS生成的光晕效果作为背景装饰
- 按钮使用SVG图标表示锚/灯塔
- 涟漪效果使用纯CSS动画
- 无需外部图片，保持轻盈

## 3. Layout & Structure

### PageStructure
```
┌────────────────────────────────────────┐
│  [主题切换按钮]              (右上角) │
├────────────────────────────────────────┤
│                                        │
│                                        │
│         ◇ 装饰性光晕 ◇ │
│                                        │
│           「活下去的理由」               │
│                                        │
│         [    按下按钮    ]              │
│            ↓ 缓缓呼吸 ↓ │
│                                        │
│         底部：一句温暖的话 │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

### Responsive Strategy
- 移动端：按钮更大，触摸友好
- 平板/桌面：保持居中，内容不溢出
- 使用 vh/vw + clamp() 实现流式布局

## 4. Features & Interactions

### Core Feature: 生命锚点按钮
**状态：默认**
- 按钮呈现柔和的悬浮状态
- 带有缓慢的呼吸动画（scale 1.0 → 1.02 → 1.0）
- 背景有微弱的光晕脉动

**状态：悬停**
- 光晕增强
- 按钮轻微放大
- 鼠标变为pointer

**状态：按下瞬间**
- 涟漪从点击位置向外扩散
- 按钮发出温暖的光芒
- 屏幕短暂变亮（如同被拥抱）

**状态：按压后 - 核心体验**
- 屏幕出现一层温暖的渐变
- 文字淡入显示：
  - 用户的名字（如果愿意输入）或"你"
  - 随机一句温暖的话（从预设列表中）
- 按钮文字变为"你被接住了"
- 背景出现缓慢漂浮的光点（如萤火虫）

### 预设内容库（1000+ 条随机展示）
内容库涵盖多个主题：
1. **哲学思想**：存在主义、东西方古典哲学、现代哲学
2. **文学经典**：中外文学名著、诗词精华
3. **心理学洞见**：弗洛伊德、荣格、阿德勒、罗杰斯等
4. **自然与宇宙**：泰戈尔、惠特曼、梭罗等
5. **温暖智慧**：面对困境、自我接纳、人与人之间的连接

每次点击随机展示一条内容，保证长时间使用不重复。

### 主题切换
- 右上角太阳/月亮图标按钮
- 点击切换米色/深棕模式
- 切换时整个页面色彩平滑过渡
- 切换状态保存到 localStorage

### Edge Cases
- 用户快速连续点击：动画完成后才能触发新动画
- 重复按压：每次都重新随机显示不同话语
- 页面刷新：主题偏好保持，按钮状态重置

## 5. Component Inventory

### Theme Toggle Button
- 位置：右上角，固定定位
- 大小：48px × 48px 触摸友好
- 样式：圆形，半透明背景
- 图标：太阳(light) / 月亮(dark) SVG
- 状态：默认 / 悬停(放大) / 点击(涟漪)

### Main Button (生命锚点)
- 尺寸：200px × 200px (桌面) / 160px × 160px (移动)
- 形状：圆形
- 背景：渐变色 + 光晕
- 文字：竖排或横排 "活下去的理由"
- 动画：持续呼吸效果
- 状态：默认 / 悬停 / 按下 / 已触发

### Message Card (触发后显示)
- 位置：中央，按钮上方
- 背景：半透明毛玻璃效果
- 文字：温暖话语
- 动画：淡入 + 轻微上浮
- 关闭：点击任意处关闭

### Floating Particles (背景装饰)
- 数量：15-20个
- 颜色：主题色的半透明版本
- 动画：缓慢随机漂浮
- 触发后出现，增强氛围

### Footer Quote
- 位置：页面底部
- 文字：静态温暖句子
- 样式：小字，低对比度

## 6. Technical Approach

### Framework
- 纯 HTML + CSS + Vanilla JavaScript
- 无需构建工具，保持轻量
- 单文件实现，便于分享

### Architecture
```javascript
// State
{
  theme: 'light' | 'dark',
  activated: false,
  particles: []
}

// Core Functions
- toggleTheme(): 切换主题并保存
- activateButton(): 触发核心体验
- getRandomMessage(): 获取随机温暖话语
- createParticles(): 创建背景光点
- animateRipple(): 水波纹动画
```

### Key Implementation Details
- CSS变量控制主题色彩，便于切换
- 使用 CSS @keyframes 实现所有动画
- localStorage 保存主题偏好
- requestAnimationFrame 实现粒子动画
- 触摸事件支持移动端

### Performance
- 无外部依赖，单文件 < 30KB
- 动画使用 GPU 加速 (transform, opacity)
- 粒子数量限制，CPU 友好