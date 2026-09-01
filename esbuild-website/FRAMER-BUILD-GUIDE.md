# Building the ES Build site in Framer

Everything in this folder is designed to transfer into Framer without
re-designing anything. This guide gives you the exact styles, page paths, CMS
schemas and components to create.

Work in this order: **Styles → Components → CMS → Pages → Embeds → SEO.**

---

## 1. Fonts

| Role | Font | Weights |
| --- | --- | --- |
| Headings | **Inter Tight** | 500, 600, 700 |
| Body | **Inter** | 400, 500, 600 |

Both are available in Framer's built-in Google Fonts picker — no upload needed.

---

## 2. Colour styles

Create these as **Colour Styles** in Framer (Assets → Colour). The names match
the CSS variables in `assets/css/site.css`, so you can cross-reference at any time.

| Framer style name | Hex | Used for |
| --- | --- | --- |
| `Navy` | `#033072` | Primary brand, buttons, links, logo |
| `Navy 700` | `#052A5E` | Button hover |
| `Navy 800` | `#041F47` | Hero gradient start |
| `Navy 900` | `#03152F` | Dark sections, footer, hero gradient end |
| `Navy Tint` | `#EAF0F9` | Icon chips, ghost-button hover |
| `Ink` | `#0E141C` | Headings |
| `Body` | `#3D4650` | Body copy |
| `Muted` | `#667283` | Secondary copy, captions |
| `Line` | `#E1E7EF` | Borders, dividers |
| `Line Strong` | `#C9D3E0` | Input borders, step numerals |
| `Sand` | `#F5F7FA` | Alternating section background |
| `White` | `#FFFFFF` | Page background |
| `Accent Light` | `#86A9E2` | Eyebrows on dark sections |

`Navy` is sampled directly from the supplied logo artwork.

---

## 3. Text styles

Framer sizes do not clamp the way CSS does, so set the desktop value and use
Framer's breakpoint overrides for tablet/phone.

| Style | Font | Desktop | Tablet | Phone | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- | --- |
| `H1` | Inter Tight 600 | 66px | 48px | 38px | 1.03 | −3.5% |
| `H2` | Inter Tight 600 | 48px | 38px | 31px | 1.1 | −2.5% |
| `H3` | Inter Tight 600 | 22px | 21px | 20px | 1.25 | −1.5% |
| `Lead` | Inter 400 | 20px | 19px | 18px | 1.6 | 0 |
| `Body` | Inter 400 | 17px | 17px | 16px | 1.65 | 0 |
| `Small` | Inter 400 | 15px | 15px | 15px | 1.6 | 0 |
| `Eyebrow` | Inter Tight 600 | 13px | 13px | 12px | 1.4 | +14%, uppercase |
| `Button` | Inter Tight 600 | 15px | 15px | 15px | 1.2 | −0.5% |

**Eyebrow** is always preceded by a 28 × 2px rule in `Navy` (or `Accent Light` on
dark sections), with 11px of space between rule and text.

---

## 4. Layout

| Token | Value |
| --- | --- |
| Content max width | **1200px** |
| Side padding | 48px desktop / 32px tablet / 20px phone |
| Section padding (vertical) | 128px desktop / 96px tablet / 72px phone |
| Grid gap | 32px desktop / 24px tablet / 20px phone |
| Corner radius | 4px (buttons, inputs) · 8px (cards) |

**Breakpoints:** Desktop 1200, Tablet 810, Phone 390. The nav switches to the
menu overlay at **1040px** — set that as an extra breakpoint on the nav component
if you want to match exactly.

Sections alternate `White` → `Sand` → `Navy 900` down the page. That rhythm is
what makes the homepage read as structured rather than as one long scroll — keep it.

---

## 5. Components to build

Build these as Framer components so every page stays consistent.

### `Navigation`
Sticky, `White` background, 1px `Line` bottom border, 76px tall.
Logo lockup (40px tall) left · links right · `Request a Quotation` primary button.
"Services" is a dropdown containing the six service pages.
Below 1040px: hamburger opens a full-screen overlay (see `mobile-nav` behaviour in
`assets/js/site.js` — Framer's Menu overlay does this natively).

> **Note:** in the HTML build, `backdrop-filter` on the header had to be disabled
> below 1040px because it creates a containing block that collapses the fixed
> menu panel. Framer's Menu overlay avoids this, but if you add a blurred header,
> test the mobile menu.

### `Footer`
`Navy 900`. Four columns: brand + description · Services · Company · Contact.
The stacked logo is the navy artwork with a **white** tint applied (Framer:
Image → Tint). Below it: company registration details, then a bottom bar with
copyright and legal links.

### `ServiceCard`
`White`, 1px `Line`, 8px radius, 32px padding. Contents top to bottom:
40 × 40 icon chip (`Navy Tint` background, `Navy` icon, 4px radius) · `H3` title ·
`Body` copy in `Muted` · arrow link pinned to the bottom.
Hover: border → `Line Strong`, shadow `0 12px 32px -12px rgba(3,21,47,.18)`,
lift 2px.
Add a **Wide** variant (row layout, spans the full grid width) — used for
"General Building Works" as the seventh card so the 3-column grid ends cleanly.

### `ReasonRow`
For the dark "Why choose ES Build?" section. A 3-column bordered grid with **no
card backgrounds** — 1px `rgba(255,255,255,.14)` dividers only. Each cell:
two-digit numeral in `Accent Light` · `H3` in white · body copy at 72% white.

### `ProcessStep`
Two columns: `01`–`06` numeral (34px, `Line Strong`) and the step text.
1px `Line` divider between steps.

### `FAQItem`
Framer variant component, Collapsed / Expanded. Question in `H3`, chevron right,
1px `Line` divider, answer in `Muted`.

### `CTABand`
`Navy` background with the chevron texture. Heading + supporting line left,
two buttons right (`White` primary, outlined-white secondary). Stacks on mobile.

### `ProjectCard`
4:3 image · category label in `Navy` uppercase 13px · `H3` title · `Muted` summary.

---

## 6. The chevron texture

The dark sections carry a repeating chevron that echoes the logo mark. Recreate it
in Framer as a **Graphic layer** (or a tiling background image) set to
`rgba(255,255,255,0.028)`, tile size 260 × 150px:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="150" viewBox="0 0 260 150">
  <path d="M0 96 L130 18 L260 96 L260 128 L130 50 L0 128 Z" fill="#ffffff" fill-opacity="0.028"/>
</svg>
```

The hero also carries the logo mark as a large watermark on the right: white tint,
6% opacity, ~44% of the section width, hidden below 1000px.

---

## 6b. Illustrations and photography

`assets/img/illustrations/` holds seven SVG architectural drawings in the brand
navy. Upload them to Framer's asset library and place them exactly as the HTML
build does — service page scope sections, the six project-category cards, and the
coverage banner. They import as SVG and stay crisp at any size.

Their visual language is worth preserving if you redraw anything: **thin outline =
existing building, solid navy = the new construction**.

**When real photography arrives**, swap the image inside each component — the
layouts are already sized for it (4:3 for cards and figures, 4:1 for the coverage
banner, wide landscape for the hero). In Framer, set the homepage hero photo as a
section background with a `Navy 900` overlay at roughly 70% so the headline keeps
its contrast.

Keep the "Project category" label on the grid cards until individual case studies
with real photography exist — the cards describe types of work, not completed jobs.

---

## 7. CMS collections

Three collections cover the whole site.

### `Projects` → `/projects/:slug`
This schema comes straight from the brief's "for each project, include" list.

| Field | Type |
| --- | --- |
| Title | Text |
| Slug | Slug |
| Category | Option — Extensions · Loft conversions · Full refurbishments · Kitchens and bathrooms · Structural alterations · Commercial projects |
| Project location | Text |
| Type of property | Text |
| Client brief | Rich text |
| Scope of work | Rich text |
| Key challenges | Rich text |
| ES Build's solution | Rich text |
| Programme duration | Text |
| Before photographs | Image (multiple) |
| After photographs | Image (multiple) |
| Client testimonial | Rich text (optional) |
| Testimonial attribution | Text (optional) |
| Featured on homepage | Boolean |

`project-template.html` is the layout for this collection page.

### `Services` → `/services/:slug`
| Field | Type |
| --- | --- |
| Title, Slug, Short description | Text / Slug / Text |
| Hero heading, Hero lead | Text |
| Intro | Rich text |
| Scope items | List of Text |
| Closing note | Rich text |
| CTA label | Text |
| Icon | Option (matches the seven card icons) |
| SEO title, SEO description | Text |

Optional — the six service pages are stable enough to build as static pages. Use
the CMS if ES Build expects to add services later.

### `FAQs`
| Field | Type |
| --- | --- |
| Question | Text |
| Answer | Rich text |
| Order | Number |
| Published | Boolean |

Keep "Are you insured?" **unpublished** until cover is confirmed.

---

## 8. Pages and paths

| Page | Path |
| --- | --- |
| Homepage | `/` |
| About Us | `/about` |
| House Extensions | `/services/house-extensions` |
| Loft Conversions | `/services/loft-conversions` |
| Property Refurbishments | `/services/refurbishments` |
| Kitchens and Bathrooms | `/services/kitchens-and-bathrooms` |
| Structural Alterations | `/services/structural-alterations` |
| Commercial Construction | `/services/commercial` |
| Projects | `/projects` |
| Project detail | `/projects/:slug` |
| Areas We Cover | `/areas-we-cover` |
| FAQs | `/faqs` |
| Contact | `/contact` |
| Privacy Policy | `/privacy-policy` |

**Homepage section order** — this is the sequence that makes the argument, so keep
it: Hero → marker strip → Introduction → Services → Why choose ES Build →
Selected Projects → Our Process → Coverage → CTA → Checkatrade → Footer.

---

## 9. The Checkatrade widget in Framer

Add it **once per page**, in a section directly above the footer.

1. Insert an **Embed** component where the widget should appear.
2. Choose **HTML** and paste:

```html
<script>window._checkatradeConfig = {"companyId":469672,"uniqueName":"ESBuild","theme":"red"};</script>
<script src="https://www.checkatrade.com/static/js/widget.js"></script>
```

The config object must come **before** the widget script — the widget reads
`window._checkatradeConfig` on load.

Simplest approach: put the Embed inside a `ReviewBand` component (`Sand`
background, "Verified reviews" eyebrow, widget centred, max width 760px) and drop
that component above the footer on every page. Alternatively add the scripts once
in **Project Settings → General → Custom Code → End of `<body>`**, and place only
the container div per page.

The widget renders inside an iframe, so it will not inherit your styles — give it
room and don't wrap it in anything that clips overflow.

---

## 10. Contact form

Rebuild with Framer's **Form** component so submissions are captured natively.
Fields, matching the brief:

| Field | Type | Required |
| --- | --- | --- |
| Your name | Text | Yes |
| Email address | Email | Yes |
| Telephone | Phone | No |
| Property address or postcode | Text | Yes |
| Type of project | Select (7 services + General building works + Something else) | No |
| Description of the proposed work | Textarea | Yes |
| Anticipated budget | Text | No |
| Preferred start date | Text | No |
| Drawings / photographs / approvals | Select | No |
| Consent | Checkbox linking to `/privacy-policy` | Yes |

Submit button: `Submit Your Enquiry`.
Route submissions to the ES Build enquiry inbox, and note on the form that
drawings and photographs can follow by email.

---

## 11. SEO

Set per page in Framer (Page → Settings → SEO).

**Homepage**
- Title: `ES Build | Construction Company in London and the South East`
- Description: `ES Build delivers house extensions, loft conversions, refurbishments, structural alterations and commercial construction across London and the South East.`

Every other page's title and description are already written — copy them from the
`<title>` and `<meta name="description">` tags of the matching HTML file.

Also worth doing:
- Set the social share image (the stacked logo works until project photography exists).
- Add the `GeneralContractor` structured data from the bottom of `index.html`
  via Custom Code, and let Framer generate `FAQPage` data from the FAQ section.
- Framer generates `sitemap.xml` and `robots.txt` automatically once published.

---

## 12. Straplines

The brief offers five. **"Building Better Spaces Across London and the South
East"** is used as the H1 because it carries the service and the location
together, which is what the homepage needs to rank and to orient a first-time
visitor. The others work well as section headings or campaign lines:

1. Built with Purpose. Delivered with Care.
2. Quality Construction. Clear Accountability.
3. Building Better Spaces Across London and the South East. *(used as H1)*
4. Your Property. Properly Built.
5. Reliable Construction from Start to Finish.
