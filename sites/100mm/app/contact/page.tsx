import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site, siteVisit, siteVisitPrice } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "New projects begin with a paid site visit. Existing clients, suppliers and press can reach us directly.",
};

/**
 * Deliberately not an enquiry form. A new project enquiry goes to /book, where
 * it becomes a booked and paid site visit rather than a lead in an inbox.
 */
export default function ContactPage() {
  return (
    <>
      <div className="pb-14 pt-16 md:pb-20 md:pt-24">
        <Container>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-7 max-w-[16ch] font-display text-display-lg">There is no enquiry form.</h1>
          <div className="mt-10 grid lg:grid-cols-12">
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-lede text-grey-600">
                If you have a project, the useful next step is not an email exchange. It is three specialists standing
                in your house. That is what the site visit is, and it is how every project here begins.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/book"
                  className="inline-flex rounded-full bg-accent px-7 py-3.5 text-sm font-medium tracking-tight text-ink transition-colors duration-brand ease-brand hover:bg-accent-dim"
                >
                  Book a site visit — {siteVisitPrice}
                </Link>
                <Link
                  href="/site-visit"
                  className="inline-flex rounded-full border border-ink/20 px-7 py-3.5 text-sm font-medium tracking-tight text-ink transition-colors duration-brand ease-brand hover:border-ink hover:bg-ink hover:text-paper"
                >
                  What it covers
                </Link>
              </div>
              <p className="mt-6 text-sm text-grey-500">
                {siteVisit.vatNote} · report within {siteVisit.reportDays} working days · refunded in full if we cannot
                find you a date
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Section tone="paper-dim">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-display-md">Everything else.</h2>
            <p className="mt-6 max-w-prose text-grey-600">
              Existing clients, neighbours affected by works, subcontractors, suppliers and press — reach us directly.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            <div>
              <p className="text-eyebrow uppercase text-grey-500">Email</p>
              <p className="mt-4">
                <a href={`mailto:${site.email}`} className="underline decoration-grey-300 underline-offset-4 hover:decoration-ink">
                  {site.email}
                </a>
              </p>

              <p className="mt-10 text-eyebrow uppercase text-grey-500">Telephone</p>
              <p className="mt-4">
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="underline decoration-grey-300 underline-offset-4 hover:decoration-ink"
                >
                  {site.phoneDisplay}
                </a>
              </p>
            </div>

            <div>
              <p className="text-eyebrow uppercase text-grey-500">Studio</p>
              <p className="mt-4 text-grey-600">
                {site.address.line1}
                <br />
                {site.address.country}
              </p>

              <p className="mt-10 text-eyebrow uppercase text-grey-500">Structural engineering</p>
              <p className="mt-4 text-grey-600">
                <a href={site.sister.url} rel="noreferrer" className="underline decoration-grey-300 underline-offset-4 hover:decoration-ink">
                  {site.sister.name}
                </a>
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
