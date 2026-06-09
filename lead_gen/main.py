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

LOG_FILE = Path(__file__).parent.parent / "leads_log.txt"
ALL_SOURCES = ["planning", "job_boards", "sold_properties", "architects"]

# Hard cap per scraper — pipeline won't hang even if a source is completely unresponsive
SOURCE_TIMEOUT_SECONDS = 120  # 2 minutes per source — all 4 run in parallel so total ≤ 2 min


def _setup_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    fmt = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    handlers: list[logging.Handler] = [
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
    ]
    logging.basicConfig(level=level, format=fmt, handlers=handlers)


async def _run_with_timeout(name: str, coro, logger) -> list:
    """Run a scraper coroutine with a hard timeout. Returns [] on timeout/error."""
    try:
        result = await asyncio.wait_for(coro, timeout=SOURCE_TIMEOUT_SECONDS)
        logger.info("%-20s → %d leads", name, len(result))
        return result
    except asyncio.TimeoutError:
        logger.warning("%-20s → TIMED OUT after %ds", name, SOURCE_TIMEOUT_SECONDS)
        return []
    except Exception as exc:
        logger.error("%-20s → ERROR: %s", name, exc)
        return []


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

    # ── 1. Run all scrapers concurrently ──────────────────────────────────────
    logger.info("Running all scrapers in parallel …")

    tasks: dict = {}
    if "planning" in sources:
        tasks["planning"] = scrape_planning_portal()
    if "job_boards" in sources:
        tasks["job_boards"] = scrape_job_boards()
    if "sold_properties" in sources:
        # sold_properties needs planning leads for cross-referencing,
        # but we run it concurrently and cross-reference in post-processing
        tasks["sold_properties"] = scrape_sold_properties()
    if "architects" in sources:
        tasks["architects"] = scrape_architects_developers()

    results = await asyncio.gather(
        *[_run_with_timeout(name, coro, logger) for name, coro in tasks.items()],
        return_exceptions=False,
    )

    all_leads = []
    for leads in results:
        all_leads.extend(leads)

    elapsed_scrape = (datetime.utcnow() - start).total_seconds()
    logger.info("Scraping complete in %.1fs — %d raw leads total", elapsed_scrape, len(all_leads))

    if not all_leads:
        logger.warning("No leads found across any source. Check connectivity and API keys.")
        # Still export empty outputs so the workflow artifact upload succeeds
        await export_all([], [])
        return

    # ── 2. Score ───────────────────────────────────────────────────────────────
    logger.info("Scoring %d leads …", len(all_leads))
    scored_leads = score_all(all_leads)
    hot_leads = [l for l in scored_leads if l.priority_flag == "HOT"]
    logger.info(
        "Scores: %d HOT | %d WARM | %d COLD",
        len(hot_leads),
        sum(1 for l in scored_leads if l.priority_flag == "WARM"),
        sum(1 for l in scored_leads if l.priority_flag == "COLD"),
    )

    # ── 3. Generate outreach drafts ────────────────────────────────────────────
    drafts = []
    if not dry_run and os.getenv("ANTHROPIC_API_KEY"):
        logger.info("Generating outreach drafts for %d HOT leads …", len(hot_leads))
        try:
            drafts = await generate_outreach_drafts(hot_leads)
        except Exception as exc:
            logger.error("Outreach generation failed: %s", exc)
    else:
        logger.info("Skipping outreach drafts (dry-run or no ANTHROPIC_API_KEY)")

    # ── 4. Export ──────────────────────────────────────────────────────────────
    logger.info("Exporting outputs …")
    try:
        paths = await export_all(scored_leads, drafts)
        for key, path in paths.items():
            logger.info("  %s → %s", key, path)
    except Exception as exc:
        logger.error("Export failed: %s", exc)

    elapsed = (datetime.utcnow() - start).total_seconds()
    logger.info("=" * 60)
    logger.info("Pipeline complete in %.1fs", elapsed)
    logger.info("HOT: %d | Total: %d | Drafts: %d", len(hot_leads), len(scored_leads), len(drafts))
    logger.info("=" * 60)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="DVC Engineering Lead Generation Pipeline")
    parser.add_argument(
        "--sources", nargs="+", choices=ALL_SOURCES, default=ALL_SOURCES, metavar="SOURCE",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--verbose", "-v", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    asyncio.run(run_pipeline(sources=args.sources, dry_run=args.dry_run, verbose=args.verbose))
