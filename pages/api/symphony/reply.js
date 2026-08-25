import { requireAuth } from '../../../lib/auth';
import { getReply, isSymphonyConfigured } from '../../../lib/symphony';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.user?.role !== 'director' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Director access required' });
  }

  if (!isSymphonyConfigured()) {
    return res.status(503).json({ error: 'Symphony is not configured. Set SYMPHONY_API_TOKEN.' });
  }

  const { conversationId } = req.body || {};
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId is required' });
  }

  try {
    const result = await getReply(conversationId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Symphony reply error:', err);
    return res.status(502).json({ error: err.message || 'Failed to reach Symphony' });
  }
}

export default requireAuth(handler);
