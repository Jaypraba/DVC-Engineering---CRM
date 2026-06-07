#!/usr/bin/env python3
"""
DVC Engineering — Lead Generation Pipeline
Orchestrator / daily entry point.

Usage:
    python -m lead_gen.main               # run full pipeline
    python -m lead_gen.main --sources planning job_boards
    python -m lead_gen.main --dry-run     # score & export; skip Attio/ClickUp

Schedule with cron:
    0 7 * * *  cd /path/to/repo && /path/to/venv/bin/python -m lead_gen.main >> leads_log.txt 2>&1
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# Load .env from lead_gen directory or project root
_env_file = Path(__file__).parent / ".env"
if not _env_file.exists():
    _env_file = Path(__file__).parent.parent / ".env"
load_dotenv(_env_file)

from lead_gen.pipeline.exporter import export_all
from lead_gen.pipeline.outreach_writer import generate_outreach_drafts
from lead_gen.pipeline.scorer import score_all
from lead_gen.scrapers.architects_developers import scrape_architects_developers
from lead_gen.scrapers.job_boards import scrape_job_boards
from lead_gen.scrapers.planning_portal import scrape_planning_portal
from lead_gen.scrapers.sold_properties import scrape_sold_properties

# ── Logging setup ─────────────────────────────────────────────────────────────

LOG_FILE = Path(__file__).parent.parent / "leads_log.txt"

def _setup_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    fmt = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    handlers: list[logging.Handler] = [
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
    ]
    logging.basicConfig(level=level, format=fmt, handlers=handlers)


# ── Pipeline ──────────────────────────────────────────────────────────────────

ALL_SOURCES = ["planning", "job_boards", "sold_properties", "architects"]


async def run_pipeline(
    sources: list[str],
    dry_run: bool = False,
    verbose: bool = False,
) -> None:
    _setup_logging(verbose)
    logger = logging.getLogger("lead_gen.main")

    start = datetime.utcnow()
    logger.info("=" * 60)
    logger.info("DVC Engineering Lead Generation Pipeline — %s", start.strftime("%Y-%m-%d %H:%M UTC"))
    logger.info("Sources: %s | Dry-run: %s", sources, dry_run)
    logger.info("=" * 60)

    all_leads = []
    planning_leads = []

    # ── 1. Scrape ──────────────────────────────────────────────────────────────
    if "planning" in sources:
        logger.info("--- [1/4] Planning Portal Scraper ---")
        try:
            planning_leads = await scrape_planning_portal()
            all_leads.extend(planning_leads)
            logger.info("Planning portal: %d raw leads", len(planning_leads))
        except Exception as exc:
            logger.error("Planning portal scraper failed: %s", exc, exc_info=True)

    if "job_boards" in sources:
        logger.info("--- [2/4] Job Boards Scraper ---")
        try:
            job_leads = await scrape_job_boards()
            all_leads.extend(job_leads)
            logger.info("Job boards: %d raw leads", len(job_leads))
        except Exception as exc:
            logger.error("Job boards scraper failed: %s", exc, exc_info=True)

    if "sold_properties" in sources:
        logger.info("--- [3/4] Sold Properties Scraper ---")
        try:
            sold_leads = await scrape_sold_properties(planning_leads=planning_leads)
            all_leads.extend(sold_leads)
            logger.info("Sold properties: %d raw leads", len(sold_leads))
        except Exception as exc:
            logger.error("Sold properties scraper failed: %s", exc, exc_info=True)

    if "architects" in sources:
        logger.info("--- [4/4] Architects & Developers Scraper ---")
        try:
            arch_leads = await scrape_architects_developers()
            all_leads.extend(arch_leads)
            logger.info("Architects/developers: %d raw leads", len(arch_leads))
        except Exception as exc:
            logger.error("Architects scraper failed: %s", exc, exc_info=True)

    if not all_leads:
        logger.warning("No leads found across any source. Check connectivity and API keys.")
        return

    logger.info("Total raw leads: %d", len(all_leads))

    # ── 2. Score ───────────────────────────────────────────────────────────────
    logger.info("--- Scoring leads ---")
    scored_leads = score_all(all_leads)
    hot_leads = [l for l in scored_leads if l.priority_flag == "HOT"]
    logger.info(
        "Scoring complete: %d total | %d HOT | %d WARM | %d COLD",
        len(scored_leads),
        len(hot_leads),
        sum(1 for l in scored_leads if l.priority_flag == "WARM"),
        sum(1 for l in scored_leads if l.priority_flag == "COLD"),
    )

    # ── 3. Generate outreach drafts ────────────────────────────────────────────
    drafts = []
    if not dry_run:
        logger.info("--- Generating outreach drafts for %d HOT leads ---", len(hot_leads))
        try:
            drafts = await generate_outreach_drafts(hot_leads)
        except Exception as exc:
            logger.error("Outreach generation failed: %s", exc, exc_info=True)
    else:
        logger.info("Dry-run mode: skipping outreach draft generation")

    # ── 4. Export ──────────────────────────────────────────────────────────────
    logger.info("--- Exporting outputs ---")
    try:
        paths = await export_all(scored_leads, drafts)
        for key, path in paths.items():
            logger.info("  %s → %s", key, path)
    except Exception as exc:
        logger.error("Export failed: %s", exc, exc_info=True)

    elapsed = (datetime.utcnow() - start).total_seconds()
    logger.info("=" * 60)
    logger.info("Pipeline complete in %.1fs", elapsed)
    logger.info(
        "HOT leads: %d | Total: %d | Outreach drafts: %d",
        len(hot_leads), len(scored_leads), len(drafts),
    )
    logger.info("=" * 60)


# ── CLI ───────────────────────────────────────────────────────────────────────

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="DVC Engineering Lead Generation Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--sources",
        nargs="+",
        choices=ALL_SOURCES,
        default=ALL_SOURCES,
        metavar="SOURCE",
        help=f"Sources to run (default: all). Options: {ALL_SOURCES}",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Score and export but skip outreach generation and CRM pushes",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable DEBUG logging",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    asyncio.run(run_pipeline(
        sources=args.sources,
        dry_run=args.dry_run,
        verbose=args.verbose,
    ))
