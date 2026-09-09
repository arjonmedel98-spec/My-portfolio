document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Live animated background (connected particles, site-wide) ---------- */
(function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(30, Math.min(70, Math.round((width * height) / 24000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.6
    }));
  }

  function paintBase() {
    const grad = ctx.createRadialGradient(
      width * 0.82, height * 0.06, 0,
      width * 0.82, height * 0.06, Math.max(width, height) * 0.55
    );
    grad.addColorStop(0, 'rgba(91, 154, 160, 0.14)');
    grad.addColorStop(1, 'rgba(17, 22, 29, 0)');
    ctx.fillStyle = '#11161d';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function step() {
    paintBase();

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(91, 154, 160, ${0.14 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.fillStyle = 'rgba(231, 163, 62, 0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  if (reduceMotion) {
    paintBase();
  } else {
    step();
  }
})();

/* ---------- Screenshot carousels (featured project + showcase cards) + shared lightbox ---------- */
(function initGalleries() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Shared lightbox */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let activeShowInLightbox = null; // bound to whichever gallery is open
  let activeRestart = null;

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (activeRestart) activeRestart();
    activeShowInLightbox = null;
    activeRestart = null;
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });
  }
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => activeShowInLightbox && activeShowInLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => activeShowInLightbox && activeShowInLightbox(1));
  document.addEventListener('keydown', event => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft' && activeShowInLightbox) activeShowInLightbox(-1);
    if (event.key === 'ArrowRight' && activeShowInLightbox) activeShowInLightbox(1);
  });

  function initGallery(gallery) {
    const viewport = gallery.querySelector('.feature-gallery-viewport');
    const slides = Array.from(gallery.querySelectorAll('.feature-gallery-viewport img'));
    const dotsWrap = gallery.querySelector('.feature-gallery-dots');
    const zoomBtn = gallery.querySelector('.feature-gallery-zoom');
    if (!slides.length || !dotsWrap) return;

    let current = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show screenshot ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index, manual) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
      if (manual) restart();
      if (lightbox.classList.contains('is-open') && activeShowInLightbox === showInLightbox) {
        lightboxImg.src = slides[current].src;
        lightboxImg.alt = slides[current].alt;
      }
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 4200);
    }

    if (!reduceMotion) restart();

    function openLightbox() {
      clearInterval(timer);
      lightboxImg.src = slides[current].src;
      lightboxImg.alt = slides[current].alt;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      activeShowInLightbox = showInLightbox;
      activeRestart = () => { if (!reduceMotion) restart(); };
    }
    function showInLightbox(direction) {
      goTo(current + direction, false);
      lightboxImg.src = slides[current].src;
      lightboxImg.alt = slides[current].alt;
    }

    if (viewport) viewport.addEventListener('click', openLightbox);
    if (zoomBtn) {
      zoomBtn.addEventListener('click', event => {
        event.stopPropagation();
        openLightbox();
      });
    }
  }

  const featureGallery = document.getElementById('featureGallery');
  if (featureGallery) initGallery(featureGallery);

  document.querySelectorAll('[data-gallery]').forEach(initGallery);
})();

/* ---------- Live chat widget (opens Viber) ---------- */
(function initChatWidget() {
  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const sendBtn = document.getElementById('chatSend');
  const messageBox = document.getElementById('chatMessage');
  if (!toggle || !panel) return;

  const VIBER_NUMBER = '+639123807492';

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    if (open) messageBox.focus();
  }

  toggle.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
  closeBtn.addEventListener('click', () => setOpen(false));

  sendBtn.addEventListener('click', () => {
    const text = messageBox.value.trim() || "Hi Arjon, I'd like to chat about a project.";
    const url = `viber://chat?number=${VIBER_NUMBER}&text=${encodeURIComponent(text)}`;
    window.location.href = url;
  });
})();

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

/* ---------- Contact form: AJAX submit straight to my inbox ---------- */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = document.getElementById('contactSubmit');
const CONTACT_EMAIL = 'arjon.medel98@gmail.com';

form.addEventListener('submit', event => {
  event.preventDefault();
  status.textContent = 'Sending…';
  status.classList.remove('is-error');
  submitBtn.disabled = true;

  fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(Object.fromEntries(new FormData(form)))
  })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      status.textContent = "Thanks — that landed in my inbox. I'll get back to you soon.";
      form.reset();
    })
    .catch(() => {
      status.textContent = "Something went wrong — please email me directly at arjon.medel98@gmail.com.";
      status.classList.add('is-error');
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});
