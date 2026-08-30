import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { stages } from "@/lib/approach";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "Six stages, from a paid site visit and written report through design, procurement, build and twelve months of aftercare.",
};

export default function ApproachPage() {
  return (
    <>
      <PageHeader
        eyebrow="Approach"
        title="Six stages, and you can stop after two."
        lede="Most residential projects go wrong in the first fortnight, before anyone has been appointed and while all the advice is still free. This sequence is built to move those decisions forward and pay for them properly."
      />

      <Section className="pt-0">
        <ol>
          {stages.map((stage, index) => (
            <Reveal as="li" key={stage.number} delay={index * 50}>
              <div className="grid gap-6 border-t border-grey-200 py-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-3">
                  <p className="font-display text-sm text-grey-400">{stage.number}</p>
                  <h2 className="mt-4 font-display text-display-sm">{stage.title}</h2>
                  <p className="mt-3 text-sm text-grey-500">{stage.duration}</p>
                </div>
                <div className="lg:col-span-8 lg:col-start-5">
                  <p className="max-w-prose text-lede text-grey-700">{stage.summary}</p>
                  <p className="mt-5 max-w-prose text-grey-600">{stage.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="ink">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow className="text-grey-400">Fees</Eyebrow>
            <h2 className="mt-6 max-w-[16ch] font-display text-display-md">Our fee does not follow the build cost.</h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-lede text-grey-300">
              Project management is charged as a fixed fee agreed before the works start, not as a percentage of what
              the job ends up costing.
            </p>
            <p className="mt-6 text-grey-400">
              A percentage fee rewards the contractor for every overrun, every variation and every expensive
              specification. It is the standard arrangement in this industry and it quietly puts your interests and
              ours on opposite sides. We would rather they were on the same side, which means we lose money when the
              programme slips. That is the correct incentive.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand
        heading="It starts with the visit."
        body="Stage one is the only stage you have to commit to. Everything after it is a decision you make with a written report in your hand."
      />
    </>
  );
}
