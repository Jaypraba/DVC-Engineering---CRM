/**
 * Single source of truth for the commercial proposition.
 *
 * The whole site converts on one thing: a PAID site visit. There is no free
 * consultation and no free quotation anywhere in this codebase. If you find
 * yourself adding a generic "get in touch" form, stop and route it here.
 */

export const site = {
  name: "100mm",
  legalName: "100mm Ltd",
  tagline: "Construction and project management for high-value London homes.",
  description:
    "100mm is a London construction and project management practice for residential projects between £350k and £2m. Every engagement begins with a paid site visit attended by an interior designer, a structural engineer and a contractor, followed by a written report.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://100mm.co.uk",
  email: "studio@100mm.co.uk",
  phone: "+44 20 0000 0000",
  phoneDisplay: "020 0000 0000",
  address: {
    line1: "London",
    country: "United Kingdom",
  },
  sister: {
    name: "DVC Engineering Ltd",
    description: "Structural engineering consultancy. Sister company to 100mm.",
    url: "https://dvceng.com",
  },
} as const;

/**
 * The paid site visit. Price is held in pence so it can be handed straight to
 * Stripe without rounding drift.
 *
 * TODO(client): confirm the fee. 95000 (£950 + VAT) is a placeholder.
 * Override without a code change via SITE_VISIT_PRICE_PENCE.
 */
export const siteVisit = {
  name: "Site visit and written report",
  pricePence: Number(process.env.SITE_VISIT_PRICE_PENCE ?? 95000),
  currency: "gbp",
  vatNote: "plus VAT",
  reportDays: 5,
  durationNote: "Around two hours on site",
  attendees: [
    {
      role: "Interior designer",
      brief:
        "Reads the house as somewhere to live in. Tests whether the plan you have in mind actually works — circulation, light, storage, where the money should go and where it is being wasted.",
    },
    {
      role: "Structural engineer",
      brief:
        "From DVC Engineering, our sister consultancy. Establishes what the building will allow: spans, load paths, foundations, party wall exposure, and which of your ambitions are cheap and which are expensive.",
    },
    {
      role: "Contractor and project manager",
      brief:
        "Prices reality. Sequencing, access, programme, trades, and the cost bands the work will genuinely land in — not an optimistic number designed to win the job.",
    },
  ],
  includes: [
    "Three specialists on site together, at the same time, in one visit",
    "A written report issued within five working days",
    "A realistic cost band for the scope discussed",
    "Structural feasibility of the moves you want to make",
    "Planning, party wall and building control exposure flagged early",
    "A recommended route forward, whether or not it involves us",
  ],
  excludes: [
    "It is not a free quotation and it is not a sales visit",
    "It is not a structural calculation package or a planning application",
    "It does not commit you to appointing 100mm for the build",
  ],
} as const;

export const projectValueBands = [
  "£350k – £500k",
  "£500k – £750k",
  "£750k – £1m",
  "£1m – £1.5m",
  "£1.5m – £2m",
  "Not sure yet",
] as const;

export const projectTypes = [
  "Whole-house refurbishment",
  "Extension",
  "Basement",
  "Loft conversion",
  "New build",
  "Listed or conservation area work",
  "Something else",
] as const;

export const nav = [
  { href: "/work", label: "Work" },
  { href: "/approach", label: "Approach" },
  { href: "/site-visit", label: "Site visit" },
  { href: "/studio", label: "Studio" },
  { href: "/journal", label: "Journal" },
] as const;

export const footerNav = [
  { href: "/work", label: "Work" },
  { href: "/approach", label: "Approach" },
  { href: "/site-visit", label: "Site visit" },
  { href: "/studio", label: "Studio" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pounds % 1 === 0 ? 0 : 2,
  }).format(pounds);
}

export const siteVisitPrice = formatPrice(siteVisit.pricePence);
