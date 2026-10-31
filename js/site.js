// ==========================================================================
// Xiangnan Wu — Panoramic Bento Console & Research Atlas Interactive Script
// 包含：亮暗主题切换、双核耦合拓扑 (Multimodal ⇄ Embodied) Canvas 引擎、
// Focus 01/02 联动、论文多维筛选/检索/BibTeX 抽屉/大图 Lightbox、邮箱复制与滚动进度
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js-ready');
  initThemeToggle();
  initMobileNavigation();
  initScrollProgress();
  initActiveSectionLinks();
  initRevealAnimations();
  initEmailCopy();

  // 初始化论文检索与多维筛选控制器，并返回外部联动接口
  const pubController = initPublicationsEnhancements();

  // 初始化双核耦合拓扑 Canvas 与 Focus 01 / 02 卡片交互
  initCoupledTopologyCanvas(pubController);
});

// 1. 亮色 (#e8efef) / 深色 (#0b1112) 主题切换
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0b1112' : '#e8efef');
    }
    try {
      localStorage.setItem('xw-theme', theme);
    } catch (e) {}
  }

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

// 2. 移动端导航菜单切换
function initMobileNavigation() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-navigation');

  if (!toggle || !mobileNav) return;

  function setMenuOpen(isOpen) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? 'Close' : 'Menu';
    mobileNav.hidden = !isOpen;
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 780) setMenuOpen(false);
  });
}

// 3. 顶部阅读滚动进度条
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  function update() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    bar.style.transform = `scaleX(${progress})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// 4. 导航栏当前章节滚动高亮
function initActiveSectionLinks() {
  const navLinks = Array.from(document.querySelectorAll('.navbar-nav .nav-link[href^="#"]'));
  const sectionIds = Array.from(new Set(navLinks.map((l) => l.getAttribute('href').slice(1))));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  if (sections.length === 0) return;

  function updateOnScroll() {
    const triggerLine = window.scrollY + 140;
    let currentId = sections[0].id;
    sections.forEach((sec) => {
      if (sec.offsetTop <= triggerLine) {
        currentId = sec.id;
      }
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  updateOnScroll();
}

// 5. 区块渐入动画 (IntersectionObserver)
function initRevealAnimations() {
  const items = Array.from(document.querySelectorAll('.reveal-item'));
  if (items.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.04, rootMargin: '0px 0px -24px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

// 6. 邮箱芯片一键复制反馈
function initEmailCopy() {
  const btn = document.querySelector('.copy-email-btn');
  if (!btn) return;

  const labelEl = btn.querySelector('.copy-email-label');
  const tagEl = btn.querySelector('.chip-tag');
  let timer = null;

  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email') || 'xiangnanwu.cs@gmail.com';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      }
    } catch (e) {}

    btn.classList.add('is-copied');
    if (tagEl) tagEl.textContent = 'COPIED ✓';

    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('is-copied');
      if (tagEl) tagEl.textContent = 'COPY';
      if (labelEl) labelEl.textContent = email;
    }, 1800);
  });
}

// 7. 双核耦合拓扑工作台 (01 Multimodal Understanding ⇄ 02 Embodied Intelligence)
function initCoupledTopologyCanvas(pubController) {
  const canvas = document.getElementById('topology-canvas');
  const wrap = document.getElementById('topology-wrap');
  const readoutEl = document.getElementById('topology-readout');
  const formulaEl = document.getElementById('stage-formula-code');
  const focusCards = Array.from(document.querySelectorAll('.focus-card'));

  if (!canvas || !wrap) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let activeFocus = 'dual'; // 'dual' | 'multimodal' | 'embodied'
  let pointerX = 0;
  let pointerY = 0;
  let tick = 0;

  // 预生成左侧多模态表征空间节点簇 (3D Token Lattice)
  const mmNodes = Array.from({ length: 14 }, (_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / 14);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    return {
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi)
    };
  });

  function resize() {
    const rect = wrap.getBoundingClientRect();
    width = Math.max(240, Math.floor(rect.width));
    height = Math.max(180, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  });

  wrap.addEventListener('mouseleave', () => {
    pointerX = 0;
    pointerY = 0;
  });

  function setFocusMode(mode) {
    activeFocus = mode;
    focusCards.forEach((card) => {
      const cardMode = card.getAttribute('data-focus');
      const isSelected = cardMode === mode;
      card.classList.toggle('is-active', isSelected);
      card.setAttribute('aria-pressed', String(isSelected));
    });

    if (readoutEl) {
      if (mode === 'multimodal') {
        readoutEl.textContent = 'FOCUS 01 // MULTIMODAL';
      } else if (mode === 'embodied') {
        readoutEl.textContent = 'FOCUS 02 // EMBODIED AI';
      } else {
        readoutEl.textContent = 'MODE: DUAL-CORE SYNC';
      }
    }
  }

  focusCards.forEach((card) => {
    const cardMode = card.getAttribute('data-focus');
    card.addEventListener('mouseenter', () => setFocusMode(cardMode, false));
    card.addEventListener('mouseleave', () => setFocusMode('dual', false));
    card.addEventListener('click', () => {
      const next = activeFocus === cardMode ? 'dual' : cardMode;
      setFocusMode(next, true);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const next = activeFocus === cardMode ? 'dual' : cardMode;
        setFocusMode(next, true);
      }
    });
  });

  function drawFrame() {
    tick += 0.018;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const mmColor = isDark ? '#38bdf8' : '#0284c7';
    const embColor = isDark ? '#2dd4bf' : '#0f766e';
    const faintLine = isDark ? 'rgba(226, 238, 238, 0.14)' : 'rgba(12, 22, 24, 0.13)';
    const nodeFill = isDark ? '#eaf2f2' : '#0f181a';

    ctx.clearRect(0, 0, width, height);

    const leftX = width * 0.25 + pointerX * 8;
    const rightX = width * 0.75 + pointerX * 8;
    const centerY = height * 0.44 + pointerY * 6;
    const radius = Math.min(width * 0.16, height * 0.28, 52);

    const mmAlpha = activeFocus === 'embodied' ? 0.38 : 1;
    const embAlpha = activeFocus === 'multimodal' ? 0.38 : 1;

    // 1. 绘制中央双向耦合桥 (Bidirectional Coupling Bridge: Multimodal ⇄ Embodied)
    ctx.save();
    for (let b = -1; b <= 1; b++) {
      const curveOffset = b * 24;
      ctx.beginPath();
      ctx.moveTo(leftX + radius * 0.7, centerY + b * 6);
      ctx.quadraticCurveTo(
        width * 0.5,
        centerY + curveOffset + Math.sin(tick + b) * 5,
        rightX - radius * 0.7,
        centerY + b * 6
      );
      ctx.strokeStyle = b === 0 ? embColor : faintLine;
      ctx.lineWidth = b === 0 ? 1.5 : 1;
      ctx.setLineDash(b === 0 ? [] : [3, 3]);
      ctx.stroke();

      // 沿耦合桥传输的双向脉冲粒子
      const pT = (tick * 0.55 + (b + 1) * 0.33) % 1;
      const t = b === -1 ? 1 - pT : pT;
      const sx = leftX + radius * 0.7;
      const ex = rightX - radius * 0.7;
      const cx = width * 0.5;
      const sy = centerY + b * 6;
      const cy = centerY + curveOffset + Math.sin(tick + b) * 5;
      const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex;
      const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * sy;

      ctx.beginPath();
      ctx.arc(px, py, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = b === -1 ? mmColor : embColor;
      ctx.fill();
    }
    ctx.restore();

    // 2. 绘制左半球：01 Multimodal Understanding (3D Token Attention Sphere)
    ctx.save();
    ctx.globalAlpha = mmAlpha;
    ctx.beginPath();
    ctx.arc(leftX, centerY, radius * 1.12, 0, Math.PI * 2);
    ctx.strokeStyle = faintLine;
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    const projectedMM = mmNodes.map((n) => {
      const rot = tick * 0.7 + pointerX * 0.6;
      const rx = n.x * Math.cos(rot) - n.z * Math.sin(rot);
      const rz = n.x * Math.sin(rot) + n.z * Math.cos(rot);
      const scale = 1 / (2.2 - rz * 0.45);
      return {
        x: leftX + rx * radius * 1.55 * scale,
        y: centerY + n.y * radius * 1.55 * scale,
        z: rz
      };
    });

    // 绘制多模态节点注意力连线
    ctx.lineWidth = 0.85;
    ctx.strokeStyle = mmColor;
    for (let i = 0; i < projectedMM.length; i++) {
      for (let j = i + 1; j < projectedMM.length; j++) {
        const dx = projectedMM[i].x - projectedMM[j].x;
        const dy = projectedMM[i].y - projectedMM[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius * 0.95) {
          ctx.globalAlpha = mmAlpha * 0.28;
          ctx.beginPath();
          ctx.moveTo(projectedMM[i].x, projectedMM[i].y);
          ctx.lineTo(projectedMM[j].x, projectedMM[j].y);
          ctx.stroke();
        }
      }
    }

    projectedMM.forEach((pt, idx) => {
      ctx.globalAlpha = mmAlpha * (pt.z > 0 ? 0.95 : 0.45);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, idx % 4 === 0 ? 3.1 : 2.1, 0, Math.PI * 2);
      ctx.fillStyle = idx % 4 === 0 ? mmColor : nodeFill;
      ctx.fill();
    });
    ctx.restore();

    // 3. 绘制右半球：02 Embodied Intelligence (3D World Lattice & Action Rollouts)
    ctx.save();
    ctx.globalAlpha = embAlpha;

    // 底部等轴测世界状态平面网格
    const gridW = radius * 1.15;
    const gridH = radius * 0.45;
    const baseY = centerY + radius * 0.52;
    ctx.strokeStyle = faintLine;
    ctx.lineWidth = 0.85;

    for (let g = -3; g <= 3; g++) {
      const t = g / 3;
      ctx.beginPath();
      ctx.moveTo(rightX + t * gridW - gridW * 0.35, baseY - gridH);
      ctx.lineTo(rightX + t * gridW + gridW * 0.35, baseY + gridH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightX - gridW, baseY + t * gridH);
      ctx.lineTo(rightX + gridW, baseY + t * gridH);
      ctx.stroke();
    }

    // 三条动作策略 Rollout 轨迹曲线 + 末端 6-DoF 目标位姿框
    const rollouts = [
      { h: -radius * 0.85, endX: rightX + radius * 0.72, endY: centerY - radius * 0.28, optimal: true },
      { h: -radius * 0.45, endX: rightX + radius * 0.58, endY: centerY - radius * 0.55, optimal: false },
      { h: -radius * 0.25, endX: rightX + radius * 0.65, endY: centerY + radius * 0.08, optimal: false }
    ];

    const startX = rightX - radius * 0.75;
    const startY = baseY + 4;

    rollouts.forEach((r) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(
        rightX - radius * 0.05,
        centerY + r.h + Math.sin(tick * 1.2) * 4,
        r.endX,
        r.endY
      );
      if (r.optimal) {
        ctx.setLineDash([]);
        ctx.strokeStyle = embColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 目标 6-DoF 机械臂夹爪位姿框
        ctx.strokeRect(r.endX - 5.5, r.endY - 5.5, 11, 11);
        ctx.beginPath();
        ctx.arc(r.endX, r.endY, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = embColor;
        ctx.fill();
      } else {
        ctx.setLineDash([2.5, 2.5]);
        ctx.strokeStyle = faintLine;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(startX, startY, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = nodeFill;
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(drawFrame);
  }

  requestAnimationFrame(drawFrame);
}

// 8. 论文检索、场地类型筛选、BibTeX 与 Lightbox
function initPublicationsEnhancements() {
  const searchInput = document.querySelector('.search-input');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const categories = Array.from(document.querySelectorAll('.publication-category'));
  const items = Array.from(document.querySelectorAll('.publication-item'));
  const emptyState = document.getElementById('publication-empty');

  if (items.length === 0) return null;

  // 8.1 自动统计并填充类型数量角标
  const venueCounts = {
    all: items.length,
    conference: document.querySelectorAll('.publication-category[data-category="conference"] .publication-item').length,
    preprint: document.querySelectorAll('.publication-category[data-category="preprint"] .publication-item').length
  };

  filterBtns.forEach((btn) => {
    const key = btn.getAttribute('data-filter');
    if (key && venueCounts[key] !== undefined && !btn.querySelector('.filter-count')) {
      const badge = document.createElement('span');
      badge.className = 'filter-count';
      badge.textContent = `[${venueCounts[key]}]`;
      btn.appendChild(badge);
    }
  });

  // 8.2 自动注入 BibTeX 展开按钮与一键复制抽屉
  items.forEach((item) => {
    const bibtex = item.getAttribute('data-bibtex');
    const linksRow = item.querySelector('.publication-links');
    const body = item.querySelector('.publication-body');
    if (!bibtex || !linksRow || !body) return;

    const bibBtn = document.createElement('button');
    bibBtn.type = 'button';
    bibBtn.className = 'pub-link pub-bibtex-btn';
    bibBtn.textContent = 'BibTeX';
    linksRow.appendChild(bibBtn);

    const drawer = document.createElement('div');
    drawer.className = 'bibtex-drawer';
    drawer.hidden = true;
    drawer.innerHTML = `
      <div class="bibtex-bar">
        <span>BIBTEX CITATION RECORD</span>
        <button type="button" class="bibtex-copy-btn">Copy</button>
      </div>
      <pre class="bibtex-pre"></pre>
    `;
    drawer.querySelector('.bibtex-pre').textContent = bibtex;
    body.appendChild(drawer);

    const copyBtn = drawer.querySelector('.bibtex-copy-btn');
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(bibtex);
        }
      } catch (e) {}
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1600);
    });

    bibBtn.addEventListener('click', () => {
      const willOpen = drawer.hidden;
      drawer.hidden = !willOpen;
      bibBtn.classList.toggle('is-open', willOpen);
    });
  });

  // 8.3 论文缩略图高清放大 Lightbox
  const lightbox = document.createElement('div');
  lightbox.className = 'pub-lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="pub-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Publication figure preview">
      <div class="pub-lightbox-top">
        <span class="pub-lightbox-caption">FIGURE PREVIEW</span>
        <button type="button" class="pub-lightbox-close">ESC / Close ✕</button>
      </div>
      <div class="pub-lightbox-stage">
        <img src="" alt="">
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.pub-lightbox-stage img');
  const lightboxCap = lightbox.querySelector('.pub-lightbox-caption');
  const lightboxClose = lightbox.querySelector('.pub-lightbox-close');

  function closeLightbox() {
    lightbox.hidden = true;
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  items.forEach((item) => {
    const thumbLink = item.querySelector('.publication-image');
    const img = thumbLink ? thumbLink.querySelector('img') : null;
    const titleEl = item.querySelector('.publication-title');
    if (!thumbLink || !img) return;

    const zoomBtn = document.createElement('span');
    zoomBtn.className = 'pub-zoom-badge';
    zoomBtn.title = 'Inspect figure in high resolution';
    zoomBtn.textContent = '⤢';
    thumbLink.appendChild(zoomBtn);

    zoomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      lightboxImg.src = img.getAttribute('src');
      lightboxImg.alt = img.getAttribute('alt') || '';
      lightboxCap.textContent = titleEl ? titleEl.textContent.trim() : 'FIGURE PREVIEW';
      lightbox.hidden = false;
    });
  });

  // 8.4 搜索 + 会议类型过滤
  let activeVenueFilter = 'all';

  function updateVisibility() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    categories.forEach((cat) => {
      const catType = cat.getAttribute('data-category');
      const catMatchesVenue = activeVenueFilter === 'all' || activeVenueFilter === catType;
      const catItems = Array.from(cat.querySelectorAll('.publication-item'));
      let catVisible = 0;

      catItems.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const matchesQuery = !query || text.includes(query);
        const show = catMatchesVenue && matchesQuery;
        item.hidden = !show;
        if (show) {
          catVisible += 1;
          visibleCount += 1;
        }
      });

      cat.hidden = catVisible === 0;
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateVisibility);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeVenueFilter = btn.getAttribute('data-filter') || 'all';
      filterBtns.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-pressed', String(isCurrent));
      });
      updateVisibility();
    });
  });

  // 全局快捷键：/ 聚焦搜索框，Escape 关闭弹窗或清空过滤
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!lightbox.hidden) {
        closeLightbox();
        return;
      }
      if (searchInput && document.activeElement === searchInput && searchInput.value) {
        searchInput.value = '';
        updateVisibility();
        searchInput.blur();
      }
    }

    if (
      e.key === '/' &&
      searchInput &&
      document.activeElement !== searchInput &&
      !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')
    ) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  return null;
}
