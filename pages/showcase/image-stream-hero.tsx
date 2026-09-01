import Head from "next/head";
import DemoOne from "@/components/ui/image-stream-hero-demo";

/**
 * Preview route for the ImageStreamHero component: /showcase/image-stream-hero
 *
 * Deliberately separate from the CRM dashboard so the new Tailwind layer can be
 * exercised without touching a working screen.
 */
export default function ImageStreamHeroShowcase() {
  return (
    <>
      <Head>
        <title>Image Stream Hero — DVC Engineering</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Image Stream Hero
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A perspective corridor of images running toward the viewer. Motion
            is pure CSS, sized in container units, and pauses under
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-[0.8em]">
              prefers-reduced-motion
            </code>
            .
          </p>
        </header>
        <DemoOne />
      </main>
    </>
  );
}
