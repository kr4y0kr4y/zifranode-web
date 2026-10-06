const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('main-nav');
if (menuButton && menu) {
  const closeMenu = () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  };
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (event) => { if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu(); });
}
const form = document.getElementById('contactForm');
if (form) {
  const requestedService = new URLSearchParams(location.search).get('service');
  if (requestedService && [...form.elements.service.options].some((option) => option.value === requestedService)) form.elements.service.value = requestedService;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements.botcheck.checked) return;
    const button = form.querySelector('[type=submit]');
    const status = document.getElementById('form-result');
    button.disabled = true;
    status.textContent = 'Enviando solicitud…';
    try {
      const response = await fetch(form.action, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))), headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('El servicio de correo no confirmó el envío.');
      status.textContent = 'Solicitud enviada. Te contactaremos pronto.';
      form.reset();
    } catch (error) {
      status.textContent = 'No pudimos enviar el formulario. Escríbenos a contacto@zifranode.cl o por WhatsApp.';
    } finally { button.disabled = false; }
  });
}

// Aparición suave al entrar en pantalla; sin movimiento si el usuario lo reduce.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = document.querySelectorAll('.fieldwork-shot, .service-tile, .featured-project, .project-teasers a, .steps li, .diagnostic-codes, .about-copy, .about-seal, .detail-card, .project-case');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 30px 0px' });
  targets.forEach((target) => { target.classList.add('reveal'); observer.observe(target); });
  document.documentElement.classList.add('has-motion');
}
