/* ═══════════════════════════════════════════════
   main.js — Charge data.json et anime la page
══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── Chargement des données ────────────────────
  let data;
  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    console.error('Impossible de charger data.json :', e);
    return;
  }

  // ── Navbar scroll ─────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  // ── Menu burger (mobile) ──────────────────────
  const burger   = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Fermer en cliquant sur un lien
  navLinks?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  // ── Projets ───────────────────────────────────
  const grid        = document.getElementById('projectsGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const VISIBLE     = 4; // Nombre de projets affichés initialement
  let   showing     = VISIBLE;

  function renderProjects() {
    grid.innerHTML = '';
    data.projects.slice(0, showing).forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card' + (p.status === 'coming_soon' ? ' project-card--coming-soon' : '');

      if (p.status === 'coming_soon') {
        card.innerHTML = `
          <span class="project-card__type">À venir</span>
          <h3 class="project-card__title">${p.title}</h3>
          <p class="project-card__desc">${p.description}</p>
          <span class="coming-soon-badge">⏳ Bientôt disponible</span>
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

    // Masquer bouton si tout est affiché
    if (loadMoreBtn) {
      loadMoreBtn.style.display = showing >= data.projects.length ? 'none' : '';
    }
  }

  renderProjects();
  loadMoreBtn?.addEventListener('click', () => {
    showing += VISIBLE;
    renderProjects();
  });

  // ── Services ──────────────────────────────────
  const servicesGrid = document.getElementById('servicesGrid');
  if (servicesGrid) {
    data.services.forEach(s => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <div class="service-card__icon">${s.icon}</div>
        <h3 class="service-card__title">${s.title}</h3>
        <p class="service-card__desc">${s.description}</p>
      `;
      servicesGrid.appendChild(card);
    });
  }

  // ── Selects du formulaire ─────────────────────
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

  // ── Formulaire (mock submit) ──────────────────
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  form?.addEventListener('submit', e => {
    e.preventDefault();
    // TODO: Connecter à un backend (ex: Formspree, EmailJS, etc.)
    formSuccess?.classList.add('visible');
    form.reset();
    setTimeout(() => formSuccess?.classList.remove('visible'), 5000);
  });

  // ── Compteurs animés (stats) ──────────────────
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

  // Observer pour déclencher au scroll
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
