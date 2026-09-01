# 活下去的理由 - Life Anchor

一个为迷失灵魂提供庇护的数字港湾。不是提供答案，而是陪伴——当用户按下按钮的那一刻，网站用温暖的方式告诉他们：**"你并不孤单，这个世界需要你"**。

## 功能特点

- **温暖治愈的视觉设计**：米色主题与深棕主题双模式切换
- **生命锚点按钮**：独特的水波纹动画与呼吸效果
- **1000+ 温暖话语**：涵盖哲学、文学、心理学、自然与人文
- **多种音效选择**：水滴声、轻柔点击、机械键盘声、风铃等
- **响应式设计**：完美适配移动端与桌面端
- **无障碍支持**：支持键盘导航与减弱动画偏好

## 项目结构

```
life-anchor/
├── index.html              # 主页面
├── css/
│   └── styles.css          # 样式文件
├── js/
│   └── main.js             # JavaScript 文件
├── .github/
│   └── workflows/
│       └── deploy.yml      # 自动部署配置
├── .nojekyll              # 禁用 Jekyll 处理
├── SPEC.md                 # 设计规格文档
└── README.md               # 项目说明文档
```

## 快速开始

### 本地运行

1. 克隆或下载本项目
2. 直接在浏览器中打开 `index.html` 文件

### GitHub Pages 部署（自动）

1. 将整个项目推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. Source 选择 **GitHub Actions**
4. 推送代码到 `main` 分支，部署自动进行

> **提示**：项目已配置好 GitHub Actions 工作流，每次推送到 `main` 分支都会自动部署。

### 手动部署（可选）

如果你想使用传统方式部署：
1. 进入仓库 **Settings → Pages**
2. Source 选择 `main` 分支和 `/ (root)` 目录
3. 点击 Save

部署完成后，访问 `https://yourusername.github.io/repo-name/` 即可查看网站。

## 技术栈

- 纯 HTML5 + CSS3 + Vanilla JavaScript
- 无需构建工具，轻量高效
- 使用 Web Audio API 生成音效
- 使用 localStorage 保存用户偏好

## 设计理念

整体氛围如同深夜亮着的一盏灯，安静但充满力量。灵感来源于日式侘寂美学与北欧 hygge 理念的结合——不追求完美，但追求真实与温暖。

## 许可证

MIT License

---

**愿这个小小的网站，能在某个深夜，为某个需要的人点亮一盏灯。**
