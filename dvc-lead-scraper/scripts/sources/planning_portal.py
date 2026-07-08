"""
London Planning Datahub source.

Free, official, no API key required. Pulls recently validated planning
applications across DVC's service boroughs and flags the ones whose
description signals structural work (extensions, loft conversions,
basement digs, wall removal, etc).

NOTE: this is a public sector API and its schema does occasionally change.
If this starts returning zero results, check the current docs at
https://planningdata.london.gov.uk/ before assuming the keyword logic
is at fault.
"""

import requests
from datetime import datetime, timedelta

BASE_URL = "https://planningdata.london.gov.uk/api-guest/applications/_search"

# DVC's core service area. Widen or trim as the business develops.
BOROUGHS = [
    "Hammersmith and Fulham", "Wandsworth", "Kensington and Chelsea",
    "Westminster", "Camden", "Islington", "Hackney", "Lambeth",
    "Southwark", "Richmond upon Thames", "Merton", "Croydon",
    "Bromley", "Sevenoaks", "Tonbridge and Malling",
]

STRUCTURAL_KEYWORDS = [
    "loft conversion", "rear extension", "side extension",
    "basement", "single storey extension", "double storey extension",
    "wrap around extension", "structural alterations",
    "removal of load bearing wall", "roof extension",
    "outrigger", "dormer",
]


def fetch(days_back: int = 1) -> list[dict]:
    since = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    leads = []

    query = {
        "size": 100,
        "query": {
            "bool": {
                "must": [
                    {"range": {"validated_date": {"gte": since}}},
                    {"terms": {"borough.keyword": BOROUGHS}},
                ]
            }
        },
    }

    try:
        resp = requests.post(BASE_URL, json=query, timeout=20)
        resp.raise_for_status()
        hits = resp.json().get("hits", {}).get("hits", [])
    except (requests.RequestException, ValueError) as exc:
        print(f"[planning_portal] fetch failed: {exc}")
        return leads

    for hit in hits:
        src = hit.get("_source", {})
        description = (src.get("description") or "").lower()
        matched = [kw for kw in STRUCTURAL_KEYWORDS if kw in description]
        if not matched:
            continue

        leads.append({
            "source": "planning_portal",
            "title": src.get("description", "")[:200],
            "url": src.get("url") or src.get("case_url", ""),
            "location": f"{src.get('address', '')}, {src.get('borough', '')}",
            "postcode": src.get("postcode", ""),
            "date_found": datetime.utcnow().isoformat(),
            "keywords_matched": matched,
            "raw_reference": src.get("reference", ""),
        })

    return leads
