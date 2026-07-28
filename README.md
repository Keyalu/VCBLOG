# BBLOG

一个完全手写的静态个人博客，不依赖任何博客框架。

## 特性

- 🌓 暗色/亮色主题切换
- 🔍 全文搜索
- 🏷️ 标签分类筛选
- 📖 文章目录导航（TOC）
- 📱 响应式设计
- ⚡ 极快的加载速度
- 📋 代码块一键复制
- 🗂️ 文章归档页
- 🚀 GitHub Actions 自动部署

## 技术栈

- HTML5 / CSS3 / Vanilla JavaScript
- [marked.js](https://github.com/markedjs/marked) - Markdown 渲染
- [highlight.js](https://highlightjs.org/) - 代码高亮
- [Remix Icon](https://remixicon.com/) - 图标
- GitHub Pages - 托管
- GitHub Actions - CI/CD

## 项目结构

```
├── index.html          # 主页面 (SPA)
├── 404.html            # GitHub Pages SPA 重定向
├── css/
│   └── style.css       # 全部样式
├── js/
│   ├── utils.js        # 工具函数
│   ├── posts-data.js   # 文章数据注册表
│   └── app.js          # 核心应用逻辑
├── posts/              # Markdown 文章
│   ├── hello-world.md
│   ├── markdown-guide.md
│   └── ...
├── assets/
│   └── images/         # 图片资源
└── .github/
    └── workflows/
        └── deploy.yml  # 自动部署配置
```

## 如何使用

### 本地预览

由于使用了 `fetch` 加载 Markdown 文件，需要通过 HTTP 服务器访问：

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .

# 使用 VS Code Live Server 插件
```

然后访问 `http://localhost:8080`

### 添加新文章

1. 在 `posts/` 目录创建 Markdown 文件：

```markdown
---
title: 文章标题
date: 2026-07-28
category: 分类
tags: [标签1, 标签2]
---

正文内容...
```

2. 在 `js/posts-data.js` 中注册文章：

```javascript
{
  id: 'your-post-slug',
  title: '文章标题',
  date: '2026-07-28',
  category: '分类',
  tags: ['标签1', '标签2'],
  cover: '',  // 可选封面图
  file: 'posts/your-post.md',
  featured: false  // 是否置顶
}
```

### 部署到 GitHub Pages

1. Fork 或上传到 GitHub 仓库
2. 进入 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 推送代码后自动部署

## 自定义

### 修改博客信息

编辑 `js/posts-data.js` 中的 `BLOG_CONFIG`：

```javascript
const BLOG_CONFIG = {
  title: '你的博客名',
  subtitle: '你的副标题',
  author: '你的名字',
  // ...
};
```

### 修改主题颜色

编辑 `css/style.css` 中的 CSS 变量：

```css
:root {
  --accent: #4361ee;        /* 主题色 */
  --accent-hover: #3a56d4;  /* 悬停色 */
  --bg-primary: #ffffff;    /* 背景色 */
  /* ... */
};
```

## License

MIT
