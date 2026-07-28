---
title: 前端开发中那些实用的小技巧
date: 2026-07-25
category: 技术
tags: [前端, JavaScript, CSS]
---

## 前言

在日常的前端开发中，总有一些小技巧能让代码更简洁、性能更好、体验更佳。这篇文章记录了一些我常用且觉得非常实用的技巧。

## CSS 技巧

### 1. 使用 CSS 变量管理主题

```css
:root {
  --primary: #4361ee;
  --bg: #ffffff;
  --text: #1a1a2e;
}

[data-theme="dark"] {
  --bg: #0f0f1a;
  --text: #e8e8f0;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

切换主题只需要改变 `data-theme` 属性，所有使用变量的地方自动更新。

### 2. clamp() 实现响应式字体

```css
h1 {
  /* 最小 1.5rem，首选 4vw，最大 3rem */
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```

比媒体查询更优雅的响应式方案。

### 3. 完美的居中

```css
/* Flexbox 方案 */
.center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid 方案（更简洁） */
.center-grid {
  display: grid;
  place-items: center;
}
```

### 4. 文本截断

```css
/* 单行截断 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行截断 */
.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## JavaScript 技巧

### 5. 可选链操作符

```javascript
// 以前
const city = user && user.address && user.address.city;

// 现在
const city = user?.address?.city;
```

### 6. 空值合并操作符

```javascript
// 以前：0 和 '' 也会被当作 falsy
const name = value || '默认值';

// 现在：只处理 null 和 undefined
const name = value ?? '默认值';
```

### 7. 数组去重

```javascript
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]
```

### 8. 对象解构的默认值

```javascript
function createUser({ name = '匿名', age = 0, role = 'user' } = {}) {
  return { name, age, role };
}

createUser({ name: '张三' }); // { name: '张三', age: 0, role: 'user' }
```

### 9. 防抖和节流

```javascript
// 防抖：停止操作后才执行
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 节流：固定间隔执行
function throttle(fn, delay = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}
```

### 10. async/await 错误处理

```javascript
// 使用 try-catch
async function fetchData() {
  try {
    const resp = await fetch('/api/data');
    const data = await resp.json();
    return data;
  } catch (err) {
    console.error('请求失败:', err);
    return null;
  }
}

// 或者用 to 模式
function to(promise) {
  return promise.then(data => [null, data]).catch(err => [err, null]);
}

async function fetchData2() {
  const [err, data] = await to(fetch('/api/data'));
  if (err) return null;
  return data;
}
```

## 性能技巧

### 11. 图片懒加载

```html
<!-- 原生懒加载，零 JS -->
<img src="photo.jpg" loading="lazy" alt="照片">
```

### 12. 使用 will-change 提示浏览器

```css
.animated-element {
  will-change: transform;
}
```

### 13. 减少重排

```javascript
// 不好：多次读写交替
element.style.width = '100px';
const h = element.offsetHeight; // 触发重排
element.style.height = h + 'px';

// 好：批量读，批量写
const h = element.offsetHeight; // 读
element.style.width = '100px';
element.style.height = h + 'px'; // 写
```

## 总结

这些小技巧单独来看都很简单，但积累起来能显著提升代码质量和开发效率。关键是在日常开发中有意识地运用它们，直到成为习惯。

> 细节决定成败。在前端开发中，这些"小技巧"往往就是区分优秀代码和平庸代码的关键。
