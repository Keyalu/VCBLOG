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
    id: 'kaoyan-overview',
    title: '考研进度总览',
    date: '2026-07-28',
    category: '考研',
    tags: ['考研', '进度'],
    cover: '',
    file: 'posts/kaoyan-overview.md',
    featured: true
  },
  {
    id: '408-errorbook',
    title: '408 知识点澄清记录',
    date: '2026-07-28',
    category: '考研',
    tags: ['408', '考研', '计算机组成原理', '数据结构', '操作系统', '计算机网络'],
    cover: '',
    file: 'posts/408-errorbook.md',
    featured: false
  },
  {
    id: 'math2-tracker',
    title: '数学二 进度追踪表',
    date: '2026-07-28',
    category: '考研',
    tags: ['数学二', '考研', '张宇', '高等数学', '线性代数'],
    cover: '',
    file: 'posts/math2-tracker.md',
    featured: false
  },
  {
    id: '408-tracker',
    title: '408计算机综合 进度追踪表',
    date: '2026-07-28',
    category: '考研',
    tags: ['408', '考研', '数据结构', '操作系统', '计算机网络'],
    cover: '',
    file: 'posts/408-tracker.md',
    featured: false
  },
  {
    id: 'math-errorbook',
    title: '数学错题本',
    date: '2026-07-28',
    category: '考研',
    tags: ['数学', '考研', '错题'],
    cover: '',
    file: 'posts/math-errorbook.md',
    featured: false
  },
  {
    id: 'error-classification',
    title: '错题分类索引',
    date: '2026-07-27',
    category: '考研',
    tags: ['考研', '错题', '分类'],
    cover: '',
    file: 'posts/error-classification.md',
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
