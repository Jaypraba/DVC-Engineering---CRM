import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'Temporary Works Design',
    description: 'Design of temporary propping, shoring, and support structures for construction projects across London. Temporary works coordination and design checks available.',
    url: 'https://dvceng.com/services/temporary-works',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Temporary Works', path: '/services/temporary-works' },
  ]),
  faqSchema([
    {
      question: 'What are temporary works in construction?',
      answer: 'Temporary works are structures or systems installed during construction to provide support, access, or containment until the permanent works are complete and self-supporting. Examples include propping systems, shoring, falsework, and excavation support.',
    },
    {
      question: 'Do I need a temporary works designer?',
      answer: 'If your project involves excavations, propping of structures during construction, shoring of adjacent buildings, or any temporary support system, a temporary works designer should be involved. This is a legal requirement under CDM 2015 for many construction activities.',
    },
    {
      question: 'What is a temporary works coordinator?',
      answer: 'A temporary works coordinator oversees the temporary works process on site, ensuring that designs are correctly implemented, checks are carried out before loading, and removal is sequenced correctly. DVC Engineering can provide both design and coordination roles.',
    },
  ]),
];

export default function TemporaryWorks() {
  return (
    <Layout>
      <SEO
        title="Temporary Works Design London | Propping and Shoring Calculations | DVC Engineering"
        description="Temporary works design for construction projects across London. Propping systems, shoring, acrow calculations, and excavation support. CDM 2015 compliant. DVC Engineering, EC2A."
        canonical="/services/temporary-works"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Temporary Works</span>
          </nav>
          <h1 style={styles.h1}>Temporary Works Design in London</h1>
          <p style={styles.heroText}>
            Structural design for propping, shoring, and support systems during construction.
            CDM 2015 compliant temporary works packages for contractors and principal designers.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Discuss your project</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>Temporary Works Design: What Is Required</h2>
            <p style={styles.p}>
              The Construction (Design and Management) Regulations 2015 (CDM 2015) place
              specific duties on designers and contractors in relation to temporary works. Where
              temporary works present a significant structural risk during construction, a competent
              temporary works designer must be engaged to produce a design and carry out a check
              before the temporary works are loaded.
            </p>
            <p style={styles.p}>
              DVC Engineering provides temporary works design for a wide range of construction
              scenarios in London, including: acrow propping systems during load-bearing wall
              removal and beam installation, trench shoring and excavation support for foundations
              and drainage works, shoring of party walls and adjacent structures during basement
              and extension construction, and falsework systems supporting formwork for concrete
              construction.
            </p>
            <p style={styles.p}>
              Each design is produced with full structural calculations, clear installation
              drawings, and a loading sequence that site operatives can follow. We can also carry
              out independent design checks on temporary works designed by others where a
              check certificate is required.
            </p>

            <h2 style={styles.h2}>Propping During Load-bearing Wall Removal</h2>
            <p style={styles.p}>
              When a load-bearing wall is removed to install a steel beam, the structure above
              must be temporarily supported while the wall is demolished and the beam is lifted
              into position. In most residential projects, this involves an acrow propping system
              running at right angles to the wall being removed, bearing on the floor above and
              on a spreader below.
            </p>
            <p style={styles.p}>
              The propping arrangement must be designed to ensure that the loads from the
              structure above are safely transferred through the props to an adequate bearing
              surface. Where the floor above is timber, the spreader size and prop spacing must
              be calculated to avoid punching through the floor or overloading individual joists.
            </p>
            <p style={styles.p}>
              DVC Engineering provides propping design notes and drawings as part of our
              load-bearing wall removal structural packages, or as a standalone service for
              contractors who have already received structural calculations from another engineer.
            </p>

            <h2 style={styles.h2}>Excavation Support and Shoring</h2>
            <p style={styles.p}>
              Basement construction and deep foundation excavations adjacent to existing buildings
              or party walls require engineered excavation support. In London&apos;s dense urban
              environment, where properties are built tightly together and shared boundaries
              are ubiquitous, excavation support is a critical safety matter that cannot be
              left to ad hoc decisions on site.
            </p>
            <p style={styles.p}>
              DVC Engineering designs sheet piling, soldier pile and lagging, and close-boarded
              timber shoring systems for basement and deep foundation excavations in London.
              We assess the soil conditions, the proximity of existing structures, and the
              loads acting on the shoring system, and produce calculations and drawings
              appropriate for the specific site conditions.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'What are acrow props and when are they needed?',
                    a: 'Acrow props are adjustable steel support columns used to temporarily support floors, beams, or structures while permanent structural works are carried out. They are required whenever a load-bearing element is removed or altered and the structure above needs temporary support during construction.',
                  },
                  {
                    q: 'Do I need a temporary works designer for a domestic project?',
                    a: 'If the project involves removing a load-bearing wall, constructing a basement, or carrying out any excavation adjacent to an existing structure, temporary works design is advisable and, in many cases, required under CDM 2015.',
                  },
                  {
                    q: 'Can you provide an independent check of temporary works?',
                    a: 'Yes. Where temporary works have been designed by another engineer and an independent check certificate is required, DVC Engineering provides this service. We review the calculations and drawings, carry out our own analysis, and issue a check certificate if satisfied.',
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
              <h3 style={styles.sidebarHeading}>Get a Quote</h3>
              <p style={styles.sidebarText}>Describe the temporary works required and your construction programme. We will confirm pricing and availability.</p>
              <Link href="/contact" style={styles.sidebarBtn}>Get in touch</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/load-bearing-wall-removal" style={styles.sidebarLink}>Load-bearing Wall Removal</Link></li>
                <li><Link href="/services/foundation-design" style={styles.sidebarLink}>Foundation Design</Link></li>
                <li><Link href="/services/steel-beam-design" style={styles.sidebarLink}>Steel and Timber Beam Design</Link></li>
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
