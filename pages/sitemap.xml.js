const SITE_URL = 'https://dvceng.com';

const SERVICES = [
  'structural-surveys',
  'loft-conversions',
  'extensions',
  'load-bearing-wall-removal',
  'steel-beam-design',
  'foundation-design',
  'temporary-works',
  'building-control',
  'structural-adequacy-reports',
];

const LOCATIONS = [
  'islington', 'hackney', 'tower-hamlets', 'southwark', 'lambeth',
  'wandsworth', 'hammersmith-and-fulham', 'kensington-and-chelsea',
  'camden', 'barnet', 'haringey', 'enfield', 'waltham-forest',
  'newham', 'greenwich',
];

const BLOG_SLUGS = [
  'do-i-need-a-structural-engineer-for-a-loft-conversion',
  'how-to-remove-a-load-bearing-wall',
  'structural-survey-vs-homebuyers-report',
];

function generateSitemap() {
  const staticPages = ['', '/services', '/locations', '/blog', '/contact'];

  const servicePages = SERVICES.map(s => `/services/${s}`);
  const locationPages = LOCATIONS.map(l => `/locations/${l}`);
  const blogPages = BLOG_SLUGS.map(b => `/blog/${b}`);

  const allPages = [...staticPages, ...servicePages, ...locationPages, ...blogPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    page => `  <url>
    <loc>${SITE_URL}${page}</loc>
    <changefreq>${page === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('/services') ? '0.9' : page.startsWith('/locations') ? '0.8' : page.startsWith('/blog') ? '0.7' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(generateSitemap());
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
