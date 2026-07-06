import Link from 'next/link';
import SiteLayout from '../components/site/SiteLayout';
import Seo, { organizationSchema, faqSchema } from '../components/site/Seo';
import { BUSINESS, SERVICES, FAQS } from '../lib/siteData';

export default function Home() {
  return (
    <SiteLayout>
      <Seo
        title="Structural Engineers in London"
        description="DVC Engineering is a London structural engineering consultancy providing calculations, drawings and Building Regulations support for loft conversions, extensions, basements and new builds across London, Surrey, Sussex and the Midlands."
        path="/"
        jsonLd={[organizationSchema(), faqSchema(FAQS.slice(0, 4))]}
      />

      <section className="mkt-section">
        <span className="t-label" style={{ display: 'inline-block', marginBottom: 10 }}>Structural Engineering Consultancy · London</span>
        <h1 className="mkt-h1">Structural engineering for extensions, loft conversions and new builds.</h1>
        <p className="mkt-lede">
          DVC Engineering produces structural calculations and drawings that get residential and commercial
          projects through Building Regulations — for homeowners, architects and builders across London and
          the South East.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/contact" className="btn btn-orange">Get a Quote</Link>
          <Link href="/services" className="btn btn-outline">See Our Services</Link>
        </div>
      </section>

      <section className="mkt-section">
        <h2 className="mkt-h2">What we do</h2>
        <p className="mkt-body" style={{ marginBottom: 24, maxWidth: 720 }}>
          Whatever the project — a loft conversion, a rear extension, a basement, or a full new build — we
          provide the structural calculations, drawings and Building Control liaison needed to get it built.
        </p>
        <div className="mkt-grid">
          {SERVICES.map((s) => (
            <div key={s.slug} className="mkt-card">
              <h3 className="mkt-h3" style={{ fontSize: 16 }}>{s.name}</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.6 }}>{s.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mkt-section">
        <h2 className="mkt-h2">Where we work</h2>
        <p className="mkt-body" style={{ maxWidth: 720, marginBottom: 16 }}>
          We cover every London borough, plus Surrey, West Sussex, East Sussex &amp; Brighton, Birmingham &amp;
          the West Midlands, and the Milton Keynes / Northamptonshire / Luton corridor.
        </p>
        <Link href="/areas-we-cover" className="btn btn-outline">View Full Coverage Area</Link>
      </section>

      <section className="mkt-section">
        <h2 className="mkt-h2">Frequently asked questions</h2>
        <div className="mkt-faq">
          {FAQS.slice(0, 4).map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" style={{ fontSize: 14, fontWeight: 600 }}>Read the full FAQ →</Link>
      </section>

      <section className="mkt-section" style={{ marginBottom: 0 }}>
        <div className="mkt-card" style={{ padding: 32, textAlign: 'center' }}>
          <h2 className="mkt-h2">Ready to start your project?</h2>
          <p className="mkt-body" style={{ margin: '0 auto 20px', maxWidth: 480 }}>
            Send us your site address and a brief description of the works and we'll come back with a quote.
          </p>
          <a href={`mailto:${BUSINESS.email}`} className="btn btn-orange">Email {BUSINESS.email}</a>
        </div>
      </section>
    </SiteLayout>
  );
}
