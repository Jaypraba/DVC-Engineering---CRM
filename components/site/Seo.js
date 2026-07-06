import Head from 'next/head';
import { BUSINESS } from '../../lib/siteData';

// Shared <head> tags for public marketing pages: standard meta, Open Graph/
// Twitter cards, canonical URL, and any JSON-LD structured data passed in.
// Structured data (schema.org) is what lets AI answer engines (ChatGPT,
// Perplexity, Google AI Overviews, etc.) understand and cite this business
// directly rather than having to guess from prose.
export default function Seo({ title, description, path = '/', jsonLd }) {
  const fullTitle = title ? `${title} | ${BUSINESS.name}` : `${BUSINESS.name} — ${BUSINESS.tagline}`;
  const canonical = `${BUSINESS.url}${path === '/' ? '' : path}`;
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={BUSINESS.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: BUSINESS.url,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.addressLocality,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    priceRange: '££',
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function serviceListSchema(services) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((s, i) => ({
      '@type': 'Service',
      position: i + 1,
      name: s.name,
      description: s.summary,
      provider: { '@type': 'ProfessionalService', name: BUSINESS.name },
      areaServed: 'GB',
    })),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BUSINESS.url}${item.path}`,
    })),
  };
}
