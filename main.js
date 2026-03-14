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

    // Chaque blob est une ellipse floue qui dérive lentement
    function createBlobs() {
      blobs = Array.from({ length: 9 }, () => ({
        x:    Math.random() * W,
        y:    Math.random() * H,
        rx:   W * (0.18 + Math.random() * 0.22),
        ry:   H * (0.12 + Math.random() * 0.18),
        vx:   (Math.random() - 0.5) * 0.28,
        vy:   (Math.random() - 0.5) * 0.18,
        a:    0.025 + Math.random() * 0.045,   // opacité max
        phase: Math.random() * Math.PI * 2,    // phase de pulsation
        speed: 0.0004 + Math.random() * 0.0006,
        // couleur : mélange violet/indigo
        hue:  260 + Math.random() * 50,
        sat:  60  + Math.random() * 30,
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
        // Dérive
        b.x += b.vx;
        b.y += b.vy;
        // Rebond doux sur les bords
        if (b.x < -b.rx) b.x = W + b.rx;
        if (b.x >  W + b.rx) b.x = -b.rx;
        if (b.y < -b.ry) b.y = H + b.ry;
        if (b.y >  H + b.ry) b.y = -b.ry;

        // Pulsation d'opacité
        const alpha = b.a * (0.5 + 0.5 * Math.sin(ts * b.speed + b.phase));

        // Dégradé radial elliptique
        const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(b.rx, b.ry));
        grd.addColorStop(0,   `hsla(${b.hue}, ${b.sat}%, 65%, ${alpha})`);
        grd.addColorStop(0.5, `hsla(${b.hue}, ${b.sat}%, 45%, ${alpha * 0.4})`);
        grd.addColorStop(1,   `hsla(${b.hue}, ${b.sat}%, 30%, 0)`);

        // On applique l'échelle pour rendre l'ellipse (sinon le gradient est rond)
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(1, b.ry / b.rx);
        ctx.translate(-b.x, -b.y);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.rx, 0, Math.PI * 2);
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
