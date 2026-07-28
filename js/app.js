/**
 * BBLOG - Main Application
 * Hash-based SPA router + page renderers + interactive features
 */

// ==========================================
//  Router
// ==========================================
const Router = {
  routes: {},

  register(pattern, handler) {
    this.routes[pattern] = handler;
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$');
      const match = hash.match(regex);
      if (match) {
        handler(...match.slice(1));
        return;
      }
    }
    this.routes['/404'] ? this.routes['/404']() : App.render404();
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }
};

// ==========================================
//  Toast Notifications
// ==========================================
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();
    const icons = {
      success: 'ri-check-line',
      error: 'ri-error-warning-line',
      info: 'ri-information-line'
    };

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <i class="toast-icon ${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;
    this.container.appendChild(el);

    setTimeout(() => {
      el.classList.add('toast-exit');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); }
};

// ==========================================
//  Command Palette (Ctrl+K)
// ==========================================
const CommandPalette = {
  overlay: null,
  input: null,
  results: null,
  activeIndex: 0,
  items: [],

  init() {
    this.overlay = document.getElementById('cmd-overlay');
    this.input = document.getElementById('cmd-input');
    this.results = document.getElementById('cmd-results');

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Click overlay to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Input handling
    this.input.addEventListener('input', () => this.search());
    this.input.addEventListener('keydown', (e) => this.handleKeyNav(e));
  },

  isOpen() {
    return this.overlay.style.display !== 'none';
  },

  toggle() {
    this.isOpen() ? this.close() : this.open();
  },

  open() {
    this.overlay.style.display = 'flex';
    this.input.value = '';
    this.activeIndex = 0;
    this.search();
    requestAnimationFrame(() => this.input.focus());
  },

  close() {
    this.overlay.style.display = 'none';
    this.input.value = '';
  },

  search() {
    const q = this.input.value.trim().toLowerCase();

    // Build items list
    const pages = [
      { type: 'page', title: '首页', desc: '回到博客首页', icon: 'ri-home-4-line', action: () => Router.navigate('/') },
      { type: 'page', title: '归档', desc: '查看所有文章', icon: 'ri-archive-line', action: () => Router.navigate('/archive') },
      { type: 'page', title: '关于', desc: '关于博主', icon: 'ri-user-smile-line', action: () => Router.navigate('/about') },
      { type: 'page', title: '切换主题', desc: '切换暗色/亮色模式', icon: 'ri-moon-line', action: () => document.getElementById('theme-toggle').click() },
    ];

    const posts = POSTS.map(p => ({
      type: 'post',
      title: p.title,
      desc: `${p.category} · ${Utils.formatDate(p.date)}`,
      icon: 'ri-article-line',
      action: () => Router.navigate(`/post/${p.id}`)
    }));

    let all = [...pages, ...posts];

    // Filter
    if (q) {
      all = all.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    }

    // Group
    const pageItems = all.filter(i => i.type === 'page');
    const postItems = all.filter(i => i.type === 'post');
    this.items = [...pageItems, ...postItems];

    // Render
    let html = '';
    if (pageItems.length) {
      html += `<div class="cmd-group-label">页面</div>`;
      html += pageItems.map((item, i) => this.renderItem(item, i)).join('');
    }
    if (postItems.length) {
      html += `<div class="cmd-group-label">文章</div>`;
      html += postItems.map((item, i) => this.renderItem(item, i + pageItems.length)).join('');
    }
    if (!all.length) {
      html = `<div style="padding:30px;text-align:center;color:var(--text-tertiary)">没有找到匹配结果</div>`;
    }

    this.results.innerHTML = html;
    this.activeIndex = 0;
    this.updateActive();
  },

  renderItem(item, index) {
    return `
      <div class="cmd-item ${index === this.activeIndex ? 'active' : ''}"
           data-index="${index}"
           onmouseenter="CommandPalette.setActive(${index})"
           onclick="CommandPalette.select(${index})">
        <div class="cmd-item-icon"><i class="${item.icon}"></i></div>
        <div class="cmd-item-text">
          <div class="cmd-item-title">${Utils.escapeHtml(item.title)}</div>
          <div class="cmd-item-desc">${Utils.escapeHtml(item.desc)}</div>
        </div>
      </div>
    `;
  },

  handleKeyNav(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, this.items.length - 1);
      this.updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this.updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.select(this.activeIndex);
    }
  },

  setActive(index) {
    this.activeIndex = index;
    this.updateActive();
  },

  updateActive() {
    this.results.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.classList.toggle('active', i === this.activeIndex);
    });
    // Scroll active into view
    const active = this.results.querySelector('.cmd-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  },

  select(index) {
    if (this.items[index]) {
      this.close();
      this.items[index].action();
    }
  }
};

// ==========================================
//  Interactive Effects
// ==========================================
const FX = {

  // --- Reading Progress Bar ---
  initReadingProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  },

  // --- Header Auto-Hide on Scroll ---
  initHeaderAutoHide() {
    const header = document.getElementById('main-header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          // Only hide after scrolling past header
          if (currentScroll > 120) {
            header.classList.toggle('header-hidden', currentScroll > lastScroll && currentScroll > 200);
          } else {
            header.classList.remove('header-hidden');
          }
          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  // --- Page Transition ---
  pageTransition(callback) {
    const content = document.getElementById('app-content');
    content.classList.add('page-exit');
    setTimeout(() => {
      content.classList.remove('page-exit');
      callback();
      content.classList.add('page-transition');
      setTimeout(() => content.classList.remove('page-transition'), 500);
    }, 200);
  },

  // --- Scroll Reveal via IntersectionObserver ---
  initScrollReveal(container) {
    const elements = (container || document).querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  },

  // --- Animated Number Counter ---
  animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;

      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  },

  // --- 3D Tilt Card Effect ---
  initTiltCards() {
    document.querySelectorAll('.post-card').forEach(card => {
      card.classList.add('tilt-card');

      // Add shine element
      if (!card.querySelector('.tilt-shine')) {
        const shine = document.createElement('div');
        shine.className = 'tilt-shine';
        card.appendChild(shine);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Shine gradient
        const shine = card.querySelector('.tilt-shine');
        if (shine) {
          const gradientX = (x / rect.width) * 100;
          const gradientY = (y / rect.height) * 100;
          shine.style.background = `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s ease';
        setTimeout(() => card.style.transition = '', 500);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });
  },

  // --- Ripple Effect ---
  initRipple() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.btn, .filter-tag, .post-card, .about-link, .post-nav-item');
      if (!target) return;

      // Don't add ripple to cards with tilt (they have their own effect)
      if (target.classList.contains('tilt-card')) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (x - size / 2) + 'px';
      ripple.style.top = (y - size / 2) + 'px';

      target.style.position = target.style.position || 'relative';
      target.style.overflow = 'hidden';
      target.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    });
  },

  // --- Typing Effect ---
  typeText(element, text, speed = 60) {
    return new Promise((resolve) => {
      element.textContent = '';
      let i = 0;
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      element.appendChild(cursor);

      const type = () => {
        if (i < text.length) {
          element.insertBefore(document.createTextNode(text[i]), cursor);
          i++;
          setTimeout(type, speed + Math.random() * 40);
        } else {
          // Remove cursor after a pause
          setTimeout(() => {
            cursor.style.animation = 'none';
            cursor.style.opacity = '0';
            cursor.style.transition = 'opacity 0.5s';
            setTimeout(() => cursor.remove(), 500);
            resolve();
          }, 1500);
        }
      };
      type();
    });
  },

  // --- Particle Background ---
  initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const particleColor = isDark ? 'rgba(108, 130, 248, 0.3)' : 'rgba(67, 97, 238, 0.2)';
    const lineColor = isDark ? 'rgba(108, 130, 248, 0.08)' : 'rgba(67, 97, 238, 0.06)';

    const particles = [];
    const count = Math.min(50, Math.floor(canvas.width * canvas.height / 15000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      });
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    // Return cleanup function
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  },

  // Cleanup particles on page navigation
  _particleCleanup: null,

  stopParticles() {
    if (this._particleCleanup) {
      this._particleCleanup();
      this._particleCleanup = null;
    }
  }
};

// ==========================================
//  App - Main application
// ==========================================
const App = {
  contentEl: null,
  postsCache: {},

  init() {
    this.contentEl = document.getElementById('app-content');
    this.initTheme();
    this.initMobileMenu();
    this.initBackToTop();
    FX.initReadingProgress();
    FX.initHeaderAutoHide();
    FX.initRipple();
    CommandPalette.init();
    Toast.init();
    this.registerRoutes();
    Router.init();
  },

  // ---------- Theme ----------
  initTheme() {
    const saved = Utils.storage.get('theme', 'light');
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeIcon(saved);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        Utils.storage.set('theme', next);
        this.updateThemeIcon(next);
        Toast.info(next === 'dark' ? '已切换至暗色模式 🌙' : '已切换至亮色模式 ☀️');
      });
    }
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark'
        ? '<i class="ri-sun-line"></i>'
        : '<i class="ri-moon-line"></i>';
    }
  },

  // ---------- Mobile Menu ----------
  initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        const icon = toggle.querySelector('i');
        icon.className = nav.classList.contains('open') ? 'ri-close-line' : 'ri-menu-line';
      });
      nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
          toggle.querySelector('i').className = 'ri-menu-line';
        });
      });
    }
  },

  // ---------- Back to Top ----------
  initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', Utils.debounce(() => {
      btn.classList.toggle('visible', window.scrollY > 300);
    }, 100));
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  // ---------- Update active nav ----------
  setActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + route);
    });
  },

  // ---------- Routes ----------
  registerRoutes() {
    Router.register('/', () => this.renderHome());
    Router.register('/post/:id', (id) => this.renderPost(id));
    Router.register('/about', () => this.renderAbout());
    Router.register('/archive', () => this.renderArchive());
    Router.register('/404', () => this.render404());
  },

  // ---------- Render with transition ----------
  transitionTo(callback) {
    FX.stopParticles();
    const content = this.contentEl;
    content.classList.add('page-exit');
    setTimeout(() => {
      content.classList.remove('page-exit');
      try {
        callback();
      } catch (err) {
        console.error('Render error:', err);
        content.innerHTML = `<div class="page-404"><div class="page-404-code">⚠️</div><p class="page-404-text">渲染出错：${Utils.escapeHtml(err.message)}</p><a href="#/" class="btn"><i class="ri-home-line"></i> 回到首页</a></div>`;
        return;
      }
      content.classList.add('page-transition');
      // Init scroll reveal after a tick so the DOM is ready
      requestAnimationFrame(() => FX.initScrollReveal(content));
      setTimeout(() => content.classList.remove('page-transition'), 500);
    }, 200);
  },

  // ---------- Render Helpers ----------
  showLoading() {
    this.contentEl.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>`;
  },

  async loadPostContent(post) {
    if (this.postsCache[post.id]) return this.postsCache[post.id];
    try {
      const resp = await fetch(post.file);
      if (!resp.ok) throw new Error('Not found');
      const text = await resp.text();
      const { meta, content } = Utils.parseFrontMatter(text);
      this.postsCache[post.id] = { ...post, meta, content, raw: text };
      return this.postsCache[post.id];
    } catch {
      return null;
    }
  },

  // ==========================================
  //  Home Page
  // ==========================================
  renderHome() {
    this.setActiveNav('#/');

    this.transitionTo(() => {
      const posts = POSTS.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      const allTags = [...new Set(posts.flatMap(p => p.tags))].sort();
      const categoryCount = new Set(posts.map(p => p.category)).size;

      this.contentEl.innerHTML = `
        <!-- Hero with particles -->
        <section class="hero" style="position:relative;overflow:visible">
          <canvas class="particle-canvas" id="particle-canvas"></canvas>
          <h1 class="hero-title reveal">${Utils.escapeHtml(BLOG_CONFIG.title)}</h1>
          <p class="hero-subtitle" id="hero-subtitle"></p>
          <div class="hero-stats reveal reveal-delay-1">
            <div class="hero-stat">
              <div class="hero-stat-num" data-count="${posts.length}">0</div>
              <div class="hero-stat-label">文章</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num" data-count="${allTags.length}">0</div>
              <div class="hero-stat-label">标签</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num" data-count="${categoryCount}">0</div>
              <div class="hero-stat-label">分类</div>
            </div>
          </div>
        </section>

        <!-- Search -->
        <div class="search-wrapper reveal reveal-delay-2">
          <i class="ri-search-line search-icon"></i>
          <input type="text" class="search-input" id="search-input" placeholder="搜索文章标题、内容、标签... (Ctrl+K 快捷搜索)">
          <button class="search-clear" id="search-clear"><i class="ri-close-line"></i></button>
        </div>

        <!-- Tag filter -->
        <div class="filter-bar reveal reveal-delay-3" id="filter-bar">
          <span class="filter-label">标签</span>
          <button class="filter-tag active" data-tag="all">全部</button>
          ${allTags.map(tag => `<button class="filter-tag" data-tag="${Utils.escapeHtml(tag)}">${Utils.escapeHtml(tag)}</button>`).join('')}
        </div>

        <!-- Posts grid -->
        <div class="posts-grid" id="posts-grid"></div>
      `;

      // Render posts
      this.renderPosts(posts);

      // Init particles
      FX._particleCleanup = FX.initParticles('particle-canvas');

      // Typing effect for subtitle
      setTimeout(() => {
        const subtitleEl = document.getElementById('hero-subtitle');
        if (subtitleEl) {
          FX.typeText(subtitleEl, BLOG_CONFIG.subtitle, 70);
        }
      }, 300);

      // Animate counters
      setTimeout(() => FX.animateCounters(), 200);

      // Search
      const searchInput = document.getElementById('search-input');
      const searchClear = document.getElementById('search-clear');
      searchInput.addEventListener('input', Utils.debounce(() => {
        const q = searchInput.value.trim().toLowerCase();
        searchClear.classList.toggle('visible', q.length > 0);
        this.filterPosts(posts, q, this.getActiveTag());
      }, 200));
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        this.filterPosts(posts, '', this.getActiveTag());
        searchInput.focus();
      });

      // Tag filter
      document.getElementById('filter-bar').addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-tag');
        if (!btn) return;
        document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tag = btn.dataset.tag;
        const q = searchInput.value.trim().toLowerCase();
        this.filterPosts(posts, q, tag);
      });

      // Keyboard shortcut hint
      Toast.info('按 Ctrl+K 快速搜索文章', 4000);
    });
  },

  getActiveTag() {
    const active = document.querySelector('.filter-tag.active');
    return active ? active.dataset.tag : 'all';
  },

  filterPosts(posts, query, tag) {
    let filtered = posts;
    if (tag && tag !== 'all') {
      filtered = filtered.filter(p => p.tags.includes(tag));
    }
    if (query) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    this.renderPosts(filtered);
  },

  renderPosts(posts) {
    const grid = document.getElementById('posts-grid');
    if (!posts.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-text">暂无匹配的文章</div>
        </div>`;
      return;
    }

    grid.innerHTML = posts.map((post, i) => `
      <article class="post-card ${post.featured && i === 0 ? 'featured' : ''} reveal reveal-delay-${Math.min(i, 5)}" onclick="Router.navigate('/post/${post.id}')">
        ${post.cover ? `<img class="post-card-cover" src="${post.cover}" alt="${Utils.escapeHtml(post.title)}" loading="lazy">` : `<div class="post-card-cover"></div>`}
        <div class="post-card-body">
          <div class="post-card-meta">
            <span class="post-card-category">${Utils.escapeHtml(post.category)}</span>
            <span><i class="ri-calendar-line"></i> ${Utils.formatDate(post.date)}</span>
          </div>
          <h2 class="post-card-title">${Utils.escapeHtml(post.title)}</h2>
          <p class="post-card-excerpt">${Utils.escapeHtml(post.excerpt || '点击阅读全文...')}</p>
          <div class="post-card-footer">
            <div class="post-card-tags">
              ${post.tags.slice(0, 3).map(t => `<span class="post-card-tag">${Utils.escapeHtml(t)}</span>`).join('')}
            </div>
            <span class="post-card-readmore">阅读 <i class="ri-arrow-right-s-line"></i></span>
          </div>
        </div>
      </article>
    `).join('');

    // Init effects for new cards
    FX.initScrollReveal(grid);
    FX.initTiltCards();
  },

  // ==========================================
  //  Post Detail Page
  // ==========================================
  async renderPost(id) {
    this.setActiveNav('');
    this.showLoading();
    FX.stopParticles();

    const post = POSTS.find(p => p.id === id);
    if (!post) return this.render404();

    const data = await this.loadPostContent(post);
    if (!data) return this.render404();

    const readingTime = Utils.readingTime(data.content);

    // Render markdown to HTML
    const htmlContent = marked.parse(data.content, { breaks: true, gfm: true });

    // Build TOC from headings
    const allHeadings = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.querySelectorAll('h2, h3').forEach(h => {
      if (!h.id) h.id = Utils.slugify(h.textContent);
      allHeadings.push({ level: h.tagName[1], id: h.id, text: h.textContent.trim() });
    });
    const finalHtml = tempDiv.innerHTML;

    // Prev/Next
    const sorted = POSTS.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const idx = sorted.findIndex(p => p.id === id);
    const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null;
    const next = idx > 0 ? sorted[idx - 1] : null;

    // Render directly — no async wrapper
    this.contentEl.innerHTML = `
      <div class="post-layout page-transition">
        <div>
          <header class="post-header">
            <span class="post-header-category">${Utils.escapeHtml(post.category)}</span>
            <h1 class="post-header-title">${Utils.escapeHtml(post.title)}</h1>
            <div class="post-header-meta">
              <span><i class="ri-calendar-line"></i> ${Utils.formatDate(post.date)}</span>
              <span><i class="ri-time-line"></i> ${readingTime} 分钟阅读</span>
              <span><i class="ri-eye-line"></i> ${Utils.relativeTime(post.date)}</span>
            </div>
            ${post.tags.length ? `
              <div class="post-header-tags">
                ${post.tags.map(t => `<span class="post-header-tag"><i class="ri-hashtag" style="font-size:0.7rem"></i> ${Utils.escapeHtml(t)}</span>`).join('')}
              </div>` : ''}
          </header>

          <article class="post-content" id="post-content">${finalHtml}</article>

          <nav class="post-nav">
            ${prev ? `
              <div class="post-nav-item prev" onclick="Router.navigate('/post/${prev.id}')">
                <div class="post-nav-label"><i class="ri-arrow-left-s-line"></i> 上一篇</div>
                <div class="post-nav-title">${Utils.escapeHtml(prev.title)}</div>
              </div>` : '<div></div>'}
            ${next ? `
              <div class="post-nav-item next" onclick="Router.navigate('/post/${next.id}')">
                <div class="post-nav-label">下一篇 <i class="ri-arrow-right-s-line"></i></div>
                <div class="post-nav-title">${Utils.escapeHtml(next.title)}</div>
              </div>` : '<div></div>'}
          </nav>
        </div>

        <aside class="toc-sidebar" id="toc-sidebar">
          ${allHeadings.length > 0 ? `
            <div class="toc-title">目录</div>
            <ul class="toc-list">
              ${allHeadings.map(h => `
                <li class="toc-${h.level === '3' ? 'h3' : 'h2'}">
                  <a href="javascript:void(0)" data-id="${h.id}">${Utils.escapeHtml(h.text)}</a>
                </li>`).join('')}
            </ul>` : ''}
        </aside>
      </div>
    `;

    // TOC click → smooth scroll
    document.querySelectorAll('#toc-sidebar a[data-id]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = document.getElementById(link.dataset.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.querySelectorAll('#toc-sidebar a').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
        return false;
      });
    });

    // Code highlight + copy
    document.querySelectorAll('#post-content pre code').forEach(block => {
      hljs.highlightElement(block);
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = '复制';
      btn.addEventListener('click', async () => {
        await Utils.copyToClipboard(block.textContent);
        btn.textContent = '已复制!';
        Toast.success('代码已复制');
        setTimeout(() => btn.textContent = '复制', 2000);
      });
      block.parentElement.style.position = 'relative';
      block.parentElement.appendChild(btn);
    });

    // TOC scroll spy
    this.initTocSpy(allHeadings);
    window.scrollTo({ top: 0 });
  },

  initTocSpy(headings) {
    if (!headings.length) return;
    const tocLinks = document.querySelectorAll('#toc-sidebar a[data-id]');
    if (!tocLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`#toc-sidebar a[data-id="${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-80px 0px -60% 0px' });

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
  },

  // ==========================================
  //  About Page
  // ==========================================
  renderAbout() {
    this.setActiveNav('#/about');

    this.transitionTo(() => {
      this.contentEl.innerHTML = `
        <div class="about-page">
          <div class="about-avatar reveal-scale"><i class="ri-user-smile-line"></i></div>
          <h1 class="about-name reveal">${Utils.escapeHtml(BLOG_CONFIG.author)}</h1>
          <p class="about-bio reveal reveal-delay-1">${Utils.escapeHtml(BLOG_CONFIG.subtitle)}</p>

          <div class="about-section reveal reveal-delay-2">
            <h2 class="about-section-title"><i class="ri-quill-pen-line"></i> 关于博客</h2>
            <p class="about-text">
              这是一个完全手写的静态博客，不依赖任何博客框架。使用纯 HTML、CSS 和 JavaScript 构建，
              托管在 GitHub Pages 上。文章以 Markdown 格式编写，通过客户端渲染展示。
            </p>
            <p class="about-text" style="margin-top:12px">
              设计理念：<strong>简洁、快速、专注内容</strong>。没有复杂的构建步骤，没有臃肿的依赖，
              只有干净的代码和纯粹的写作体验。
            </p>
          </div>

          <div class="about-section reveal reveal-delay-3">
            <h2 class="about-section-title"><i class="ri-code-s-slash-line"></i> 技术栈</h2>
            <div class="skills-grid">
              ${['HTML5', 'CSS3', 'JavaScript', 'Markdown', 'GitHub Pages', 'GitHub Actions', 'marked.js', 'highlight.js']
                .map((s, i) => `<span class="skill-badge reveal reveal-delay-${Math.min(i, 5)}">${s}</span>`).join('')}
            </div>
          </div>

          <div class="about-section reveal reveal-delay-4">
            <h2 class="about-section-title"><i class="ri-links-line"></i> 链接</h2>
            <div class="about-links">
              ${BLOG_CONFIG.social.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener" class="about-link">
                  <i class="${s.icon}"></i> ${Utils.escapeHtml(s.name)}
                </a>`).join('')}
            </div>
          </div>
        </div>
      `;
    });
  },

  // ==========================================
  //  Archive Page
  // ==========================================
  renderArchive() {
    this.setActiveNav('#/archive');

    this.transitionTo(() => {
      const posts = POSTS.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      const grouped = Utils.groupBy(posts, p => new Date(p.date).getFullYear());
      const years = Object.keys(grouped).sort((a, b) => b - a);

      this.contentEl.innerHTML = `
        <div class="about-page">
          <h1 class="about-name reveal" style="margin-bottom:8px"><i class="ri-archive-line" style="color:var(--accent)"></i> 文章归档</h1>
          <p class="about-bio reveal reveal-delay-1" style="margin-bottom:40px">共 ${posts.length} 篇文章</p>
          ${years.map((year, yi) => `
            <div class="about-section reveal reveal-delay-${Math.min(yi + 2, 5)}">
              <h2 class="about-section-title">${year} 年 <span style="color:var(--text-tertiary);font-weight:400;font-size:0.9rem">(${grouped[year].length} 篇)</span></h2>
              ${grouped[year].map(post => `
                <div class="archive-item" onclick="Router.navigate('/post/${post.id}')">
                  <span class="archive-item-date">${post.date.slice(5)}</span>
                  <span class="archive-item-title">${Utils.escapeHtml(post.title)}</span>
                  <span class="post-card-category">${Utils.escapeHtml(post.category)}</span>
                </div>`).join('')}
            </div>`).join('')}
        </div>
      `;
    });
  },

  // ==========================================
  //  404 Page
  // ==========================================
  render404() {
    this.setActiveNav('');

    this.transitionTo(() => {
      this.contentEl.innerHTML = `
        <div class="page-404">
          <div class="page-404-code reveal-scale">404</div>
          <p class="page-404-text reveal">迷路了？这个页面不存在。</p>
          <a href="#/" class="btn reveal reveal-delay-1"><i class="ri-home-line"></i> 回到首页</a>
        </div>`;
    });
  }
};

// ==========================================
//  Boot
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Configure marked
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
    headerPrefix: ''
  });

  const renderer = new marked.Renderer();
  renderer.heading = function (tokenOrText, level) {
    const text = typeof tokenOrText === 'object' ? tokenOrText.text : tokenOrText;
    const depth = typeof tokenOrText === 'object' ? tokenOrText.depth : level;
    const slug = Utils.slugify(text);
    return `<h${depth} id="${slug}">${text}</h${depth}>`;
  };
  marked.setOptions({ renderer });

  App.init();
});
