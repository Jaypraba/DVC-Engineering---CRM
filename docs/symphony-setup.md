# Symphony — Agent Integration Guide

## Why This Is Needed
Symphony is the director's team of AI business agents. It can schedule, contact clients, follow up, build reports and act on the business. This integration lets the CRM (and the command line) send Symphony a message and collect its answer, so lead follow-ups and reports can be handed to Symphony without leaving the platform.

**A message sent with the Symphony token acts with the director's full authority.** Treat the token like the Supabase service role key.

---

## Step-by-Step

### 1. Get the Token
In Symphony → **Settings** → **Connections**, create a connection token for the CRM.

### 2. Set the Environment Variables
Local development — add to `.env.local`:
```
SYMPHONY_API_TOKEN=<your token>
```
Production — add the same variable in Vercel → Project → Settings → Environment Variables.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SYMPHONY_API_TOKEN` | Yes | — | Connection token. Acts as the director. |
| `SYMPHONY_API_BASE` | No | `https://symphony.wix.com/individuals-chat/poc/agent` | API base URL |
| `SYMPHONY_SESSION_ID` | No | `dvc-crm` | Thread ID. Keep it stable so replies stay in one conversation. |
| `SYMPHONY_INLINE_WAIT_MS` | No | `8000` | How long `/api/symphony/ask` waits before handing back a `conversationId` |

### 3. Allow Outbound Access
Symphony is called server-side. If the CRM runs behind an egress policy (Vercel firewall, corporate proxy, or a sandboxed CI/agent environment), `symphony.wix.com:443` must be on the allowed-host list or every call fails at the connection stage.

### 4. Verify
```bash
./scripts/symphony.sh "Connection check — reply with a one line summary of my agent team"
```

---

## How It Works

Symphony is asynchronous. `POST /ask` either answers immediately or returns `{ "status": "accepted", "conversationId": "..." }` and keeps working — its turns can take a minute or two. The answer is then collected from `POST /reply`, polled every 3 seconds.

Because Vercel functions have a short execution budget, the CRM does not hold a request open for the full two minutes. `/api/symphony/ask` waits `SYMPHONY_INLINE_WAIT_MS` and then returns the `conversationId` with `status: "pending"`; the client polls `/api/symphony/reply` from there.

### From the CRM API

Both routes require authentication and a `director` or `admin` role.

```bash
# Send a message
curl -X POST https://crm.dvceng.com/api/symphony/ask \
  -H "Authorization: Bearer <crm jwt>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarise this week'\''s granted leads in Camden"}'

# -> {"status":"pending","reply":null,"conversationId":"abc123"}

# Collect the answer
curl -X POST https://crm.dvceng.com/api/symphony/reply \
  -H "Authorization: Bearer <crm jwt>" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "abc123"}'

# -> {"status":"answered","reply":"...","conversationId":"abc123"}
```

### From Server-Side Code

```js
import { ask, waitForReply } from '../lib/symphony';

// Wait inline (use only where a long execution budget is available, e.g. a cron route)
const { status, reply, conversationId } = await ask('Draft a follow-up for lead 42', { waitMs: 60000 });

// Or hand back immediately and poll later
const started = await ask('Build me a pipeline report', { waitMs: 0 });
const answer = await waitForReply(started.conversationId);
```

### From the Command Line

```bash
./scripts/symphony.sh "Draft a follow-up to the Camden loft conversion lead"
```
The script reads `SYMPHONY_API_TOKEN` from the environment, falling back to `.env.local`. It handles the accept-then-poll flow and prints the reply, giving up after `SYMPHONY_TIMEOUT_SECONDS` (default 120).

---

## Security Notes

- The token grants the ability to act as the director. Never commit it — `.env.local` is git-ignored, and `.env.local.example` carries a placeholder only.
- Both API routes are gated behind `requireAuth` and a director/admin role check. Do not relax this: any authenticated CRM user with access could otherwise send outreach as the director.
- Rotate the token in Symphony → Settings → Connections if it is ever pasted into a chat, log, or ticket.
