/* BB Bausanierung — Scroll-Choreografie
   GSAP + ScrollTrigger + Lenis (alles per CDN). Ohne GSAP bleibt die Seite
   über die Klasse .no-js vollständig lesbar. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const html = document.documentElement;

  /* ---------- fallback: kein GSAP → statische Seite ---------- */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    initMenuStatic();
    return;
  }
  html.classList.remove('no-js');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  ScrollTrigger.config({ ignoreMobileResize: true });
  let lenis = null;
  if (!reduced && !isTouch && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- split text into words → chars (words never break mid-word) ---------- */
  $$('[data-split]').forEach((el) => {
    const txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
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

  /* ---------- hero intro ---------- */
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .from('.hero__h .ch', { yPercent: 70, opacity: 0, duration: 1, stagger: 0.018 }, 0.15)
    .from('[data-hero-eyebrow]', { y: 16, opacity: 0, duration: 0.7 }, 0.3)
    .from('[data-hero-p], [data-hero-actions] > *', { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.7)
    .from('.nav__logo, .nav__right > *', { opacity: 0, duration: 0.7, stagger: 0.08 }, 0.6)
    .from('[data-hero-scroll]', { y: 20, opacity: 0, duration: 0.7 }, 1);

  /* ---------- hero: topo lines — draw on, drift, mouse depth ---------- */
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
  if (!reduced) topoPaths.forEach((p, i) => {
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
  if (!isTouch && !reduced) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      topoPaths.forEach((p, i) => {
        const depth = 0.3 + (i % 5) * 0.25;
        gsap.to(p, { xPercent: x * -2.2 * depth, yPercent: y * -2 * depth, duration: 1.4 + i * 0.1, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }
  // hero content drifts up slightly while the next section arrives
  gsap.to('.hero__inner', { yPercent: -12, opacity: 0.4, ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: 'bottom 80%', end: 'bottom 20%', scrub: true } });

  /* ---------- programmatic scroll ---------- */
  function scrollToEl(el) {
    const y = el.getBoundingClientRect().top + window.scrollY;
    const from = window.scrollY, o = { v: from };
    gsap.to(o, { v: y, duration: 1.3, ease: 'power4.inOut', overwrite: true,
      onUpdate: () => { lenis ? lenis.scrollTo(o.v, { immediate: true, force: true }) : window.scrollTo(0, o.v); } });
  }

  /* ---------- nav theme by section + Safari bar colour ---------- */
  const nav = $('[data-nav]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const setBarColor = (el) => {
    if (!themeMeta) return;
    let bg = getComputedStyle(el).backgroundColor, node = el;
    while ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && node.parentElement) { node = node.parentElement; bg = getComputedStyle(node).backgroundColor; }
    themeMeta.setAttribute('content', bg);
    html.style.backgroundColor = bg;
  };
  $$('[data-nav-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 60px', end: 'bottom 60px',
      onToggle: (st) => { if (st.isActive) { nav.classList.toggle('is-dark', sec.dataset.navTheme === 'dark'); setBarColor(sec); } }
    });
  });

  /* ---------- menu ---------- */
  const menu = $('[data-menu]'), toggle = $('[data-menu-toggle]');
  let menuOpen = false;
  gsap.set('[data-menu-link]', { y: 60, opacity: 0 });
  gsap.set('.menu__foot a', { y: 10, opacity: 0 });
  const menuTl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu, { visibility: 'hidden' }) })
    .set(menu, { visibility: 'visible' })
    .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power4.inOut' })
    .to('[data-menu-link]', { y: 0, opacity: 0.55, duration: 0.7, stagger: 0.06, ease: 'power4.out' }, '-=0.35')
    .to('.menu__foot a', { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 }, '-=0.4');
  function setMenu(open) {
    menuOpen = open;
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
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

  /* ---------- marquee: constant, infinite ---------- */
  (function () {
    const track = $('[data-marquee]');
    if (!track || reduced) return;
    const run = () => {
      const half = track.scrollWidth / 2;
      gsap.to(track, { x: -half, duration: half / 60, ease: 'none', repeat: -1 });
    };
    if (document.readyState === 'complete') run(); else addEventListener('load', run);
  })();

  /* ---------- reveals ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- counter ---------- */
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to({ v: 0 }, { v: target, duration: 1.6, ease: 'power3.out', onUpdate() { el.textContent = Math.round(this.targets()[0].v); } }) });
  });

  /* ---------- partner: word-by-word scrub ---------- */
  (function () {
    const h = $('[data-words]');
    if (!h) return;
    const txt = h.textContent.trim();
    h.setAttribute('aria-label', txt);
    h.innerHTML = txt.split(/\s+/).map((w) => '<span class="w" aria-hidden="true">' + w + '</span>').join('');
    gsap.to($$('.w', h), { opacity: 1, stagger: 0.25, ease: 'none',
      scrollTrigger: { trigger: h, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
  })();

  /* ---------- footer big text ---------- */
  gsap.from('.footer__brand .ch', { yPercent: 100, opacity: 0, duration: 1, stagger: 0.03, ease: 'power4.out',
    scrollTrigger: { trigger: '.footer', start: 'top 75%' } });

  /* ---------- anchor links ---------- */
  $$('a[href^="#"]:not([data-menu-link])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = $(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      scrollToEl(t);
    });
  });

  /* ---------- refresh after late layout changes ---------- */
  let refreshT;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => { ScrollTrigger.refresh(); lenis && lenis.resize(); }, 150); };
  $$('img').forEach((im) => { if (!im.complete) im.addEventListener('load', queueRefresh, { once: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueRefresh);
  addEventListener('load', () => { queueRefresh(); setTimeout(queueRefresh, 1500); });
  addEventListener('orientationchange', () => setTimeout(queueRefresh, 300));

  /* ---------- menu without GSAP (static fallback) ---------- */
  function initMenuStatic() {
    const menu = $('[data-menu]'), toggle = $('[data-menu-toggle]');
    if (!menu || !toggle) return;
    let open = false;
    const set = (o) => {
      open = o;
      document.body.classList.toggle('menu-open', o);
      toggle.setAttribute('aria-expanded', o);
      toggle.setAttribute('aria-label', o ? 'Menü schließen' : 'Menü öffnen');
      menu.setAttribute('aria-hidden', !o);
      menu.style.visibility = o ? 'visible' : 'hidden';
      document.body.style.overflow = o ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(!open));
    $$('[data-menu-link]').forEach((a) => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) set(false); });
  }
})();
