/* ============================================
   HELLOEMMA.AI — Animations & Interactivity v2.1
   Vanilla JS · Zero dependencies
   Refactor: a11y, reduced-motion, safer language redirect
   ============================================ */

// ===== 0. AUTO LANGUAGE DETECTION =====
// Redirects to /en/ if browser is not Spanish. Respects manual override.
// Safeguarded: never redirects on file:// and never self-redirects to current URL.
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
    if (!page) page = 'index.html';
    var base = path.substring(0, path.lastIndexOf('/') + 1);
    var target = base + 'en/' + page;
    if (target !== path) window.location.replace(target);
    return;
  }

  if (isSpanish && inEn) {
    var newPath = path.replace('/en/', '/');
    if (newPath !== path) window.location.replace(newPath);
  }
})();

// Persist manual language choice
document.addEventListener('click', function(e) {
  var toggle = e.target.closest && e.target.closest('.lang-toggle');
  if (toggle) {
    var lang = (toggle.textContent || '').trim();
    document.cookie = 'lang_override=' + lang + ';path=/;max-age=31536000;samesite=lax';
  }
});

document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== 1. SCROLL REVEAL =====
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('active'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }


  // ===== 2. STICKY NAV =====
  const nav = document.getElementById('nav');
  if (nav) {
    const handleNavScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }


  // ===== 3. MOBILE NAV TOGGLE =====
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'nav-links');

    const setMenuState = (open) => {
      navLinks.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      const spans = navToggle.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    };

    navToggle.addEventListener('click', () => {
      setMenuState(!navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuState(false));
    });
  }


  // ===== 4. COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.proof-number[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    if (reducedMotion) {
      el.textContent = target;
      return;
    }

    const duration = 1800;
    const start = performance.now();

    const update = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  };

  const socialProof = document.getElementById('social-proof');
  if (socialProof && counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(c => animateCounter(c));
    } else {
      let countersStarted = false;
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            counters.forEach((c, i) => setTimeout(() => animateCounter(c), i * 200));
            counterObserver.disconnect();
          }
        });
      }, { threshold: 0.5 });
      counterObserver.observe(socialProof);
    }
  }


  // ===== 5. FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, idx) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    const answerId = 'faq-answer-' + idx;
    answer.id = answerId;
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answerId);

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-open');

      faqItems.forEach(other => {
        other.classList.remove('faq-open');
        const a = other.querySelector('.faq-answer');
        const q = other.querySelector('.faq-question');
        if (a) a.style.maxHeight = '0';
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('faq-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // ===== 6. SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const pos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: pos,
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });


  // ===== 7. IMAGE PARALLAX on scroll (skipped under reduced motion) =====
  if (!reducedMotion) {
    const featureVisuals = document.querySelectorAll('.feature-visual img');
    let ticking = false;

    const handleImageParallax = () => {
      featureVisuals.forEach(img => {
        const rect = img.parentElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (rect.top < viewportHeight && rect.bottom > 0) {
          const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
          const translate = (progress - 0.5) * 20;
          img.style.transform = `scale(1.05) translateY(${translate}px)`;
        }
      });
      ticking = false;
    };

    if (featureVisuals.length) {
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(handleImageParallax);
          ticking = true;
        }
      }, { passive: true });
    }
  }

});
