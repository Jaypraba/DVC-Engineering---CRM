import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

// /api/travel/alerts — saved deal alerts, scanned daily by /api/cron/travel-deals.
// GET    → list alerts (with recent hits)
// POST   → create alert
// PATCH  → { id, ...fields } update (e.g. toggle active)
// DELETE → ?id= remove alert
async function handler(req, res) {
  const db = adminClient();

  if (req.method === 'GET') {
    try {
      const { data: alerts, error } = await db
        .from('travel_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const ids = (alerts || []).map((a) => a.id);
      let hits = [];
      if (ids.length) {
        const { data } = await db
          .from('travel_deal_log')
          .select('*')
          .in('alert_id', ids)
          .order('found_at', { ascending: false })
          .limit(60);
        hits = data || [];
      }
      return res.status(200).json({ alerts: alerts || [], hits });
    } catch (err) {
      console.error('GET travel alerts error:', err);
      return res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  if (req.method === 'POST') {
    try {
      const b = req.body || {};
      if (!b.origin) return res.status(400).json({ error: 'origin is required' });
      const { data, error } = await db
        .from('travel_alerts')
        .insert({
          created_by: req.user?.id || null,
          label: b.label || `${b.origin} → ${b.destination || 'Anywhere'}`,
          origin: String(b.origin).toUpperCase().slice(0, 3),
          destination: b.destination ? String(b.destination).toUpperCase().slice(0, 3) : null,
          earliest_departure: b.earliestDeparture || null,
          latest_departure: b.latestDeparture || null,
          trip_length_days: b.tripLengthDays || null,
          max_price: b.maxPrice || null,
          min_discount_pct: b.minDiscountPct ?? 20,
          cabin: b.cabin || 'ECONOMY',
          adults: b.adults || 1,
          notify_email: b.notifyEmail || req.user?.email || process.env.DIRECTOR_EMAIL,
          active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('POST travel alert error:', err);
      return res.status(500).json({ error: 'Failed to create alert' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, ...fields } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const allowed = ['label', 'active', 'max_price', 'min_discount_pct', 'notify_email', 'earliest_departure', 'latest_departure', 'trip_length_days'];
      const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
      const { data, error } = await db.from('travel_alerts').update(update).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('PATCH travel alert error:', err);
      return res.status(500).json({ error: 'Failed to update alert' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await db.from('travel_alerts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ deleted: true });
    } catch (err) {
      console.error('DELETE travel alert error:', err);
      return res.status(500).json({ error: 'Failed to delete alert' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
