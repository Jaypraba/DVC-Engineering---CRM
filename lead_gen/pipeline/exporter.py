"""
Output exporter.

Writes:
  output/leads.json          — full structured lead data
  output/leads.csv           — flat CSV for Attio / Excel import
  output/outreach_drafts.json — HOT lead outreach emails (for human review)
  output/summary_report.md   — daily digest

Optionally pushes leads to Attio CRM and/or ClickUp.
"""

from __future__ import annotations

import csv
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

import httpx

from lead_gen.models import Lead, OutreachDraft

logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(__file__).parent.parent / "output"

CSV_FIELDS = [
    "id", "source", "lead_type", "name", "address", "postcode", "borough",
    "contact_email", "contact_phone", "description", "score", "priority_flag",
    "date_identified", "application_ref", "raw_date", "agent_name", "notes",
]


# ── File writers ─────────────────────────────────────────────────────────────

def write_leads_json(leads: list[Lead]) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / "leads.json"
    data = [l.to_dict() for l in leads]
    out.write_text(json.dumps(data, indent=2, default=str))
    logger.info("Wrote %d leads → %s", len(leads), out)
    return out


def write_leads_csv(leads: list[Lead]) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / "leads.csv"
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for lead in leads:
            row = lead.to_dict()
            # Truncate description for CSV readability
            row["description"] = (row.get("description") or "")[:300]
            writer.writerow(row)
    logger.info("Wrote %d leads → %s", len(leads), out)
    return out


def write_outreach_drafts(drafts: list[OutreachDraft]) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / "outreach_drafts.json"
    data = [d.to_dict() for d in drafts]
    out.write_text(json.dumps(data, indent=2, default=str))
    logger.info("Wrote %d outreach drafts → %s", len(drafts), out)
    return out


def write_summary_report(
    leads: list[Lead],
    drafts: list[OutreachDraft],
    run_date: Optional[str] = None,
) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / "summary_report.md"

    today = run_date or datetime.utcnow().strftime("%d %B %Y")

    # Counts by source
    by_source: dict[str, int] = {}
    for lead in leads:
        by_source[lead.source] = by_source.get(lead.source, 0) + 1

    hot_leads = [l for l in leads if l.priority_flag == "HOT"]
    warm_leads = [l for l in leads if l.priority_flag == "WARM"]

    architects = [l for l in leads if l.lead_type == "architect"]
    developers = [l for l in leads if l.lead_type == "property_developer"]

    lines = [
        f"# DVC Engineering — Lead Intelligence Report",
        f"**Date:** {today}  ",
        f"**Total leads identified:** {len(leads)}  ",
        "",
        "---",
        "",
        "## Lead Summary by Source",
        "",
        "| Source | Leads |",
        "|--------|-------|",
    ]

    source_labels = {
        "planning_portal":     "London Planning Portal",
        "job_board":           "Job Boards (Checkatrade / RatedPeople / MyBuilder)",
        "sold_property":       "Recently Sold Properties (Land Registry)",
        "architect_developer": "Architects & Developers (RIBA / Companies House)",
    }
    for source, count in sorted(by_source.items(), key=lambda x: -x[1]):
        label = source_labels.get(source, source)
        lines.append(f"| {label} | {count} |")

    lines += [
        "",
        "---",
        "",
        f"## HOT Leads ({len(hot_leads)}) — Score ≥ 7",
        "",
        "| # | Address | Borough | Score | Source | Application Ref |",
        "|---|---------|---------|-------|--------|-----------------|",
    ]

    for i, lead in enumerate(hot_leads, 1):
        ref = lead.application_ref or "—"
        lines.append(
            f"| {i} | {lead.address[:60]} | {lead.borough or '—'} | "
            f"**{lead.score}** | {lead.source} | {ref} |"
        )

    lines += [
        "",
        "---",
        "",
        f"## New Architects Identified ({len(architects)})",
        "",
    ]
    for arch in architects[:20]:  # cap to first 20 in report
        contact = arch.contact_email or arch.contact_phone or "contact not listed"
        lines.append(f"- **{arch.name or 'Unknown'}** — {arch.address} | {contact}")

    lines += [
        "",
        f"## New Property Developers Identified ({len(developers)})",
        "",
    ]
    for dev in developers[:20]:
        lines.append(
            f"- **{dev.name or 'Unknown'}** — {dev.address} "
            f"| Reg: {dev.application_ref or '—'} | Incorporated: {dev.raw_date or '—'}"
        )

    lines += [
        "",
        "---",
        "",
        "## Suggested Follow-Up Actions",
        "",
        "1. Review all HOT leads above and confirm outreach drafts in `output/outreach_drafts.json`",
        "2. Send personalised emails via `crm@dvceng.com` using the drafts as a starting point",
        "3. Add confirmed contacts to the DVC CRM (crm.dvceng.com)",
        "4. Cross-check planning application references against DVC's active project list",
        "5. Follow up on architects/developers not yet in the CRM",
        "",
        f"---",
        f"*Report generated automatically by DVC Lead Generation Pipeline on {today}.*",
        f"*Do not distribute externally — for internal use only.*",
    ]

    out.write_text("\n".join(lines))
    logger.info("Wrote summary report → %s", out)
    return out


# ── Attio CRM push ────────────────────────────────────────────────────────────

ATTIO_BASE = "https://api.attio.com/v2"


async def push_to_attio(leads: list[Lead], api_key: str) -> int:
    """Push HOT/WARM leads to Attio as Person or Company records."""
    pushed = 0
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(headers=headers, timeout=30) as client:
        for lead in leads:
            if lead.priority_flag == "COLD":
                continue

            # Attio upsert via People or Companies object
            payload = {
                "data": {
                    "values": {
                        "name": [{"value": lead.name or lead.address}],
                        "email_addresses": (
                            [{"email_address": lead.contact_email}]
                            if lead.contact_email else []
                        ),
                        "phone_numbers": (
                            [{"phone_number": lead.contact_phone}]
                            if lead.contact_phone else []
                        ),
                        "description": [{"value": lead.description[:500]}],
                    }
                }
            }

            try:
                resp = await client.put(
                    f"{ATTIO_BASE}/objects/people/records",
                    json=payload,
                )
                if resp.status_code in (200, 201):
                    pushed += 1
                else:
                    logger.warning("Attio push failed (%s): %s", resp.status_code, resp.text[:200])
            except Exception as exc:
                logger.warning("Attio error for lead %s: %s", lead.id[:8], exc)

    logger.info("Pushed %d leads to Attio", pushed)
    return pushed


# ── ClickUp push ──────────────────────────────────────────────────────────────

CLICKUP_BASE = "https://api.clickup.com/api/v2"


async def push_to_clickup(leads: list[Lead], api_key: str, list_id: str) -> int:
    """Create tasks in a ClickUp list for HOT leads."""
    pushed = 0
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
    }

    priority_map = {"HOT": 1, "WARM": 2, "COLD": 3}  # 1 = urgent in ClickUp

    async with httpx.AsyncClient(headers=headers, timeout=30) as client:
        for lead in leads:
            if lead.priority_flag == "COLD":
                continue

            desc_lines = [
                f"**Source:** {lead.source}",
                f"**Score:** {lead.score} ({lead.priority_flag})",
                f"**Borough:** {lead.borough or '—'}",
                f"**Postcode:** {lead.postcode or '—'}",
                f"**Description:** {lead.description[:400]}",
            ]
            if lead.application_ref:
                desc_lines.append(f"**Planning ref:** {lead.application_ref}")
            if lead.contact_email:
                desc_lines.append(f"**Email:** {lead.contact_email}")
            if lead.contact_phone:
                desc_lines.append(f"**Phone:** {lead.contact_phone}")

            payload = {
                "name": f"[LEAD] {lead.address[:80]}",
                "description": "\n".join(desc_lines),
                "priority": priority_map.get(lead.priority_flag, 3),
                "tags": [lead.source, lead.lead_type, lead.priority_flag.lower()],
                "due_date": None,
            }

            try:
                resp = await client.post(
                    f"{CLICKUP_BASE}/list/{list_id}/task",
                    json=payload,
                )
                if resp.status_code in (200, 201):
                    pushed += 1
                else:
                    logger.warning("ClickUp push failed (%s): %s", resp.status_code, resp.text[:200])
            except Exception as exc:
                logger.warning("ClickUp error for lead %s: %s", lead.id[:8], exc)

    logger.info("Pushed %d leads to ClickUp", pushed)
    return pushed


# ── Public entry point ────────────────────────────────────────────────────────

async def export_all(
    leads: list[Lead],
    drafts: list[OutreachDraft],
) -> dict[str, Path]:
    """Write all output files and optionally push to Attio/ClickUp."""
    paths: dict[str, Path] = {}
    paths["leads_json"] = write_leads_json(leads)
    paths["leads_csv"] = write_leads_csv(leads)
    paths["outreach_drafts"] = write_outreach_drafts(drafts)
    paths["summary_report"] = write_summary_report(leads, drafts)

    attio_key = os.getenv("ATTIO_API_KEY", "")
    if attio_key:
        await push_to_attio(leads, attio_key)

    clickup_key = os.getenv("CLICKUP_API_KEY", "")
    clickup_list = os.getenv("CLICKUP_LIST_ID", "")
    if clickup_key and clickup_list:
        await push_to_clickup(leads, clickup_key, clickup_list)
    elif clickup_key and not clickup_list:
        logger.warning("CLICKUP_API_KEY set but CLICKUP_LIST_ID missing — skipping ClickUp push")

    return paths
