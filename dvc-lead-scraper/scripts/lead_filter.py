"""
Scores raw leads so the daily digest surfaces the strongest opportunities
first. Threshold below which a lead is dropped entirely is set in
SCORE_THRESHOLD.
"""

SOURCE_WEIGHT = {
    "planning_portal": 5,   # strongest signal: a live application, homeowner already committed
    "contracts_finder": 4,  # real budget, real scope, but competitive
    "social_monitor": 2,    # early signal, often needs qualifying
}

HIGH_VALUE_KEYWORDS = [
    "loft conversion", "basement", "wrap around extension",
    "load bearing wall", "structural alterations", "double storey",
]

SCORE_THRESHOLD = 3


def score_lead(lead: dict) -> int:
    score = SOURCE_WEIGHT.get(lead["source"], 1)

    matched = lead.get("keywords_matched", [])
    if any(kw in " ".join(matched).lower() for kw in HIGH_VALUE_KEYWORDS):
        score += 2

    if lead.get("postcode"):
        score += 1

    return score


def filter_and_score(leads: list[dict]) -> list[dict]:
    scored = []
    for lead in leads:
        lead["score"] = score_lead(lead)
        if lead["score"] >= SCORE_THRESHOLD:
            scored.append(lead)

    scored.sort(key=lambda l: l["score"], reverse=True)
    return scored
