/**
 * Cookie consent for The Authority Drift.
 * Self-hosted, no third-party CMP. Gates the Meta Pixel (and any future
 * non-essential trackers) behind explicit opt-in so nothing fires before
 * the visitor accepts. GDPR / ePrivacy: reject is as easy as accept, no
 * pre-ticked state, and a footer "Cookie Settings" link lets users change
 * their choice (withdraw consent) at any time.
 *
 * script.js fires fbq('track','Lead') guarded by `typeof fbq === 'function'`,
 * so those events stay gated automatically: no consent -> no fbq -> no Lead.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ad_cookie_consent_v1'; // 'granted' | 'denied'
  var PIXEL_ID = '3864806837147722';

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  // ---- Meta Pixel (only ever called after consent === granted) ----
  function loadMetaPixel() {
    if (window.fbq) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  // ---- Banner UI ----
  function injectStyles() {
    if (document.getElementById('ad-cc-styles')) return;
    var css =
      '#ad-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;' +
      'max-width:560px;margin:0 auto;background:#141414;color:#ECE9E1;' +
      'border:1px solid #2c2c2c;border-radius:14px;padding:20px 22px;' +
      'box-shadow:0 18px 50px rgba(0,0,0,.55);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
      'font-size:14px;line-height:1.55;}' +
      '#ad-cc p{margin:0 0 14px;color:#C9C6BE;}' +
      '#ad-cc a{color:#C9A84C;text-decoration:underline;}' +
      '#ad-cc .ad-cc-actions{display:flex;gap:10px;flex-wrap:wrap;}' +
      '#ad-cc button{flex:1 1 auto;min-width:120px;cursor:pointer;border-radius:9px;' +
      'padding:11px 16px;font-size:14px;font-weight:600;font-family:inherit;transition:opacity .15s ease;}' +
      '#ad-cc button:hover{opacity:.88;}' +
      '#ad-cc .ad-cc-accept{background:#C9A84C;color:#1A1A1A;border:1px solid #C9A84C;}' +
      '#ad-cc .ad-cc-reject{background:transparent;color:#ECE9E1;border:1px solid #555;}' +
      '#ad-cc-settings-link{cursor:pointer;}' +
      '@media (prefers-reduced-motion:no-preference){#ad-cc{animation:adccIn .35s cubic-bezier(.22,1,.36,1);}}' +
      '@keyframes adccIn{from{transform:translateY(16px);opacity:0;}to{transform:translateY(0);opacity:1;}}';
    var style = document.createElement('style');
    style.id = 'ad-cc-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function removeBanner() {
    var el = document.getElementById('ad-cc');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function showBanner() {
    if (document.getElementById('ad-cc')) return;
    injectStyles();
    var box = document.createElement('div');
    box.id = 'ad-cc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie consent');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML =
      '<p>We use cookies to run this site and to measure our marketing. ' +
      'Accept to allow analytics and advertising cookies, or reject to keep only what is strictly necessary. ' +
      'See our <a href="/privacy">Privacy Policy</a>.</p>' +
      '<div class="ad-cc-actions">' +
      '<button type="button" class="ad-cc-accept" id="ad-cc-accept">Accept</button>' +
      '<button type="button" class="ad-cc-reject" id="ad-cc-reject">Reject</button>' +
      '</div>';
    document.body.appendChild(box);
    document.getElementById('ad-cc-accept').addEventListener('click', accept);
    document.getElementById('ad-cc-reject').addEventListener('click', deny);
  }

  function accept() { setConsent('granted'); removeBanner(); loadMetaPixel(); }
  function deny() { setConsent('denied'); removeBanner(); }

  // Reopen control (withdraw / change consent)
  window.openCookieSettings = function () { showBanner(); };

  // Footer "Cookie Settings" link, inserted next to the Privacy link.
  // Handles both footer markups (the <li><a> list and the inline <a> row).
  function injectFooterLink() {
    if (document.getElementById('ad-cc-settings-link')) return;
    var priv = document.querySelector(
      'footer a[href$="privacy.html"], footer a[href$="/privacy"], footer a[href="privacy.html"]'
    );
    if (!priv) return;
    var link = document.createElement('a');
    link.href = '#';
    link.id = 'ad-cc-settings-link';
    link.textContent = 'Cookie Settings';
    link.addEventListener('click', function (e) { e.preventDefault(); showBanner(); });

    var parentLi = priv.closest ? priv.closest('li') : null;
    if (parentLi && parentLi.parentNode) {
      var li = document.createElement('li');
      li.appendChild(link);
      parentLi.parentNode.insertBefore(li, parentLi.nextSibling);
    } else {
      priv.parentNode.insertBefore(document.createTextNode(' · '), priv.nextSibling);
      priv.parentNode.insertBefore(link, priv.nextSibling.nextSibling);
    }
  }

  function init() {
    injectFooterLink();
    // Honor Global Privacy Control: a GPC signal is a legally recognized
    // opt-out (CPRA + several US state laws). If present, load no advertising
    // cookies and skip the banner entirely.
    if (navigator.globalPrivacyControl === true) { return; }
    var c = getConsent();
    if (c === 'granted') { loadMetaPixel(); }
    else if (c === 'denied') { /* respect rejection: load nothing */ }
    else { showBanner(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
