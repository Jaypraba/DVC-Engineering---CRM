import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pb-14 pt-16 md:pb-20 md:pt-24">
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-7 max-w-[16ch] font-display text-display-lg">{title}</h1>
        {lede ? (
          <div className="mt-10 grid lg:grid-cols-12">
            <p className="text-lede text-grey-600 lg:col-span-6 lg:col-start-7">{lede}</p>
          </div>
        ) : null}
        {children}
      </Container>
    </header>
  );
}
