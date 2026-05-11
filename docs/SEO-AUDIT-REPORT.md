# DVC Engineering — SEO Audit and Implementation Report

**Date:** May 2025
**Branch:** claude/dvc-seo-audit-implementation-dL9qD
**Prepared by:** Claude Code (Anthropic)

---

## PHASE 1 — TECHNICAL AUDIT FINDINGS

### Rendering and Platform

**FINDING: Next.js 14 (server-side rendered). No Wix issue present.**

The codebase is a Next.js 14 application deployed on Vercel. This is the correct platform for SEO. Next.js renders pages server-side (SSR) or statically (SSG) by default, meaning Googlebot can crawl and index all content without requiring JavaScript execution. No platform migration is required.

Note for context: the brief mentioned a Wix JavaScript rendering risk. If there is a legacy Wix site still live at dvceng.com that predates this Next.js build, that site should be taken down once this codebase is deployed, and a 301 redirect plan should be implemented from old Wix URLs to the new URL structure.

### HTTPS

**STATUS: Vercel deploys enforce HTTPS automatically.** Confirm that dvceng.com and www.dvceng.com both resolve to HTTPS and that HTTP is redirected. This is handled by Vercel's edge network and the domain DNS configuration — no code change needed, but manual verification is required after deployment.

### Robots.txt

**ACTION TAKEN:** Created `public/robots.txt`.

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Sitemap: https://dvceng.com/sitemap.xml
```

The `/api/` routes and `/dashboard` CRM are blocked from indexing. All public marketing pages are allowed.

### Sitemap

**ACTION TAKEN:** Created `pages/sitemap.xml.js` as a Next.js server-side route that generates a dynamic XML sitemap at `https://dvceng.com/sitemap.xml`.

Sitemap covers:
- Static pages: /, /services, /locations, /blog, /contact
- 9 service pages
- 15 location pages
- 3 blog articles

Priority values assigned: homepage (1.0), service pages (0.9), location pages (0.8), blog (0.7), other (0.6).

### Meta Tags

**ACTION TAKEN:** Created `components/SEO.js` — a reusable head component implementing:
- Unique `<title>` and `<meta name="description">` on every page
- Canonical URLs on all pages
- Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- Twitter card tags
- Viewport meta tag
- JSON-LD schema injection

All pages created in this sprint have unique, keyword-targeted meta titles and descriptions. No duplicate or missing meta exists in the new page set.

### H1 Tags

**CONFIRMED:** Every page created in this sprint has exactly one H1 tag, placed prominently in the hero section.

### Internal Links

All service pages link to related services. All location pages link to relevant service pages. All blog articles link to at least two service pages and two other articles. The footer contains links to all services and eight key location pages, with a link to the full locations index.

### _document.js

**ACTION TAKEN:** Created `pages/_document.js` with:
- `lang="en-GB"` attribute on the `<html>` element
- Google Fonts preconnect and stylesheet link
- `theme-color` meta tag

### CRM Dashboard at Root URL

**CRITICAL NOTE:** The existing `pages/index.js` contains the CRM dashboard, which is served at `/`. This is not appropriate for a public marketing website. The homepage of dvceng.com should be the public marketing site.

**Required manual action:** Move the CRM to `/dashboard` (rename `pages/index.js` to `pages/dashboard.js`) and create a new `pages/index.js` as the public marketing homepage. This was not done in this sprint to avoid breaking the existing CRM without explicit authorisation. This is the highest-priority remaining SEO action.

### Image Alt Text

No images currently exist in the codebase. When images are added, all `<img>` elements must have descriptive `alt` attributes. This is flagged as a manual action item.

---

## PHASE 2 — SCHEMA MARKUP IMPLEMENTED

**File:** `components/Schema.js`

### JSON-LD Schemas Created

| Schema Type | Applied To | Status |
|---|---|---|
| LocalBusiness / ProfessionalService | Homepage, Services index, Locations index, Contact | Complete |
| Service | All 9 service pages, All 15 location pages | Complete |
| BreadcrumbList | All pages | Complete |
| FAQPage | All 9 service pages, All 3 blog articles | Complete |
| Article | All 3 blog articles | Complete |

### LocalBusiness Schema Key Data

```json
{
  "@type": ["LocalBusiness", "ProfessionalService"],
  "name": "DVC Engineering",
  "legalName": "DVC Engineering Ltd",
  "address": {
    "streetAddress": "86-90 Paul Street",
    "addressLocality": "London",
    "postalCode": "EC2A 4NE",
    "addressCountry": "GB"
  },
  "openingHours": "Mo-Fr 09:00-18:00"
}
```

**Manual action required:** Add the firm's telephone number to `components/Schema.js` (FIRM.telephone field) and add an actual logo image at `/public/images/logo.png`.

**Validation:** All schemas are valid JSON-LD and can be tested at Google's Rich Results Test (search.google.com/test/rich-results) once the site is deployed.

---

## PHASE 3 — SERVICE PAGES CREATED

All 9 service pages created at `/services/[slug]`. Each page includes:
- Unique H1 and meta title/description
- 3 keyword-rich H2 sections
- 350–600 words of body copy
- FAQ section with JSON-LD FAQPage schema
- Call to action linking to /contact
- Related services sidebar
- BreadcrumbList schema

| Page | URL | Primary Keyword | Secondary Keywords |
|---|---|---|---|
| Structural Surveys | /services/structural-surveys | structural survey London | pre-purchase structural survey, structural engineer survey London, building survey London |
| Loft Conversions | /services/loft-conversions | loft conversion structural engineer London | dormer conversion structural design, hip-to-gable loft conversion, loft conversion beam design |
| Extensions | /services/extensions | house extension structural engineer London | rear extension calculations London, side extension structural design, double-storey extension London |
| Load-bearing Wall Removal | /services/load-bearing-wall-removal | load-bearing wall removal London | RSJ beam design London, chimney breast removal structural engineer, steel beam wall opening |
| Steel and Timber Beam Design | /services/steel-beam-design | steel beam design London | RSJ calculations London, timber beam design, universal beam structural engineer |
| Foundation Design | /services/foundation-design | foundation design London | underpinning structural engineer London, London Clay foundations, foundation depth extension |
| Temporary Works | /services/temporary-works | temporary works design London | propping calculations London, shoring design, CDM 2015 temporary works |
| Building Control Coordination | /services/building-control | building control coordination London | building regulations structural engineer London, full plans application London |
| Structural Adequacy Reports | /services/structural-adequacy-reports | structural adequacy report London | structural report mortgage lender, structural engineer report for solicitor London |

---

## PHASE 4 — LOCATION PAGES CREATED

15 borough-specific location pages created at `/locations/[slug]` using Next.js static generation (getStaticPaths + getStaticProps).

**Data file:** `lib/locationData.js` — contains unique content for each borough including description, housing stock characterisation, planning context, service list, and meta data.

| Borough | URL | Region |
|---|---|---|
| Islington | /locations/islington | north London |
| Hackney | /locations/hackney | east London |
| Tower Hamlets | /locations/tower-hamlets | east London |
| Southwark | /locations/southwark | south London |
| Lambeth | /locations/lambeth | south London |
| Wandsworth | /locations/wandsworth | south-west London |
| Hammersmith and Fulham | /locations/hammersmith-and-fulham | west London |
| Kensington and Chelsea | /locations/kensington-and-chelsea | west London |
| Camden | /locations/camden | north London |
| Barnet | /locations/barnet | north London |
| Haringey | /locations/haringey | north London |
| Enfield | /locations/enfield | north London |
| Waltham Forest | /locations/waltham-forest | east London |
| Newham | /locations/newham | east London |
| Greenwich | /locations/greenwich | south-east London |

Each page contains:
- Borough name in H1 and meta title
- 3 unique paragraphs (description, housing stock, planning context): minimum 300 words each page
- Location-specific services list with links to service pages
- CTA linking to /contact
- LocalBusiness, Service, and BreadcrumbList JSON-LD schemas
- Borough-specific meta description

---

## PHASE 5 — GOOGLE BUSINESS PROFILE CONTENT

**File:** `content/gbp-content.md`

### GBP Posts (10 posts)

| # | Subject |
|---|---|
| 1 | Loft conversion structural packages |
| 2 | Load-bearing wall removal |
| 3 | Pre-purchase structural surveys |
| 4 | Extensions: foundation to roof |
| 5 | Structural adequacy reports for lenders |
| 6 | Foundation design and depth in London |
| 7 | Temporary works for London builders |
| 8 | Steel beam design for London openings |
| 9 | Building control coordination |
| 10 | Working with architects across London |

**Manual action required:** Upload each post to Google Business Profile. Posts should be added one per week to maintain profile activity. Each post is 100–150 words and references specific London locations and services.

### GBP Q&A Entries (10 entries)

Covering: structural engineer for loft conversion, cost of structural engineer London, difference between structural survey and homebuyer's report, identifying load-bearing walls, foundation depth for extensions, building regulations for wall removal, structural reports for lenders, calculation turnaround time, service area coverage, information needed for a quote.

**Manual action required:** Add each Q&A entry to the Google Business Profile Questions and Answers section.

### GBP Service Descriptions (9 descriptions)

One keyword-rich service description for each core service: structural surveys, loft conversions, extensions, load-bearing wall removal, steel and timber beam design, foundation design, temporary works, building control coordination, structural adequacy reports.

**Manual action required:** Add each description to the corresponding service in Google Business Profile.

---

## PHASE 6 — CONTENT CLUSTER

### 12-Article Content Plan

| # | Title | Primary Keyword | Status |
|---|---|---|---|
| 1 | Do I Need a Structural Engineer for a Loft Conversion? | structural engineer loft conversion | Published |
| 2 | How to Remove a Load-bearing Wall | how to remove load bearing wall London | Published |
| 3 | Structural Survey vs Homebuyer's Report | structural survey vs homebuyers report | Published |
| 4 | How Deep Do Foundations Need to Be for an Extension? | foundation depth extension London | Planned |
| 5 | Chimney Breast Removal: Structural Considerations | chimney breast removal structural engineer London | Planned |
| 6 | Party Wall Agreements and Structural Engineers | party wall structural engineer London | Planned |
| 7 | What Is an RSJ Beam and When Do You Need One? | what is an RSJ beam | Planned |
| 8 | London Clay and Your Foundations: A Homeowner's Guide | London clay foundations subsidence | Planned |
| 9 | Building Regulations for House Extensions | building regulations house extension London | Planned |
| 10 | Dormer vs Hip-to-Gable Loft Conversion: Structural Differences | dormer vs hip to gable loft conversion | Planned |
| 11 | What Happens Without Building Regulations Approval? | no building regulations approval structural works | Planned |
| 12 | Temporary Works: What They Are and When You Need a Designer | temporary works design London | Planned |

### Full Articles Published

1. **Do I Need a Structural Engineer for a Loft Conversion?** (`/blog/do-i-need-a-structural-engineer-for-a-loft-conversion`) — 850 words, covers building regulations requirement, scope by conversion type, consequences of proceeding without approval, and how to instruct an engineer.

2. **How to Remove a Load-bearing Wall** (`/blog/how-to-remove-a-load-bearing-wall`) — 950 words, covers identifying load-bearing walls, the five-step process from assessment to sign-off, common problems, and chimney breast removal as a special case.

3. **Structural Survey vs Homebuyer's Report** (`/blog/structural-survey-vs-homebuyers-report`) — 800 words, covers differences between the two products, comparison table, when to commission each, and DVC Engineering's survey service.

---

## PHASE 7 — MANUAL ACTIONS REQUIRED

The following items cannot be completed through code changes alone and require manual action:

### Priority 1: Required Before Launch

| Action | Owner | Notes |
|---|---|---|
| Move CRM from / to /dashboard | Developer | Rename pages/index.js to pages/dashboard.js and create a new public homepage at pages/index.js |
| Create public homepage at / | Developer/Copywriter | The marketing homepage should be the root URL |
| Add telephone number to Schema.js | DVC Engineering | Update FIRM.telephone in components/Schema.js |
| Verify HTTPS on dvceng.com and www | Developer | Both should resolve to HTTPS with HTTP redirect |
| Verify sitemap.xml is accessible at https://dvceng.com/sitemap.xml | Developer | Test after deployment |
| Add logo image at /public/images/logo.png | DVC Engineering | Required for LocalBusiness schema logo and Open Graph image |

### Priority 2: Google Tools

| Action | Owner | Notes |
|---|---|---|
| Submit sitemap to Google Search Console | DVC Engineering | URL: https://dvceng.com/sitemap.xml |
| Verify dvceng.com in Google Search Console | DVC Engineering | Required before requesting indexing |
| Request indexing for all new pages in Search Console | DVC Engineering | Use URL Inspection tool for each page |
| Validate schema at Rich Results Test | DVC Engineering | Test each page type: service, location, article |

### Priority 3: Google Business Profile

| Action | Owner | Notes |
|---|---|---|
| Upload 10 GBP posts (one per week) | DVC Engineering | Content in content/gbp-content.md |
| Add 10 Q&A entries to GBP | DVC Engineering | Content in content/gbp-content.md |
| Add service descriptions to GBP | DVC Engineering | 9 descriptions in content/gbp-content.md |
| Confirm GBP address and opening hours are correct | DVC Engineering | Check against Schema.js FIRM data |
| Add professional photos to GBP | DVC Engineering | Photos of office, team, and recent projects |

### Priority 4: Content

| Action | Owner | Notes |
|---|---|---|
| Add photos to service and location pages | DVC Engineering | Alt text required on all images |
| Write remaining 9 blog articles | DVC Engineering/Copywriter | Topics listed in Phase 6 content plan |
| Add testimonials/case studies | DVC Engineering | Adds authority and local keyword density |

---

## FILE INVENTORY

### New Files Created (This Sprint)

**Infrastructure:**
- `components/SEO.js` — reusable SEO head component
- `components/Layout.js` — shared header and footer for public pages
- `components/Schema.js` — JSON-LD schema generation functions
- `pages/_document.js` — custom HTML document with lang=en-GB
- `public/robots.txt` — robots configuration
- `pages/sitemap.xml.js` — dynamic sitemap generation
- `lib/locationData.js` — location page content data

**Public Pages:**
- `pages/contact.js`
- `pages/services/index.js`
- `pages/services/structural-surveys.js`
- `pages/services/loft-conversions.js`
- `pages/services/extensions.js`
- `pages/services/load-bearing-wall-removal.js`
- `pages/services/steel-beam-design.js`
- `pages/services/foundation-design.js`
- `pages/services/temporary-works.js`
- `pages/services/building-control.js`
- `pages/services/structural-adequacy-reports.js`
- `pages/locations/index.js`
- `pages/locations/[slug].js` (generates 15 static pages)
- `pages/blog/index.js`
- `pages/blog/do-i-need-a-structural-engineer-for-a-loft-conversion.js`
- `pages/blog/how-to-remove-a-load-bearing-wall.js`
- `pages/blog/structural-survey-vs-homebuyers-report.js`

**Content:**
- `content/gbp-content.md` — GBP posts, Q&A, and service descriptions

**Documentation:**
- `docs/SEO-AUDIT-REPORT.md` (this file)

### Total Pages Added to sitemap.xml

| Category | Count |
|---|---|
| Static pages (/, /services, /locations, /blog, /contact) | 5 |
| Service pages | 9 |
| Location pages | 15 |
| Blog articles | 3 |
| **Total** | **32** |

---

## NOTES ON COPYWRITING STANDARDS

All copy produced in this sprint uses:
- Oxford British English spelling (optimise, colour, organisation, recognised, etc.)
- No em dashes (commas, colons, and full stops used instead)
- No claims of chartered status or professional body membership
- Professional, commercially aware tone
- No filler phrases or marketing clichés

---

*End of report.*
