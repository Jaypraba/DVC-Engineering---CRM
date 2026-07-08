import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

from sources import planning_portal, contracts_finder, social_monitor
from lead_filter import filter_and_score
from supabase_client import insert_new_leads
from notify import send_digest

TARGET_HOUR_LONDON = 15  # 3pm


def within_target_window() -> bool:
    if os.environ.get("FORCE_RUN", "").lower() == "true":
        return True
    now_london = datetime.now(ZoneInfo("Europe/London"))
    return now_london.hour == TARGET_HOUR_LONDON


def main():
    if not within_target_window():
        print("Not the 3pm UK slot on this trigger, skipping (this is expected, "
              "the other cron entry will handle it).")
        sys.exit(0)

    print(f"Running DVC lead scan at {datetime.now(ZoneInfo('Europe/London'))} (Europe/London)")

    all_leads = []
    for source in (planning_portal, contracts_finder, social_monitor):
        try:
            found = source.fetch()
            print(f"  {source.__name__.split('.')[-1]}: {len(found)} raw result(s)")
            all_leads.extend(found)
        except Exception as exc:
            print(f"  {source.__name__} failed entirely: {exc}")

    scored = filter_and_score(all_leads)
    print(f"{len(scored)} lead(s) passed the score threshold")

    new_leads = insert_new_leads(scored)
    print(f"{len(new_leads)} lead(s) were new (not already in Supabase)")

    send_digest(new_leads)
    print("Digest email sent (or skipped if not configured).")


if __name__ == "__main__":
    main()
