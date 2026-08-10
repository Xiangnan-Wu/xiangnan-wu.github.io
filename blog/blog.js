(function () {
  'use strict';

  const BLOG = {
    manifest: 'posts/posts.json',
    postBase: 'posts/'
  };

  const state = {
    posts: [],
    activeTag: 'all',
    query: ''
  };

  const utils = {
    formatDate(value) {
      if (!value) return '';
      const date = new Date(value + 'T00:00:00');
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    readingTime(text) {
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      return `${Math.max(1, Math.ceil(words / 220))} min read`;
    },
    escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]);
    },
    resolvePostUrl(slug) {
      return `post.html?slug=${encodeURIComponent(slug)}`;
    }
  };

  async function loadManifest() {
    const response = await fetch(BLOG.manifest, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load ${BLOG.manifest}`);
    const data = await response.json();
    return [...data.posts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  function allTags(posts) {
    return [...new Set(posts.flatMap(post => post.tags || []))].sort((a, b) => a.localeCompare(b));
  }

  function renderTagButton(tag, label = tag) {
    const active = state.activeTag === tag ? ' active' : '';
    return `<button class="tag-chip${active}" type="button" data-tag="${utils.escapeHtml(tag)}">${utils.escapeHtml(label)}</button>`;
  }

  function renderFilters(posts) {
    const filters = document.getElementById('tagFilters');
    const cloud = document.getElementById('tagCloud');
    if (!filters || !cloud) return;
    const tags = allTags(posts);
    const html = [renderTagButton('all', 'All'), ...tags.map(tag => renderTagButton(tag))].join('');
    filters.innerHTML = html;
    cloud.innerHTML = tags.map(tag => renderTagButton(tag)).join('');
    document.querySelectorAll('[data-tag]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeTag = button.dataset.tag;
        renderIndex();
      });
    });
  }

  function matchesPost(post) {
    const tagMatch = state.activeTag === 'all' || (post.tags || []).includes(state.activeTag);
    const haystack = [post.title, post.summary, ...(post.tags || [])].join(' ').toLowerCase();
    return tagMatch && haystack.includes(state.query.toLowerCase());
  }

  function renderPostCard(post) {
    const tags = (post.tags || []).map(tag => `<span class="post-tag">${utils.escapeHtml(tag)}</span>`).join('');
    return `
      <a class="post-card" href="${utils.resolvePostUrl(post.slug)}">
        <h2 class="post-card-title">${utils.escapeHtml(post.title)}</h2>
        <div class="post-card-meta">
          <span>${utils.formatDate(post.date)}</span>
          <span>${utils.escapeHtml(post.readingTime || '')}</span>
        </div>
        <p class="post-card-summary">${utils.escapeHtml(post.summary || '')}</p>
        <div class="post-card-tags">${tags}</div>
      </a>
    `;
  }

  function renderIndex() {
    const list = document.getElementById('postList');
    if (!list) return;
    renderFilters(state.posts);
    const filtered = state.posts.filter(matchesPost);
    list.innerHTML = filtered.length
      ? filtered.map(renderPostCard).join('')
      : '<div class="empty-state">No posts match the current filter.</div>';
  }

  function bindIndexSearch() {
    const input = document.getElementById('blogSearch');
    if (!input) return;
    input.addEventListener('input', () => {
      state.query = input.value.trim();
      renderIndex();
    });
  }

  function parseFrontMatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!match) return { meta: {}, body: markdown };
    const meta = {};
    match[1].split('\n').forEach(line => {
      const separator = line.indexOf(':');
      if (separator === -1) return;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      }
      meta[key] = value;
    });
    return { meta, body: markdown.slice(match[0].length) };
  }

  function protectMath(markdown) {
    const blocks = [];
    const inline = [];
    let protectedText = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
      const token = `@@MATH_BLOCK_${blocks.length}@@`;
      blocks.push(match);
      return `\n\n<div class="math-display">${token}</div>\n\n`;
    });
    protectedText = protectedText.replace(/(^|[^\\$])\$([^\n$]+?)\$/g, (match, prefix) => {
      const token = `@@MATH_INLINE_${inline.length}@@`;
      inline.push(match.slice(prefix.length));
      return `${prefix}${token}`;
    });
    return { text: protectedText, blocks, inline };
  }

  function restoreMath(html, math) {
    let restored = html;
    math.blocks.forEach((value, index) => {
      restored = restored.replaceAll(`@@MATH_BLOCK_${index}@@`, value);
    });
    math.inline.forEach((value, index) => {
      restored = restored.replaceAll(`@@MATH_INLINE_${index}@@`, value);
    });
    return restored;
  }

  function configureMarked(markdownUrl) {
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: false,
      highlight(code, language) {
        if (!window.hljs) return code;
        if (language && hljs.getLanguage(language)) {
          return hljs.highlight(code, { language }).value;
        }
        return hljs.highlightAuto(code).value;
      }
    });

    const renderer = new marked.Renderer();
    const resolveAsset = href => {
      if (!href || /^(https?:|mailto:|#|\/)/.test(href)) return href;
      return new URL(href, new URL(markdownUrl, window.location.href)).pathname;
    };

    renderer.image = function (href, title, text) {
      const src = resolveAsset(href);
      const alt = utils.escapeHtml(text || '');
      const titleAttr = title ? ` title="${utils.escapeHtml(title)}"` : '';
      return `<img src="${utils.escapeHtml(src)}" alt="${alt}"${titleAttr}>`;
    };

    renderer.link = function (href, title, text) {
      const url = resolveAsset(href);
      const titleAttr = title ? ` title="${utils.escapeHtml(title)}"` : '';
      const external = /^(https?:)?\/\//.test(url) ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${utils.escapeHtml(url)}"${titleAttr}${external}>${text}</a>`;
    };

    return renderer;
  }

  function enhanceCallouts(container) {
    const labels = {
      note: 'Note',
      tip: 'Tip',
      important: 'Important',
      warning: 'Warning',
      caution: 'Caution'
    };

    container.querySelectorAll('blockquote').forEach(blockquote => {
      const first = blockquote.querySelector('p:first-child');
      if (!first) return;
      const text = first.textContent.trim();
      const match = text.match(/^\[!(note|tip|important|warning|caution)\][ \t]*([^\n]*)/i);
      if (!match) return;
      const type = match[1].toLowerCase();
      const title = match[2].trim() || labels[type];
      first.textContent = first.textContent.replace(/^\[![^\]]+\][ \t]*[^\n]*(\n)?/i, '').trimStart();
      if (!first.textContent.trim()) first.remove();
      blockquote.classList.add('callout', `callout-${type}`);
      const titleEl = document.createElement('div');
      titleEl.className = 'callout-title';
      titleEl.textContent = title;
      blockquote.prepend(titleEl);
    });
  }

  function slugifyHeading(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  function buildToc(container) {
    const toc = document.getElementById('postToc');
    const panel = document.getElementById('tocPanel');
    if (!toc || !panel) return;
    const headings = [...container.querySelectorAll('h2, h3')];
    if (!headings.length) {
      panel.style.display = 'none';
      return;
    }
    const seen = new Map();
    headings.forEach(heading => {
      const base = slugifyHeading(heading.textContent) || 'section';
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      heading.id = count ? `${base}-${count + 1}` : base;
    });
    toc.innerHTML = headings.map(heading => (
      `<a class="toc-${heading.tagName.toLowerCase()}" href="#${heading.id}">${utils.escapeHtml(heading.textContent)}</a>`
    )).join('');
    initTocSpy(headings, toc);
  }

  function initTocSpy(headings, toc) {
    const links = [...toc.querySelectorAll('a')];
    const setActive = id => {
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    };

    links.forEach(link => {
      link.addEventListener('click', () => {
        const id = link.getAttribute('href').slice(1);
        setActive(id);
      });
    });

    if (!('IntersectionObserver' in window)) {
      if (headings[0]) setActive(headings[0].id);
      return;
    }

    let currentId = headings[0]?.id;
    if (currentId) setActive(currentId);

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) {
        currentId = visible[0].target.id;
        setActive(currentId);
        return;
      }

      const passed = headings
        .filter(heading => heading.getBoundingClientRect().top < 110)
        .at(-1);
      if (passed && passed.id !== currentId) {
        currentId = passed.id;
        setActive(currentId);
      }
    }, { rootMargin: '-96px 0px -62% 0px', threshold: [0, 1] });

    headings.forEach(heading => observer.observe(heading));
  }

  async function renderPost() {
    const content = document.getElementById('postContent');
    const header = document.getElementById('postHeader');
    if (!content || !header) return;

    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) {
      header.innerHTML = '<p class="blog-kicker">Missing post</p><h1>No post selected</h1>';
      content.innerHTML = '<p class="empty-state">Open this page from the blog index.</p>';
      return;
    }

    const posts = await loadManifest();
    const manifestPost = posts.find(post => post.slug === slug);
    const markdownUrl = `${BLOG.postBase}${encodeURIComponent(slug)}.md`;
    const response = await fetch(markdownUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load ${markdownUrl}`);
    const markdown = await response.text();
    const parsed = parseFrontMatter(markdown);
    const meta = { ...manifestPost, ...parsed.meta };
    const tags = (meta.tags || []).map(tag => `<span class="post-tag">${utils.escapeHtml(tag)}</span>`).join('');

    document.title = `${meta.title || 'Blog Post'} | Xiangnan Wu`;
    header.innerHTML = `
      <p class="blog-kicker">Blog</p>
      <h1>${utils.escapeHtml(meta.title || 'Untitled')}</h1>
      <div class="post-meta">
        <span>${utils.formatDate(meta.date)}</span>
        <span>${utils.readingTime(parsed.body)}</span>
      </div>
      ${meta.summary ? `<p class="post-summary">${utils.escapeHtml(meta.summary)}</p>` : ''}
      <div class="post-tags">${tags}</div>
    `;

    const renderer = configureMarked(markdownUrl);
    const protectedMath = protectMath(parsed.body);
    const rawHtml = marked.parse(protectedMath.text, { renderer });
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel']
    });
    content.innerHTML = restoreMath(cleanHtml, protectedMath);
    enhanceCallouts(content);
    buildToc(content);
    content.querySelectorAll('pre code').forEach(block => {
      if (window.hljs) hljs.highlightElement(block);
    });
    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([content]);
    }
  }

  async function initIndex() {
    const list = document.getElementById('postList');
    if (!list) return;
    try {
      state.posts = await loadManifest();
      bindIndexSearch();
      renderIndex();
    } catch (error) {
      list.innerHTML = `<div class="empty-state">${utils.escapeHtml(error.message)}</div>`;
    }
  }

  async function initPost() {
    try {
      await renderPost();
    } catch (error) {
      const content = document.getElementById('postContent');
      const header = document.getElementById('postHeader');
      if (header) header.innerHTML = '<p class="blog-kicker">Error</p><h1>Post unavailable</h1>';
      if (content) content.innerHTML = `<p class="empty-state">${utils.escapeHtml(error.message)}</p>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initIndex();
      initPost();
    });
  } else {
    initIndex();
    initPost();
  }
})();
