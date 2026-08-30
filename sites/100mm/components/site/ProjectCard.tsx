import Link from "next/link";
import type { Project } from "@/lib/content";
import { Media } from "@/components/ui/Media";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/work/${project.slug}`} className="block">
        <Media
          src={project.cover}
          alt={`${project.title}, ${project.location}`}
          ratio="4 / 3"
          priority={priority}
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="overflow-hidden"
        />
        <div className="mt-6 flex items-baseline justify-between gap-6 border-t border-grey-200 pt-5">
          <h3 className="font-display text-display-sm">{project.title}</h3>
          <p className="shrink-0 text-sm text-grey-500">{project.year}</p>
        </div>
        <p className="mt-3 text-sm text-grey-500">
          {project.location} · {project.value}
        </p>
        <p className="mt-4 max-w-prose text-grey-600">{project.summary}</p>
        <span className="mt-6 inline-block border-b border-grey-300 pb-1 text-sm tracking-tight transition-colors duration-brand ease-brand group-hover:border-ink">
          Read the project
        </span>
      </Link>
    </article>
  );
}
