---
title: 使用 GitHub Pages 搭建免费个人网站
date: 2026-07-20
category: 教程
tags: [GitHub, 教程, 前端]
---

## 什么是 GitHub Pages？

GitHub Pages 是 GitHub 提供的免费静态网站托管服务。你可以直接从 GitHub 仓库部署网站，支持自定义域名，并且完全免费。

## 适用场景

- ✅ 个人博客
- ✅ 项目文档
- ✅ 作品集展示
- ✅ 简单的 Web 应用
- ❌ 需要后端服务的网站
- ❌ 大流量商业网站

## 快速开始

### Step 1: 创建仓库

在 GitHub 上创建一个新仓库，仓库名决定了你的网站地址：

| 仓库名 | 网站地址 |
|--------|---------|
| `username.github.io` | `https://username.github.io` |
| `my-blog` | `https://username.github.io/my-blog` |

### Step 2: 上传文件

最基本的网站只需要一个 `index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的网站</title>
</head>
<body>
  <h1>Hello, GitHub Pages!</h1>
</body>
</html>
```

### Step 3: 启用 GitHub Pages

1. 进入仓库 Settings
2. 找到左侧 "Pages" 选项
3. Source 选择 `main` 分支
4. 目录选择 `/ (root)`
5. 点击 Save

几分钟后，你的网站就上线了！

## 使用 GitHub Actions 自动部署

对于需要构建步骤的项目（如使用构建工具、模板引擎等），可以使用 GitHub Actions：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'  # 或者构建输出目录

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 自定义域名

### 购买域名

推荐的域名注册商：

- [Namecheap](https://www.namecheap.com)
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
- [阿里云万网](https://wanwang.aliyun.com)

### 配置 DNS

在域名管理面板添加 CNAME 记录：

```
类型: CNAME
主机记录: www
记录值: username.github.io
```

如果使用顶域名（如 `example.com`），需要添加 A 记录：

```
类型: A
主机记录: @
记录值: 185.199.108.153
记录值: 185.199.109.153
记录值: 185.199.110.153
记录值: 185.199.111.153
```

### 在 GitHub 中配置

1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名
2. 在 Settings → Pages 中填入自定义域名
3. 勾选 "Enforce HTTPS"

## 常见问题

### Q: 网站更新后没有生效？

A: GitHub Pages 有缓存，通常需要等待几分钟。可以尝试：
- 强制刷新浏览器 (Ctrl+Shift+R)
- 检查 Actions 是否部署成功
- 清除浏览器缓存

### Q: 支持 HTTPS 吗？

A: 支持！GitHub Pages 自动为 `*.github.io` 提供 HTTPS。自定义域名也可以启用。

### Q: 有流量限制吗？

A: GitHub Pages 有软限制：
- 每月 100GB 带宽
- 每小时 10 次构建
- 仓库大小建议不超过 1GB

### Q: 可以使用服务端语言吗？

A: 不可以。GitHub Pages 只支持静态文件（HTML、CSS、JS、图片等）。

## 进阶技巧

### 1. 使用 Jekyll

GitHub Pages 原生支持 Jekyll，无需额外配置：

```bash
# 本地安装 Jekyll
gem install bundler jekyll

# 创建新站点
jekyll new my-site
cd my-site

# 本地预览
bundle exec jekyll serve
```

### 2. 多语言支持

可以通过目录结构实现：

```
/
├── index.html          # 默认语言
├── en/
│   └── index.html      # 英文版
└── zh/
    └── index.html      # 中文版
```

### 3. 404 页面

创建 `404.html` 文件，GitHub Pages 会自动使用它作为自定义 404 页面。

## 总结

GitHub Pages 是搭建个人网站最简单、最免费的方式之一。无论是技术博客、项目文档还是个人作品集，它都能胜任。

关键步骤回顾：

1. **创建仓库** → `username.github.io`
2. **上传文件** → 至少需要 `index.html`
3. **启用 Pages** → Settings → Pages
4. **（可选）自定义域名** → DNS + CNAME

> 最好的学习方式是动手实践。现在就去创建你的第一个 GitHub Pages 网站吧！

---

**相关资源**：

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Pages 示例](https://github.com/github/pages-gem)
- [Jekyll 主题列表](https://jekyllthemes.io)
