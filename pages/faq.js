import SiteLayout from '../components/site/SiteLayout';
import Seo, { faqSchema, breadcrumbSchema } from '../components/site/Seo';
import { FAQS } from '../lib/siteData';

export default function Faq() {
  return (
    <SiteLayout>
      <Seo
        title="FAQ"
        description="Answers to common questions about structural engineering, planning permission, Building Regulations, party wall agreements and getting a quote from DVC Engineering."
        path="/faq"
        jsonLd={[
          faqSchema(FAQS),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
        ]}
      />

      <section className="mkt-section">
        <h1 className="mkt-h1">Frequently asked questions</h1>
        <p className="mkt-lede">Common questions about structural engineering, planning and Building Regulations.</p>
      </section>

      <section className="mkt-section" style={{ marginBottom: 0 }}>
        <div className="mkt-faq">
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
