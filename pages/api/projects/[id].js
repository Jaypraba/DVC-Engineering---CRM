import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import { createEvent, buildCalendarEvent } from '../../../lib/graph';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_FIELDS = [
  'name', 'description', 'client_name', 'client_email', 'client_phone',
  'site_address', 'project_type', 'contract_value', 'assigned_director',
  'status', 'start_date', 'target_end_date', 'actual_end_date', 'notes',
];

async function syncPhaseCalendar(phase, project, engineerEmail) {
  if (!phase.due_date || !engineerEmail) return null;
  try {
    const start = new Date(phase.due_date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 3600000);
    const event = buildCalendarEvent({
      title: `[DVC] ${phase.phase_name} — ${project.name}`,
      description: `<p><strong>Phase:</strong> ${phase.phase_name}</p><p><strong>Project:</strong> ${project.name}</p><p><strong>Site:</strong> ${project.site_address || ''}</p>${phase.notes ? `<p><strong>Notes:</strong> ${phase.notes}</p>` : ''}`,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      location: project.site_address,
      attendees: [engineerEmail],
      directorEmail: process.env.DIRECTOR_EMAIL,
    });
    const created = await createEvent(engineerEmail, event);
    return created?.id || null;
  } catch (err) {
    console.error('Calendar sync error:', err.message);
    return null;
  }
}

async function handler(req, res) {
  const { id } = req.query;
  const db = adminClient();

  if (req.method === 'GET') {
    try {
      const { data, error } = await db
        .from('projects')
        .select(`*, project_phases(*), assigned_director_user:users!projects_assigned_director_fkey(id,name,email)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json({ error: 'Project not found' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = req.body || {};

      // Handle phase update
      if (body.phase_id) {
        const { phase_id, status, due_date, assigned_to, notes, deliverable_notes, completed_date } = body;
        const updates = {};
        if (status !== undefined) updates.status = status;
        if (due_date !== undefined) updates.due_date = due_date;
        if (assigned_to !== undefined) updates.assigned_to = assigned_to;
        if (notes !== undefined) updates.notes = notes;
        if (deliverable_notes !== undefined) updates.deliverable_notes = deliverable_notes;
        if (completed_date !== undefined) updates.completed_date = completed_date;
        if (status === 'Complete' && !updates.completed_date) updates.completed_date = new Date().toISOString().split('T')[0];

        // Get phase + project + engineer for calendar sync
        const { data: phase } = await db.from('project_phases').select('*').eq('id', phase_id).single();
        const { data: project } = await db.from('projects').select('*').eq('id', id).single();

        if (due_date && assigned_to) {
          const { data: eng } = await db.from('users').select('email').eq('id', assigned_to).single();
          if (eng) {
            const calId = await syncPhaseCalendar({ ...phase, ...updates }, project, eng.email);
            if (calId) updates.calendar_event_id = calId;
          }
        }

        const { data: updated, error } = await db
          .from('project_phases')
          .update(updates)
          .eq('id', phase_id)
          .select()
          .single();
        if (error) throw error;

        // If phase just completed, notify via email
        if (status === 'Complete' && project?.client_email) {
          try {
            await resend.emails.send({
              from: process.env.EMAIL_FROM || 'crm@dvceng.com',
              to: project.client_email,
              subject: `${phase.phase_name} Complete — ${project.name}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
                <p style="font-size:16px;color:#0A1628">Dear ${project.client_name || 'Client'},</p>
                <p style="font-size:14px;line-height:1.7;color:#3d4f6b">We are pleased to confirm that the <strong>${phase.phase_name}</strong> phase for your project at <strong>${project.site_address}</strong> has been completed.</p>
                ${deliverable_notes ? `<p style="font-size:14px;color:#3d4f6b">${deliverable_notes}</p>` : ''}
                <p style="font-size:14px;color:#3d4f6b">Please don't hesitate to contact us if you have any questions.</p>
                <p style="font-size:14px;color:#0A1628">The DVC Engineering Team | dvceng.com | 020 3900 0000</p>
              </div>`,
            });
          } catch (emailErr) {
            console.error('Phase completion email error:', emailErr.message);
          }
        }

        return res.status(200).json(updated);
      }

      // Handle project update
      const projectUpdates = {};
      for (const field of ALLOWED_FIELDS) {
        if (field in body) projectUpdates[field] = body[field];
      }
      const { data, error } = await db
        .from('projects')
        .update(projectUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('PATCH project error:', err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await db.from('projects').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
