"""
Handles dedup and persistence against your Supabase project.

Writes to a dedicated `scraped_leads` table, NOT the CRM's main `leads`
table (db/schema.sql) — that table has an incompatible schema (text
primary key, readiness_score, Hot/Warm/Cold status, etc. driven by the
planning-application pipeline in lead_gen/). Keeping this scraper's raw
output in its own table avoids corrupting or colliding with it.

Expected table (create once in the Supabase SQL editor, see
db/schema.sql for the tracked migration):

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
  status text default 'new'  -- new, contacted, quoted, won, lost
);
"""

import os
from supabase import create_client


def get_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_KEY not set")
    return create_client(url, key)


def insert_new_leads(leads: list[dict]) -> list[dict]:
    """
    Inserts leads, relying on the unique constraint on `url` to skip
    anything already seen. Returns only the leads that were newly
    inserted, so the email digest doesn't repeat itself daily.
    """
    if not leads:
        return []

    client = get_client()
    newly_inserted = []

    for lead in leads:
        if not lead.get("url"):
            continue  # can't dedupe without a stable identifier
        try:
            result = client.table("scraped_leads").insert({
                "source": lead["source"],
                "title": lead["title"],
                "url": lead["url"],
                "location": lead.get("location", ""),
                "postcode": lead.get("postcode", ""),
                "score": lead.get("score", 0),
                "keywords_matched": lead.get("keywords_matched", []),
                "raw_reference": lead.get("raw_reference", ""),
            }).execute()
            if result.data:
                newly_inserted.append(lead)
        except Exception as exc:
            # Most common cause: unique constraint violation, i.e. a
            # duplicate we've already logged. That's expected, not an error.
            if "duplicate" not in str(exc).lower():
                print(f"[supabase_client] insert failed for {lead.get('url')}: {exc}")

    return newly_inserted
