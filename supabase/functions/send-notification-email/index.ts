import { createClient } from 'npm:@supabase/supabase-js@2';

interface WebhookPayload { type?: string; table?: string; record?: { id?: string } }

Deno.serve(async request => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const webhook_secret = Deno.env.get('NOTIFICATION_WEBHOOK_SECRET');
  if (!webhook_secret || request.headers.get('x-webhook-secret') !== webhook_secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  const supabase_url = Deno.env.get('SUPABASE_URL');
  const service_role_key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resend_key = Deno.env.get('RESEND_API_KEY');
  const email_from = Deno.env.get('EMAIL_FROM');
  if (!supabase_url || !service_role_key || !resend_key || !email_from) {
    return new Response('Missing server configuration', { status: 500 });
  }
  let payload: WebhookPayload;
  try { payload = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }
  if (payload.type !== 'INSERT' || payload.table !== 'notifications' || !payload.record?.id) {
    return new Response('Invalid notification event', { status: 400 });
  }
  const admin = createClient(supabase_url, service_role_key);
  const notice_result = await admin.from('notifications').select('id,user_id,title,message').eq('id', payload.record.id).single();
  if (notice_result.error || !notice_result.data) return new Response('Notification not found', { status: 404 });
  const user_result = await admin.auth.admin.getUserById(notice_result.data.user_id);
  const email = user_result.data.user?.email;
  if (!email) return new Response('Recipient email not found', { status: 404 });
  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resend_key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: email_from, to: [email], subject: notice_result.data.title,
      text: `${notice_result.data.message}\n\nRevisa tu espacio en ManoCerca para más detalles.` }),
  });
  if (!sent.ok) return new Response(`Email provider failed: ${sent.status}`, { status: 502 });
  return Response.json({ sent: true });
});
