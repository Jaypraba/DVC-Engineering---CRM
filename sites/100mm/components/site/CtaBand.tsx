import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { siteVisit, siteVisitPrice } from "@/lib/site";

export function CtaBand({
  heading = "Every project here started the same way.",
  body = "One paid visit. Three specialists. A written report within five working days, with a cost band we will stand behind.",
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <Section tone="paper-dim">
      <div className="grid items-end gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="max-w-[16ch] font-display text-display-md">{heading}</h2>
          <p className="mt-6 max-w-prose text-lg text-grey-600">{body}</p>
        </div>
        <div className="lg:col-span-5 lg:justify-self-end">
          <p className="font-display text-display-sm">
            {siteVisitPrice} <span className="text-grey-400">{siteVisit.vatNote}</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/book"
              className="inline-flex rounded-full bg-accent px-7 py-3.5 text-sm font-medium tracking-tight text-ink transition-colors duration-brand ease-brand hover:bg-accent-dim"
            >
              Book a site visit
            </Link>
            <Link
              href="/site-visit"
              className="inline-flex rounded-full border border-ink/20 px-7 py-3.5 text-sm font-medium tracking-tight text-ink transition-colors duration-brand ease-brand hover:border-ink hover:bg-ink hover:text-paper"
            >
              What it covers
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
