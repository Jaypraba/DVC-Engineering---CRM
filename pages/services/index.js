import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { localBusinessSchema, breadcrumbSchema } from '../../components/Schema';

const schema = [
  localBusinessSchema(),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ]),
];

const SERVICES = [
  {
    slug: 'structural-surveys',
    title: 'Structural Surveys',
    summary: 'Independent structural assessments for homebuyers, sellers, lenders, and developers. Full written reports with photographic evidence and clear recommendations.',
    keywords: 'structural survey, pre-purchase survey, building survey London',
  },
  {
    slug: 'loft-conversions',
    title: 'Loft Conversions',
    summary: 'Structural calculations, beam design, and drawings for all loft conversion types: dormer, hip-to-gable, mansard, and Velux. Building regulations compliant.',
    keywords: 'loft conversion structural engineer, dormer conversion London',
  },
  {
    slug: 'extensions',
    title: 'Extensions',
    summary: 'Structural design for single-storey rear extensions, side extensions, double-storey extensions, and wraparounds. Full calculations and construction drawings.',
    keywords: 'house extension structural engineer, extension calculations London',
  },
  {
    slug: 'load-bearing-wall-removal',
    title: 'Load-bearing Wall Removal',
    summary: 'Structural calculations and beam specification for removing load-bearing walls, chimney breast removal, and structural opening formation.',
    keywords: 'load-bearing wall removal London, RSJ beam design',
  },
  {
    slug: 'steel-beam-design',
    title: 'Steel and Timber Beam Design',
    summary: 'Design of steel RSJ, universal beam, and timber beam sections to span openings, support floors, and carry roof loads. Full structural calculations provided.',
    keywords: 'steel beam design London, RSJ calculations, timber beam design',
  },
  {
    slug: 'foundation-design',
    title: 'Foundation Design',
    summary: 'Foundation assessment, new foundation design, and underpinning specifications for extensions, new builds, and existing structures showing movement.',
    keywords: 'foundation design London, underpinning structural engineer',
  },
  {
    slug: 'temporary-works',
    title: 'Temporary Works',
    summary: 'Design of propping, shoring, acrow systems, and temporary support structures for use during construction. Temporary works coordination available.',
    keywords: 'temporary works design London, propping calculations',
  },
  {
    slug: 'building-control',
    title: 'Building Control Coordination',
    summary: 'Preparation and submission of structural calculations and drawings for building regulations approval. Liaison with building control officers on your behalf.',
    keywords: 'building control coordination London, building regulations structural engineer',
  },
  {
    slug: 'structural-adequacy-reports',
    title: 'Structural Adequacy Reports',
    summary: 'Formal written assessments confirming whether a structure meets current structural requirements. Commonly required by lenders, solicitors, and local authorities.',
    keywords: 'structural adequacy report London, structural report for mortgage',
  },
];

export default function ServicesIndex() {
  return (
    <Layout>
      <SEO
        title="Structural Engineering Services London | DVC Engineering"
        description="DVC Engineering offers a full range of structural engineering services across London: structural surveys, loft conversions, extensions, load-bearing wall removal, beam design, foundation design, and more."
        canonical="/services"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Services</span>
          </nav>
          <h1 style={styles.h1}>Structural Engineering Services</h1>
          <p style={styles.heroText}>
            From pre-purchase surveys to complex beam design, DVC Engineering provides clear,
            commercially aware structural engineering across London and the South East.
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {SERVICES.map(({ slug, title, summary }) => (
            <Link key={slug} href={`/services/${slug}`} style={styles.card}>
              <div style={styles.cardAccent} />
              <h2 style={styles.cardTitle}>{title}</h2>
              <p style={styles.cardSummary}>{summary}</p>
              <span style={styles.cardCta}>Learn more &rarr;</span>
            </Link>
          ))}
        </div>

        <div style={styles.ctaBanner}>
          <h2 style={styles.ctaHeading}>Not sure which service you need?</h2>
          <p style={styles.ctaText}>
            Describe your project and we will advise on the appropriate structural engineering input required.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Send an enquiry</Link>
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
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
  },
  breadcrumb: {
    fontSize: 13,
    color: '#8a96a8',
    marginBottom: 20,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  breadcrumbLink: { color: '#8a96a8', textDecoration: 'none' },
  breadcrumbSep: { color: '#3d4f6b' },
  h1: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(32px, 5vw, 52px)',
    lineHeight: 1.05,
    margin: '0 0 20px',
    color: '#F8F7F5',
  },
  heroText: {
    fontSize: 18,
    color: '#c8d0dc',
    margin: 0,
    maxWidth: 620,
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: 24,
    marginBottom: 64,
  },
  card: {
    background: '#fff',
    border: '1px solid #E4E0D8',
    borderRadius: 10,
    padding: '28px 28px 24px',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'box-shadow 150ms',
    boxShadow: '0 1px 3px rgba(10,22,40,0.06)',
  },
  cardAccent: {
    width: 32,
    height: 3,
    background: '#F4822A',
    borderRadius: 2,
  },
  cardTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    margin: 0,
    color: '#0A1628',
  },
  cardSummary: {
    fontSize: 14,
    lineHeight: 1.65,
    color: '#3d4f6b',
    margin: 0,
    flexGrow: 1,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: 600,
    color: '#F4822A',
    marginTop: 4,
  },
  ctaBanner: {
    background: '#0A1628',
    borderRadius: 12,
    padding: '48px 48px',
    marginBottom: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  ctaHeading: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 28,
    color: '#F8F7F5',
    margin: 0,
  },
  ctaText: {
    color: '#c8d0dc',
    fontSize: 16,
    margin: 0,
    maxWidth: 500,
    lineHeight: 1.6,
  },
  ctaBtn: {
    background: '#F4822A',
    color: '#fff',
    textDecoration: 'none',
    padding: '12px 28px',
    borderRadius: 7,
    fontWeight: 600,
    fontSize: 15,
  },
};
