# DVC Engineering Client Intelligence Platform

A production full-stack CRM for DVC Engineering Ltd — a structural engineering consultancy based in London. Pulls granted planning applications, scores and vets leads, assigns to engineers with O365 calendar events, and sends AI-generated outreach via Resend.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (Pages Router), React 18 |
| Database | Supabase (Postgres + RLS) |
| Email | Resend (`crm@dvceng.com`) |
| AI Generation | Anthropic Claude (claude-sonnet-4-20250514) |
| Calendar | Microsoft Graph API (O365) |
| Hosting | Vercel (with cron jobs) |
| Auth | JWT (HttpOnly cookies + localStorage) |

## Setup (6 Steps)

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

### 6 — Deploy to Vercel
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
| `MS_TENANT_ID` | Azure tenant ID |
| `MS_CLIENT_ID` | Azure app client ID |
| `MS_CLIENT_SECRET` | Azure client secret |
| `PLD_API_HEADER` | Planning London Datahub header |
| `PLANNING_API_KEY` | api.planning.org.uk key |
| `DIRECTOR_EMAIL` | jesan@dvceng.com |
| `CRON_SECRET` | Random 32+ char string |
| `AMADEUS_CLIENT_ID` | Amadeus API client ID (Travel Deals) |
| `AMADEUS_CLIENT_SECRET` | Amadeus API client secret |
| `AMADEUS_ENV` | `test` (default, free sandbox) or `production` |

## Cron Jobs (Vercel)

| Schedule | Route | Action |
|----------|-------|--------|
| `0 7 * * *` | `/api/cron/daily-intelligence` | Stagnancy digest, reminders, re-engagement, lapse warnings |
| `0 8 * * 1` | `/api/cron/weekly-reengage` | Weekly re-engagement emails |
| `0 6 * * *` | `/api/cron/travel-deals` | Scan saved travel alerts, email matching flight deals |

## Travel Deals Finder (`/travel`)

AI-powered flight and hotel deal hunter built into the CRM:

- **AI Search** — describe a trip in plain English ("cheap week in Portugal in September under £200"). Claude parses it into structured parameters, Amadeus returns live fares/rates, and each result is scored against the route's historical price quartiles. Fares at or near the historical minimum (or 45%+ below median) are flagged **CLEARANCE**. When no destination is given, the finder sweeps the cheapest destinations from your origin. Flexible dates trigger a cheapest-date sweep on the route. Claude then writes a short verdict on whether to book now.
- **Clearance Fares** — live error fares and flash sales aggregated from Secret Flying, Fly4free and The Flight Deal RSS feeds, with Claude extracting routes and prices from headlines. Error/mistake fares are badged and sorted first.
- **Deal Alerts** — save a route (or origin → anywhere) with a price cap and discount threshold. A daily cron scans fares, dedupes against previously-seen deals, and emails you via Resend when something qualifies.

Setup: create free API keys at [developers.amadeus.com](https://developers.amadeus.com), set `AMADEUS_CLIENT_ID`/`AMADEUS_CLIENT_SECRET`, and run `db/travel-schema.sql` in the Supabase SQL editor. The free test tier covers development; switch `AMADEUS_ENV=production` with live keys for real bookable fares.

## Default Credentials

> **WARNING:** Change these immediately after deployment via Supabase SQL.
>
> Default login: `jesan@dvceng.com` / `DVC2024!Change`

```sql
UPDATE users SET password_hash = '$2b$10$...' WHERE email = 'jesan@dvceng.com';
```
Use a bcrypt generator to hash your new password.
