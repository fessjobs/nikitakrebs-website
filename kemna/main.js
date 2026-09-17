/* KEMNA — Scroll-Choreografie
   GSAP + ScrollTrigger + Lenis (alle per CDN)

   Aufbau: eine IIFE, gegliedert durch Kommentarbalken.
   Jeder Block läuft in safe(): wirft einer, bleibt der Rest der Seite heil und
   die Klasse .js-failed macht alle sonst unsichtbaren Inhalte sichtbar. */
(function () {
  'use strict';
  const root = document.documentElement;

  /* ---------- Notausgang: Inhalt darf nie hinter einer Animation verschwinden ---------- */
  // Läuft unabhängig vom Rest. Ohne GSAP bleibt .no-js stehen und das CSS zeigt alles an.
  const bail = (why) => {
    root.classList.add('js-failed');
    if (why) console.error('[kemna] Fallback aktiv:', why);
  };
  addEventListener('error', (e) => { if (e.filename && e.filename.indexOf('main.js') !== -1) bail(e.message); });
  setTimeout(() => { const p = document.querySelector('[data-preloader]'); if (p && getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().top > -10) bail('Preloader nach 6s noch sichtbar'); }, 6000);

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  root.classList.remove('no-js');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const mobile = () => innerWidth <= 760;
  // .rm schaltet im CSS dieselben Endzustände frei wie .js-failed: keine Pins, keine Scrub-Sequenzen.
  if (reduced) root.classList.add('rm');

  const failed = [];
  const safe = (name, fn) => { try { fn(); } catch (err) { failed.push(name); console.error('[kemna] Block "' + name + '" fehlgeschlagen:', err); } };
  const onReady = (fn) => { if (document.readyState === 'complete') fn(); else addEventListener('load', fn, { once: true }); };

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  safe('lenis', () => {
    if (reduced || isTouch || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  });

  /* ---------- split words into chars ---------- */
  // aria-hidden sitzt im Markup auf den Wortmarken, daneben steht der Text als .sr-only —
  // sonst buchstabiert der Screenreader K-E-M-N-A.
  safe('split', () => {
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
  });

  /* ---------- preloader + hero intro ---------- */
  safe('intro', () => {
    const pre = $('[data-preloader]');
    if (!pre) return;
    if (reduced) { gsap.set(pre, { display: 'none' }); return; }
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to('.preloader__mark', { opacity: 1, scale: 1, duration: 0.7 })
      .to('.preloader__mark i', { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.3')
      .to('.preloader__mark', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.out' }, '+=0.15')
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.2')
      .set(pre, { display: 'none' })
      .from('.hero__title .ch', { yPercent: 70, opacity: 0, duration: 1, stagger: 0.05 }, '-=0.6')
      .from('[data-hero-eyebrow], [data-hero-claim]', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.7')
      .from('[data-road-lines] path', { opacity: 0, duration: 1.2, stagger: 0.08 }, '-=0.9')
      .from('.nav__logo, .nav__right > *', { opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.9')
      .from('[data-hero-meta] span, [data-hero-scroll]', { y: 16, opacity: 0, duration: 0.6, stagger: 0.06 }, '-=0.6');
  });

  /* ---------- Endlos-Tweens: laufen nur, solange ihre Sektion im Bild ist ---------- */
  // Ein repeat:-1-Tween hält sonst dauerhaft den Compositor wach, auch zehn Sektionen weiter unten.
  const loops = [];
  const loopWhileVisible = (tween, trigger) => {
    if (!tween || !trigger) return;
    loops.push(tween);
    ScrollTrigger.create({
      trigger: trigger, start: 'top bottom', end: 'bottom top',
      onToggle: (st) => (st.isActive ? tween.play() : tween.pause()),
    });
    tween.pause();
  };

  /* ---------- hero: Mittelstreifen läuft auf den Betrachter zu ---------- */
  safe('road-dash', () => {
    const dash = $('[data-road-dash]');
    if (!dash || reduced) return;
    loopWhileVisible(gsap.to(dash, { strokeDashoffset: -150, duration: 1.6, ease: 'none', repeat: -1 }), $('[data-hero]'));
  });

  /* ---------- hero: pin, Wortmarke schrumpft, Band fährt ein ---------- */
  safe('hero-pin', () => {
    const hero = $('[data-hero]'), title = $('[data-hero-title]'), band = $('[data-hero-band]');
    if (!hero || !title || reduced) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: () => (isTouch ? '+=90%' : '+=120%'), pin: true, scrub: isTouch ? true : 0.6, anticipatePin: 1, invalidateOnRefresh: true, fastScrollEnd: true, refreshPriority: 1 } });
    // Eyebrow, Claim, Scroll-Hinweis und Meta animiert auch die Intro-Timeline. Deshalb fromTo mit
    // immediateRender:false — sonst merkt sich der Scrub den Zwischenwert der laufenden Intro als Startwert
    // und die Elemente kommen beim Zurückscrollen nie wieder auf volle Deckkraft.
    tl.to(title, { scale: () => (mobile() ? 0.7 : 0.55), yPercent: -30, duration: 1, ease: 'power2.inOut' }, 0)
      .fromTo('[data-hero-eyebrow], [data-hero-claim]', { opacity: 1, y: 0 }, { opacity: 0, y: -20, duration: 0.35, ease: 'none', immediateRender: false }, 0)
      .to('[data-road-lines]', { opacity: 0.25, duration: 1, ease: 'none' }, 0)
      .fromTo('[data-hero-scroll], [data-hero-meta]', { opacity: 1 }, { opacity: 0, duration: 0.25, ease: 'none', immediateRender: false }, 0)
      .fromTo(band, { opacity: 0, xPercent: -8, rotate: -4 }, { opacity: 1, xPercent: 0, rotate: -4, duration: 0.6, ease: 'power3.out' }, 0.35);
  });

  /* ---------- marquees: Bandlauf, gap-genau und resize-fest ---------- */
  // Periode = 7 Kacheln + 7 Lücken = (scrollWidth + gap) / 2. Ohne das +gap springt jede Runde.
  safe('marquees', () => {
    if (reduced) return;
    const belts = [];
    const add = (track, dir, speed, trigger) => { if (track) belts.push({ track, dir, speed, trigger, tween: null }); };
    add($('[data-hero-marq]'), -1, 90, $('[data-hero]'));
    $$('[data-group-track]').forEach((t) => add(t, parseFloat(t.dataset.groupTrack) || 1, 50, $('.group')));
    const build = () => {
      belts.forEach((b) => {
        if (b.tween) b.tween.kill();
        gsap.set(b.track, { x: 0 });
        const gap = parseFloat(getComputedStyle(b.track).columnGap) || 0;
        const half = (b.track.scrollWidth + gap) / 2;
        if (!half || !isFinite(half)) return;
        b.tween = gsap.fromTo(b.track, { x: b.dir > 0 ? -half : 0 }, { x: b.dir > 0 ? 0 : -half, duration: half / b.speed, ease: 'none', repeat: -1 });
        loopWhileVisible(b.tween, b.trigger);
      });
    };
    onReady(build);
    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200); });
  });

  /* ---------- programmatic scroll ---------- */
  // Fokus wandert mit, sonst scrollt die Seite und die Tastatur bleibt im Header stehen.
  let scrollTween = null;
  function scrollToEl(el) {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    if (scrollTween) scrollTween.kill();
    if (reduced) { window.scrollTo(0, y); return; }
    const o = { v: window.scrollY };
    scrollTween = gsap.to(o, { v: y, duration: 1.3, ease: 'power4.inOut', overwrite: true,
      onUpdate: () => { lenis ? lenis.scrollTo(o.v, { immediate: true, force: true }) : window.scrollTo(0, o.v); } });
  }

  /* ---------- nav theme by section + Safari-Balkenfarbe ---------- */
  safe('nav-theme', () => {
    const nav = $('[data-nav]');
    if (!nav) return;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const setBarColor = (el) => {
      if (!themeMeta) return;
      let bg = getComputedStyle(el).backgroundColor, node = el;
      while ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && node.parentElement) { node = node.parentElement; bg = getComputedStyle(node).backgroundColor; }
      if (themeMeta.getAttribute('content') !== bg) { themeMeta.setAttribute('content', bg); root.style.backgroundColor = bg; }
    };
    // refreshPriority -1: erst nach den Pins berechnen, sonst fehlt der Pin-Spacer in Start und Ende.
    $$('[data-nav-theme]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 60px', end: 'bottom 60px', refreshPriority: -1,
        onToggle: (st) => {
          if (!st.isActive) return;
          nav.classList.toggle('is-dark', sec.dataset.navTheme === 'dark');
          // Der gelbe Karriere-Block verschluckt den gelben CTA — dort wird er dunkel.
          nav.classList.toggle('is-oncolor', sec.dataset.navAccent === 'ink');
          setBarColor(sec);
        },
      });
    });
  });

  /* ---------- nav: weicht beim Runterscrollen, kommt beim Hochscrollen zurück ---------- */
  // Eine dauerhaft sichtbare Nav verdeckt in jeder Sektion die obere rechte Ecke.
  safe('nav-autohide', () => {
    const nav = $('[data-nav]');
    if (!nav || reduced) return;
    let last = window.scrollY, ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY, d = y - last;
      if (Math.abs(d) < 6) return;
      last = y;
      if (document.body.classList.contains('menu-open')) { nav.classList.remove('is-away'); return; }
      nav.classList.toggle('is-away', d > 0 && y > 160);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });
  });

  /* ---------- menu ---------- */
  safe('menu', () => {
    const menu = $('[data-menu]'), toggle = $('[data-menu-toggle]');
    if (!menu || !toggle) return;
    const links = $$('[data-menu-link]');
    let menuOpen = false;
    menu.inert = true;
    gsap.set(links, { y: 60, opacity: 0 });
    gsap.set('.menu__foot > *', { y: 10, opacity: 0 });
    const menuTl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu, { visibility: 'hidden' }) })
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power4.inOut' })
      .to(links, { y: 0, opacity: 0.55, duration: 0.7, stagger: 0.06, ease: 'power4.out' }, '-=0.35')
      .to('.menu__foot > *', { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 }, '-=0.4');
    if (reduced) menuTl.timeScale(1000);

    function setMenu(open) {
      menuOpen = open;
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      if (open) { menuTl.timeScale(reduced ? 1000 : 1).play(); lenis && lenis.stop(); if (links[0]) links[0].focus(); }
      else { menuTl.timeScale(reduced ? 1000 : 1.6).reverse(); lenis && lenis.start(); }
    }
    toggle.addEventListener('click', () => setMenu(!menuOpen));
    links.forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href'), target = $(href);
        if (!target) return;
        e.preventDefault();
        history.replaceState(null, '', href);
        setMenu(false);
        toggle.focus({ preventScroll: true });
        // wartet das Schließen ab, damit der Scroll nicht gegen die Menü-Timeline läuft
        setTimeout(() => scrollToEl(target), reduced ? 0 : 450);
      });
    });
    // Tab-Falle: solange offen, bleibt der Fokus im Menü
    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !menuOpen) return;
      const f = $$('a[href],button:not([disabled])', menu);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); toggle.focus(); }
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); toggle.focus(); } });
  });

  /* ---------- reveals ---------- */
  safe('reveals', () => {
    if (reduced) return;
    $$('[data-reveal]').forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
  });

  /* ---------- counter (deutsche Tausendertrennung) ---------- */
  safe('counter', () => {
    $$('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      if (!isFinite(target)) { el.textContent = el.dataset.count || ''; return; }
      const fmt = (v) => Math.round(v).toLocaleString('de-DE');
      if (reduced) { el.textContent = fmt(target); return; }
      el.textContent = fmt(0);
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
        onEnter: () => gsap.to({ v: 0 }, { v: target, duration: 1.8, ease: 'power3.out', onUpdate() { el.textContent = fmt(this.targets()[0].v); }, onComplete() { el.textContent = fmt(target); } }) });
    });
  });

  /* ---------- fields: Medien einblenden, Text staffeln ---------- */
  safe('fields', () => {
    if (reduced) return;
    $$('[data-field]').forEach((row) => {
      const media = $('.field__media', row);
      if (media) gsap.to(media, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%' } });
      gsap.from($$('.field__num, .field__text > *', row), { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%' } });
    });
  });

  /* ---------- fields: Steinbruch — Abbausohlen als Höhenlinien, prozedural ---------- */
  safe('quarry', () => {
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
    const ramp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ramp.setAttribute('d', 'M120 470 C260 470 300 330 400 310');
    ramp.setAttribute('stroke-dasharray', '6 8'); ramp.setAttribute('stroke-opacity', '.7');
    g.appendChild(ramp);
    const paths = $$('path', g);
    if (reduced) return;
    paths.forEach((p) => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: p === ramp ? '6 8' : len, strokeDashoffset: p === ramp ? 0 : len }); });
    gsap.to(paths.filter((p) => p !== ramp), { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.08,
      scrollTrigger: { trigger: g.closest('.field'), start: 'top 70%' } });
  });

  /* ---------- fields: Asphalt — Körnung als Punktwolke, dichter zur Mitte ---------- */
  safe('grain', () => {
    const g = $('[data-asphalt-grain]');
    if (!g) return;
    const rnd = (seed) => { const x = Math.sin(seed * 78.233) * 43758.5453; return x - Math.floor(x); };
    const N = isTouch ? 180 : 360, frag = document.createDocumentFragment();
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
    // Körnung wächst an, statt aus dem Nichts zu poppen: ab 0.4, ohne Überschwingen.
    gsap.from($$('circle', g), { scale: 0.4, opacity: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'power3.out', stagger: { each: 0.004, from: 'center' },
      scrollTrigger: { trigger: g.closest('.field'), start: 'top 70%' } });
  });

  /* ---------- fields: Schichtaufbau — Lagen fallen mit dem Scroll aufeinander ---------- */
  safe('layers', () => {
    const wrap = $('[data-layers]');
    if (!wrap || reduced) return;
    const layers = $$('[data-layer]', wrap);
    gsap.to(layers.slice().reverse(), { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.18,
      scrollTrigger: { trigger: wrap, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 } });
  });

  /* ---------- kette: horizontal gepinnt, Stationen leuchten am Marker auf ---------- */
  safe('kette', () => {
    const sec = $('[data-kette]');
    if (!sec || reduced) return;
    const track = $('[data-kette-track]', sec);
    if (!track) return;
    const stations = $$('[data-station]', sec);
    const getDist = () => Math.max(0, track.scrollWidth - innerWidth);
    // Aktive Station aus dem Timeline-Fortschritt statt aus getBoundingClientRect:
    // ein Layout-Read pro Frame im onUpdate ist genau das, was der scroll-motion-Skill verbietet.
    let spots = [];
    const measure = () => {
      const dist = getDist();
      spots = stations.map((s) => {
        const left = s.offsetLeft, w = s.offsetWidth;
        const centred = left + w / 2 - innerWidth / 2;
        return dist > 0 ? centred / dist : 0;
      });
    };
    let active = -1;
    const markActive = (p) => {
      let best = -1, bestD = 0.09;
      spots.forEach((sp, i) => { const d = Math.abs(p - sp); if (d < bestD) { bestD = d; best = i; } });
      if (best === active) return;
      if (active > -1 && stations[active]) stations[active].classList.remove('is-active');
      if (best > -1 && stations[best]) stations[best].classList.add('is-active');
      active = best;
    };
    const tl = gsap.timeline({
      onUpdate: function () { markActive(this.progress()); },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: () => '+=' + getDist() * 1.05, pin: $('.kette__pin', sec),
        scrub: isTouch ? true : 1, invalidateOnRefresh: true, anticipatePin: 1, fastScrollEnd: true, refreshPriority: 1,
        onRefresh: measure,
      },
    });
    tl.to(track, { x: () => -getDist(), ease: 'none' });
    measure();
    stations.forEach((s) => {
      gsap.from($$('.station__num, .station__icon, .station h3, .station p', s), { y: 40, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { containerAnimation: tl, trigger: s, start: 'left 90%' } });
    });
    gsap.from('.kette__end > *', { x: 60, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { containerAnimation: tl, trigger: '.kette__end', start: 'left 85%' } });
  });

  /* ---------- green: Wort für Wort, Satz für Satz ---------- */
  safe('green', () => {
    const sec = $('[data-green]');
    if (!sec) return;
    const h = $('[data-words]', sec), p = $('[data-lines]', sec);
    if (h && !reduced) {
      h.innerHTML = h.textContent.trim().split(/\s+/).map((w) => '<span class="w">' + w + '</span>').join(' ');
      gsap.to($$('.w', h), { opacity: 1, stagger: 0.25, ease: 'none', scrollTrigger: { trigger: h, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
    }
    if (p && !reduced) {
      const parts = p.textContent.trim().match(/[^.!?]+[.!?]+/g) || [p.textContent];
      p.innerHTML = parts.map((s) => '<span class="ln">' + s.trim() + '</span>').join(' ');
      gsap.to($$('.ln', p), { opacity: 1, y: 0, stagger: 0.3, ease: 'power2.out', duration: 1, scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: 0.8 } });
    }
  });

  /* ---------- history: Linie wächst mit dem Scroll, Jahre schalten um ---------- */
  safe('history', () => {
    const sec = $('[data-history]'), line = $('[data-history-line]');
    if (!sec || !line || reduced) return;
    gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.history__wrap', start: 'top 55%', end: 'bottom 55%', scrub: true } });
    $$('[data-era]', sec).forEach((era) => {
      ScrollTrigger.create({ trigger: era, start: 'top 58%', end: 'bottom 58%', onToggle: (st) => era.classList.toggle('is-on', st.isActive), onEnter: () => era.classList.add('is-on') });
      gsap.from($$('.era__year, .era__text > *', era), { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: era, start: 'top 85%' } });
    });
  });

  /* ---------- career + callout + footer ---------- */
  safe('tail', () => {
    if (reduced) return;
    gsap.from('.career__stripes i', { scaleY: 0.08, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.career', start: 'top 70%' } });
    gsap.from('.callout__eyebrow, .callout__h, .callout__card, .callout__actions', { y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.callout', start: 'top 75%' } });
    gsap.from('.footer__big .ch', { yPercent: 100, opacity: 0, duration: 1, stagger: 0.05, ease: 'power4.out', scrollTrigger: { trigger: '.footer', start: 'top 75%' } });
  });

  /* ---------- anchor links ---------- */
  safe('anchors', () => {
    $$('a[href^="#"]:not([data-menu-link])').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href'), t = $(href);
        if (!t) return;
        e.preventDefault();
        history.replaceState(null, '', href);
        scrollToEl(t);
      });
    });
  });

  /* ---------- Deep-Link: /#kontakt muss auch mit zwei gepinnten Sektionen landen ---------- */
  safe('deeplink', () => {
    if (!location.hash || location.hash.length < 2) return;
    const t = $(location.hash);
    if (!t) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    onReady(() => setTimeout(() => { ScrollTrigger.refresh(); scrollToEl(t); }, 300));
  });

  /* ---------- Layout ändert sich nach Fonts → Trigger-Positionen nachziehen ---------- */
  safe('refresh', () => {
    let refreshT;
    const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => { ScrollTrigger.refresh(); lenis && lenis.resize(); }, 150); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueRefresh);
    onReady(() => { queueRefresh(); setTimeout(queueRefresh, 1500); });
    addEventListener('orientationchange', () => setTimeout(queueRefresh, 300));
  });

  if (failed.length) bail(failed.join(', '));
})();
