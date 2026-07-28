/**
 * BBLOG - Utility Functions
 */

const Utils = {
  /**
   * Format date: "2026-07-28" → "2026年7月28日"
   */
  formatDate(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}年${month}月${day}日`;
  },

  /**
   * Relative time: "3天前", "1个月前"
   */
  relativeTime(dateStr) {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months}个月前`;
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  },

  /**
   * Estimate reading time (Chinese ~400 chars/min, English ~200 words/min)
   */
  readingTime(text) {
    const chineseChars = (text.match(/[一-鿿]/g) || []).length;
    const englishWords = (text.replace(/[一-鿿]/g, '').match(/\b\w+\b/g) || []).length;
    const minutes = Math.ceil(chineseChars / 400 + englishWords / 200);
    return Math.max(1, minutes);
  },

  /**
   * Debounce function
   */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Escape HTML
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Extract plain text from markdown (for excerpts/search)
   */
  mdToText(md) {
    return md
      .replace(/^---[\s\S]*?---\n?/m, '') // front matter
      .replace(/#{1,6}\s+/g, '')           // headings
      .replace(/\*\*(.+?)\*\*/g, '$1')     // bold
      .replace(/\*(.+?)\*/g, '$1')          // italic
      .replace(/`{1,3}[^`]*`{1,3}/g, '')   // code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
      .replace(/[-*+]\s+/g, '')             // list markers
      .replace(/>\s+/g, '')                 // blockquotes
      .replace(/\n{2,}/g, '\n')             // multiple newlines
      .trim();
  },

  /**
   * Simple YAML front matter parser
   */
  parseFrontMatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return { meta: {}, content };

    const meta = {};
    const lines = match[1].split('\n');
    let currentKey = null;

    for (const line of lines) {
      const kvMatch = line.match(/^(\w+):\s*(.*)$/);
      if (kvMatch) {
        const [, key, value] = kvMatch;
        if (value.startsWith('[') && value.endsWith(']')) {
          // Array: [tag1, tag2]
          meta[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
        } else if (value === '' || value === undefined) {
          // Could be start of a multiline value or array
          currentKey = key;
          meta[key] = [];
        } else {
          meta[key] = value.replace(/^['"]|['"]$/g, '');
        }
      } else if (currentKey && line.trim().startsWith('- ')) {
        // YAML list item
        if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
        meta[currentKey].push(line.trim().replace(/^-\s+/, '').replace(/^['"]|['"]$/g, ''));
      }
    }

    return { meta, content: match[2].trim() };
  },

  /**
   * Generate a slug from title
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w一-鿿\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  /**
   * Get unique values from array of objects by key
   */
  uniqueBy(arr, key) {
    const seen = new Set();
    return arr.filter(item => {
      const val = typeof key === 'function' ? key(item) : item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  },

  /**
   * Group array by key
   */
  groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const val = typeof key === 'function' ? key(item) : item[key];
      (groups[val] = groups[val] || []).push(item);
      return groups;
    }, {});
  },

  /**
   * Local storage helpers
   */
  storage: {
    get(key, fallback = null) {
      try {
        const val = localStorage.getItem(`bblog_${key}`);
        return val ? JSON.parse(val) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`bblog_${key}`, JSON.stringify(value));
      } catch {}
    }
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  }
};
