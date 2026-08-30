import { cn } from "@/lib/cn";
import { Container } from "./Container";

type Tone = "paper" | "paper-dim" | "ink";

const tones: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  "paper-dim": "bg-paper-dim text-ink",
  ink: "bg-ink text-paper on-ink",
};

export function Section({
  tone = "paper",
  className,
  children,
  wide = false,
  id,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  wide?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-section", tones[tone], className)}>
      <Container wide={wide}>{children}</Container>
    </section>
  );
}
