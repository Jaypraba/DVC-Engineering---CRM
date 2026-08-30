import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { ProjectCard } from "@/components/site/ProjectCard";
import { CtaBand } from "@/components/site/CtaBand";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "Residential construction and project management in prime and outer prime London.",
};

export default function WorkPage() {
  const projects = getProjects();

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Projects, and the decisions behind them."
        lede="Each of these started with a paid site visit. In two of them the report argued against the scheme the client arrived with, and in both cases they were better off for it."
      />

      <Section className="pt-0">
        <div className="grid gap-x-10 gap-y-24 lg:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={(index % 2) * 100}>
              <ProjectCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
