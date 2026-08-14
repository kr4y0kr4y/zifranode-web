const DIAGNOSTIC_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSennBvy0Dwdfyt3EGAg03QvuGJSMTaUT6muJeSP2uI1cKd59Q/viewform?usp=publish-editor';

document.querySelectorAll('[data-diagnostic-cta]').forEach((link) => {
    link.href = DIAGNOSTIC_FORM_URL;
    link.addEventListener('click', () => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'diagnostico_inicio');
        }
    });
});
