import { cn } from "@/lib/cn";

/**
 * Long-form typography. Written out rather than pulled in via a plugin so the
 * measure, rhythm and rule weights stay under our control.
 */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-prose text-grey-700",
        "[&_p]:mb-6 [&_p]:leading-relaxed",
        "[&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:text-ink",
        "[&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:font-display [&_h3]:text-xl [&_h3]:tracking-tight [&_h3]:text-ink",
        "[&_ul]:mb-6 [&_ul]:space-y-2.5 [&_ul]:pl-0",
        "[&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2.5 [&_ol]:pl-5",
        "[&_li]:leading-relaxed",
        "[&_ul>li]:relative [&_ul>li]:list-none [&_ul>li]:pl-5",
        "[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.7em] [&_ul>li]:before:h-px [&_ul>li]:before:w-2.5 [&_ul>li]:before:bg-grey-300 [&_ul>li]:before:content-['']",
        "[&_a]:underline [&_a]:decoration-grey-300 [&_a]:underline-offset-4 [&_a:hover]:decoration-ink",
        "[&_strong]:font-medium [&_strong]:text-ink",
        "[&_blockquote]:my-10 [&_blockquote]:border-l [&_blockquote]:border-ink [&_blockquote]:pl-6 [&_blockquote]:font-display [&_blockquote]:text-xl [&_blockquote]:tracking-tight [&_blockquote]:text-ink",
        "[&_hr]:my-12 [&_hr]:border-grey-200",
        className,
      )}
    >
      {children}
    </div>
  );
}
