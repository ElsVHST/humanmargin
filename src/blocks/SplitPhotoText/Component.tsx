import Image from "next/image";

import { HmButton } from "@/components/HmButton";
import { RichText } from "@/components/RichText";
import { cn } from "@/lib/utils";
import { asMedia, mediaUrl } from "@/lib/media";
import type { SplitPhotoTextBlock } from "@/payload-types";

import { SignupForm } from "../BrushNote/SignupForm";

const backgrounds: Record<string, string> = {
  gray: "bg-hm-gray",
  offwhite: "bg-hm-offwhite",
  white: "bg-hm-white",
  black: "bg-hm-black",
};

// Getekende pijl van de live site (zelfde SVG als LongformDark)
function ArrowSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 125.82 24.71" className={className}>
      <path d="M125.62,11.77s-.06-.05-.09-.07c-5.52-3.34-10.69-7.18-15.47-11.51-.67-.6-2.92.32-2.21.97,4.27,3.85,8.83,7.34,13.67,10.43-17.66-.7-35.34-1.08-53.02-1.14-12.64-.72-25.28-1.3-37.94-1.45-8.73-.1-17.47,0-26.2.36-.7.03-2.58,1.13-1.01,1.06,14.38-.6,28.74-.43,43.1.11-6.03.07-12.06.18-18.09.33-8.92.22-17.85.52-26.77.9-.7.03-2.58,1.13-1.01,1.06,21.97-.94,43.97-1.38,65.97-1.32,9.35.53,18.71,1.12,28.06,1.68,6.98.42,13.97.8,20.96,1.13-1.88.79-3.7,1.71-5.49,2.78-3.76,2.24-7.3,4.83-11.52,6.19-.7.22-.97.67-.89,1.01.08.34.52.56,1.24.32,9.23-2.92,18.08-6.9,26.39-11.89.15-.09.28-.22.36-.36.15-.19.17-.4-.08-.59ZM90.37,11.78c1.39.03,2.77.05,4.16.08,8.58.19,17.16.46,25.73.8-.69.2-1.37.42-2.05.66-9.28-.42-18.56-.97-27.84-1.54ZM110.09,18.86c2.89-1.8,5.85-3.29,8.99-4.39.07,0,.15.01.22.01-3.2,1.73-6.48,3.32-9.82,4.76.2-.13.4-.25.6-.38Z" />
    </svg>
  );
}

export function SplitPhotoTextComponent(props: SplitPhotoTextBlock) {
  const {
    background,
    imagePosition,
    imageTreatment,
    image,
    annotation,
    annotationFont,
    annotationColor,
    annotationPosition,
    heading,
    subheading,
    headingLevel,
    body,
    arrowList,
    arrowColor,
    bodyBottom,
    cta,
    markerHeading,
    showForm,
    formButtonLabel,
  } = props;

  const media = asMedia(image);
  const url = mediaUrl(image);
  const HeadingTag = headingLevel === "h1" ? "h1" : "h2";
  const imageRight = imagePosition === "right";
  const inset = imageTreatment === "inset";
  const dark = background === "black";

  const annotationEl = annotation ? (
    <h3
      className={cn(
        "-rotate-[4deg] text-[22px] leading-[1.2] lg:text-[30px] lg:leading-[36px]",
        annotationFont === "marker" ? "font-marker" : "font-handwritten",
        annotationColor === "yellow" ? "text-hm-yellow" : "text-hm-blue",
        annotationPosition === "aboveHeading" ? "text-left" : "text-right lg:-ml-[35px] lg:-mt-px",
      )}
    >
      {annotation}
    </h3>
  ) : null;

  // Origineel: fotokolom 612/1440 (42.5%), tekstkolom 828/1440 met padding 7vw
  // Inset-variant (sectie B): fotokolom 653px met 144px kantlijn, afbeelding 509x630.
  // Mobiel: een ingesprongen PORTRET-foto is op humanmargin.eu verborgen (te hoog op 390px);
  // een liggende inset-foto blijft wel zichtbaar. Vandaar de aspect-check.
  const hideInsetOnMobile = inset && !!media && (media.height ?? 0) > (media.width ?? 0);
  const photoColumn = inset ? (
    <div
      className={cn(
        "flex-col justify-center py-10 lg:flex lg:w-[45.35%] lg:py-[41px]",
        hideInsetOnMobile ? "hidden" : "flex",
        imageRight ? "pr-5 lg:pl-0 lg:pr-[144px]" : "pl-5 lg:pl-[144px] lg:pr-0",
      )}
    >
      {media && url && (
        <Image
          src={url}
          alt={media.alt ?? ""}
          width={media.width ?? 800}
          height={media.height ?? 585}
          className="h-auto w-full max-w-[509px] lg:h-[630px] lg:object-cover"
        />
      )}
    </div>
  ) : (
    <div
      className="min-h-[296px] bg-cover bg-center lg:min-h-0 lg:w-[42.5%]"
      style={{ backgroundImage: url ? `url(${url})` : undefined }}
      role="img"
      aria-label={media?.alt ?? ""}
    />
  );

  // Mobiel: humanmargin.eu zet de tekst altijd bóven de foto (foto onderaan),
  // ongeacht de desktop-fotopositie. Vandaar flex-col-reverse (DOM = foto, tekst).
  return (
    <section className={cn("w-full", backgrounds[background ?? "gray"])}>
      <div
        className={cn(
          "flex flex-col-reverse lg:min-h-[630px]",
          imageRight ? "lg:flex-row-reverse" : "lg:flex-row",
        )}
      >
        {photoColumn}
        <div
          className={cn(
            "flex flex-1 flex-col justify-center gap-5 p-[39px] lg:p-[7vw]",
            dark ? "text-hm-white" : "text-hm-black",
          )}
        >
          {annotationPosition === "aboveHeading" && annotationEl}
          {heading && (
            <HeadingTag className="font-heading text-[27px] uppercase leading-[1.2] lg:text-[40px] lg:leading-[48px]">
              {heading}
            </HeadingTag>
          )}
          {subheading && (
            <h3 className="font-sans text-[20px] font-medium uppercase leading-[1.2] text-hm-yellow lg:text-[26px] lg:leading-[31.2px]">
              {subheading}
            </h3>
          )}
          {annotationPosition !== "aboveHeading" && annotationEl}
          {body && (
            <RichText
              data={body}
              className={cn("hm-prose", dark && "[&_a]:text-hm-yellow")}
            />
          )}
          {arrowList && arrowList.length > 0 && (
            <ul className="flex flex-col gap-2">
              {arrowList.map((item, index) => (
                <li key={item.id ?? index} className="flex items-center">
                  <ArrowSvg
                    className={cn(
                      "mr-[11px] h-6 w-11 shrink-0",
                      arrowColor === "yellow" ? "fill-hm-yellow" : "fill-hm-blue",
                    )}
                  />
                  <span className="pl-[5px] text-[13px] font-bold uppercase leading-[1.4] lg:text-[14px]">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {bodyBottom && (
            <RichText
              data={bodyBottom}
              className={cn("hm-prose", dark && "[&_a]:text-hm-yellow")}
            />
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
          {markerHeading && (
            <h3 className="-rotate-[4deg] font-marker text-[30px] uppercase leading-[1.2] text-hm-yellow lg:mb-[6px] lg:mt-[24px] lg:text-[35px] lg:leading-[42px]">
              {markerHeading}
            </h3>
          )}
          {showForm && (
            <SignupForm
              buttonLabel={formButtonLabel ?? "Schrijf me in"}
              source={markerHeading ?? heading ?? "In de Marge"}
            />
          )}
        </div>
      </div>
    </section>
  );
}
