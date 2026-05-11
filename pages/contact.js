import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { localBusinessSchema, breadcrumbSchema } from '../components/Schema';

const schema = [
  localBusinessSchema(),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]),
];

export default function Contact() {
  return (
    <Layout>
      <SEO
        title="Contact DVC Engineering | Structural Engineers London EC2A"
        description="Contact DVC Engineering for structural engineering services across London and the South East. Send an enquiry about structural surveys, loft conversions, extensions, beam design, and more."
        canonical="/contact"
        schema={schema}
      />

      <div style={styles.hero}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" style={styles.breadcrumbLink}>Home</a>
            <span style={styles.breadcrumbSep}>/</span>
            <span>Contact</span>
          </nav>
          <h1 style={styles.h1}>Contact DVC Engineering</h1>
          <p style={styles.heroText}>
            Send us a brief description of your project and we will respond within one working day.
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.formWrap}>
            <form
              name="contact"
              method="POST"
              action="/api/contact"
              style={styles.form}
            >
              <div style={styles.fieldGroup}>
                <label htmlFor="name" style={styles.label}>Your name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  style={styles.input}
                  placeholder="Jane Smith"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="email" style={styles.label}>Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  style={styles.input}
                  placeholder="jane@example.com"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="phone" style={styles.label}>Phone number (optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  style={styles.input}
                  placeholder="07700 900000"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="service" style={styles.label}>Service required</label>
                <select id="service" name="service" style={styles.input}>
                  <option value="">Select a service</option>
                  <option>Structural Survey</option>
                  <option>Loft Conversion</option>
                  <option>Extension</option>
                  <option>Load-bearing Wall Removal</option>
                  <option>Steel or Timber Beam Design</option>
                  <option>Foundation Design</option>
                  <option>Temporary Works</option>
                  <option>Building Control Coordination</option>
                  <option>Structural Adequacy Report</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="message" style={styles.label}>Project details</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  style={{ ...styles.input, resize: 'vertical' }}
                  placeholder="Briefly describe the project: property type, location, and what you need from us."
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                Send enquiry
              </button>
            </form>
          </div>

          <aside style={styles.info}>
            <div style={styles.infoCard}>
              <h2 style={styles.infoHeading}>Office</h2>
              <address style={styles.address}>
                DVC Engineering Ltd<br />
                86–90 Paul Street<br />
                London<br />
                EC2A 4NE
              </address>
            </div>

            <div style={styles.infoCard}>
              <h2 style={styles.infoHeading}>Office hours</h2>
              <p style={styles.infoText}>Monday to Friday: 09:00–18:00</p>
              <p style={styles.infoText}>We aim to respond to all enquiries within one working day.</p>
            </div>

            <div style={styles.infoCard}>
              <h2 style={styles.infoHeading}>Service area</h2>
              <p style={styles.infoText}>
                London and the South East, including all 33 London boroughs, Surrey, Sussex, Essex, and Hertfordshire.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  hero: {
    background: '#0A1628',
    color: '#F8F7F5',
    padding: '56px 0 48px',
    marginBottom: 56,
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
  },
  breadcrumb: {
    fontSize: 13,
    color: '#8a96a8',
    marginBottom: 20,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  breadcrumbLink: { color: '#8a96a8', textDecoration: 'none' },
  breadcrumbSep: { color: '#3d4f6b' },
  h1: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(32px, 5vw, 52px)',
    lineHeight: 1.05,
    margin: '0 0 20px',
    color: '#F8F7F5',
  },
  heroText: {
    fontSize: 18,
    color: '#c8d0dc',
    margin: 0,
    maxWidth: 560,
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 48,
    alignItems: 'start',
  },
  formWrap: {},
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0A1628',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #E4E0D8',
    borderRadius: 7,
    fontSize: 15,
    fontFamily: "'Barlow', sans-serif",
    color: '#0A1628',
    background: '#fff',
    boxSizing: 'border-box',
    outline: 'none',
  },
  submitBtn: {
    background: '#F4822A',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: 7,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Barlow', sans-serif",
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  infoCard: {
    background: '#F8F7F5',
    border: '1px solid #E4E0D8',
    borderRadius: 10,
    padding: 24,
  },
  infoHeading: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    margin: '0 0 12px',
    color: '#0A1628',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  address: {
    fontStyle: 'normal',
    fontSize: 15,
    lineHeight: 1.8,
    color: '#3d4f6b',
    margin: 0,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#3d4f6b',
    margin: '0 0 8px',
  },
};
