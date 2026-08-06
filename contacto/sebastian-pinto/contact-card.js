/* Datos centralizados de la tarjeta digital. */
const contact = {
    name: 'Sebastián Pinto',
    phone: '+56965114266',
    email: 's.pinto@zifranode.cl',
    whatsappMessage: 'Hola Sebastián, revisé tu tarjeta digital y quisiera conversar sobre los servicios de ZifraNode.',
    brochureUrl: 'assets/ZifraNode_Brochure_Corp.pdf',
    linkedInUrl: 'https://www.linkedin.com/company/zifranode-spa'
};

document.querySelector('[data-contact="phone"]').href = `tel:${contact.phone}`;
document.querySelector('[data-contact="email"]').href = `mailto:${contact.email}`;
document.querySelector('[data-contact="whatsapp"]').href = `https://wa.me/${contact.phone.slice(1)}?text=${encodeURIComponent(contact.whatsappMessage)}`;
document.querySelector('[data-resource="brochure"]').href = contact.brochureUrl;
document.querySelector('[data-resource="linkedin"]').href = contact.linkedInUrl;
document.getElementById('year').textContent = new Date().getFullYear();
