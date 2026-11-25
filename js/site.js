// ==========================================================================
// Xiangnan Wu — Digital Hardcover Monograph Interactive Controller
// 设计风格：Notion《A New Shape for Work》数字精装书交互系统
// 包含：悬浮电子书章节胶囊同步与翻章、双栏精装书目录弹窗、原生 Scrollspy、
//       顶层过渡退出探测、BibTeX 内禀折叠抽屉与 View Transitions 论文筛选
// ==========================================================================

function bootEditorialSite() {
  initPolyfillsAndHeader();
  initTopLayerDialogs();
  initScrollspyAndChapterPill();
  initEmailCopy();
  initPublicationsModule();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootEditorialSite);
} else {
  bootEditorialSite();
}

// --------------------------------------------------------------------------
// 1. 按需特性检测加载 Invoker Commands Polyfill + 书眉向下滚动静默收起回退
// --------------------------------------------------------------------------
function initPolyfillsAndHeader() {
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    import('https://esm.run/invokers-polyfill').catch(() => {});

    // 离线或旧浏览器渐进回退：保障 commandfor / command 声明式弹窗按钮始终可用
    document.addEventListener('click', (event) => {
      if ('commandForElement' in HTMLButtonElement.prototype) return;
      const btn = event.target.closest('button[commandfor][command]');
      if (!btn) return;
      const target = document.getElementById(btn.getAttribute('commandfor') || '');
      const cmd = btn.getAttribute('command');
      if (!target) return;
      if (cmd === 'show-modal' && typeof target.showModal === 'function' && !target.open) {
        target.showModal();
      } else if (cmd === 'close' && typeof target.close === 'function' && target.open) {
        closeTopLayer(target);
      }
    });
  }

  const header = document.getElementById('site-header');
  if (header && !window.CSS?.supports?.('container-type', 'scroll-state')) {
    let lastY = window.scrollY;
    window.addEventListener(
      'scroll',
      () => {
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const y = Math.max(0, Math.min(window.scrollY, maxScroll));
        if (y === lastY) return;
        header.classList.toggle('is-hidden', y > lastY && y > header.offsetHeight);
        lastY = y;
      },
      { passive: true }
    );
  }

  // 兼容独立博客子页移动端导航折叠按钮
  const legacyToggle = document.querySelector('.navbar .mobile-menu-toggle');
  const legacyMenu = document.querySelector('.navbar .mobile-nav');
  if (legacyToggle && legacyMenu) {
    legacyToggle.addEventListener('click', () => {
      const willOpen = legacyMenu.hasAttribute('hidden');
      legacyMenu.toggleAttribute('hidden', !willOpen);
      legacyToggle.setAttribute('aria-expanded', String(willOpen));
    });
  }
}

// --------------------------------------------------------------------------
// 2. 顶层 <dialog> 离散退出动画探测与 Light-Dismiss 跨浏览器回退
// --------------------------------------------------------------------------
let supportsDisplayTransition;
function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

async function closeTopLayer(dialogEl) {
  if (!dialogEl || !dialogEl.open) return;
  if (!supportsTopLayerExit()) {
    dialogEl.setAttribute('data-closing', '');
    const animations = dialogEl.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 2000))
      ]);
    }
    if (!dialogEl.hasAttribute('data-closing')) return;
    dialogEl.removeAttribute('data-closing');
  }
  dialogEl.close();
  dialogEl.returnValue = '';
}

function initTopLayerDialogs() {
  const dialogs = document.querySelectorAll('dialog[closedby="any"]');
  const lacksClosedBy = !('closedBy' in HTMLDialogElement.prototype);

  dialogs.forEach((dialog) => {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(dialog);
    });

    // 在不支持 overlay 离散退出的浏览器中拦截关闭按钮以完整播放淡出动画
    dialog.querySelectorAll('button[command="close"]').forEach((closeBtn) => {
      closeBtn.addEventListener('click', (event) => {
        if (!supportsTopLayerExit()) {
          event.preventDefault();
          closeTopLayer(dialog);
        }
      });
    });

    if (lacksClosedBy) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        closeTopLayer(dialog);
      });
    }
  });

  // 点击双栏精装目录中的页内锚点后平滑关闭目录弹窗并滚动定位
  const params = new URLSearchParams(window.location.search);
  const jumpTarget = params.get('jump');
  if (jumpTarget) {
    document.getElementById(jumpTarget)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  const tocDialog = document.getElementById('toc-dialog');
  if (tocDialog) {
    if (params.get('toc') === '1' && !tocDialog.open) {
      tocDialog.showModal();
    }

    tocDialog.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const hash = anchor.getAttribute('href');
        const target = hash ? document.querySelector(hash) : null;
        if (!target) return;
        event.preventDefault();
        closeTopLayer(tocDialog).then(() => {
          const smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
          target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
          target.focus({ preventScroll: true });
          history.replaceState(null, '', hash);
        });
      });
    });
  }
}

// --------------------------------------------------------------------------
// 3. 原生 Scrollspy 与底部悬浮电子书章节胶囊 (<  ≡ 1.1 Title  >) 同步
// --------------------------------------------------------------------------
function initScrollspyAndChapterPill() {
  const navLinks = Array.from(document.querySelectorAll('#site-menu a[href^="#"]'));
  const mainChapters = Array.from(document.querySelectorAll('main .book-chapter[id]'));

  // 3.1 顶部书眉原生 scroll-target-group 与 IntersectionObserver 回退
  if (navLinks.length > 0 && mainChapters.length > 0) {
    if (window.CSS?.supports?.('scroll-target-group: auto')) {
      const syncAriaCurrent = () => {
        const currentLink = document.querySelector('#site-menu a:target-current');
        navLinks.forEach((link) => {
          link.setAttribute('aria-current', link === currentLink ? 'true' : 'false');
        });
      };
      syncAriaCurrent();
      document.addEventListener('scrollend', syncAriaCurrent, { passive: true });
    } else if ('IntersectionObserver' in window) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              navLinks.forEach((link) => {
                const isActive = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('target-current', isActive);
                link.setAttribute('aria-current', String(isActive));
              });
            }
          });
        },
        { rootMargin: '-40% 0px -52% 0px', threshold: 0 }
      );
      mainChapters.forEach((sec) => navObserver.observe(sec));
    }
  }

  // 3.2 底部悬浮胶囊章节序列（支持一级大章与论文子章精细定位）
  const pillLabel = document.getElementById('pill-current-label');
  const pillTocBtn = document.getElementById('pill-toc-btn');
  const prevBtn = document.getElementById('pill-prev-btn');
  const nextBtn = document.getElementById('pill-next-btn');
  const tocLinks = Array.from(document.querySelectorAll('.toc-entry-link[data-toc-target]'));

  if (!pillLabel || !prevBtn || !nextBtn || mainChapters.length === 0) return;

  const stops = [
    { id: 'about', num: '1.1', title: 'Xiangnan Wu' },
    { id: 'focus', num: '2.1', title: 'Research Focus' },
    { id: 'pub-conference', num: '3.1', title: 'Conference & Journal' },
    { id: 'pub-preprint', num: '3.2', title: 'Preprints & Reports' },
    { id: 'pub-opensource', num: '3.3', title: 'Open-Source Systems' },
    { id: 'news', num: '4.1', title: 'Recent News' },
    { id: 'experience', num: '5.1', title: 'Experience' },
    { id: 'awards', num: '6.1', title: 'Honors & Awards' }
  ].filter((stop) => {
    const el = document.getElementById(stop.id);
    return Boolean(el);
  });

  let activeIndex = 0;

  function getVisibleStops() {
    return stops.filter((stop) => {
      const el = document.getElementById(stop.id);
      return el && !el.hidden;
    });
  }

  function renderPillState(stopList, idx) {
    const clampedIdx = Math.max(0, Math.min(idx, stopList.length - 1));
    const current = stopList[clampedIdx];
    if (!current) return;

    const text = `${current.num} ${current.title}`;
    pillLabel.textContent = text;
    pillTocBtn?.setAttribute('aria-label', `Open table of contents — current section: ${text}`);

    prevBtn.setAttribute('aria-disabled', String(clampedIdx === 0));
    nextBtn.setAttribute('aria-disabled', String(clampedIdx >= stopList.length - 1));

    tocLinks.forEach((link) => {
      const matches = link.getAttribute('data-toc-target') === current.id;
      link.classList.toggle('is-active', matches);
      if (matches) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateCurrentStopOnScroll() {
    const visibleStops = getVisibleStops();
    if (visibleStops.length === 0) return;

    const probeLine = window.innerHeight * 0.34;
    let chosen = 0;

    // 若已滚至页面底部，直接定位最后一章
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
    if (atBottom) {
      chosen = visibleStops.length - 1;
    } else {
      for (let i = 0; i < visibleStops.length; i += 1) {
        const el = document.getElementById(visibleStops[i].id);
        if (el && el.getBoundingClientRect().top <= probeLine) {
          chosen = i;
        }
      }
    }

    activeIndex = chosen;
    renderPillState(visibleStops, activeIndex);
  }

  function stepChapter(delta) {
    const visibleStops = getVisibleStops();
    const nextIdx = activeIndex + delta;
    if (nextIdx < 0 || nextIdx >= visibleStops.length) return;
    const target = document.getElementById(visibleStops[nextIdx].id);
    if (!target) return;

    activeIndex = nextIdx;
    renderPillState(visibleStops, activeIndex);
    const smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    target.focus({ preventScroll: true });
  }

  prevBtn.addEventListener('click', () => {
    if (prevBtn.getAttribute('aria-disabled') === 'true') return;
    stepChapter(-1);
  });

  nextBtn.addEventListener('click', () => {
    if (nextBtn.getAttribute('aria-disabled') === 'true') return;
    stepChapter(1);
  });

  window.addEventListener('scroll', updateCurrentStopOnScroll, { passive: true });
  window.addEventListener('resize', updateCurrentStopOnScroll);
  updateCurrentStopOnScroll();
}

// --------------------------------------------------------------------------
// 4. 邮箱一键复制反馈
// --------------------------------------------------------------------------
function initEmailCopy() {
  const btn = document.querySelector('.copy-email-btn');
  if (!btn) return;

  const statusEl = btn.querySelector('.copy-status');
  let timer = null;

  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email') || 'xiangnanwu.cs@gmail.com';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      }
    } catch (e) {}

    if (statusEl) statusEl.textContent = 'Copied ✓';
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (statusEl) statusEl.textContent = 'Copy';
    }, 1800);
  });
}

// --------------------------------------------------------------------------
// 5. 论文归档模块：原生 <details> BibTeX、高清插图检视与 View Transitions 筛选
// --------------------------------------------------------------------------
function initPublicationsModule() {
  const searchInput = document.getElementById('pub-search-input');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const categories = Array.from(document.querySelectorAll('.publication-category'));
  const items = Array.from(document.querySelectorAll('.publication-item'));
  const emptyState = document.getElementById('publication-empty');

  if (items.length === 0) return;

  // 5.1 注入原生 <details>/<summary> BibTeX 引用抽屉
  items.forEach((item, idx) => {
    const bibtex = item.getAttribute('data-bibtex');
    const linksBar = item.querySelector('.publication-links');
    const body = item.querySelector('.publication-body');
    if (!bibtex || !body) return;

    const details = document.createElement('details');
    details.className = 'bibtex-details';

    const summary = document.createElement('summary');
    summary.className = 'bibtex-summary';
    summary.textContent = 'BibTeX';

    const captionId = `bibtex-label-${idx + 1}`;
    const drawer = document.createElement('div');
    drawer.className = 'bibtex-drawer';
    drawer.innerHTML = `
      <div class="bibtex-bar">
        <span id="${captionId}">BibTeX Citation</span>
        <button type="button" class="bibtex-copy-btn">Copy</button>
      </div>
      <pre class="bibtex-pre" role="region" aria-labelledby="${captionId}" tabindex="0"><code></code></pre>
    `;
    drawer.querySelector('code').textContent = bibtex;

    details.appendChild(summary);
    details.appendChild(drawer);
    if (linksBar) {
      linksBar.insertAdjacentElement('afterend', details);
    } else {
      body.appendChild(details);
    }

    const copyBtn = drawer.querySelector('.bibtex-copy-btn');
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(bibtex);
        }
      } catch (e) {}
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1600);
    });
  });

  // 5.2 插图原尺寸灯箱检视
  const lightbox = document.getElementById('pub-lightbox');
  const lightboxImg = document.getElementById('pub-lightbox-img');
  const lightboxTitle = document.getElementById('pub-lightbox-title');

  if (lightbox && lightboxImg && lightboxTitle) {
    items.forEach((item) => {
      const thumbLink = item.querySelector('.publication-image');
      const img = thumbLink?.querySelector('img');
      const titleEl = item.querySelector('.publication-title');
      if (!thumbLink || !img) return;

      const paperTitle = titleEl ? titleEl.textContent.trim() : 'Figure preview';
      const zoomBtn = document.createElement('button');
      zoomBtn.type = 'button';
      zoomBtn.className = 'pub-zoom-btn';
      zoomBtn.setAttribute('aria-label', `Zoom figure for ${paperTitle}`);
      zoomBtn.textContent = 'Zoom';
      thumbLink.appendChild(zoomBtn);

      zoomBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        lightboxImg.src = img.getAttribute('src') || '';
        lightboxImg.alt = img.getAttribute('alt') || '';
        lightboxTitle.textContent = paperTitle;
        lightbox.showModal();
      });
    });
  }

  // 5.3 类别筛选与实时关键词检索
  let activeFilter = 'all';

  function applyVisibility() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleTotal = 0;

    categories.forEach((cat) => {
      const catType = cat.getAttribute('data-category');
      const matchesCat = activeFilter === 'all' || activeFilter === catType;
      const catItems = Array.from(cat.querySelectorAll('.publication-item'));
      let catVisible = 0;

      catItems.forEach((item) => {
        const matchesQuery = !query || item.textContent.toLowerCase().includes(query);
        const visible = matchesCat && matchesQuery;
        item.hidden = !visible;
        if (visible) {
          catVisible += 1;
          visibleTotal += 1;
        }
      });

      cat.hidden = catVisible === 0;
    });

    if (emptyState) {
      emptyState.hidden = visibleTotal > 0;
    }

    window.dispatchEvent(new Event('scroll'));
  }

  function updateFilterView(withTransition) {
    if (
      withTransition &&
      document.startViewTransition &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    ) {
      document.startViewTransition(() => applyVisibility());
    } else {
      applyVisibility();
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-filter') || 'all';
      if (next === activeFilter) return;
      activeFilter = next;
      filterBtns.forEach((b) => {
        const isCur = b === btn;
        b.classList.toggle('active', isCur);
        b.setAttribute('aria-pressed', String(isCur));
      });
      updateFilterView(true);
    });
  });

  searchInput?.addEventListener('input', () => updateFilterView(false));

  document.addEventListener('keydown', (event) => {
    if (!searchInput) return;
    const tag = document.activeElement?.tagName;
    if (event.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      searchInput.focus();
    } else if (event.key === 'Escape' && document.activeElement === searchInput && searchInput.value) {
      searchInput.value = '';
      updateFilterView(false);
      searchInput.blur();
    }
  });
}
