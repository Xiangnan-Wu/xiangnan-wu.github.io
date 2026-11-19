// ==========================================================================
// Xiangnan Wu — Emissive Glyph Monolith Interactive & Motion Engine
// 艺术指导致敬：Raunak (@Skirook) — 亮度字符映射 ( .:-=+*#%@) + 双通道光学辉光渲染
// 现代标准：GSAP 丝滑渐入 + Popover 单树导航 + 原生 Scrollspy + View Transitions +
//          <details> 动画手风琴 + <dialog closedby="any"> + 离屏自动休眠
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initGsapReveals();
  initResponsiveHeader();
  initScrollspy();
  initScrollProgressFallback();
  initEmailCopy();
  initPublicationsModule();
  initEmissiveGlyphCanvases();
});

// 1. GSAP 丝滑渐入编排（遵循 cubic-bezier(.32,.72,0,1) 节奏，严格尊重 prefers-reduced-motion）
function initGsapReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof window.gsap === 'undefined') return;

  const targets = document.querySelectorAll('.gs-reveal');
  if (targets.length === 0) return;

  window.gsap.fromTo(
    targets,
    { opacity: 0, y: 12 },
    {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.045,
      ease: 'expo.out',
      lazy: false,
      clearProps: 'transform,opacity'
    }
  );
}

// 2. 单导航树自适应测量 + Popover 折叠菜单 + 向下滚动自动收起回退
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
        siteMenu.style.insetBlockStart = `${Math.round(rect.bottom + 8)}px`;
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

  // 兼容独立博客子页 (blog/) 传统移动端导航开关
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

// 3. 原生 CSS Scrollspy (scroll-target-group) 与 IntersectionObserver 回退
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

// 4. 顶部光丝滚动进度条回退（仅在不支持 animation-timeline: scroll() 时运行）
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

// 5. 邮箱一键复制交互
function initEmailCopy() {
  const btn = document.querySelector('.copy-email-btn');
  if (!btn) return;

  const pillEl = btn.querySelector('.copy-pill');
  let timer = null;

  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email') || 'xiangnanwu.cs@gmail.com';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      }
    } catch (e) {}

    btn.classList.add('is-copied');
    if (pillEl) pillEl.textContent = 'copied ✓';

    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('is-copied');
      if (pillEl) pillEl.textContent = 'copy';
    }, 1800);
  });
}

// ==========================================================================
// 6. EMISSIVE GLYPH + DUAL-PASS OPTICAL BLOOM RENDERER (4 ORIGINAL SCENES)
// ==========================================================================
function initEmissiveGlyphCanvases() {
  const canvases = Array.from(document.querySelectorAll('.glyph-canvas'));
  if (canvases.length === 0) return;

  const motionToggleBtn = document.getElementById('motion-toggle');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 10 阶字符密度斜坡（暗 -> 亮）
  const RAMP = ' .:-=+*#%@';

  // 预计算 64 阶黑体/色温查找表（精确还原参考视频：暮色靛蓝 -> 长春花蓝紫 -> 白炽暖白）
  const COLOR_STOPS = [
    { t: 0.0, r: 38, g: 52, b: 102 },   // #263466
    { t: 0.24, r: 61, g: 78, b: 140 },  // #3d4e8c
    { t: 0.48, r: 112, g: 125, b: 173 },// #707dad
    { t: 0.7, r: 162, g: 174, b: 218 }, // #a2aeda
    { t: 0.86, r: 230, g: 228, b: 205 },// #e6e4cd (白炽暖色过渡)
    { t: 1.0, r: 255, g: 255, b: 255 }  // #ffffff
  ];

  const PALETTE_LUT = Array.from({ length: 64 }, (_, idx) => {
    const u = idx / 63;
    let s0 = COLOR_STOPS[0];
    let s1 = COLOR_STOPS[COLOR_STOPS.length - 1];
    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
      if (u >= COLOR_STOPS[i].t && u <= COLOR_STOPS[i + 1].t) {
        s0 = COLOR_STOPS[i];
        s1 = COLOR_STOPS[i + 1];
        break;
      }
    }
    const local = (u - s0.t) / Math.max(0.0001, s1.t - s0.t);
    const r = Math.round(s0.r + (s1.r - s0.r) * local);
    const g = Math.round(s0.g + (s1.g - s0.g) * local);
    const b = Math.round(s0.b + (s1.b - s0.b) * local);
    const a = (0.28 + 0.72 * Math.pow(u, 0.65)).toFixed(3);
    return `rgba(${r},${g},${b},${a})`;
  });

  // 平滑三次缓动曲线辅助函数
  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  // 场景 4 的 14 组漂浮生物发光策略量子簇（核心达白炽 #ffffff，外围带长春花蓝光晕）
  const quantaAgents = Array.from({ length: 14 }, (_, i) => ({
    ax: 0.12 + ((i * 0.6180339) % 0.76),
    ay: 0.14 + (((i * 0.381966 + 0.19) * 1.37) % 0.72),
    rx: 0.045 + (i % 4) * 0.026,
    ry: 0.045 + ((i + 2) % 4) * 0.024,
    speed: (i % 2 === 0 ? 1 : -1) * (0.38 + (i % 5) * 0.1),
    phase: i * 1.41,
    size: 0.056 + (i % 3) * 0.017
  }));

  let userPaused = reducedMotionQuery.matches;
  let globalTime = 1.35; // 静态帧默认停在极具张力的相位角
  let lastTimestamp = performance.now();
  let rafId = null;

  const instances = canvases.map((canvas) => {
    const ctx = canvas.getContext('2d');
    const bloomCanvas = document.createElement('canvas');
    const bloomCtx = bloomCanvas.getContext('2d');
    const scene = canvas.getAttribute('data-scene') || 'wave';
    const stage = canvas.parentElement;

    const state = {
      canvas,
      ctx,
      bloomCanvas,
      bloomCtx,
      scene,
      stage,
      width: 0,
      height: 0,
      cols: 0,
      rows: 0,
      cellW: 7.6,
      cellH: 11.4,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      visible: true,
      pointerActive: false,
      px: 0.5,
      py: 0.5,
      smoothPx: 0.5,
      smoothPy: 0.5,
      ripples: []
    };

    stage.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      state.pointerActive = true;
      state.px = (e.clientX - rect.left) / Math.max(1, rect.width);
      state.py = (e.clientY - rect.top) / Math.max(1, rect.height);
      if (userPaused) renderInstance(state, globalTime);
    });

    stage.addEventListener('pointerleave', () => {
      state.pointerActive = false;
    });

    stage.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      state.ripples.push({
        x: (e.clientX - rect.left) / Math.max(1, rect.width),
        y: (e.clientY - rect.top) / Math.max(1, rect.height),
        born: globalTime
      });
      if (state.ripples.length > 4) state.ripples.shift();
      if (userPaused) renderInstance(state, globalTime);
    });

    return state;
  });

  function resizeAll() {
    instances.forEach((inst) => {
      const rect = inst.stage.getBoundingClientRect();
      inst.width = Math.max(180, Math.floor(rect.width));
      inst.height = Math.max(150, Math.floor(rect.height));
      inst.dpr = Math.min(window.devicePixelRatio || 1, 2);

      inst.canvas.width = inst.width * inst.dpr;
      inst.canvas.height = inst.height * inst.dpr;
      inst.ctx.setTransform(inst.dpr, 0, 0, inst.dpr, 0, 0);

      // 1/4 分辨率离屏辉光缓冲，兼顾真实光学散射与 60fps 帧率
      inst.bloomCanvas.width = Math.max(48, Math.floor(inst.width * 0.26));
      inst.bloomCanvas.height = Math.max(40, Math.floor(inst.height * 0.26));

      inst.cols = Math.floor(inst.width / inst.cellW);
      inst.rows = Math.floor(inst.height / inst.cellH);
    });
    renderAll(globalTime);
  }

  // --------------------------------------------------------------------------
  // 场景 1 (Q1): 双模态耦合波前 (Vision-Language Coupled Latent Wavefront)
  // --------------------------------------------------------------------------
  function sampleWaveScene(u, v, t, inst) {
    const yNorm = (v - 0.5) * 2.15;
    const freq = 9.8;
    const phaseA = u * freq - t * 1.55;
    const phaseB = u * freq - t * 1.55 + Math.PI;

    const env = smoothstep(0.0, 0.1, u) * smoothstep(1.0, 0.9, u);
    const amp = 0.56 * (0.86 + 0.14 * Math.sin(u * 4.2 + t * 0.7));

    const yA = Math.sin(phaseA) * amp;
    const zA = Math.cos(phaseA);
    const yB = Math.sin(phaseB) * amp;
    const zB = Math.cos(phaseB);

    const dA = Math.abs(yNorm - yA);
    const dB = Math.abs(yNorm - yB);

    // 双流潜表示束强度（前景正相位呈白炽高亮，远景负相位退入暮色靛蓝）
    const strandA = Math.exp(-(dA * dA) / 0.017) * (0.42 + 0.58 * (zA * 0.5 + 0.5));
    const strandB = Math.exp(-(dB * dB) / 0.017) * (0.42 + 0.58 * (zB * 0.5 + 0.5));

    // 横向跨模态注意力桥梯级
    const rungSlot = Math.abs(Math.sin(phaseA * 2.0));
    const between = yNorm >= Math.min(yA, yB) && yNorm <= Math.max(yA, yB);
    let rung = 0;
    if (between && rungSlot < 0.26) {
      rung = (1 - rungSlot / 0.26) * 0.34;
    }

    // 交汇点聚焦焦散辉光
    const crossBoost = Math.exp(-((yA - yB) * (yA - yB)) / 0.03) * Math.exp(-(yNorm * yNorm) / 0.022) * 0.52;

    let lum = (Math.max(strandA, strandB) + rung + crossBoost) * (0.35 + 0.65 * env);

    if (inst.pointerActive) {
      const pd = Math.hypot(u - inst.smoothPx, v - inst.smoothPy);
      lum += Math.exp(-(pd * pd) / 0.014) * 0.42;
    }

    return Math.min(1, lum);
  }

  // --------------------------------------------------------------------------
  // 场景 2 (Q2): 01 · Multimodal Understanding — 3D 时空潜流形环面 (Raymarched Torus)
  // --------------------------------------------------------------------------
  function sampleTorusScene(u, v, t, inst) {
    const aspect = inst.width / Math.max(1, inst.height);
    const px = (u - 0.5) * 2.15 * aspect;
    const py = (v - 0.5) * 2.15;

    // 摄像机与双轴进动旋转角（融合指针平滑视差）
    const tiltX = 0.68 + (inst.pointerActive ? (inst.smoothPy - 0.5) * 0.65 : Math.sin(t * 0.45) * 0.18);
    const tiltY = t * 0.72 + (inst.pointerActive ? (inst.smoothPx - 0.5) * 0.85 : 0);
    const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
    const cy = Math.cos(tiltY), sy = Math.sin(tiltY);

    // 简化的 8 步解析距离场光线步进（极低开销即可获得真实 3D 环面曲率与边缘高光）
    const majorR = 0.62;
    const minorR = 0.23;
    let z = -1.35;
    let hit = false;
    let lx = 0, ly = 0, lz = 0;

    for (let step = 0; step < 9; step++) {
      // 将视线点 (px, py, z) 旋转到环面局部坐标系
      const y1 = py * cx - z * sx;
      const z1 = py * sx + z * cx;
      lx = px * cy + z1 * sy;
      ly = y1;
      lz = -px * sy + z1 * cy;

      const qx = Math.hypot(lx, lz) - majorR;
      const dist = Math.hypot(qx, ly) - minorR;
      if (dist < 0.025) {
        hit = true;
        break;
      }
      z += Math.max(0.06, dist * 0.88);
      if (z > 1.45) break;
    }

    let lum = 0;

    if (hit) {
      const ringLen = Math.max(0.0001, Math.hypot(lx, lz));
      const cxp = (lx / ringLen) * majorR;
      const czp = (lz / ringLen) * majorR;
      let nx = (lx - cxp) / minorR;
      let ny = ly / minorR;
      let nz = (lz - czp) / minorR;

      // 旋回世界空间计算主光与菲涅尔掠射光
      const wx1 = nx * cy - nz * sy;
      const wz1 = nx * sy + nz * cy;
      const wy = ny * cx + wz1 * sx;
      const wz = -ny * sx + wz1 * cx;

      const lightDot = Math.max(0, wx1 * 0.52 - wy * 0.62 - wz * 0.58);
      const rim = Math.pow(1 - Math.min(1, Math.abs(wz)), 2.2) * 0.48;
      // 环面经纬注意力纹理条带
      const theta = Math.atan2(lz, lx);
      const phi = Math.atan2(ly, ringLen - majorR);
      const spiral = 0.5 + 0.5 * Math.sin(theta * 6 + phi * 3 - t * 2.1);

      lum = 0.14 + lightDot * 0.68 + rim + spiral * 0.18;
    } else {
      // 外围精密赤道参考环，呼应多模态空间对齐轨迹
      const oy = py * cx;
      const rOrbit = Math.hypot(px * 0.86, oy * 1.48);
      const ringDelta = Math.abs(rOrbit - 0.92);
      if (ringDelta < 0.032) {
        const ang = Math.atan2(oy * 1.48, px * 0.86);
        const pulse = Math.pow(0.5 + 0.5 * Math.cos(ang - t * 1.4), 6);
        lum = (1 - ringDelta / 0.032) * (0.22 + 0.72 * pulse);
      }
    }

    return Math.min(1, lum);
  }

  // --------------------------------------------------------------------------
  // 场景 3 (Q3): 02 · Embodied Intelligence — 具身机械臂位姿信标与旋转世界模型视锥
  // --------------------------------------------------------------------------
  function distToSegment(px, py, ax, ay, bx, by) {
    const vx = bx - ax, vy = by - ay;
    const wx = px - ax, wy = py - ay;
    const c1 = vx * wx + vy * wy;
    const c2 = vx * vx + vy * vy;
    const b = c2 > 0 ? Math.max(0, Math.min(1, c1 / c2)) : 0;
    return Math.hypot(px - (ax + b * vx), py - (ay + b * vy));
  }

  function sampleBeaconScene(u, v, t, inst) {
    const aspect = inst.width / Math.max(1, inst.height);
    const horizonY = 0.62;
    const sweepAngle = t * 0.785; // 8 秒完整谐波周期
    const facing = 0.55 + 0.45 * Math.cos(sweepAngle);
    const sway = Math.sin(sweepAngle);

    // 雕塑感三自由度机械臂：旋转底座 -> 肩关节 -> 肘关节 -> 发光夹爪与世界状态球
    const baseX = 0.34, baseY = horizonY + 0.01;
    const elbowX = 0.42 + sway * 0.035;
    const elbowY = 0.31 + Math.cos(sweepAngle) * 0.025;
    const wristX = inst.pointerActive ? 0.44 + inst.smoothPx * 0.32 : 0.63 + sway * 0.065;
    const wristY = inst.pointerActive ? 0.18 + inst.smoothPy * 0.26 : 0.26 + Math.sin(t * 1.57) * 0.03;
    const orbX = wristX + 0.085;
    const orbY = wristY + 0.035;

    let lum = 0;

    // 1. 圆柱体积高光机械臂连杆与基座盘
    const dPedestal = Math.hypot((u - baseX) * aspect * 0.85, (v - (baseY + 0.025)) * 2.2);
    if (dPedestal < 0.095) {
      lum = Math.max(lum, (1 - dPedestal / 0.095) * 0.86);
    }

    const dArm1 = distToSegment(u * aspect, v, baseX * aspect, baseY, elbowX * aspect, elbowY);
    if (dArm1 < 0.052) {
      const shade1 = Math.pow(1 - dArm1 / 0.052, 1.35);
      lum = Math.max(lum, shade1 * 0.88);
    }

    const dArm2 = distToSegment(u * aspect, v, elbowX * aspect, elbowY, wristX * aspect, wristY);
    if (dArm2 < 0.044) {
      const shade2 = Math.pow(1 - dArm2 / 0.044, 1.35);
      lum = Math.max(lum, shade2 * 0.94);
    }

    // 关节伺服环与双指夹爪
    const dShoulder = Math.hypot((u - baseX) * aspect, v - baseY);
    const dElbow = Math.hypot((u - elbowX) * aspect, v - elbowY);
    const dWrist = Math.hypot((u - wristX) * aspect, v - wristY);
    if (dShoulder < 0.068) lum = Math.max(lum, (1 - dShoulder / 0.068) * 0.95);
    if (dElbow < 0.064) lum = Math.max(lum, Math.pow(1 - dElbow / 0.064, 1.2) * 1.0);
    if (dWrist < 0.055) lum = Math.max(lum, Math.pow(1 - dWrist / 0.055, 1.2) * 1.0);

    // 夹爪上下指与前方悬浮的发光世界状态目标球 (World-State Target Orb)
    const jawTop = distToSegment(u * aspect, v, wristX * aspect, wristY, (orbX - 0.015) * aspect, orbY - 0.042);
    const jawBot = distToSegment(u * aspect, v, wristX * aspect, wristY, (orbX - 0.015) * aspect, orbY + 0.042);
    if (jawTop < 0.024) lum = Math.max(lum, (1 - jawTop / 0.024) * 0.82);
    if (jawBot < 0.024) lum = Math.max(lum, (1 - jawBot / 0.024) * 0.82);

    const dOrb = Math.hypot((u - orbX) * aspect, v - orbY);
    if (dOrb < 0.095) {
      const orbCore = Math.exp(-(dOrb * dOrb) / 0.0022) * (0.85 + 0.25 * facing);
      const orbHalo = (1 - dOrb / 0.095) * 0.45;
      lum = Math.max(lum, orbCore + orbHalo);
    }

    // 2. 从目标球投向地平面的预测策略轨迹弧与感知光束锥
    const relX = (u - orbX) * aspect;
    const relY = v - orbY;
    const rayDist = Math.hypot(relX, relY);
    if (rayDist > 0.02 && rayDist < 0.68 && relY > -0.02) {
      const coneAxisX = sway * 0.34;
      const coneAxisY = 0.58;
      const cLen = Math.hypot(coneAxisX, coneAxisY);
      const dot = (relX * coneAxisX + relY * coneAxisY) / (rayDist * cLen);
      const cone = Math.pow(Math.max(0, dot), 11);
      lum += cone * (1 - rayDist / 0.72) * 0.58 * facing;
    }

    // 3. 下半幅透视世界状态波纹网格 (World-Model Horizon Plane)
    if (v >= horizonY) {
      const depth = (v - horizonY) / (1 - horizonY);
      const waveBands = 0.5 + 0.5 * Math.sin(36 / (depth + 0.15) - t * 2.5 + u * 6.0);
      const focusX = orbX + sway * 0.08;
      const caustic = Math.exp(-Math.pow((u - focusX) / (0.16 + depth * 0.24), 2));
      const gridLum = Math.pow(waveBands, 1.9) * (0.28 + 0.68 * depth) * (0.35 + 0.65 * caustic);
      lum = Math.max(lum, gridLum + caustic * 0.32 * facing * (1 - depth * 0.3));
    }

    return Math.min(1, lum);
  }

  // --------------------------------------------------------------------------
  // 场景 4 (Q4): 交互式稀疏策略量子群 (Interactive Drifting Policy Quanta)
  // --------------------------------------------------------------------------
  function sampleQuantaScene(u, v, t, inst) {
    const aspect = inst.width / Math.max(1, inst.height);
    let lum = 0;

    for (let i = 0; i < quantaAgents.length; i++) {
      const q = quantaAgents[i];
      let qx = q.ax + Math.cos(t * q.speed + q.phase) * q.rx;
      let qy = q.ay + Math.sin(t * q.speed * 1.15 + q.phase) * q.ry;

      if (inst.pointerActive) {
        const pull = 0.34 * Math.exp(-Math.hypot(qx - inst.smoothPx, qy - inst.smoothPy) * 2.0);
        qx += (inst.smoothPx - qx) * pull;
        qy += (inst.smoothPy - qy) * pull;
      }

      // 横向略微拉伸为参考视频同款扁梭形字符星团 (*@+, #%=)
      const dx = (u - qx) * aspect * 0.82;
      const dy = (v - qy) * 1.18;
      const d = Math.hypot(dx, dy);
      if (d < q.size) {
        const twinkle = 0.78 + 0.22 * Math.sin(t * 2.1 + q.phase * 2.3);
        const core = Math.exp(-(d * d) / (q.size * q.size * 0.26)) * 1.18;
        const skirt = (1 - d / q.size) * 0.42;
        const val = (core + skirt) * twinkle;
        if (val > lum) lum = val;
      }
    }

    if (inst.pointerActive) {
      const pd = Math.hypot((u - inst.smoothPx) * aspect, v - inst.smoothPy);
      if (pd < 0.08) {
        lum = Math.max(lum, Math.pow(1 - pd / 0.08, 1.8) * 1.0);
      }
    }

    for (let r = inst.ripples.length - 1; r >= 0; r--) {
      const rp = inst.ripples[r];
      const age = t - rp.born;
      if (age > 2.4) continue;
      const radius = age * 0.34;
      const dist = Math.hypot((u - rp.x) * aspect, v - rp.y);
      const ring = Math.exp(-Math.pow((dist - radius) / 0.028, 2)) * (1 - age / 2.4);
      lum = Math.max(lum, ring * 0.98);
    }

    return Math.min(1, lum);
  }

  // --------------------------------------------------------------------------
  // 双通道绘制：Pass 1 锐利等宽字符网格 + Pass 2 离屏光学散射辉光叠加
  // --------------------------------------------------------------------------
  function renderInstance(inst, t) {
    if (!inst.ctx || inst.cols <= 0 || inst.rows <= 0) return;

    inst.smoothPx += (inst.px - inst.smoothPx) * 0.12;
    inst.smoothPy += (inst.py - inst.smoothPy) * 0.12;

    const { ctx, bloomCtx, bloomCanvas, cols, rows, cellW, cellH, width, height, scene } = inst;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '500 10px "SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'top';

    const bw = bloomCanvas.width;
    const bh = bloomCanvas.height;
    bloomCtx.clearRect(0, 0, bw, bh);

    const sx = bw / width;
    const sy = bh / height;

    for (let r = 0; r < rows; r++) {
      const v = (r + 0.5) / rows;
      const py = r * cellH;

      for (let c = 0; c < cols; c++) {
        const u = (c + 0.5) / cols;
        let lum = 0;

        if (scene === 'wave') {
          lum = sampleWaveScene(u, v, t, inst);
        } else if (scene === 'torus') {
          lum = sampleTorusScene(u, v, t, inst);
        } else if (scene === 'beacon') {
          lum = sampleBeaconScene(u, v, t, inst);
        } else {
          lum = sampleQuantaScene(u, v, t, inst);
        }

        if (lum < 0.055) continue;

        const gIdx = Math.min(9, Math.max(1, Math.floor(Math.pow(lum, 0.86) * 10)));
        const cIdx = Math.min(63, Math.floor(lum * 63));
        const px = c * cellW;

        ctx.fillStyle = PALETTE_LUT[cIdx];
        ctx.fillText(RAMP[gIdx], px, py);

        // 对高亮度字符写入离屏辉光缓冲，营造真实白炽光晕扩散
        if (lum > 0.5) {
          const glowAlpha = (lum - 0.5) * 0.62;
          bloomCtx.fillStyle = lum > 0.8 ? `rgba(244,244,226,${glowAlpha})` : `rgba(130,145,208,${glowAlpha * 0.85})`;
          bloomCtx.fillRect(px * sx - 1, py * sy - 1, 3.2, 3.2);
        }
      }
    }

    // Pass 2: 叠加柔和光学散射层
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if ('filter' in ctx) {
      ctx.filter = 'blur(7px)';
    }
    ctx.globalAlpha = 0.88;
    ctx.drawImage(bloomCanvas, 0, 0, width, height);
    ctx.restore();
  }

  function renderAll(t) {
    instances.forEach((inst) => {
      if (inst.visible) renderInstance(inst, t);
    });
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTimestamp) / 1000);
    lastTimestamp = now;

    if (userPaused || document.hidden || !instances.some((i) => i.visible)) {
      rafId = null;
      return;
    }

    globalTime += dt;
    renderAll(globalTime);
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!userPaused && !document.hidden && instances.some((i) => i.visible) && !rafId) {
      lastTimestamp = performance.now();
      rafId = requestAnimationFrame(loop);
    } else {
      renderAll(globalTime);
    }
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function syncToggleUI() {
    if (!motionToggleBtn) return;
    motionToggleBtn.textContent = userPaused ? 'Play' : 'Pause';
    motionToggleBtn.setAttribute('aria-label', userPaused ? 'Play glyph animations' : 'Pause glyph animations');
  }

  if (motionToggleBtn) {
    syncToggleUI();
    motionToggleBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      syncToggleUI();
      if (userPaused) stopLoop();
      else startLoop();
    });
  }

  reducedMotionQuery.addEventListener('change', (e) => {
    userPaused = e.matches;
    syncToggleUI();
    if (userPaused) {
      stopLoop();
      renderAll(globalTime);
    } else {
      startLoop();
    }
  });

  // 离屏休眠调度：contentvisibilityautostatechange 捕获监听 + IntersectionObserver
  document.addEventListener(
    'contentvisibilityautostatechange',
    (event) => {
      if (!(event.target instanceof Element)) return;
      instances.forEach((inst) => {
        if (event.target.contains(inst.canvas)) {
          inst.visible = !event.skipped;
        }
      });
      if (instances.some((i) => i.visible)) startLoop();
      else stopLoop();
    },
    { capture: true }
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const match = instances.find((i) => i.stage === entry.target);
          if (match) match.visible = entry.isIntersecting;
        });
        if (instances.some((i) => i.visible)) startLoop();
        else stopLoop();
      },
      { rootMargin: '180px' }
    );
    instances.forEach((inst) => io.observe(inst.stage));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  window.addEventListener('resize', resizeAll);
  resizeAll();
  startLoop();
}

// ==========================================================================
// 7. TOP-LAYER EXIT TRANSITION PROBE & PUBLICATIONS MODULE
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
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
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

  // 原生 <dialog closedby="any"> 高清大图预览器
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

  // 搜索与 View Transitions 类别筛选
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
