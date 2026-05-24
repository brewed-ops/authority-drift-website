// Michael N. Fineman - site interactions
// Mobile nav, scroll-state nav, carousel, FAQ, smooth-scroll, scroll-reveal, footer year

(function () {
  'use strict';

  /* ---------- year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-right');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- scrolled nav ---------- */
  const nav = document.getElementById('topnav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile drawer (a11y: focus trap, focus return, inert) ---------- */
  const toggle  = document.getElementById('navToggle');
  const closer  = document.getElementById('navClose');
  const drawer  = document.getElementById('mobileDrawer');
  let lastFocusedBeforeDrawer = null;

  const getFocusables = (root) => Array.from(
    root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter(el => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);

  const trapTab = (e) => {
    if (e.key !== 'Tab' || !drawer || !drawer.classList.contains('open')) return;
    const focusables = getFocusables(drawer);
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const openDrawer  = () => {
    if (!drawer) return;
    lastFocusedBeforeDrawer = document.activeElement;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.removeAttribute('inert');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    document.body.style.overflow = 'hidden';
    // move focus into the drawer (prefer close button)
    requestAnimationFrame(() => {
      if (closer) closer.focus();
      else {
        const first = getFocusables(drawer)[0];
        if (first) first.focus();
      }
    });
    document.addEventListener('keydown', trapTab);
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapTab);
    // return focus to the trigger
    if (lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === 'function') {
      lastFocusedBeforeDrawer.focus();
    } else if (toggle) {
      toggle.focus();
    }
  };

  // initialise closed state
  if (drawer && !drawer.classList.contains('open')) drawer.setAttribute('inert', '');

  if (toggle) toggle.addEventListener('click', openDrawer);
  if (closer) closer.addEventListener('click', closeDrawer);

  // close on link click inside drawer
  if (drawer) {
    drawer.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', closeDrawer));
  }

  // close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer();
  });

  /* ---------- marquee pause toggle (a11y - WCAG 2.2.2 Pause, Stop, Hide) ---------- */
  const marqueePauseBtn = document.getElementById('marqueePause');
  const quotesTrack = document.querySelector('.quotes-track');
  if (marqueePauseBtn && quotesTrack) {
    // respect prefers-reduced-motion at load: start paused if user prefers reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      quotesTrack.classList.add('paused');
      marqueePauseBtn.setAttribute('aria-pressed', 'true');
      const lbl = marqueePauseBtn.querySelector('.marquee-pause-label');
      if (lbl) lbl.textContent = 'Play';
    }
    marqueePauseBtn.addEventListener('click', () => {
      const isPaused = quotesTrack.classList.toggle('paused');
      marqueePauseBtn.setAttribute('aria-pressed', String(isPaused));
      const lbl = marqueePauseBtn.querySelector('.marquee-pause-label');
      if (lbl) lbl.textContent = isPaused ? 'Play' : 'Pause';
    });
  }

  /* ---------- smooth scroll for in-page anchors (skipped if Lenis is loaded) ---------- */
  if (!window.Lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ---------- carousel ---------- */
  const carousel = document.getElementById('carousel');
  if (carousel) {
    const track  = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prev   = document.getElementById('carPrev');
    const next   = document.getElementById('carNext');
    const dotsEl = document.getElementById('carDots');

    let idx = 0;
    let timer = null;
    const AUTOPLAY_MS = 7000;

    // dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i, true));
      dotsEl.appendChild(dot);
    });
    const dots = Array.from(dotsEl.children);

    const progressEl = document.getElementById('wordsCurrent');
    const update = () => {
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      if (progressEl) progressEl.textContent = String(idx + 1).padStart(2, '0');
    };

    const goTo = (i, userTriggered = false) => {
      idx = (i + slides.length) % slides.length;
      update();
      if (userTriggered) restart();
    };

    const start = () => {
      stop();
      timer = setInterval(() => goTo(idx + 1), AUTOPLAY_MS);
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const restart = () => { stop(); start(); };

    if (prev) prev.addEventListener('click', () => goTo(idx - 1, true));
    if (next) next.addEventListener('click', () => goTo(idx + 1, true));

    // pause on hover, resume on leave
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    // touch swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) goTo(idx + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    update();
    start();
  }

  /* ---------- book mockup carousel (auto + manual prev/next + dots) ---------- */
  const bookCarousel = document.getElementById('bookCarousel');
  if (bookCarousel) {
    const slides  = Array.from(bookCarousel.querySelectorAll('.book-slide'));
    const prevBtn = document.getElementById('bookPrev');
    const nextBtn = document.getElementById('bookNext');
    const dotsEl  = document.getElementById('bookDots');

    let idx = 0;
    let timer = null;
    const BOOK_AUTO_MS = 4000;

    // Build dots
    if (dotsEl) {
      slides.forEach((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'book-dot';
        d.setAttribute('aria-label', `Show mockup ${i + 1}`);
        d.addEventListener('click', () => bookGo(i, true));
        dotsEl.appendChild(d);
      });
    }
    const dots = dotsEl ? Array.from(dotsEl.children) : [];

    const bookUpdate = () => {
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    const bookGo = (i, userTriggered = false) => {
      idx = (i + slides.length) % slides.length;
      bookUpdate();
      if (userTriggered) bookRestart();
    };

    const bookStart = () => {
      bookStop();
      timer = setInterval(() => bookGo(idx + 1), BOOK_AUTO_MS);
    };
    const bookStop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const bookRestart = () => { bookStop(); bookStart(); };

    if (prevBtn) prevBtn.addEventListener('click', () => bookGo(idx - 1, true));
    if (nextBtn) nextBtn.addEventListener('click', () => bookGo(idx + 1, true));

    // Pause on hover, resume on leave
    bookCarousel.addEventListener('mouseenter', bookStop);
    bookCarousel.addEventListener('mouseleave', bookStart);

    // Touch swipe support for mobile
    let bookTouchX = 0;
    bookCarousel.addEventListener('touchstart', (e) => { bookTouchX = e.changedTouches[0].screenX; }, { passive: true });
    bookCarousel.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - bookTouchX;
      if (Math.abs(dx) > 50) bookGo(idx + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    // Respect reduced motion - no auto-cycle but manual controls still work
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bookUpdate();
    if (!reducedMotion) bookStart();
  }

  /* ---------- FAQ accordions ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close all others
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const oq = other.querySelector('.faq-q');
          if (oq) oq.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- welcome video click-through (placeholder until Zach's edit lands) ---------- */
  const welcomeVid = document.getElementById('welcomeVideo');
  if (welcomeVid) {
    const videoEl    = welcomeVid.querySelector('#welcomeVideoEl') || welcomeVid.querySelector('video');
    const placeholder = welcomeVid.querySelector('.video-placeholder');
    const trigger = () => {
      const src = videoEl && videoEl.querySelector('source') && videoEl.querySelector('source').getAttribute('src');
      // probe whether the video file exists. If not, fall back to a graceful caption.
      if (videoEl && src) {
        fetch(src, { method: 'HEAD' })
          .then(r => {
            if (!r.ok) throw new Error('no video yet');
            videoEl.hidden = false;
            if (placeholder) placeholder.style.display = 'none';
            const p = videoEl.play();
            if (p && p.catch) p.catch(() => {});
          })
          .catch(() => {
            const cap = welcomeVid.querySelector('.video-caption');
            if (cap) cap.textContent = 'Video coming shortly - check back soon.';
          });
      }
    };
    welcomeVid.addEventListener('click', trigger);
    welcomeVid.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); } });
  }

  /* ---------- referral page: sponsor variant ---------- */
  const refTitle = document.getElementById('referralTitle');
  const refIntro = document.getElementById('referralIntro');
  if (refTitle && refIntro) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sponsor') === '1') {
      refTitle.textContent = 'Sponsor a Friend';
      refIntro.textContent = 'Your friend thought enough of you to think this might benefit your life. Sponsor their access and we\'ll handle the rest.';
    }
  }

  /* ---------- referral form: client-side submit handling ---------- */
  const refForm = document.getElementById('referralForm');
  if (refForm) {
    // GHL inbound webhook: "01. Referrals From Website"
    const REFERRAL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/oxe72L0Uva4DN1UM1qJx/webhook-trigger/4fced324-e420-4190-9ddb-265abc681cac';
    refForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = (document.getElementById('ref-first')?.value || '').trim();
      const lastName = (document.getElementById('ref-last')?.value || '').trim();
      const isSponsor = new URLSearchParams(window.location.search).get('sponsor') === '1';
      const payload = {
        full_name: (firstName + ' ' + lastName).trim(),
        first_name: firstName,
        last_name: lastName,
        email: (document.getElementById('ref-email')?.value || '').trim(),
        referred_by: (document.getElementById('ref-by')?.value || '').trim(),
        message: (document.getElementById('ref-msg')?.value || '').trim(),
        source: isSponsor ? 'Website - Sponsor a Friend' : 'Website - Referral',
        page_url: window.location.href
      };
      // GHL inbound webhook needs application/json (it rejects text/plain bodies). Its CORS preflight is handled, so no hack needed. Fire-and-forget.
      fetch(REFERRAL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
      // fire Meta Pixel Lead event
      if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'Referral Submission' });
      const status = document.getElementById('referralStatus');
      if (status) {
        status.style.display = 'block';
        status.textContent = 'Thank you. We received it. Michael will be in touch personally.';
      }
      refForm.reset();
    });
  }

  /* ---------- book-call (application) form: submit to GHL cohort webhook ---------- */
  const bookForm = document.getElementById('bookCallForm');
  if (bookForm) {
    // GHL inbound webhook: "Cohort Application / Book a Call"
    const BOOKCALL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/oxe72L0Uva4DN1UM1qJx/webhook-trigger/ca6dd07f-acd4-4b78-80c6-162472d4023f';
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (n) => (bookForm.querySelector('[name="' + n + '"]')?.value || '').trim();
      const firstName = val('first_name');
      const lastName = val('last_name');
      const payload = {
        full_name: (firstName + ' ' + lastName).trim(),
        first_name: firstName,
        last_name: lastName,
        email: val('email'),
        phone: val('phone'),
        exploring: val('exploring'),
        investment_level: val('investment_level'),
        message: val('moment'),
        source: 'Website - Book a Call',
        page_url: window.location.href
      };
      // GHL inbound webhook needs application/json (it rejects text/plain bodies). Its CORS preflight is handled, so no hack needed. Fire-and-forget.
      fetch(BOOKCALL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
      // fire Meta Pixel Lead event
      if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'Book a Call Application' });
      const status = document.getElementById('bookCallStatus');
      if (status) {
        status.style.display = 'block';
        status.textContent = 'Thank you. Your application is in. Michael reviews every submission personally and will be in touch within two business days.';
        status.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      bookForm.reset();
    });
  }

})();
