import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Media } from "@/components/ui/Media";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "100mm is a boutique construction and project management practice in London, and sister company to DVC Engineering Ltd.",
};

export default function StudioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Studio"
        title="A small practice, deliberately."
        lede="100mm runs a handful of residential projects at a time in prime and outer prime London. The number is small because the alternative is a director who has never been on your site."
      />

      <Media alt="Studio, London" ratio="21 / 9" sizes="100vw" />

      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Sister company</Eyebrow>
            <h2 className="mt-6 font-display text-display-md">{site.sister.name}</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="text-lede text-grey-700">
              DVC Engineering is a structural engineering consultancy and our sister company. Its engineers attend the
              first site visit, design the structure, and stay with the project through to completion.
            </p>
            <p className="mt-6 max-w-prose text-grey-600">
              The usual arrangement in residential work is that a client appoints an architect or designer, a scheme is
              drawn, and only then is an engineer asked whether it stands up. By that point the expensive decisions have
              been made and the engineer's job is to make an existing idea work rather than to shape a better one. We
              inverted that. On our projects the structural view arrives on day one, in the same room as the design view
              and the cost view.
            </p>
            <p className="mt-6 max-w-prose text-grey-600">
              It is also why the site visit can be honest. The person telling you a basement will not repay itself is
              not the person who would have been paid to design it.
            </p>
            <a
              href={site.sister.url}
              rel="noreferrer"
              className="mt-8 inline-block border-b border-grey-300 pb-1 text-sm tracking-tight transition-colors duration-brand ease-brand hover:border-ink"
            >
              dvceng.com
            </a>
          </div>
        </div>
      </Section>

      <Section tone="paper-dim">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>What we take on</Eyebrow>
            <h2 className="mt-6 font-display text-display-md">The fit.</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="grid gap-12 sm:grid-cols-2">
              <div>
                <p className="text-eyebrow uppercase text-grey-500">Suits us</p>
                <ul className="mt-6 space-y-3 text-grey-700">
                  {[
                    "Residential projects, £350k to £2m",
                    "Prime and outer prime London",
                    "Whole-house work, extensions, basements, listed buildings",
                    "Clients who want the difficult version of the truth",
                  ].map((item) => (
                    <li
                      key={item}
                      className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-grey-300 before:content-['']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-eyebrow uppercase text-grey-500">Does not</p>
                <ul className="mt-6 space-y-3 text-grey-500">
                  {[
                    "Projects under £350k — our overheads work against you",
                    "Commercial fit-out",
                    "Anyone looking for the cheapest number",
                    "Free quotations, at any project size",
                  ].map((item) => (
                    <li
                      key={item}
                      className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-grey-300 before:content-['']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
