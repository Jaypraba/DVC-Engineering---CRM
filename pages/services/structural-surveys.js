import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'Structural Survey',
    description: 'Independent structural assessments for homebuyers, sellers, lenders, and developers across London and the South East. Full written reports with photographic evidence and clear recommendations.',
    url: 'https://dvceng.com/services/structural-surveys',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Structural Surveys', path: '/services/structural-surveys' },
  ]),
  faqSchema([
    {
      question: 'What is a structural survey?',
      answer: 'A structural survey is an in-depth inspection of a property\'s primary structural elements, including foundations, walls, floors, and roof structure. It identifies defects, assesses their cause and severity, and recommends remedial action. It differs from a standard homebuyer\'s report in both depth and focus.',
    },
    {
      question: 'When do I need a structural survey?',
      answer: 'You should commission a structural survey before purchasing an older property, a property showing visible cracks or movement, or any building where you have concerns about structural integrity. Lenders and insurers may also require one before proceeding.',
    },
    {
      question: 'How much does a structural survey cost in London?',
      answer: 'The cost of a structural survey in London varies by property size and complexity. Contact DVC Engineering for a fixed-price quotation based on your specific property.',
    },
    {
      question: 'How long does a structural survey take?',
      answer: 'An on-site inspection typically takes two to four hours for a standard residential property. A written report is usually delivered within three to five working days of the inspection.',
    },
  ]),
];

export default function StructuralSurveys() {
  return (
    <Layout>
      <SEO
        title="Structural Surveys London | Pre-purchase Structural Inspection | DVC Engineering"
        description="Independent structural surveys for homebuyers, sellers, and lenders across London. Full written reports identifying structural defects, movement, and remedial recommendations. Contact DVC Engineering."
        canonical="/services/structural-surveys"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Structural Surveys</span>
          </nav>
          <h1 style={styles.h1}>Structural Surveys in London</h1>
          <p style={styles.heroText}>
            Independent structural assessments for homebuyers, vendors, lenders, and developers.
            Clear, factual reports from experienced structural engineers.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Request a survey</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>What a Structural Survey Covers</h2>
            <p style={styles.p}>
              A structural survey is a detailed assessment of a property&apos;s primary load-bearing
              elements: foundations, structural walls, floors, lintels, and roof structure. Unlike
              a standard homebuyer&apos;s report, which provides a surface-level overview, a structural
              survey investigates the root cause of any observed defects and provides a clear
              professional opinion on their significance.
            </p>
            <p style={styles.p}>
              DVC Engineering surveys cover: foundation movement and subsidence, cracking patterns
              in brickwork and render, structural timber condition (including rot and beetle damage),
              roof structure integrity, lintel failure and overloading, and the structural impact
              of any alterations or extensions carried out to the property.
            </p>
            <p style={styles.p}>
              Each report includes photographic evidence, a condition rating for each element
              inspected, an explanation of any defects found, and a clear set of recommendations
              distinguishing between urgent remedial works and items to monitor over time.
            </p>

            <h2 style={styles.h2}>Pre-purchase Structural Surveys across London</h2>
            <p style={styles.p}>
              London&apos;s Victorian and Edwardian housing stock is particularly susceptible to
              foundation movement caused by tree root activity, clay soil shrinkage, and historic
              drainage failures. Properties in areas including Islington, Hackney, Southwark, and
              Lambeth regularly present with stepped cracking and distortion that requires careful
              assessment before purchase.
            </p>
            <p style={styles.p}>
              A pre-purchase structural survey by DVC Engineering gives buyers an independent,
              technically grounded view of the property&apos;s structural condition. This enables
              informed negotiation on price, accurate budgeting for remedial works, and confidence
              before exchange. Solicitors and mortgage lenders increasingly request structural
              engineer reports for older or distressed properties.
            </p>
            <p style={styles.p}>
              We cover all London boroughs, providing surveys on terraced houses, semi-detached
              and detached properties, mansion flats, period conversions, and commercial buildings
              undergoing change of use. Our reports are accepted by major lenders and insurers.
            </p>

            <h2 style={styles.h2}>Structural Reports for Specific Purposes</h2>
            <p style={styles.p}>
              Beyond pre-purchase surveys, DVC Engineering produces structural reports for a range
              of specific purposes. If you are purchasing a property with cash and require a
              structural adequacy assessment for insurance purposes, commissioning remedial works
              and need a scope-of-works opinion, or managing a listed building and require
              structural input for a conservation officer submission, we can provide the appropriate
              report format.
            </p>
            <p style={styles.p}>
              We also carry out condition surveys for landlords, housing associations, and managing
              agents where there is concern about the structural integrity of a building in their
              portfolio. Reports can be scoped to cover a single element of concern or the full
              structure, depending on the brief.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'What is the difference between a structural survey and a homebuyer\'s report?',
                    a: 'A homebuyer\'s report is a standardised, general condition assessment carried out by a surveyor. A structural survey is a focused technical inspection by a structural engineer, examining load-bearing elements in depth and providing a professional structural opinion on any defects found.',
                  },
                  {
                    q: 'When should I commission a structural survey?',
                    a: 'Before purchasing any older property, particularly Victorian or Edwardian terraces and conversions. Also when visible cracking, settlement, or movement is present, or when your lender or solicitor requests a structural engineer\'s report.',
                  },
                  {
                    q: 'Do I need a structural survey if I have already had a homebuyer\'s report?',
                    a: 'If the homebuyer\'s report has flagged structural concerns or recommended further investigation, a structural survey by a qualified engineer is the appropriate next step.',
                  },
                ].map(({ q, a }) => (
                  <div key={q} style={styles.faqItem}>
                    <h3 style={styles.faqQ}>{q}</h3>
                    <p style={styles.faqA}>{a}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Request a Survey</h3>
              <p style={styles.sidebarText}>
                Tell us the property address and your timeline. We will confirm availability and pricing within one working day.
              </p>
              <Link href="/contact" style={styles.sidebarBtn}>Get in touch</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/structural-adequacy-reports" style={styles.sidebarLink}>Structural Adequacy Reports</Link></li>
                <li><Link href="/services/foundation-design" style={styles.sidebarLink}>Foundation Design</Link></li>
                <li><Link href="/services/load-bearing-wall-removal" style={styles.sidebarLink}>Load-bearing Wall Removal</Link></li>
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
  h1: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.05, margin: '0 0 20px', color: '#F8F7F5' },
  heroText: { fontSize: 18, color: '#c8d0dc', margin: '0 0 32px', maxWidth: 580, lineHeight: 1.6 },
  ctaBtn: { background: '#F4822A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 7, fontWeight: 600, fontSize: 15, display: 'inline-block' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' },
  article: {},
  h2: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 26, color: '#0A1628', margin: '40px 0 16px', lineHeight: 1.2 },
  p: { fontSize: 16, lineHeight: 1.75, color: '#3d4f6b', margin: '0 0 18px' },
  faqSection: { marginTop: 48 },
  faqList: { display: 'flex', flexDirection: 'column', gap: 28 },
  faqItem: { borderTop: '1px solid #E4E0D8', paddingTop: 24 },
  faqQ: { fontWeight: 600, fontSize: 16, color: '#0A1628', margin: '0 0 10px' },
  faqA: { fontSize: 15, lineHeight: 1.7, color: '#3d4f6b', margin: 0 },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 80 },
  sidebarCard: { background: '#F8F7F5', border: '1px solid #E4E0D8', borderRadius: 10, padding: 24 },
  sidebarHeading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, margin: '0 0 12px', color: '#0A1628', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sidebarText: { fontSize: 14, lineHeight: 1.65, color: '#3d4f6b', margin: '0 0 16px' },
  sidebarBtn: { background: '#F4822A', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 7, fontWeight: 600, fontSize: 14, display: 'inline-block' },
  sidebarList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  sidebarLink: { color: '#F4822A', textDecoration: 'none', fontSize: 14 },
};
