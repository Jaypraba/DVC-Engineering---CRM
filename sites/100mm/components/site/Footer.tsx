import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerNav, site, siteVisitPrice } from "@/lib/site";

export function Footer() {
  return (
    <footer className="on-ink bg-ink text-paper">
      <Container>
        <div className="grid gap-16 py-section lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="max-w-[18ch] font-display text-display-md">
              Start with the site visit.
            </p>
            <p className="mt-6 max-w-prose text-grey-300">
              An interior designer, a structural engineer and a contractor, on site together, followed by a written
              report within five working days. {siteVisitPrice} {"plus VAT"}.
            </p>
            <Link
              href="/book"
              className="mt-10 inline-flex rounded-full bg-accent px-7 py-3.5 text-sm font-medium tracking-tight text-ink transition-colors duration-brand ease-brand hover:bg-accent-dim"
            >
              Book and pay
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-6">
            <div>
              <p className="text-eyebrow uppercase text-grey-500">Pages</p>
              <ul className="mt-5 space-y-3">
                {footerNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-grey-300 transition-colors duration-brand ease-brand hover:text-paper"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-eyebrow uppercase text-grey-500">Contact</p>
              <ul className="mt-5 space-y-3 text-sm text-grey-300">
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="transition-colors duration-brand ease-brand hover:text-paper"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="transition-colors duration-brand ease-brand hover:text-paper"
                  >
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>{site.address.line1}</li>
              </ul>

              <p className="mt-8 text-eyebrow uppercase text-grey-500">Sister company</p>
              <p className="mt-5 text-sm text-grey-300">
                <a
                  href={site.sister.url}
                  className="transition-colors duration-brand ease-brand hover:text-paper"
                  rel="noreferrer"
                >
                  {site.sister.name}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="rule-ink flex flex-col gap-2 py-8 text-xs text-grey-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p>Construction and project management. London.</p>
        </div>
      </Container>
    </footer>
  );
}
