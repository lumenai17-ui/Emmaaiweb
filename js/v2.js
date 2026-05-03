/* ============================================
   HELLOEMMA.AI v2 — Interactions
   ============================================ */

// Language redirect (same as v1)
(function() {
  if (window.location.protocol === 'file:') return;
  var cookies = document.cookie || '';
  var override = cookies.match(/(?:^|;\s*)lang_override=([^;]+)/);
  if (override) return;
  var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  var isSpanish = lang.startsWith('es');
  var path = window.location.pathname;
  var inEn = /\/en\//.test(path);
  if (!isSpanish && !inEn) {
    var page = path.split('/').pop() || 'index.html';
    var base = path.substring(0, path.lastIndexOf('/') + 1);
    var target = base + 'en/' + page;
    if (target !== path) window.location.replace(target);
  }
  if (isSpanish && inEn) {
    var newPath = path.replace('/en/', '/');
    if (newPath !== path) window.location.replace(newPath);
  }
})();

document.addEventListener('click', function(e) {
  var t = e.target.closest && e.target.closest('.lang-toggle');
  if (t) document.cookie = 'lang_override=' + (t.textContent||'').trim() + ';path=/;max-age=31536000;samesite=lax';
});

document.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveals
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
  }

  // Nav scroll
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile nav
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');
    const set = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      const s = toggle.querySelectorAll('span');
      if (open) {
        s[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        s[1].style.opacity = '0';
        s[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else { s.forEach(x => { x.style.transform = ''; x.style.opacity = ''; }); }
    };
    toggle.addEventListener('click', () => set(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
  }

  // Counters
  const counters = document.querySelectorAll('.proof-n[data-target]');
  const proofEl = document.getElementById('social-proof');
  if (proofEl && counters.length) {
    let started = false;
    const anim = (el) => {
      const t = parseInt(el.dataset.target, 10);
      if (reduced) { el.textContent = t; return; }
      const dur = 1600, start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * t);
        if (p < 1) requestAnimationFrame(step); else el.textContent = t;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          counters.forEach((c, i) => setTimeout(() => anim(c), i * 150));
          cio.disconnect();
        }
      }, { threshold: 0.5 });
      cio.observe(proofEl);
    } else { counters.forEach(c => anim(c)); }
  }

  // FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item, i) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    const id = 'faq-a-' + i;
    a.id = id;
    q.setAttribute('aria-controls', id);
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(o => {
        o.classList.remove('open');
        const oa = o.querySelector('.faq-a');
        const oq = o.querySelector('.faq-q');
        if (oa) oa.style.maxHeight = '0';
        if (oq) oq.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const t = document.querySelector(href);
      if (t) {
        e.preventDefault();
        const pos = t.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: pos, behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  });

  // Parallax on scroll (subtle)
  if (!reduced) {
    const pEls = document.querySelectorAll('.feat-visual');
    let tick = false;
    const doPar = () => {
      const vh = window.innerHeight;
      pEls.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          const p = (vh - r.top) / (vh + r.height);
          el.style.transform = `translateY(${(p - 0.5) * 30}px)`;
        }
      });
      tick = false;
    };
    if (pEls.length) {
      window.addEventListener('scroll', () => {
        if (!tick) { requestAnimationFrame(doPar); tick = true; }
      }, { passive: true });
    }
  }
});
