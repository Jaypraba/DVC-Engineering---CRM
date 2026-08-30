import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Media } from "@/components/ui/Media";
import { Prose } from "@/components/ui/Prose";
import { Mdx } from "@/components/Mdx";
import { CtaBand } from "@/components/site/CtaBand";
import { getProject, getProjects } from "@/lib/content";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title}, ${project.location}`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const next = all[(all.findIndex((item) => item.slug === project.slug) + 1) % all.length];

  return (
    <>
      <header className="pb-14 pt-16 md:pb-20 md:pt-24">
        <Container>
          <Eyebrow>{project.location}</Eyebrow>
          <h1 className="mt-7 max-w-[14ch] font-display text-display-lg">{project.title}</h1>
          <p className="mt-10 max-w-prose text-lede text-grey-600">{project.summary}</p>

          <dl className="mt-14 grid gap-x-10 gap-y-6 border-t border-grey-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Location", project.location],
              ["Value", project.value],
              ["Programme", project.duration],
              ["Completed", String(project.year)],
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="text-eyebrow uppercase text-grey-500">{term}</dt>
                <dd className="mt-2">{value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </header>

      <Media
        src={project.cover}
        alt={`${project.title}, ${project.location}`}
        ratio="21 / 9"
        priority
        sizes="100vw"
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <p className="text-eyebrow uppercase text-grey-500">Scope</p>
            <ul className="mt-5 space-y-2.5">
              {project.scope.map((item) => (
                <li key={item} className="text-sm text-grey-600">
                  {item}
                </li>
              ))}
            </ul>
            {project.architect ? (
              <>
                <p className="mt-10 text-eyebrow uppercase text-grey-500">Architect</p>
                <p className="mt-5 text-sm text-grey-600">{project.architect}</p>
              </>
            ) : null}
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            <Prose>
              <Mdx source={project.body} />
            </Prose>
          </div>
        </div>
      </Section>

      {project.gallery.length > 0 ? (
        <Section className="pt-0">
          <div className="grid gap-8 md:grid-cols-2">
            {project.gallery.map((src, index) => (
              <Media key={src} src={src} alt={`${project.title}, image ${index + 2}`} ratio="4 / 3" sizes="50vw" />
            ))}
          </div>
        </Section>
      ) : null}

      {next && next.slug !== project.slug ? (
        <Section tone="paper-dim">
          <Link href={`/work/${next.slug}`} className="group block">
            <p className="text-eyebrow uppercase text-grey-500">Next project</p>
            <p className="mt-6 font-display text-display-md transition-colors duration-brand ease-brand group-hover:text-grey-600">
              {next.title}
            </p>
            <p className="mt-3 text-grey-500">
              {next.location} · {next.year}
            </p>
          </Link>
        </Section>
      ) : null}

      <CtaBand />
    </>
  );
}
