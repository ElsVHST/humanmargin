import Image from "next/image";

import { HmButton } from "@/components/HmButton";
import { RichText } from "@/components/RichText";
import { asMedia, mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { LongformDarkBlock } from "@/payload-types";

// Desktop-posities van de blauwe annotaties, exact overgenomen uit de bron
// (absolute offsets t.o.v. de tekstkolom; zie 29c25367-desktop.json).
// Op mobiel stromen de annotaties inline mee (spec: "inline boven de alinea").
const desktopAnnotationPosition = [
  "lg:left-[-119px] lg:top-[417px]",
  "lg:left-[494px] lg:top-[772px]",
];

export function LongformDarkComponent(props: LongformDarkBlock) {
  const {
    heading,
    highlight,
    bodyTop,
    annotations,
    framedImage,
    bodyBottom,
    arrowList,
    cta,
  } = props;

  const media = asMedia(framedImage);
  const imageUrl = mediaUrl(framedImage);

  return (
    <section className="w-full bg-hm-black text-hm-white">
      {/* Kolom: mobiel 85% breed / 75-50 padding, desktop 792px (max 55%) / 100-100 */}
      <div className="mx-auto flex w-[85%] flex-col pb-[50px] pt-[75px] lg:w-[792px] lg:max-w-[55%] lg:pb-[100px] lg:pt-[100px]">
        {/* Tekstkolom: relatief zodat de annotaties er op desktop absoluut in hangen */}
        <div className="relative flex flex-col gap-5 lg:px-[79px]">
          {heading && (
            <h2 className="font-heading text-[27px] uppercase leading-[29.7px] lg:text-[40px] lg:leading-[48px]">
              {heading}
            </h2>
          )}

          {highlight && (
            /* Live-site computed CSS: gele tekst (#EDFF00), geen achtergrond-markering */
            <h3 className="text-[19px] font-medium uppercase leading-[20.9px] text-hm-yellow lg:text-[26px] lg:leading-[31.2px]">
              {highlight}
            </h3>
          )}

          {bodyTop && (
            <RichText
              data={bodyTop}
              className="hm-prose text-hm-white [&_a]:text-hm-yellow"
            />
          )}

          {annotations?.map((annotation, index) => (
            <p
              key={annotation.id ?? index}
              aria-hidden
              className={cn(
                "pointer-events-none -rotate-[9deg] text-hm-blue",
                "text-[22px] leading-[24.2px] lg:absolute lg:z-10 lg:text-[30px] lg:leading-[36px]",
                annotation.font === "marker" ? "font-marker" : "font-handwritten",
                desktopAnnotationPosition[index] ?? "",
              )}
            >
              {annotation.text}
            </p>
          ))}

          {media && imageUrl && (
            <div className="text-center">
              <Image
                src={imageUrl}
                alt={media.alt ?? ""}
                width={media.width ?? 800}
                height={media.height ?? 343}
                className="h-auto w-full"
              />
            </div>
          )}

          {bodyBottom && (
            <RichText
              data={bodyBottom}
              className="hm-prose -mb-5 text-hm-white [&_a]:text-hm-yellow"
            />
          )}

          {arrowList && arrowList.length > 0 && (
            <ul className="flex flex-col">
              {arrowList.map((item, index) => (
                <li key={item.id ?? index} className="flex h-11 items-center">
                  {/* Getekende pijl van de live site (inline SVG, geel, 44px) */}
                  <svg
                    aria-hidden
                    viewBox="0 0 125.82 24.71"
                    className="mr-[11px] h-11 w-11 shrink-0 fill-hm-yellow"
                  >
                    <path d="M125.62,11.77s-.06-.05-.09-.07c-5.52-3.34-10.69-7.18-15.47-11.51-.67-.6-2.92.32-2.21.97,4.27,3.85,8.83,7.34,13.67,10.43-17.66-.7-35.34-1.08-53.02-1.14-12.64-.72-25.28-1.3-37.94-1.45-8.73-.1-17.47,0-26.2.36-.7.03-2.58,1.13-1.01,1.06,14.38-.6,28.74-.43,43.1.11-6.03.07-12.06.18-18.09.33-8.92.22-17.85.52-26.77.9-.7.03-2.58,1.13-1.01,1.06,21.97-.94,43.97-1.38,65.97-1.32,9.35.53,18.71,1.12,28.06,1.68,6.98.42,13.97.8,20.96,1.13-1.88.79-3.7,1.71-5.49,2.78-3.76,2.24-7.3,4.83-11.52,6.19-.7.22-.97.67-.89,1.01.08.34.52.56,1.24.32,9.23-2.92,18.08-6.9,26.39-11.89.15-.09.28-.22.36-.36.15-.19.17-.4-.08-.59ZM90.37,11.78c1.39.03,2.77.05,4.16.08,8.58.19,17.16.46,25.73.8-.69.2-1.37.42-2.05.66-9.28-.42-18.56-.97-27.84-1.54ZM110.09,18.86c2.89-1.8,5.85-3.29,8.99-4.39.07,0,.15.01.22.01-3.2,1.73-6.48,3.32-9.82,4.76.2-.13.4-.25.6-.38Z" />
                  </svg>
                  <span className="pl-[5px] text-[17px] lg:text-[18px]">{item.text}</span>
                </li>
              ))}
            </ul>
          )}

          {cta?.label && cta?.href && (
            <div>
              <HmButton
                label={cta.label}
                href={cta.href}
                variant={cta.variant ?? "blue"}
                grow
                className="px-[30px] py-[15px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.5)]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
