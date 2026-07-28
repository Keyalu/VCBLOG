/**
 * BBLOG - Posts Data Registry
 *
 * Each post entry contains metadata.
 * The actual content is stored in /posts/*.md and loaded on demand.
 *
 * To add a new post:
 * 1. Create a .md file in /posts/
 * 2. Add an entry here with matching `file` path
 */

const POSTS = [
  {
    id: 'hello-world',
    title: '你好，世界 — 我的第一篇博客',
    date: '2026-07-28',
    category: '随笔',
    tags: ['博客', '开始'],
    cover: '',
    file: 'posts/hello-world.md',
    featured: true
  },
  {
    id: 'markdown-guide',
    title: 'Markdown 写作完全指南',
    date: '2026-07-27',
    category: '教程',
    tags: ['Markdown', '写作', '教程'],
    cover: '',
    file: 'posts/markdown-guide.md',
    featured: false
  },
  {
    id: 'web-dev-tips',
    title: '前端开发中那些实用的小技巧',
    date: '2026-07-25',
    category: '技术',
    tags: ['前端', 'JavaScript', 'CSS'],
    cover: '',
    file: 'posts/web-dev-tips.md',
    featured: false
  },
  {
    id: 'reading-notes',
    title: '读书笔记：如何高效学习',
    date: '2026-07-22',
    category: '读书',
    tags: ['读书', '学习方法'],
    cover: '',
    file: 'posts/reading-notes.md',
    featured: false
  },
  {
    id: 'github-pages-guide',
    title: '使用 GitHub Pages 搭建免费个人网站',
    date: '2026-07-20',
    category: '教程',
    tags: ['GitHub', '教程', '前端'],
    cover: '',
    file: 'posts/github-pages-guide.md',
    featured: false
  }
];

// Blog configuration
const BLOG_CONFIG = {
  title: 'BBLOG',
  subtitle: '用代码书写，以文字记录',
  author: 'BBLOG',
  description: '一个手写的静态个人博客',
  baseUrl: '',
  postsPerPage: 10,
  // Social links (shown in footer & about page)
  social: [
    { name: 'GitHub', url: 'https://github.com', icon: 'ri-github-fill' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'ri-twitter-fill' },
    { name: 'Email', url: 'mailto:hello@example.com', icon: 'ri-mail-fill' }
  ]
};
