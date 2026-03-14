/**
 * Academic Homepage — Interactive JS
 * Based on xnhyacinth.github.io
 */

(function () {
  'use strict';

  const CONFIG = {
    animationDuration: 600,
    scrollOffset: 80,
    themeKey: 'theme-preference',
    lazyLoadThreshold: 100
  };

  const Utils = {
    throttle(func, limit) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    scrollToElement(element, offset = CONFIG.scrollOffset) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const ThemeManager = {
    currentTheme: 'light',
    init() {
      const saved = localStorage.getItem(CONFIG.themeKey);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved) {
        this.setTheme(saved);
      } else if (prefersDark) {
        this.setTheme('dark');
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(CONFIG.themeKey)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
      const btn = document.querySelector('.theme-toggle');
      if (btn) {
        btn.addEventListener('click', () => {
          btn.classList.add('switching');
          this.toggle();
          setTimeout(() => btn.classList.remove('switching'), 450);
        });
      }
    },
    setTheme(theme) {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(CONFIG.themeKey, theme);
    },
    toggle() {
      this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
    }
  };

  const NavigationManager = {
    init() {
      this.bindSmoothScroll();
      this.bindActiveLink();
      this.bindMobileMenu();
    },
    bindSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId === '#') return;
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            Utils.scrollToElement(target);
            history.pushState(null, null, targetId);
          }
        });
      });
    },
    bindActiveLink() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
            });
          }
        });
      }, { rootMargin: `-${CONFIG.scrollOffset}px 0px -50% 0px`, threshold: 0 });
      sections.forEach(s => observer.observe(s));
    },
    bindMobileMenu() {
      const toggle = document.querySelector('.mobile-menu-toggle');
      const nav = document.querySelector('.mobile-nav');
      if (!toggle || !nav) return;
      toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
      });
      nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('active');
          toggle.classList.remove('active');
        });
      });
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
          nav.classList.remove('active');
          toggle.classList.remove('active');
        }
      });
    }
  };

  const InteractionManager = {
    init() {
      this.initScrollReveal();
      this.initGlassNavbar();
      this.initMagneticIcons();
      this.initRippleButtons();
      this.initPageLoader();
      this.initAbstractToggle();
      this.initPublicationFilters();
    },
    initScrollReveal() {
      const reveals = document.querySelectorAll('.reveal');
      if (!reveals.length) return;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) { reveals.forEach(el => el.classList.add('active')); return; }
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(el => observer.observe(el));
    },
    initGlassNavbar() {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;
      const onScroll = Utils.throttle(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }, 100);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    },
    initMagneticIcons() {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;
      document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mousemove', (e) => {
          const rect = link.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
          link.style.transform = `translate(${x}px, ${y}px)`;
        });
        link.addEventListener('mouseleave', () => { link.style.transform = ''; });
      });
    },
    initRippleButtons() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        const existing = btn.querySelector('.ripple-effect');
        if (existing) existing.remove();
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    },
    initPageLoader() {
      const loader = document.getElementById('pageLoader');
      if (!loader) return;
      setTimeout(() => loader.classList.add('hidden'), 400);
      loader.addEventListener('transitionend', () => {
        if (loader.classList.contains('hidden')) loader.style.display = 'none';
      });
    },
    initAbstractToggle() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-abstract-toggle]');
        if (!btn) return;
        const id = btn.dataset.abstractToggle;
        const abstract = document.getElementById('abstract-' + id);
        if (!abstract) return;
        const isHidden = abstract.style.display === 'none' || !abstract.style.display;
        abstract.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden ? 'Hide Abstract' : 'Abstract';
      });
    },
    initPublicationFilters() {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const searchInput = document.querySelector('.search-input');
      const categories = document.querySelectorAll('.publication-category');
      const items = document.querySelectorAll('.publication-item');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.dataset.filter;
          categories.forEach(cat => {
            if (filter === 'all') {
              cat.style.display = '';
            } else {
              cat.style.display = cat.dataset.category === filter ? '' : 'none';
            }
          });
          if (searchInput) searchInput.value = '';
          items.forEach(item => item.style.display = '');
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.toLowerCase().trim();
          if (!q) { items.forEach(item => item.style.display = ''); return; }
          filterBtns.forEach(b => b.classList.remove('active'));
          const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
          if (allBtn) allBtn.classList.add('active');
          categories.forEach(cat => cat.style.display = '');
          items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(q) ? '' : 'none';
          });
        });
      }
    }
  };

  function init() {
    ThemeManager.init();
    NavigationManager.init();
    InteractionManager.init();
    document.body.classList.add('loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
