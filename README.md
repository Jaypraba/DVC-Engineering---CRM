# DVC Engineering Client Intelligence Platform

A production full-stack CRM for DVC Engineering Ltd — a structural engineering consultancy based in London. Pulls granted planning applications, scores and vets leads, assigns to engineers with O365 calendar events, and sends AI-generated outreach via Resend.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (Pages Router), React 18 |
| Database | Supabase (Postgres + RLS) |
| Email | Resend (`crm@dvceng.com`) |
| AI Generation | Anthropic Claude (claude-sonnet-4-20250514) |
| Business Agents | Symphony (`/api/symphony`) |
| Calendar | Microsoft Graph API (O365) |
| Hosting | Vercel (with cron jobs) |
| Auth | JWT (HttpOnly cookies + localStorage) |

## Setup (7 Steps)

### 1 — Supabase
1. Create a new project at supabase.com
2. Run `db/schema.sql` in the SQL editor
3. Copy Project URL and anon key → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy service role key → `SUPABASE_SERVICE_ROLE_KEY`

### 2 — Resend
1. Add and verify `dvceng.com` domain at resend.com
2. Add DNS records as instructed
3. Create API key → `RESEND_API_KEY`

### 3 — Anthropic
1. Create account at console.anthropic.com
2. Generate API key → `ANTHROPIC_API_KEY`

### 4 — Azure App Registration (Microsoft Graph)
See `docs/azure-setup.md` for full steps.

### 5 — Planning API
Request a key: `GET https://api.planning.org.uk/v1/generatekey?email=jesan@dvceng.com`
Set → `PLANNING_API_KEY`

### 6 — Symphony (AI Agent Team)
1. In Symphony → Settings → Connections, create a connection token
2. Set → `SYMPHONY_API_TOKEN`
3. Verify: `./scripts/symphony.sh "Connection check"`

See `docs/symphony-setup.md` for full steps.

### 7 — Deploy to Vercel
```bash
git push origin main
# Import repo at vercel.com, add all env vars, deploy
# Add CNAME: crm.dvceng.com → cname.vercel-dns.com
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `JWT_SECRET` | Random 32+ char string |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | crm@dvceng.com |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `SYMPHONY_API_TOKEN` | Symphony agent token (acts as the director) |
| `SYMPHONY_API_BASE` | Symphony API base URL (optional) |
| `SYMPHONY_SESSION_ID` | Symphony thread ID (optional, default `dvc-crm`) |
| `MS_TENANT_ID` | Azure tenant ID |
| `MS_CLIENT_ID` | Azure app client ID |
| `MS_CLIENT_SECRET` | Azure client secret |
| `PLD_API_HEADER` | Planning London Datahub header |
| `PLANNING_API_KEY` | api.planning.org.uk key |
| `DIRECTOR_EMAIL` | jesan@dvceng.com |
| `CRON_SECRET` | Random 32+ char string |

## Cron Jobs (Vercel)

| Schedule | Route | Action |
|----------|-------|--------|
| `0 7 * * *` | `/api/cron/daily-intelligence` | Stagnancy digest, reminders, re-engagement, lapse warnings |
| `0 8 * * 1` | `/api/cron/weekly-reengage` | Weekly re-engagement emails |

## Default Credentials

> **WARNING:** Change these immediately after deployment via Supabase SQL.
>
> Default login: `jesan@dvceng.com` / `DVC2024!Change`

```sql
UPDATE users SET password_hash = '$2b$10$...' WHERE email = 'jesan@dvceng.com';
```
Use a bcrypt generator to hash your new password.
