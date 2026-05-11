import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { breadcrumbSchema } from '../../components/Schema';

const schema = breadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Resources', path: '/blog' },
]);

const ARTICLES = [
  {
    slug: 'do-i-need-a-structural-engineer-for-a-loft-conversion',
    title: 'Do I Need a Structural Engineer for a Loft Conversion?',
    excerpt: 'Building regulations require structural calculations for all loft conversions involving structural alterations. This guide explains exactly what a structural engineer does in a loft conversion and when you need one.',
    date: '2025-03-15',
    readTime: '7 min read',
    tags: ['Loft Conversions', 'Building Regulations'],
  },
  {
    slug: 'how-to-remove-a-load-bearing-wall',
    title: 'How to Remove a Load-bearing Wall: What Homeowners Need to Know',
    excerpt: 'Removing a load-bearing wall requires structural calculations, a steel beam, and building regulations approval. This guide covers the process from assessment to sign-off.',
    date: '2025-03-28',
    readTime: '8 min read',
    tags: ['Load-bearing Walls', 'Steel Beams'],
  },
  {
    slug: 'structural-survey-vs-homebuyers-report',
    title: 'Structural Survey vs Homebuyer\'s Report: Which Do You Need?',
    excerpt: 'Not all property surveys are the same. Understanding the difference between a structural survey and a homebuyer\'s report is essential before you buy property in London.',
    date: '2025-04-10',
    readTime: '6 min read',
    tags: ['Structural Surveys', 'Property Buying'],
  },
];

const CONTENT_PLAN = [
  { title: 'Do I Need a Structural Engineer for a Loft Conversion?', keyword: 'do I need structural engineer loft conversion', status: 'published' },
  { title: 'How to Remove a Load-bearing Wall: What Homeowners Need to Know', keyword: 'how to remove a load bearing wall London', status: 'published' },
  { title: 'Structural Survey vs Homebuyer\'s Report: Which Do You Need?', keyword: 'structural survey vs homebuyers report', status: 'published' },
  { title: 'How Deep Do Foundations Need to Be for an Extension?', keyword: 'foundation depth extension London', status: 'planned' },
  { title: 'Chimney Breast Removal: Structural Considerations for London Homes', keyword: 'chimney breast removal structural engineer London', status: 'planned' },
  { title: 'Party Wall Agreements and Structural Engineers: What You Need to Know', keyword: 'party wall structural engineer London', status: 'planned' },
  { title: 'What Is an RSJ Beam and When Do You Need One?', keyword: 'what is an RSJ beam', status: 'planned' },
  { title: 'London Clay and Your Foundations: A Homeowner\'s Guide', keyword: 'London clay foundations subsidence', status: 'planned' },
  { title: 'Building Regulations for House Extensions: A Complete Guide', keyword: 'building regulations house extension London', status: 'planned' },
  { title: 'Dormer vs Hip-to-Gable Loft Conversion: Structural Differences', keyword: 'dormer vs hip to gable loft conversion structural', status: 'planned' },
  { title: 'What Happens If You Don\'t Get Building Regulations Approval for Structural Works?', keyword: 'no building regulations approval structural works', status: 'planned' },
  { title: 'Temporary Works: What They Are and When You Need a Designer', keyword: 'temporary works design London', status: 'planned' },
];

export default function BlogIndex() {
  return (
    <Layout>
      <SEO
        title="Structural Engineering Resources and Guides | DVC Engineering"
        description="Guides and resources on structural engineering for London homeowners, architects, and developers. Covering loft conversions, extensions, load-bearing walls, foundations, and more."
        canonical="/blog"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Resources</span>
          </nav>
          <h1 style={styles.h1}>Structural Engineering Resources</h1>
          <p style={styles.heroText}>
            Practical guides for homeowners, architects, and developers on structural engineering
            for London residential and commercial projects.
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <section style={styles.articlesSection}>
          <h2 style={styles.sectionHeading}>Published Guides</h2>
          <div style={styles.articleGrid}>
            {ARTICLES.map(({ slug, title, excerpt, date, readTime, tags }) => (
              <Link key={slug} href={`/blog/${slug}`} style={styles.articleCard}>
                <div style={styles.articleMeta}>
                  <time dateTime={date} style={styles.articleDate}>
                    {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                  <span style={styles.articleReadTime}>{readTime}</span>
                </div>
                <h3 style={styles.articleTitle}>{title}</h3>
                <p style={styles.articleExcerpt}>{excerpt}</p>
                <div style={styles.articleTags}>
                  {tags.map(tag => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </div>
                <span style={styles.articleCta}>Read guide &rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        <section style={styles.planSection}>
          <h2 style={styles.sectionHeading}>Coming Soon</h2>
          <div style={styles.planGrid}>
            {CONTENT_PLAN.filter(a => a.status === 'planned').map(({ title, keyword }) => (
              <div key={title} style={styles.planCard}>
                <h3 style={styles.planTitle}>{title}</h3>
                <span style={styles.planTag}>Coming soon</span>
              </div>
            ))}
          </div>
        </section>

        <div style={styles.ctaBanner}>
          <h2 style={styles.ctaHeading}>Have a structural engineering question?</h2>
          <p style={styles.ctaText}>
            If you cannot find the answer here, contact DVC Engineering directly. We respond to all enquiries within one working day.
          </p>
          <Link href="/contact" style={styles.ctaBtn}>Send an enquiry</Link>
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
  heroText: { fontSize: 18, color: '#c8d0dc', margin: 0, maxWidth: 580, lineHeight: 1.6 },
  articlesSection: { marginBottom: 64 },
  sectionHeading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: '#0A1628', margin: '0 0 28px' },
  articleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 },
  articleCard: {
    background: '#fff',
    border: '1px solid #E4E0D8',
    borderRadius: 10,
    padding: '28px',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0 1px 3px rgba(10,22,40,0.06)',
  },
  articleMeta: { display: 'flex', gap: 16, alignItems: 'center' },
  articleDate: { fontSize: 13, color: '#8a96a8' },
  articleReadTime: { fontSize: 13, color: '#8a96a8' },
  articleTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, color: '#0A1628', margin: 0, lineHeight: 1.25 },
  articleExcerpt: { fontSize: 14, lineHeight: 1.65, color: '#3d4f6b', margin: 0, flexGrow: 1 },
  articleTags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tag: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8F7F5', color: '#3d4f6b', padding: '3px 8px', borderRadius: 4 },
  articleCta: { fontSize: 14, fontWeight: 600, color: '#F4822A' },
  planSection: { marginBottom: 64 },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  planCard: { background: '#F8F7F5', border: '1px solid #E4E0D8', borderRadius: 8, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  planTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 16, color: '#3d4f6b', margin: 0, lineHeight: 1.3, flexGrow: 1 },
  planTag: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#E4E0D8', color: '#8a96a8', padding: '3px 8px', borderRadius: 4, flexShrink: 0 },
  ctaBanner: { background: '#0A1628', borderRadius: 12, padding: '48px', marginBottom: 64, display: 'flex', flexDirection: 'column', gap: 16 },
  ctaHeading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: '#F8F7F5', margin: 0 },
  ctaText: { color: '#c8d0dc', fontSize: 16, margin: 0, maxWidth: 500, lineHeight: 1.6 },
  ctaBtn: { background: '#F4822A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 7, fontWeight: 600, fontSize: 15, alignSelf: 'flex-start' },
};
