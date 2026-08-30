import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BookingForm } from "@/components/BookingForm";
import { siteVisit, siteVisitPrice } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a site visit",
  description: `Book and pay for a site visit — ${siteVisitPrice} plus VAT, with a written report within five working days.`,
  robots: { index: true, follow: true },
};

export default function BookPage() {
  return (
    <div className="pb-section pt-16 md:pt-24">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Booking</Eyebrow>
            <h1 className="mt-7 font-display text-display-md">Book a site visit.</h1>
            <p className="mt-6 text-grey-600">
              {siteVisitPrice} {siteVisit.vatNote}, paid now. {siteVisit.durationNote}, attended by an interior
              designer, a structural engineer and a contractor. Written report within {siteVisit.reportDays} working
              days.
            </p>

            <dl className="mt-12 border-t border-grey-200">
              {[
                ["Fee", `${siteVisitPrice} ${siteVisit.vatNote}`],
                ["On site", siteVisit.durationNote],
                ["Report", `${siteVisit.reportDays} working days`],
                ["Attending", "Three specialists"],
              ].map(([term, value]) => (
                <div key={term} className="flex justify-between gap-6 border-b border-grey-200 py-4">
                  <dt className="text-sm text-grey-500">{term}</dt>
                  <dd className="text-right text-sm">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-10 text-sm text-grey-500">
              If we cannot offer you a date that works, we refund the fee in full.
            </p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Suspense fallback={<p className="text-grey-500">Loading the form…</p>}>
              <BookingForm priceLabel={siteVisitPrice} />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  );
}
