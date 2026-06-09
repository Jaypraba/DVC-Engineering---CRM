"""
London planning portal scraper.

Primary source  : planning.data.gov.uk open API (no key required)
Secondary source: Planning London Datahub REST API (PLANNING_API_KEY / PLD_API_HEADER)
Tertiary source : Individual Idox-based borough portals (HTML scraping, fallback)

Targets applications GRANTED/APPROVED in the last 90 days that match
residential-extension / loft / conversion keyword criteria.
"""

from __future__ import annotations

import asyncio
import logging
import os
import re
from datetime import date, timedelta
from typing import Any, Optional
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup

from lead_gen.cache_manager import CacheManager
from lead_gen.models import Lead

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

TARGET_BOROUGHS: dict[str, str] = {
    "hammersmith-and-fulham": "Hammersmith & Fulham",
    "wandsworth": "Wandsworth",
    "lambeth": "Lambeth",
    "southwark": "Southwark",
    "lewisham": "Lewisham",
    "greenwich": "Greenwich",
    "bexley": "Bexley",
    "bromley": "Bromley",
    "tower-hamlets": "Tower Hamlets",
    "hackney": "Hackney",
    "islington": "Islington",
}

HIGH_PRIORITY_KEYWORDS = [
    "extension", "loft", "loft conversion", "rear extension", "side extension",
    "outbuilding", "garage conversion", "rear addition", "demolition of wall",
    "load bearing", "load-bearing", "structural", "hip to gable",
    "dormer", "mansard", "storey addition",
]

APPROVED_STATUSES = {
    "granted", "approved", "permitted", "approved with conditions",
    "approve", "grant", "prior approval granted",
}

PLANNING_DATA_BASE = "https://www.planning.data.gov.uk"
REQUEST_DELAY = 1.0          # seconds between domain requests
LOOKBACK_DAYS = 90

_cache = CacheManager("planning_portal")


# ── Robots.txt helper ─────────────────────────────────────────────────────────

def _can_fetch(url: str, user_agent: str = "DVCLeadBot") -> bool:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(user_agent, url)
    except Exception:
        return True  # allow if we cannot determine


# ── Planning Data Gov API ─────────────────────────────────────────────────────

async def _fetch_planning_data_gov(
    client: httpx.AsyncClient,
    lpa_slug: str,
    since_date: date,
) -> list[dict]:
    """Query planning.data.gov.uk for planning-application entities."""
    url = f"{PLANNING_DATA_BASE}/entity.json"
    params = {
        "dataset": "planning-application",
        "local_planning_authority": lpa_slug,
        "limit": 100,
        "offset": 0,
    }
    cache_key = f"pdg:{lpa_slug}:{since_date}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    results: list[dict] = []
    while True:
        try:
            resp = await client.get(url, params=params, timeout=8)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            logger.warning("planning.data.gov.uk error for %s: %s", lpa_slug, exc)
            break

        entities = data.get("entities", [])
        if not entities:
            break

        for entity in entities:
            end_date_str = entity.get("end-date") or entity.get("decision-date") or ""
            try:
                end_date = date.fromisoformat(end_date_str[:10]) if end_date_str else None
            except ValueError:
                end_date = None
            if end_date and end_date >= since_date:
                results.append(entity)

        count = data.get("count", 0)
        params["offset"] += len(entities)
        if params["offset"] >= count:
            break
        await asyncio.sleep(REQUEST_DELAY)

    _cache.set(cache_key, results)
    return results


# ── PlanIT API (open, no key needed for basic access) ────────────────────────

PLANIT_BASE = "https://api.planit.org.uk/v3"

# Mapping from our slug to PlanIT authority codes
_PLANIT_AUTHORITY_MAP: dict[str, str] = {
    "hammersmith-and-fulham": "LBH",
    "wandsworth": "WAN",
    "lambeth": "LAM",
    "southwark": "SOU",
    "lewisham": "LEW",
    "greenwich": "GRE",
    "bexley": "BEX",
    "bromley": "BRO",
    "tower-hamlets": "TOW",
    "hackney": "HAC",
    "islington": "ISL",
}


async def _fetch_planit(
    client: httpx.AsyncClient,
    lpa_slug: str,
    since_date: date,
) -> list[dict]:
    authority = _PLANIT_AUTHORITY_MAP.get(lpa_slug)
    if not authority:
        return []

    cache_key = f"planit:{lpa_slug}:{since_date}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{PLANIT_BASE}/applications"
    params = {
        "authority": authority,
        "decided_after": since_date.isoformat(),
        "status": "decided",
        "limit": 100,
        "offset": 0,
    }
    results: list[dict] = []
    while True:
        try:
            resp = await client.get(url, params=params, timeout=8)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            logger.warning("PlanIT error for %s: %s", lpa_slug, exc)
            break

        applications = data.get("applications", [])
        if not applications:
            break
        results.extend(applications)

        total = data.get("total", 0)
        params["offset"] += len(applications)
        if params["offset"] >= total:
            break
        await asyncio.sleep(REQUEST_DELAY)

    _cache.set(cache_key, results)
    return results


# ── Planning London Datahub (requires API key) ────────────────────────────────

PLD_BASE = "https://api.planning.org.uk/v1"


async def _fetch_pld(
    client: httpx.AsyncClient,
    borough_name: str,
    since_date: date,
    api_key: str,
    header_name: str,
) -> list[dict]:
    cache_key = f"pld:{borough_name}:{since_date}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{PLD_BASE}/applications"
    headers = {header_name: api_key} if header_name else {"Authorization": f"Bearer {api_key}"}
    params = {
        "local_authority": borough_name,
        "decision_date_from": since_date.isoformat(),
        "page_size": 100,
        "page": 1,
    }
    results: list[dict] = []
    while True:
        try:
            resp = await client.get(url, params=params, headers=headers, timeout=8)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            logger.warning("PLD error for %s: %s", borough_name, exc)
            break

        apps = data.get("results", data.get("applications", []))
        if not apps:
            break
        results.extend(apps)

        if not data.get("next"):
            break
        params["page"] += 1
        await asyncio.sleep(REQUEST_DELAY)

    _cache.set(cache_key, results)
    return results


# ── Idox portal scraper (HTML fallback) ───────────────────────────────────────

IDOX_PORTALS: dict[str, str] = {
    "hammersmith-and-fulham": "https://www.lbhf.gov.uk/planning/planning-portal",
    "wandsworth":             "https://planning.wandsworth.gov.uk/Northgate/PlanningExplorer",
    "lambeth":                "https://planning.lambeth.gov.uk/online-applications",
    "southwark":              "https://planning.southwark.gov.uk/online-applications",
    "lewisham":               "https://planning.lewisham.gov.uk/online-applications",
    "greenwich":              "https://planning.royalgreenwich.gov.uk/online-applications",
    "tower-hamlets":          "https://www.towerhamlets.gov.uk/lgnl/planning_and_building_control/planning_applications",
    "hackney":                "https://planningpublicaccess.hackney.gov.uk/online-applications",
    "islington":              "https://planning.islington.gov.uk/online-applications",
    "bromley":                "https://searchapplications.bromley.gov.uk/online-applications",
    "bexley":                 "https://pa.bexley.gov.uk/online-applications",
}

USER_AGENT = "DVCLeadBot/1.0 (structural engineering research; contact jesan@dvceng.com)"


async def _scrape_idox_search(
    client: httpx.AsyncClient,
    lpa_slug: str,
    since_date: date,
) -> list[dict]:
    base_url = IDOX_PORTALS.get(lpa_slug)
    if not base_url:
        return []

    if not _can_fetch(base_url, USER_AGENT):
        logger.info("robots.txt disallows scraping %s", base_url)
        return []

    search_url = base_url.rstrip("/") + "/search.do"
    cache_key = f"idox:{lpa_slug}:{since_date}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    form_data = {
        "action": "advanced",
        "searchType": "Application",
        "date(applicationDecisionStart)": since_date.strftime("%d/%m/%Y"),
        "date(applicationDecisionEnd)": date.today().strftime("%d/%m/%Y"),
        "applicationType": "",
        "description": "extension OR loft OR conversion OR outbuilding",
        "_csrf": "",
    }

    results: list[dict] = []
    try:
        resp = await client.post(
            search_url,
            data=form_data,
            headers={"User-Agent": USER_AGENT},
            timeout=8,
            follow_redirects=True,
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        rows = soup.select("li.searchresult")
        for row in rows:
            ref_el = row.select_one("a[href*='applicationDetails']")
            addr_el = row.select_one(".address")
            desc_el = row.select_one(".description")
            date_el = row.select_one(".date")
            status_el = row.select_one(".status")

            results.append({
                "reference": ref_el.text.strip() if ref_el else "",
                "address": addr_el.text.strip() if addr_el else "",
                "description": desc_el.text.strip() if desc_el else "",
                "decision_date": date_el.text.strip() if date_el else "",
                "status": status_el.text.strip() if status_el else "",
                "source": "idox",
            })
        await asyncio.sleep(REQUEST_DELAY)
    except Exception as exc:
        logger.warning("Idox scrape error for %s: %s", lpa_slug, exc)

    _cache.set(cache_key, results)
    return results


# ── Keyword / status filters ─────────────────────────────────────────────────

def _is_approved(status: str) -> bool:
    return any(s in status.lower() for s in APPROVED_STATUSES)


def _keyword_score(text: str) -> tuple[str, int]:
    """Return (matched_keyword, score_delta). Score: exact=2, partial=1."""
    text_lower = text.lower()
    for kw in HIGH_PRIORITY_KEYWORDS:
        if kw in text_lower:
            return kw, 2 if len(kw.split()) > 1 else 1
    return "", 0


_POSTCODE_RE = re.compile(r"\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b", re.IGNORECASE)


def _extract_postcode(text: str) -> Optional[str]:
    m = _POSTCODE_RE.search(text)
    return m.group(1).upper().strip() if m else None


# ── Entity normalisation ──────────────────────────────────────────────────────

def _normalise_entity(entity: dict, lpa_slug: str, source_tag: str) -> Optional[Lead]:
    """Convert a raw API/scrape dict to a Lead (pre-scoring)."""
    # Unify field names across APIs
    description = (
        entity.get("development-description")
        or entity.get("description")
        or entity.get("proposal")
        or ""
    )
    address = (
        entity.get("site-address")
        or entity.get("address")
        or entity.get("site_address")
        or ""
    )
    status = (
        entity.get("decision")
        or entity.get("status")
        or entity.get("application_status")
        or ""
    )
    decision_date = (
        entity.get("decision-date")
        or entity.get("decision_date")
        or entity.get("date")
        or ""
    )
    ref = (
        entity.get("reference")
        or entity.get("application_ref")
        or entity.get("lpa-app-no")
        or entity.get("id")
        or ""
    )
    agent_name = entity.get("agent-name") or entity.get("agent_name") or ""
    agent_email = entity.get("agent-email") or entity.get("agent_email") or ""

    if not address or not description:
        return None
    if not _is_approved(status):
        return None

    kw, _ = _keyword_score(description)
    postcode = _extract_postcode(address)
    borough_name = TARGET_BOROUGHS.get(lpa_slug, lpa_slug.replace("-", " ").title())

    lead_type = "general_planning"
    if any(k in description.lower() for k in ["loft", "dormer", "hip to gable", "mansard"]):
        lead_type = "loft_conversion"
    elif any(k in description.lower() for k in ["extension", "outbuilding", "rear addition"]):
        lead_type = "residential_extension"
    elif any(k in description.lower() for k in ["garage conversion"]):
        lead_type = "garage_conversion"
    elif any(k in description.lower() for k in ["demolition", "load-bearing", "load bearing"]):
        lead_type = "structural_alteration"

    notes = f"Keyword match: '{kw}'" if kw else "No priority keyword matched"

    return Lead(
        source="planning_portal",
        lead_type=lead_type,
        address=address,
        description=description,
        postcode=postcode,
        borough=borough_name,
        contact_email=agent_email if agent_email else None,
        application_ref=str(ref),
        raw_date=str(decision_date),
        agent_name=agent_name if agent_name else None,
        notes=notes,
    )


# ── Public entry point ────────────────────────────────────────────────────────

async def scrape_planning_portal() -> list[Lead]:
    """Fetch and return raw (unscored) leads from all planning data sources."""
    since_date = date.today() - timedelta(days=LOOKBACK_DAYS)
    planning_api_key = os.getenv("PLANNING_API_KEY", "")
    pld_header = os.getenv("PLD_API_HEADER", "Authorization")

    leads: list[Lead] = []
    seen_refs: set[str] = set()

    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}

    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        for lpa_slug, borough_name in TARGET_BOROUGHS.items():
            logger.info("Fetching planning data for %s …", borough_name)

            # 1. PLD API (if key provided)
            if planning_api_key:
                entities = await _fetch_pld(
                    client, borough_name, since_date, planning_api_key, pld_header
                )
                await asyncio.sleep(REQUEST_DELAY)
            else:
                entities = []

            # 2. PlanIT fallback
            if not entities:
                entities = await _fetch_planit(client, lpa_slug, since_date)
                await asyncio.sleep(REQUEST_DELAY)

            # 3. planning.data.gov.uk
            if not entities:
                entities = await _fetch_planning_data_gov(client, lpa_slug, since_date)
                await asyncio.sleep(REQUEST_DELAY)

            # 4. Idox HTML scrape
            if not entities:
                raw_rows = await _scrape_idox_search(client, lpa_slug, since_date)
                entities = raw_rows

            for entity in entities:
                lead = _normalise_entity(entity, lpa_slug, "planning_portal")
                if lead is None:
                    continue
                ref = lead.application_ref or lead.address
                if ref in seen_refs:
                    continue
                seen_refs.add(ref)
                leads.append(lead)

            logger.info("  → %d leads so far from %s", len(leads), borough_name)

    logger.info("Planning portal total: %d leads", len(leads))
    return leads
