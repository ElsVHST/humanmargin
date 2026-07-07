"use client";

import { useState } from "react";

import { RichText } from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { FaqBlock } from "@/payload-types";

type FaqItems = NonNullable<FaqBlock["items"]>;

/**
 * Click-driven accordeon, één item tegelijk open (Elementor nested-accordion default
 * "max items expanded = one"). Eerste item standaard open, zoals op humanmargin.eu.
 * Toetsenbord-toegankelijk: elke vraagbalk is een <button> met aria-expanded en een
 * gekoppeld antwoordpaneel (aria-controls / hidden).
 */
export function FaqAccordion({ items }: { items: FaqItems }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-[584px]">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={item.id ?? index}>
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className={cn(
                "flex w-full items-center justify-between gap-[10px] border-t border-[#d5d8dc] p-[10px] text-left transition-colors duration-300",
                isOpen ? "bg-hm-yellow text-[#1f2124]" : "bg-hm-gray text-hm-black",
              )}
            >
              <span className="font-sans text-[15px] font-bold uppercase leading-[22.5px]">
                {item.question}
              </span>
              {/* +/− indicator: horizontale balk altijd zichtbaar, verticale balk
                  verdwijnt bij openen → "+" (dicht) wordt "−" (open). */}
              <span
                className="relative flex h-[15px] w-[13px] shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <span className="absolute h-[1.5px] w-full bg-current" />
                <span
                  className={cn(
                    "absolute h-full w-[1.5px] bg-current transition-transform duration-300",
                    isOpen ? "scale-y-0" : "scale-y-100",
                  )}
                />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="flex flex-col gap-5 border-t border-[#d5d8dc] p-[10px]"
            >
              {item.answer && <RichText data={item.answer} className="hm-prose" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
