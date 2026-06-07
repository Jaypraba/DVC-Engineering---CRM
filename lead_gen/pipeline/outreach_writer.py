"""
Outreach email draft generator.

Uses the Anthropic API (claude-sonnet-4-20250514) to generate personalised,
professional cold outreach emails for every HOT lead.

Emails are never auto-sent — they are written to outreach_drafts.json
for human review.
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Optional

import anthropic

from lead_gen.models import Lead, OutreachDraft

logger = logging.getLogger(__name__)

DVC_SIGNOFF = """Kind regards,

Jesan Prabakaran
Director, DVC Engineering Ltd
86–90 Paul Street, London EC2A 4NE
E: jesan@dvceng.com | W: dvceng.com"""

SYSTEM_PROMPT = """You are writing on behalf of DVC Engineering Ltd, a structural engineering
consultancy based in London. The tone must be confident, professional, and non-pushy.
You write short, targeted cold outreach emails that are relevant to the recipient's
specific project or property. Never use generic filler phrases like "I hope this email
finds you well." Reference the specific address or project. Offer a free initial
structural consultation or fee proposal. Keep the body under 200 words."""

MODEL = "claude-sonnet-4-20250514"


def _build_prompt(lead: Lead) -> str:
    lead_context_parts = [
        f"Address: {lead.address}",
        f"Borough: {lead.borough or 'London'}",
        f"Project type: {lead.lead_type.replace('_', ' ').title()}",
        f"Description: {lead.description[:500]}",
    ]
    if lead.application_ref:
        lead_context_parts.append(f"Planning ref: {lead.application_ref}")
    if lead.name:
        lead_context_parts.append(f"Recipient name / company: {lead.name}")
    if lead.agent_name:
        lead_context_parts.append(f"Architect / agent: {lead.agent_name}")

    lead_context = "\n".join(lead_context_parts)

    recipient_greeting = f"Dear {lead.name}" if lead.name else "Dear Sir/Madam"
    if lead.lead_type == "architect":
        purpose = (
            "This is an outreach email to an architecture practice to introduce DVC Engineering "
            "as a trusted structural engineering partner for their future projects."
        )
    elif lead.source == "sold_property":
        purpose = (
            "This is an outreach email to the new owner of a recently sold property, "
            "suggesting they may benefit from a structural assessment or engineering support "
            "for any planned improvements or alterations."
        )
    elif lead.source == "job_board":
        purpose = (
            "This is an outreach email to someone who has posted a job or enquiry related "
            "to structural/building work, offering DVC Engineering's services."
        )
    else:
        purpose = (
            "This is an outreach email to a property owner who has recently received planning "
            "approval for an extension or structural alteration, offering DVC Engineering's "
            "structural engineering services."
        )

    return f"""{purpose}

Lead context:
{lead_context}

Write:
1. A subject line (prefix with "Subject: ")
2. A blank line
3. The email body starting with "{recipient_greeting},"

End the email with exactly this sign-off (do not modify it):

{DVC_SIGNOFF}"""


async def _generate_draft(
    client: anthropic.AsyncAnthropic,
    lead: Lead,
    semaphore: asyncio.Semaphore,
) -> Optional[OutreachDraft]:
    async with semaphore:
        prompt = _build_prompt(lead)
        try:
            message = await client.messages.create(
                model=MODEL,
                max_tokens=600,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = message.content[0].text.strip()
        except Exception as exc:
            logger.warning("Anthropic API error for lead %s: %s", lead.id[:8], exc)
            return None

    # Parse subject and body
    lines = raw.splitlines()
    subject = ""
    body_start = 0
    for i, line in enumerate(lines):
        if line.startswith("Subject:"):
            subject = line.replace("Subject:", "").strip()
            body_start = i + 1
            break

    # Skip leading blank lines after subject
    while body_start < len(lines) and not lines[body_start].strip():
        body_start += 1

    body = "\n".join(lines[body_start:]).strip()

    if not subject:
        subject = f"Structural Engineering Support — {lead.address}"

    return OutreachDraft(
        lead_id=lead.id,
        lead_address=lead.address,
        subject=subject,
        body=body,
        score=lead.score,
    )


async def generate_outreach_drafts(
    hot_leads: list[Lead],
    max_concurrent: int = 3,
) -> list[OutreachDraft]:
    """
    Generate outreach email drafts for all HOT leads.

    Requires ANTHROPIC_API_KEY environment variable.
    Returns a list of OutreachDraft objects (never sends emails).
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set — skipping outreach draft generation")
        return []

    if not hot_leads:
        logger.info("No HOT leads to generate outreach for")
        return []

    logger.info("Generating outreach drafts for %d HOT leads …", len(hot_leads))

    client = anthropic.AsyncAnthropic(api_key=api_key)
    semaphore = asyncio.Semaphore(max_concurrent)

    tasks = [_generate_draft(client, lead, semaphore) for lead in hot_leads]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    drafts: list[OutreachDraft] = []
    for r in results:
        if isinstance(r, Exception):
            logger.warning("Draft generation error: %s", r)
        elif r is not None:
            drafts.append(r)

    logger.info("Generated %d outreach drafts", len(drafts))
    return drafts
