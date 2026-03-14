/* ═══════════════════════════════════════════════
   main.js — Loads data.json and powers the page
══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── Load data ─────────────────────────────────
  let data;
  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    console.error('Could not load data.json:', e);
    return;
  }

  // ── Brume animée VFX (canvas) ─────────────────
  const fogCanvas = document.getElementById('vfxFog');
  if (fogCanvas) {
    const ctx = fogCanvas.getContext('2d');
    let W, H, blobs, animId;

    function createBlobs() {
      blobs = Array.from({ length: 18 }, (_, i) => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        rx:    W  * (0.20 + Math.random() * 0.30),
        ry:    H  * (0.14 + Math.random() * 0.22),
        // vitesse de base + une composante sinusoïdale pour un mouvement organique
        vx:    (Math.random() - 0.5) * 0.45,
        vy:    (Math.random() - 0.5) * 0.28,
        // amplitude du mouvement ondulatoire
        swayAmp:  30 + Math.random() * 60,
        swayFreq: 0.00015 + Math.random() * 0.00020,
        swayOff:  Math.random() * Math.PI * 2,
        a:     0.045 + Math.random() * 0.07,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0003 + Math.random() * 0.0005,
        hue:   255 + Math.random() * 60,
        sat:   65  + Math.random() * 30,
        // position de base pour le sway
        baseX: Math.random() * W,
        baseY: Math.random() * H,
      }));
    }

    function resize() {
      const rect = fogCanvas.parentElement.getBoundingClientRect();
      W = fogCanvas.width  = rect.width;
      H = fogCanvas.height = rect.height;
      createBlobs();
    }

    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      blobs.forEach(b => {
        // Dérive de base
        b.baseX += b.vx;
        b.baseY += b.vy;

        // Wrap autour
        if (b.baseX < -b.rx) b.baseX = W + b.rx;
        if (b.baseX >  W + b.rx) b.baseX = -b.rx;
        if (b.baseY < -b.ry) b.baseY = H + b.ry;
        if (b.baseY >  H + b.ry) b.baseY = -b.ry;

        // Mouvement ondulatoire par-dessus la dérive
        const cx = b.baseX + Math.sin(ts * b.swayFreq + b.swayOff) * b.swayAmp;
        const cy = b.baseY + Math.cos(ts * b.swayFreq * 0.7 + b.swayOff) * (b.swayAmp * 0.5);

        // Pulsation d'opacité
        const alpha = b.a * (0.45 + 0.55 * Math.sin(ts * b.pulseSpeed + b.phase));

        const r = Math.max(b.rx, b.ry);
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0,    `hsla(${b.hue}, ${b.sat}%, 70%, ${alpha})`);
        grd.addColorStop(0.4,  `hsla(${b.hue}, ${b.sat}%, 50%, ${alpha * 0.55})`);
        grd.addColorStop(0.75, `hsla(${b.hue}, ${b.sat}%, 35%, ${alpha * 0.18})`);
        grd.addColorStop(1,    `hsla(${b.hue}, ${b.sat}%, 20%, 0)`);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, b.ry / b.rx);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx, cy, b.rx, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);
  }

  // ── Transition fond VFX au scroll ────────────
  const vfxSection = document.getElementById('vfx');
  if (vfxSection) {
    const vfxObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        vfxSection.classList.toggle('vfx--visible', entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    vfxObserver.observe(vfxSection);
  }

  // ── Navbar on scroll ──────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  // ── Mobile burger menu ────────────────────────
  const burger   = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  // ── Projects ──────────────────────────────────
  const grid        = document.getElementById('projectsGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const VISIBLE     = 4;
  let   showing     = VISIBLE;

  function renderProjects() {
    grid.innerHTML = '';
    data.projects.slice(0, showing).forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card' + (p.status === 'coming_soon' ? ' project-card--coming-soon' : '');

      if (p.status === 'coming_soon') {
        card.innerHTML = `
          <span class="project-card__type">Coming Soon</span>
          <h3 class="project-card__title">${p.title}</h3>
          <p class="project-card__desc">${p.description}</p>
          <span class="coming-soon-badge">Coming soon</span>
        `;
      } else {
        const tagsHTML = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
        card.innerHTML = `
          <span class="project-card__type">${p.type}</span>
          <h3 class="project-card__title">${p.title}</h3>
          <p class="project-card__desc">${p.description}</p>
          ${p.tags.length ? `<div class="project-card__tags">${tagsHTML}</div>` : ''}
        `;
      }

      grid.appendChild(card);
    });

    if (loadMoreBtn) {
      loadMoreBtn.style.display = showing >= data.projects.length ? 'none' : '';
    }
  }

  renderProjects();
  loadMoreBtn?.addEventListener('click', () => {
    showing += VISIBLE;
    renderProjects();
  });

  // ── VFX ───────────────────────────────────────
  const vfxGrid = document.getElementById('vfxGrid');
  if (vfxGrid && data.vfx) {
    data.vfx.forEach(v => {
      const card = document.createElement('div');
      card.className = 'vfx-card';
      card.innerHTML = `
        <div class="vfx-card__icon">
          <i data-lucide="${v.icon}"></i>
        </div>
        <h3 class="vfx-card__title">${v.title}</h3>
        <p class="vfx-card__desc">${v.description}</p>
      `;
      vfxGrid.appendChild(card);
    });
  }

  // ── Services (avec icônes Lucide) ─────────────
  const servicesGrid = document.getElementById('servicesGrid');
  if (servicesGrid) {
    data.services.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <div class="service-card__icon">
          <i data-lucide="${s.icon}"></i>
        </div>
        <h3 class="service-card__title">${s.title}</h3>
        <p class="service-card__desc">${s.description}</p>
      `;
      servicesGrid.appendChild(card);
    });

    // Initialise toutes les icônes Lucide injectées dynamiquement
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ── Form selects ──────────────────────────────
  const serviceTypeEl = document.getElementById('serviceType');
  const paymentTypeEl = document.getElementById('paymentType');

  data.contact.serviceTypes.forEach(type => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = type;
    serviceTypeEl?.appendChild(opt);
  });

  data.contact.paymentTypes.forEach(type => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = type;
    paymentTypeEl?.appendChild(opt);
  });

  // ── Form submit (mock) ────────────────────────
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  form?.addEventListener('submit', e => {
    e.preventDefault();
    // TODO: Connect to a backend (e.g. Formspree, EmailJS)
    formSuccess?.classList.add('visible');
    form.reset();
    setTimeout(() => formSuccess?.classList.remove('visible'), 5000);
  });

  // ── Animated stat counters ────────────────────
  const counters = document.querySelectorAll('.stat-card__value[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    let current  = 0;
    const step   = Math.ceil(target / 40);
    const timer  = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, 40);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));

});
