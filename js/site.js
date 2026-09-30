/** Shared navigation and publication search for the academic homepage. */
(function () {
  'use strict';

  function initNavigation() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-nav');

    if (toggle && menu) {
      const closeMenu = () => {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        toggle.textContent = 'Menu';
      };

      toggle.addEventListener('click', () => {
        const opening = menu.hidden;
        menu.hidden = !opening;
        toggle.setAttribute('aria-expanded', String(opening));
        toggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
        toggle.textContent = opening ? 'Close' : 'Menu';
      });
      menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
      document.addEventListener('click', event => {
        if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !menu.hidden) {
          closeMenu();
          toggle.focus();
        }
      });
      window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
        if (event.matches) closeMenu();
      });
      document.documentElement.classList.add('js');
    }

    const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
    const sections = [...document.querySelectorAll('main > section[id]')];
    if (!links.length || !sections.length) return;

    const updateActiveLink = () => {
      const current = sections.filter(section => section.getBoundingClientRect().top <= 140).at(-1);
      links.forEach(link => {
        const matches = current && link.hash === '#' + current.id;
        link.classList.toggle('active', Boolean(matches));
        if (matches) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    let scheduled = false;
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        updateActiveLink();
        scheduled = false;
      });
    }, { passive: true });
    updateActiveLink();
  }

  function initPublications() {
    const categories = [...document.querySelectorAll('.publication-category')];
    const filters = [...document.querySelectorAll('.filter-btn')];
    const search = document.querySelector('#publications .search-input');
    const empty = document.getElementById('publication-empty');
    if (!categories.length || !search) return;
    let filter = 'all';

    const update = () => {
      const query = search.value.trim().toLowerCase();
      let count = 0;
      categories.forEach(category => {
        const allowed = filter === 'all' || category.dataset.category === filter;
        let categoryCount = 0;
        category.querySelectorAll('.publication-item').forEach(item => {
          const visible = allowed && item.textContent.toLowerCase().includes(query);
          item.hidden = !visible;
          if (visible) categoryCount += 1;
        });
        category.hidden = categoryCount === 0;
        count += categoryCount;
      });
      filters.forEach(button => {
        const active = button.dataset.filter === filter;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (empty) empty.hidden = count > 0;
    };

    filters.forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      update();
    }));
    search.addEventListener('input', update);
    update();
  }

  function init() {
    initNavigation();
    initPublications();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
