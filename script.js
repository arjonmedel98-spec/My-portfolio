document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Scroll-spy active nav link ---------- */
const navLinks = document.querySelectorAll('[data-nav]');
const sections = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const spy = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = '#' + entry.target.id;
        const link = document.querySelector(`[data-nav][href="${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach(section => spy.observe(section));
}

/* ---------- Project filter ---------- */
const filterButtons = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const filter = btn.dataset.filter;
    workCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !match);
    });
  });
});

/* ---------- Contact form: AJAX submit to Netlify Forms ---------- */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = document.getElementById('contactSubmit');

function encodeFormData(formEl) {
  return new URLSearchParams(new FormData(formEl)).toString();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  status.textContent = 'Sending…';
  status.classList.remove('is-error');
  submitBtn.disabled = true;

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeFormData(form)
  })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      status.textContent = "Thanks — I'll get back to you soon.";
      form.reset();
    })
    .catch(() => {
      status.textContent = 'Something went wrong. Please email me directly instead.';
      status.classList.add('is-error');
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});
