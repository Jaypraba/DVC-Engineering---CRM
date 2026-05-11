import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'Building Control Coordination',
    description: 'Preparation and submission of structural calculations and drawings for building regulations approval across London. Liaison with building control officers on behalf of clients.',
    url: 'https://dvceng.com/services/building-control',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Building Control Coordination', path: '/services/building-control' },
  ]),
  faqSchema([
    {
      question: 'What structural information does building control require?',
      answer: 'Building control typically requires structural calculations demonstrating that all structural elements comply with the Building Regulations, coordinated drawings showing the structural arrangement, and specification notes covering materials and construction methods.',
    },
    {
      question: 'How long does building control approval take?',
      answer: 'Full plans applications typically receive a decision within five weeks of submission. Building Notice routes are faster but do not provide advance approval of the structural design. We can advise on the most appropriate route for your project.',
    },
    {
      question: 'Can you liaise with building control on my behalf?',
      answer: 'Yes. DVC Engineering regularly communicates directly with building control officers to respond to queries, provide additional information, and progress approvals on clients\' behalf.',
    },
  ]),
];

export default function BuildingControl() {
  return (
    <Layout>
      <SEO
        title="Building Control Coordination London | Structural Calculations for Building Regulations | DVC Engineering"
        description="Structural calculations and drawings for building regulations approval across London. Full plans applications, building notice support, and direct liaison with building control officers."
        canonical="/services/building-control"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Building Control Coordination</span>
          </nav>
          <h1 style={styles.h1}>Building Control Coordination in London</h1>
          <p style={styles.heroText}>
            Structural calculations and drawings prepared and submitted for building regulations
            approval. Direct liaison with building control officers across all London boroughs.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Start your application</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>Structural Calculations for Building Regulations</h2>
            <p style={styles.p}>
              Building regulations apply to the vast majority of building work in England, including
              extensions, loft conversions, structural alterations, and changes of use. The structural
              element of a building regulations submission must demonstrate that the proposed
              structure complies with Part A (Structure) of the Building Regulations.
            </p>
            <p style={styles.p}>
              This requires a structural engineer to prepare calculations covering every load-bearing
              element of the proposed works: foundations, walls, floors, beams, columns, and roof
              structure. These calculations are submitted to the building control body, either the
              local authority building control (LABC) department or an approved inspector, for
              review and approval before construction begins.
            </p>
            <p style={styles.p}>
              DVC Engineering prepares structural calculations and coordinated drawings suitable
              for building control submission for all types of domestic and small commercial work
              across London. Our submissions are clearly structured, cross-referenced with the
              architectural drawings, and written to address the specific concerns of building
              control officers reviewing residential work.
            </p>

            <h2 style={styles.h2}>Full Plans vs Building Notice</h2>
            <p style={styles.p}>
              There are two principal routes for obtaining building regulations approval for
              structural work: the Full Plans route and the Building Notice route.
            </p>
            <p style={styles.p}>
              Under the Full Plans route, a complete set of drawings and calculations is submitted
              in advance of construction. The building control body reviews the submission and
              issues a formal decision, typically within five weeks. This provides the highest
              level of certainty before construction begins and is the route we recommend for
              projects with significant structural content.
            </p>
            <p style={styles.p}>
              Under the Building Notice route, no advance approval is given. The contractor notifies
              building control of the intention to carry out the work, and inspections are carried
              out during construction. Structural calculations may still be required and must be
              provided on request. This route is faster to begin but carries the risk that remedial
              works may be required if the structural design is found to be inadequate on inspection.
            </p>

            <h2 style={styles.h2}>Liaison with London Building Control Departments</h2>
            <p style={styles.p}>
              Building control requirements and response times vary across London boroughs. DVC
              Engineering has experience submitting to and liaising with building control departments
              across all 33 London boroughs, including Islington, Hackney, Southwark, Lambeth,
              Tower Hamlets, Wandsworth, and Camden. We understand the specific requirements and
              preferences of each department and prepare submissions accordingly.
            </p>
            <p style={styles.p}>
              Where a building control officer has queries about the structural design, we respond
              directly on the client&apos;s behalf, providing additional calculations or drawings
              as required. Our aim is to progress approvals efficiently so that construction can
              begin on programme.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'Do I need building regulations approval for a loft conversion?',
                    a: 'Yes. All loft conversions that involve structural alterations to the roof require building regulations approval. This includes Velux, dormer, hip-to-gable, and mansard conversions.',
                  },
                  {
                    q: 'Can I use an approved inspector instead of the local authority?',
                    a: 'Yes. Approved inspectors (private building control bodies) operate across England and often provide faster turnaround times than local authority building control. We work with both approved inspectors and local authority building control across London.',
                  },
                  {
                    q: 'What happens if I do structural work without building control approval?',
                    a: 'Carrying out notifiable structural work without building control approval is a contravention of the Building Regulations. When you come to sell the property, you will need to demonstrate either that the work was approved or arrange retrospective approval, which can be costly and slow.',
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
              <h3 style={styles.sidebarHeading}>Start Your Submission</h3>
              <p style={styles.sidebarText}>Send us your architect&apos;s drawings and we will prepare the structural package and manage the submission for you.</p>
              <Link href="/contact" style={styles.sidebarBtn}>Get in touch</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/loft-conversions" style={styles.sidebarLink}>Loft Conversions</Link></li>
                <li><Link href="/services/extensions" style={styles.sidebarLink}>Extensions</Link></li>
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
