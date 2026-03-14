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
