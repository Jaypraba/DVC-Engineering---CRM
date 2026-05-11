import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { articleSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  articleSchema({
    headline: "Structural Survey vs Homebuyer's Report: Which Do You Need?",
    description: "Not all property surveys are the same. Understanding the difference between a structural survey and a homebuyer's report is essential before buying property in London.",
    datePublished: '2025-04-10',
    url: '/blog/structural-survey-vs-homebuyers-report',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/blog' },
    { name: "Structural Survey vs Homebuyer's Report", path: '/blog/structural-survey-vs-homebuyers-report' },
  ]),
  faqSchema([
    {
      question: "What is the difference between a structural survey and a homebuyer's report?",
      answer: "A homebuyer's report is a standardised condition assessment by a surveyor covering the general condition of the property. A structural survey is a focused technical assessment by a structural engineer examining the load-bearing structure in depth, identifying defects, assessing their cause and severity, and providing professional recommendations.",
    },
    {
      question: 'Do I need a structural survey to buy a house?',
      answer: 'Not always, but you should consider one for older properties (pre-1920), properties with visible cracking or movement, properties with significant alterations or extensions, or any property where a mortgage valuer or homebuyer\'s surveyor has flagged a structural concern.',
    },
    {
      question: 'How much does a structural survey cost in London?',
      answer: 'The cost depends on the size and complexity of the property. Contact DVC Engineering for a fixed-price quotation based on the specific property.',
    },
  ]),
];

export default function StructuralSurveyArticle() {
  return (
    <Layout>
      <SEO
        title="Structural Survey vs Homebuyer's Report: Which Do You Need? | DVC Engineering"
        description="A clear explanation of the difference between a structural survey and a homebuyer's report, when each is appropriate, and how to decide which type of survey to commission before buying property in London."
        canonical="/blog/structural-survey-vs-homebuyers-report"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/blog" style={styles.breadcrumbLink}>Resources</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Property Surveys</span>
          </nav>
          <div style={styles.tagRow}>
            <span style={styles.tag}>Structural Surveys</span>
            <span style={styles.tag}>Property Buying</span>
          </div>
          <h1 style={styles.h1}>Structural Survey vs Homebuyer&apos;s Report: Which Do You Need?</h1>
          <div style={styles.articleMeta}>
            <time dateTime="2025-04-10">10 April 2025</time>
            <span>6 min read</span>
            <span>DVC Engineering</span>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <p style={styles.intro}>
              When you buy a property in London, the bank&apos;s mortgage valuation is not a survey.
              It tells you what the lender thinks the property is worth, not whether the building
              is in good condition. If you want to know the condition of the property you are
              buying, you need a survey. But which type? This guide explains the difference between
              a structural survey and a homebuyer&apos;s report, and helps you decide which is right
              for your situation.
            </p>

            <h2 style={styles.h2}>What Is a Homebuyer&apos;s Report?</h2>
            <p style={styles.p}>
              A homebuyer&apos;s report is a standardised survey product, most commonly produced
              to the RICS HomeBuyer Report format. It is carried out by a building surveyor and
              covers the general visible condition of the property. The report works through the
              main elements of the building, including roof, walls, windows, floors, and services,
              and assigns a condition rating of 1 (no repair needed), 2 (repair or replacement
              needed but not urgent), or 3 (serious defects requiring investigation or repair
              before exchange).
            </p>
            <p style={styles.p}>
              A homebuyer&apos;s report is a relatively quick, standardised document. It tells you
              whether there are visible signs of a problem, but it does not investigate the cause
              of those signs, assess their structural significance, or provide a professional
              opinion on what remedial action is needed. Where the surveyor has a concern, the
              report will recommend further investigation, which typically means instructing a
              specialist, such as a structural engineer.
            </p>
            <p style={styles.p}>
              The homebuyer&apos;s report is appropriate for conventional, relatively modern properties
              in apparently reasonable condition. For a 1990s house in sound condition, a homebuyer&apos;s
              report may well be sufficient.
            </p>

            <h2 style={styles.h2}>What Is a Structural Survey?</h2>
            <p style={styles.p}>
              A structural survey is a focused technical assessment carried out by a structural
              engineer. Unlike a homebuyer&apos;s report, it is not standardised. The scope is tailored
              to the property and the client&apos;s concerns, but typically covers the primary
              load-bearing elements of the building in depth: foundations, structural walls, floors,
              roof structure, and any structural alterations that have been made to the property.
            </p>
            <p style={styles.p}>
              Where a structural issue is identified, the report does not simply flag it and recommend
              further investigation. It assesses the cause, evaluates the significance, identifies
              whether it represents an active or historic problem, and provides a professional opinion
              on what is needed. This might be a recommendation for monitoring over time, a scope of
              remedial works, or advice on the structural implications for a proposed alteration.
            </p>
            <p style={styles.p}>
              A structural survey is carried out by a structural engineer, who has professional
              accountability for the opinions expressed in the report. This matters when the report
              is being used for conveyancing purposes, for lender requirements, or for insurance.
            </p>

            <h2 style={styles.h2}>The Key Differences</h2>
            <div style={styles.comparisonTable}>
              <div style={styles.compHeader}>
                <div style={styles.compCell}></div>
                <div style={{ ...styles.compCell, fontWeight: 700, color: '#0A1628' }}>Homebuyer&apos;s Report</div>
                <div style={{ ...styles.compCell, fontWeight: 700, color: '#0A1628' }}>Structural Survey</div>
              </div>
              {[
                ['Carried out by', 'Building surveyor', 'Structural engineer'],
                ['Scope', 'Standardised, all visible elements', 'Tailored, focused on structure'],
                ['Depth of investigation', 'Surface condition', 'Cause, significance, recommendations'],
                ['When flagging concerns', 'Recommends further investigation', 'Provides professional opinion'],
                ['Appropriate for', 'Modern properties in good condition', 'Older, altered, or structurally complex properties'],
                ['Lender acceptance', 'Generally accepted for standard mortgages', 'Required by some lenders for specific concerns'],
              ].map(([label, col1, col2]) => (
                <div key={label} style={styles.compRow}>
                  <div style={{ ...styles.compCell, fontWeight: 600, color: '#0A1628', fontSize: 14 }}>{label}</div>
                  <div style={{ ...styles.compCell, fontSize: 14, color: '#3d4f6b' }}>{col1}</div>
                  <div style={{ ...styles.compCell, fontSize: 14, color: '#3d4f6b' }}>{col2}</div>
                </div>
              ))}
            </div>

            <h2 style={styles.h2}>When You Need a Structural Survey</h2>
            <p style={styles.p}>
              In London&apos;s property market, a structural survey is the appropriate choice for
              a broader range of properties than many buyers assume. The city&apos;s housing stock
              is predominantly Victorian and Edwardian, much of it over 100 years old, much of
              it substantially altered, and much of it on London Clay, which is inherently
              susceptible to movement.
            </p>
            <p style={styles.p}>
              You should commission a structural survey before purchasing:
            </p>
            <ul style={styles.list}>
              <li style={styles.li}>Any property built before 1920, regardless of visible condition.</li>
              <li style={styles.li}>Any property showing cracks, distortion, or visible signs of movement.</li>
              <li style={styles.li}>Any property that has had significant alterations, extensions, or a loft conversion, particularly if these were carried out without building regulations documentation.</li>
              <li style={styles.li}>Any property with a basement, where waterproofing and structural integrity of the basement structure need assessment.</li>
              <li style={styles.li}>Any property where a homebuyer&apos;s report has flagged structural concerns or recommended further investigation.</li>
              <li style={styles.li}>Any property where your lender has requested a structural engineer&apos;s report as a condition of the mortgage offer.</li>
            </ul>

            <h2 style={styles.h2}>Can a Homebuyer&apos;s Report Identify Structural Problems?</h2>
            <p style={styles.p}>
              A homebuyer&apos;s report can identify visible signs that may indicate structural problems:
              diagonal cracks in brickwork, distorted windows and door frames, sagging floors, and
              visible damp. However, it cannot tell you what is causing those signs, whether they
              are progressive, or what needs to be done. When a homebuyer&apos;s report includes a
              Condition 3 rating for a structural element, it is telling you that the problem needs
              specialist investigation, not that the element is structurally adequate.
            </p>
            <p style={styles.p}>
              The specialist investigation the surveyor is recommending is a structural survey by
              a structural engineer. At that point, commissioning a structural survey is the
              logical next step, and doing so before exchange of contracts gives you the information
              you need to negotiate on price, budget for remedial works, or withdraw from the
              purchase if the structural condition is unsatisfactory.
            </p>

            <h2 style={styles.h2}>Structural Surveys for London Properties</h2>
            <p style={styles.p}>
              DVC Engineering carries out structural surveys across all London boroughs. Our surveys
              are scoped to the property and the client&apos;s specific concerns, include a full
              site inspection, and are delivered as a written report with photographic evidence,
              condition ratings for each element, and clear recommendations.
            </p>
            <p style={styles.p}>
              We typically complete site inspections within five working days of instruction and
              deliver reports within a further three to five working days. Our reports are accepted
              by major UK lenders and are suitable for use in conveyancing.
            </p>

            <div style={styles.conclusion}>
              <h2 style={styles.conclusionHeading}>In Summary</h2>
              <ul style={styles.list}>
                <li style={styles.li}>A homebuyer&apos;s report covers general visible condition; a structural survey investigates structural elements in depth.</li>
                <li style={styles.li}>For any London property built before 1920, or one with visible cracking or alterations, a structural survey is the appropriate choice.</li>
                <li style={styles.li}>If your homebuyer&apos;s report has flagged structural concerns, a structural survey is the recommended next step.</li>
                <li style={styles.li}>A structural survey is carried out by a structural engineer and provides a professional opinion, not just a description of visible condition.</li>
              </ul>
            </div>

            <div style={styles.cta}>
              <h3 style={styles.ctaHeading}>Buying a property in London?</h3>
              <p style={styles.ctaText}>
                DVC Engineering carries out structural surveys across all London boroughs. Contact us
                with the property address and your timeline for a fixed-price quotation.
              </p>
              <Link href="/services/structural-surveys" style={styles.ctaLinkPrimary}>Structural survey service</Link>
              <Link href="/contact" style={styles.ctaLinkSecondary}>Contact us</Link>
            </div>
          </article>

          <aside style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/structural-surveys" style={styles.sidebarLink}>Structural Surveys</Link></li>
                <li><Link href="/services/structural-adequacy-reports" style={styles.sidebarLink}>Structural Adequacy Reports</Link></li>
                <li><Link href="/services/foundation-design" style={styles.sidebarLink}>Foundation Design</Link></li>
              </ul>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Articles</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/blog/do-i-need-a-structural-engineer-for-a-loft-conversion" style={styles.sidebarLink}>Do I Need a Structural Engineer for a Loft Conversion?</Link></li>
                <li><Link href="/blog/how-to-remove-a-load-bearing-wall" style={styles.sidebarLink}>How to Remove a Load-bearing Wall</Link></li>
              </ul>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Commission a Survey</h3>
              <p style={styles.sidebarText}>Fixed-price structural surveys across London, delivered within two weeks.</p>
              <Link href="/contact" style={styles.sidebarBtn}>Contact DVC Engineering</Link>
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
  tagRow: { display: 'flex', gap: 8, marginBottom: 16 },
  tag: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(244,130,42,0.18)', color: '#F4822A', padding: '4px 10px', borderRadius: 4 },
  h1: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 46px)', lineHeight: 1.1, margin: '0 0 20px', color: '#F8F7F5' },
  articleMeta: { fontSize: 13, color: '#8a96a8', display: 'flex', gap: 16 },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' },
  article: {},
  intro: { fontSize: 18, lineHeight: 1.75, color: '#0A1628', margin: '0 0 32px', fontWeight: 500 },
  h2: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 26, color: '#0A1628', margin: '40px 0 16px', lineHeight: 1.2 },
  p: { fontSize: 16, lineHeight: 1.75, color: '#3d4f6b', margin: '0 0 18px' },
  list: { paddingLeft: 0, listStyle: 'none', margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 14 },
  li: { fontSize: 16, lineHeight: 1.7, color: '#3d4f6b', paddingLeft: 20, position: 'relative' },
  comparisonTable: { border: '1px solid #E4E0D8', borderRadius: 8, overflow: 'hidden', marginBottom: 24 },
  compHeader: { display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', background: '#F8F7F5', borderBottom: '1px solid #E4E0D8' },
  compRow: { display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', borderBottom: '1px solid #E4E0D8' },
  compCell: { padding: '12px 16px', fontSize: 13 },
  conclusion: { background: '#F8F7F5', border: '1px solid #E4E0D8', borderRadius: 10, padding: '28px 32px', marginTop: 48 },
  conclusionHeading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, color: '#0A1628', margin: '0 0 16px' },
  cta: { background: '#0A1628', borderRadius: 10, padding: '32px', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 },
  ctaHeading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, color: '#F8F7F5', margin: 0 },
  ctaText: { color: '#c8d0dc', fontSize: 15, lineHeight: 1.65, margin: 0 },
  ctaLinkPrimary: { background: '#F4822A', color: '#fff', textDecoration: 'none', padding: '10px 22px', borderRadius: 7, fontWeight: 600, fontSize: 14, alignSelf: 'flex-start' },
  ctaLinkSecondary: { color: '#c8d0dc', textDecoration: 'none', fontSize: 14, alignSelf: 'flex-start' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 80 },
  sidebarCard: { background: '#F8F7F5', border: '1px solid #E4E0D8', borderRadius: 10, padding: 24 },
  sidebarHeading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, margin: '0 0 14px', color: '#0A1628', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sidebarText: { fontSize: 14, lineHeight: 1.65, color: '#3d4f6b', margin: '0 0 16px' },
  sidebarBtn: { background: '#F4822A', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 7, fontWeight: 600, fontSize: 14, display: 'inline-block' },
  sidebarList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  sidebarLink: { color: '#F4822A', textDecoration: 'none', fontSize: 14 },
};
