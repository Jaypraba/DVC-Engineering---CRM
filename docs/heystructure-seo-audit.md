# heystructure.com — Google indexing audit (2026-08-08)

> **Scope note.** This document is about `www.heystructure.com`, which lives in the
> **Hey Structure Base44 app** (app id `6a0b8fed08f89fd51057436b`), not in this CRM
> repository. It is filed here because this is the only git remote available to the
> session that produced it, and the working container was ephemeral. The code changes
> described below were made in the Base44 app, not here.

## Problem

An extensive SEO pass was completed on 2026-08-06 (per-page meta via `useSEO`, JSON-LD
graphs, an 85-URL sitemap, AI-crawler-friendly robots.txt, sitemap submitted to Search
Console). Two days later the site still did not surface on Google.

## Root cause identified

**The homepage canonical was being served for every route.**

The site is a Vite + React SPA. `vite build` emits a single `index.html`, which the host
serves for all ~85 routes. That file hardcoded:

```html
<link rel="canonical" href="https://www.heystructure.com/" />
<meta property="og:url" content="https://www.heystructure.com/" />
```

So the HTML served for `/services/loft-conversions`, every `/structural-engineers/{city}`
and `/structural-engineers/{city}/{service}` page, and every blog article all declared
**the homepage** as their canonical URL.

`src/hooks/useSEO.js` rewrites the canonical correctly once React mounts, but a wrong
canonical present in the served HTML is a strong instruction to Google to consolidate all
85 URLs into `/` and drop the rest. This matches the observed symptom precisely: a site
whose pages get crawled but never appear.

## Changes made (in the Base44 app)

| File | Change |
|---|---|
| `index.html` | Inline script, placed **last in `<head>`** so the tags it rewrites are already parsed, that sets `canonical` and `og:url` from `window.location.pathname` at parse time — before the React bundle loads. Static values remain as the no-JS fallback. |
| `base44/functions/seoDiagnostics/entry.ts` | **New.** Google Search Console diagnostics via the existing `google_search_console` connector. |
| `src/components/admin/SeoPanel.jsx` | **New.** Admin UI rendering the diagnosis, sitemap status and per-URL inspection. |
| `src/pages/AdminDashboard.jsx` | Added an **SEO** tab wiring in `SeoPanel`. |
| `public/manifest.json` | **New.** `index.html` referenced it but it did not exist — a 404 on every page load. |
| `CHANGELOG-SEO-AI-SEARCH.md` | Documented this investigation. |

Committed in the Base44 app as `f69cecad666a51ce588d9537f8b9252f2e992dba`
(checkpoint "SEO: per-route canonical fix + Search Console diagnostics panel").

### What `seoDiagnostics` reports

- **Verified properties** — whether the connected Google account can actually see
  `sc-domain:heystructure.com`.
- **Sitemap status** — `lastDownloaded`, `errors`, `warnings`, submitted/indexed counts.
  The HTTP 204 logged on 2026-08-06 only means GSC *accepted the submission request*; it
  does not mean the file was ever fetched or parsed. `lastDownloaded` settles that.
- **URL inspection** — per-URL `verdict`, `coverageState`, `robotsTxtState`,
  `indexingState`, `pageFetchState`, `lastCrawlTime`, and critically `googleCanonical` vs
  `userCanonical`. The canonical comparison is the direct test of the root cause above.
- **Search analytics** — impressions and clicks over the last 28 days.

Findings are rolled into a plain-language `diagnosis` that separates genuine blockers
(robots disallow, noindex, fetch failure, canonical mismatch) from "new domain, not
crawled yet", which needs patience rather than code changes.

## Not verified

The changes are committed but **were not verified against the live site**. The session had
no network route to `www.heystructure.com` (egress policy) and no sandbox shell
(`run_command` required interactive approval), so:

- `npm run build` and `npm run lint` were **not run**.
- The Search Console API was **not called**; no live indexing data was read.
- The app was **not published**, so none of this is live yet.

## Remaining steps

1. **Publish the Base44 app.** Nothing above affects `www.heystructure.com` until it is
   published. Publishing also refreshes Base44's crawler prerender cache (shipped July
   2026), which is what makes Googlebot see the corrected HTML.
2. **Run Admin → SEO → Run check**, with "Resubmit sitemap" ticked on the first run.
3. **Read the diagnosis**, and act on what it shows:

   | Signal | Meaning | Action |
   |---|---|---|
   | `googleCanonical` = homepage on non-home URLs | Root cause confirmed, fix not yet recrawled | Request re-crawl; allow time |
   | `indexingState` shows noindex | A directive is blocking indexing | App sets none — trace to hosting; Base44 domain settings or support |
   | `robotsTxtState` DISALLOWED | Crawling blocked | Check the *served* robots.txt, which may be platform-managed rather than `public/robots.txt` |
   | `pageFetchState` not SUCCESSFUL | DNS/TLS/redirect fault | Fix domain config before anything else |
   | Sitemap `lastDownloaded` empty | Submitted sitemap was never read | Reconcile with the platform-managed `/sitemap.xml` and resubmit |
   | Everything clean, few URLs indexed | No technical blocker | Crawl budget and authority; needs time and links |

## Open risk: platform-managed robots.txt and sitemap.xml

Base44 generates and serves `/robots.txt` and `/sitemap.xml` itself on custom domains, and
community reports indicate the `public/` copies may not override them. If so, the
carefully authored 85-URL `public/sitemap.xml` is not what Google fetches. The
`lastDownloaded` and URL-count fields in the diagnostics output will confirm or rule this
out.

## Honest limit

Google indexing cannot be forced programmatically. The Indexing API only supports
`JobPosting` and `BroadcastEvent`; there is no public API that pushes ordinary pages into
the index, and "Request indexing" is a manual Search Console UI action.

What is achievable is removing every technical blocker and confirming via URL Inspection
that Google reports the pages as fetchable, indexable and canonically correct. Index
inclusion then follows on Google's own schedule — typically days to a few weeks for a new
domain.
