import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <div className="pb-section pt-24 md:pt-40">
      <Container>
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-7 max-w-[16ch] font-display text-display-lg">This page is not here.</h1>
        <p className="mt-10 max-w-prose text-lede text-grey-600">
          The link may be old, or the page may have moved. The work, the approach and the site visit are all still
          where you would expect.
        </p>
        <div className="mt-12 flex flex-wrap gap-6 text-sm">
          {[
            ["/", "Home"],
            ["/work", "Work"],
            ["/site-visit", "Site visit"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="border-b border-grey-300 pb-1 tracking-tight transition-colors duration-brand ease-brand hover:border-ink"
            >
              {label}
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
