"""
Architects and property developers identification.

Sources:
  1. Companies House Advanced Search API  — property developer companies
     SIC codes: 41100 (development of building projects),
                41202 (construction of domestic buildings),
                68100 (buying & selling own real estate),
                68209 (other letting & operating of own/leased real estate)
     Filter: incorporated in last 24 months, registered in target London areas.

  2. RIBA Architect Finder — architects practising in target boroughs.
     https://www.architecture.com/find-an-architect
"""

from __future__ import annotations

import asyncio
import base64
import logging
import os
import re
from datetime import date, timedelta
from typing import Optional
from urllib.parse import urlencode, urljoin
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup

from lead_gen.cache_manager import CacheManager
from lead_gen.models import Lead

logger = logging.getLogger(__name__)

REQUEST_DELAY = 2.0
USER_AGENT = "DVCLeadBot/1.0 (structural engineering research; contact jesan@dvceng.com)"

PROPERTY_SIC_CODES = ["41100", "41202", "68100", "68209"]

# London postcode areas to query in Companies House
TARGET_POSTCODE_AREAS = [
    "SW", "SE", "E1", "E2", "E8", "E9", "E14",
    "N1", "N4", "N5", "N7", "W6", "W12", "W14", "EC", "BR", "DA",
]

COMPANIES_HOUSE_BASE = "https://api.company-information.service.gov.uk"
RIBA_BASE = "https://www.architecture.com"

_cache = CacheManager("architects_developers")


def _can_fetch(url: str) -> bool:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        return True


def _ch_auth_header(api_key: str) -> dict:
    token = base64.b64encode(f"{api_key}:".encode()).decode()
    return {"Authorization": f"Basic {token}"}


# ── Companies House ───────────────────────────────────────────────────────────

async def _fetch_companies_house(
    client: httpx.AsyncClient,
    api_key: str,
    sic_code: str,
    postcode_area: str,
    incorporated_from: date,
) -> list[dict]:
    cache_key = f"ch:{sic_code}:{postcode_area}:{incorporated_from}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{COMPANIES_HOUSE_BASE}/advanced-search/companies"
    params = {
        "sic_codes": sic_code,
        "registered_office_address": postcode_area,
        "incorporated_from": incorporated_from.isoformat(),
        "company_status": "active",
        "size": 100,
        "start_index": 0,
    }
    results: list[dict] = []

    while True:
        try:
            resp = await client.get(
                url,
                params=params,
                headers={**_ch_auth_header(api_key), "User-Agent": USER_AGENT},
                timeout=30,
            )
            if resp.status_code == 401:
                logger.error("Companies House: invalid API key")
                break
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            logger.warning("Companies House error sic=%s area=%s: %s", sic_code, postcode_area, exc)
            break

        items = data.get("items", [])
        if not items:
            break

        results.extend(items)

        total = data.get("hits", 0)
        params["start_index"] += len(items)
        if params["start_index"] >= total:
            break
        await asyncio.sleep(REQUEST_DELAY)

    _cache.set(cache_key, results)
    return results


def _company_to_lead(company: dict, sic_code: str) -> Optional[Lead]:
    name = company.get("company_name", "")
    number = company.get("company_number", "")
    status = company.get("company_status", "active")
    inc_date = company.get("date_of_creation", "")
    addr = company.get("registered_office_address", {})
    address_parts = [
        addr.get("address_line_1", ""),
        addr.get("address_line_2", ""),
        addr.get("locality", ""),
        addr.get("postal_code", ""),
    ]
    address = ", ".join(p for p in address_parts if p)
    postcode = addr.get("postal_code", "")

    if not name:
        return None

    sic_descriptions = {
        "41100": "development of building projects",
        "41202": "construction of domestic buildings",
        "68100": "buying & selling own real estate",
        "68209": "other letting & operating of real estate",
    }
    sic_desc = sic_descriptions.get(sic_code, sic_code)

    return Lead(
        source="architect_developer",
        lead_type="property_developer",
        name=name,
        address=address or "London",
        postcode=postcode if postcode else None,
        description=f"{name} — {sic_desc}. Companies House no: {number}. Incorporated: {inc_date}.",
        application_ref=number,
        raw_date=inc_date,
        notes=f"Companies House | SIC={sic_code} | status={status}",
    )


async def scrape_companies_house(api_key: str) -> list[Lead]:
    incorporated_from = date.today() - timedelta(days=730)  # last 24 months
    leads: list[Lead] = []
    seen: set[str] = set()

    async with httpx.AsyncClient(follow_redirects=True) as client:
        for sic in PROPERTY_SIC_CODES:
            for area in TARGET_POSTCODE_AREAS:
                logger.info("Companies House: SIC=%s area=%s", sic, area)
                companies = await _fetch_companies_house(client, api_key, sic, area, incorporated_from)
                await asyncio.sleep(REQUEST_DELAY)

                for co in companies:
                    lead = _company_to_lead(co, sic)
                    if lead is None:
                        continue
                    ref = lead.application_ref or lead.name
                    if ref in seen:
                        continue
                    seen.add(ref)
                    leads.append(lead)

    logger.info("Companies House: %d developer leads", len(leads))
    return leads


# ── RIBA Architect Finder ─────────────────────────────────────────────────────

TARGET_BOROUGH_RIBA_SEARCHES = [
    "Hammersmith", "Wandsworth", "Lambeth", "Southwark", "Lewisham",
    "Greenwich", "Bexley", "Bromley", "Tower Hamlets", "Hackney", "Islington",
]


async def _scrape_riba_area(
    client: httpx.AsyncClient,
    area: str,
) -> list[dict]:
    cache_key = f"riba:{area}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    search_url = f"{RIBA_BASE}/find-an-architect/results/"
    params = {
        "q": "",
        "location": area,
        "radius": "10",
        "page": 1,
    }

    if not _can_fetch(search_url):
        logger.info("robots.txt disallows RIBA scraping")
        return []

    results: list[dict] = []
    while True:
        try:
            resp = await client.get(
                search_url,
                params=params,
                headers={"User-Agent": USER_AGENT},
                timeout=30,
                follow_redirects=True,
            )
            if resp.status_code in (403, 404, 429):
                logger.debug("RIBA HTTP %s for area=%s", resp.status_code, area)
                break
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            page_results = _parse_riba_results(soup)
            if not page_results:
                break
            results.extend(page_results)

            next_btn = soup.select_one("a[rel='next'], a.pagination__next, a[aria-label='Next']")
            if not next_btn:
                break
            params["page"] += 1
        except Exception as exc:
            logger.warning("RIBA error for %s: %s", area, exc)
            break
        await asyncio.sleep(REQUEST_DELAY)

    _cache.set(cache_key, results)
    return results


def _parse_riba_results(soup: BeautifulSoup) -> list[dict]:
    architects: list[dict] = []
    cards = soup.select(
        "article.practice-card, div.find-architect__result, li.search-result, "
        "div[class*='architect'], div[class*='practice']"
    )
    for card in cards:
        name = _text(card, "h2, h3, .practice-name, [class*='name']")
        address = _text(card, ".address, [class*='address'], [class*='location']")
        specialisms = _text(card, ".specialisms, [class*='specialism'], [class*='service']")
        contact_href = card.select_one("a[href*='mailto'], a[href*='@']")
        email = ""
        if contact_href:
            href = contact_href.get("href", "")
            if "mailto:" in href:
                email = href.replace("mailto:", "").split("?")[0].strip()
        phone = _text(card, "[class*='phone'], [class*='tel']")
        profile_link = card.select_one("a[href*='/find-an-architect/'], a.practice-card__link")
        profile_url = urljoin(RIBA_BASE, profile_link["href"]) if profile_link else ""

        if name:
            architects.append({
                "name": name,
                "address": address,
                "specialisms": specialisms,
                "contact_email": email,
                "contact_phone": phone,
                "profile_url": profile_url,
            })
    return architects


async def scrape_riba_architects() -> list[Lead]:
    leads: list[Lead] = []
    seen: set[str] = set()

    async with httpx.AsyncClient(follow_redirects=True) as client:
        for area in TARGET_BOROUGH_RIBA_SEARCHES:
            logger.info("RIBA Architect Finder: area=%s", area)
            architects = await _scrape_riba_area(client, area)

            for arch in architects:
                name = arch.get("name", "")
                if not name or name in seen:
                    continue
                seen.add(name)

                address = arch.get("address", "") or area + ", London"
                specialisms = arch.get("specialisms", "")
                email = arch.get("contact_email") or None
                phone = arch.get("contact_phone") or None

                description = f"Architecture practice: {name}."
                if specialisms:
                    description += f" Specialisms: {specialisms}."
                if arch.get("profile_url"):
                    description += f" Profile: {arch['profile_url']}"

                leads.append(Lead(
                    source="architect_developer",
                    lead_type="architect",
                    name=name,
                    address=address,
                    borough=area,
                    contact_email=email,
                    contact_phone=phone,
                    description=description,
                    notes=f"RIBA Architect Finder | area={area}",
                ))

    logger.info("RIBA architects: %d leads", len(leads))
    return leads


# ── Helpers ───────────────────────────────────────────────────────────────────

def _text(tag: BeautifulSoup, selector: str) -> str:
    el = tag.select_one(selector)
    return el.get_text(" ", strip=True) if el else ""


# ── Public entry point ────────────────────────────────────────────────────────

async def scrape_architects_developers() -> list[Lead]:
    """Fetch and return raw (unscored) leads from RIBA and Companies House."""
    api_key = os.getenv("COMPANIES_HOUSE_API_KEY", "")
    leads: list[Lead] = []

    tasks = [scrape_riba_architects()]
    if api_key:
        tasks.append(scrape_companies_house(api_key))
    else:
        logger.warning("COMPANIES_HOUSE_API_KEY not set — skipping Companies House scrape")

    results = await asyncio.gather(*tasks, return_exceptions=True)
    for r in results:
        if isinstance(r, Exception):
            logger.warning("Architect/developer scraper error: %s", r)
        else:
            leads.extend(r)

    logger.info("Architects/developers total: %d leads", len(leads))
    return leads
