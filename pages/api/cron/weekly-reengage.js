import { adminClient } from '../../../lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildWeeklyReengageHtml(lead) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#F8F7F5;margin:0;padding:0;">
<div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #E4E0D8;border-radius:10px;overflow:hidden;">
<div style="background:#0A1628;padding:22px 26px;">
  <div style="font-size:18px;font-weight:800;color:#fff;">DVC <span style="color:#F4822A;">ENGINEERING</span></div>
</div>
<div style="padding:24px 26px;">
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0 0 14px;">Dear ${lead.contact_name || 'property owner'},</p>
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0 0 14px;">We hope your ${lead.project_type || 'project'} at ${lead.site_address} is progressing well. As structural engineers, we're here to ensure your project is delivered safely and efficiently.</p>
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0 0 14px;">If you'd like to discuss your structural requirements, please get in touch — we'd welcome the opportunity to assist.</p>
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0;">The DVC Engineering Team | dvceng.com | 020 3900 0000</p>
</div>
</div>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const db = adminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: leads, error } = await db
    .from('leads')
    .select('*')
    .not('email', 'is', null)
    .lt('last_contact', sevenDaysAgo)
    .not('stage', 'in', '("Initial Contact","Won","Lost")')
    .limit(100);

  if (error) {
    return res.status(500).json({ error: 'Failed to query leads', details: error.message });
  }

  let sent = 0;
  const errors = [];

  for (const lead of leads || []) {
    try {
      const { data: emailData } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'crm@dvceng.com',
        to: lead.email,
        subject: `Checking in on your ${lead.project_type || 'project'} — DVC Engineering`,
        html: buildWeeklyReengageHtml(lead),
      });

      await db.from('leads').update({ last_contact: new Date().toISOString() }).eq('id', lead.id);
      await db.from('email_logs').insert({
        lead_id: lead.id,
        to_email: lead.email,
        from_email: process.env.EMAIL_FROM || 'crm@dvceng.com',
        subject: `Checking in on your ${lead.project_type || 'project'}`,
        message_id: emailData?.id,
        type: 'reengage',
        status: 'sent',
      });
      sent++;
    } catch (err) {
      errors.push({ lead: lead.id, error: err.message });
    }
  }

  return res.status(200).json({ sent, total: leads?.length || 0, errors });
}
