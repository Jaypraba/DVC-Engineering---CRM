import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { getCalendarEvents } from '../../../lib/graph';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { userEmail, days = '14' } = req.query;
  if (!userEmail) return res.status(400).json({ error: 'userEmail is required' });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days, 10));

  try {
    const events = await getCalendarEvents(userEmail, startDate, endDate);

    // Also fetch upcoming project phases for this user from DB
    const db = adminClient();
    const { data: engineerUser } = await db.from('users').select('id').eq('email', userEmail).single();

    let phases = [];
    if (engineerUser) {
      const { data } = await db
        .from('project_phases')
        .select('*, project:projects(id, name, site_address, project_type, client_name)')
        .eq('assigned_to', engineerUser.id)
        .not('due_date', 'is', null)
        .gte('due_date', startDate.toISOString().split('T')[0])
        .lte('due_date', endDate.toISOString().split('T')[0])
        .not('status', 'eq', 'Complete')
        .order('due_date');
      phases = data || [];
    }

    return res.status(200).json({ events, phases });
  } catch (err) {
    console.error('Calendar sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}

export default requireAuth(handler);
