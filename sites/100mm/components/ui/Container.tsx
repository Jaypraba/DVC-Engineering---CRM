import { cn } from "@/lib/cn";

export function Container({
  className,
  children,
  wide = false,
}: {
  className?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full px-gutter", wide ? "max-w-[110rem]" : "max-w-[82rem]", className)}>
      {children}
    </div>
  );
}
