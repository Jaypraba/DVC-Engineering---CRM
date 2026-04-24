import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  const db = adminClient();

  if (req.method === 'GET') {
    try {
      const { status, authority, region, stage, sort = 'readiness_score', order = 'desc', limit = '500' } = req.query;

      let query = db.from('leads').select('*');

      if (status) query = query.eq('status', status);
      if (authority) query = query.eq('lpa_name', authority);
      if (region) query = query.eq('region', region);
      if (stage) query = query.eq('stage', stage);

      const ascending = order === 'asc';
      query = query.order(sort, { ascending });
      query = query.limit(parseInt(limit, 10));

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json(data || []);
    } catch (err) {
      console.error('GET leads error:', err);
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { leads = [], importMeta = {} } = req.body || {};
      if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ error: 'No leads provided' });
      }

      const { data, error } = await db
        .from('leads')
        .upsert(leads, { onConflict: 'id', ignoreDuplicates: true })
        .select('id');

      if (error) throw error;

      await db.from('import_history').insert({
        imported_by: req.user?.id || null,
        source: importMeta.source || 'unknown',
        lpas: importMeta.lpas || [],
        total_fetched: importMeta.totalFetched || leads.length,
        total_imported: data?.length || 0,
        filters: importMeta.filters || {},
      });

      return res.status(200).json({ imported: data?.length || 0 });
    } catch (err) {
      console.error('POST leads error:', err);
      return res.status(500).json({ error: 'Failed to import leads' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
