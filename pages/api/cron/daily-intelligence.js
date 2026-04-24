import { adminClient } from '../../../lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function buildDigestHtml(stagnantLeads) {
  const rows = stagnantLeads.map((l) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #F0EDE8;">${l.site_address || l.lpa_app_no}</td>
      <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #F0EDE8;">${l.lpa_name}</td>
      <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #F0EDE8;">${l.stage}</td>
      <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #F0EDE8;">${daysSince(l.last_contact)}d</td>
      <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #F0EDE8;">£${(l.estimated_fee || 0).toLocaleString()}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#F8F7F5;margin:0;padding:0;">
<div style="max-width:680px;margin:32px auto;background:#fff;border:1px solid #E4E0D8;border-radius:10px;overflow:hidden;">
<div style="background:#0A1628;padding:24px 28px;">
  <div style="font-size:20px;font-weight:800;color:#fff;">DVC <span style="color:#F4822A;">ENGINEERING</span></div>
  <h2 style="color:#fff;margin:10px 0 0;font-size:15px;font-weight:400;">Daily Stagnancy Digest — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
</div>
<div style="padding:24px 28px;">
  <p style="color:#0A1628;font-size:14px;margin:0 0 18px;">${stagnantLeads.length} lead${stagnantLeads.length !== 1 ? 's' : ''} without contact in 7+ days:</p>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Address</th>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Authority</th>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Stage</th>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Idle</th>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Est. Fee</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<div style="background:#F8F7F5;padding:16px 28px;border-top:1px solid #E4E0D8;">
  <p style="color:#8a96a8;font-size:12px;margin:0;">DVC Engineering CRM | Automated Daily Report</p>
</div>
</div>
</body></html>`;
}

function buildReminderHtml(lead) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#F8F7F5;margin:0;padding:0;">
<div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #E4E0D8;border-radius:10px;overflow:hidden;">
<div style="background:#0A1628;padding:22px 26px;">
  <div style="font-size:18px;font-weight:800;color:#fff;">DVC <span style="color:#F4822A;">ENGINEERING</span></div>
</div>
<div style="padding:24px 26px;">
  <p style="color:#0A1628;font-size:15px;font-weight:600;margin:0 0 12px;">48-Hour Event Reminder</p>
  <p style="color:#0A1628;font-size:14px;margin:0 0 8px;"><strong>${lead.next_event_type || 'Event'}</strong> scheduled for ${new Date(lead.next_event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at ${new Date(lead.next_event_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
  <p style="color:#3d4f6b;font-size:14px;margin:0 0 8px;">Site: ${lead.site_address || lead.lpa_app_no}</p>
  <p style="color:#3d4f6b;font-size:14px;margin:0 0 8px;">Authority: ${lead.lpa_name}</p>
  <p style="color:#3d4f6b;font-size:14px;margin:0;">Project: ${lead.project_type}</p>
</div>
</div>
</body></html>`;
}

function buildReengageHtml(lead) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#F8F7F5;margin:0;padding:0;">
<div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #E4E0D8;border-radius:10px;overflow:hidden;">
<div style="background:#0A1628;padding:22px 26px;">
  <div style="font-size:18px;font-weight:800;color:#fff;">DVC <span style="color:#F4822A;">ENGINEERING</span></div>
</div>
<div style="padding:24px 26px;">
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0 0 14px;">Dear ${lead.contact_name || 'property owner'},</p>
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0 0 14px;">We noticed we haven't been in touch recently regarding your ${lead.project_type || 'planning permission'} at ${lead.site_address}. We wanted to check whether you'd like to discuss how DVC Engineering can support your project with structural engineering services.</p>
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0 0 14px;">Please don't hesitate to reach out — we'd be happy to arrange a consultation at your convenience.</p>
  <p style="color:#0A1628;font-size:14px;line-height:1.65;margin:0;">The DVC Engineering Team | dvceng.com | 020 3900 0000</p>
</div>
</div>
</body></html>`;
}

function buildLapseWarningHtml(lapseLeads) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#F8F7F5;margin:0;padding:0;">
<div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #E4E0D8;border-radius:10px;overflow:hidden;">
<div style="background:#c0392b;padding:22px 26px;">
  <div style="font-size:18px;font-weight:800;color:#fff;">DVC <span style="color:#F4822A;">ENGINEERING</span></div>
  <h2 style="color:#fff;margin:8px 0 0;font-size:15px;font-weight:400;">Planning Permission Lapse Warning</h2>
</div>
<div style="padding:24px 26px;">
  <p style="color:#0A1628;font-size:14px;margin:0 0 16px;">${lapseLeads.length} lead${lapseLeads.length !== 1 ? 's' : ''} approaching or past 30-month planning permission validity:</p>
  ${lapseLeads.map((l) => `<div style="background:#fdf1f0;border:1px solid #f5c6c6;border-radius:8px;padding:12px 16px;margin-bottom:10px;">
    <strong style="font-size:14px;color:#0A1628;">${l.site_address || l.lpa_app_no}</strong><br>
    <span style="font-size:13px;color:#3d4f6b;">${l.lpa_name} | Granted: ${l.decision_date} | Stage: ${l.stage}</span>
  </div>`).join('')}
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
  const log = { tasks: [], errors: [] };
  const now = new Date();

  // Task 1: Director stagnancy digest
  try {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const { data: stagnant } = await db
      .from('leads')
      .select('*')
      .lt('last_contact', sevenDaysAgo)
      .not('stage', 'in', '("Won","Lost")')
      .order('last_contact', { ascending: true })
      .limit(100);

    if (stagnant?.length > 0) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'crm@dvceng.com',
        to: process.env.DIRECTOR_EMAIL,
        subject: `[DVC CRM] ${stagnant.length} Stagnant Leads — ${new Date().toLocaleDateString('en-GB')}`,
        html: buildDigestHtml(stagnant),
      });
      log.tasks.push({ task: 'stagnancy_digest', count: stagnant.length });
    } else {
      log.tasks.push({ task: 'stagnancy_digest', count: 0, note: 'No stagnant leads' });
    }
  } catch (err) {
    log.errors.push({ task: 'stagnancy_digest', error: err.message });
  }

  // Task 2: 48-hour engineer reminders
  try {
    const in24h = new Date(now.getTime() + 24 * 3600000).toISOString();
    const in48h = new Date(now.getTime() + 48 * 3600000).toISOString();
    const { data: upcoming } = await db
      .from('leads')
      .select('*')
      .gte('next_event_date', in24h)
      .lte('next_event_date', in48h)
      .not('calendar_engineer', 'is', null);

    let reminded = 0;
    for (const lead of upcoming || []) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'crm@dvceng.com',
          to: lead.calendar_engineer,
          subject: `[DVC CRM] Reminder: ${lead.next_event_type || 'Event'} tomorrow — ${lead.site_address}`,
          html: buildReminderHtml(lead),
        });
        reminded++;
      } catch (e) {
        log.errors.push({ task: 'reminder', lead: lead.id, error: e.message });
      }
    }
    log.tasks.push({ task: '48h_reminders', count: reminded });
  } catch (err) {
    log.errors.push({ task: '48h_reminders', error: err.message });
  }

  // Task 3: Client re-engagement
  try {
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();
    const { data: reengageLeads } = await db
      .from('leads')
      .select('*')
      .eq('auto_reengage', true)
      .not('email', 'is', null)
      .lt('last_contact', fourteenDaysAgo)
      .not('stage', 'in', '("Won","Lost")')
      .limit(50);

    let reengaged = 0;
    for (const lead of reengageLeads || []) {
      try {
        const { data: emailData } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'crm@dvceng.com',
          to: lead.email,
          subject: `Following up on your ${lead.project_type || 'project'} — DVC Engineering`,
          html: buildReengageHtml(lead),
        });
        await db.from('leads').update({ last_contact: now.toISOString() }).eq('id', lead.id);
        await db.from('email_logs').insert({
          lead_id: lead.id,
          to_email: lead.email,
          from_email: process.env.EMAIL_FROM || 'crm@dvceng.com',
          subject: `Following up on your ${lead.project_type || 'project'}`,
          type: 'reengage',
          message_id: emailData?.id,
          status: 'sent',
        });
        reengaged++;
      } catch (e) {
        log.errors.push({ task: 'reengage', lead: lead.id, error: e.message });
      }
    }
    log.tasks.push({ task: 'client_reengage', count: reengaged });
  } catch (err) {
    log.errors.push({ task: 'client_reengage', error: err.message });
  }

  // Task 4: Planning lapse warnings (30 months = ~913 days)
  try {
    const thirtyMonthsAgo = new Date();
    thirtyMonthsAgo.setMonth(thirtyMonthsAgo.getMonth() - 30);
    const { data: lapseLeads } = await db
      .from('leads')
      .select('*')
      .lt('decision_date', thirtyMonthsAgo.toISOString().split('T')[0])
      .not('stage', 'in', '("Won","Lost")')
      .limit(100);

    if (lapseLeads?.length > 0) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'crm@dvceng.com',
        to: process.env.DIRECTOR_EMAIL,
        subject: `[DVC CRM] Planning Lapse Warning — ${lapseLeads.length} leads`,
        html: buildLapseWarningHtml(lapseLeads),
      });
      log.tasks.push({ task: 'lapse_warnings', count: lapseLeads.length });
    } else {
      log.tasks.push({ task: 'lapse_warnings', count: 0, note: 'No lapse risk leads' });
    }
  } catch (err) {
    log.errors.push({ task: 'lapse_warnings', error: err.message });
  }

  return res.status(200).json({ success: true, timestamp: now.toISOString(), log });
}
