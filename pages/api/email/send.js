import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function callClaude(systemPrompt, userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

function buildEmailHtml(subject, body, lead) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #F8F7F5; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #E4E0D8; border-radius: 10px; overflow: hidden; }
  .header { background: #0A1628; padding: 28px 32px; }
  .header-logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
  .header-logo span { color: #F4822A; }
  .header-bar { width: 32px; height: 3px; background: #F4822A; border-radius: 2px; margin-top: 8px; }
  .body { padding: 32px; }
  .body p { color: #0A1628; font-size: 15px; line-height: 1.65; margin: 0 0 16px; }
  .footer { background: #F8F7F5; padding: 20px 32px; border-top: 1px solid #E4E0D8; }
  .footer p { color: #8a96a8; font-size: 12px; margin: 0; line-height: 1.5; }
  .footer a { color: #F4822A; text-decoration: none; }
  .ref-badge { display: inline-block; background: #FEF0E6; color: #F4822A; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px; margin-bottom: 20px; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">DVC <span>ENGINEERING</span></div>
      <div class="header-bar"></div>
    </div>
    <div class="body">
      ${lead?.lpa_app_no ? `<span class="ref-badge">Ref: ${lead.lpa_app_no}</span>` : ''}
      ${body.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('')}
    </div>
    <div class="footer">
      <p><strong>DVC Engineering Ltd</strong> | Structural Engineering Consultants<br>
      86–90 Paul Street, London EC2A 4NE | <a href="tel:02039000000">020 3900 0000</a> | <a href="https://dvceng.com">dvceng.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId, toEmail, contactName, tone = 'Professional', previewOnly = false } = req.body || {};
  if (!leadId) return res.status(400).json({ error: 'leadId is required' });

  const db = adminClient();

  try {
    const { data: lead, error: leadErr } = await db
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadErr || !lead) return res.status(404).json({ error: 'Lead not found' });

    const recipientName = contactName || 'the property owner';
    const address = lead.site_address || 'the property';
    const planningRef = lead.lpa_app_no || '';
    const decisionDate = lead.decision_date ? new Date(lead.decision_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const projectType = lead.project_type || 'your project';
    const authority = lead.lpa_name || '';

    const subjectSystem = 'You are a professional email subject line writer for DVC Engineering, a structural engineering consultancy. Write subject lines that are concise, professional, and relevant to structural engineering services.';
    const subjectUser = `Write an email subject line (under 9 words, no punctuation at end) from DVC Engineering for a granted ${projectType} planning permission at ${authority}. Reference the project type and authority. Professional tone.`;

    const bodySystem = `You are a senior engineer at DVC Engineering Ltd, a structural engineering consultancy in London. Write outreach emails in British English. Never use em dashes. Keep under 150 words. Be ${tone.toLowerCase()} in tone. Always sign off with: The DVC Engineering Team | dvceng.com | 020 3900 0000`;
    const bodyUser = `Write a brief outreach email to the property owner at ${address}. Their planning application (ref: ${planningRef}) for a ${projectType} was granted on ${decisionDate} by ${authority}. Explain that DVC Engineering can provide structural engineering services for their project. Include a clear call to action to contact us. Address them as "${recipientName}". Sign off as The DVC Engineering Team.`;

    const [subject, body] = await Promise.all([
      callClaude(subjectSystem, subjectUser),
      callClaude(bodySystem, bodyUser),
    ]);

    if (previewOnly) {
      return res.status(200).json({ subject: subject.trim(), body: body.trim() });
    }

    const emailTo = toEmail || lead.email;
    if (!emailTo) {
      return res.status(400).json({ error: 'No recipient email address. Set lead.email or provide toEmail.' });
    }

    const htmlBody = buildEmailHtml(subject, body, lead);

    const { data: emailData, error: emailErr } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'crm@dvceng.com',
      to: emailTo,
      subject: subject.trim(),
      html: htmlBody,
    });

    if (emailErr) throw new Error(emailErr.message);

    await db.from('email_logs').insert({
      lead_id: leadId,
      sent_by: req.user?.id || null,
      to_email: emailTo,
      from_email: process.env.EMAIL_FROM || 'crm@dvceng.com',
      subject: subject.trim(),
      body: body.trim(),
      message_id: emailData?.id,
      type: 'outreach',
      status: 'sent',
    });

    await db.from('leads').update({ last_contact: new Date().toISOString() }).eq('id', leadId);

    return res.status(200).json({ success: true, messageId: emailData?.id, subject: subject.trim(), body: body.trim() });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
}

export default requireAuth(handler);
