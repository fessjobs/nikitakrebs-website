/* BB Bausanierung — Scroll-Choreografie
   GSAP + ScrollTrigger + Lenis, alles selbst gehostet unter assets/js/.
   Die Seite ist ohne JS und ohne GSAP vollständig lesbar: das Inline-Skript im
   <head> setzt .js, und nur unter .js werden Reveal-Inhalte überhaupt versteckt.
   Fällt GSAP aus oder ist "Bewegung reduzieren" aktiv, nimmt main.js .js wieder
   weg — dann steht alles sofort sichtbar da. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const html = document.documentElement;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const motion = hasGsap && !reduced;
  window.__bb = 1;   // sagt dem Inline-Skript im <head>: main.js läuft

  /* ---------- statische Seite: alles sichtbar, keine Tweens ---------- */
  if (!motion) html.classList.remove('js');

  /* ---------- Menü: Fokusfalle, Scroll-Sperre, Fokus-Rückgabe ---------- */
  const menu = $('[data-menu]'), toggle = $('[data-menu-toggle]');
  const pageRegions = [$('main'), $('.footer')].filter(Boolean);
  let menuOpen = false, lastFocus = null, menuTl = null, lenis = null;

  const menuFocusables = () => $$('a[href], button', menu);

  function trapTab(e) {
    if (e.key !== 'Tab' || !menuOpen) return;
    const items = menuFocusables();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    // Der Burger bleibt über dem Overlay bedienbar und gehört mit in den Kreis
    const ring = [toggle].concat(items);
    const active = document.activeElement;
    if (e.shiftKey && active === ring[0]) { e.preventDefault(); ring[ring.length - 1].focus(); }
    else if (!e.shiftKey && active === ring[ring.length - 1]) { e.preventDefault(); ring[0].focus(); }
    else if (!ring.includes(active)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
  }

  function setMenu(open) {
    if (!menu || !toggle) return;
    menuOpen = open;
    document.body.classList.toggle('menu-open', open);
    html.classList.toggle('menu-open', open);            // Scroll-Sperre, unabhängig von Lenis
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    menu.setAttribute('aria-hidden', String(!open));
    pageRegions.forEach((el) => { el.inert = open; });   // Hintergrund aus der Tab-Reihenfolge nehmen
    if (open) {
      lastFocus = document.activeElement;
      menu.style.visibility = 'visible';            // erst sichtbar, dann fokussierbar
      if (menuTl) menuTl.timeScale(1).play();
      else menu.style.clipPath = 'none';
      if (lenis) lenis.stop();
      const first = menuFocusables()[0];
      if (first) first.focus({ preventScroll: true });
    } else {
      if (menuTl) menuTl.timeScale(1.6).reverse();
      else { menu.style.clipPath = ''; menu.style.visibility = 'hidden'; }
      if (lenis) lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      else toggle.focus({ preventScroll: true });
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!menuOpen));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });
    addEventListener('keydown', trapTab);
  }

  /* ---------- Sprungziele: Fokus wandert mit, sonst springt Tab zurück an den Anfang ---------- */
  function focusTarget(t) {
    if (!t) return;
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  }

  /* ---------- Nav: Wortmarke tritt nach dem Hero ab ---------- */
  const nav = $('[data-nav]');
  const hero = $('[data-hero]');
  function watchCompact() {
    if (!nav || !hero) return;
    const update = () => nav.classList.toggle('is-compact', window.scrollY > innerHeight * 0.6);
    update();
    addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Nav-Theme je Sektion + Safari-Balkenfarbe ---------- */
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const setBarColor = (el) => {
    if (!themeMeta) return;
    let bg = getComputedStyle(el).backgroundColor, node = el;
    while ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && node.parentElement) { node = node.parentElement; bg = getComputedStyle(node).backgroundColor; }
    if (themeMeta.getAttribute('content') !== bg) { themeMeta.setAttribute('content', bg); html.style.backgroundColor = bg; }
  };
  function watchNavTheme() {
    if (!nav || !hasGsap) return;
    $$('[data-nav-theme]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 60px', end: 'bottom 60px',
        onToggle: (st) => { if (st.isActive) { nav.classList.toggle('is-dark', sec.dataset.navTheme === 'dark'); setBarColor(sec); } }
      });
    });
  }

  /* ---------- ohne Bewegung ist hier Schluss ---------- */
  if (!motion) {
    watchCompact();
    if (hasGsap) { ScrollTrigger.config({ ignoreMobileResize: true }); watchNavTheme(); }
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const t = $(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        if (menuOpen) setMenu(false);
        t.scrollIntoView();
        focusTarget(t);
        history.pushState(null, '', a.getAttribute('href'));
      });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Smooth Scroll (nur Desktop) ---------- */
  if (!isTouch && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Menü-Timeline nachrüsten ---------- */
  if (menu) {
    gsap.set('[data-menu-link]', { y: 60, opacity: 0 });
    gsap.set('.menu__foot a', { y: 10, opacity: 0 });
    menuTl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu, { visibility: 'hidden' }) })
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power4.inOut' })
      .to('[data-menu-link]', { y: 0, opacity: 0.75, duration: 0.7, stagger: 0.06, ease: 'power4.out' }, '-=0.35')
      .to('.menu__foot a', { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 }, '-=0.4');
  }

  watchCompact();
  watchNavTheme();

  /* ---------- Wörter → Zeichen (Wörter brechen nie mitten drin) ---------- */
  function splitText() {
    $$('[data-split]').forEach((el) => {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = '1';
      const txt = el.textContent.trim();
      el.textContent = '';
      txt.split(/\s+/).forEach((word, i) => {
        if (i) el.appendChild(document.createTextNode(' '));
        const w = document.createElement('span');
        w.className = 'wd';
        w.setAttribute('aria-hidden', 'true');
        [...word].forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = ch;
          w.appendChild(s);
        });
        el.appendChild(w);
      });
    });
  }

  /* ---------- Hero-Intro, erst wenn die Displayschrift steht ---------- */
  function heroIntro() {
    splitText();
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero__h .ch', { yPercent: 70, opacity: 0, duration: 1, stagger: 0.018, willChange: 'transform', clearProps: 'willChange' }, 0.15)
      .from('[data-hero-eyebrow]', { y: 16, opacity: 0, duration: 0.7 }, 0.3)
      .from('[data-hero-p], [data-hero-actions] > *', { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.7)
      .from('.nav__logo, .nav__right > *', { opacity: 0, duration: 0.7, stagger: 0.08 }, 0.6)
      .from('[data-hero-scroll]', { y: 20, opacity: 0, duration: 0.7 }, 1);
  }
  const displayReady = document.fonts && document.fonts.load
    ? Promise.race([document.fonts.load('900 1em "Barlow Condensed"').catch(() => {}), new Promise((r) => setTimeout(r, 1200))])
    : Promise.resolve();
  displayReady.then(heroIntro);

  /* ---------- Hero: Höhenlinien zeichnen sich, driften, folgen der Maus ---------- */
  (function genTopo() {
    const g = $('[data-topo-lines]');
    if (!g) return;
    const N = isTouch ? 4 : 7, W = 1920, H = 1000;
    const rnd = (seed) => { const x = Math.sin(seed) * 10000; return x - Math.floor(x); };
    for (let k = 0; k < N; k++) {
      const base = -80 + (k / (N - 1)) * (H + 160);
      const a1 = 60 + rnd(k + 1) * 60, a2 = 10 + rnd(k + 7) * 14, f1 = 0.0016 + rnd(k + 3) * 0.0008, f2 = 0.004 + rnd(k + 5) * 0.002;
      const ph1 = rnd(k + 11) * Math.PI * 2, ph2 = rnd(k + 13) * Math.PI * 2;
      let d = '';
      for (let x = -60; x <= W + 60; x += 40) {
        const cx = (x - W / 2) / (W / 2); const bulge = Math.exp(-cx * cx * 2.2) * (k < N / 2 ? -1 : 1) * 110;
        const y = base + bulge + Math.sin(x * f1 + ph1) * a1 + Math.sin(x * f2 + ph2) * a2;
        d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      g.appendChild(path);
    }
    (isTouch ? [[1600, 640, 170]] : [[300, 260, 190], [1600, 640, 170]]).forEach(([cx, cy, r], i) => {
      for (let ring = 0; ring < (isTouch ? 2 : 3); ring++) {
        const rr = r - ring * 34; let d = '';
        for (let a = 0; a <= 360; a += 12) {
          const t = a * Math.PI / 180, wob = 1 + Math.sin(t * 3 + i) * 0.08 + Math.cos(t * 5 + ring) * 0.05;
          const x = cx + Math.cos(t) * rr * wob * 1.25, y = cy + Math.sin(t) * rr * wob;
          d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d + ' Z'); g.appendChild(path);
      }
    });
  })();

  const topoPaths = $$('.hero__topo path');
  topoPaths.forEach((p, i) => {
    const isLine = p.parentElement.getAttribute('fill') === 'none';
    if (isLine) {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      const dur = 2.6 + (i % 5) * 0.6;
      if (isTouch) { gsap.to(p, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', delay: 1.2 + i * 0.3 }); return; }
      gsap.timeline({ repeat: -1, delay: 1.2 + (i % 7) * 0.45 })
        .to(p, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' })
        .to(p, { strokeDashoffset: -len, duration: dur, ease: 'power2.inOut' }, '+=' + (0.8 + (i % 3) * 0.5))
        .set(p, { strokeDashoffset: len }, '+=' + (0.6 + (i % 4) * 0.4));
    } else {
      if (isTouch) return;
      gsap.set(p, { transformOrigin: '50% 50%' });
      gsap.to(p, { scale: 1.12, rotation: i % 2 ? 8 : -8, duration: 6 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    if (!isTouch) gsap.to(p, { x: (i % 2 ? 1 : -1) * (12 + (i % 6) * 4), y: (i % 3 - 1) * 10, duration: 7 + (i % 5) * 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: (i % 6) * 0.4 });
  });
  if (!isTouch) {
    // Parallax nur, solange der Hero im Bild ist — danach kostet er nur Rechenzeit
    let heroVisible = true;
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
    }
    addEventListener('mousemove', (e) => {
      if (!heroVisible) return;
      const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      topoPaths.forEach((p, i) => {
        const depth = 0.3 + (i % 5) * 0.25;
        gsap.to(p, { xPercent: x * -2.2 * depth, yPercent: y * -2 * depth, duration: 1.4 + i * 0.1, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }
  if (hero) gsap.to('.hero__inner', { yPercent: -12, opacity: 0.4, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'bottom 80%', end: 'bottom 20%', scrub: true } });


  /* ---------- Hero-Hintergrundvideo ---------- */
  (function () {
    const wrap = $('[data-hero-video]');
    const vid = wrap && $('[data-hero-video-el]', wrap);
    if (!wrap || !vid) return;
    // Laeuft auch auf dem Handy. Nur Datensparmodus und langsame Netze
    // bekommen es nicht - dort waeren 400 KB Deko nicht zu rechtfertigen.
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) { wrap.remove(); return; }
    // Kein H.264 im Browser: gar nicht erst 400 KB anfordern
    if (!vid.canPlayType('video/mp4; codecs="avc1.42E01E"')) { wrap.remove(); return; }

    let on = false;
    function enable() {
      if (on) return;
      on = true;
      wrap.classList.add('is-on');
      if (!hero) return;
      hero.classList.add('has-video');
      // Der Hero wird jetzt dunkel: Nav und Safari-Balken muessen mit
      hero.dataset.navTheme = 'dark';
      const r = hero.getBoundingClientRect();
      if (nav && r.top <= 60 && r.bottom > 60) { nav.classList.add('is-dark'); setBarColor(hero); }
    }
    // NotAllowedError heisst nur "noch keine Geste" - alles andere (Codec,
    // kaputte Datei) ist endgueltig, dann verschwindet die Ebene.
    const tryPlay = () => vid.play().then(enable).catch((e) => {
      if (e && e.name === 'NotSupportedError') wrap.remove();
    });

    // preload="none" bleibt stehen: play() holt die Datei selbst. Erst
    // preload umzustellen und dann load() zu rufen, laedt sie zweimal.
    vid.addEventListener('error', () => wrap.remove(), { once: true });
    tryPlay();
    // iOS verweigert Autoplay im Stromsparmodus. Die erste Beruehrung ist
    // eine Nutzergeste - dann darf es doch, also holen wir es dort nach.
    ['touchstart', 'click'].forEach(t => document.addEventListener(t, tryPlay, { once: true, passive: true }));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { if (e.isIntersecting) tryPlay(); else vid.pause(); }).observe(wrap);
    }
  })();

  /* ---------- programmatisches Scrollen, jederzeit abbrechbar ---------- */
  let scrollTween = null;
  function scrollToEl(el) {
    if (!el) return;
    if (scrollTween) scrollTween.kill();
    const y = el.getBoundingClientRect().top + window.scrollY;
    const o = { v: window.scrollY };
    const stop = () => { if (scrollTween) scrollTween.kill(); cleanup(); };
    const cleanup = () => {
      removeEventListener('touchstart', stop);
      removeEventListener('wheel', stop);
      scrollTween = null;
    };
    addEventListener('touchstart', stop, { passive: true });
    addEventListener('wheel', stop, { passive: true });
    scrollTween = gsap.to(o, {
      v: y, duration: 1.3, ease: 'power4.inOut',
      onUpdate: () => { lenis ? lenis.scrollTo(o.v, { immediate: true, force: true }) : window.scrollTo(0, o.v); },
      onComplete: () => { cleanup(); focusTarget(el); }
    });
  }

  /* ---------- Menü-Links ---------- */
  $$('[data-menu-link]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(a.getAttribute('href'));
      const href = a.getAttribute('href');
      setMenu(false);
      if (target) setTimeout(() => { scrollToEl(target); history.pushState(null, '', href); }, 450);
    });
  });

  /* ---------- Marquee: endlos, nahtlos, nach Schriftwechsel neu vermessen ---------- */
  (function () {
    const track = $('[data-marquee]');
    if (!track) return;
    let tween = null;
    const run = () => {
      if (tween) tween.kill();
      gsap.set(track, { x: 0 });
      // scrollWidth enthält eine Lücke weniger als die halbe Strecke braucht
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      const half = (track.scrollWidth + gap) / 2;
      if (!half) return;
      tween = gsap.to(track, { x: -half, duration: half / 60, ease: 'none', repeat: -1 });
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);
    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 200); });
  })();

  /* ---------- Reveals ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- Zähler ---------- */
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to({ v: 0 }, { v: target, duration: 1.6, ease: 'power3.out', onUpdate() { el.textContent = Math.round(this.targets()[0].v); } }) });
  });

  /* ---------- Partner: Wort für Wort ---------- */
  (function () {
    const h = $('[data-words]');
    if (!h) return;
    const txt = h.textContent.trim();
    h.textContent = '';
    // echte Leerzeichen zwischen den Wörtern, sonst brechen Suche und Kopieren
    txt.split(/\s+/).forEach((word, i) => {
      if (i) h.appendChild(document.createTextNode(' '));
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = word;
      h.appendChild(s);
    });
    gsap.to($$('.w', h), { opacity: 1, stagger: 0.25, ease: 'none',
      scrollTrigger: { trigger: h, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
  })();

  /* ---------- Footer-Schriftzug ---------- */
  if ($('.footer__brand')) {
    splitText();
    gsap.from('.footer__brand .ch', { yPercent: 100, opacity: 0, duration: 1, stagger: 0.03, ease: 'power4.out',
      scrollTrigger: { trigger: '.footer', start: 'top 75%' } });
  }

  /* ---------- Ankerlinks ---------- */
  $$('a[href^="#"]:not([data-menu-link])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      const t = $(href);
      if (!t) return;
      e.preventDefault();
      scrollToEl(t);
      history.pushState(null, '', href);
    });
  });

  /* ---------- Trigger nachziehen, wenn sich das Layout noch ändert ---------- */
  let refreshT;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => { ScrollTrigger.refresh(); if (lenis) lenis.resize(); }, 150); };
  $$('img').forEach((im) => { if (!im.complete) im.addEventListener('load', queueRefresh, { once: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueRefresh);
  addEventListener('load', () => { queueRefresh(); setTimeout(queueRefresh, 1500); });
  addEventListener('orientationchange', () => setTimeout(queueRefresh, 300));
})();
