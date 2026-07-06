import Link from 'next/link';
import SiteLayout from '../components/site/SiteLayout';
import Seo, { breadcrumbSchema } from '../components/site/Seo';
import { LONDON_BOROUGHS, NATIONAL_REGIONS } from '../lib/siteData';

export default function AreasWeCover() {
  return (
    <SiteLayout>
      <Seo
        title="Areas We Cover"
        description="DVC Engineering provides structural engineering services across every London borough, plus Surrey, West Sussex, East Sussex & Brighton, Birmingham & the West Midlands, and the Milton Keynes / Northamptonshire / Luton corridor."
        path="/areas-we-cover"
        jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Areas We Cover', path: '/areas-we-cover' }])}
      />

      <section className="mkt-section">
        <h1 className="mkt-h1">Areas we cover</h1>
        <p className="mkt-lede">Structural engineering services across London and the South East / Midlands.</p>
      </section>

      <section className="mkt-section">
        <h2 className="mkt-h2">London</h2>
        <p className="mkt-body" style={{ marginBottom: 16 }}>All 32 boroughs plus the City of London.</p>
        <div className="mkt-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {LONDON_BOROUGHS.map((b) => (
            <div key={b} style={{ fontSize: 14, color: 'var(--ink-secondary)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>{b}</div>
          ))}
        </div>
      </section>

      {NATIONAL_REGIONS.map((r) => (
        <section className="mkt-section" key={r.label}>
          <h2 className="mkt-h2">{r.label}</h2>
          <div className="mkt-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {r.areas.map((a) => (
              <div key={a} style={{ fontSize: 14, color: 'var(--ink-secondary)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>{a}</div>
            ))}
          </div>
        </section>
      ))}

      <section className="mkt-section" style={{ marginBottom: 0 }}>
        <div className="mkt-card" style={{ padding: 32, textAlign: 'center' }}>
          <h2 className="mkt-h2">Don't see your area listed?</h2>
          <p className="mkt-body" style={{ margin: '0 auto 20px', maxWidth: 480 }}>
            Get in touch anyway — we can often still help, or point you in the right direction.
          </p>
          <Link href="/contact" className="btn btn-orange">Contact Us</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
