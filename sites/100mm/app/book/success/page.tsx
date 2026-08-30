import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site, siteVisit } from "@/lib/site";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

export default function BookingSuccessPage() {
  return (
    <div className="pb-section pt-20 md:pt-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Confirmed</Eyebrow>
            <h1 className="mt-7 max-w-[16ch] font-display text-display-lg">Your site visit is booked.</h1>
            <p className="mt-10 max-w-prose text-lede text-grey-600">
              Payment has gone through and a receipt is on its way from Stripe. Nothing else is needed from you today.
            </p>
          </div>

          <div className="lg:col-span-5">
            <ol className="border-t border-grey-200">
              {[
                {
                  title: "Within one working day",
                  body: "We email you two or three proposed dates, with the names of the three people attending.",
                },
                {
                  title: "On the day",
                  body: `${siteVisit.durationNote}. Bring any drawings, surveys or consents you have. If you have none, that is fine.`,
                },
                {
                  title: `Within ${siteVisit.reportDays} working days`,
                  body: "The written report arrives, with a cost band, the structural position and a recommended route forward.",
                },
              ].map((item) => (
                <li key={item.title} className="border-b border-grey-200 py-6">
                  <h2 className="font-display text-lg tracking-tight">{item.title}</h2>
                  <p className="mt-2 text-grey-600">{item.body}</p>
                </li>
              ))}
            </ol>

            <p className="mt-10 text-sm text-grey-500">
              Something to add or change? Email{" "}
              <a href={`mailto:${site.email}`} className="underline decoration-grey-300 underline-offset-4">
                {site.email}
              </a>{" "}
              or call{" "}
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="underline decoration-grey-300 underline-offset-4">
                {site.phoneDisplay}
              </a>
              .
            </p>

            <Link
              href="/journal"
              className="mt-10 inline-block border-b border-grey-300 pb-1 text-sm tracking-tight transition-colors duration-brand ease-brand hover:border-ink"
            >
              Something to read in the meantime
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
