import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { createEvent, buildCalendarEvent } from '../../../lib/graph';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildBriefingHtml(lead, engineer, eventData, notes) {
  const rows = [
    ['Site Address', lead.site_address],
    ['Planning Ref', lead.lpa_app_no],
    ['Authority', lead.lpa_name],
    ['Region', lead.region],
    ['Project Type', lead.project_type],
    ['Application Type', lead.application_type],
    ['Decision Date', lead.decision_date],
    ['Readiness Score', `${lead.readiness_score}/100`],
    ['Estimated Fee', `£${(lead.estimated_fee || 0).toLocaleString()}`],
    ['Status', lead.status],
    ['Contact', lead.contact_name || 'Unknown'],
    ['Email', lead.email || '—'],
    ['Phone', lead.phone || '—'],
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #F8F7F5; }
  .wrapper { max-width: 640px; margin: 40px auto; background: #fff; border: 1px solid #E4E0D8; border-radius: 10px; overflow: hidden; }
  .header { background: #0A1628; padding: 28px 32px; }
  .header-logo { font-size: 22px; font-weight: 800; color: #fff; }
  .header-logo span { color: #F4822A; }
  .header h2 { color: #fff; margin: 12px 0 0; font-size: 16px; font-weight: 400; }
  .body { padding: 28px 32px; }
  .event-badge { background: #FEF0E6; border: 1px solid #F4822A; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
  .event-badge h3 { color: #F4822A; margin: 0 0 6px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
  .event-badge p { color: #0A1628; margin: 0; font-size: 15px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 9px 12px; font-size: 14px; border-bottom: 1px solid #F0EDE8; }
  td:first-child { color: #8a96a8; width: 38%; font-weight: 500; }
  td:last-child { color: #0A1628; font-weight: 500; }
  .notes-box { background: #F8F7F5; border-radius: 8px; padding: 16px; margin-top: 20px; }
  .notes-box h4 { margin: 0 0 8px; font-size: 13px; color: #8a96a8; text-transform: uppercase; letter-spacing: 0.05em; }
  .notes-box p { margin: 0; font-size: 14px; color: #0A1628; line-height: 1.6; }
  .footer { background: #F8F7F5; padding: 18px 32px; border-top: 1px solid #E4E0D8; }
  .footer p { color: #8a96a8; font-size: 12px; margin: 0; }
</style></head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">DVC <span>ENGINEERING</span></div>
      <h2>Project Assignment Briefing — ${engineer.name}</h2>
    </div>
    <div class="body">
      <div class="event-badge">
        <h3>Calendar Event Created</h3>
        <p>${eventData.type} on ${new Date(eventData.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date(eventData.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <table>
        ${rows.map(([label, value]) => `<tr><td>${label}</td><td>${value || '—'}</td></tr>`).join('')}
      </table>
      ${notes ? `<div class="notes-box"><h4>Assignment Notes</h4><p>${notes}</p></div>` : ''}
    </div>
    <div class="footer">
      <p>DVC Engineering CRM | crm@dvceng.com | dvceng.com</p>
    </div>
  </div>
</body>
</html>`;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId, engineerEmail, eventType, eventDate, durationMins = 60, notes, notifyDirector = true } = req.body || {};
  if (!leadId || !engineerEmail || !eventDate) {
    return res.status(400).json({ error: 'leadId, engineerEmail, and eventDate are required' });
  }

  const db = adminClient();
  const errors = [];
  let calendarEvent = null;
  let briefingEmail = null;

  try {
    const { data: lead, error: leadErr } = await db.from('leads').select('*').eq('id', leadId).single();
    if (leadErr || !lead) return res.status(404).json({ error: 'Lead not found' });

    const { data: engineers } = await db.from('users').select('id, name, email, role').eq('email', engineerEmail).limit(1);
    const engineer = engineers?.[0] || { name: engineerEmail, email: engineerEmail };

    const startDt = new Date(eventDate);
    const endDt = new Date(startDt.getTime() + durationMins * 60 * 1000);

    const eventTitle = `${eventType || 'Site Survey'}: ${lead.site_address || lead.lpa_app_no}`;
    const eventDescription = `<p><strong>DVC Engineering — Project Briefing</strong></p>
<p>Lead: ${lead.site_address}<br>Ref: ${lead.lpa_app_no}<br>Type: ${lead.project_type}<br>Estimated fee: £${(lead.estimated_fee || 0).toLocaleString()}</p>
${notes ? `<p>Notes: ${notes}</p>` : ''}
<p>Assigned by DVC CRM</p>`;

    const calEvent = buildCalendarEvent({
      title: eventTitle,
      description: eventDescription,
      startDateTime: startDt.toISOString(),
      endDateTime: endDt.toISOString(),
      location: lead.site_address,
      attendees: [engineerEmail],
      directorEmail: notifyDirector ? process.env.DIRECTOR_EMAIL : null,
    });

    try {
      calendarEvent = await createEvent(engineerEmail, calEvent);
    } catch (calErr) {
      errors.push({ task: 'calendar', error: calErr.message });
    }

    const briefingHtml = buildBriefingHtml(lead, engineer, { type: eventType, date: eventDate }, notes);
    const briefingRecipients = [engineerEmail];
    if (notifyDirector && process.env.DIRECTOR_EMAIL && process.env.DIRECTOR_EMAIL !== engineerEmail) {
      briefingRecipients.push(process.env.DIRECTOR_EMAIL);
    }

    try {
      const { data: emailData, error: emailErr } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'crm@dvceng.com',
        to: briefingRecipients,
        subject: `[DVC CRM] ${eventType || 'Assignment'}: ${lead.site_address}`,
        html: briefingHtml,
      });
      if (emailErr) throw new Error(emailErr.message);
      briefingEmail = { id: emailData?.id, recipients: briefingRecipients };

      await db.from('email_logs').insert({
        lead_id: leadId,
        sent_by: req.user?.id || null,
        to_email: briefingRecipients.join(', '),
        from_email: process.env.EMAIL_FROM || 'crm@dvceng.com',
        subject: `[DVC CRM] ${eventType || 'Assignment'}: ${lead.site_address}`,
        body: `Assignment briefing for ${engineer.name}`,
        message_id: emailData?.id,
        type: 'briefing',
        status: 'sent',
      });
    } catch (emailErr) {
      errors.push({ task: 'briefing_email', error: emailErr.message });
    }

    const engineerUser = engineers?.[0];
    await db.from('leads').update({
      assigned_to: engineerUser?.id || null,
      calendar_event_id: calendarEvent?.id || null,
      calendar_engineer: engineerEmail,
      next_event_date: eventDate,
      next_event_type: eventType,
      last_contact: new Date().toISOString(),
    }).eq('id', leadId);

    return res.status(200).json({ success: true, calendarEvent, briefingEmail, errors });
  } catch (err) {
    console.error('Assign error:', err);
    return res.status(500).json({ error: err.message || 'Assignment failed', errors });
  }
}

export default requireAuth(handler);
