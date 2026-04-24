# DVC Engineering CRM — Full Deployment Guide

## Prerequisites
- Node.js 18+
- Vercel account
- Supabase account
- Resend account (with dvceng.com domain access)
- Anthropic account
- Azure / Microsoft 365 admin access
- GitHub account

---

## 1 — Supabase

1. Go to supabase.com → New project
2. Name: `dvc-engineering-crm`, choose EU West region
3. Wait for project to provision
4. Go to **SQL Editor** → paste entire contents of `db/schema.sql` → Run
5. Go to **Settings → API**:
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2 — Resend Email

1. Go to resend.com → Domains → Add Domain → `dvceng.com`
2. Add the provided DNS records (SPF, DKIM, DMARC) to your DNS provider
3. Click Verify — wait up to 48h for DNS propagation
4. Go to API Keys → Create API Key (name: `dvc-crm-production`)
5. Copy key → `RESEND_API_KEY`
6. Set `EMAIL_FROM=crm@dvceng.com`

---

## 3 — Anthropic

1. Go to console.anthropic.com
2. Settings → API Keys → Create Key
3. Copy key → `ANTHROPIC_API_KEY`

---

## 4 — Azure App Registration (Microsoft Graph)

See `docs/azure-setup.md` for detailed steps.

Quick summary:
- Register app in Azure Entra ID
- Add `Calendars.ReadWrite` and `User.Read.All` application permissions
- Grant admin consent
- Create client secret
- Copy Tenant ID → `MS_TENANT_ID`
- Copy Client ID → `MS_CLIENT_ID`
- Copy Client Secret → `MS_CLIENT_SECRET`

---

## 5 — Planning API Key

```
GET https://api.planning.org.uk/v1/generatekey?email=jesan@dvceng.com
```

Wait for email confirmation. Copy key → `PLANNING_API_KEY`

For the Planning London Datahub, contact planningdata.london.gov.uk for the `X-API-AllowRequest` header value → `PLD_API_HEADER`

---

## 6 — GitHub

```bash
git init
git add .
git commit -m "DVC Engineering Platform v2.0 — initial commit"
git remote add origin git@github.com:dvceng/crm.git
git push -u origin main
```

---

## 7 — Vercel Deploy

1. Go to vercel.com → Import Project → select the GitHub repo
2. Framework: **Next.js** (auto-detected)
3. Go to **Settings → Environment Variables** and add all variables from `.env.local.example`
4. Generate `JWT_SECRET` and `CRON_SECRET` with: `openssl rand -hex 32`
5. Click **Deploy**

### Custom Domain
1. Vercel → Project → Settings → Domains
2. Add `crm.dvceng.com`
3. At your DNS provider add: `CNAME crm cname.vercel-dns.com`
4. Vercel auto-provisions SSL

---

## 8 — Post-Deploy Checklist

- [ ] Change default director password via Supabase SQL
- [ ] Add engineer accounts via the Users API or Supabase SQL
- [ ] Test calendar event: go to Assign → select a lead → assign to yourself
- [ ] Test email send: go to Email → select a lead → generate → send
- [ ] Verify cron auth: `curl -H "Authorization: Bearer {CRON_SECRET}" https://crm.dvceng.com/api/cron/daily-intelligence`
- [ ] Import first batch: go to Import → select some London boroughs → query

---

## Adding Engineer Accounts

Via the CRM (director role required):
```
POST /api/users
{ "email": "engineer@dvceng.com", "name": "Engineer Name", "role": "engineer", "region": "London", "password": "SecurePass123!" }
```

Or directly in Supabase SQL:
```sql
INSERT INTO users (email, name, role, region, password_hash)
VALUES ('engineer@dvceng.com', 'Engineer Name', 'engineer', 'London', '$2b$10$...');
```
