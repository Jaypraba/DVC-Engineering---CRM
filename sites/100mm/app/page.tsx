import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { Attendees } from "@/components/site/Attendees";
import { CtaBand } from "@/components/site/CtaBand";
import { ProjectCard } from "@/components/site/ProjectCard";
import { getFeaturedProjects, getJournalPosts, formatDate } from "@/lib/content";
import { stages } from "@/lib/approach";
import { site, siteVisit, siteVisitPrice } from "@/lib/site";

export default function HomePage() {
  const projects = getFeaturedProjects().slice(0, 2);
  const posts = getJournalPosts().slice(0, 3);

  return (
    <>
      {/* Hero. The only green here is the primary CTA — the header pill is the
          site's other persistent green element. */}
      <section className="pb-16 pt-20 md:pb-24 md:pt-32">
        <Container>
          <h1 className="max-w-[14ch] font-display text-display-xl">Build it once.</h1>
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12">
            <p className="text-lede text-grey-600 lg:col-span-6 lg:col-start-7">
              100mm is a construction and project management practice for London homes between £350k and £2m. We do not
              give free quotations. Every project starts with a paid site visit and a written report, because the
              decisions that cost the most are made in the first fortnight.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-4 lg:mt-14">
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
              What you get for it
            </Link>
          </div>
        </Container>
      </section>

      <Media
        alt="Completed project, Primrose Hill"
        ratio="21 / 9"
        priority
        sizes="100vw"
        className="[&_figure]:m-0"
      />

      {/* The proposition. Ink band, one green marker, outline CTA. */}
      <Section tone="ink">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow marker className="text-grey-400">
              The first engagement
            </Eyebrow>
            <h2 className="mt-8 max-w-[16ch] font-display text-display-md">No free quotes. Ever.</h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-lede text-grey-300">
              A free quotation is written to win a job, so everything difficult about your building is left out of it.
              We charge for the first visit instead, and send three people rather than one.
            </p>
            <p className="mt-6 text-grey-400">
              {siteVisitPrice} {siteVisit.vatNote}. {siteVisit.durationNote}. Written report within{" "}
              {siteVisit.reportDays} working days. It does not commit you to appointing us, and it is yours to take
              anywhere.
            </p>
            <Link
              href="/site-visit"
              className="mt-10 inline-flex rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium tracking-tight text-paper transition-colors duration-brand ease-brand hover:border-accent hover:text-accent"
            >
              How the visit works
            </Link>
          </div>
        </div>

        <div className="mt-20 lg:mt-28">
          <Attendees tone="ink" />
        </div>
      </Section>

      {/* Selected work */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Selected work</Eyebrow>
            <h2 className="mt-6 max-w-[18ch] font-display text-display-md">
              Six figures of difference, decided early.
            </h2>
          </div>
          <Link
            href="/work"
            className="border-b border-grey-300 pb-1 text-sm tracking-tight transition-colors duration-brand ease-brand hover:border-ink"
          >
            All projects
          </Link>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-20 lg:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 100}>
              <ProjectCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Approach */}
      <Section tone="paper-dim">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>How it runs</Eyebrow>
            <h2 className="mt-6 font-display text-display-md">Six stages.</h2>
            <p className="mt-6 max-w-prose text-grey-600">
              You can stop after stage two. Most people do not, but the report is written on the assumption that you
              might.
            </p>
            <Link
              href="/approach"
              className="mt-8 inline-block border-b border-grey-300 pb-1 text-sm tracking-tight transition-colors duration-brand ease-brand hover:border-ink"
            >
              The full sequence
            </Link>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {stages.map((stage, index) => (
              <Reveal as="li" key={stage.number} delay={index * 60}>
                <div className="grid grid-cols-[3rem_1fr] gap-6 border-t border-grey-200 py-7">
                  <p className="font-display text-sm text-grey-400">{stage.number}</p>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="font-display text-xl tracking-tight">{stage.title}</h3>
                      <p className="text-sm text-grey-500">{stage.duration}</p>
                    </div>
                    <p className="mt-3 max-w-prose text-grey-600">{stage.summary}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* DVC relationship */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Eyebrow>Structure</Eyebrow>
            <h2 className="mt-6 max-w-[16ch] font-display text-display-md">
              The engineer is in-house.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-lede text-grey-600">
              {site.sister.name} is our sister consultancy. Its engineers sit on the first visit, design the structure,
              and stay on the project through to completion.
            </p>
            <p className="mt-6 text-grey-600">
              That matters for one practical reason. On most residential projects, the structural engineer is appointed
              after the scheme is designed, which means the expensive decisions are already made. Here they are in the
              room on day one, before anything has been drawn.
            </p>
            <Link
              href="/studio"
              className="mt-8 inline-block border-b border-grey-300 pb-1 text-sm tracking-tight transition-colors duration-brand ease-brand hover:border-ink"
            >
              About the studio
            </Link>
          </div>
        </div>
      </Section>

      {/* Journal */}
      <Section tone="paper-dim">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Journal</Eyebrow>
            <h2 className="mt-6 font-display text-display-md">Writing.</h2>
          </div>
          <Link
            href="/journal"
            className="border-b border-grey-300 pb-1 text-sm tracking-tight transition-colors duration-brand ease-brand hover:border-ink"
          >
            All posts
          </Link>
        </div>

        <ul className="mt-14">
          {posts.map((post, index) => (
            <Reveal as="li" key={post.slug} delay={index * 70}>
              <Link href={`/journal/${post.slug}`} className="group block border-t border-grey-200 py-8">
                <div className="grid gap-4 lg:grid-cols-12">
                  <p className="text-sm text-grey-500 lg:col-span-3">{formatDate(post.date)}</p>
                  <div className="lg:col-span-9">
                    <h3 className="font-display text-display-sm transition-colors duration-brand ease-brand group-hover:text-grey-600">
                      {post.title}
                    </h3>
                    <p className="mt-3 max-w-prose text-grey-600">{post.summary}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-6 font-display text-display-md">The awkward ones.</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion
              items={[
                {
                  question: "Why should I pay when everyone else visits for free?",
                  answer: (
                    <p>
                      Because a free visit is paid for somewhere, and it is paid for by the clients who appointed that
                      firm. More importantly, nobody attending a free visit is in a position to tell you the project is
                      a bad idea. Ours regularly does.
                    </p>
                  ),
                },
                {
                  question: "Do I get the fee back if I appoint you?",
                  answer: (
                    <p>
                      No, and that is deliberate. If the fee were refundable against the build it would be a sales
                      discount, and the report would quietly start arguing for the build. It is a separate piece of
                      work with its own value.
                    </p>
                  ),
                },
                {
                  question: "What if the report says don't do it?",
                  answer: (
                    <p>
                      Then it says that, in writing, with the reasoning. You have spent {siteVisitPrice} to avoid
                      spending a great deal more. That is the report working, not failing.
                    </p>
                  ),
                },
                {
                  question: "Can I use the report with another contractor?",
                  answer: (
                    <p>
                      Yes. It is yours. It is written to be useful to whoever builds the project, which is another
                      reason it can afford to be honest.
                    </p>
                  ),
                },
                {
                  question: "What size of project do you take on?",
                  answer: (
                    <p>
                      Residential projects between roughly £350,000 and £2m, in prime and outer prime London. Below that
                      band, our overheads work against you and we will say so.
                    </p>
                  ),
                },
                {
                  question: "How soon can you visit?",
                  answer: (
                    <p>
                      Usually within two to three weeks — the constraint is getting all three people in the same diary
                      slot, which is the part that makes the visit worth having. You will get proposed dates by email
                      within one working day of booking.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
