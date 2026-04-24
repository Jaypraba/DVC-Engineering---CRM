import { adminClient } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  const db = adminClient();

  if (req.method === 'GET') {
    try {
      const { data, error } = await db
        .from('users')
        .select('id, email, name, role, region, active, last_login, created_at')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('GET users error:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'director' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Director access required' });
    }

    const { email, name, role, region, password } = req.body || {};
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'email, name, and password are required' });
    }

    try {
      const password_hash = await bcrypt.hash(password, 10);
      const { data, error } = await db
        .from('users')
        .insert({ email: email.toLowerCase().trim(), name, role: role || 'engineer', region, password_hash })
        .select('id, email, name, role, region')
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } catch (err) {
      console.error('POST users error:', err);
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Email already in use' });
      }
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
