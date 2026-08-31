# 100mm — Framer build brief

Everything needed to build the 100mm site in Framer, so a session with a working
Framer connection can start building instead of re-deciding.

The coded reference implementation is in this directory. Read `lib/site.ts` for
the commercial copy, `lib/approach.ts` for the six stages, and `content/` for
the case studies and journal posts. A browsable preview of the whole site is at
https://claude.ai/code/artifact/5c6a6df8-0345-40ae-82d6-f4b3e9ffa1f9

Framer project: **Internal Guava** — `yonCGaJsHIUQNPqX3Fsm`

## The one thing that matters

100mm sells a **paid site visit**. No free consultations, no free quotations.
Every path on the site ends at booking and paying for that visit. There is no
generic enquiry form anywhere, and `/contact` deliberately routes to `/book`
instead of offering one.

The visit: an interior designer, a structural engineer and a contractor attend
together, around two hours on site, followed by a **written report within five
working days**. £950 + VAT. It does not commit the client to appointing 100mm.

## Build order

Styles first, so pages inherit them rather than carrying loose values.

1. Colour styles
2. Text styles (fonts confirmed available in Framer first)
3. CMS collections — Work, Journal
4. Pages
5. Booking CTA → Stripe Payment Link

## 1. Colour styles

| Path | Hex | Used for |
|---|---|---|
| `/Ink` | `#101010` | Text, dark bands |
| `/Ink Soft` | `#1C1C1A` | — |
| `/Paper` | `#F4F3EF` | Default ground |
| `/Paper Dim` | `#EDEBE5` | Alternating bands |
| `/Accent` | `#C4F12E` | Primary CTAs only |
| `/Accent Dim` | `#AEDA1F` | CTA hover |
| `/Grey/100` | `#E7E5DE` | |
| `/Grey/200` | `#D8D6CE` | Hairline rules |
| `/Grey/300` | `#B5B4AC` | |
| `/Grey/400` | `#8E8E86` | Muted labels |
| `/Grey/500` | `#6E6E68` | Eyebrows, secondary text |
| `/Grey/600` | `#55554F` | Body on paper |
| `/Grey/700` | `#3A3A37` | Long-form body |
| `/Grey/800` | `#252523` | |

**The green rule.** Never more than two green elements visible in one viewport.
The sticky header CTA is green on every screen, so in practice each section gets
exactly one more — its primary CTA. Use no green markers except a single one on
the home ink band, where the CTA is an outline button instead. If a screen feels
energetic rather than restrained, remove green before adding anything.

## 2. Text styles

Space Grotesk for display, Inter for reading. Nothing else.

| Path | Font | Size | Line height | Tracking |
|---|---|---|---|---|
| `/Display/XL` | Space Grotesk 500 | clamp 3.25rem–8.5rem | 0.92 | -0.04em |
| `/Display/LG` | Space Grotesk 500 | clamp 2.5rem–5.5rem | 0.95 | -0.035em |
| `/Display/MD` | Space Grotesk 500 | clamp 2rem–3.5rem | 1.0 | -0.03em |
| `/Display/SM` | Space Grotesk 500 | clamp 1.5rem–2.25rem | 1.08 | -0.025em |
| `/Body/Lede` | Inter 400 | clamp 1.125rem–1.5rem | 1.45 | -0.01em |
| `/Body/Base` | Inter 400 | 1rem | 1.6 | 0 |
| `/Body/Small` | Inter 400 | 0.875rem | 1.5 | 0 |
| `/Eyebrow` | Inter 400 | 0.75rem | 1 | 0.14em, uppercase |

Confirm both faces exist in Framer before wiring these up; substitute only with
the client's agreement.

## 3. CMS collections

Field names and types mirror the frontmatter already validated in
`lib/content.ts`, so existing content moves across without reshaping.

**Work**

| Field | Type | Notes |
|---|---|---|
| title | string | required |
| slug | string | required, unique |
| location | string | e.g. "Primrose Hill, NW3" |
| year | number | |
| value | string | a band, never an exact figure — clients are private |
| duration | string | e.g. "14 months on site" |
| summary | formattedText | |
| scope | string | comma separated, or a multi-reference if preferred |
| cover | image | |
| architect | string | optional |
| featured | boolean | drives the home page selection |
| order | number | ascending |
| body | formattedText | |

**Journal**

| Field | Type |
|---|---|
| title | string |
| slug | string |
| date | date |
| summary | formattedText |
| author | string |
| tags | string |
| body | formattedText |

Three of each already exist in `content/` as MDX. All of it is placeholder copy
written to exercise the layouts — addresses, values and dates are invented.

## 4. Pages

| Path | Purpose |
|---|---|
| `/` | Hero, the no-free-quotes proposition, the three attendees, selected work, six stages, DVC relationship, journal, FAQ, CTA |
| `/site-visit` | The conversion page. What it is, who attends, what the report includes and excludes, the five-step sequence |
| `/book` | Booking form → Stripe |
| `/book/success` | Confirmation and what happens next |
| `/work` | Collection list |
| `/work/:slug` | CMS detail page |
| `/approach` | Six stages in full, plus the fixed-fee position |
| `/studio` | The practice, the DVC Engineering relationship, what fits and what doesn't |
| `/journal` | Collection list |
| `/journal/:slug` | CMS detail page |
| `/contact` | "There is no enquiry form" → routes to `/book` |
| `/privacy`, `/terms` | Legal |

Header: sticky, wordmark left, five links, green "Book a site visit" pill right.
Gains a hairline and paper background on scroll. Burger below `lg`.

Footer: ink, "Start with the site visit" plus CTA, page list, contact, DVC.

## 5. Booking

Framer has no server route, so the Next.js `/api/checkout` handler cannot come
across. Use a **Stripe Payment Link** for £950 + VAT, collecting name, phone,
property address and postcode, project type and anticipated value as Stripe
custom fields, with the success URL pointed at `/book/success`.

The alternative — a Framer form that submits before redirecting to Stripe — gives
a fuller form but loses the details when someone abandons at the payment step.

## Motion

One effect only: a slow fade and short rise on entry, once, roughly 900ms.
No parallax, no springs, no loops. Honour reduced-motion.

## Still unconfirmed

- **The fee.** £950 + VAT is a placeholder and appears in six places.
- **Contact details.** `studio@100mm.co.uk` and `020 0000 0000` are invented.
- **Photography.** None exists yet; the coded site renders neutral plates.
- **Wordmark.** `public/wordmark.png` is a cleaned raster; a vector should replace it.
- **Legal pages.** Drafted against what the site does, including the 14-day
  distance-selling cancellation right, but not reviewed by a solicitor.
