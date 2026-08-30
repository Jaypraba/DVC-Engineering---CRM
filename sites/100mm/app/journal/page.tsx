import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { formatDate, getJournalPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Journal",
  description: "Writing on cost, structure, consent and programme in high-value London residential construction.",
};

export default function JournalPage() {
  const posts = getJournalPosts();

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="What the industry would rather not put in writing."
        lede="Notes on cost, structure, consent and programme. Written for clients, not for other builders."
      />

      <Section className="pt-0">
        <ul>
          {posts.map((post, index) => (
            <Reveal as="li" key={post.slug} delay={index * 60}>
              <Link href={`/journal/${post.slug}`} className="group block border-t border-grey-200 py-10">
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <p className="text-sm text-grey-500">{formatDate(post.date)}</p>
                    {post.tags.length > 0 ? <p className="mt-2 text-sm text-grey-400">{post.tags.join(" · ")}</p> : null}
                  </div>
                  <div className="lg:col-span-8">
                    <h2 className="max-w-[22ch] font-display text-display-sm transition-colors duration-brand ease-brand group-hover:text-grey-600">
                      {post.title}
                    </h2>
                    <p className="mt-4 max-w-prose text-grey-600">{post.summary}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </>
  );
}
