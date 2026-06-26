/* =========================================================
   ŒIL STUDIO — interactions
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Iris : fibres générées ---------- */
  const fibers = $('[data-fibers]');
  if (fibers) {
    const cx = 500, cy = 300, rIn = 60, rOut = 150;
    const ns = 'http://www.w3.org/2000/svg';
    let markup = '';
    for (let i = 0; i < 130; i++) {
      const a = (i / 130) * Math.PI * 2 + (Math.random() - 0.5) * 0.06;
      const jitterIn  = rIn + Math.random() * 8;
      const jitterOut = rOut - Math.random() * 38;
      const x1 = cx + Math.cos(a) * jitterIn;
      const y1 = cy + Math.sin(a) * jitterIn;
      const x2 = cx + Math.cos(a) * jitterOut;
      const y2 = cy + Math.sin(a) * jitterOut;
      const o  = (0.15 + Math.random() * 0.5).toFixed(2);
      markup += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-opacity="${o}"/>`;
    }
    fibers.innerHTML = markup;
    // discret scintillement de l'iris
    if (!reduceMotion) {
      const iris = $('[data-iris]');
      let t = 0;
      const breathe = () => {
        t += 0.016;
        const pupil = $('[data-pupil]');
        if (pupil) pupil.setAttribute('r', (56 + Math.sin(t) * 3).toFixed(1));
        requestAnimationFrame(breathe);
      };
      requestAnimationFrame(breathe);
    }
  }

  /* ---------- INTRO : l'œil qui s'ouvre puis nous avale ---------- */
  const intro = $('[data-intro]');
  const stage = $('[data-intro-stage]');
  const irisG = $('[data-iris]');

  const revealSite = () => {
    document.body.classList.remove('is-loading', 'intro-active');
    document.body.classList.add('intro-done');
  };

  if (!intro || reduceMotion) {
    revealSite();
    if (intro) intro.remove();
  } else {
    document.body.classList.add('intro-active');
    let entered = false;

    // l'iris suit légèrement le curseur pendant l'intro
    const trackIris = (e) => {
      if (!irisG || entered) return;
      const dx = (e.clientX / window.innerWidth  - 0.5) * 46;
      const dy = (e.clientY / window.innerHeight - 0.5) * 30;
      irisG.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    };

    const enterEye = () => {
      if (entered) return;
      entered = true;
      if (irisG) irisG.style.transform = 'translate(0,0)';
      intro.classList.add('is-entering');
      window.removeEventListener('pointermove', trackIris);
      setTimeout(() => {
        intro.classList.add('is-done');
        revealSite();
        setTimeout(() => intro.remove(), 700);
      }, 1150);
    };

    // séquence : ouverture -> regard -> entrée auto
    const open = () => {
      intro.classList.add('is-open');
      if (finePointer) {
        irisG && (irisG.style.transition = 'transform .25s ease');
        window.addEventListener('pointermove', trackIris);
      }
      // entrée automatique si l'utilisateur ne clique pas
      window.__introTimer = setTimeout(enterEye, 3600);
    };

    if (document.readyState === 'complete') setTimeout(open, 450);
    else window.addEventListener('load', () => setTimeout(open, 450));
    setTimeout(() => { if (!intro.classList.contains('is-open')) open(); }, 1600); // garde-fou

    // clic/skip => on plonge dans l'œil
    $('[data-skip]')?.addEventListener('click', () => { clearTimeout(window.__introTimer); enterEye(); });
    stage?.addEventListener('click', (e) => {
      if (e.target.closest('[data-skip]')) return;
      if (!intro.classList.contains('is-open')) return;
      clearTimeout(window.__introTimer); enterEye();
    });
  }

  /* ---------- Curseur personnalisé ---------- */
  const cursor = $('[data-cursor]');
  if (cursor && finePointer) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    const hoverables = 'a, button, [data-magnetic], [data-tilt], .work, .artist, .service';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove('is-hover');
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- En-tête : état au scroll ---------- */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $('[data-burger]');
  const closeMenu = () => { document.body.classList.remove('menu-open'); burger?.setAttribute('aria-expanded', 'false'); };
  burger?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('[data-menu-link]').forEach((a) => a.addEventListener('click', closeMenu));

  /* ---------- Révélation au scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Nav active selon la section ---------- */
  const links = $$('[data-link]');
  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = '#' + en.target.id;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      });
    }, { threshold: 0.4, rootMargin: '-30% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Compteurs ---------- */
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 1400; const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Œil vivant (section studio) ---------- */
  const watcherEye = $('[data-watcher-eye]');
  const watcher = $('[data-watcher]');
  if (watcherEye && watcher && finePointer) {
    window.addEventListener('pointermove', (e) => {
      const r = watcher.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const ang = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy) / 28, 30);
      watcherEye.style.transform = `translate(${(Math.cos(ang) * dist).toFixed(1)}px, ${(Math.sin(ang) * dist).toFixed(1)}px)`;
    }, { passive: true });
  }

  /* ---------- Boutons magnétiques ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Parallaxe légère ---------- */
  const parallax = $$('[data-parallax]');
  if (parallax.length && !reduceMotion && finePointer) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) / vh;
        const speed = parseFloat(el.dataset.parallax) || 0;
        el.style.setProperty('--py', `${(off * speed * 100).toFixed(1)}px`);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Année dynamique (déjà 2026 dans le markup) ---------- */
})();
