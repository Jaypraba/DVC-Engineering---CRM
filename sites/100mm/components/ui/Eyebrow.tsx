import { cn } from "@/lib/cn";

/**
 * Small label above a heading. The optional marker is one of the few places
 * green is allowed — count it against the two-per-viewport budget.
 */
export function Eyebrow({
  children,
  marker = false,
  className,
}: {
  children: React.ReactNode;
  marker?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("flex items-center gap-2.5 font-body text-eyebrow uppercase text-grey-500", className)}>
      {marker ? <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-accent" /> : null}
      {children}
    </p>
  );
}
