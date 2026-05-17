/**
 * TBW (TheBrewedWeb) animation layer for The Authority Drift
 * Lenis smooth scroll + GSAP ScrollTrigger pinned/parallax/character-reveal.
 * Honors prefers-reduced-motion.
 *
 * Rules followed (from TheBrewedWeb CLAUDE.md):
 *  - One animation library per DOM element (GSAP owns scroll-driven)
 *  - Animate transform + opacity only - never layout properties
 *  - Reserve dimensions on hero/canvas to prevent CLS
 *  - LCP element never opacity:0 by default
 *  - View Transitions API where supported
 */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !window.gsap || !window.Lenis || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // ---------- LENIS SMOOTH SCROLL ----------
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.2,
  });

  // Hand Lenis the GSAP ticker (TBW non-negotiable pattern).
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Wire anchor smooth-scrolling through Lenis (overrides native smooth-scroll
  // so it doesn't fight Lenis).
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const nav = document.getElementById('topnav');
      const offset = nav ? -(nav.offsetHeight + 16) : -16;
      lenis.scrollTo(t, { offset, duration: 1.2 });
    });
  });

  // ---------- HERO: CHARACTER-BY-CHARACTER REVEAL (SplitText replacement) ----------
  const heroH1 = document.querySelector('.hero-headline');
  if (heroH1) {
    // Replace each word with span-wrapped chars; preserve <br> + <em>.
    const wrap = (el) => {
      const out = [];
      el.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const words = node.textContent.split(/(\s+)/);
          words.forEach((w) => {
            if (!w.trim()) {
              out.push(document.createTextNode(w));
              return;
            }
            const wordSpan = document.createElement('span');
            wordSpan.className = 'tbw-word';
            for (const ch of w) {
              const s = document.createElement('span');
              s.className = 'tbw-char';
              s.textContent = ch;
              wordSpan.appendChild(s);
            }
            out.push(wordSpan);
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'BR') {
            out.push(node.cloneNode(true));
          } else {
            const clone = node.cloneNode(false);
            wrap(node).forEach((c) => clone.appendChild(c));
            out.push(clone);
          }
        }
      });
      return out;
    };
    const fresh = wrap(heroH1);
    heroH1.innerHTML = '';
    fresh.forEach((n) => heroH1.appendChild(n));

    // Animate in.
    gsap.set('.tbw-char', { yPercent: 110, opacity: 0 });
    gsap.to('.tbw-char', {
      yPercent: 0,
      opacity: 1,
      duration: 1.05,
      ease: 'power3.out',
      stagger: { each: 0.018, from: 'start' },
      delay: 0.15,
    });
  }

  // ---------- HERO SUB + CTAs cascade ----------
  gsap.from('.hero-inner .eyebrow', { y: 16, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 });
  gsap.from('.hero-sub',            { y: 18, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.55 });
  gsap.from('.hero-actions',        { y: 22, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.75 });
  gsap.from('.hero-line',           { y: 14, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 1.0 });

  // ---------- BOOK MOCKUP: scroll-tilt parallax ----------
  const bookMockup = document.querySelector('.book-mockup');
  if (bookMockup) {
    gsap.to(bookMockup, {
      rotate: -3,
      y: -36,
      scrollTrigger: {
        trigger: '.section-book',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.1,
      },
    });
  }

  // ---------- INSIDE-THE-BOOK: gentle scale-in on enter ----------
  const insideImg = document.querySelector('.inside-visual img');
  if (insideImg) {
    gsap.from(insideImg, {
      scale: 0.94,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: insideImg, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
  }

  // ---------- SPEAKING STAGE: parallax background image ----------
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const strength = parseFloat(el.dataset.parallax) || 0.15;
    gsap.fromTo(el,
      { y: () => -strength * window.innerHeight * 0.5 },
      {
        y: () => strength * window.innerHeight * 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section, figure') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        },
      },
    );
  });

  // ---------- SECTION HEADINGS: lift + fade as they enter ----------
  document.querySelectorAll('.section-head h2, .section-head .eyebrow, .section-head .lede').forEach((el) => {
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  });

  // ---------- WORK / SPEAKING ROW / FAQ stagger ----------
  const groups = [
    { sel: '.speaking-list .speaking-row' },
    { sel: '.faq-list .faq-item' },
    { sel: '.topics-editorial .topic-row' },
    { sel: '.offers-cards .offer-card' },
  ];
  groups.forEach(({ sel }) => {
    const items = document.querySelectorAll(sel);
    if (!items.length) return;
    gsap.from(items, {
      y: 32,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: { trigger: items[0], start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });

  // ---------- TESTIMONIALS: dramatic one-by-one scroll reveal ----------
  const testimonialItems = document.querySelectorAll('.testimonials-wall .testimonial');
  testimonialItems.forEach((item, i) => {
    const fromX = i % 2 === 0 ? -60 : 60;
    gsap.set(item, { opacity: 0, x: fromX, y: 50, scale: 0.94 });
    gsap.to(item, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 1.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
        end: 'top 40%',
        toggleActions: 'play none none reverse',
      },
    });
    // animate the inner blockquote with subtle stagger
    const block = item.querySelector('blockquote');
    const cap = item.querySelector('figcaption');
    if (block) {
      gsap.set(block, { opacity: 0, y: 20 });
      gsap.to(block, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        delay: 0.25,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 82%', toggleActions: 'play none none reverse' },
      });
    }
    if (cap) {
      gsap.set(cap, { opacity: 0, y: 14 });
      gsap.to(cap, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        delay: 0.45,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 82%', toggleActions: 'play none none reverse' },
      });
    }
  });

  // ---------- COMPASS SUBTLE PARALLAX in final CTA ----------
  const finalCompass = document.querySelector('.final-compass');
  if (finalCompass) {
    gsap.to(finalCompass, {
      scale: 1.06,
      scrollTrigger: { trigger: '.final-cta', start: 'top bottom', end: 'bottom top', scrub: 1.4 },
    });
  }

  // ---------- VIEW TRANSITIONS for cross-page links ----------
  if (document.startViewTransition) {
    document.querySelectorAll('a[href$=".html"]:not([target])').forEach((a) => {
      a.addEventListener('click', (e) => {
        const url = a.getAttribute('href');
        if (!url || url.startsWith('http') || url.startsWith('#')) return;
        e.preventDefault();
        document.startViewTransition(() => { window.location.href = url; });
      });
    });
  }

  // ---------- REFRESH on font load (avoids jitter from late web-font swap) ----------
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
