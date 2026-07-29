import { adminClient } from '../../../lib/supabase';
import { Resend } from 'resend';
import { searchFlightOffers, searchFlightInspiration, getPriceMetrics, isAmadeusConfigured } from '../../../lib/travel/amadeus';
import { scoreDeal, writeAlertIntro } from '../../../lib/travel/ai';
import { fetchClearanceDeals } from '../../../lib/travel/clearance';

const resend = new Resend(process.env.RESEND_API_KEY);

const fmtPrice = (n, ccy = 'GBP') =>
  (ccy === 'GBP' ? '£' : ccy === 'EUR' ? '€' : '$') + Number(n || 0).toLocaleString('en-GB');

function dealRow(d) {
  const badge = d.tier === 'clearance'
    ? '<span style="background:#c0392b;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;">CLEARANCE</span>'
    : d.discount_pct >= 25
      ? `<span style="background:#FEF0E6;color:#F4822A;font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;">${d.discount_pct}% OFF</span>`
      : '';
  return `<tr>
    <td style="padding:10px 12px;font-size:13px;border-bottom:1px solid #F0EDE8;"><strong>${d.origin} → ${d.destination}</strong><br><span style="color:#8a96a8;font-size:12px;">${d.departure_date || ''}${d.return_date ? ' – ' + d.return_date : ''}${d.carrier ? ' · ' + d.carrier : ''}</span></td>
    <td style="padding:10px 12px;font-size:15px;font-weight:700;color:#0A1628;border-bottom:1px solid #F0EDE8;">${fmtPrice(d.price, d.currency)}</td>
    <td style="padding:10px 12px;font-size:12px;color:#8a96a8;border-bottom:1px solid #F0EDE8;">${d.typical_price ? 'typ. ' + fmtPrice(d.typical_price) : ''} ${badge}</td>
  </tr>`;
}

function buildAlertEmail(alert, deals, intro, clearanceItems) {
  const clearanceHtml = clearanceItems.length
    ? `<p style="color:#0A1628;font-size:14px;font-weight:600;margin:24px 0 10px;">Error fares spotted today</p>
       ${clearanceItems.map((c) => `<p style="margin:0 0 8px;font-size:13px;"><a href="${c.link}" style="color:#F4822A;text-decoration:none;">${c.title}</a> <span style="color:#8a96a8;font-size:11px;">(${c.source})</span></p>`).join('')}`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#F8F7F5;margin:0;padding:0;">
<div style="max-width:680px;margin:32px auto;background:#fff;border:1px solid #E4E0D8;border-radius:10px;overflow:hidden;">
<div style="background:#0A1628;padding:24px 28px;">
  <div style="font-size:20px;font-weight:800;color:#fff;">DVC <span style="color:#F4822A;">TRAVEL</span></div>
  <h2 style="color:#fff;margin:10px 0 0;font-size:15px;font-weight:400;">Deal Alert: ${alert.label}</h2>
</div>
<div style="padding:24px 28px;">
  <p style="color:#0A1628;font-size:14px;margin:0 0 18px;">${intro}</p>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Route</th>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Price</th>
      <th style="text-align:left;padding:8px 12px;font-size:12px;color:#8a96a8;text-transform:uppercase;border-bottom:2px solid #E4E0D8;">Context</th>
    </tr></thead>
    <tbody>${deals.map(dealRow).join('')}</tbody>
  </table>
  ${clearanceHtml}
</div>
<div style="background:#F8F7F5;padding:16px 28px;border-top:1px solid #E4E0D8;">
  <p style="color:#8a96a8;font-size:12px;margin:0;">DVC Travel Deals | Automated Alert — prices change fast, verify before booking</p>
</div>
</div>
</body></html>`;
}

async function scanAlert(db, alert, clearanceItems) {
  const departureDate = alert.earliest_departure && new Date(alert.earliest_departure) > new Date()
    ? alert.earliest_departure
    : new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10);

  let candidates = [];
  if (alert.destination) {
    const offers = await searchFlightOffers({
      origin: alert.origin,
      destination: alert.destination,
      departureDate,
      returnDate: alert.trip_length_days
        ? new Date(new Date(departureDate).getTime() + alert.trip_length_days * 86400000).toISOString().slice(0, 10)
        : undefined,
      adults: alert.adults || 1,
      cabin: alert.cabin,
      maxPrice: alert.max_price || undefined,
      max: 10,
    });
    const metrics = await getPriceMetrics({ origin: alert.origin, destination: alert.destination, departureDate });
    candidates = offers.map((f) => {
      const s = scoreDeal(f.price, metrics);
      return { ...f, ...s, typicalPrice: metrics?.median || null };
    });
  } else {
    const inspiration = await searchFlightInspiration({
      origin: alert.origin,
      maxPrice: alert.max_price || undefined,
      duration: alert.trip_length_days || undefined,
    });
    candidates = inspiration.map((f) => ({ ...f, carrier: null, discountPct: null, tier: 'unknown', typicalPrice: null }));
  }

  // A deal qualifies if it beats the price cap or the discount threshold.
  const qualifying = candidates.filter((f) => {
    const underCap = alert.max_price ? f.price <= alert.max_price : false;
    const bigDiscount = f.discountPct !== null && f.discountPct >= (alert.min_discount_pct ?? 20);
    return underCap || bigDiscount || f.tier === 'clearance';
  }).slice(0, 8);

  if (!qualifying.length) return { alert, newDeals: [] };

  // Dedupe against previously-notified deals (same route/date/similar price).
  const rows = qualifying.map((f) => ({
    alert_id: alert.id,
    dedupe_key: `${f.origin}-${f.destination}-${f.departureDate}-${Math.round(f.price / 10) * 10}`,
    deal_type: 'flight',
    origin: f.origin,
    destination: f.destination,
    departure_date: f.departureDate || null,
    return_date: f.returnDate || null,
    price: f.price,
    currency: f.currency || 'GBP',
    typical_price: f.typicalPrice,
    discount_pct: f.discountPct,
    carrier: f.carrier,
    tier: f.tier || null,
    details: { stops: f.stops ?? null, kind: alert.destination ? 'offer' : 'inspiration' },
  }));

  const { data: inserted, error } = await db
    .from('travel_deal_log')
    .upsert(rows, { onConflict: 'alert_id,dedupe_key', ignoreDuplicates: true })
    .select();
  if (error) throw error;

  const newDeals = inserted || [];
  if (newDeals.length && alert.notify_email && process.env.RESEND_API_KEY) {
    const best = newDeals.reduce((a, b) => (a.price < b.price ? a : b));
    const intro = await writeAlertIntro({
      label: alert.label,
      dealCount: newDeals.length,
      bestDeal: `${best.origin} to ${best.destination} at ${fmtPrice(best.price, best.currency)}`,
    });
    const relevantClearance = clearanceItems.filter((c) => c.isErrorFare).slice(0, 5);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'crm@dvceng.com',
      to: alert.notify_email,
      subject: `✈ ${newDeals.length} deal${newDeals.length > 1 ? 's' : ''}: ${alert.label} from ${fmtPrice(best.price, best.currency)}`,
      html: buildAlertEmail(alert, newDeals, intro, relevantClearance),
    });
  }

  await db.from('travel_alerts').update({ last_run: new Date().toISOString() }).eq('id', alert.id);
  return { alert, newDeals };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!isAmadeusConfigured()) {
    return res.status(200).json({ skipped: true, reason: 'Amadeus not configured' });
  }

  const db = adminClient();
  try {
    const { data: alerts, error } = await db.from('travel_alerts').select('*').eq('active', true);
    if (error) throw error;

    const { items: clearanceItems } = await fetchClearanceDeals().catch(() => ({ items: [] }));

    const summary = [];
    for (const alert of alerts || []) {
      try {
        const result = await scanAlert(db, alert, clearanceItems);
        summary.push({ alert: alert.label, newDeals: result.newDeals.length });
      } catch (err) {
        console.error(`Alert scan failed (${alert.label}):`, err.message);
        summary.push({ alert: alert.label, error: err.message });
      }
    }

    return res.status(200).json({ scanned: (alerts || []).length, summary });
  } catch (err) {
    console.error('Travel deals cron error:', err);
    return res.status(500).json({ error: err.message || 'Cron failed' });
  }
}
