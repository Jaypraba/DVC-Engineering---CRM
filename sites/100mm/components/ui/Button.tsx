import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-body text-sm font-medium tracking-tight transition-colors duration-brand ease-brand disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // The primary CTA is the site's single most important green element.
  primary: "bg-accent text-ink hover:bg-accent-dim",
  secondary: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "border border-white/25 text-paper hover:border-accent hover:text-accent",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonAction({
  variant = "primary",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
