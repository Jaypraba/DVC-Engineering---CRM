import { adminClient } from '../../../lib/supabase';
import { signToken, setCookieHeader } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = adminClient();
    const { data: users, error } = await db
      .from('users')
      .select('id, email, name, role, region, password_hash, active')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error) throw error;
    const user = users?.[0];

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last_login
    await db.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    const tokenPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken(tokenPayload);

    res.setHeader('Set-Cookie', setCookieHeader(token));
    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, region: user.region },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
