import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Media } from "@/components/ui/Media";
import { Attendees } from "@/components/site/Attendees";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { siteVisit, siteVisitPrice } from "@/lib/site";

export const metadata: Metadata = {
  title: "The site visit",
  description:
    "A paid site visit attended by an interior designer, a structural engineer and a contractor, followed by a written report within five working days.",
};

export default function SiteVisitPage() {
  return (
    <>
      <PageHeader
        eyebrow="The first engagement"
        title="Two hours. Three specialists. One written report."
        lede={`${siteVisitPrice} ${siteVisit.vatNote}. It is the only way to start a project with us, and it is deliberately not free.`}
      >
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/book"
            className="inline-flex rounded-full bg-accent px-7 py-3.5 text-sm font-medium tracking-tight text-ink transition-colors duration-brand ease-brand hover:bg-accent-dim"
          >
            Book and pay
          </Link>
        </div>
      </PageHeader>

      <Media alt="Site visit in progress" ratio="21 / 9" sizes="100vw" />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Who attends</Eyebrow>
            <h2 className="mt-6 font-display text-display-md">All three, together.</h2>
          </div>
          <p className="max-w-prose text-lede text-grey-600 lg:col-span-6 lg:col-start-7">
            Not three separate visits. One visit, at the same time, so the disagreements happen in front of you rather
            than in emails you never see.
          </p>
        </div>

        <div className="mt-20 lg:mt-28">
          <Attendees />
        </div>
      </Section>

      <Section tone="ink">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow className="text-grey-400">The report</Eyebrow>
            <h2 className="mt-6 max-w-[14ch] font-display text-display-md">
              Within {siteVisit.reportDays} working days.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-lede text-grey-300">
              A written document, not a phone call and not a spreadsheet of provisional sums. It is yours to keep, to
              share, and to use with another contractor if you decide against us.
            </p>

            <div className="mt-14 grid gap-12 sm:grid-cols-2">
              <div>
                <p className="text-eyebrow uppercase text-grey-500">What it includes</p>
                <ul className="mt-6 space-y-3">
                  {siteVisit.includes.map((item) => (
                    <li key={item} className="relative pl-5 text-grey-300 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-grey-600 before:content-['']">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-eyebrow uppercase text-grey-500">What it is not</p>
                <ul className="mt-6 space-y-3">
                  {siteVisit.excludes.map((item) => (
                    <li key={item} className="relative pl-5 text-grey-400 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-grey-600 before:content-['']">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Sequence</Eyebrow>
            <h2 className="mt-6 font-display text-display-md">What happens.</h2>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {[
              {
                title: "You book and pay",
                body: "Two minutes, online. Payment is taken at the point of booking, which is what reserves the three diaries.",
              },
              {
                title: "We propose dates",
                body: "By email within one working day. Getting all three people into one slot usually means two to three weeks out.",
              },
              {
                title: "We visit",
                body: `${siteVisit.durationNote}. Bring any drawings, surveys or consents you already have. You do not need to prepare anything.`,
              },
              {
                title: "The report arrives",
                body: `Within ${siteVisit.reportDays} working days, with a cost band, the structural position, the consent exposure and a recommended route.`,
              },
              {
                title: "You decide",
                body: "Proceed with us, proceed with someone else, or do not proceed. All three are normal outcomes and none of them owes us anything further.",
              },
            ].map((step, index) => (
              <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-6 border-t border-grey-200 py-7">
                <p className="font-display text-sm text-grey-400">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <h3 className="font-display text-xl tracking-tight">{step.title}</h3>
                  <p className="mt-3 max-w-prose text-grey-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <CtaBand
        heading="Book the visit."
        body="Payment is taken now and reserves the slot. If we cannot find a date that works for you, we refund it in full."
      />
    </>
  );
}
