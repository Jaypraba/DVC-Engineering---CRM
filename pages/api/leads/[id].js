import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

const ALLOWED_PATCH_FIELDS = [
  'contact_name', 'email', 'phone', 'stage', 'notes', 'last_contact',
  'status', 'assigned_to', 'auto_reengage', 'next_event_date', 'next_event_type',
];

async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Lead ID required' });

  const db = adminClient();

  if (req.method === 'PATCH') {
    try {
      const body = req.body || {};
      const updates = {};
      for (const field of ALLOWED_PATCH_FIELDS) {
        if (field in body) updates[field] = body[field];
      }
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const { data, error } = await db
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('PATCH lead error:', err);
      return res.status(500).json({ error: 'Failed to update lead' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await db.from('leads').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE lead error:', err);
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
