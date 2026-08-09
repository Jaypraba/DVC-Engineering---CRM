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

## Second open risk: identical no-JS body content on every route

The static fallback inside `<div id="root">` in `index.html` is homepage-specific, and the
same shell is served for all ~85 routes. Any crawler that does not execute JavaScript sees
identical body content on every URL. Base44's July 2026 crawler prerendering should replace
this with per-route content, but that could not be verified without access to the live site.
If, after the canonical fix is live, pages are crawled but reported as duplicates, per-route
prerendered content is the next thing to address.

## Honest limit

Google indexing cannot be forced programmatically. The Indexing API only supports
`JobPosting` and `BroadcastEvent`; there is no public API that pushes ordinary pages into
the index, and "Request indexing" is a manual Search Console UI action.

What is achievable is removing every technical blocker and confirming via URL Inspection
that Google reports the pages as fetchable, indexable and canonically correct. Index
inclusion then follows on Google's own schedule — typically days to a few weeks for a new
domain.

---

# Correction (2026-08-09) — the reported blockers were a false positive

## What was wrong with the earlier diagnosis

The 2026-08-08 entry above reported that Googlebot could not fetch the domain, based on
`seoDiagnostics` flagging robots.txt disallow + noindex + fetch failure on all 10 sampled
URLs. **That was a bug in `buildDiagnosis`, not a real condition.**

Google returns `ROBOTS_TXT_STATE_UNSPECIFIED`, `INDEXING_STATE_UNSPECIFIED` and an empty
`pageFetchState` for any URL it has *never crawled*. The original logic treated anything
that was not `ALLOWED` / `INDEXING_ALLOWED` / `SUCCESSFUL` as a failure, so silence was
reported as refusal. Every sampled URL actually had
`coverageState: "URL is unknown to Google"` and `verdict: NEUTRAL` — undiscovered, not
blocked.

Fixed by an `isUnprocessed()` guard in `base44/functions/seoDiagnostics/entry.ts`, applied
in both `summariseInspection()` and `buildDiagnosis()`.

## What a live origin probe actually found

Probed from Base44's network with both browser and Googlebot user-agents:

- **robots.txt** — HTTP 200, `text/plain`, correct content (`Allow: /`, only `/admin`
  disallowed). `disallowsEverything: false`. **Not blocking.**
- **X-Robots-Tag** — absent on every response. **No hosting-layer noindex.**
- **Googlebot vs browser** — identical responses, `statusDiffers: false`. **No cloaking or
  bot-blocking.**
- **Redirect direction** — `www.heystructure.com` → 301 → `heystructure.com`. The apex
  serves; the www form redirects. This is the reverse of the usual convention and, more
  importantly, the reverse of what the rest of the site assumes.

## The two real problems

### 1. The published frontend is Base44's default scaffold, not this codebase

The HTML actually served differs from `index.html` in the repo:

| Element | Repo | Served live |
|---|---|---|
| `<title>` | `Structural Engineers London & UK \| Hey Structure` | `Hey Structure` |
| description | `Building Control ready structural calculations…` | `Hey Structure manages 3 data types including leads…` (Base44 boilerplate) |
| canonical | `https://www.heystructure.com/` | absent |
| JSON-LD | ProfessionalService + WebSite + FAQPage | absent |
| no-JS fallback | full static content block | absent |

Backend functions deploy independently of the frontend build, which is why
`seoDiagnostics` runs correctly while the served HTML is still the scaffold. The frontend
has not been published. Until it is, Google would find a generic page with no canonical
and no structured data even once it does crawl.

### 2. Host inconsistency

The server redirects www → apex, but the repo canonical, the JSON-LD `@id`s, `og:url`, and
`public/sitemap.xml` all use www, while the live platform-managed sitemap uses the apex.
`index.html` now derives the canonical from `window.location.origin` (falling back to the
production origin on non-heystructure.com hosts), so it stays correct whichever direction
the redirect ends up pointing. The remaining decision is which host is canonical, and then
aligning the sitemap and JSON-LD to it.

## Why the site is not indexed

Not a block. Google has never crawled it. The domain is new, the sitemap submission was
only accepted on 2026-08-06 (acceptance is not the same as being fetched), and there are
few or no inbound links. Publishing the frontend and settling the host are what make the
crawl worth something when it happens.

Committed as `3a245c98a16b8f36b774c4390afbf2606b062c9f`.
