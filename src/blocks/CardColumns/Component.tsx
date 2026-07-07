import Image from "next/image";

import { HmButton } from "@/components/HmButton";
import { RichText } from "@/components/RichText";
import { cn } from "@/lib/utils";
import { asMedia, mediaUrl } from "@/lib/media";
import type { CardColumnsBlock } from "@/payload-types";

const backgrounds: Record<string, string> = {
  gray: "bg-hm-gray",
  offwhite: "bg-hm-offwhite",
  white: "bg-hm-white",
  black: "bg-hm-black",
};

export function CardColumnsComponent(props: CardColumnsBlock) {
  const { background, cards } = props;
  const isDark = background === "black";

  // Origineel (leeszaal sectie 2): 3 gelijke kolommen van 480px met 100.8px (7vw)
  // padding. Per kolom: kop (Archivo Black 40/48) + tekst (.hm-prose 18/27) +
  // gele knop, en daaronder een foto van 540px hoog. De knop staat onderaan een
  // 432px-hoog blok vastgezet (justify-between) zodat alle knoppen uitlijnen.
  return (
    <section className={cn("w-full", backgrounds[background ?? "gray"])}>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {cards?.map((card, index) => {
          const media = asMedia(card.image);
          const url = mediaUrl(card.image);
          return (
            <div
              key={card.id ?? index}
              className={cn(
                "flex flex-col justify-center gap-5 px-6 py-10 lg:p-[7vw]",
                isDark ? "text-hm-white" : "text-hm-black",
              )}
            >
              <div className="flex flex-col justify-between gap-5 lg:min-h-[432px]">
                <div className="flex flex-col gap-5">
                  {card.heading && (
                    <h2 className="font-heading text-[27px] uppercase leading-[29.7px] lg:text-[40px] lg:leading-[48px]">
                      {card.heading}
                    </h2>
                  )}
                  {card.subheading && (
                    <p
                      className={cn(
                        "text-[18px] font-semibold uppercase leading-[1.2] lg:text-[20px]",
                        isDark ? "text-hm-yellow" : "text-hm-blue",
                      )}
                    >
                      {card.subheading}
                    </p>
                  )}
                  {card.body && <RichText data={card.body} className="hm-prose" />}
                </div>
                {card.cta?.label && card.cta?.href && (
                  <div>
                    <HmButton
                      label={card.cta.label}
                      href={card.cta.href}
                      variant={card.cta.variant ?? "yellow"}
                      className="px-[30px] py-[15px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                )}
              </div>
              {media && url && (
                <Image
                  src={url}
                  alt={media.alt ?? ""}
                  width={media.width ?? 682}
                  height={media.height ?? 1024}
                  className="mx-auto h-[245px] w-auto object-contain lg:h-[540px] lg:w-full lg:object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
