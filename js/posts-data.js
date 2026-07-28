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
    id: '408-错题本',
    title: '408 知识点澄清记录',
    date: '2026-07-28',
    category: '考研',
    tags: ['408', '考研', '计算机组成原理', '数据结构', '操作系统', '计算机网络'],
    cover: '',
    file: 'posts/408-errorbook.md',
    featured: true
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
