import { requireAuth } from '../../../lib/auth';
import { ask, isSymphonyConfigured } from '../../../lib/symphony';

// Serverless functions have a short budget, so only wait briefly inline. If
// Symphony is still working, the client polls /api/symphony/reply.
const INLINE_WAIT_MS = Number(process.env.SYMPHONY_INLINE_WAIT_MS || 8000);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // A Symphony message acts with the director's full authority.
  if (req.user?.role !== 'director' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Director access required' });
  }

  if (!isSymphonyConfigured()) {
    return res.status(503).json({ error: 'Symphony is not configured. Set SYMPHONY_API_TOKEN.' });
  }

  const { message, sessionId } = req.body || {};
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const result = await ask(message, { sessionId, waitMs: INLINE_WAIT_MS });
    return res.status(200).json(result);
  } catch (err) {
    console.error('Symphony ask error:', err);
    return res.status(502).json({ error: err.message || 'Failed to reach Symphony' });
  }
}

export default requireAuth(handler);
