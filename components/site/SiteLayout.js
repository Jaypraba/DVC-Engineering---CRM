import Link from 'next/link';
import { BUSINESS } from '../../lib/siteData';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/areas-we-cover', label: 'Areas We Cover' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function SiteHeader() {
  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', lineHeight: 1 }}>
            <span style={{ color: 'var(--navy)' }}>DVC </span>
            <span style={{ color: 'var(--orange)' }}>ENGINEERING</span>
          </div>
        </Link>
        <nav aria-label="Primary" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} style={{ color: 'var(--ink-secondary)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: '#fff', marginTop: 60 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px', display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--navy)', marginBottom: 6 }}>
            {BUSINESS.name}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-light)' }}>
            {BUSINESS.addressLocality} · {BUSINESS.postalCode}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          </p>
        </div>
        <nav aria-label="Footer" style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {NAV.slice(1).map((n) => (
            <Link key={n.href} href={n.href} style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-light)' }}>© {year} {BUSINESS.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function SiteLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <main id="main" style={{ flex: 1, width: '100%', maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
