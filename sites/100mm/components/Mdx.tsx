import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Media } from "@/components/ui/Media";

const components = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} {...props} />
    ) : (
      <a href={href} rel="noreferrer" {...props} />
    ),
  Media,
};

/** Renders a validated MDX body. Wrap it in <Prose> for the reading styles. */
export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
