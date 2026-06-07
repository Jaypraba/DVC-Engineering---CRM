# DVC Engineering — Lead Generation Pipeline

A Python 3.12 async pipeline that automatically identifies, scores, and surfaces
high-quality structural engineering leads across London and the South East.

---

## Architecture

```
lead_gen/
├── scrapers/
│   ├── planning_portal.py      # GLA planning applications (granted/approved, 90 days)
│   ├── job_boards.py           # Checkatrade, Rated People, MyBuilder
│   ├── sold_properties.py      # Land Registry SPARQL (sold, 60 days)
│   └── architects_developers.py # RIBA Architect Finder + Companies House
├── pipeline/
│   ├── scorer.py               # Weighted 1–10 scoring model; HOT = score ≥ 7
│   ├── outreach_writer.py      # Claude-generated cold outreach drafts
│   └── exporter.py             # JSON + CSV + Markdown report + Attio/ClickUp push
├── cache/                      # 24-hour HTTP response cache (gitignored)
├── output/                     # leads.json, leads.csv, outreach_drafts.json, summary_report.md
├── main.py                     # Async orchestrator + CLI
├── models.py                   # Shared dataclasses (Lead, OutreachDraft)
├── cache_manager.py            # Disk-backed TTL cache helper
├── requirements.txt
└── .env.example
```

---

## Quick Start

### 1. Python environment

```bash
cd lead_gen
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment variables

```bash
cp .env.example .env
# Edit .env with your real API keys
```

| Variable | Required | Source |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes (outreach) | console.anthropic.com |
| `COMPANIES_HOUSE_API_KEY` | Yes (developers) | developer.company-information.service.gov.uk |
| `PLANNING_API_KEY` | Recommended | api.planning.org.uk |
| `PLD_API_HEADER` | Optional | See Planning London Datahub docs |
| `ATTIO_API_KEY` | Optional | app.attio.com/settings/api |
| `CLICKUP_API_KEY` | Optional | app.clickup.com/settings/apps |
| `CLICKUP_LIST_ID` | Optional (with above) | ClickUp list numeric ID |

### 3. Run the pipeline

```bash
# Full run (all sources)
python -m lead_gen.main

# Specific sources only
python -m lead_gen.main --sources planning architects

# Skip outreach generation and CRM push (useful for testing)
python -m lead_gen.main --dry-run

# With debug logging
python -m lead_gen.main --verbose
```

Run from the repository root (`DVC-Engineering---CRM/`), not from inside `lead_gen/`.

### 4. Schedule with cron

```bash
# Daily at 07:00 UTC
0 7 * * * cd /path/to/DVC-Engineering---CRM && /path/to/.venv/bin/python -m lead_gen.main >> leads_log.txt 2>&1
```

---

## Lead Sources

### 1. London Planning Portal
- **APIs**: Planning London Datahub → PlanIT API → planning.data.gov.uk → Idox HTML scrape (fallback chain)
- **Filter**: GRANTED/APPROVED decisions in the last 90 days containing structural keywords
- **Boroughs**: Hammersmith & Fulham, Wandsworth, Lambeth, Southwark, Lewisham, Greenwich, Bexley, Bromley, Tower Hamlets, Hackney, Islington
- **Score base**: 9/10

### 2. Job Boards
- **Sources**: Checkatrade, Rated People, MyBuilder
- **Categories**: structural surveys, steel beam installation, loft conversion, extension builds, load-bearing wall removal
- **Filter**: London locations only
- **Score base**: 8/10

### 3. Recently Sold Properties
- **Source**: HM Land Registry SPARQL endpoint
- **Filter**: Sales in last 60 days in target London postcodes; cross-referenced with planning data
- **Score base**: 6/10 (+bonus if planning flag matches)

### 4. Architects & Developers
- **RIBA Architect Finder**: practices in all 11 target boroughs
- **Companies House**: SIC codes 41100, 41202, 68100, 68209; incorporated last 24 months
- **Score base**: 7/10

---

## Scoring Model

| Component | Range | Criteria |
|---|---|---|
| Source base | 6–9 | See above |
| Recency | −2 to +2 | ≤14 days=+2, ≤30=+1, ≤60=0, ≤90=−1, older=−2 |
| Keyword match | 0 to +2 | Exact phrase match=+2, partial keyword=+1 |
| Location | −1 to +1 | Zone 1–3=+1, Zone 4–6=0, outside M25=−1 |

**HOT** = score ≥ 7 | **WARM** = 5–6.9 | **COLD** < 5

---

## Outputs

| File | Description |
|---|---|
| `output/leads.json` | Full structured lead data |
| `output/leads.csv` | Flat CSV for Attio or Excel import |
| `output/outreach_drafts.json` | AI-generated cold outreach emails for HOT leads |
| `output/summary_report.md` | Daily digest with HOT leads table |
| `leads_log.txt` | Full run log with timestamps (project root) |

---

## Constraints

- All scraping respects `robots.txt` (per-domain check before every request)
- Minimum 2-second delay between requests per domain
- HTTP responses cached to `cache/` for 24 hours to avoid re-fetching
- Outreach drafts require human review — no auto-send functionality
- Only publicly available data is collected (government portals, official directories)
- Email addresses are only stored when sourced from official public directories (RIBA, Companies House)

---

## Extending the Pipeline

To add a new scraper:
1. Create `scrapers/your_source.py` with an `async def scrape_your_source() -> list[Lead]` function
2. Import and call it in `main.py` under the appropriate numbered step
3. Add a `SOURCE_BASE` entry in `pipeline/scorer.py`
4. Update `--sources` choices in `main.py`
