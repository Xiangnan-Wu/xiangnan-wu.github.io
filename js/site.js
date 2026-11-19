// ==========================================================================
// Xiangnan Wu — Archival Prepress & CAD Registration Interactive Engine
// 艺术指导灵感：Elfilter (@elfilter_a) — 点刻琥珀光学透镜阵 × 松烟墨枯笔色块 ×
//              朱红激光十字准星 × 复古 Win98 检视窗同步筛选 × 钢笔签名描边动画
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initGsapPrepressMotion();
  initResponsiveHeader();
  initHexCursorReadout();
  initScrollspy();
  initScrollProgressFallback();
  initEmailCopy();
  initPublicationsModule();
});

// 1. GSAP 印前丝网色带刮印、图版错落入场与页脚钢笔签名书写动画
function initGsapPrepressMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof window.gsap === 'undefined') return;

  const strips = document.querySelectorAll('.riso-strip');
  if (strips.length > 0) {
    window.gsap.fromTo(
      strips,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 0.75,
        stagger: 0.08,
        ease: 'expo.out',
        lazy: false,
        clearProps: 'transform'
      }
    );
  }

  const plates = document.querySelectorAll('.gs-plate');
  if (plates.length > 0) {
    window.gsap.fromTo(
      plates,
      { opacity: 0.01, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.025,
        ease: 'expo.out',
        lazy: false,
        clearProps: 'transform,opacity'
      }
    );
  }

  // 页脚书法签名进入视口时触发钢笔描边动画（初始保持可见回退，进入视口时重演书写笔触）
  const sigPath = document.getElementById('signature-path');
  if (sigPath && typeof sigPath.getTotalLength === 'function' && 'IntersectionObserver' in window) {
    const len = sigPath.getTotalLength();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.gsap.fromTo(
              sigPath,
              { strokeDasharray: len, strokeDashoffset: len },
              { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out', clearProps: 'strokeDasharray,strokeDashoffset' }
            );
            io.disconnect();
          }
        });
      },
      { threshold: 0.05 }
    );
    io.observe(sigPath);
  }
}

// 2. 单导航树自适应测量 + Popover 折叠工具窗 + 向下滚动收起顶栏回退
function initResponsiveHeader() {
  if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
    import('https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js').catch(() => {});
  }

  const header = document.getElementById('site-header');
  const inner = header?.querySelector('.header-inner');
  const menuBtn = header?.querySelector('.menu-button');
  const siteMenu = document.getElementById('site-menu');

  if (header && inner && menuBtn && siteMenu) {
    let lastHeaderWidth = header.clientWidth;
    let isWideState = true;

    function syncHeaderLayout() {
      const wasOpen = siteMenu.matches(':is(:popover-open, .\\:popover-open)');
      header.classList.add('is-measuring', 'is-wide');
      siteMenu.removeAttribute('popover');

      const fitsInline = inner.scrollWidth <= inner.clientWidth;
      isWideState = fitsInline;
      header.classList.toggle('is-wide', fitsInline);

      if (!fitsInline) {
        siteMenu.setAttribute('popover', 'auto');
        if (wasOpen && typeof siteMenu.showPopover === 'function') {
          try {
            siteMenu.showPopover();
          } catch (e) {}
        }
      }

      lastHeaderWidth = header.clientWidth;
      requestAnimationFrame(() => {
        header.classList.remove('is-measuring');
      });
    }

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        if (isWideState || header.clientWidth > lastHeaderWidth) {
          syncHeaderLayout();
        } else {
          lastHeaderWidth = header.clientWidth;
        }
      });
      ro.observe(header);
      ro.observe(siteMenu);
    }

    syncHeaderLayout();

    siteMenu.addEventListener('beforetoggle', (event) => {
      if (event.newState === 'open' && !window.CSS?.supports?.('inset-block-start', 'anchor(--menu-button bottom)')) {
        const rect = menuBtn.getBoundingClientRect();
        siteMenu.style.insetBlockStart = `${Math.round(rect.bottom + 6)}px`;
        siteMenu.style.insetInlineEnd = `${Math.max(12, Math.round(window.innerWidth - rect.right))}px`;
      }
    });

    siteMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (!isWideState && typeof siteMenu.hidePopover === 'function' && siteMenu.matches(':is(:popover-open, .\\:popover-open)')) {
          siteMenu.hidePopover();
        }
      });
    });

    if (!window.CSS?.supports?.('container-type', 'scroll-state')) {
      let lastY = window.scrollY;
      window.addEventListener(
        'scroll',
        () => {
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          const y = Math.max(0, Math.min(window.scrollY, maxScroll));
          if (y === lastY) return;
          header.classList.toggle('is-hidden', y > lastY && y > header.offsetHeight * 1.6);
          lastY = y;
        },
        { passive: true }
      );
    }
  }

  // 兼容独立博客子页移动端按钮
  const legacyToggle = document.querySelector('.navbar .mobile-menu-toggle:not([popovertarget])');
  const legacyMenu = document.querySelector('.navbar .mobile-nav');
  if (legacyToggle && legacyMenu) {
    legacyToggle.addEventListener('click', () => {
      const open = legacyMenu.hasAttribute('hidden');
      legacyMenu.toggleAttribute('hidden', !open);
      legacyToggle.setAttribute('aria-expanded', String(open));
    });
  }
}

// 3. 顶部十六进制光标坐标实时读数器
function initHexCursorReadout() {
  const el = document.getElementById('hex-cursor');
  if (!el) return;

  window.addEventListener(
    'pointermove',
    (e) => {
      const hx = Math.max(0, Math.round(e.clientX)).toString(16).toUpperCase().padStart(4, '0');
      const hy = Math.max(0, Math.round(e.clientY + window.scrollY)).toString(16).toUpperCase().padStart(4, '0');
      el.textContent = `<0x${hx}, 0x${hy}>`;
    },
    { passive: true }
  );
}

// 4. 原生 Scrollspy (scroll-target-group) 与 IntersectionObserver 回退
function initScrollspy() {
  const navLinks = Array.from(document.querySelectorAll('#site-menu a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('main [id][tabindex="-1"]'));
  if (navLinks.length === 0 || sections.length === 0) return;

  if (window.CSS?.supports?.('scroll-target-group: auto')) {
    const syncAriaCurrent = () => {
      const currentLink = document.querySelector('#site-menu a:target-current');
      navLinks.forEach((link) => {
        link.setAttribute('aria-current', link === currentLink ? 'true' : 'false');
      });
    };
    syncAriaCurrent();
    document.addEventListener('scrollend', syncAriaCurrent, { passive: true });
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
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
      { rootMargin: '-38% 0px -52% 0px', threshold: 0 }
    );
    sections.forEach((sec) => observer.observe(sec));
  }
}

// 5. 滚动进度条 JS 回退
function initScrollProgressFallback() {
  if (window.CSS?.supports?.('animation-timeline', 'scroll()')) return;

  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// 6. 邮箱复制反馈
function initEmailCopy() {
  const btn = document.querySelector('.copy-email-btn');
  if (!btn) return;

  const tagEl = btn.querySelector('.copy-tag');
  let timer = null;

  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email') || 'xiangnanwu.cs@gmail.com';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      }
    } catch (e) {}

    btn.classList.add('is-copied');
    if (tagEl) tagEl.textContent = 'COPIED ✓';

    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('is-copied');
      if (tagEl) tagEl.textContent = 'COPY';
    }, 1800);
  });
}

// ==========================================================================
// 8. TOP-LAYER EXIT TRANSITION PROBE & PUBLICATIONS MODULE
// ==========================================================================
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
}

function initPublicationsModule() {
  const searchInput = document.querySelector('#publications .search-input');
  const toolbarBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const winBtns = Array.from(document.querySelectorAll('.win-filter-btn'));
  const categories = Array.from(document.querySelectorAll('.publication-category'));
  const items = Array.from(document.querySelectorAll('.publication-item'));
  const emptyState = document.getElementById('publication-empty');

  if (items.length === 0) return;

  // 注入原生 <details>/<summary> BibTeX 折叠抽屉
  items.forEach((item) => {
    const bibtex = item.getAttribute('data-bibtex');
    const body = item.querySelector('.publication-body');
    if (!bibtex || !body) return;

    const details = document.createElement('details');
    details.className = 'bibtex-details';

    const summary = document.createElement('summary');
    summary.className = 'bibtex-summary';
    summary.textContent = 'BibTeX';

    const drawer = document.createElement('div');
    drawer.className = 'bibtex-drawer';
    drawer.innerHTML = `
      <div class="bibtex-bar">
        <span>BIBTEX // CITATION</span>
        <button type="button" class="bibtex-copy-btn">COPY</button>
      </div>
      <pre class="bibtex-pre"></pre>
    `;
    drawer.querySelector('.bibtex-pre').textContent = bibtex;

    details.appendChild(summary);
    details.appendChild(drawer);
    body.appendChild(details);

    const copyBtn = drawer.querySelector('.bibtex-copy-btn');
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(bibtex);
        }
      } catch (e) {}
      copyBtn.textContent = 'COPIED ✓';
      setTimeout(() => {
        copyBtn.textContent = 'COPY';
      }, 1600);
    });
  });

  // 原生 <dialog closedby="any"> 高清图版检视器
  const lightbox = document.getElementById('pub-lightbox');
  const lightboxImg = document.getElementById('pub-lightbox-img');
  const lightboxTitle = document.getElementById('pub-lightbox-title');
  const lightboxClose = document.getElementById('pub-lightbox-close');

  if (lightbox && lightboxImg && lightboxTitle) {
    lightbox.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(lightbox);
    });

    lightboxClose?.addEventListener('click', (event) => {
      event.preventDefault();
      closeTopLayer(lightbox);
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      lightbox.addEventListener('click', (event) => {
        if (event.target !== lightbox) return;
        const rect = lightbox.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        closeTopLayer(lightbox);
      });
    }

    items.forEach((item) => {
      const thumbLink = item.querySelector('.publication-image');
      const img = thumbLink?.querySelector('img');
      const titleEl = item.querySelector('.publication-title');
      if (!thumbLink || !img) return;

      const zoomBtn = document.createElement('button');
      zoomBtn.type = 'button';
      zoomBtn.className = 'pub-zoom-badge';
      zoomBtn.title = 'Inspect figure plate';
      zoomBtn.setAttribute('aria-label', 'Inspect figure in high resolution');
      zoomBtn.textContent = '⤢';
      thumbLink.appendChild(zoomBtn);

      zoomBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        lightboxImg.src = img.getAttribute('src') || '';
        lightboxImg.alt = img.getAttribute('alt') || '';
        lightboxTitle.textContent = titleEl ? titleEl.textContent.trim() : 'FIGURE PLATE PREVIEW';
        lightbox.showModal();
      });
    });
  }

  // 同步左侧 Win98 检视窗与主工具条的筛选状态 + View Transitions
  let activeFilter = 'all';

  function syncFilterButtons(nextFilter) {
    toolbarBtns.forEach((btn) => {
      const isCur = btn.getAttribute('data-filter') === nextFilter;
      btn.classList.toggle('active', isCur);
      btn.setAttribute('aria-pressed', String(isCur));
    });

    winBtns.forEach((btn) => {
      const isCur = btn.getAttribute('data-filter') === nextFilter;
      btn.classList.toggle('active', isCur);
      btn.setAttribute('aria-pressed', String(isCur));
      const check = btn.querySelector('.win-check');
      if (check) check.textContent = isCur ? '■' : '□';
    });
  }

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

  function selectFilter(nextFilter, scrollIfFromRail) {
    if (nextFilter === activeFilter) return;
    activeFilter = nextFilter;
    syncFilterButtons(nextFilter);
    updateFilterView(true);
    if (scrollIfFromRail) {
      document.getElementById('publications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toolbarBtns.forEach((btn) => {
    btn.addEventListener('click', () => selectFilter(btn.getAttribute('data-filter') || 'all', false));
  });

  winBtns.forEach((btn) => {
    btn.addEventListener('click', () => selectFilter(btn.getAttribute('data-filter') || 'all', true));
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
