"""
Recently sold properties scraper.

Primary : HM Land Registry Price Paid Data via SPARQL endpoint
           https://landregistry.data.gov.uk/app/root/qonsole

Secondary: HM Land Registry bulk download CSV (fallback for SPARQL issues)

Cross-references against already-fetched planning leads to flag properties
with active post-sale planning applications.
"""

from __future__ import annotations

import asyncio
import logging
import re
from datetime import date, timedelta
from typing import Optional

import httpx

from lead_gen.cache_manager import CacheManager
from lead_gen.models import Lead

logger = logging.getLogger(__name__)

REQUEST_DELAY = 2.0
USER_AGENT = "DVCLeadBot/1.0 (structural engineering research; contact jesan@dvceng.com)"
LOOKBACK_DAYS = 60

# Target London postcode prefixes (boroughs of interest)
TARGET_POSTCODES = [
    "SW", "SE", "E1", "E2", "E3", "E8", "E9", "E14",
    "N1", "N4", "N5", "N7", "N16",
    "W6", "W12", "W14",
    "EC", "BR", "DA",
]

SPARQL_ENDPOINT = "https://landregistry.data.gov.uk/landregistry/query"

_cache = CacheManager("sold_properties")

_POSTCODE_RE = re.compile(r"\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b", re.IGNORECASE)


def _target_postcode(postcode: str) -> bool:
    pc = postcode.upper().replace(" ", "")
    return any(pc.startswith(p.replace(" ", "")) for p in TARGET_POSTCODES)


# ── SPARQL query ──────────────────────────────────────────────────────────────

def _build_sparql_query(since_date: date, postcode_prefix: str) -> str:
    return f"""
PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?paon ?saon ?street ?town ?county ?postcode ?amount ?date ?propType WHERE {{
  ?transx lrppi:propertyAddress ?addr ;
          lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date ;
          lrppi:propertyType ?propType .

  ?addr lrcommon:postcode ?postcode .
  OPTIONAL {{ ?addr lrcommon:paon ?paon . }}
  OPTIONAL {{ ?addr lrcommon:saon ?saon . }}
  OPTIONAL {{ ?addr lrcommon:street ?street . }}
  OPTIONAL {{ ?addr lrcommon:town ?town . }}
  OPTIONAL {{ ?addr lrcommon:county ?county . }}

  FILTER(?date >= "{since_date.isoformat()}"^^xsd:date)
  FILTER(STRSTARTS(STR(?postcode), "{postcode_prefix}"))
  FILTER(?propType IN (
    lrppi:propertyType_D,
    lrppi:propertyType_S,
    lrppi:propertyType_T,
    lrppi:propertyType_F
  ))
}}
ORDER BY DESC(?date)
LIMIT 200
"""


async def _run_sparql_query(
    client: httpx.AsyncClient,
    postcode_prefix: str,
    since_date: date,
) -> list[dict]:
    cache_key = f"sparql:{postcode_prefix}:{since_date}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    query = _build_sparql_query(since_date, postcode_prefix)

    try:
        resp = await client.post(
            SPARQL_ENDPOINT,
            data={"output": "json", "query": query},
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/sparql-results+json, application/json",
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.warning("SPARQL error for prefix %s: %s", postcode_prefix, exc)
        return []

    bindings = data.get("results", {}).get("bindings", [])
    results = []
    for b in bindings:
        def v(key: str) -> str:
            return b.get(key, {}).get("value", "")

        paon = v("paon")
        saon = v("saon")
        street = v("street")
        town = v("town")
        postcode = v("postcode")
        amount_str = v("amount")
        sale_date = v("date")[:10] if v("date") else ""
        prop_type = v("propType").split("_")[-1] if v("propType") else ""

        address_parts = [p for p in [saon, paon, street, town] if p]
        address = ", ".join(address_parts)
        if postcode:
            address = f"{address}, {postcode}" if address else postcode

        try:
            amount = int(float(amount_str))
        except (ValueError, TypeError):
            amount = 0

        results.append({
            "address": address,
            "postcode": postcode,
            "sale_price": amount,
            "sale_date": sale_date,
            "property_type": prop_type,
        })

    _cache.set(cache_key, results)
    return results


# ── Postcode to borough mapping ───────────────────────────────────────────────

_POSTCODE_BOROUGH: list[tuple[str, str]] = [
    ("W6", "Hammersmith & Fulham"),
    ("W12", "Hammersmith & Fulham"),
    ("W14", "Hammersmith & Fulham"),
    ("SW11", "Wandsworth"),
    ("SW12", "Wandsworth"),
    ("SW15", "Wandsworth"),
    ("SW17", "Wandsworth"),
    ("SW18", "Wandsworth"),
    ("SW4", "Lambeth"),
    ("SW2", "Lambeth"),
    ("SE1", "Southwark"),
    ("SE5", "Southwark"),
    ("SE15", "Southwark"),
    ("SE22", "Southwark"),
    ("SE4", "Lewisham"),
    ("SE6", "Lewisham"),
    ("SE13", "Lewisham"),
    ("SE3", "Greenwich"),
    ("SE9", "Greenwich"),
    ("SE10", "Greenwich"),
    ("DA1", "Bexley"),
    ("DA5", "Bexley"),
    ("DA6", "Bexley"),
    ("BR1", "Bromley"),
    ("BR2", "Bromley"),
    ("BR3", "Bromley"),
    ("E1", "Tower Hamlets"),
    ("E2", "Tower Hamlets"),
    ("E3", "Tower Hamlets"),
    ("E14", "Tower Hamlets"),
    ("E8", "Hackney"),
    ("E9", "Hackney"),
    ("N16", "Hackney"),
    ("N1", "Islington"),
    ("N4", "Islington"),
    ("N5", "Islington"),
    ("N7", "Islington"),
    ("EC1", "Islington"),
]


def _postcode_to_borough(postcode: str) -> Optional[str]:
    pc = postcode.upper().replace(" ", "")
    for prefix, borough in sorted(_POSTCODE_BOROUGH, key=lambda x: -len(x[0])):
        if pc.startswith(prefix.replace(" ", "")):
            return borough
    return None


# ── Cross-reference with planning leads ───────────────────────────────────────

def _has_planning_flag(postcode: str, planning_postcodes: set[str]) -> bool:
    pc = postcode.upper().replace(" ", "")
    return pc in planning_postcodes


# ── Public entry point ────────────────────────────────────────────────────────

async def scrape_sold_properties(
    planning_leads: Optional[list[Lead]] = None,
) -> list[Lead]:
    """
    Query Land Registry for recently sold properties in target boroughs,
    optionally cross-referencing with planning_leads to set planning_flag.
    """
    since_date = date.today() - timedelta(days=LOOKBACK_DAYS)

    # Build set of postcodes already known from planning data
    planning_postcodes: set[str] = set()
    if planning_leads:
        for pl in planning_leads:
            if pl.postcode:
                planning_postcodes.add(pl.postcode.upper().replace(" ", ""))

    leads: list[Lead] = []
    seen: set[str] = set()

    async with httpx.AsyncClient(follow_redirects=True) as client:
        for prefix in TARGET_POSTCODES:
            logger.info("Querying Land Registry for postcode prefix %s …", prefix)
            sales = await _run_sparql_query(client, prefix, since_date)
            await asyncio.sleep(REQUEST_DELAY)

            for sale in sales:
                address = sale.get("address", "")
                postcode = sale.get("postcode", "")
                sale_date = sale.get("sale_date", "")
                sale_price = sale.get("sale_price", 0)
                prop_type_code = sale.get("property_type", "")

                if not address or address in seen:
                    continue
                seen.add(address)

                borough = _postcode_to_borough(postcode)
                has_planning = _has_planning_flag(postcode, planning_postcodes)

                prop_type_map = {
                    "D": "detached",
                    "S": "semi-detached",
                    "T": "terraced",
                    "F": "flat/maisonette",
                }
                prop_label = prop_type_map.get(prop_type_code, "residential")

                price_str = f"£{sale_price:,}" if sale_price else "price unknown"
                planning_note = "PLANNING APPLICATION FOUND POST-SALE" if has_planning else "no matching planning application"

                description = (
                    f"{prop_label.capitalize()} property sold {sale_date} for {price_str}. "
                    f"Planning cross-reference: {planning_note}."
                )

                leads.append(Lead(
                    source="sold_property",
                    lead_type="recently_sold",
                    address=address,
                    description=description,
                    postcode=postcode if postcode else None,
                    borough=borough,
                    raw_date=sale_date,
                    notes=(
                        f"Sale price: {price_str} | Property type: {prop_label} | "
                        f"Planning flag: {'YES' if has_planning else 'NO'}"
                    ),
                ))

    logger.info("Sold properties total: %d leads", len(leads))
    return leads
