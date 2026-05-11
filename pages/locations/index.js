import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { LOCATIONS } from '../../lib/locationData';
import { localBusinessSchema, breadcrumbSchema } from '../../components/Schema';

const schema = [
  localBusinessSchema(),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
  ]),
];

export default function LocationsIndex() {
  return (
    <Layout>
      <SEO
        title="Structural Engineer London | All Areas Covered | DVC Engineering"
        description="DVC Engineering provides structural engineering services across London, covering all 33 boroughs. Find your local area and see how we work in your borough."
        canonical="/locations"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Locations</span>
          </nav>
          <h1 style={styles.h1}>Structural Engineers Across London</h1>
          <p style={styles.heroText}>
            DVC Engineering works across all London boroughs and the wider South East. Based in
            EC2A, we cover the full capital for structural surveys, loft conversions, extensions,
            and all other structural engineering services.
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {LOCATIONS.map(({ slug, name, region }) => (
            <Link key={slug} href={`/locations/${slug}`} style={styles.card}>
              <div style={styles.cardRegion}>{region}</div>
              <h2 style={styles.cardTitle}>Structural Engineer {name}</h2>
              <span style={styles.cardCta}>View services &rarr;</span>
            </Link>
          ))}
        </div>

        <div style={styles.note}>
          <p style={styles.noteText}>
            Don&apos;t see your borough listed? DVC Engineering covers all of London and the South East,
            including Surrey, Essex, Hertfordshire, and Sussex.{' '}
            <Link href="/contact" style={styles.noteLink}>Contact us</Link> to discuss your project.
          </p>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  hero: {
    background: '#0A1628',
    color: '#F8F7F5',
    padding: '56px 0 48px',
    marginBottom: 56,
  },
  container: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' },
  breadcrumb: { fontSize: 13, color: '#8a96a8', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' },
  breadcrumbLink: { color: '#8a96a8', textDecoration: 'none' },
  breadcrumbSep: { color: '#3d4f6b' },
  h1: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.05, margin: '0 0 20px', color: '#F8F7F5' },
  heroText: { fontSize: 18, color: '#c8d0dc', margin: 0, maxWidth: 580, lineHeight: 1.6 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
    marginBottom: 48,
  },
  card: {
    background: '#fff',
    border: '1px solid #E4E0D8',
    borderRadius: 10,
    padding: '20px 22px',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 1px 3px rgba(10,22,40,0.06)',
  },
  cardRegion: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#F4822A',
  },
  cardTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 18,
    margin: 0,
    color: '#0A1628',
  },
  cardCta: { fontSize: 13, fontWeight: 600, color: '#8a96a8', marginTop: 4 },
  note: {
    background: '#F8F7F5',
    border: '1px solid #E4E0D8',
    borderRadius: 10,
    padding: '24px 28px',
    marginBottom: 64,
  },
  noteText: { fontSize: 15, lineHeight: 1.65, color: '#3d4f6b', margin: 0 },
  noteLink: { color: '#F4822A', textDecoration: 'none', fontWeight: 600 },
};
