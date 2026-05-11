import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../components/Schema';

const schema = [
  serviceSchema({
    name: 'Structural Adequacy Report',
    description: 'Formal written assessments confirming structural adequacy for lenders, solicitors, insurers, and local authorities. Covers conversions, alterations, and properties with building regulations concerns.',
    url: 'https://dvceng.com/services/structural-adequacy-reports',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Structural Adequacy Reports', path: '/services/structural-adequacy-reports' },
  ]),
  faqSchema([
    {
      question: 'What is a structural adequacy report?',
      answer: 'A structural adequacy report is a formal written assessment by a structural engineer confirming whether a structure, or a particular element of a structure, meets current structural requirements. It is commonly requested by mortgage lenders, solicitors, and local authority building control where there is uncertainty about whether works have been carried out correctly.',
    },
    {
      question: 'When do lenders require a structural adequacy report?',
      answer: 'Lenders typically request structural adequacy reports for properties where structural alterations have been carried out without building regulations approval, where the property has been converted from one use to another, or where visible structural concerns were noted during a mortgage valuation.',
    },
    {
      question: 'How long does it take to produce a structural adequacy report?',
      answer: 'DVC Engineering typically delivers a structural adequacy report within five to seven working days of a site inspection, depending on the scope and complexity of the assessment required.',
    },
  ]),
];

export default function StructuralAdequacyReports() {
  return (
    <Layout>
      <SEO
        title="Structural Adequacy Reports London | Structural Engineer Reports for Lenders | DVC Engineering"
        description="Structural adequacy reports for mortgage lenders, solicitors, and local authorities across London. Formal written assessments of structural condition and compliance. DVC Engineering, EC2A."
        canonical="/services/structural-adequacy-reports"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <a href="/services" style={styles.breadcrumbLink}>Services</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Structural Adequacy Reports</span>
          </nav>
          <h1 style={styles.h1}>Structural Adequacy Reports in London</h1>
          <p style={styles.heroText}>
            Formal written assessments confirming structural adequacy for mortgage lenders,
            solicitors, insurers, and local authorities. Accepted across London and the South East.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Request a report</Link>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.contentGrid}>
          <article style={styles.article}>
            <h2 style={styles.h2}>What a Structural Adequacy Report Covers</h2>
            <p style={styles.p}>
              A structural adequacy report is a professional assessment by a structural engineer
              confirming whether a building or specific structural element meets current structural
              requirements and is fit for its intended purpose. It differs from a structural survey
              in that it typically focuses on a specific aspect of the structure, such as an
              alteration that may have been carried out without building regulations approval,
              or the structural adequacy of a conversion for mortgage or insurance purposes.
            </p>
            <p style={styles.p}>
              DVC Engineering produces structural adequacy reports for a range of specific
              circumstances. The most common are: properties where load-bearing walls have been
              removed or openings formed without an approved structural package; loft conversions
              carried out without building regulations approval; flat conversions where the floor
              structure adequacy is in question; and properties with visible cracking or distortion
              where a lender requires a professional opinion before proceeding.
            </p>
            <p style={styles.p}>
              Each report includes a description of the works or elements assessed, photographic
              evidence, a professional opinion on structural adequacy, and, where relevant,
              recommendations for any remedial or retrospective approval actions required.
            </p>

            <h2 style={styles.h2}>Reports for Mortgage Lenders and Solicitors</h2>
            <p style={styles.p}>
              Mortgage lenders frequently require a structural engineer&apos;s report when their
              valuation surveyor identifies structural concerns, when the property has undergone
              alterations without documentation, or when the property is a conversion from
              commercial or industrial use. DVC Engineering produces reports in a format that
              addresses lender requirements directly, providing the professional opinion and
              supporting evidence needed for the lender to proceed.
            </p>
            <p style={styles.p}>
              Solicitors acting in property transactions often request structural adequacy reports
              to satisfy buyers who have concerns about structural works at a property. Where the
              seller cannot produce building regulations approval for structural works, a structural
              adequacy report from a qualified engineer can provide the necessary reassurance to
              progress the sale.
            </p>
            <p style={styles.p}>
              DVC Engineering is instructed by solicitors, estate agents, homeowners, and
              purchasers across London for this type of report. We aim to complete site inspections
              within five working days of instruction, with reports delivered promptly to meet
              transaction timescales.
            </p>

            <h2 style={styles.h2}>Retrospective Structural Approval</h2>
            <p style={styles.p}>
              Where structural works have been carried out without building regulations approval
              and the local authority building control department requires retrospective approval
              or a regularisation certificate, a structural engineer&apos;s report is a core
              element of the regularisation application. DVC Engineering assesses the works
              carried out, confirms whether they are structurally adequate, and provides the
              calculations and report required for the regularisation submission.
            </p>
            <p style={styles.p}>
              In some cases, where works are not structurally adequate as built, we identify
              the remedial measures needed and design those measures, so that the regularisation
              application can proceed once the works are completed. We have experience with
              regularisation cases across all London boroughs and understand the requirements
              of each local authority&apos;s building control department.
            </p>

            <section style={styles.faqSection} aria-labelledby="faq-heading">
              <h2 id="faq-heading" style={styles.h2}>Common Questions</h2>
              <div style={styles.faqList}>
                {[
                  {
                    q: 'My mortgage lender is asking for a structural engineer\'s report. What do I need?',
                    a: 'You need a structural adequacy report from a qualified structural engineer, inspecting the element or alteration that the lender has flagged, and providing a professional opinion on its structural adequacy. DVC Engineering can produce this report, typically within one week of instruction.',
                  },
                  {
                    q: 'Can a structural adequacy report replace building regulations approval?',
                    a: 'A structural adequacy report is not a substitute for building regulations approval. However, it can satisfy lenders and solicitors where formal approval is not available, and it forms part of a regularisation application where retrospective approval is being sought.',
                  },
                  {
                    q: 'How much does a structural adequacy report cost in London?',
                    a: 'The cost depends on the scope of the assessment required. Contact DVC Engineering with the details of the property and the specific element to be assessed, and we will provide a fixed-price quotation.',
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
              <h3 style={styles.sidebarHeading}>Request a Report</h3>
              <p style={styles.sidebarText}>Tell us what your lender or solicitor has requested. We will confirm scope, pricing, and availability within one working day.</p>
              <Link href="/contact" style={styles.sidebarBtn}>Get in touch</Link>
            </div>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarHeading}>Related Services</h3>
              <ul style={styles.sidebarList}>
                <li><Link href="/services/structural-surveys" style={styles.sidebarLink}>Structural Surveys</Link></li>
                <li><Link href="/services/building-control" style={styles.sidebarLink}>Building Control Coordination</Link></li>
                <li><Link href="/services/foundation-design" style={styles.sidebarLink}>Foundation Design</Link></li>
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
