import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';

const DEFAULT_PHASES = [
  { phase_name: 'Site Inspection', phase_order: 1 },
  { phase_name: 'Preliminary Design', phase_order: 2 },
  { phase_name: 'Preliminary Delivery', phase_order: 3 },
  { phase_name: 'Design Review', phase_order: 4 },
  { phase_name: 'Final Design', phase_order: 5 },
  { phase_name: 'Final Delivery', phase_order: 6 },
  { phase_name: 'Construction Support', phase_order: 7 },
  { phase_name: 'Project Complete', phase_order: 8 },
];

async function handler(req, res) {
  const db = adminClient();

  if (req.method === 'GET') {
    try {
      const { status, assigned_director } = req.query;
      let query = db
        .from('projects')
        .select(`
          *,
          project_phases ( * ),
          assigned_director_user:users!projects_assigned_director_fkey ( id, name, email, role )
        `)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (assigned_director) query = query.eq('assigned_director', assigned_director);

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('GET projects error:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        lead_id, name, description, client_name, client_email, client_phone,
        site_address, project_type, contract_value, assigned_director,
        start_date, target_end_date, notes,
      } = req.body || {};

      if (!name) return res.status(400).json({ error: 'Project name is required' });

      const { data: project, error: projErr } = await db
        .from('projects')
        .insert({
          lead_id, name, description, client_name, client_email, client_phone,
          site_address, project_type, contract_value: contract_value || 0,
          assigned_director, start_date, target_end_date, notes,
        })
        .select()
        .single();

      if (projErr) throw projErr;

      // Auto-create default phases
      const phases = DEFAULT_PHASES.map(p => ({
        ...p,
        project_id: project.id,
        assigned_to: assigned_director || null,
      }));

      const { error: phaseErr } = await db.from('project_phases').insert(phases);
      if (phaseErr) console.error('Phase creation error:', phaseErr);

      // Update linked lead stage to 'In Progress'
      if (lead_id) {
        await db.from('leads').update({ stage: 'In Progress' }).eq('id', lead_id);
      }

      const { data: full } = await db
        .from('projects')
        .select('*, project_phases(*)')
        .eq('id', project.id)
        .single();

      return res.status(201).json(full);
    } catch (err) {
      console.error('POST project error:', err);
      return res.status(500).json({ error: 'Failed to create project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
