import { HmButton } from "@/components/HmButton";
import { RichText } from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { TextCtaBlock } from "@/payload-types";

const backgrounds: Record<string, string> = {
  white: "bg-hm-white",
  offwhite: "bg-hm-offwhite",
  gray: "bg-hm-gray",
  black: "bg-hm-black",
};

// Generieke kop + tekst + knop-sectie. Origineel (sectie "En wie ben ik überhaupt…"):
// kop Archivo Black 40/48 uppercase, lopende tekst Archivo 18/27, knop blauw 12/24px.
// Uitlijning links (textAlign: start), verticale gap 20px. Geen rotatie (JSON toont geen transform-rotate).
export function TextCtaComponent(props: TextCtaBlock) {
  const { background, heading, body, cta } = props;
  const bg = background ?? "white";

  return (
    <section className={cn("w-full", backgrounds[bg])}>
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1140px] flex-col justify-center gap-5 px-5 py-[72px] lg:px-0 lg:py-[100px]",
          bg === "black" ? "text-hm-white" : "text-hm-black",
        )}
      >
        {heading && (
          <h2 className="font-heading text-[27px] uppercase leading-[29.7px] lg:text-[40px] lg:leading-[48px]">
            {heading}
          </h2>
        )}
        {body && <RichText data={body} className="hm-prose" />}
        {cta?.label && cta?.href && (
          <div>
            <HmButton
              label={cta.label}
              href={cta.href}
              variant={cta.variant ?? "blue"}
              className="px-[24px] py-[12px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.43)] hover:scale-110"
            />
          </div>
        )}
      </div>
    </section>
  );
}
