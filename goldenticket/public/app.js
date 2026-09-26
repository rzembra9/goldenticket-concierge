const translations = {
  fr: {
    title: 'GoldenTicket Concierge — Votre prochain grand moment', description: 'Recherche de billets pour concerts, sport et événements.', skip: 'Aller au formulaire', brandAria: 'GoldenTicket Concierge, accueil', languageAria: 'Choisir la langue', headerCta: 'Confier ma recherche', heroEyebrow: 'CONCERTS · SPORT · ÉVÉNEMENTS', heroTitle: 'Les grands moments<br>se vivent <em>en vrai.</em>', heroIntro: 'L’artiste que vous attendez. Le match que vous ne voulez pas manquer. Dites-nous où vous rêvez d’être, nous recherchons vos billets.', heroCta: 'Trouver mes places', heroCaption: 'Une recherche sur mesure, selon votre budget.', approachAria: 'Notre approche', edition: 'GOLDENTICKET / CONCIERGERIE', editorial: 'Votre événement.<br>Vos envies.<br><em>Notre recherche.</em>', memory: 'Le prochain souvenir<br>commence ici.', stepsAria: 'Comment ça marche', step1Title: 'Racontez-nous votre envie', step1Text: 'Un événement, une date, un budget.', step2Title: 'Nous recherchons vos places', step2Text: 'Une sélection selon vos critères.', step3Title: 'Vous choisissez', step3Text: 'Nous vous recontactons avec une proposition.', requestEyebrow: 'VOTRE PROCHAINE SORTIE', requestTitle: 'Une envie ?<br><em>Parlons billets.</em>', requestIntro: 'Du concert au grand rendez-vous sportif, confiez-nous votre recherche.', requestNote: 'Cette demande ne constitue ni une réservation ni un achat. Toute proposition dépend des disponibilités ; le prix et les conditions vous seront communiqués avant votre décision.', budgetNote: 'Votre budget s’entend <strong>par place, en euros.</strong>', formHeading: 'VOTRE DEMANDE', requiredLegend: '* Champs obligatoires', nameLabel: 'Nom et prénom *', namePlaceholder: 'Votre nom complet', contactLabel: 'Moyen de contact *', contactPlaceholder: 'E-mail, téléphone ou @Instagram', contactHelp: 'Pour un pseudo, précisez le réseau social.', eventLabel: 'Événement recherché *', eventPlaceholder: 'Artiste, équipe, spectacle…', cityLabel: 'Ville', cityPlaceholder: 'Ex. Paris', dateLabel: 'Date souhaitée', quantityLabel: 'Nombre de places', quantityPlaceholder: 'Ex. 2', categoryLabel: 'Catégorie / type de places', categoryPlaceholder: 'Fosse, tribune, VIP, indifférent…', budgetLabel: 'Budget maximum par place (€)', budgetPlaceholder: 'Ex. 150', budgetHelp: 'Le montant maximum que vous souhaitez dépenser pour une place.', commentLabel: 'Un détail à ajouter ?', commentPlaceholder: 'Places côte à côte, flexibilité sur les dates…', consentInfo: 'En envoyant ce formulaire, vous acceptez la transmission de ces informations à GoldenTicket Concierge via Discord afin de traiter votre demande et de vous recontacter.', submit: 'Envoyer ma demande', privacy: 'Vos coordonnées servent au suivi de votre recherche. N’indiquez aucune donnée bancaire ou pièce d’identité.', footer: 'Recherche & revente de billets · Concerts, sport, événements', sending: 'Envoi en cours…', transmitting: 'Transmission de votre demande…', fallbackError: 'L’envoi a échoué. Veuillez réessayer.', success: ref => `Votre demande a bien été reçue. Référence : ${ref}. Nous vous recontacterons via le moyen indiqué.`, timeout: 'La confirmation n’a pas pu être reçue. Vos informations sont conservées dans le formulaire. Patientez avant de réessayer.'
  },
  en: {
    title: 'GoldenTicket Concierge — Your next great moment', description: 'Ticket sourcing for concerts, sports and events.', skip: 'Skip to the form', brandAria: 'GoldenTicket Concierge, home', languageAria: 'Choose language', headerCta: 'Start my search', heroEyebrow: 'CONCERTS · SPORTS · EVENTS', heroTitle: 'Great moments<br>happen <em>live.</em>', heroIntro: 'The artist you have been waiting for. The match you cannot miss. Tell us where you want to be and we will search for your tickets.', heroCta: 'Find my tickets', heroCaption: 'A tailored search that respects your budget.', approachAria: 'Our approach', edition: 'GOLDENTICKET / CONCIERGE', editorial: 'Your event.<br>Your preferences.<br><em>Our search.</em>', memory: 'Your next memory<br>starts here.', stepsAria: 'How it works', step1Title: 'Tell us what you want', step1Text: 'An event, a date, a budget.', step2Title: 'We search for your tickets', step2Text: 'A selection based on your criteria.', step3Title: 'You decide', step3Text: 'We contact you with an offer.', requestEyebrow: 'YOUR NEXT EVENT', requestTitle: 'Looking for tickets?<br><em>Let’s talk.</em>', requestIntro: 'From concerts to major sporting events, let us handle your search.', requestNote: 'This request is not a booking or a purchase. Every offer is subject to availability; you will receive the price and conditions before making a decision.', budgetNote: 'Your budget is understood <strong>per ticket, in euros.</strong>', formHeading: 'YOUR REQUEST', requiredLegend: '* Required fields', nameLabel: 'Full name *', namePlaceholder: 'Your full name', contactLabel: 'Contact method *', contactPlaceholder: 'Email, phone or @Instagram', contactHelp: 'For a username, please specify the social network.', eventLabel: 'Event *', eventPlaceholder: 'Artist, team, show…', cityLabel: 'City', cityPlaceholder: 'E.g. London', dateLabel: 'Preferred date', quantityLabel: 'Number of tickets', quantityPlaceholder: 'E.g. 2', categoryLabel: 'Seating category / type', categoryPlaceholder: 'Standing, seated, VIP, no preference…', budgetLabel: 'Maximum budget per ticket (€)', budgetPlaceholder: 'E.g. 150', budgetHelp: 'The maximum amount you would like to spend on one ticket.', commentLabel: 'Anything else to add?', commentPlaceholder: 'Seats together, flexible dates…', consentInfo: 'By submitting this form, you agree that this information may be sent to GoldenTicket Concierge via Discord so we can process your request and contact you.', submit: 'Send my request', privacy: 'Your contact details are used to follow up on your request. Do not provide payment details or identity documents.', footer: 'Ticket sourcing & resale · Concerts, sports, events', sending: 'Sending…', transmitting: 'Sending your request…', fallbackError: 'Your request could not be sent. Please try again.', success: ref => `Your request has been received. Reference: ${ref}. We will contact you using the details provided.`, timeout: 'We could not receive confirmation. Your information is still in the form. Please wait before trying again.'
  }
};

const form = document.querySelector('#request-form');
const status = document.querySelector('#form-status');
const button = form.querySelector('button[type="submit"]');
const date = form.elements.date;
date.min = new Date().toISOString().slice(0, 10);
let lang = localStorage.getItem('goldenticket-language') || (navigator.language.toLowerCase().startsWith('en') ? 'en' : 'fr');
let key = crypto.randomUUID();
let previousPayload = '';
let busy = false;

function applyLanguage(next) {
  lang = next === 'en' ? 'en' : 'fr';
  const t = translations[lang];
  document.documentElement.lang = lang;
  document.title = t.title;
  document.querySelector('meta[name="description"]').content = t.description;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t[el.dataset.i18nHtml]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t[el.dataset.i18nPlaceholder]; });
  document.querySelector('#brand-link').setAttribute('aria-label', t.brandAria);
  document.querySelector('#language-switch').setAttribute('aria-label', t.languageAria);
  document.querySelector('#approach').setAttribute('aria-label', t.approachAria);
  document.querySelector('#steps').setAttribute('aria-label', t.stepsAria);
  document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
  localStorage.setItem('goldenticket-language', lang);
}

document.querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click', () => applyLanguage(el.dataset.lang)));
applyLanguage(lang);

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !form.reportValidity()) return;
  const raw = Object.fromEntries(new FormData(form));
  const data = { ...raw, locale: lang, quantity: raw.quantity ? Number(raw.quantity) : null, budget: raw.budget ? Number(raw.budget) : null };
  const payload = JSON.stringify(data);
  if (previousPayload && previousPayload !== payload) key = crypto.randomUUID();
  previousPayload = payload;
  busy = true; button.disabled = true; form.setAttribute('aria-busy', 'true');
  button.querySelector('[data-i18n]').textContent = translations[lang].sending;
  status.textContent = translations[lang].transmitting; status.dataset.state = 'loading';
  try {
    const response = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: payload, signal: AbortSignal.timeout(20000) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || translations[lang].fallbackError);
    status.textContent = translations[lang].success(result.reference); status.dataset.state = 'success';
    form.reset(); key = crypto.randomUUID(); previousPayload = '';
  } catch (error) {
    status.dataset.state = 'error';
    status.textContent = error.name === 'TimeoutError' || error instanceof TypeError ? translations[lang].timeout : error.message;
  } finally {
    busy = false; button.disabled = false; button.querySelector('[data-i18n]').textContent = translations[lang].submit; form.removeAttribute('aria-busy'); status.focus();
  }
});
