const whatsappUrl = 'https://wa.me/56982874767?text=Hola%20ZifraNode%2C%20quiero%20cotizar%20un%20proyecto%20t%C3%A9cnico.';

document.querySelectorAll('a[href="#"]').forEach((link) => {
    const label = `${link.textContent} ${link.getAttribute('aria-label') || ''}`.toLowerCase();
    if (label.includes('whatsapp') || label.includes('wa')) {
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (event) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const header = document.querySelector('.header');
let isHeaderScrolled = false;

function updateHeaderState() {
    if (!header) return;
    const shouldScroll = window.pageYOffset > 30;
    if (shouldScroll !== isHeaderScrolled) {
        isHeaderScrolled = shouldScroll;
        header.classList.toggle('is-scrolled', isHeaderScrolled);
    }
}

window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

const mobileToggle = document.querySelector('.mobile-toggle');
const navList = document.querySelector('.nav-list');

if (mobileToggle && navList) {
    mobileToggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('active');
        mobileToggle.classList.toggle('active', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const initialButtonText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        const formData = new FormData(contactForm);
        const payload = JSON.stringify(Object.fromEntries(formData));

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: payload
            });

            const jsonResponse = await response.json();

            if (response.ok) {
                showNotification('Mensaje enviado. Te contactaremos pronto.', 'success');
                contactForm.reset();
            } else {
                showNotification(jsonResponse.message || 'No se pudo enviar el mensaje. Intenta nuevamente.', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión. También puedes escribirnos por WhatsApp.', 'error');
        } finally {
            submitButton.textContent = initialButtonText;
            submitButton.disabled = false;
        }
    });
}

const cybermapButton = document.querySelector('[data-load-cybermap]');
const cybermapPlaceholder = document.querySelector('[data-cybermap-placeholder]');

if (cybermapButton && cybermapPlaceholder) {
    cybermapButton.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.width = '640';
        iframe.height = '640';
        iframe.src = 'https://cybermap.kaspersky.com/es/widget/dynamic/dark';
        iframe.title = 'Mapa global de ciberamenazas de Kaspersky';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

        cybermapPlaceholder.replaceWith(iframe);
    }, { once: true });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    requestAnimationFrame(() => {
        notification.classList.add('notification-visible');
    });

    setTimeout(() => {
        notification.classList.remove('notification-visible');
        setTimeout(() => notification.remove(), 260);
    }, 4200);
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const activeNavObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
                const href = link.getAttribute('href');
                link.classList.toggle('active', href === `#${sectionId}` || href === `index.html#${sectionId}`);
            });
        }
    });
}, {
    root: null,
    rootMargin: '-10% 0px -75% 0px', // Activa la sección cuando ocupa la parte superior-media
    threshold: 0
});

sections.forEach((section) => {
    activeNavObserver.observe(section);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.service-card, .solution-card, .benefit-item, .process-step, .signal-card, .insight-list > div, .cybermap-frame').forEach((element) => {
    element.classList.add('reveal-item');
    observer.observe(element);
});

window.addEventListener('DOMContentLoaded', () => {
    const serviceParam = new URLSearchParams(window.location.search).get('service');
    const selectService = document.getElementById('service');

    if (serviceParam && selectService) {
        selectService.value = serviceParam;
        document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        if (!this.themeToggleBtn) return;

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const startLight = savedTheme ? savedTheme === 'light' : !prefersDark;

        this.applyTheme(startLight);

        this.themeToggleBtn.addEventListener('click', () => {
            this.applyTheme(!document.body.classList.contains('light-theme'));
        });
    }

    applyTheme(isLight) {
        document.body.classList.toggle('light-theme', isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }
}

new ThemeManager();
