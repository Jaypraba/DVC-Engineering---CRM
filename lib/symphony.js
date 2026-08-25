// Symphony integration — send messages to the director's Symphony agent team
//
// Symphony is an async agent: /ask either returns a reply immediately or returns
// { status: 'accepted', conversationId }, in which case the answer is collected
// from /reply. Messages sent with this token act with the director's authority,
// so every caller must be authenticated.

const SYMPHONY_BASE = process.env.SYMPHONY_API_BASE || 'https://symphony.wix.com/individuals-chat/poc/agent';
const DEFAULT_SESSION_ID = process.env.SYMPHONY_SESSION_ID || 'dvc-crm';
const POLL_INTERVAL_MS = 3000;

export function isSymphonyConfigured() {
  return Boolean(process.env.SYMPHONY_API_TOKEN);
}

function authHeaders() {
  const token = process.env.SYMPHONY_API_TOKEN;
  if (!token) {
    throw new Error('SYMPHONY_API_TOKEN is not set');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function postJson(path, body) {
  const res = await fetch(`${SYMPHONY_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Symphony ${path} failed (${res.status}): ${err}`);
  }

  return res.json();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Normalise both endpoints onto one shape the callers can switch on.
function normalise(data) {
  if (data?.reply) {
    return { status: 'answered', reply: data.reply, conversationId: data.conversationId || null };
  }
  return { status: data?.status || 'pending', reply: null, conversationId: data?.conversationId || null };
}

// Fetch the current state of an in-flight conversation. Does not block.
export async function getReply(conversationId) {
  if (!conversationId) throw new Error('conversationId is required');
  const data = await postJson('/reply', { conversationId });
  return normalise({ ...data, conversationId: data?.conversationId || conversationId });
}

// Poll /reply until Symphony answers or the budget runs out.
export async function waitForReply(conversationId, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const result = await getReply(conversationId);
    if (result.status === 'answered' && result.reply) return result;
  }

  return { status: 'pending', reply: null, conversationId };
}

// Send a message to Symphony. Waits up to waitMs for the answer, then hands back
// the conversationId so a caller on a short serverless budget can poll instead.
export async function ask(message, { sessionId = DEFAULT_SESSION_ID, waitMs = 8000 } = {}) {
  if (!message || !message.trim()) {
    throw new Error('message is required');
  }

  const accepted = normalise(await postJson('/ask', { message, sessionId }));
  if (accepted.status === 'answered') return accepted;

  if (!accepted.conversationId) {
    throw new Error('Symphony accepted the message but returned no conversationId');
  }

  if (waitMs > 0) {
    return waitForReply(accepted.conversationId, waitMs);
  }

  return accepted;
}
