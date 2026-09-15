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

  /* ---------- preloader + Einstieg ---------- */
  const pre = $('[data-preloader]');
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .to('.preloader__mark', { opacity: 1, scale: 1, duration: 0.9, ease: 'power4.out' })
    .to('.preloader__mark', { opacity: 0, scale: 1.15, duration: 0.5, ease: 'power3.in' }, '+=0.35')
    .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.2')
    .set(pre, { display: 'none' })
    .from('.site-head__mark, .topbar > *, .mainnav__item, .mainnav__cta',
      { y: -16, opacity: 0, duration: 0.6, stagger: 0.05 }, '-=0.6')
    .from('.slide.is-active .slide__text > *',
      { y: 26, opacity: 0, duration: 0.8, stagger: 0.09 }, '-=0.35')
    .from('.slide.is-active .slide__car', { x: 70, opacity: 0, duration: 1 }, '-=0.75');

  /* ---------- Slider: Pfeile, Punkte, Tastatur, Selbstlauf ---------- */
  (function () {
    const root = $('[data-slider]');
    if (!root) return;
    const slides = $$('[data-slide]', root), dots = $$('[data-slide-dot]', root);
    if (slides.length < 2) return;
    const DELAY = 6500;
    let cur = 0, timer = null;

    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); if (!reduced) timer = setInterval(() => show(cur + 1, 1), DELAY); };

    function show(next, dir) {
      next = (next + slides.length) % slides.length;
      if (next === cur) return;
      slides[cur].classList.remove('is-active');
      slides[cur].setAttribute('aria-hidden', 'true');
      slides[next].classList.add('is-active');
      slides[next].removeAttribute('aria-hidden');
      dots.forEach((d, k) => k === next
        ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'));
      cur = next;
      if (!reduced) {
        gsap.fromTo($$('.slide__text > *', slides[cur]), { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' });
        gsap.fromTo($('.slide__car', slides[cur]), { x: dir < 0 ? -60 : 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      }
      start();
    }

    $('[data-slide-next]', root).addEventListener('click', () => show(cur + 1, 1));
    $('[data-slide-prev]', root).addEventListener('click', () => show(cur - 1, -1));
    dots.forEach((d, k) => d.addEventListener('click', () => show(k, k > cur ? 1 : -1)));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, -1); }
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  })();

  /* ---------- programmatic scroll (GSAP-driven, plays nice with Lenis) ---------- */
  function headOffset() {
    const head = $('.site-head');
    return head ? head.getBoundingClientRect().height - 1 : 0;
  }
  function scrollToEl(el) {
    const y = el.getBoundingClientRect().top + window.scrollY - headOffset();
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
