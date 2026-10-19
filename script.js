(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = ['#00e5ff', '#ff3ec8', '#3dff8b', '#ffe14d', '#8f9bff'];

  /* ---------- Navigation ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Highlight the nav link for the section currently on screen
  const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean)
      .forEach((section) => spy.observe(section));
  }

  /* ---------- Scroll reveal ---------- */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty('--delay', `${i * 90}ms`));
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Typed roles ---------- */
  const typed = document.querySelector('.typed');
  if (typed && !reduceMotion) {
    const words = JSON.parse(typed.dataset.words);
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    const tick = () => {
      if (deleting) {
        charIndex -= 1;
        typed.textContent = words[wordIndex].slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
        setTimeout(tick, 40);
      } else {
        const word = words[wordIndex];
        charIndex += 1;
        typed.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(tick, 1900);
        } else {
          setTimeout(tick, 80);
        }
      }
    };
    setTimeout(tick, 1900);
  }

  /* ---------- Hero pixel particles ---------- */
  const hero = document.querySelector('.hero');
  const heroCanvas = document.querySelector('.hero__canvas');
  if (hero && heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    const mouse = { x: -9999, y: -9999 };
    let width = 0;
    let height = 0;
    let particles = [];
    let running = true;
    let last = performance.now();

    const makeParticle = (anywhere) => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10,
      size: 2 + Math.floor(Math.random() * 4),
      vx: (Math.random() - 0.5) * 8,
      vy: -(8 + Math.random() * 24),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      alpha: 0.2 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = heroCanvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      heroCanvas.width = Math.round(width * dpr);
      heroCanvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(120, (width * height) / 12000));
      particles = Array.from({ length: count }, () => makeParticle(true));
    };

    const draw = (dt) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.phase += dt;
        p.x += (p.vx + Math.sin(p.phase) * 6) * dt;
        p.y += p.vy * dt;

        // Particles scatter away from the cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 140 * 140) {
          const dist = Math.sqrt(dist2) || 1;
          const force = ((140 - dist) / 140) * 220 * dt;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
        if (p.y < -10 || p.x < -20 || p.x > width + 20) Object.assign(p, makeParticle(false));

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      if (running) requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', (e) => {
      const rect = heroCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

    if (reduceMotion) {
      draw(0);
    } else {
      requestAnimationFrame(loop);
      // Pause the animation while the hero is off screen
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          const wasRunning = running;
          running = entry.isIntersecting;
          if (running && !wasRunning) {
            last = performance.now();
            requestAnimationFrame(loop);
          }
        }).observe(hero);
      }
    }
  }

  /* ---------- Toast ---------- */
  const toastEl = document.querySelector('.toast');
  let toastTimer = 0;
  function toast(label, message) {
    toastEl.innerHTML = '';
    const labelEl = document.createElement('span');
    labelEl.className = 'toast__label';
    labelEl.textContent = label;
    toastEl.append(labelEl, document.createTextNode(message));
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3500);
  }

  /* ---------- Clickable mascot ---------- */
  const mascot = document.querySelector('.mascot');
  const scoreEl = document.querySelector('[data-score]');
  let pokes = 0;
  const POKE_MILESTONES = {
    10: 'Blob befriender: 10 pokes',
    25: 'Blob whisperer: 25 pokes',
    50: 'Okay, the blob is getting tired now',
    100: 'Legendary poker: 100 pokes. Seriously, go play Slime Blaster',
  };
  mascot?.addEventListener('click', () => {
    pokes += 1;
    scoreEl.textContent = String(pokes * 10).padStart(4, '0');
    mascot.classList.remove('is-jumping');
    void mascot.offsetWidth; // restart the jump animation
    mascot.classList.add('is-jumping');

    const pop = document.createElement('span');
    pop.className = 'pop';
    pop.textContent = '+10';
    pop.setAttribute('aria-hidden', 'true');
    mascot.parentElement.appendChild(pop);
    pop.addEventListener('animationend', () => pop.remove());
    setTimeout(() => pop.remove(), 1500);

    if (POKE_MILESTONES[pokes]) toast('Achievement unlocked', POKE_MILESTONES[pokes]);
  });

  /* ---------- Project card tilt ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--ry', `${(px - 0.5) * 8}deg`);
        card.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Konami code ---------- */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  const recent = [];
  window.addEventListener('keydown', (e) => {
    recent.push(e.key.toLowerCase());
    if (recent.length > KONAMI.length) recent.shift();
    if (recent.join() === KONAMI.join()) {
      recent.length = 0;
      confetti();
      toast('Cheat code accepted', '+30 lives. Old-school gamer detected.');
    }
  });

  function confetti() {
    if (reduceMotion) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const bits = Array.from({ length: 180 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h * 0.7,
      vx: (Math.random() - 0.5) * 1100,
      vy: -500 - Math.random() * 800,
      size: 4 + Math.random() * 6,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    }));

    let last = performance.now();
    let elapsed = 0;
    const frame = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      elapsed += dt;
      ctx.clearRect(0, 0, w, h);
      for (const b of bits) {
        b.vy += 1300 * dt;
        b.vx *= 1 - 0.8 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.size, b.size);
      }
      if (elapsed < 3.5) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }
})();
