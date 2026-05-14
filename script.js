(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Loader (candle) ----------
  const loader = document.querySelector('[data-loader]');
  const finishIntro = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('intro-done');
  };

  if (!loader || reduceMotion) {
    finishIntro();
    if (loader) loader.remove();
  } else {
    const hideLoader = () => {
      loader.classList.add('is-blowing');
      setTimeout(() => {
        loader.classList.add('is-done');
        finishIntro();
        setTimeout(() => loader.remove(), 900);
      }, 650);
    };
    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 1500);
    } else {
      window.addEventListener('load', () => setTimeout(hideLoader, 800));
      // fallback in case load never fires
      setTimeout(hideLoader, 3500);
    }
  }

  // ---------- Header scroll state ----------
  const header = document.querySelector('[data-header]');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 16);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.getElementById('mobile-nav');
  if (navToggle && mobileNav) {
    const setOpen = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.hidden = !open;
    };
    navToggle.addEventListener('click', () => {
      setOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  }

  // ---------- Custom cursor ----------
  const cursor = document.querySelector('[data-cursor]');
  if (cursor && isFinePointer && !reduceMotion) {
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    const tick = () => {
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dot)  dot.style.transform  = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    document.addEventListener('mouseup',   () => cursor.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');

    const hoverTargets = document.querySelectorAll(
      '[data-cursor-target], a, button, input, [role="button"]'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  } else if (cursor) {
    cursor.remove();
  }

  // ---------- Hero parallax ----------
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let scrollY = window.scrollY;

    window.addEventListener('mousemove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    }, { passive: true });

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      parallaxEls.forEach(el => {
        const depth = parseFloat(el.dataset.parallax) || 0.04;
        const sx = cx * 100 * depth;
        const sy = cy * 100 * depth + scrollY * depth * 0.4;
        el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll(
    '.section-head, .creed li, .card, .look, .entry, .col-body > h2, .col-body > p, .contact-note'
  );
  reveals.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 50);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // ---------- Newsletter signup ----------
  const signup = document.querySelector('[data-signup]');
  if (signup) {
    signup.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = signup.querySelector('input');
      const msg   = signup.querySelector('.signup-msg');
      const btn   = signup.querySelector('button');
      if (!input.value || !input.checkValidity()) {
        input.focus();
        return;
      }
      msg.hidden = false;
      btn.disabled = true;
      input.disabled = true;
    });
  }

  // ==============================================================
  // Cart (the Coffin)
  // ==============================================================
  const STORAGE_KEY = 'vespertine.coffin.v1';
  const cartEl       = document.querySelector('[data-cart]');
  const cartToggleEl = document.querySelector('[data-cart-toggle]');
  const cartCountEl  = document.querySelector('[data-cart-count]');
  const cartItemsEl  = document.querySelector('[data-cart-items]');
  const cartTotalEl  = document.querySelector('[data-cart-total]');
  const cartCloseEls = document.querySelectorAll('[data-cart-close]');

  /** @type {Array<{id:string,name:string,price:number,qty:number}>} */
  let cart = [];

  const loadCart = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch { cart = []; }
  };
  const saveCart = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  };

  const fmtEUR = (n) => '€ ' + n.toLocaleString('en-GB');

  const totalQty = () => cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = () => cart.reduce((s, i) => s + i.qty * i.price, 0);

  const renderCart = () => {
    if (!cartItemsEl) return;
    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your coffin lies empty.<br/><em>Choose a garment from the vigil.</em></p>';
    } else {
      cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div>
            <h4>${item.name}</h4>
            <p class="ci-meta">Edition of forty</p>
          </div>
          <p class="ci-price">${fmtEUR(item.price * item.qty)}</p>
          <div class="ci-controls">
            <div class="qty" role="group" aria-label="Quantity for ${item.name}">
              <button type="button" data-qty="-1" aria-label="Decrease quantity">&minus;</button>
              <span>${item.qty}</span>
              <button type="button" data-qty="+1" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="ci-remove" data-remove>Remove</button>
          </div>
        </div>
      `).join('');
    }
    if (cartTotalEl) cartTotalEl.textContent = fmtEUR(totalPrice());
    if (cartCountEl) cartCountEl.textContent = String(totalQty());
    if (cartToggleEl) {
      cartToggleEl.classList.toggle('has-items', totalQty() > 0);
      cartToggleEl.setAttribute('aria-label', `Open coffin (${totalQty()} item${totalQty() === 1 ? '' : 's'})`);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveCart();
    renderCart();
    bumpCart();
  };

  const updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, item.qty + delta);
    if (item.qty === 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  };

  const removeItem = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  };

  const bumpCart = () => {
    if (!cartToggleEl) return;
    cartToggleEl.classList.remove('is-bumped');
    void cartToggleEl.offsetWidth;
    cartToggleEl.classList.add('is-bumped');
  };

  const setCartOpen = (open) => {
    if (!cartEl) return;
    cartEl.setAttribute('aria-hidden', String(!open));
    if (open) cartEl.removeAttribute('hidden');
    else setTimeout(() => { if (cartEl.getAttribute('aria-hidden') === 'true') cartEl.setAttribute('hidden', ''); }, 600);
    document.body.classList.toggle('cart-open', open);
  };

  if (cartToggleEl) cartToggleEl.addEventListener('click', () => {
    const isOpen = cartEl.getAttribute('aria-hidden') !== 'true';
    setCartOpen(!isOpen);
  });
  cartCloseEls.forEach(el => el.addEventListener('click', () => setCartOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setCartOpen(false);
  });

  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-product]');
      if (!card) return;
      try {
        const product = JSON.parse(card.dataset.product);
        addToCart(product);
        btn.classList.add('is-added');
        setTimeout(() => btn.classList.remove('is-added'), 1400);
      } catch {}
    });
  });

  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      const itemEl = target.closest('.cart-item');
      if (!itemEl) return;
      const id = itemEl.dataset.id;
      if (target.dataset.qty) updateQty(id, parseInt(target.dataset.qty, 10));
      else if (target.dataset.remove !== undefined || target.classList.contains('ci-remove')) removeItem(id);
    });
  }

  const checkoutBtn = document.querySelector('.cart-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!cart.length) return;
      checkoutBtn.disabled = true;
      const note = document.querySelector('.cart-note');
      if (note) {
        note.innerHTML = '<em>The rite has begun. A messenger is on their way.</em>';
        note.style.color = 'var(--brass)';
      }
      cart = [];
      saveCart();
      setTimeout(() => {
        renderCart();
        checkoutBtn.disabled = false;
        if (note) note.textContent = 'Shipped in unmarked muslin with a candle and a wax seal.';
      }, 2200);
    });
  }

  loadCart();
  renderCart();
})();
