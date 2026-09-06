# 活下去的理由 - Life Anchor

> 一个为迷失灵魂提供庇护的数字港湾。当用户按下按钮的那一刻，网站用温暖的方式告诉他们：「你并不孤单，这个世界需要你」。

---
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?logo=githubpages&logoColor=white)

---

## 1. 功能亮点

- 🌙 **双主题切换**：米色暖阳与深棕夜空，一键切换
- 🌍 **中英双语**：中文 / English / 上英文下中文 三种模式
- 📅 **每日同步**：基于日期的确定性随机，每日自动更新50条内容，所有设备同步
- 🔊 **多种音效**：水滴声、轻柔点击、机械键盘轴声、风铃等
- 📱 **响应式设计**：完美适配移动端与桌面端

---

## 2. 技术特性

| 特性 | 说明 |
|------|------|
| 每日内容 | 110+ 精选语录，每日50条自动轮换 |
| 内容来源 | 哲学、文学、心理学、古典诗词、东西方经典 |
| 音效 | Web Audio API 实时合成，无需音频文件 |
| 数据存储 | localStorage 保存用户偏好 |

---

## 3. 隐私与安全

- 所有数据处理均在本地完成，不上传至任何第三方服务器。
- 不收集用户行为数据、不追踪、无广告。
- 无需网络权限，纯静态网页可离线使用。

---

## 4. 项目结构

```
life-anchor/
├── index.html              # 主页面
├── css/
│   └── styles.css         # 样式文件
├── js/
│   └── main.js            # JavaScript 文件
├── .github/
│   └── workflows/
│       └── deploy.yml     # 自动部署配置
├── .nojekyll             # 禁用 Jekyll 处理
└── README.md             # 项目说明文档
```

---

## 5. 快速开始

### 本地运行

在浏览器中直接打开 `index.html` 文件即可。

### GitHub Pages 部署

1. 将整个项目推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. Source 选择 **GitHub Actions**
4. 推送代码到 `main` 分支，部署自动进行

---

## 6. 技术栈

- **前端**：HTML5 + CSS3 + Vanilla JavaScript
- **音效**：Web Audio API
- **存储**：localStorage
- **部署**：GitHub Pages + GitHub Actions

---

## 7. 使用提示

1. **浏览器缓存**：更新后如页面无变化，请强制刷新（`Ctrl + Shift + R` 或 `Cmd + Shift + R`）
2. **GitHub Pages 显示 undefined**：在浏览器控制台执行 `localStorage.clear(); location.reload();` 清除旧缓存
3. **每日内容**：每日内容基于日期自动生成，0点后自动更新

---

© 2026 zilo1002. All rights reserved.
