const form = document.querySelector('#request-form');
const status = document.querySelector('#form-status');
const button = form.querySelector('button');
const originalLabel = button.innerHTML;
const date = form.elements.date;
date.min = new Date().toISOString().slice(0, 10);
let key = crypto.randomUUID();
let previousPayload = '';
let busy = false;
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  data.quantity = Number(data.quantity);
  data.budget = Number(data.budget);
  data.consent = form.elements.consent.checked;
  const payload = JSON.stringify(data);
  if (previousPayload && previousPayload !== payload) key = crypto.randomUUID();
  previousPayload = payload;
  busy = true; button.disabled = true; form.setAttribute('aria-busy', 'true');
  button.textContent = 'Envoi en cours…';
  status.textContent = 'Transmission de votre demande…'; status.dataset.state = 'loading';
  try {
    const response = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: payload, signal: AbortSignal.timeout(20000) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'L’envoi a échoué. Veuillez réessayer.');
    status.textContent = `Votre demande a bien été reçue. Référence : ${result.reference}. Nous vous recontacterons via le moyen indiqué.`;
    status.dataset.state = 'success'; form.reset(); key = crypto.randomUUID(); previousPayload = '';
  } catch (error) {
    status.dataset.state = 'error';
    status.textContent = error.name === 'TimeoutError' || error instanceof TypeError ? 'La confirmation n’a pas pu être reçue. Vos informations sont conservées dans le formulaire. Patientez avant de réessayer.' : error.message;
  } finally {
    busy = false; button.disabled = false; button.innerHTML = originalLabel; form.removeAttribute('aria-busy'); status.focus();
  }
});
