import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import wordmark from "@/public/wordmark.png";

/**
 * The supplied wordmark is a raster export. Replace public/wordmark.png with a
 * vector once brand assets arrive — the component signature will not change.
 */
export function Wordmark({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <Link href="/" aria-label="100mm — home" className={cn("block", className)}>
      <Image
        src={wordmark}
        alt="100mm"
        priority
        className={cn("h-6 w-auto md:h-7", invert && "invert")}
        sizes="140px"
      />
    </Link>
  );
}
