import type { CSSProperties } from "react";

import { HmButton } from "@/components/HmButton";
import { mediaUrl } from "@/lib/media";
import type { HeroPhotoBlock } from "@/payload-types";

export function HeroPhotoComponent(props: HeroPhotoBlock) {
  const { image, minHeight, contentPaddingTop, mobileMinHeight, mobileContentPaddingTop, cta } = props;
  const url = mediaUrl(image);

  // Mobiel: humanmargin.eu gebruikt per hero een eigen (veel kleinere) hoogte/padding.
  // Exacte waarden komen mee als --hero-mh-m / --hero-pt-m; ontbreken ze, dan valt
  // globals.css terug op de desktop-waarde × 0,45 / 0,48.
  const dMinH = minHeight ?? 810;
  const dPad = contentPaddingTop ?? 300;
  return (
    <section
      className="hm-hero-photo relative flex w-full flex-col bg-cover"
      style={
        {
          backgroundImage: url ? `url(${url})` : undefined,
          backgroundPosition: "50% 0%",
          "--hero-mh": `${dMinH}px`,
          "--hero-mh-m": mobileMinHeight ? `${mobileMinHeight}px` : `calc(${dMinH}px * 0.45)`,
        } as CSSProperties
      }
    >
      <div
        className="hm-hero-content mx-auto flex w-full max-w-[1140px] flex-1 flex-col justify-center gap-5"
        style={
          {
            "--hero-pt": `${dPad}px`,
            "--hero-pt-m": mobileContentPaddingTop ? `${mobileContentPaddingTop}px` : `calc(${dPad}px * 0.48)`,
          } as CSSProperties
        }
      >
        {cta?.label && cta?.href && (
          <div className="text-center">
            <HmButton
              label={cta.label}
              href={cta.href}
              variant={cta.variant}
              className="px-[50px] py-[20px]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
