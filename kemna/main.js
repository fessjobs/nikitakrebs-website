/* KEMNA — Scroll-Choreografie
   GSAP + ScrollTrigger + Lenis (alle per CDN) */
(function () {
  'use strict';
  // Ohne GSAP bleibt die Seite im no-js-Zustand: alles sichtbar, keine Animation.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  document.documentElement.classList.remove('no-js');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const mobile = () => innerWidth <= 760;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduced && !isTouch && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- split words into chars ---------- */
  $$('[data-split]').forEach((el) => {
    const txt = el.textContent;
    el.textContent = '';
    [...txt].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      el.appendChild(s);
    });
  });

  /* ---------- preloader + hero intro ---------- */
  const pre = $('[data-preloader]');
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  if (reduced) {
    gsap.set(pre, { display: 'none' });
  } else {
    intro
      .to('.preloader__mark', { opacity: 1, scale: 1, duration: 0.7 })
      .to('.preloader__mark i', { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.3')
      .to('.preloader__mark', { opacity: 0, y: -20, duration: 0.4, ease: 'power3.in' }, '+=0.15')
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.2')
      .set(pre, { display: 'none' })
      .from('.hero__title .ch', { yPercent: 70, opacity: 0, duration: 1, stagger: 0.05 }, '-=0.6')
      .from('[data-hero-eyebrow], [data-hero-claim]', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.7')
      .from('[data-road-lines] path', { opacity: 0, duration: 1.2, stagger: 0.08 }, '-=0.9')
      .from('.nav__logo, .nav__right > *', { opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.9')
      .from('[data-hero-meta] span, [data-hero-scroll]', { y: 16, opacity: 0, duration: 0.6, stagger: 0.06 }, '-=0.6');
  }

  /* ---------- hero: Mittelstreifen läuft auf den Betrachter zu ---------- */
  const dash = $('[data-road-dash]');
  if (dash && !reduced) gsap.to(dash, { strokeDashoffset: -150, duration: 1.6, ease: 'none', repeat: -1 });

  /* ---------- hero: pin, Wortmarke schrumpft, Band fährt ein ---------- */
  (function () {
    const hero = $('[data-hero]'), title = $('[data-hero-title]'), band = $('[data-hero-band]');
    if (!hero || !title) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: () => isTouch ? '+=90%' : '+=120%', pin: true, scrub: isTouch ? true : 0.6, anticipatePin: 1, invalidateOnRefresh: true, fastScrollEnd: true } });
    // Eyebrow, Claim und Scroll-Hinweis animiert auch die Intro-Timeline. Diese Tweens starten deshalb bei 0.05,
    // nicht bei 0: sonst rendert die Scrub-Timeline sie sofort, merkt sich opacity 0 als Startwert und hält sie unsichtbar.
    tl.to(title, { scale: () => mobile() ? 0.7 : 0.55, yPercent: -30, duration: 1, ease: 'power2.inOut' }, 0)
      .to('[data-hero-eyebrow], [data-hero-claim]', { opacity: 0, y: -20, duration: 0.35, ease: 'none' }, 0.05)
      .to('[data-road-lines]', { opacity: 0.25, duration: 1, ease: 'none' }, 0)
      .to('[data-hero-scroll], [data-hero-meta]', { opacity: 0, duration: 0.25 }, 0.05)
      .fromTo(band, { opacity: 0, xPercent: -8, rotate: -4 }, { opacity: 1, xPercent: 0, rotate: -4, duration: 0.6, ease: 'power3.out' }, 0.35);
    // Band-Marquee: endlos nach links
    const m = $('[data-hero-marq]');
    if (m && !reduced) {
      const run = () => { const half = m.scrollWidth / 2; gsap.to(m, { x: -half, duration: half / 90, ease: 'none', repeat: -1 }); };
      if (document.readyState === 'complete') run(); else addEventListener('load', run);
    }
  })();

  /* ---------- programmatic scroll ---------- */
  function scrollToEl(el) {
    const y = el.getBoundingClientRect().top + window.scrollY;
    const o = { v: window.scrollY };
    gsap.to(o, { v: y, duration: 1.3, ease: 'power4.inOut', overwrite: true,
      onUpdate: () => { lenis ? lenis.scrollTo(o.v, { immediate: true, force: true }) : window.scrollTo(0, o.v); } });
  }

  /* ---------- nav theme by section + Safari-Balkenfarbe ---------- */
  const nav = $('[data-nav]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const setBarColor = (el) => {
    if (!themeMeta) return;
    let bg = getComputedStyle(el).backgroundColor, node = el;
    while ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && node.parentElement) { node = node.parentElement; bg = getComputedStyle(node).backgroundColor; }
    themeMeta.setAttribute('content', bg);
    document.documentElement.style.backgroundColor = bg;
  };
  // refreshPriority -1: erst nach den Pins berechnen, sonst fehlt der Pin-Spacer in Start/Ende
  $$('[data-nav-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 60px', end: 'bottom 60px', refreshPriority: -1,
      onToggle: (st) => { if (st.isActive) { nav.classList.toggle('is-dark', sec.dataset.navTheme === 'dark'); setBarColor(sec); } }
    });
  });

  /* ---------- menu ---------- */
  const menu = $('[data-menu]'), toggle = $('[data-menu-toggle]');
  let menuOpen = false;
  gsap.set('[data-menu-link]', { y: 60, opacity: 0 });
  gsap.set('.menu__foot > *', { y: 10, opacity: 0 });
  const menuTl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu, { visibility: 'hidden' }) })
    .set(menu, { visibility: 'visible' })
    .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power4.inOut' })
    .to('[data-menu-link]', { y: 0, opacity: 0.55, duration: 0.7, stagger: 0.06, ease: 'power4.out' }, '-=0.35')
    .to('.menu__foot > *', { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 }, '-=0.4');
  function setMenu(open) {
    menuOpen = open;
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    if (open) { menuTl.timeScale(1).play(); lenis && lenis.stop(); }
    else { menuTl.timeScale(1.6).reverse(); lenis && lenis.start(); }
  }
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  $$('[data-menu-link]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(a.getAttribute('href'));
      setMenu(false);
      if (target) setTimeout(() => scrollToEl(target), 450);
    });
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* ---------- reveals ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- counter (deutsche Tausendertrennung, Jahreszahlen ohne) ---------- */
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count, plain = el.hasAttribute('data-count-plain');
    const fmt = (v) => plain ? String(Math.round(v)) : Math.round(v).toLocaleString('de-DE');
    if (reduced) { el.textContent = fmt(target); return; }
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to({ v: 0 }, { v: target, duration: 1.8, ease: 'power3.out', onUpdate() { el.textContent = fmt(this.targets()[0].v); } }) });
  });

  /* ---------- fields: Medien einblenden, Text staffeln ---------- */
  $$('[data-field]').forEach((row) => {
    const media = $('.field__media', row);
    gsap.to(media, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%' } });
    gsap.from($$('.field__num, .field__text > *', row), { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%' } });
  });

  /* ---------- fields: Steinbruch — Abbausohlen als Höhenlinien, prozedural ---------- */
  (function () {
    const g = $('[data-quarry-lines]');
    if (!g) return;
    const rnd = (seed) => { const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const rings = 9, cx = 400, cy = 310;
    for (let k = 0; k < rings; k++) {
      const r = 60 + k * 30; let d = '';
      for (let a = 0; a <= 360; a += 8) {
        const t = a * Math.PI / 180;
        const wob = 1 + Math.sin(t * 3 + k * 0.7) * 0.09 + Math.cos(t * 5 + k * 1.3) * 0.05 + (rnd(k * 40 + a) - 0.5) * 0.03;
        const x = cx + Math.cos(t) * r * wob * 1.3, y = cy + Math.sin(t) * r * wob * 0.78;
        d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d + ' Z');
      p.setAttribute('stroke-opacity', String(0.9 - k * 0.07));
      if (k === 0) { p.setAttribute('fill', '#F2B705'); p.setAttribute('fill-opacity', '.85'); }
      g.appendChild(p);
    }
    // Rampe in die Grube
    const ramp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ramp.setAttribute('d', 'M120 470 C260 470 300 330 400 310');
    ramp.setAttribute('stroke-dasharray', '6 8'); ramp.setAttribute('stroke-opacity', '.7');
    g.appendChild(ramp);
    const paths = $$('path', g);
    paths.forEach((p) => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: p === ramp ? '6 8' : len, strokeDashoffset: p === ramp ? 0 : len }); });
    if (reduced) { paths.forEach((p) => gsap.set(p, { strokeDashoffset: 0 })); return; }
    gsap.to(paths.filter((p) => p !== ramp), { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.08,
      scrollTrigger: { trigger: g.closest('.field'), start: 'top 70%' } });
  })();

  /* ---------- fields: Asphalt — Körnung als Punktwolke, dichter zur Mitte ---------- */
  (function () {
    const g = $('[data-asphalt-grain]');
    if (!g) return;
    const rnd = (seed) => { const x = Math.sin(seed * 78.233) * 43758.5453; return x - Math.floor(x); };
    const N = isTouch ? 220 : 420, frag = document.createDocumentFragment();
    for (let i = 0; i < N; i++) {
      const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 1000)) * 235;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', (400 + Math.cos(a) * r).toFixed(1)); c.setAttribute('cy', (300 + Math.sin(a) * r).toFixed(1));
      c.setAttribute('r', (1.2 + rnd(i + 2000) * 4.2).toFixed(1));
      c.setAttribute('fill-opacity', (0.35 + rnd(i + 3000) * 0.6).toFixed(2));
      frag.appendChild(c);
    }
    g.appendChild(frag);
    if (reduced) return;
    gsap.from($$('circle', g), { scale: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(2)', stagger: { each: 0.004, from: 'center' },
      scrollTrigger: { trigger: g.closest('.field'), start: 'top 70%' } });
    gsap.to(g, { rotation: 360, transformOrigin: '400px 300px', duration: 120, ease: 'none', repeat: -1 });
  })();

  /* ---------- fields: Schichtaufbau — Lagen fallen mit dem Scroll aufeinander ---------- */
  (function () {
    const wrap = $('[data-layers]');
    if (!wrap) return;
    const layers = $$('[data-layer]', wrap);
    if (reduced) { gsap.set(layers, { opacity: 1, y: 0 }); return; }
    gsap.to(layers.slice().reverse(), { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.18,
      scrollTrigger: { trigger: wrap, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 } });
  })();

  /* ---------- kette: horizontal gepinnt, Stationen leuchten am Marker auf ---------- */
  (function () {
    const sec = $('[data-kette]'), track = $('[data-kette-track]', sec || document);
    if (!sec || !track) return;
    const stations = $$('[data-station]', sec);
    const getDist = () => track.scrollWidth - innerWidth;
    // Aktive Station aus der Track-Position lesen — im onUpdate der Timeline, damit es auch beim Nachlauf des Scrubs stimmt
    const markActive = () => {
      const mid = innerWidth / 2;
      stations.forEach((s) => { const r = s.getBoundingClientRect(); s.classList.toggle('is-active', r.left < mid + 40 && r.right > mid - 40); });
    };
    const tl = gsap.timeline({ onUpdate: markActive, scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + getDist() * 1.05, pin: $('.kette__pin', sec), scrub: isTouch ? true : 1, invalidateOnRefresh: true, anticipatePin: 1, fastScrollEnd: true } });
    tl.to(track, { x: () => -getDist(), ease: 'none' });
    stations.forEach((s) => {
      gsap.from($$('.station__num, .station__icon, .station h3, .station p', s), { y: 40, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { containerAnimation: tl, trigger: s, start: 'left 90%' } });
    });
    gsap.from('.kette__end > *', { x: 60, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { containerAnimation: tl, trigger: '.kette__end', start: 'left 85%' } });
  })();

  /* ---------- green: Wort für Wort, Satz für Satz ---------- */
  (function () {
    const sec = $('[data-green]');
    if (!sec) return;
    const h = $('[data-words]', sec), p = $('[data-lines]', sec);
    if (h) {
      h.innerHTML = h.textContent.trim().split(/\s+/).map((w) => '<span class="w">' + w + '</span>').join('');
      gsap.to($$('.w', h), { opacity: 1, stagger: 0.25, ease: 'none', scrollTrigger: { trigger: h, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
    }
    if (p) {
      const parts = p.textContent.trim().match(/[^.!?]+[.!?]+/g) || [p.textContent];
      p.innerHTML = parts.map((s) => '<span class="ln">' + s.trim() + '</span>').join(' ');
      gsap.to($$('.ln', p), { opacity: 1, y: 0, stagger: 0.3, ease: 'power2.out', duration: 1, scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: 0.8 } });
    }
  })();

  /* ---------- history: Linie wächst mit dem Scroll, Jahre schalten um ---------- */
  (function () {
    const sec = $('[data-history]'), line = $('[data-history-line]');
    if (!sec || !line) return;
    gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.history__wrap', start: 'top 55%', end: 'bottom 55%', scrub: true } });
    $$('[data-era]', sec).forEach((era) => {
      ScrollTrigger.create({ trigger: era, start: 'top 58%', end: 'bottom 58%', onToggle: (st) => era.classList.toggle('is-on', st.isActive), onEnter: () => era.classList.add('is-on') });
      gsap.from($$('.era__year, .era__text > *', era), { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: era, start: 'top 85%' } });
    });
  })();

  /* ---------- group: zwei Bänder, gegenläufig ---------- */
  $$('[data-group-track]').forEach((track) => {
    if (reduced) return;
    const dir = parseFloat(track.dataset.groupTrack) || 1;
    const run = () => {
      const half = track.scrollWidth / 2;
      gsap.fromTo(track, dir > 0 ? { x: -half } : { x: 0 }, { x: dir > 0 ? 0 : -half, duration: half / 50, ease: 'none', repeat: -1 });
    };
    if (document.readyState === 'complete') run(); else addEventListener('load', run);
  });

  /* ---------- career: Streifen wachsen hoch ---------- */
  gsap.from('.career__stripes i', { scaleY: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.career', start: 'top 70%' } });

  /* ---------- callout ---------- */
  gsap.from('.callout__eyebrow, .callout__h, .callout__card, .callout__actions', { y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.callout', start: 'top 75%' } });

  /* ---------- footer big text ---------- */
  gsap.from('.footer__big .ch', { yPercent: 100, opacity: 0, duration: 1, stagger: 0.05, ease: 'power4.out', scrollTrigger: { trigger: '.footer', start: 'top 75%' } });

  /* ---------- anchor links ---------- */
  $$('a[href^="#"]:not([data-menu-link])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = $(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      scrollToEl(t);
    });
  });

  // Layout ändert sich nach Fonts → Trigger-Positionen nachziehen
  let refreshT;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => { ScrollTrigger.refresh(); lenis && lenis.resize(); }, 150); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueRefresh);
  addEventListener('load', () => { queueRefresh(); setTimeout(queueRefresh, 1500); });
  addEventListener('orientationchange', () => setTimeout(queueRefresh, 300));
})();
