import { siteVisit } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function Attendees({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  const heading = tone === "ink" ? "text-paper" : "text-ink";
  const body = tone === "ink" ? "text-grey-300" : "text-grey-600";
  const rule = tone === "ink" ? "border-white/15" : "border-grey-200";
  const index = tone === "ink" ? "text-grey-500" : "text-grey-400";

  return (
    <ol className="grid gap-x-10 gap-y-12 md:grid-cols-3">
      {siteVisit.attendees.map((attendee, i) => (
        <Reveal as="li" key={attendee.role} delay={i * 90}>
          <div className={`border-t pt-6 ${rule}`}>
            <p className={`text-eyebrow uppercase ${index}`}>{String(i + 1).padStart(2, "0")}</p>
            <h3 className={`mt-5 font-display text-2xl tracking-tight ${heading}`}>{attendee.role}</h3>
            <p className={`mt-4 ${body}`}>{attendee.brief}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
