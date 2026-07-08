"""
Social/community monitor.

IMPORTANT: Facebook Groups and Nextdoor have no public scraping-friendly
API. Facebook's Graph API does not expose group post content to
third-party apps, and both platforms actively block and legally pursue
scrapers. Rather than build something that will get blocked within days
(or worse), this module uses Google's official Programmable Search
Engine API (free, 100 queries/day) to surface indexed public posts from
those platforms that match renovation/structural-need language. It is
a legal proxy for the same signal, not a workaround.

Set-up (one-off, ~5 minutes):
1. https://programmablesearchengine.google.com/ -> create a search engine,
   set it to "search the entire web".
2. https://console.cloud.google.com/apis/credentials -> create an API key,
   enable the "Custom Search API".
3. Put the key and the search engine's "cx" ID into GOOGLE_CSE_API_KEY
   and GOOGLE_CSE_CX.
"""

import os
import requests
from datetime import datetime

CSE_URL = "https://www.googleapis.com/customsearch/v1"

QUERIES = [
    'site:facebook.com "loft conversion" "structural engineer" London',
    'site:facebook.com "need a structural engineer" London',
    'site:nextdoor.co.uk "structural engineer" recommendation',
    'site:nextdoor.co.uk "load bearing wall" removed',
    '"party wall" "structural engineer needed" London',
]


def fetch() -> list[dict]:
    api_key = os.environ.get("GOOGLE_CSE_API_KEY")
    cx = os.environ.get("GOOGLE_CSE_CX")
    leads = []

    if not api_key or not cx:
        print("[social_monitor] GOOGLE_CSE_API_KEY / GOOGLE_CSE_CX not set, skipping.")
        return leads

    for query in QUERIES:
        params = {
            "key": api_key,
            "cx": cx,
            "q": query,
            "dateRestrict": "d1",  # results indexed in the last day
            "num": 10,
        }
        try:
            resp = requests.get(CSE_URL, params=params, timeout=20)
            resp.raise_for_status()
            items = resp.json().get("items", [])
        except (requests.RequestException, ValueError) as exc:
            print(f"[social_monitor] fetch failed for '{query}': {exc}")
            continue

        for item in items:
            leads.append({
                "source": "social_monitor",
                "title": item.get("title", "")[:200],
                "url": item.get("link", ""),
                "location": "",
                "postcode": "",
                "date_found": datetime.utcnow().isoformat(),
                "keywords_matched": [query],
                "raw_reference": item.get("snippet", "")[:300],
            })

    return leads
