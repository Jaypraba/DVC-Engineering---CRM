"""
Contracts Finder (gov.uk) source.

Free, official, no API key required. Surfaces public sector tenders
for structural engineering services, useful for larger commercial or
local authority work that DVC or Hey Structure's panel could bid on.
"""

import requests
from datetime import datetime, timedelta

BASE_URL = "https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search"

SEARCH_TERMS = [
    "structural engineer",
    "structural engineering services",
    "structural survey",
]


def fetch(days_back: int = 1) -> list[dict]:
    leads = []
    since = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    for term in SEARCH_TERMS:
        params = {
            "keyword": term,
            "publishedFrom": since,
            "order": "-publishedDate",
        }
        try:
            resp = requests.get(BASE_URL, params=params, timeout=20)
            resp.raise_for_status()
            releases = resp.json().get("releases", [])
        except (requests.RequestException, ValueError) as exc:
            print(f"[contracts_finder] fetch failed for '{term}': {exc}")
            continue

        for r in releases:
            tender = r.get("tender", {})
            # Contracts Finder's OCDS mapping uses the notice's internal GUID
            # as tender.id, which is also the path segment for its public
            # notice page. Fall back to the OCDS release id (not a working
            # link, but still a stable dedup key) if that's ever missing.
            notice_id = tender.get("id") or r.get("id", "")
            url = (
                f"https://www.contractsfinder.service.gov.uk/Notice/{notice_id}"
                if tender.get("id") else notice_id
            )
            leads.append({
                "source": "contracts_finder",
                "title": tender.get("title", "")[:200],
                "url": url,
                "location": tender.get("deliveryAddresses", [{}])[0].get("region", "")
                if tender.get("deliveryAddresses") else "",
                "postcode": "",
                "date_found": datetime.utcnow().isoformat(),
                "keywords_matched": [term],
                "raw_reference": notice_id,
            })

    return leads
