import SiteLayout from '../components/site/SiteLayout';
import Seo, { breadcrumbSchema } from '../components/site/Seo';
import { BUSINESS } from '../lib/siteData';

export default function Contact() {
  return (
    <SiteLayout>
      <Seo
        title="Contact"
        description="Get in touch with DVC Engineering for a structural engineering quote — loft conversions, extensions, basements, new builds and more across London and the South East."
        path="/contact"
        jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])}
      />

      <section className="mkt-section">
        <h1 className="mkt-h1">Get in touch</h1>
        <p className="mkt-lede">
          Send us your site address and a brief description of the works, along with any drawings or planning
          documents you already have, and we'll come back with a quote.
        </p>
      </section>

      <section className="mkt-section" style={{ marginBottom: 0 }}>
        <div className="mkt-card" style={{ padding: 32, maxWidth: 480 }}>
          <h2 className="mkt-h3">Email</h2>
          <p style={{ marginBottom: 20 }}>
            <a href={`mailto:${BUSINESS.email}`} style={{ fontSize: 16, fontWeight: 600 }}>{BUSINESS.email}</a>
          </p>
          <h2 className="mkt-h3">Office</h2>
          <p className="mkt-body" style={{ margin: 0 }}>
            {BUSINESS.name}<br />
            {BUSINESS.addressLocality}<br />
            {BUSINESS.postalCode}
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
