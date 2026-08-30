import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";

/**
 * A small typed content layer. Files on disk, validated frontmatter, no CMS.
 * Invalid frontmatter throws at build time rather than shipping a broken page.
 */

const contentRoot = path.join(process.cwd(), "content");

const projectFrontmatter = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  year: z.number().int(),
  /** Value band rather than an exact figure — clients are private. */
  value: z.string().min(1),
  duration: z.string().min(1),
  summary: z.string().min(1),
  scope: z.array(z.string().min(1)).min(1),
  cover: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  architect: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(100),
  published: z.boolean().default(true),
});

const journalFrontmatter = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  summary: z.string().min(1),
  author: z.string().default("100mm"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
});

export type Project = z.infer<typeof projectFrontmatter> & { slug: string; body: string };
export type JournalPost = z.infer<typeof journalFrontmatter> & { slug: string; body: string };

function readCollection(dir: string): Array<{ slug: string; data: Record<string, unknown>; body: string }> {
  const absolute = path.join(contentRoot, dir);
  if (!fs.existsSync(absolute)) return [];

  return fs
    .readdirSync(absolute)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(absolute, file), "utf8");
      const { data, content } = matter(raw);
      return { slug: file.replace(/\.mdx$/, ""), data, body: content };
    });
}

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown, where: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid frontmatter in ${where}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const getProjects = cache((): Project[] =>
  readCollection("projects")
    .map(({ slug, data, body }) => ({
      ...parseOrThrow(projectFrontmatter, data, `content/projects/${slug}.mdx`),
      slug,
      body,
    }))
    .filter((project) => project.published)
    .sort((a, b) => a.order - b.order || b.year - a.year),
);

export const getFeaturedProjects = cache((): Project[] => getProjects().filter((project) => project.featured));

export const getProject = cache((slug: string): Project | undefined =>
  getProjects().find((project) => project.slug === slug),
);

export const getJournalPosts = cache((): JournalPost[] =>
  readCollection("journal")
    .map(({ slug, data, body }) => ({
      ...parseOrThrow(journalFrontmatter, data, `content/journal/${slug}.mdx`),
      slug,
      body,
    }))
    .filter((post) => post.published)
    .sort((a, b) => b.date.localeCompare(a.date)),
);

export const getJournalPost = cache((slug: string): JournalPost | undefined =>
  getJournalPosts().find((post) => post.slug === slug),
);

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}
