import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'Foundation Design',
    description: 'Foundation assessment, new foundation design, and underpinning specifications for extensions, new builds, and structures showing movement. Serving London and the South East.',
    url: 'https://dvceng.com/services/foundation-design',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Foundation Design', path: '/services/foundation-design' },
  ]),
  faqSchema([
    {
      question: 'Do I need a structural engineer for foundation design?',
      answer: 'Yes. Foundation design requires assessment of soil conditions, loading from the structure above, and proximity of trees and drainage. Building control requires calculations prepared by a qualified structural engineer.',
    },
    {
      question: 'What causes foundation movement in London?',
      answer: 'The primary causes of foundation movement in London are tree root activity causing clay soil shrinkage, leaking drains softening the ground beneath foundations, and the natural shrink-swell behaviour of London Clay. Victorian and Edwardian properties are most commonly affected.',
    },
    {
      question: 'What is underpinning?',
      answer: 'Underpinning is the process of strengthening or deepening existing foundations that are inadequate or have been affected by movement. It involves excavating beneath the existing foundation in sections and constructing new, deeper foundations below.',
    },
  ]),
];

export default function FoundationDesign() {
  return (
    <Layout>
      <SEO
        title="Foundation Design London | Underpinning and Structural Foundation Engineer | DVC Engineering"
        description="Foundation design and underpinning specifications for extensions, new builds, and properties showing movement across London. London Clay specialist. DVC Engineering, EC2A."
        canonical="/services/foundation-design"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Foundation Design</span>
          </nav>
          <h1 style={styles.h1}>Foundation Design for London Properties</h1>
          <p style={styles.heroText}>
            New foundation design, underpinning specifications, and foundation assessments for
            properties across London. Experienced in the challenges of London Clay and tree proximity.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Discuss your project</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>Foundation Design for Extensions and New Builds</h2>
            <p style={styles.p}>
              Every extension and new build in London requires designed foundations. The type,
              size, and depth of foundations depends on the loads imposed, the bearing capacity
              of the underlying soil, the presence of trees and their root zones, and the
              proximity of existing drainage. In London, where much of the capital sits on highly
              compressible London Clay, these factors require careful engineering assessment rather
              than reliance on standard depth tables.
            </p>
            <p style={styles.p}>
              DVC Engineering provides foundation design for strip foundations, pad foundations,
              raft foundations, trench fill, and piled solutions. For each project, we assess
              the specific ground conditions, review available geotechnical information, consider
              tree influence zones in accordance with NHBC guidance, and design the most economical
              foundation solution that satisfies building regulations requirements.
            </p>
            <p style={styles.p}>
              Our foundation designs are coordinated with the structural design above ground,
              ensuring that column and wall loads are correctly transferred to the foundation
              and that differential settlement is considered for extensions joining onto existing
              structures with different foundation types.
            </p>

            <h2 style={styles.h2}>Underpinning London Properties</h2>
            <p style={styles.p}>
              Foundation movement is a common problem in London&apos;s older housing stock. Victorian
              properties in areas including Islington, Hackney, Lambeth, and Southwark frequently
              have shallow brick foundations that were adequate for their original loading but
              have since been affected by tree root activity, drainage failures, or changes in
              the moisture content of London Clay.
            </p>
            <p style={styles.p}>
              Where underpinning is required, DVC Engineering designs the underpinning scheme,
              specifies the sequence of works, and provides the structural calculations required
              for building control approval and contractor pricing. We specify conventional mass
              concrete underpinning where conditions allow, and beam and base or piled underpinning
              where access or ground conditions make traditional methods impractical.
            </p>
            <p style={styles.p}>
              We also carry out foundation assessments for lenders and purchasers who require
              a structural engineer&apos;s opinion on the adequacy of existing foundations before
              proceeding with a purchase or extending an existing property. These assessments
              are provided as formal written reports with photographic evidence and clear
              recommendations.
            </p>

            <h2 style={styles.h2}>Tree Root Impact and London Clay Foundation Depth</h2>
            <p style={styles.p}>
              The interaction between trees and London Clay creates one of the most significant
              structural challenges for domestic extensions across the capital. London Clay swells
              when wet and shrinks when dry. Mature trees extract moisture over a radius that
              can extend to their full height or beyond, creating zones of shrinkage that cause
              foundation settlement in dry periods.
            </p>
            <p style={styles.p}>
              Building regulations in London require new foundations near trees to be designed
              to avoid being affected by this moisture variation. DVC Engineering determines the
              required foundation depth based on tree species, height, distance, and NHBC guidance,
              and designs foundations that will remain stable throughout their life. This is a
              particular concern in areas such as Barnet, Haringey, and Enfield, where established
              street trees are common.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'How deep will my extension foundations need to be?',
                    a: 'This depends on soil type, tree proximity, and the loads imposed. In London Clay with no trees nearby, 1.0 metre is a common minimum. With trees present, foundations may need to extend to 1.5 to 2.5 metres or deeper. We calculate this for each project individually.',
                  },
                  {
                    q: 'My house has cracks. Do I need underpinning?',
                    a: 'Not necessarily. Many cracks in older properties are superficial and caused by thermal movement or mortar shrinkage. A structural survey will determine whether the cracking indicates foundation movement and whether remedial works are needed.',
                  },
                  {
                    q: 'Does foundation work affect my neighbour?',
                    a: 'If the foundation work is adjacent to or beneath a party wall, it may be notifiable under the Party Wall etc. Act 1996. We can advise on whether this applies and provide the structural information a party wall surveyor requires.',
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
              <h3 style={styles.sidebarHeading}>Discuss Your Project</h3>
              <p style={styles.sidebarText}>Tell us about your project and the ground conditions you are dealing with. We will advise on the approach and provide a fixed fee.</p>
              <Link href="/contact" style={styles.sidebarBtn}>Get in touch</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/extensions" style={styles.sidebarLink}>Extensions</Link></li>
                <li><Link href="/services/structural-surveys" style={styles.sidebarLink}>Structural Surveys</Link></li>
                <li><Link href="/services/structural-adequacy-reports" style={styles.sidebarLink}>Structural Adequacy Reports</Link></li>
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
