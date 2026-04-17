/* ============================================
   HELLOEMMA.AI — Animations & Interactivity v2
   Vanilla JS · Zero dependencies
   ============================================ */

// ===== 0. AUTO LANGUAGE DETECTION =====
// Redirects to /en/ if browser is not Spanish. Respects manual override.
(function() {
  var override = document.cookie.match(/lang_override=([^;]+)/);
  if (override) return; // user manually chose, don't redirect

  var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  var isSpanish = lang.startsWith('es');
  var path = window.location.pathname;

  // On root Spanish pages → redirect non-Spanish speakers to /en/
  if (!isSpanish && !path.includes('/en/')) {
    var page = path.split('/').pop() || 'index.html';
    if (page === '' || page === '/') page = 'index.html';
    var base = path.substring(0, path.lastIndexOf('/') + 1);
    window.location.replace(base + 'en/' + page);
    return;
  }

  // On /en/ pages → redirect Spanish speakers to root
  if (isSpanish && path.includes('/en/')) {
    var page = path.split('/').pop() || 'index.html';
    var newPath = path.replace('/en/', '/');
    window.location.replace(newPath);
    return;
  }
})();

// Set cookie when user clicks language toggle (persists manual choice)
document.addEventListener('click', function(e) {
  var toggle = e.target.closest('.lang-toggle');
  if (toggle) {
    var lang = toggle.textContent.trim(); // "EN" or "ES"
    document.cookie = 'lang_override=' + lang + ';path=/;max-age=31536000';
  }
});

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. SCROLL REVEAL =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ===== 2. STICKY NAV =====
  const nav = document.getElementById('nav');

  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();


  // ===== 3. MOBILE NAV TOGGLE =====
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = navToggle.querySelectorAll('span');
      if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }


  // ===== 4. COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.proof-number[data-target]');
  let countersDone = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1800;
    const start = performance.now();

    const update = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersDone) {
        countersDone = true;
        counters.forEach((c, i) => setTimeout(() => animateCounter(c), i * 200));
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const socialProof = document.getElementById('social-proof');
  if (socialProof) counterObserver.observe(socialProof);


  // ===== 5. FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      faqItems.forEach(other => {
        other.classList.remove('active');
        const a = other.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });


  // ===== 6. SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const pos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });


  // ===== 7. IMAGE PARALLAX on scroll =====
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

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleImageParallax);
      ticking = true;
    }
  }, { passive: true });

});
