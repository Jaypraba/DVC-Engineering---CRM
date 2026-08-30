"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = {
  question: string;
  answer: React.ReactNode;
};

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className={cn("rule", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question} className="border-b border-grey-200">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-start justify-between gap-8 py-7 text-left"
              >
                <span className="font-display text-lg tracking-tight md:text-xl">{item.question}</span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 shrink-0 text-2xl leading-none text-grey-400 transition-transform duration-brand ease-brand",
                    isOpen && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="max-w-prose pb-8 text-grey-600"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
