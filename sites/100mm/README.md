# 100mm

Marketing site for 100mm, a London construction and project management practice.
Sister company to DVC Engineering Ltd.

The site exists to sell one thing: a **paid site visit**. There is no free
consultation and no free quotation anywhere in it. Every path ends at `/book`,
which takes payment through Stripe Checkout. If you are adding a page, the
question to ask is how it moves someone toward that booking.

## Stack

- Next.js 15, App Router, TypeScript
- Tailwind CSS 3.4, brand tokens in `tailwind.config.ts`
- Statically generated throughout. The only dynamic routes are the two API
  handlers (`/api/checkout`, `/api/stripe/webhook`).
- MDX content on disk with Zod-validated frontmatter (`lib/content.ts`). No CMS.
- Stripe Checkout for payment
- No component library. Everything in `components/` is written here.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in the Stripe keys
npm run dev
```

`npm run typecheck` and `npm run build` both need to pass before anything ships.

## Brand

Derived from the wordmark.

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#101010` | Text, dark bands |
| `paper` | `#F4F3EF` | Default ground |
| `paper-dim` | `#EDEBE5` | Alternating bands |
| `accent` | `#C4F12E` | Primary CTAs and hover only |
| `grey.100`–`grey.800` | — | Everything in between |

**The green rule.** Never more than two green elements visible in one viewport.
The sticky header CTA is one of them on every screen, so in practice a section
gets *one* green element — its primary CTA. There are no green markers on the
site except a single one on the home page's ink band, where the CTA is an
outline button instead. If a screen starts to feel energetic rather than
restrained, take green away before adding anything.

**Type.** Space Grotesk for headings at large sizes with tight tracking, Inter
for everything read. Both loaded through `next/font/google` in `app/layout.tsx`.
Sizes live in `tailwind.config.ts` as `display-xl` through `display-sm`.

**Motion.** One effect: a slow fade and short rise on entry, once, via
`components/ui/Reveal.tsx`. Nothing springs, nothing parallaxes, nothing loops.
`prefers-reduced-motion` is honoured everywhere.

## Content

`content/projects/*.mdx` and `content/journal/*.mdx`. Frontmatter is validated at
build time, so a typo fails the build instead of shipping. See
`content/README.md`.

> Everything currently in `content/` is placeholder copy written to exercise the
> layouts. Replace it before launch.

## Before this goes live

- [ ] **Confirm the site visit fee.** `siteVisit.pricePence` in `lib/site.ts`
      defaults to £950; override with `SITE_VISIT_PRICE_PENCE`.
- [ ] **Real contact details.** `site.phone` and `site.email` in `lib/site.ts`
      are placeholders.
- [ ] **Photography.** `components/ui/Media.tsx` renders a neutral plate when no
      `src` is given, so every layout is complete but nothing is shown. Drop
      images into `public/` and set `cover`/`gallery` in project frontmatter.
- [ ] **Vector wordmark.** `public/wordmark.png` is the supplied raster export.
- [ ] **Legal review.** `/privacy` and `/terms` are drafted to match what the
      site actually does, including the 14-day distance-selling cancellation
      right, but they have not been seen by a solicitor.
- [ ] **Stripe webhook.** `app/api/stripe/webhook/route.ts` currently logs the
      booking. Wire it into the DVC CRM and send the confirmation email.

## Deployment

Deploy `sites/100mm` as its own Vercel project with the root directory set to
`sites/100mm` — the repository root is the DVC CRM and has its own deployment.
Set the environment variables from `.env.example`, and point a Stripe webhook
endpoint at `https://<domain>/api/stripe/webhook` for
`checkout.session.completed`.
