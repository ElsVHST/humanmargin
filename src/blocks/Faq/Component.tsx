import { HmButton } from "@/components/HmButton";
import { cn } from "@/lib/utils";
import type { FaqBlock } from "@/payload-types";

import { FaqAccordion } from "./FaqAccordion";

const backgrounds: Record<string, string> = {
  offwhite: "bg-hm-offwhite",
  white: "bg-hm-white",
  gray: "bg-hm-gray",
  black: "bg-hm-black",
};

// "Veelgestelde vragen". Origineel is de linkerkolom van een split (foto rechts);
// hier de content-kolom als zelfstandig block. Kop Archivo Black 40/48 uppercase,
// accordeon max. 584px breed, kantlijn links 144px, verticale padding ~100px.
export function FaqComponent(props: FaqBlock) {
  const { background, heading, items, outro, cta } = props;
  const bg = background ?? "offwhite";

  return (
    <section className={cn("w-full", backgrounds[bg])}>
      <div
        className={cn(
          "flex w-full justify-start px-5 py-[72px] lg:py-[100px] lg:pl-[144px] lg:pr-[100px]",
          bg === "black" ? "text-hm-white" : "text-hm-black",
        )}
      >
        <div className="flex w-full max-w-[584px] flex-col justify-center gap-5">
          {heading && (
            <h2 className="font-heading text-[27px] uppercase leading-[1.2] lg:text-[40px] lg:leading-[48px]">
              {heading}
            </h2>
          )}
          {items && items.length > 0 && <FaqAccordion items={items} />}
          {outro && (
            <p className="font-sans text-[18px] leading-[27px]">
              <strong className="font-bold">{outro}</strong>
            </p>
          )}
          {cta?.label && cta?.href && (
            <div className="-rotate-[2deg]">
              <HmButton
                label={cta.label}
                href={cta.href}
                variant={cta.variant ?? "yellow"}
                className="px-[30px] py-[15px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.45)] hover:scale-110"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
