# DVC Lead Scraper

Automated daily lead generation for DVC Engineering Ltd. Runs at 3pm UK time every day via GitHub Actions, pulls leads from three free sources, scores them, deduplicates against Supabase, and emails a digest via Resend.

## Sources

| Source | What it finds | Cost | Auth |
|---|---|---|---|
| London Planning Datahub | Validated planning applications with structural keywords (lofts, extensions, basements) across 15 boroughs | Free | None |
| Contracts Finder (gov.uk) | Public sector structural engineering tenders | Free | None |
| Google Programmable Search | Indexed public Facebook/Nextdoor posts asking for structural engineers | Free (100 queries/day) | API key |

Note: Facebook and Nextdoor cannot be scraped directly, they block scrapers and it breaches their terms. The Google CSE approach surfaces the same publicly indexed posts legally.

## Setup

### 1. Supabase table (one-off)

This writes to its own `scraped_leads` table in the same Supabase project as
the main CRM — deliberately not the CRM's `leads` table, which has an
unrelated schema (`db/schema.sql`) driven by `lead_gen/`. The migration is
tracked in `db/schema.sql`; run it (or just the `scraped_leads` block) in the
SQL editor of your existing Supabase project:

```sql
create table scraped_leads (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  title text,
  url text unique,
  location text,
  postcode text,
  score int,
  keywords_matched text[],
  raw_reference text,
  date_found timestamptz default now(),
  status text default 'new'
);
```

### 2. Google Programmable Search (one-off, ~5 min)

1. Create a search engine at https://programmablesearchengine.google.com/ set to "search the entire web". Copy the `cx` ID.
2. Create an API key at https://console.cloud.google.com/apis/credentials and enable the Custom Search API.

### 3. GitHub repository secrets

Add under Settings > Secrets and variables > Actions on the main repo (this
scraper lives in `dvc-lead-scraper/` inside `DVC-Engineering---CRM`, it isn't
a separate repo):

- `SUPABASE_URL` — same value as the CRM's `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_KEY` — same value as the CRM's `SUPABASE_SERVICE_ROLE_KEY` (needs write access to insert rows)
- `RESEND_API_KEY`
- `LEAD_EMAIL_TO` (e.g. hello@dvceng.com)
- `LEAD_EMAIL_FROM` (must be a verified Resend domain sender, e.g. leads@dvceng.com)
- `GOOGLE_CSE_API_KEY`
- `GOOGLE_CSE_CX`

### 4. Test it

Actions tab > "DVC Daily Lead Scrape" > Run workflow. The manual trigger bypasses the 3pm gate.

## How the 3pm timing works

GitHub cron runs in UTC only. The workflow fires at both 14:00 and 15:00 UTC; `main.py` checks the actual Europe/London time and only proceeds if it is 3pm locally, so it self-corrects across BST/GMT changes without you touching anything.

## Scoring

- Planning portal leads score highest (a live application means committed spend).
- Tenders score next.
- Social mentions score lowest and only pass if they match high-value keywords or carry a postcode.
- Threshold and weights live in `scripts/lead_filter.py`, adjust freely.

## Local testing

```bash
pip install -r requirements.txt
cp .env.example .env   # fill in values
export $(grep -v '^#' .env | xargs)
python scripts/main.py
```

## Extending

Each source is a self-contained module in `scripts/sources/` exposing a `fetch()` that returns a list of lead dicts. To add a source (e.g. Checkatrade job alerts, MyBuilder RSS if available), copy an existing module and register it in `main.py`.
