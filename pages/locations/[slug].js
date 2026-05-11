import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { LOCATIONS, getLocationBySlug, getAllLocationSlugs } from '../../lib/locationData';
import { serviceSchema, breadcrumbSchema, localBusinessSchema } from '../../components/Schema';

export async function getStaticPaths() {
  return {
    paths: getAllLocationSlugs(),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const location = getLocationBySlug(params.slug);
  if (!location) return { notFound: true };
  return { props: { location } };
}

export default function LocationPage({ location }) {
  const {
    slug, name, region, description, stock, planningContext, services,
    metaTitle, metaDescription,
  } = location;

  const schema = [
    {
      ...localBusinessSchema(),
      areaServed: [{ '@type': 'City', name }],
    },
    serviceSchema({
      name: `Structural Engineering in ${name}`,
      description: metaDescription,
      url: `https://dvceng.com/locations/${slug}`,
      areaServed: name,
    }),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Locations', path: '/locations' },
      { name: name, path: `/locations/${slug}` },
    ]),
  ];

  return (
    <Layout>
      <SEO
        title={metaTitle}
        description={metaDescription}
        canonical={`/locations/${slug}`}
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/locations" style={styles.breadcrumbLink}>Locations</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>{name}</span>
          </nav>
          <div style={styles.regionTag}>{region}</div>
          <h1 style={styles.h1}>Structural Engineer {name}</h1>
          <p style={styles.heroText}>
            DVC Engineering provides structural engineering services across {name},
            covering loft conversions, extensions, structural surveys, and beam design
            for residential and small commercial projects.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Get a quote in {name}</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>Structural Engineering in {name}</h2>
            <p style={styles.p}>{description}</p>

            <h2 style={styles.h2}>The Housing Stock and Structural Challenges</h2>
            <p style={styles.p}>{stock}</p>

            <h2 style={styles.h2}>Working with {name} Council and Building Control</h2>
            <p style={styles.p}>{planningContext}</p>

            <div style={styles.ctaBanner}>
              <h3 style={styles.ctaBannerHeading}>Ready to start your project in {name}?</h3>
              <p style={styles.ctaBannerText}>
                Send us the details and we will confirm pricing and availability within one working day.
                We cover all postcodes in {name}.
              </p>
              <Link href="/contact" style={styles.ctaBannerBtn}>Contact DVC Engineering</Link>
            </div>
          </article>

          <aside style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Services in {name}</h3>
              <ul style={styles.serviceList}>
                {services.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} style={styles.serviceLink}>
                      <span style={styles.serviceArrow}>&#8594;</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Get in Touch</h3>
              <p style={styles.sidebarText}>
                Describe your project and we will respond within one working day.
              </p>
              <Link href="/contact" style={styles.sidebarBtn}>Send an enquiry</Link>
            </div>

            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Other Areas</h3>
              <ul style={styles.areaList}>
                {LOCATIONS.filter(l => l.slug !== slug).slice(0, 6).map(l => (
                  <li key={l.slug}>
                    <Link href={`/locations/${l.slug}`} style={styles.areaLink}>{l.name}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/locations" style={{ ...styles.areaLink, color: '#F4822A', fontWeight: 600 }}>
                    All locations &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  hero: { background: '#0A1628', color: '#F8F7F5', padding: '56px 0 48px', marginBottom: 56 },
  container: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' },
  breadcrumb: { fontSize: 13, color: '#8a96a8', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' },
  breadcrumbLink: { color: '#8a96a8', textDecoration: 'none' },
  breadcrumbSep: { color: '#3d4f6b' },
  regionTag: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#F4822A',
    background: 'rgba(244,130,42,0.15)',
    padding: '4px 10px',
    borderRadius: 4,
    marginBottom: 16,
  },
  h1: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.05, margin: '0 0 20px', color: '#F8F7F5' },
  heroText: { fontSize: 18, color: '#c8d0dc', margin: '0 0 32px', maxWidth: 580, lineHeight: 1.6 },
  ctaBtn: { background: '#F4822A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 7, fontWeight: 600, fontSize: 15, display: 'inline-block' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' },
  article: {},
  h2: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 26, color: '#0A1628', margin: '40px 0 16px', lineHeight: 1.2 },
  p: { fontSize: 16, lineHeight: 1.75, color: '#3d4f6b', margin: '0 0 18px' },
  ctaBanner: {
    background: '#0A1628',
    borderRadius: 10,
    padding: '32px',
    marginTop: 48,
  },
  ctaBannerHeading: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 22,
    color: '#F8F7F5',
    margin: '0 0 12px',
  },
  ctaBannerText: { color: '#c8d0dc', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' },
  ctaBannerBtn: {
    background: '#F4822A',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 24px',
    borderRadius: 7,
    fontWeight: 600,
    fontSize: 14,
    display: 'inline-block',
  },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 24 },
  sidebarCard: { background: '#F8F7F5', border: '1px solid #E4E0D8', borderRadius: 10, padding: 24 },
  sidebarHeading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, margin: '0 0 14px', color: '#0A1628', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sidebarText: { fontSize: 14, lineHeight: 1.65, color: '#3d4f6b', margin: '0 0 16px' },
  sidebarBtn: { background: '#F4822A', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 7, fontWeight: 600, fontSize: 14, display: 'inline-block' },
  serviceList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  serviceLink: { color: '#0A1628', textDecoration: 'none', fontSize: 14, display: 'flex', gap: 8, alignItems: 'flex-start' },
  serviceArrow: { color: '#F4822A', flexShrink: 0, marginTop: 1 },
  areaList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  areaLink: { color: '#3d4f6b', textDecoration: 'none', fontSize: 14 },
};
