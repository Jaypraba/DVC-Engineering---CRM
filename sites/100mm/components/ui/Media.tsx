import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Full-bleed imagery is central to the design, but the practice has no shot
 * library in the repo yet. Until real photography lands, Media renders a quiet
 * ink-toned plate at the correct aspect ratio so every layout is complete and
 * swapping in a photograph is a one-prop change.
 */
export function Media({
  src,
  alt,
  ratio = "4 / 3",
  className,
  caption,
  priority = false,
  sizes = "100vw",
}: {
  src?: string;
  alt: string;
  ratio?: string;
  className?: string;
  caption?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <figure className={cn("w-full", className)}>
      <div className="relative w-full overflow-hidden bg-grey-100" style={{ aspectRatio: ratio }}>
        {src ? (
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-end bg-grey-200/70 p-5">
            <span className="font-body text-eyebrow uppercase text-grey-500">{alt}</span>
          </div>
        )}
      </div>
      {caption ? <figcaption className="mt-3 text-sm text-grey-500">{caption}</figcaption> : null}
    </figure>
  );
}
