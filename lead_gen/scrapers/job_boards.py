"""
Job board monitor for structural engineering and related trade jobs.

Sources:
  - Checkatrade job enquiries listing
  - Rated People job listing pages
  - MyBuilder job listing (bonus source)

All scraping respects robots.txt and applies a minimum REQUEST_DELAY between
requests per domain.
"""

from __future__ import annotations

import asyncio
import logging
import re
from datetime import date, timedelta
from typing import Optional
from urllib.parse import urljoin
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup

from lead_gen.cache_manager import CacheManager
from lead_gen.models import Lead

logger = logging.getLogger(__name__)

REQUEST_DELAY = 2.5  # seconds between requests to each domain
USER_AGENT = "DVCLeadBot/1.0 (structural engineering research; contact jesan@dvceng.com)"

TARGET_CATEGORIES = [
    "structural surveys",
    "steel beam installation",
    "loft conversion",
    "extension builds",
    "load-bearing wall removal",
    "load bearing wall",
    "structural engineer",
    "rsj installation",
    "basement conversion",
]

TARGET_LONDON_KEYWORDS = [
    "london", "sw", "se", "e1", "e2", "n1", "n2", "w1", "w2", "ec",
    "wandsworth", "lambeth", "southwark", "hackney", "islington",
    "greenwich", "lewisham", "bromley", "bexley", "tower hamlets",
    "hammersmith", "fulham",
]

_POSTCODE_RE = re.compile(r"\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b", re.IGNORECASE)

_cache = CacheManager("job_boards")


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


def _extract_postcode(text: str) -> Optional[str]:
    m = _POSTCODE_RE.search(text)
    return m.group(1).upper().strip() if m else None


def _is_london(text: str) -> bool:
    text_lower = text.lower()
    return any(kw in text_lower for kw in TARGET_LONDON_KEYWORDS)


def _keyword_match(text: str) -> Optional[str]:
    text_lower = text.lower()
    for kw in TARGET_CATEGORIES:
        if kw in text_lower:
            return kw
    return None


def _parse_budget(text: str) -> Optional[str]:
    """Extract a budget figure like £5,000 or £10k from text."""
    patterns = [
        r"£[\d,]+(?:\.\d+)?(?:\s*k)?",
        r"\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:pounds|gbp)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(0).strip()
    return None


# ── Checkatrade ───────────────────────────────────────────────────────────────

CHECKATRADE_BASE = "https://www.checkatrade.com"

CHECKATRADE_TRADE_SLUGS = [
    "structural-engineer",
    "loft-conversion-specialist",
    "building-contractor",
    "extension-builder",
]


async def _scrape_checkatrade(client: httpx.AsyncClient) -> list[Lead]:
    leads: list[Lead] = []

    for slug in CHECKATRADE_TRADE_SLUGS:
        url = f"{CHECKATRADE_BASE}/jobs/{slug}/"
        if not _can_fetch(url):
            logger.info("robots.txt disallows: %s", url)
            continue

        cached = _cache.get(f"checkatrade:{slug}")
        if cached is not None:
            job_data = cached
        else:
            try:
                resp = await client.get(
                    url,
                    headers={"User-Agent": USER_AGENT},
                    timeout=30,
                    follow_redirects=True,
                )
                if resp.status_code == 404:
                    logger.debug("Checkatrade 404: %s", url)
                    await asyncio.sleep(REQUEST_DELAY)
                    continue
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")
                job_data = _parse_checkatrade_jobs(soup)
                _cache.set(f"checkatrade:{slug}", job_data)
            except Exception as exc:
                logger.warning("Checkatrade error for %s: %s", slug, exc)
                await asyncio.sleep(REQUEST_DELAY)
                continue

        for job in job_data:
            if not _is_london(job.get("location", "") + " " + job.get("description", "")):
                continue
            kw = _keyword_match(job.get("title", "") + " " + job.get("description", ""))
            if not kw:
                continue
            postcode = _extract_postcode(job.get("location", "") + " " + job.get("description", ""))
            budget = job.get("budget") or _parse_budget(job.get("description", ""))
            leads.append(Lead(
                source="job_board",
                lead_type=_map_category(kw),
                address=job.get("location", "London"),
                description=job.get("description", ""),
                name=None,
                postcode=postcode,
                borough=_infer_borough(job.get("location", "")),
                raw_date=job.get("posted_date", ""),
                notes=f"Checkatrade | category={slug} | budget={budget} | keyword={kw}",
            ))

        await asyncio.sleep(REQUEST_DELAY)

    return leads


def _parse_checkatrade_jobs(soup: BeautifulSoup) -> list[dict]:
    jobs: list[dict] = []
    # Checkatrade job cards — class names subject to change
    for card in soup.select("article.job-card, div[class*='JobCard'], li.job-listing"):
        title = _text(card, "[class*='title'], h2, h3")
        location = _text(card, "[class*='location'], [class*='Location']")
        desc = _text(card, "[class*='description'], [class*='Description'], p")
        posted = _text(card, "[class*='date'], [class*='Date'], time")
        budget_raw = _text(card, "[class*='budget'], [class*='Budget'], [class*='price']")
        if title or desc:
            jobs.append({
                "title": title,
                "location": location,
                "description": desc,
                "posted_date": posted,
                "budget": budget_raw,
            })
    return jobs


# ── Rated People ──────────────────────────────────────────────────────────────

RATED_PEOPLE_BASE = "https://www.ratedpeople.com"

RATED_PEOPLE_PATHS = [
    "/jobs/structural-engineer",
    "/jobs/loft-conversion",
    "/jobs/house-extension",
    "/jobs/steel-beams",
]


async def _scrape_rated_people(client: httpx.AsyncClient) -> list[Lead]:
    leads: list[Lead] = []

    for path in RATED_PEOPLE_PATHS:
        url = f"{RATED_PEOPLE_BASE}{path}"
        if not _can_fetch(url):
            logger.info("robots.txt disallows: %s", url)
            continue

        cache_key = f"ratedpeople:{path.replace('/', '_')}"
        cached = _cache.get(cache_key)
        if cached is not None:
            job_data = cached
        else:
            try:
                resp = await client.get(
                    url,
                    headers={"User-Agent": USER_AGENT},
                    timeout=30,
                    follow_redirects=True,
                )
                if resp.status_code in (403, 404):
                    logger.debug("Rated People %s: %s", resp.status_code, url)
                    await asyncio.sleep(REQUEST_DELAY)
                    continue
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")
                job_data = _parse_rated_people_jobs(soup)
                _cache.set(cache_key, job_data)
            except Exception as exc:
                logger.warning("Rated People error for %s: %s", path, exc)
                await asyncio.sleep(REQUEST_DELAY)
                continue

        for job in job_data:
            combined = (job.get("title", "") + " " + job.get("description", "") + " " + job.get("location", ""))
            if not _is_london(combined):
                continue
            kw = _keyword_match(combined)
            postcode = _extract_postcode(combined)
            budget = job.get("budget") or _parse_budget(combined)
            leads.append(Lead(
                source="job_board",
                lead_type=_map_category(kw or path.split("/")[-1]),
                address=job.get("location", "London"),
                description=job.get("description", job.get("title", "")),
                postcode=postcode,
                borough=_infer_borough(job.get("location", "")),
                raw_date=job.get("posted_date", ""),
                notes=f"RatedPeople | path={path} | budget={budget} | keyword={kw}",
            ))

        await asyncio.sleep(REQUEST_DELAY)

    return leads


def _parse_rated_people_jobs(soup: BeautifulSoup) -> list[dict]:
    jobs: list[dict] = []
    for card in soup.select(
        "div.job, article.job, li.job, div[class*='job-card'], div[class*='JobCard']"
    ):
        title = _text(card, "h2, h3, [class*='title']")
        location = _text(card, "[class*='location'], [class*='area']")
        desc = _text(card, "[class*='desc'], p")
        posted = _text(card, "time, [class*='date']")
        budget_raw = _text(card, "[class*='budget'], [class*='price'], [class*='cost']")
        if title or desc:
            jobs.append({
                "title": title,
                "location": location,
                "description": desc,
                "posted_date": posted,
                "budget": budget_raw,
            })
    return jobs


# ── MyBuilder (bonus) ─────────────────────────────────────────────────────────

MYBUILDER_BASE = "https://www.mybuilder.com"

MYBUILDER_PATHS = [
    "/jobs/structural-engineering",
    "/jobs/loft-conversions",
    "/jobs/extensions",
]


async def _scrape_mybuilder(client: httpx.AsyncClient) -> list[Lead]:
    leads: list[Lead] = []

    for path in MYBUILDER_PATHS:
        url = f"{MYBUILDER_BASE}{path}"
        if not _can_fetch(url):
            continue

        cache_key = f"mybuilder:{path.replace('/', '_')}"
        cached = _cache.get(cache_key)
        if cached is not None:
            job_data = cached
        else:
            try:
                resp = await client.get(
                    url,
                    headers={"User-Agent": USER_AGENT},
                    timeout=30,
                    follow_redirects=True,
                )
                if resp.status_code in (403, 404):
                    await asyncio.sleep(REQUEST_DELAY)
                    continue
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")
                job_data = _parse_mybuilder_jobs(soup)
                _cache.set(cache_key, job_data)
            except Exception as exc:
                logger.warning("MyBuilder error for %s: %s", path, exc)
                await asyncio.sleep(REQUEST_DELAY)
                continue

        for job in job_data:
            combined = job.get("title", "") + " " + job.get("location", "") + " " + job.get("description", "")
            if not _is_london(combined):
                continue
            kw = _keyword_match(combined)
            postcode = _extract_postcode(combined)
            leads.append(Lead(
                source="job_board",
                lead_type=_map_category(kw or "general"),
                address=job.get("location", "London"),
                description=job.get("description", job.get("title", "")),
                postcode=postcode,
                borough=_infer_borough(job.get("location", "")),
                raw_date=job.get("posted_date", ""),
                notes=f"MyBuilder | path={path} | keyword={kw}",
            ))

        await asyncio.sleep(REQUEST_DELAY)

    return leads


def _parse_mybuilder_jobs(soup: BeautifulSoup) -> list[dict]:
    jobs: list[dict] = []
    for card in soup.select("div.job-posting, article, li[class*='job']"):
        title = _text(card, "h2, h3, .job-title, [class*='title']")
        location = _text(card, "[class*='location'], [class*='area'], [class*='postcode']")
        desc = _text(card, "[class*='desc'], p.description, p")
        posted = _text(card, "time, [class*='date'], [class*='posted']")
        if title or desc:
            jobs.append({"title": title, "location": location, "description": desc, "posted_date": posted})
    return jobs


# ── Helpers ───────────────────────────────────────────────────────────────────

def _text(tag: BeautifulSoup, selector: str) -> str:
    el = tag.select_one(selector)
    return el.get_text(" ", strip=True) if el else ""


_BOROUGH_KEYWORDS: dict[str, str] = {
    "hammersmith": "Hammersmith & Fulham",
    "fulham": "Hammersmith & Fulham",
    "wandsworth": "Wandsworth",
    "balham": "Wandsworth",
    "tooting": "Wandsworth",
    "clapham": "Lambeth",
    "brixton": "Lambeth",
    "lambeth": "Lambeth",
    "bermondsey": "Southwark",
    "peckham": "Southwark",
    "southwark": "Southwark",
    "lewisham": "Lewisham",
    "catford": "Lewisham",
    "greenwich": "Greenwich",
    "eltham": "Greenwich",
    "bexley": "Bexley",
    "bromley": "Bromley",
    "beckenham": "Bromley",
    "bethnal green": "Tower Hamlets",
    "bow": "Tower Hamlets",
    "tower hamlets": "Tower Hamlets",
    "hackney": "Hackney",
    "dalston": "Hackney",
    "stoke newington": "Hackney",
    "islington": "Islington",
    "angel": "Islington",
}


def _infer_borough(location: str) -> Optional[str]:
    loc_lower = location.lower()
    for kw, borough in _BOROUGH_KEYWORDS.items():
        if kw in loc_lower:
            return borough
    return None


def _map_category(kw: str) -> str:
    mapping = {
        "structural surveys": "structural_survey",
        "steel beam installation": "steel_beam",
        "rsj installation": "steel_beam",
        "loft conversion": "loft_conversion",
        "loft-conversion": "loft_conversion",
        "extension builds": "residential_extension",
        "house-extension": "residential_extension",
        "extensions": "residential_extension",
        "load-bearing wall removal": "structural_alteration",
        "load bearing wall": "structural_alteration",
        "structural engineer": "structural_survey",
        "basement conversion": "basement_conversion",
    }
    for key, val in mapping.items():
        if key in kw.lower():
            return val
    return "general_structural"


# ── Public entry point ────────────────────────────────────────────────────────

async def scrape_job_boards() -> list[Lead]:
    """Fetch and return raw (unscored) leads from all job board sources."""
    headers = {"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"}
    leads: list[Lead] = []

    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        results = await asyncio.gather(
            _scrape_checkatrade(client),
            _scrape_rated_people(client),
            _scrape_mybuilder(client),
            return_exceptions=True,
        )

    for r in results:
        if isinstance(r, Exception):
            logger.warning("Job board scraper error: %s", r)
        else:
            leads.extend(r)

    logger.info("Job boards total: %d leads", len(leads))
    return leads
