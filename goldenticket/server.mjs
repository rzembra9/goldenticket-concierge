import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const assets = new Map([['/', ['index.html', 'text/html']], ['/styles.css', ['styles.css', 'text/css']], ['/app.js', ['app.js', 'text/javascript']], ['/favicon.svg', ['favicon.svg', 'image/svg+xml']]]);
const labels = { name: 'Nom / prénom', contact: 'Moyen de contact', event: 'Événement', city: 'Ville', date: 'Date souhaitée', quantity: 'Nombre de places', category: 'Catégorie / type', budget: 'Budget maximum par place (€)', comment: 'Commentaire' };
const limits = { name: 100, contact: 160, event: 200, city: 100, date: 10, category: 100, comment: 1000 };
const headers = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'Cache-Control': 'no-store'
};

export function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Formulaire invalide.');
  const data = {};
  for (const [key, limit] of Object.entries(limits)) {
    if (key === 'comment' && input[key] === undefined) input[key] = '';
    if (typeof input[key] !== 'string') throw new Error(`Vérifiez le champ « ${labels[key]} ».`);
    data[key] = input[key].trim();
    if ((key !== 'comment' && !data[key]) || data[key].length > limit || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(data[key])) throw new Error(`Vérifiez le champ « ${labels[key]} ».`);
  }
  const date = new Date(`${data.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(+date) || date.toISOString().slice(0, 10) !== data.date) throw new Error('La date est invalide.');
  if (data.date < new Date().toISOString().slice(0, 10)) throw new Error('Choisissez une date à venir.');
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 20) throw new Error('Choisissez entre 1 et 20 places.');
  if (typeof input.budget !== 'number' || !Number.isFinite(input.budget) || input.budget < 1 || input.budget > 100000 || Math.abs(input.budget * 100 - Math.round(input.budget * 100)) > 0.00001) throw new Error('Indiquez un budget entre 1 et 100 000 €, avec deux décimales maximum.');
  if (input.consent !== true) throw new Error('Veuillez accepter la transmission de votre demande.');
  return { ...data, quantity: input.quantity, budget: input.budget };
}

function webhookURL(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'discord.com' || url.port || url.username || url.password || !/^\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) return null;
    url.search = '?wait=true'; url.hash = ''; return url;
  } catch { return null; }
}

export function createApp({ env = process.env, fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  // One small single-instance service: bounded, in-memory abuse protection.
  const buckets = new Map();
  let globalWindow = { since: Date.now(), count: 0 };
  const delivered = new Map();
  const pending = new Set();
  return http.createServer(async (req, res) => {
    const send = (status, body, extra = {}) => { res.writeHead(status, { ...headers, 'Content-Type': 'application/json; charset=utf-8', ...extra }); res.end(JSON.stringify(body)); };
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (path === '/health' && req.method === 'GET') return send(200, { ok: true });
      if (path !== '/api/request') {
        const asset = assets.get(path);
        if (!asset || !['GET', 'HEAD'].includes(req.method)) return send(404, { error: 'Page introuvable.' });
        const body = await readFile(new URL(`./public/${asset[0]}`, import.meta.url));
        res.writeHead(200, { ...headers, 'Content-Type': `${asset[1]}; charset=utf-8` });
        return res.end(req.method === 'HEAD' ? undefined : body);
      }
      if (req.method !== 'POST') return send(405, { error: 'Méthode non autorisée.' }, { Allow: 'POST' });
      const origin = env.PUBLIC_ORIGIN || (env.NODE_ENV === 'production' ? '' : `http://localhost:${env.PORT || 3000}`);
      if (!origin) return send(503, { error: 'Le formulaire est temporairement indisponible.' });
      if (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site') return send(403, { error: 'Origine non autorisée.' });
      if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') return send(415, { error: 'Format non autorisé.' });
      const now = Date.now();
      for (const [key, value] of buckets) if (now - value.since > 600000) buckets.delete(key);
      for (const [key, value] of delivered) if (now - value.time > 3600000) delivered.delete(key);
      // Never trust a client-provided X-Forwarded-For. Behind a proxy this limit is shared.
      const ip = req.socket.remoteAddress;
      const bucket = buckets.get(ip) || { since: now, count: 0 };
      if (now - globalWindow.since > 600000) globalWindow = { since: now, count: 0 };
      if (buckets.size >= 10000 || ++bucket.count > 30 || ++globalWindow.count > 100) return send(429, { error: 'Trop de tentatives. Réessayez dans 10 minutes.' }, { 'Retry-After': '600' });
      buckets.set(ip, bucket);
      const chunks = []; let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 16384) { send(413, { error: 'Demande trop volumineuse.' }); return; }
        chunks.push(chunk);
      }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(400, { error: 'Formulaire invalide.' }); }
      if (input?.website) return send(400, { error: 'Demande refusée.' });
      let data;
      try { data = validate(input); } catch (error) { return send(400, { error: error.message }); }
      const id = req.headers['idempotency-key'];
      if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(id)) return send(400, { error: 'Rechargez la page puis réessayez.' });
      const fingerprint = JSON.stringify(data);
      const previous = delivered.get(id);
      if (previous) return previous.fingerprint === fingerprint ? send(200, { ok: true, reference: previous.reference }) : send(409, { error: 'Rechargez la page pour envoyer une nouvelle demande.' });
      if (pending.has(id)) return send(409, { error: 'Votre demande est déjà en cours d’envoi.' });
      const url = webhookURL(env.DISCORD_WEBHOOK_URL);
      if (!url) return send(503, { error: 'Le formulaire est temporairement indisponible. Réessayez plus tard.' });
      pending.add(id);
      const reference = `GT-${randomUUID().slice(0, 8).toUpperCase()}`;
      try {
        const response = await fetchImpl(url, {
          method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(timeoutMs),
          body: JSON.stringify({ username: 'GoldenTicket Concierge', allowed_mentions: { parse: [] }, embeds: [{ title: 'Nouvelle demande de billets', color: 14065240, footer: { text: reference }, timestamp: new Date().toISOString(), fields: Object.entries(labels).map(([key, name]) => ({ name, value: String(data[key] || '—'), inline: !['event', 'comment'].includes(key) })) }] })
        });
        if (!response.ok) return send(502, { error: 'L’envoi n’a pas pu être confirmé. Patientez avant de réessayer.' });
        let message;
        try { message = await response.json(); } catch {}
        if (!message?.id) return send(502, { error: 'La réception n’a pas pu être confirmée. Patientez avant de réessayer.' });
        delivered.set(id, { time: now, fingerprint, reference });
        return send(200, { ok: true, reference });
      } catch { return send(504, { error: 'La confirmation tarde à arriver. Votre demande a peut-être été reçue ; patientez avant de réessayer.' }); }
      finally { pending.delete(id); }
    } catch { if (!res.headersSent) send(500, { error: 'Un problème est survenu. Réessayez plus tard.' }); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApp();
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('GoldenTicket prêt.'));
}
