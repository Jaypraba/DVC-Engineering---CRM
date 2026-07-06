import Link from 'next/link';
import SiteLayout from '../components/site/SiteLayout';
import Seo, { serviceListSchema, breadcrumbSchema } from '../components/site/Seo';
import { BUSINESS, SERVICES } from '../lib/siteData';

export default function Services() {
  return (
    <SiteLayout>
      <Seo
        title="Structural Engineering Services"
        description="Structural engineering services from DVC Engineering: loft conversions, extensions, basements, new builds, structural alterations and commercial projects across London and the South East."
        path="/services"
        jsonLd={[
          serviceListSchema(SERVICES),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]),
        ]}
      />

      <section className="mkt-section">
        <h1 className="mkt-h1">Structural engineering services</h1>
        <p className="mkt-lede">
          Structural calculations, drawings and Building Control liaison for residential and commercial
          projects — sized to the job, from a single steel beam to a full new build.
        </p>
      </section>

      <section className="mkt-section" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SERVICES.map((s) => (
          <div key={s.slug} id={s.slug} className="mkt-card">
            <h2 className="mkt-h3" style={{ fontSize: 19 }}>{s.name}</h2>
            <p className="mkt-body" style={{ margin: 0 }}>{s.summary}</p>
          </div>
        ))}
      </section>

      <section className="mkt-section" style={{ marginBottom: 0 }}>
        <div className="mkt-card" style={{ padding: 32, textAlign: 'center' }}>
          <h2 className="mkt-h2">Not sure which service you need?</h2>
          <p className="mkt-body" style={{ margin: '0 auto 20px', maxWidth: 480 }}>
            Tell us about your project and we'll tell you what's required.
          </p>
          <Link href="/contact" className="btn btn-orange">Get in Touch</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
