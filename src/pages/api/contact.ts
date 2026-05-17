import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get('name');
  const email = data.get('email');
  const subject = data.get('subject');
  const message = data.get('message');

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Champs obligatoires manquants' }), { status: 400 });
  }

  const res = await fetch('https://api.resend.com/emails', {
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
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `
    })
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Erreur envoi email' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};