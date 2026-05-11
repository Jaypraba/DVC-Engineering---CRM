import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'Steel and Timber Beam Design',
    description: 'Design of steel RSJ, universal beam, and timber beam sections for openings, floor support, and roof loads across London. Full structural calculations provided.',
    url: 'https://dvceng.com/services/steel-beam-design',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Steel and Timber Beam Design', path: '/services/steel-beam-design' },
  ]),
  faqSchema([
    {
      question: 'What size steel beam do I need?',
      answer: 'The required beam section depends on the span, the loads it must carry, and the depth available. A structural engineer calculates this using current design standards. Guessing the size based on rules of thumb is not safe or acceptable to building control.',
    },
    {
      question: 'Can you specify an alternative to steel?',
      answer: 'Yes. Where weight or installation constraints make steel impractical, we can specify engineered timber beams such as LVL or glulam sections. These can achieve comparable performance to steel in many residential applications.',
    },
    {
      question: 'Do I need calculations if I am just replacing a beam?',
      answer: 'If the opening already exists and you are replacing a like-for-like beam, calculations may not be required. If the span, loads, or bearing conditions have changed, calculations are needed. We can advise based on the specific situation.',
    },
  ]),
];

export default function SteelBeamDesign() {
  return (
    <Layout>
      <SEO
        title="Steel Beam Design London | RSJ and Timber Beam Calculations | DVC Engineering"
        description="Steel RSJ, universal beam, and timber beam design for openings, loft conversions, and extensions across London. Full structural calculations and drawings. DVC Engineering, EC2A."
        canonical="/services/steel-beam-design"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Steel and Timber Beam Design</span>
          </nav>
          <h1 style={styles.h1}>Steel and Timber Beam Design in London</h1>
          <p style={styles.heroText}>
            Structural calculations for RSJ, universal beam, and engineered timber beam sections.
            Clear, building-regulation-compliant packages for builders and building control officers.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Get beam calculations</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>When You Need Beam Design Calculations</h2>
            <p style={styles.p}>
              Beam design calculations are required whenever a structural beam is installed as part
              of building work that requires building regulations approval. This covers load-bearing
              wall removal, loft conversions, extensions, chimney breast removal, and the formation
              of new structural openings. Building control officers require calculations prepared
              by a qualified structural engineer confirming that the proposed beam is adequate for
              the loads it will carry.
            </p>
            <p style={styles.p}>
              Beam sizing is not a matter of judgement or experience alone. A beam that looks right
              may be entirely wrong for the specific loading condition. DVC Engineering carries out
              full limit state design calculations in accordance with current Eurocodes, checking
              bending strength, shear strength, and deflection under the loads applied. We also
              check the bearing conditions at each end and specify padstones where these are required.
            </p>

            <h2 style={styles.h2}>Steel Beam (RSJ) Specification</h2>
            <p style={styles.p}>
              Steel universal beams, commonly known as RSJs or I-beams, are the standard structural
              solution for spanning openings in domestic and commercial construction. The correct
              section is determined by the span, the loads from floors and roof above, and any
              point loads from walls or columns. A beam with too shallow a depth will deflect
              excessively; one with inadequate flange width will buckle under load.
            </p>
            <p style={styles.p}>
              For the vast majority of residential load-bearing wall removal projects in London,
              a single steel universal beam is sufficient. For longer spans, wider openings, or
              situations where two beams must be combined to work within the available ceiling
              depth, we design the appropriate configuration and detail the connections required.
              We also specify any fire protection coating required by the building regulations for
              the particular application.
            </p>

            <h2 style={styles.h2}>Engineered Timber Beam Design</h2>
            <p style={styles.p}>
              Laminated veneer lumber (LVL) and glulam beams are structural timber products that
              can span similar distances to steel in many domestic applications, while offering
              advantages in weight, ease of installation, and thermal performance. They are
              increasingly specified in extensions and loft conversions across London where steel
              installation constraints or sustainability considerations apply.
            </p>
            <p style={styles.p}>
              DVC Engineering designs timber beam sections to Eurocode 5, checking bending,
              shear, deflection, and bearing for each application. We specify the appropriate
              grade and product, provide installation guidance, and confirm the beam in our
              structural calculations. Our timber beam designs are accepted by building control
              in all London boroughs.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'What information do you need to design a beam?',
                    a: 'We need the clear span of the opening, the loads acting above (type of floor, roof structure, any walls above), the bearing conditions at each end, and the available depth for the beam. A site visit is usually the most efficient way to gather this.',
                  },
                  {
                    q: 'How quickly can you provide beam calculations?',
                    a: 'For straightforward beam calculations, we can typically deliver within two to three working days of receiving all the information we need.',
                  },
                  {
                    q: 'Can you specify the beam for a kitchen-diner opening?',
                    a: 'Yes. Kitchen-diner openings between the main house and a rear extension, or between the kitchen and dining room where a load-bearing wall is removed, are one of the most common beam design commissions we receive.',
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
              <h3 style={styles.sidebarHeading}>Get Calculations</h3>
              <p style={styles.sidebarText}>Tell us the span, location, and what is above the beam. We will provide pricing and a lead time.</p>
              <Link href="/contact" style={styles.sidebarBtn}>Get in touch</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/load-bearing-wall-removal" style={styles.sidebarLink}>Load-bearing Wall Removal</Link></li>
                <li><Link href="/services/loft-conversions" style={styles.sidebarLink}>Loft Conversions</Link></li>
                <li><Link href="/services/extensions" style={styles.sidebarLink}>Extensions</Link></li>
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
