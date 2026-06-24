export const prerender = false;

import type { APIRoute } from 'astro';

// DÉSACTIVÉ — domaine Resend non vérifié. Passer RESEND_ENABLED à true
// une fois que paroisse.stlouisfrancais.org est vérifié dans le dashboard Resend.
const RESEND_ENABLED = false;

const escapeHtml = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

export const POST: APIRoute = async ({ request }) => {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Champs obligatoires manquants' }), { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: 'Adresse email invalide' }), { status: 400 });
  }

  if (!RESEND_ENABLED) {
    return new Response(JSON.stringify({ disabled: true }), { status: 503 });
  }

  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'contact@paroisse.stlouisfrancais.org',
        to: 'paroissesaintlouismadrid@gmail.com',
        reply_to: email,
        subject: `Nouveau message de contact — ${subject || 'Sans sujet'}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
          <p><strong>Email :</strong> ${escapeHtml(email)}</p>
          <p><strong>Sujet :</strong> ${subject ? escapeHtml(subject) : '—'}</p>
          <p><strong>Message :</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        `
      })
    });
  } catch (err) {
    console.error('Resend fetch error:', err);
    return new Response(JSON.stringify({ error: 'Erreur envoi email' }), { status: 500 });
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    console.error('Resend error:', res.status, errorBody);
    return new Response(JSON.stringify({ error: 'Erreur envoi email' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};