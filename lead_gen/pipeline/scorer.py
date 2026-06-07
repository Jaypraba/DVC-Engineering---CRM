"""
Lead scoring model.

Each lead is scored 1–10 using four additive components:

  source_base   = base score by data source
  recency_delta = bonus/penalty by how recently the lead was identified
  keyword_delta = bonus by keyword match strength in description
  location_delta = bonus/penalty by London zone proximity

HOT threshold: score >= 7
"""

from __future__ import annotations

import logging
import re
from datetime import date, datetime
from typing import Optional

from lead_gen.models import Lead

logger = logging.getLogger(__name__)

# ── Scoring constants ─────────────────────────────────────────────────────────

SOURCE_BASE: dict[str, float] = {
    "planning_portal":     9.0,
    "job_board":           8.0,
    "architect_developer": 7.0,
    "sold_property":       6.0,
}

EXACT_KEYWORDS = [
    "loft conversion", "rear extension", "load-bearing wall", "load bearing wall",
    "steel beam", "rsj", "structural survey", "side extension", "outbuilding",
    "garage conversion", "structural engineer", "hip to gable", "mansard",
    "dormer", "basement conversion", "storey addition",
]

PARTIAL_KEYWORDS = [
    "extension", "loft", "conversion", "demolition", "structural",
    "outbuilding", "addition", "excavation", "underpinning",
]

# London postcode prefixes by zone proximity
# Zone 1-3 ~= central/inner London, Zone 4-6 ~= outer London
ZONE_INNER = {
    "EC", "WC", "W1", "W2", "W8", "SW1", "SW3", "SW5", "SW7",
    "SW10", "SE1", "E1", "N1", "NW1", "NW3",
}
ZONE_MID = {
    "SW4", "SW6", "SW8", "SW9", "SW11", "SW12", "SW15", "SW17", "SW18",
    "SE5", "SE8", "SE10", "SE11", "SE15", "SE16", "SE17",
    "E2", "E3", "E8", "E9", "E14",
    "N4", "N5", "N7", "N16",
    "W6", "W14", "W12",
    "NW5", "NW6",
}
ZONE_OUTER_LONDON = {
    "BR", "DA", "SE6", "SE9", "SE12", "SE13", "SE20", "SE23", "SE25",
    "SE26", "SE27", "SE28",
}

HOT_THRESHOLD = 7.0


# ── Helpers ───────────────────────────────────────────────────────────────────

def _parse_date(raw: Optional[str]) -> Optional[date]:
    if not raw:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d %b %Y", "%d %B %Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(raw[:10], fmt).date()
        except ValueError:
            continue
    return None


def _recency_delta(raw_date: Optional[str], date_identified: Optional[str]) -> float:
    reference = _parse_date(raw_date) or _parse_date(date_identified)
    if reference is None:
        return 0.0
    age_days = (date.today() - reference).days
    if age_days <= 14:
        return 2.0
    if age_days <= 30:
        return 1.0
    if age_days <= 60:
        return 0.0
    if age_days <= 90:
        return -1.0
    return -2.0


def _keyword_delta(description: str) -> float:
    text = description.lower()
    for kw in EXACT_KEYWORDS:
        if kw in text:
            return 2.0
    for kw in PARTIAL_KEYWORDS:
        if kw in text:
            return 1.0
    return 0.0


def _postcode_prefix(postcode: Optional[str]) -> str:
    if not postcode:
        return ""
    pc = postcode.upper().replace(" ", "")
    # Extract letter+digit prefix (e.g. SW11 → SW11, E1 → E1)
    m = re.match(r"^([A-Z]{1,2}\d{1,2})", pc)
    return m.group(1) if m else pc[:2]


def _location_delta(postcode: Optional[str], borough: Optional[str]) -> float:
    prefix = _postcode_prefix(postcode)

    # Check inner zones first (longest prefix match)
    for zone_set in (ZONE_INNER, ZONE_MID, ZONE_OUTER_LONDON):
        for zone_prefix in sorted(zone_set, key=len, reverse=True):
            if prefix.startswith(zone_prefix):
                if zone_set is ZONE_INNER:
                    return 1.0
                if zone_set is ZONE_MID:
                    return 1.0   # still Zone 2-3
                return 0.0       # Zone 4-6

    # Borough-based fallback when postcode is unavailable
    if borough:
        inner_boroughs = {"Islington", "Hackney", "Tower Hamlets", "Southwark", "Lambeth"}
        mid_boroughs = {
            "Wandsworth", "Hammersmith & Fulham", "Lewisham", "Greenwich",
        }
        if borough in inner_boroughs:
            return 1.0
        if borough in mid_boroughs:
            return 1.0
        return 0.0  # Bexley, Bromley → Zone 4-6

    return 0.0


def _outside_m25(postcode: Optional[str], borough: Optional[str]) -> bool:
    """Heuristic: flag leads that are clearly outside the M25."""
    if postcode:
        pc = postcode.upper().replace(" ", "")
        london_prefixes = (
            "E", "EC", "N", "NW", "SE", "SW", "W", "WC",
            "BR", "CR", "DA", "EN", "HA", "IG", "KT",
            "RM", "SM", "TW", "UB", "WD",
        )
        if any(pc.startswith(p) for p in london_prefixes):
            return False
        return True
    return False


# ── Scorer ────────────────────────────────────────────────────────────────────

def score_lead(lead: Lead) -> Lead:
    """
    Score a single lead in-place and set priority_flag.
    Returns the modified lead.
    """
    base = SOURCE_BASE.get(lead.source, 5.0)
    recency = _recency_delta(lead.raw_date, lead.date_identified)
    keyword = _keyword_delta(lead.description)
    location = _location_delta(lead.postcode, lead.borough)

    if _outside_m25(lead.postcode, lead.borough):
        location = -1.0

    raw_score = base + recency + keyword + location
    # Clamp to 1–10
    lead.score = round(max(1.0, min(10.0, raw_score)), 1)

    if lead.score >= HOT_THRESHOLD:
        lead.priority_flag = "HOT"
    elif lead.score >= 5.0:
        lead.priority_flag = "WARM"
    else:
        lead.priority_flag = "COLD"

    logger.debug(
        "Scored %s [%s]: base=%.1f rec=%.1f kw=%.1f loc=%.1f → %.1f %s",
        lead.address[:40],
        lead.source,
        base, recency, keyword, location,
        lead.score,
        lead.priority_flag,
    )
    return lead


def score_all(leads: list[Lead]) -> list[Lead]:
    """Score every lead and return sorted by score descending."""
    scored = [score_lead(lead) for lead in leads]
    scored.sort(key=lambda l: l.score, reverse=True)
    logger.info(
        "Scoring complete: %d HOT, %d WARM, %d COLD",
        sum(1 for l in scored if l.priority_flag == "HOT"),
        sum(1 for l in scored if l.priority_flag == "WARM"),
        sum(1 for l in scored if l.priority_flag == "COLD"),
    )
    return scored
