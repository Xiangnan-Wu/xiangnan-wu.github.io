// ── Shared post page logic ──────────────────────────────────────

// 1. Math-safe Markdown renderer
function renderContent(raw) {
  const store = [];

  // Protect display math $$...$$
  raw = raw.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    store.push({ display: true, tex });
    return `%%MD_${store.length - 1}%%`;
  });

  // Protect inline math $...$  (not inside code spans)
  raw = raw.replace(/(?<!`)\$([^\$\n]+?)\$(?!`)/g, (_, tex) => {
    store.push({ display: false, tex });
    return `%%MI_${store.length - 1}%%`;
  });

  // Parse Markdown
  marked.setOptions({ breaks: false, gfm: true });
  let html = marked.parse(raw);

  // Restore math with KaTeX
  html = html.replace(/%%MD_(\d+)%%/g, (_, i) =>
    katex.renderToString(store[+i].tex, { displayMode: true, throwOnError: false })
  );
  html = html.replace(/%%MI_(\d+)%%/g, (_, i) =>
    katex.renderToString(store[+i].tex, { displayMode: false, throwOnError: false })
  );

  return html;
}

// 2. Build TOC from h2/h3 headings
function buildTOC() {
  const headings = document.querySelectorAll('#post-content h2, #post-content h3');
  const list     = document.getElementById('toc-list');
  if (!list) return;

  headings.forEach((h, i) => {
    const slug = 'h-' + h.textContent.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-') + '-' + i;
    h.id = slug;

    const li  = document.createElement('li');
    li.className = h.tagName === 'H3' ? 'toc-h3' : '';
    li.innerHTML = `<a href="#${slug}">${h.textContent}</a>`;
    list.appendChild(li);
  });
}

// 3. TOC active highlight via IntersectionObserver
function initTOCObserver() {
  const links = document.querySelectorAll('.toc-list a');
  const io    = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.toc-list a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-56px 0px -55% 0px' });

  document.querySelectorAll('#post-content h2, #post-content h3')
    .forEach(h => io.observe(h));
}

// 4. Scroll reveal
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -32px 0px' });

  const SELECTORS = [
    '#post-content h2', '#post-content h3',
    '#post-content p',  '#post-content pre',
    '#post-content ul', '#post-content ol',
    '#post-content blockquote', '#post-content table',
    '#post-content .katex-display', '#post-content hr',
  ];

  document.querySelectorAll(SELECTORS.join(', ')).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i * 0.04, 0.28) + 's';
    io.observe(el);
  });
}

// 5. Syntax highlight
function highlightCode() {
  document.querySelectorAll('#post-content pre code').forEach(el => {
    hljs.highlightElement(el);
  });
}

// 6. Progress bar + header shadow
const $prog   = document.getElementById('progress');
const $header = document.getElementById('header');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  $prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  $header.classList.toggle('shadow', window.scrollY > 8);
}, { passive: true });

// 7. Boot — wait for KaTeX and marked to both be ready
window.addEventListener('load', () => {
  const raw  = document.getElementById('md-source').textContent;
  const html = renderContent(raw);
  document.getElementById('post-content').innerHTML = html;

  buildTOC();
  highlightCode();
  initReveal();
  initTOCObserver();
});
