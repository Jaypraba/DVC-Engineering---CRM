import { ImageStreamHero } from "@/components/ui/image-stream-hero";

/**
 * Architecture and construction imagery, to suit a planning-led CRM.
 *
 * These are Unsplash CDN URLs. Outbound image hosts are blocked from the
 * environment this was built in, so they could not be loaded and confirmed —
 * open the page once and swap any that 404. Sizes are requested at 600px wide:
 * cards never render larger than roughly a third of the container, and 24 of
 * them are on screen at once, so full-resolution files are wasted bytes.
 */
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

export const HERO_IMAGES = [
  { src: u("1503387762-592deb58ef4e"), alt: "Steel frame of a building under construction" },
  { src: u("1486406146926-c627a92ad1ab"), alt: "Glass office tower seen from below" },
  { src: u("1487958449943-2429e8be8625"), alt: "White concrete building with repeating balconies" },
  { src: u("1449824913935-59a10b8d2000"), alt: "City street lined with terraced buildings" },
  { src: u("1504307651254-35680f356dfd"), alt: "Construction workers on a site at height" },
  { src: u("1541888946425-d81bb19240f5"), alt: "Modern detached house at dusk" },
  { src: u("1600585154340-be6161a56a0c"), alt: "Open-plan living room with large windows" },
  { src: u("1600607687939-ce8a6c25118c"), alt: "Contemporary interior with a staircase" },
  { src: u("1416339306562-f3d12fefd36f"), alt: "Angular facade against a clear sky" },
  { src: u("1600566753190-17f0baa2a6c3"), alt: "Bright bedroom with timber flooring" },
  { src: u("1502672260266-1c1ef2d93688"), alt: "Kitchen and dining space in a renovated flat" },
  { src: u("1580587771525-78b9dba3b914"), alt: "Rear extension opening onto a garden" },
];

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return (
    <ImageStreamHero
      images={HERO_IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Your work,
            <br />
            front and centre.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          A hero that leads with the images instead of describing them. Swap in
          your own and the corridor rebuilds around them.
        </p>
      </div>
    </ImageStreamHero>
  );
}
