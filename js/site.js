// ==========================================================================
// Xiangnan Wu — Minimalist Sci-Fi ("Orbital Horizon") Interactive Engine
// 遵循 Modern Web Guidance 标准：
// 1. 双态系统感知主题切换 (<meta name="color-scheme"> + storage 跨标签同步)
// 2. 单导航树自适应测量 + Popover 折叠菜单 + 向下滚动自动收纳回退
// 3. 原生 CSS Scrollspy (:target-current + scrollend aria-current 同步 + IO 回退)
// 4. 合成器滚动进度束 JS 回退 (仅在不支持 animation-timeline: scroll() 时运行)
// 5. 极简科幻开普勒轨道流形星盘 Canvas (支持暂停控件、无动画偏好与离屏休眠)
// 6. 原生 <details>/<summary> BibTeX 手风琴 + <dialog closedby="any"> 预览器
// 7. View Transitions API 论文类型筛选平滑重排
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initColorSchemeToggle();
  initResponsiveHeader();
  initScrollspy();
  initScrollProgressFallback();
  initEmailCopy();
  initPublicationsModule();
  initOrbitalManifoldCanvas();
});

// 1. 颜色方案切换：在存储时比较系统偏好，回归一致时移除覆盖键以恢复跟随系统
function initColorSchemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getRenderedScheme() {
    const val = metaScheme?.getAttribute('content') || 'light dark';
    if (val === 'dark' || val === 'light') return val;
    return systemDark.matches ? 'dark' : 'light';
  }

  function applyStoredScheme(stored) {
    if (!metaScheme) return;
    metaScheme.setAttribute('content', stored === 'light' || stored === 'dark' ? stored : 'light dark');
  }

  // 跨标签页同步 localStorage 变更
  window.addEventListener('storage', (event) => {
    if (event.key === 'color-scheme') {
      applyStoredScheme(event.newValue);
    }
  });

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const current = getRenderedScheme();
    const target = current === 'dark' ? 'light' : 'dark';
    const osScheme = systemDark.matches ? 'dark' : 'light';

    try {
      if (target !== osScheme) {
        localStorage.setItem('color-scheme', target);
        applyStoredScheme(target);
      } else {
        localStorage.removeItem('color-scheme');
        applyStoredScheme(null);
      }
    } catch (e) {
      applyStoredScheme(target);
    }
  });
}

// 2. 单导航树自适应测量 (navbar) + 向下滚动收起顶栏回退 (content-first-noise-reduction)
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

    // 不支持 CSS Anchor Positioning 时按按钮位置回退定位
    siteMenu.addEventListener('beforetoggle', (event) => {
      if (event.newState === 'open' && !window.CSS?.supports?.('inset-block-start', 'anchor(--menu-button bottom)')) {
        const rect = menuBtn.getBoundingClientRect();
        siteMenu.style.insetBlockStart = `${Math.round(rect.bottom + 8)}px`;
        siteMenu.style.insetInlineEnd = `${Math.max(12, Math.round(window.innerWidth - rect.right))}px`;
      }
    });

    // 点击折叠菜单中的锚点后自动关闭 Popover
    siteMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (!isWideState && typeof siteMenu.hidePopover === 'function' && siteMenu.matches(':is(:popover-open, .\\:popover-open)')) {
          siteMenu.hidePopover();
        }
      });
    });

    // 不支持 container-type: scroll-state 的浏览器回退脚本
    if (!window.CSS?.supports?.('container-type', 'scroll-state')) {
      let lastY = window.scrollY;
      window.addEventListener(
        'scroll',
        () => {
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          const y = Math.max(0, Math.min(window.scrollY, maxScroll));
          if (y === lastY) return;
          header.classList.toggle('is-hidden', y > lastY && y > header.offsetHeight * 1.5);
          lastY = y;
        },
        { passive: true }
      );
    }
  }

  // 兼容独立博客子页 (blog/) 的传统折叠菜单按钮
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

// 3. 原生 Scrollspy (scroll-target-group) 的 aria-current 同步与 IO 回退
function initScrollspy() {
  const navLinks = Array.from(document.querySelectorAll('#site-menu a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
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
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }
}

// 4. 顶部激光滚动进度束回退（仅在不支持 CSS Scroll-Driven Animations 时启用）
function initScrollProgressFallback() {
  if (window.CSS?.supports?.('animation-timeline', 'scroll()')) {
    return;
  }

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

// 5. 邮箱地址一键复制反馈
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

    btn.classList.add('is-copied');
    if (statusEl) statusEl.textContent = 'copied ✓';

    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('is-copied');
      if (statusEl) statusEl.textContent = 'copy';
    }, 1800);
  });
}

// 6. 极简科幻开普勒轨道流形星盘 (01 Multimodal Latent Core ⇄ 02 Embodied Rollout Orbits)
function initOrbitalManifoldCanvas() {
  const canvas = document.getElementById('orbital-canvas');
  const wrap = document.getElementById('orbital-wrap');
  const readoutEl = document.getElementById('orbital-readout');
  const pauseBtn = document.getElementById('orbital-pause');
  const pillars = Array.from(document.querySelectorAll('.focus-pillar'));
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!canvas || !wrap) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let focusMode = 'dual'; // 'dual' | 'multimodal' | 'embodied'
  let targetTiltX = 0;
  let targetTiltY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let phase = 0.85;
  let rafId = null;
  let isOffscreen = false;
  let userPaused = reducedMotionQuery.matches;

  // 黄金螺旋球面节点：表征多模态共享潜空间几何体
  const latentNodes = Array.from({ length: 18 }, (_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / 18);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    return {
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi)
    };
  });

  function isDarkActive() {
    const val = metaScheme?.getAttribute('content') || 'light dark';
    if (val === 'dark') return true;
    if (val === 'light') return false;
    return systemDark.matches;
  }

  function syncPauseUI() {
    if (!pauseBtn) return;
    pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play orbital animation' : 'Pause orbital animation');
  }

  function resize() {
    const rect = wrap.getBoundingClientRect();
    width = Math.max(220, Math.floor(rect.width));
    height = Math.max(200, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderScene(false);
  }

  // 绘制倾斜开普勒椭圆轨道环与拱点刻度
  function drawOrbitalRing(cx, cy, rx, ry, angleRad, strokeColor, dashed, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.9;
    ctx.setLineDash(dashed ? [2.5, 4] : []);
    ctx.stroke();
    ctx.setLineDash([]);

    // 四个拱点精密微刻度
    [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((a) => {
      const x1 = Math.cos(a) * (rx - 3);
      const y1 = Math.sin(a) * (ry - 3);
      const x2 = Math.cos(a) * (rx + 3);
      const y2 = Math.sin(a) * (ry + 3);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    ctx.restore();
  }

  function renderScene(advanceTime = true) {
    if (advanceTime) {
      phase += 0.011;
      tiltX += (targetTiltX - tiltX) * 0.08;
      tiltY += (targetTiltY - tiltY) * 0.08;
    }

    const dark = isDarkActive();
    const cyan = dark ? '#38bdf8' : '#0369a1';
    const teal = dark ? '#2dd4bf' : '#0f766e';
    const inkDot = dark ? '#e2ecf7' : '#0f172a';
    const hairline = dark ? 'rgba(148, 175, 206, 0.22)' : 'rgba(15, 23, 42, 0.16)';
    const faintRing = dark ? 'rgba(148, 175, 206, 0.12)' : 'rgba(15, 23, 42, 0.09)';

    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.5 + tiltX * 10;
    const cy = height * 0.47 + tiltY * 8;
    const unit = Math.min(width, height);
    const coreR = unit * 0.175;
    const outerRx = unit * 0.43;
    const outerRy = unit * 0.17;

    const mmEmphasis = focusMode === 'embodied' ? 0.36 : 1;
    const embEmphasis = focusMode === 'multimodal' ? 0.36 : 1;

    // 1. 背景极细基准十字线
    ctx.save();
    ctx.strokeStyle = faintRing;
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(cx - outerRx * 1.08, cy);
    ctx.lineTo(cx + outerRx * 1.08, cy);
    ctx.moveTo(cx, cy - unit * 0.36);
    ctx.lineTo(cx, cy + unit * 0.36);
    ctx.stroke();
    ctx.restore();

    // 2. 外层具身世界模型开普勒轨道环 (02 // Embodied Intelligence)
    const eclipticTilt = -0.32 + tiltY * 0.08;
    drawOrbitalRing(cx, cy, outerRx, outerRy, eclipticTilt, hairline, false, embEmphasis);
    drawOrbitalRing(cx, cy, outerRx * 0.76, outerRy * 1.24, 0.42 - tiltX * 0.08, hairline, true, embEmphasis * 0.75);

    // 沿主轨道运动的策略预测脉冲与目标位姿锚点
    const orbitAgents = [
      { speed: 0.75, offset: 0.2, rx: outerRx, ry: outerRy, tilt: eclipticTilt, color: teal, primary: true },
      { speed: -0.52, offset: 2.4, rx: outerRx * 0.76, ry: outerRy * 1.24, tilt: 0.42 - tiltX * 0.08, color: cyan, primary: false }
    ];

    orbitAgents.forEach((ag) => {
      const ang = phase * ag.speed + ag.offset;
      const lx = Math.cos(ang) * ag.rx;
      const ly = Math.sin(ang) * ag.ry;
      const px = cx + lx * Math.cos(ag.tilt) - ly * Math.sin(ag.tilt);
      const py = cy + lx * Math.sin(ag.tilt) + ly * Math.cos(ag.tilt);

      ctx.save();
      ctx.globalAlpha = embEmphasis;

      // 从潜空间核心投射到执行器轨迹点的耦合射线
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = ag.color;
      ctx.globalAlpha = embEmphasis * 0.28;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // 轨道脉冲光点与精密方框准星
      ctx.globalAlpha = embEmphasis;
      ctx.beginPath();
      ctx.arc(px, py, ag.primary ? 3 : 2.2, 0, Math.PI * 2);
      ctx.fillStyle = ag.color;
      ctx.fill();

      if (ag.primary) {
        ctx.strokeStyle = ag.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 6.5, py - 6.5, 13, 13);
      }
      ctx.restore();
    });

    // 3. 中央多模态测地线潜空间球体 (01 // Multimodal Understanding)
    ctx.save();
    ctx.globalAlpha = mmEmphasis;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 1.18, 0, Math.PI * 2);
    ctx.strokeStyle = hairline;
    ctx.lineWidth = 0.85;
    ctx.stroke();

    const rotY = phase * 0.62 + tiltX * 0.55;
    const rotX = 0.35 + tiltY * 0.45;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const projected = latentNodes.map((n) => {
      const x1 = n.x * cosY - n.z * sinY;
      const z1 = n.x * sinY + n.z * cosY;
      const y2 = n.y * cosX - z1 * sinX;
      const z2 = n.y * sinX + z1 * cosX;
      const depth = 1 / (2.35 - z2 * 0.48);
      return {
        x: cx + x1 * coreR * 1.9 * depth,
        y: cy + y2 * coreR * 1.9 * depth,
        z: z2
      };
    });

    ctx.strokeStyle = cyan;
    ctx.lineWidth = 0.75;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dist = Math.hypot(projected[i].x - projected[j].x, projected[i].y - projected[j].y);
        if (dist < coreR * 0.92) {
          ctx.globalAlpha = mmEmphasis * (projected[i].z + projected[j].z > 0 ? 0.34 : 0.14);
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }
    }

    projected.forEach((pt, idx) => {
      ctx.globalAlpha = mmEmphasis * (pt.z > 0 ? 0.92 : 0.38);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, idx % 5 === 0 ? 2.5 : 1.65, 0, Math.PI * 2);
      ctx.fillStyle = idx % 5 === 0 ? cyan : inkDot;
      ctx.fill();
    });
    ctx.restore();
  }

  function tickLoop() {
    if (userPaused || isOffscreen || document.hidden) {
      rafId = null;
      return;
    }
    renderScene(true);
    rafId = requestAnimationFrame(tickLoop);
  }

  function startLoop() {
    if (!userPaused && !isOffscreen && !document.hidden && !rafId) {
      rafId = requestAnimationFrame(tickLoop);
    } else {
      renderScene(false);
    }
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // 鼠标视差微倾角交互
  wrap.addEventListener('pointermove', (event) => {
    const rect = wrap.getBoundingClientRect();
    targetTiltX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    targetTiltY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    if (userPaused) renderScene(false);
  });

  wrap.addEventListener('pointerleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  // 与 01 / 02 两大研究支柱联动高亮
  function setFocusMode(mode) {
    focusMode = mode;
    pillars.forEach((p) => {
      p.classList.toggle('is-active', p.getAttribute('data-focus') === mode);
    });
    if (readoutEl) {
      if (mode === 'multimodal') {
        readoutEl.textContent = '01 // LATENT GEOMETRY';
      } else if (mode === 'embodied') {
        readoutEl.textContent = '02 // WORLD & POLICY';
      } else {
        readoutEl.textContent = 'MANIFOLD // DUAL-CORE';
      }
    }
    if (userPaused) renderScene(false);
  }

  pillars.forEach((pillar) => {
    const mode = pillar.getAttribute('data-focus') || 'dual';
    pillar.addEventListener('mouseenter', () => setFocusMode(mode));
    pillar.addEventListener('mouseleave', () => setFocusMode('dual'));
    pillar.addEventListener('focus', () => setFocusMode(mode));
    pillar.addEventListener('blur', () => setFocusMode('dual'));
    pillar.addEventListener('click', () => {
      setFocusMode(focusMode === mode ? 'dual' : mode);
    });
  });

  // WCAG 2.2.2 键盘可达的暂停/播放控件
  if (pauseBtn) {
    syncPauseUI();
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      syncPauseUI();
      if (userPaused) {
        stopLoop();
      } else {
        startLoop();
      }
    });
  }

  reducedMotionQuery.addEventListener('change', (e) => {
    userPaused = e.matches;
    syncPauseUI();
    if (userPaused) {
      stopLoop();
      renderScene(false);
    } else {
      startLoop();
    }
  });

  systemDark.addEventListener('change', () => renderScene(false));
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    requestAnimationFrame(() => renderScene(false));
  });

  // 离屏休眠控制：contentvisibilityautostatechange 捕获监听 + IntersectionObserver 回退
  document.addEventListener(
    'contentvisibilityautostatechange',
    (event) => {
      if (event.target instanceof Element && event.target.contains(wrap)) {
        isOffscreen = event.skipped;
        if (isOffscreen) stopLoop();
        else startLoop();
      }
    },
    { capture: true }
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isOffscreen = !entry.isIntersecting;
          if (isOffscreen) stopLoop();
          else startLoop();
        });
      },
      { rootMargin: '200px' }
    );
    io.observe(wrap);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  window.addEventListener('resize', resize);
  resize();
  startLoop();
}

// 7. Top-Layer 离散 display 过渡特征探测与离场等待 (animate-to-from-top-layer)
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

// 8. 论文列表增强：原生 <details> BibTeX、原生 <dialog> Lightbox 与 View Transitions 筛选
function initPublicationsModule() {
  const searchInput = document.querySelector('#publications .search-input');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const categories = Array.from(document.querySelectorAll('.publication-category'));
  const items = Array.from(document.querySelectorAll('.publication-item'));
  const emptyState = document.getElementById('publication-empty');

  if (items.length === 0) return;

  // 8.1 原生 <details>/<summary> BibTeX 折叠抽屉（不设数量统计角标，保持极简）
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
        <span>BibTeX</span>
        <button type="button" class="bibtex-copy-btn">Copy</button>
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
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1600);
    });
  });

  // 8.2 原生 <dialog closedby="any"> 高清大图预览器
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

    // MANDATORY: 为尚不支持 closedby="any" 的浏览器（如 Safari）实现背景坐标判定关闭回退
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
      zoomBtn.title = 'Inspect figure';
      zoomBtn.setAttribute('aria-label', 'Inspect figure in high resolution');
      zoomBtn.textContent = '⤢';
      thumbLink.appendChild(zoomBtn);

      zoomBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        lightboxImg.src = img.getAttribute('src') || '';
        lightboxImg.alt = img.getAttribute('alt') || '';
        lightboxTitle.textContent = titleEl ? titleEl.textContent.trim() : 'Figure Preview';
        lightbox.showModal();
      });
    });
  }

  // 8.3 搜索 + View Transitions 类型筛选
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

  searchInput?.addEventListener('input', () => updateFilterView(false));

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-filter') || 'all';
      if (next === activeFilter) return;
      activeFilter = next;
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      updateFilterView(true);
    });
  });

  // 按 "/" 快速聚焦搜索框，按 Esc 清空过滤
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
