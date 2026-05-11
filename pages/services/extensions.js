import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'House Extension Structural Engineering',
    description: 'Structural design for single-storey, double-storey, side, and wraparound extensions across London. Full calculations and construction drawings for building regulations approval.',
    url: 'https://dvceng.com/services/extensions',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Extensions', path: '/services/extensions' },
  ]),
  faqSchema([
    {
      question: 'Do I need a structural engineer for a house extension?',
      answer: 'Yes. Extensions require structural calculations for building regulations approval, covering foundations, structural walls, floor and roof design, and any beam elements where walls are removed to open up to the new extension.',
    },
    {
      question: 'What is the difference between a structural engineer and an architect for extensions?',
      answer: 'An architect designs the appearance, layout, and planning of the extension. A structural engineer ensures the structure is safe and compliant, providing the calculations and drawings that building control require.',
    },
  ]),
];

export default function Extensions() {
  return (
    <Layout>
      <SEO
        title="House Extension Structural Engineer London | Calculations and Drawings | DVC Engineering"
        description="Structural calculations and drawings for house extensions across London. Rear extensions, side extensions, double-storey, and wraparound designs. Building regulations compliant. DVC Engineering."
        canonical="/services/extensions"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Extensions</span>
          </nav>
          <h1 style={styles.h1}>House Extension Structural Engineering in London</h1>
          <p style={styles.heroText}>
            Complete structural design packages for rear, side, and double-storey extensions.
            Foundation design, beam specifications, and building control drawings delivered to your architect.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Start your extension</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>What Structural Engineering an Extension Requires</h2>
            <p style={styles.p}>
              Extending a house is not simply a planning matter. Once planning permission is
              granted, you need building regulations approval before construction can begin, and
              structural calculations are a mandatory part of that submission. The structural
              engineer&apos;s role is to design every load-bearing element of the extension so
              that it performs safely over the life of the building.
            </p>
            <p style={styles.p}>
              This includes foundation design appropriate to the soil conditions and proximity of
              trees and drains, structural wall and masonry design, roof structure calculations
              for pitched or flat roof extensions, and beam design where the rear wall of the
              existing house is opened up to connect to the new space. DVC Engineering provides
              a complete structural package ready for building control submission, coordinated
              with your architect&apos;s drawings.
            </p>
            <p style={styles.p}>
              For larger extensions or those in conservation areas, we also provide input for
              party wall matters and can advise on temporary works requirements during construction.
            </p>

            <h2 style={styles.h2}>Rear Extensions, Side Returns, and Double-storey Designs</h2>
            <p style={styles.p}>
              The rear extension is the most common type across London&apos;s terraced stock.
              A typical single-storey rear extension involves opening up the rear wall of the
              existing house with a large steel beam spanning between the party walls, a new flat
              or pitched roof structure, and new foundations tied in to those of the existing house.
              In many London properties, particularly those in Hackney, Islington, and Southwark,
              proximity to shared drains and mature trees requires careful foundation design.
            </p>
            <p style={styles.p}>
              Side return extensions, common in Victorian terraces with a narrow side passage,
              introduce additional structural considerations: the side wall is often load-bearing,
              and removing it requires a large steel beam or a series of columns to carry the
              loads above. We assess the existing structure, design the opening solution, and
              provide detailed drawings.
            </p>
            <p style={styles.p}>
              Double-storey extensions require a more complex structural package, including upper
              floor design, wall panel calculations, and confirmation that existing foundations
              can accept the additional loads imposed by the upper storey. Where they cannot,
              we design a new or extended foundation solution.
            </p>

            <h2 style={styles.h2}>Foundation Design for London Extensions</h2>
            <p style={styles.p}>
              Foundation design is often the most technically demanding part of an extension
              project in London. London Clay, which underlies much of south, east, and central
              London, is highly susceptible to shrink-swell movement driven by tree root activity
              and seasonal moisture variation. Building control officers in boroughs including
              Lambeth, Wandsworth, Barnet, and Camden apply strict requirements on foundation
              depth where trees are present within influencing distance.
            </p>
            <p style={styles.p}>
              DVC Engineering carries out a ground assessment, reviews available soil data, considers
              tree species and distances, and designs strip, pad, or raft foundations appropriate
              to the conditions. Where deeper foundations are required, we design trench fill or
              piled solutions with structural ground beams. All foundation designs are submitted
              with full calculations and drawings for building control approval.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'When should I involve a structural engineer in my extension project?',
                    a: 'Ideally at the planning stage, so that structural feasibility can inform the architectural design. At a minimum, involve a structural engineer once planning permission is granted and before your architect finalises the building regulations drawings.',
                  },
                  {
                    q: 'Do you work with architects on extensions?',
                    a: 'Yes. We regularly coordinate with architects throughout London to provide structural input that aligns with the architectural design intent. We can receive drawings electronically and return a coordinated structural package within the architect\'s programme.',
                  },
                  {
                    q: 'How deep will the foundations need to be for my extension?',
                    a: 'This depends on the soil type, the presence of trees, and the loads the extension will impose. In London Clay areas with nearby trees, building control often requires foundations at 1.5 to 2.5 metres depth. We assess this on a project-by-project basis.',
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
              <p style={styles.sidebarText}>Share your architect&apos;s drawings and we will provide a fixed fee for the structural package.</p>
              <Link href="/contact" style={styles.sidebarBtn}>Send drawings</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/foundation-design" style={styles.sidebarLink}>Foundation Design</Link></li>
                <li><Link href="/services/load-bearing-wall-removal" style={styles.sidebarLink}>Load-bearing Wall Removal</Link></li>
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
