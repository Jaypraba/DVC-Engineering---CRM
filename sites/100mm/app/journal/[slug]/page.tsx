import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { Mdx } from "@/components/Mdx";
import { CtaBand } from "@/components/site/CtaBand";
import { formatDate, getJournalPost, getJournalPosts } from "@/lib/content";

export function generateStaticParams() {
  return getJournalPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: { type: "article", publishedTime: post.date, title: post.title, description: post.summary },
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) notFound();

  const more = getJournalPosts()
    .filter((item) => item.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      <article>
        <header className="pb-12 pt-16 md:pt-24">
          <Container>
            <p className="text-eyebrow uppercase text-grey-500">
              {formatDate(post.date)}
              {post.tags.length > 0 ? ` · ${post.tags.join(" · ")}` : ""}
            </p>
            <h1 className="mt-7 max-w-[20ch] font-display text-display-lg">{post.title}</h1>
            <p className="mt-10 max-w-prose text-lede text-grey-600">{post.summary}</p>
          </Container>
        </header>

        <Container>
          <div className="border-t border-grey-200 py-14 md:py-20">
            <Prose>
              <Mdx source={post.body} />
            </Prose>
            <p className="mt-14 max-w-prose text-sm text-grey-500">Written by {post.author}.</p>
          </div>
        </Container>
      </article>

      {more.length > 0 ? (
        <Section tone="paper-dim">
          <p className="text-eyebrow uppercase text-grey-500">More writing</p>
          <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {more.map((item) => (
              <li key={item.slug}>
                <Link href={`/journal/${item.slug}`} className="group block border-t border-grey-200 pt-6">
                  <p className="text-sm text-grey-500">{formatDate(item.date)}</p>
                  <h2 className="mt-3 font-display text-display-sm transition-colors duration-brand ease-brand group-hover:text-grey-600">
                    {item.title}
                  </h2>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CtaBand />
    </>
  );
}
