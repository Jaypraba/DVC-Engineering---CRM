import type { MetadataRoute } from "next";
import { getJournalPosts, getProjects } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/approach", "/site-visit", "/studio", "/journal", "/contact", "/book", "/privacy", "/terms"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : route === "/site-visit" || route === "/book" ? 0.9 : 0.6,
    })),
    ...getProjects().map((project) => ({
      url: `${site.url}/work/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...getJournalPosts().map((post) => ({
      url: `${site.url}/journal/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
