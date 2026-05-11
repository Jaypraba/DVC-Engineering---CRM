import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'Load-bearing Wall Removal',
    description: 'Structural calculations and beam specifications for load-bearing wall removal, chimney breast removal, and structural opening formation across London.',
    url: 'https://dvceng.com/services/load-bearing-wall-removal',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Load-bearing Wall Removal', path: '/services/load-bearing-wall-removal' },
  ]),
  faqSchema([
    {
      question: 'How do I know if a wall is load-bearing?',
      answer: 'A structural engineer assesses whether a wall is load-bearing by inspecting the direction of floor joists, the wall\'s position within the structure, and what loads exist above. You should not assume a wall is non-load-bearing based on visual inspection alone.',
    },
    {
      question: 'Do I need building regulations for load-bearing wall removal?',
      answer: 'Yes. Removing or creating an opening in a load-bearing wall is notifiable work under the Building Regulations. Structural calculations and a steel beam specification must be submitted to and approved by a building control officer before work begins.',
    },
    {
      question: 'How long does it take to get structural calculations for wall removal?',
      answer: 'DVC Engineering typically delivers structural calculations and beam specifications for load-bearing wall removal within three to five working days of a site visit.',
    },
  ]),
];

export default function LoadBearingWallRemoval() {
  return (
    <Layout>
      <SEO
        title="Load-bearing Wall Removal London | Structural Calculations and RSJ Beam Design | DVC Engineering"
        description="Structural calculations and steel beam specifications for load-bearing wall removal across London. Chimney breast removal, structural openings, and RSJ installation. Building regulations approved."
        canonical="/services/load-bearing-wall-removal"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Load-bearing Wall Removal</span>
          </nav>
          <h1 style={styles.h1}>Load-bearing Wall Removal in London</h1>
          <p style={styles.heroText}>
            Structural calculations and steel beam specifications for wall removals, chimney breast
            removals, and opening formations. Complete packages for building control approval.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Get calculations</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>Why Structural Calculations Are Essential</h2>
            <p style={styles.p}>
              Removing a load-bearing wall without proper structural input carries serious risk.
              The wall is carrying loads from floors, roofs, and the structure above it. When it
              is removed, a beam must be installed to redistribute those loads safely to new
              bearing points. Get this wrong and the consequences range from cracking and distortion
              to structural collapse.
            </p>
            <p style={styles.p}>
              DVC Engineering assesses the loads acting on the wall to be removed, designs the
              appropriate steel or timber beam to carry those loads, specifies the required padstones
              and bearing lengths, and confirms that the elements taking the new loads are adequate.
              We provide full structural calculations and a clear drawing package that your builder
              can work from and your building control officer can approve.
            </p>
            <p style={styles.p}>
              All load-bearing wall removal works are notifiable under the Building Regulations in
              England. This means you must have building control oversight before and during the
              work, and structural calculations approved in advance. Skipping this step creates
              problems when you come to sell the property, as buyers&apos; solicitors routinely
              request evidence of approved structural works.
            </p>

            <h2 style={styles.h2}>RSJ and Steel Beam Design for Wall Openings</h2>
            <p style={styles.p}>
              The most common solution for load-bearing wall removal in London&apos;s residential
              stock is a steel universal beam, commonly referred to as an RSJ. The beam section
              required depends on the span of the opening, the loads carried above, and the
              bearing conditions available at each end.
            </p>
            <p style={styles.p}>
              DVC Engineering calculates the required beam section using current British Standards
              and Eurocodes, checks the adequacy of the bearing points, and specifies the padstones
              required to distribute the beam reactions into the supporting structure. We also
              check whether any temporary propping is required during construction and provide
              propping guidance where needed.
            </p>
            <p style={styles.p}>
              For larger openings, particularly in semi-detached and detached properties across
              Wandsworth, Merton, and Richmond, a double or triple beam configuration may be
              required. Where ceiling heights are limited, we explore slim-floor or Speedfloor
              solutions to minimise the beam depth.
            </p>

            <h2 style={styles.h2}>Chimney Breast Removal and Party Wall Structures</h2>
            <p style={styles.p}>
              Chimney breast removal is one of the most structurally sensitive works in Victorian
              terraced housing. London&apos;s 19th-century stock, common in Islington, Hackney,
              Southwark, and Camden, typically has chimney stacks running through three or four
              floors. Removing a breast at ground floor level while leaving the stack above
              requires corbelling or steel needling to transfer the stack loads safely.
            </p>
            <p style={styles.p}>
              DVC Engineering has extensive experience designing chimney breast removal solutions
              across London, including needle beam systems, corbelling designs, and full chimney
              stack removal sequences. We also assess implications under the Party Wall etc. Act
              1996 where the chimney is on a party wall, and can provide structural input for
              party wall agreements if required.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'How do I know if a wall is load-bearing?',
                    a: 'You should commission a structural engineer to assess this. Key indicators include the direction of floor joists (a wall running perpendicular to joists is more likely to be load-bearing), the wall\'s position relative to the structure, and what sits directly above. Do not rely on visual assessment alone.',
                  },
                  {
                    q: 'Can I remove a load-bearing wall without building control approval?',
                    a: 'No. This is notifiable building work. Carrying it out without approval creates problems when selling the property and may require expensive retrospective sign-off. We strongly advise against proceeding without proper approval.',
                  },
                  {
                    q: 'Will the structural engineer visit my property?',
                    a: 'Yes. A site visit is typically required to assess the existing structure and confirm the loads and bearing conditions before we can prepare calculations. Site visits across London are included in our standard fee for this service.',
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
              <h3 style={styles.sidebarHeading}>Request Calculations</h3>
              <p style={styles.sidebarText}>
                Tell us the property address, which wall you plan to remove, and your timeline. We will arrange a site visit and confirm pricing.
              </p>
              <Link href="/contact" style={styles.sidebarBtn}>Get in touch</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/steel-beam-design" style={styles.sidebarLink}>Steel and Timber Beam Design</Link></li>
                <li><Link href="/services/temporary-works" style={styles.sidebarLink}>Temporary Works</Link></li>
                <li><Link href="/services/building-control" style={styles.sidebarLink}>Building Control Coordination</Link></li>
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
