/* KREBS AUTOMOBILE — landing page choreography
   GSAP + ScrollTrigger + Lenis */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;

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

  /* ---------- split words into chars ---------- */
  $$('[data-split]').forEach((el) => {
    const txt = el.textContent;
    el.textContent = '';
    [...txt].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.display = 'inline-block';
      s.textContent = ch;
      el.appendChild(s);
    });
  });

  /* ---------- preloader + hero intro ---------- */
  gsap.set('[data-hero-figure]', { xPercent: -50 });
  const pre = $('[data-preloader]');
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .to('.preloader__mark', { opacity: 1, scale: 1, duration: 0.9, ease: 'power4.out' })
    .to('.preloader__mark', { opacity: 0, scale: 1.15, duration: 0.5, ease: 'power3.in' }, '+=0.35')
    .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.2')
    .set(pre, { display: 'none' })
    .from('.hero__title .ch', { yPercent: 60, opacity: 0, duration: 1, stagger: 0.03 }, '-=0.7')
    .from('[data-hero-figure]', { yPercent: 18, opacity: 0, duration: 1.3 }, '-=0.9')
    .from('.nav__logo, .nav__right > *', { opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.9')
    .from('[data-hero-scroll]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.6');

  /* ---------- hero scroll transition: pin, darken, frame the portrait, marquee text (wie Norris) ---------- */
  (function () {
    const hero = $('[data-hero]'), fig = $('[data-hero-figure]'), frame = $('[data-hero-frame]'), title = $('.hero__title');
    const marqs = $$('[data-hero-marq]');
    if (!hero || !fig) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: () => isTouch ? '+=100%' : '+=140%', pin: true, scrub: isTouch ? true : 0.6, anticipatePin: 1, invalidateOnRefresh: true, fastScrollEnd: true,
      onUpdate: (st) => { hero.classList.toggle('is-framed', st.progress > 0.35); $('[data-nav]').classList.toggle('is-dark', st.progress > 0.35); if (themeMeta) { const c = st.progress > 0.35 ? '#1B2540' : '#F5F4EF'; if (themeMeta.getAttribute('content') !== c) { themeMeta.setAttribute('content', c); document.documentElement.style.backgroundColor = c; } } } } });
    const mobile = () => innerWidth <= 760;
    const fw = () => mobile() ? innerWidth * 0.88 : Math.min(innerWidth * 0.46, 760), fh = () => mobile() ? innerHeight * 0.6 : Math.min(innerHeight * 0.58, 560);
    // explicit start values → no jump when the scrub timeline first renders during the intro animation
    tl.fromTo(hero, { backgroundColor: '#F5F4EF' }, { backgroundColor: '#1B2540', duration: 1, ease: 'none' }, 0)
      .to(title, { opacity: 0, yPercent: -20, duration: 0.5, ease: 'none' }, 0)
      .to('.hero__topo', { opacity: 0, duration: 0.5 }, 0)
      .fromTo('[data-hero-scroll]', { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'none' }, 0)
      .fromTo(frame, { width: '100%', height: '100%', left: 0, top: 0, borderRadius: 0, backgroundColor: 'rgba(230,229,224,0)' },
        { width: fw, height: fh, left: () => (innerWidth - fw()) / 2, top: () => (innerHeight - fh()) / 2, borderRadius: 6, backgroundColor: 'rgba(230,229,224,1)', duration: 1, ease: 'power2.inOut' }, 0)
      .to('[data-hero-frame-video]', { opacity: isTouch ? 0 : 0.9, duration: 0.6 }, 0.3)
      .fromTo(fig, { scale: 1, yPercent: 0 }, { scale: () => mobile() ? 0.72 : 0.56, yPercent: () => mobile() ? 0 : 4, duration: 1, ease: 'power2.inOut' }, 0)
      .to('.hero__fade', { opacity: 0, duration: 0.4 }, 0.1)
      .to('[data-hero-grid]', { opacity: 1, duration: 0.6 }, 0.35)
      .to(marqs, { opacity: 1, duration: 0.35 }, 0.5);
    // Fließband: oben links→rechts, unten rechts→links, dauerhaft
    marqs.forEach((m) => {
      const dir = parseFloat(m.dataset.heroMarq) || 1;
      const run = () => {
        const half = m.scrollWidth / 2;
        gsap.fromTo(m, dir > 0 ? { x: -half } : { x: 0 }, { x: dir > 0 ? 0 : -half, duration: half / 70, ease: 'none', repeat: -1 });
      };
      if (document.readyState === 'complete') run(); else addEventListener('load', run);
    });
  })();

  /* ---------- hero: topo lines — draw on, then drift independently; mouse moves each at its own depth ---------- */
  // procedural contour lines (Lando-style topo map)
  (function genTopo() {
    const g = $('[data-topo-lines]');
    if (!g) return;
    const N = isTouch ? 4 : 7, W = 1920, H = 1000;
    const rnd = (seed) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x); };
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
    // a few closed contour rings
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
      // draw in, hold, erase from the other end, repeat — like a pen writing the line
      const dur = 2.6 + (i % 5) * 0.6;
      if (isTouch) { gsap.to(p, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', delay: 1.8 + i * 0.3 }); return; }
      gsap.timeline({ repeat: -1, delay: 1.8 + (i % 7) * 0.45 })
        .to(p, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' })
        .to(p, { strokeDashoffset: -len, duration: dur, ease: 'power2.inOut' }, '+=' + (0.8 + (i % 3) * 0.5))
        .set(p, { strokeDashoffset: len }, '+=' + (0.6 + (i % 4) * 0.4));
    } else {
      if (isTouch) return;
      // blobs: slow breathing + rotation
      gsap.set(p, { transformOrigin: '50% 50%' });
      gsap.to(p, { scale: 1.12, rotation: i % 2 ? 8 : -8, duration: 6 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    if (!isTouch) gsap.to(p, { x: (i % 2 ? 1 : -1) * (12 + (i % 6) * 4), y: (i % 3 - 1) * 10, duration: 7 + (i % 5) * 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: (i % 6) * 0.4 });
  });
  if (!isTouch) {
    const fig = $('[data-hero-figure]');
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      gsap.to(fig, { x: x * 14, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      topoPaths.forEach((p, i) => {
        const depth = 0.3 + (i % 5) * 0.25;
        gsap.to(p, { xPercent: x * -2.2 * depth, yPercent: y * -2 * depth, duration: 1.4 + i * 0.1, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }

  /* ---------- hero: Three.js mannequin bust (placeholder until 3D scan) + wireframe dome ---------- */
  (function hero3D() {
    const canvas = $('[data-gl]');
    const hero = $('[data-hero]');
    if (!canvas || typeof THREE === 'undefined' || reduced) return;
    const MODE = hero.dataset.heroMode || 'mannequin'; // 'mannequin' | 'photo'
    const head = $('[data-head]');
    if (MODE === 'mannequin') $('[data-hero-figure]').style.display = 'none';

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    cam.position.z = 8;

    // lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d6cf, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0x6aaefd, 0.7); rim.position.set(-5, 2, -3); scene.add(rim);

    // mannequin
    const bust = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0xe4e2da, roughness: 0.55, metalness: 0.02 });
    const headM = new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 48), skin);
    headM.scale.set(0.92, 1.18, 1); headM.position.y = 1.0; bust.add(headM);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.4, 0.9, 32), skin);
    neck.position.y = -0.15; bust.add(neck);
    const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 2.2, 12, 32), skin);
    shoulders.rotation.z = Math.PI / 2; shoulders.position.y = -1.05; bust.add(shoulders);
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.5, 1.6, 48), skin);
    chest.position.y = -1.85; chest.scale.z = 0.55; bust.add(chest);
    bust.visible = MODE === 'mannequin';
    scene.add(bust);

    // wireframe dome (the "helmet")
    const group = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: 0x0b0b0c, transparent: true, opacity: 0.55 });
    const accent = new THREE.LineBasicMaterial({ color: 0x1f6bd6, transparent: true, opacity: 0.9 });
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(1.35, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2.2)), mat));
    const r1 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.TorusGeometry(1.42, 0.02, 4, 64)), accent); r1.rotation.x = Math.PI / 2; group.add(r1);
    const b = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.18, 0.18)), accent); b.position.set(0, 1.2, 0.9); group.add(b);
    scene.add(group);
    window.__hero = { group, cam, renderer };

    let W = 0, H = 0, aspect = 1;
    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight; aspect = W / H;
      renderer.setSize(W, H, false);
      cam.aspect = aspect; cam.updateProjectionMatrix();
      const s = aspect < 0.75 ? 0.5 : 0.62;
      bust.scale.setScalar(s);
      bust.position.y = -1.45 - (0.62 - s) * 0.8;
    }
    resize(); addEventListener('resize', resize);

    let mx = 0, my = 0;
    if (!isTouch) addEventListener('mousemove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

    const v = new THREE.Vector3();
    function screenToWorld(px, py, z) {
      v.set((px / W) * 2 - 1, -(py / H) * 2 + 1, 0.5).unproject(cam);
      const dir = v.sub(cam.position).normalize();
      const dist = (z - cam.position.z) / dir.z;
      return cam.position.clone().add(dir.multiplyScalar(dist));
    }
    const target = new THREE.Vector3();
    function frame() {
      if (MODE === 'mannequin') {
        // bust looks toward cursor, dome rides on head top
        bust.rotation.y += ((mx * 0.6) - bust.rotation.y) * 0.06;
        headM.rotation.x += ((my * 0.35) - headM.rotation.x) * 0.06;
        headM.rotation.y = bust.rotation.y * 0.4;
        const s = bust.scale.x;
        target.set(0, bust.position.y + (1.0 + 0.9 * 1.18 - 0.42) * s, 0);
        group.position.lerp(target, 0.2);
        group.scale.setScalar(0.66 * s);
        group.rotation.y += 0.004 + mx * 0.004;
        group.rotation.x = 0.1 + my * 0.15;
        group.rotation.z = mx * 0.15;
      } else if (head) {
        const r = head.getBoundingClientRect(), c = canvas.getBoundingClientRect();
        const hx = r.left - c.left + r.width * 0.535;
        const hy = r.top - c.top + r.height * 0.08;
        const p = screenToWorld(hx, hy, 0);
        const headWorldW = screenToWorld(r.right - c.left, hy, 0).x - screenToWorld(r.left - c.left, hy, 0).x;
        const scale = headWorldW * 0.15;
        group.position.set(p.x, p.y - scale * 0.15, 0);
        group.scale.setScalar(scale);
        group.rotation.y += 0.004 + mx * 0.004;
        group.rotation.x = 0.18 + my * 0.2;
        group.rotation.z = mx * 0.2;
      }
      renderer.render(scene, cam);
    }
    gsap.ticker.add(frame);
  })();

  /* ---------- programmatic scroll (GSAP-driven, plays nice with Lenis) ---------- */
  function scrollToEl(el) {
    const y = el.getBoundingClientRect().top + window.scrollY;
    const from = window.scrollY, o = { v: from };
    gsap.to(o, { v: y, duration: 1.3, ease: 'power4.inOut', overwrite: true,
      onUpdate: () => { lenis ? lenis.scrollTo(o.v, { immediate: true, force: true }) : window.scrollTo(0, o.v); } });
  }

  /* ---------- nav theme by section + Safari-Balkenfarbe folgt dem Hintergrund ---------- */
  const nav = $('[data-nav]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const setBarColor = (el) => {
    if (!themeMeta) return;
    let bg = getComputedStyle(el).backgroundColor, node = el;
    while ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && node.parentElement) { node = node.parentElement; bg = getComputedStyle(node).backgroundColor; }
    themeMeta.setAttribute('content', bg);
    document.documentElement.style.backgroundColor = bg;
  };
  $$('[data-nav-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 60px', end: 'bottom 60px',
      onToggle: (st) => { if (st.isActive) { nav.classList.toggle('is-dark', sec.dataset.navTheme === 'dark'); setBarColor(sec); } }
    });
  });

  /* ---------- menu ---------- */
  const menu = $('[data-menu]'), toggle = $('[data-menu-toggle]'), menuImg = $('[data-menu-img]');
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
      setTimeout(() => scrollToEl(target), 450);
    });
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* ---------- signature: Scroll-Stopper — Intro bleibt stehen, Unterschrift schreibt sich mit dem Scroll ---------- */
  const sig = $('[data-signature]');
  if (sig) {
    gsap.timeline({ scrollTrigger: { trigger: '.intro', start: 'bottom bottom', end: () => isTouch ? '+=55%' : '+=90%', pin: true, scrub: isTouch ? true : 0.5, anticipatePin: 1, invalidateOnRefresh: true } })
      .to(sig, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'none' });
  }

  /* ---------- partner logo marquee: constant, infinite ---------- */
  (function () {
    const track = $('[data-marquee-slow]');
    if (!track) return;
    const run = () => {
      const half = track.scrollWidth / 2;
      gsap.to(track, { x: -half, duration: half / 60, ease: 'none', repeat: -1 });
    };
    if (document.readyState === 'complete') run(); else addEventListener('load', run);
  })();

  /* ---------- horizontal sections (ON SET / OFF SET, Cases) ---------- */
  $$('[data-hz]').forEach((sec) => {
    const track = $('[data-hz-track]', sec), bg = $('[data-hz-bg]', sec);
    if (!track) return;
    const getDist = () => track.scrollWidth - innerWidth;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: () => '+=' + getDist() * 1.05,
        pin: $('.hz__pin', sec), scrub: isTouch ? true : 1, invalidateOnRefresh: true, anticipatePin: 1, fastScrollEnd: true,
        onUpdate: (st) => { if (bg) bg.style.background = st.progress > 0.55 ? '#1A1D24' : '#0C0E12'; }
      }
    });
    tl.to(track, { x: () => -getDist(), ease: 'none' });
    $$('.hz__item img', sec).forEach((img) => {
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none',
        scrollTrigger: { containerAnimation: tl, trigger: img.parentElement, start: 'left right', end: 'right left', scrub: true } });
    });
    $$('.hz__big', sec).forEach((el) => {
      gsap.from(el, { yPercent: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { containerAnimation: tl, trigger: el.parentElement, start: 'left 90%' } });
    });
    // cases: items drift in at different depths, title fades in
    $$('.hz__case', sec).forEach((el, i) => {
      gsap.fromTo(el, { x: 60 + (i % 3) * 40, opacity: 0 }, { x: 0, opacity: 1, ease: 'none',
        scrollTrigger: { containerAnimation: tl, trigger: el, start: 'left 100%', end: 'left 60%', scrub: true } });
    });
    $$('.hz__title, .hz__follow, .hz__quote', sec).forEach((el) => {
      gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { containerAnimation: tl, trigger: el, start: 'left 92%' } });
    });
  });

  /* ---------- reveals ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- partner logos: endless, moving left → right ---------- */
  (function () {
    const track = $('[data-logo-track]');
    if (!track) return;
    const run = () => { const half = track.scrollWidth / 2; gsap.fromTo(track, { x: -half }, { x: 0, duration: half / 55, ease: 'none', repeat: -1 }); };
    if (document.readyState === 'complete') run(); else addEventListener('load', run);
  })();

  /* ---------- story: journey line — zeichnet sich synchron zum Scrollen, Punkt an der Spitze, nur vorwärts (wie nikitakrebs.de) ---------- */
  (function () {
    const list = $('.exe__wrap'), svg = $('[data-journey-svg]'), path = $('[data-journey-path]'), dot = $('[data-journey-dot]');
    if (!list || !svg || !path || !dot) return;
    const rows = $$('[data-exe-row]', list);
    let L = 0, maxP = 0;
    function build() {
      const W = list.clientWidth, H = list.clientHeight, lr = list.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('preserveAspectRatio', 'none');
      path.removeAttribute('vector-effect'); path.style.strokeWidth = '3px';
      let d = '', prev = null;
      rows.forEach((r) => {
        const mEl = $('.exe__media', r), raw = mEl.getBoundingClientRect(), dy = parseFloat(gsap.getProperty(mEl, 'y')) || 0;
        const mr = { left: raw.left, width: raw.width, height: raw.height, top: raw.top - dy, bottom: raw.bottom - dy };
        // Kurve beginnt/endet ein Stück innerhalb des Videos (dort verdeckt) → weiche, runde Bögen
        const inset = Math.min(mr.height * 0.5, 220);
        const x = mr.left + mr.width / 2 - lr.left, yTop = mr.top - lr.top + inset, yBot = mr.bottom - lr.top - inset;
        if (!prev) d = `M${x.toFixed(1)},${(mr.top - lr.top).toFixed(1)}`;
        else { const gap = yTop - prev.yBot; d += ` C${prev.x.toFixed(1)},${(prev.yBot + gap * 0.85).toFixed(1)} ${x.toFixed(1)},${(yTop - gap * 0.85).toFixed(1)} ${x.toFixed(1)},${yTop.toFixed(1)}`; }
        d += ` L${x.toFixed(1)},${yBot.toFixed(1)}`;
        prev = { x, yBot };
      });
      path.setAttribute('d', d);
      L = path.getTotalLength();
      path.style.strokeDasharray = L;
    }
    function update() {
      if (innerWidth <= 900) { path.style.strokeDashoffset = 0; dot.style.opacity = 0; return; }
      const rect = list.getBoundingClientRect();
      let p = Math.max(0, Math.min(1, (innerHeight * 0.5 - rect.top) / rect.height));
      if (p <= maxP) p = maxP; else maxP = p;
      path.style.strokeDashoffset = L * (1 - p);
      const pt = path.getPointAtLength(L * p);
      dot.style.left = pt.x + 'px'; dot.style.top = pt.y + 'px';
      dot.style.opacity = p > 0.002 && p < 0.998 ? 1 : 0;
    }
    function rebuild() { maxP = 0; build(); update(); }
    if (lenis) lenis.on('scroll', update); else addEventListener('scroll', update, { passive: true });
    addEventListener('resize', rebuild); addEventListener('load', rebuild);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
    ScrollTrigger.addEventListener('refresh', rebuild);
    build(); update();
  })();

  /* ---------- explain: word-by-word scrub + sticky media ---------- */
  $$('[data-explain]').forEach((sec) => {
    const h = $('[data-words]', sec), p = $('[data-lines]', sec), media = $('[data-explain-media]', sec);
    if (h) {
      h.innerHTML = h.textContent.trim().split(/\s+/).map((w) => '<span class="w">' + w + '</span>').join('');
      gsap.to($$('.w', h), { opacity: 1, stagger: 0.25, ease: 'none',
        scrollTrigger: { trigger: h, start: 'top 80%', end: 'bottom 40%', scrub: 0.6 } });
    }
    if (p) {
      // split into sentences → each reveals as you scroll
      // a period inside a number ("1.780") is not a sentence end — hide it
      // from the splitter, then put it back
      const DOT = '\u0001';
      const masked = p.textContent.trim().replace(/(\d)\.(\d)/g, '$1' + DOT + '$2');
      const parts = (masked.match(/[^.!?]+[.!?]+/g) || [masked])
        .map((s) => s.split(DOT).join('.'));
      p.innerHTML = parts.map((s) => '<span class="ln">' + s.trim() + '</span>').join(' ');
      gsap.to($$('.ln', p), { opacity: 1, y: 0, stagger: 0.3, ease: 'power2.out', duration: 1,
        scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: 0.8 } });
    }
    const link = $('.explain__link', sec);
    if (link) gsap.from(link, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: link, start: 'top 90%' } });
    if (media) {
      gsap.to(media, { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 70%' } });
    }
  });

  /* ---------- collage: parallax items + bg shift ---------- */
  (function () {
    const sec = $('[data-collage]');
    if (!sec) return;
    {
      const amp = matchMedia('(min-width: 761px)').matches ? 160 : 36;
      $$('.collage__item', sec).forEach((el) => {
        const sp = parseFloat(el.dataset.speed || 1);
        gsap.fromTo(el, { y: amp * sp }, { y: -amp * sp, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(el, { opacity: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 95%' } });
      });
    }
    ScrollTrigger.create({ trigger: sec, start: '58% bottom', end: 'bottom top',
      onToggle: (st) => { sec.classList.toggle('is-dark', st.isActive); nav.classList.toggle('is-dark', st.isActive); setTimeout(() => setBarColor(sec), 950); } });
  })();

  /* ---------- counter ---------- */
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to({ v: 0 }, { v: target, duration: 1.6, ease: 'power3.out', onUpdate() { el.textContent = Math.round(this.targets()[0].v); } }) });
  });

  /* ---------- exe rows ---------- */
  $$('[data-exe-row]').forEach((row) => {
    const media = $('.exe__media', row);
    gsap.to(media, { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 80%' } });
    gsap.from($$('.exe__year, .exe__text > *', row), { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 80%' } });
  });

  /* ---------- footer big text ---------- */
  gsap.from('.footer__brand .ch', { yPercent: 100, opacity: 0, duration: 1, stagger: 0.03, ease: 'power4.out',
    scrollTrigger: { trigger: '.footer', start: 'top 75%' } });

  /* ---------- anchor links (nav logo) ---------- */
  $$('a[href^="#"]:not([data-menu-link])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = $(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      scrollToEl(t);
    });
  });

  // Layout ändert sich nach Lazy-Images/Fonts → Trigger-Positionen nachziehen (sonst z.B. Galerie zu früh dunkel)
  let refreshT;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => { ScrollTrigger.refresh(); lenis && lenis.resize(); }, 150); };
  $$('img').forEach((im) => { if (!im.complete) im.addEventListener('load', queueRefresh, { once: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueRefresh);
  addEventListener('load', () => { queueRefresh(); setTimeout(queueRefresh, 1500); setTimeout(queueRefresh, 4000); });
  addEventListener('orientationchange', () => setTimeout(queueRefresh, 300));
})();
