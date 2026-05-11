import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/locations', label: 'Locations' },
  { href: '/blog', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
];

const SERVICE_LINKS = [
  { href: '/services/structural-surveys', label: 'Structural Surveys' },
  { href: '/services/loft-conversions', label: 'Loft Conversions' },
  { href: '/services/extensions', label: 'Extensions' },
  { href: '/services/load-bearing-wall-removal', label: 'Load-bearing Wall Removal' },
  { href: '/services/steel-beam-design', label: 'Steel and Timber Beam Design' },
  { href: '/services/foundation-design', label: 'Foundation Design' },
  { href: '/services/temporary-works', label: 'Temporary Works' },
  { href: '/services/building-control', label: 'Building Control Coordination' },
  { href: '/services/structural-adequacy-reports', label: 'Structural Adequacy Reports' },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link href="/" style={styles.logo}>
            <span style={styles.logoText}>DVC</span>
            <span style={styles.logoSub}>Engineering</span>
          </Link>

          <nav style={styles.nav} aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  ...styles.navLink,
                  ...(router.pathname.startsWith(href) && href !== '/' ? styles.navLinkActive : {}),
                }}
              >
                {label}
              </Link>
            ))}
            <Link href="/contact" style={styles.ctaBtn}>
              Get a quote
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerGrid}>
            <div>
              <div style={styles.footerLogo}>
                <span style={{ color: '#F4822A', fontWeight: 800 }}>DVC</span> Engineering
              </div>
              <p style={styles.footerTagline}>
                Structural engineers serving London and the South East.
              </p>
              <p style={styles.footerAddress}>
                86–90 Paul Street<br />
                London EC2A 4NE
              </p>
            </div>

            <div>
              <h3 style={styles.footerHeading}>Services</h3>
              <ul style={styles.footerList}>
                {SERVICE_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} style={styles.footerLink}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={styles.footerHeading}>London Boroughs</h3>
              <ul style={styles.footerList}>
                {['islington','hackney','camden','southwark','lambeth','wandsworth','tower-hamlets','greenwich'].map(b => (
                  <li key={b}>
                    <Link href={`/locations/${b}`} style={styles.footerLink}>
                      {b.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/locations" style={styles.footerLink}>All locations &rarr;</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 style={styles.footerHeading}>Contact</h3>
              <ul style={styles.footerList}>
                <li style={{ color: '#8a96a8', fontSize: 14 }}>86–90 Paul Street, London EC2A 4NE</li>
                <li>
                  <Link href="/contact" style={styles.footerLink}>Send an enquiry</Link>
                </li>
                <li>
                  <Link href="/blog" style={styles.footerLink}>Resources and guides</Link>
                </li>
              </ul>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p style={{ margin: 0, color: '#8a96a8', fontSize: 13 }}>
              &copy; {new Date().getFullYear()} DVC Engineering Ltd. All rights reserved.
              Registered in England and Wales.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

const styles = {
  header: {
    background: '#0A1628',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    textDecoration: 'none',
  },
  logoText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 24,
    color: '#F4822A',
    letterSpacing: '-0.02em',
  },
  logoSub: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 18,
    color: '#F8F7F5',
    letterSpacing: '0.02em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navLink: {
    color: '#c8d0dc',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: 6,
    transition: 'color 120ms',
  },
  navLinkActive: {
    color: '#F8F7F5',
    background: 'rgba(255,255,255,0.08)',
  },
  ctaBtn: {
    background: '#F4822A',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    padding: '8px 18px',
    borderRadius: 7,
    marginLeft: 8,
    transition: 'background 120ms',
  },
  footer: {
    background: '#0A1628',
    color: '#F8F7F5',
    marginTop: 80,
  },
  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '56px 24px 32px',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 40,
    marginBottom: 48,
  },
  footerLogo: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 22,
    color: '#F8F7F5',
    marginBottom: 12,
  },
  footerTagline: {
    color: '#8a96a8',
    fontSize: 14,
    lineHeight: 1.6,
    margin: '0 0 12px',
  },
  footerAddress: {
    color: '#8a96a8',
    fontSize: 13,
    lineHeight: 1.7,
    margin: 0,
  },
  footerHeading: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8a96a8',
    margin: '0 0 16px',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  footerLink: {
    color: '#c8d0dc',
    textDecoration: 'none',
    fontSize: 14,
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: 24,
  },
};
