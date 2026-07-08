import os
import resend
from datetime import date


def send_digest(leads: list[dict]) -> None:
    api_key = os.environ.get("RESEND_API_KEY")
    to_addr = os.environ.get("LEAD_EMAIL_TO")
    from_addr = os.environ.get("LEAD_EMAIL_FROM", "leads@dvceng.com")

    if not api_key or not to_addr:
        print("[notify] RESEND_API_KEY / LEAD_EMAIL_TO not set, skipping email.")
        return

    resend.api_key = api_key

    if not leads:
        subject = f"DVC Lead Scan, {date.today():%d %B %Y}: no new leads"
        body = "<p>No new qualifying leads today. The scraper ran successfully.</p>"
    else:
        subject = f"DVC Lead Scan, {date.today():%d %B %Y}: {len(leads)} new lead(s)"
        rows = "".join(
            f"""
            <tr style="border-bottom:1px solid #e5e5e5;">
              <td style="padding:8px;font-family:sans-serif;font-size:13px;">{lead['score']}</td>
              <td style="padding:8px;font-family:sans-serif;font-size:13px;">{lead['source']}</td>
              <td style="padding:8px;font-family:sans-serif;font-size:13px;">
                <a href="{lead['url']}">{lead['title']}</a>
              </td>
              <td style="padding:8px;font-family:sans-serif;font-size:13px;">{lead.get('location', '')}</td>
            </tr>
            """
            for lead in leads
        )
        body = f"""
        <table style="border-collapse:collapse;width:100%;">
          <thead>
            <tr style="background:#0A1628;color:#F6F4EF;">
              <th style="padding:8px;text-align:left;">Score</th>
              <th style="padding:8px;text-align:left;">Source</th>
              <th style="padding:8px;text-align:left;">Lead</th>
              <th style="padding:8px;text-align:left;">Location</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        """

    resend.Emails.send({
        "from": from_addr,
        "to": to_addr,
        "subject": subject,
        "html": body,
    })
