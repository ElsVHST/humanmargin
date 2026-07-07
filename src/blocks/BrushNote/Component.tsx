import Image from "next/image";

import { RichText } from "@/components/RichText";
import { asMedia, mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { BrushNoteBlock } from "@/payload-types";

import { SignupForm } from "./SignupForm";

// Standaard gele penseelstreek (327x1024 origineel, hier lokaal 470x1470).
// Wordt gebruikt als Els geen eigen `brushImage` uploadt.
const FALLBACK_BRUSH = {
  src: "/media/2026_06_in-de-marge-e1781177869154.png",
  width: 470,
  height: 1470,
};

// Donkere sectie met gele penseelstreek links en tekst rechts. Gebruikt voor de
// nieuwsbrief-aanmelding, korte notities en quotes (naam in geel handschrift eronder).
export function BrushNoteComponent(props: BrushNoteBlock) {
  const { markerHeading, body, attribution, showForm, formButtonLabel, brushImage } = props;

  const brush = asMedia(brushImage);
  const brushSrc = mediaUrl(brushImage) ?? FALLBACK_BRUSH.src;
  const brushWidth = brush?.width ?? FALLBACK_BRUSH.width;
  const brushHeight = brush?.height ?? FALLBACK_BRUSH.height;

  return (
    <section className="w-full bg-hm-black text-hm-white">
      <div className="mx-auto flex w-full max-w-[1300px] justify-center px-5 py-12 lg:px-[70px] lg:py-[50px]">
        <div className="flex w-full max-w-[793px] flex-col justify-center gap-5 p-[10px]">
          {markerHeading && (
            <h2 className="-rotate-[4deg] font-marker text-[30px] uppercase leading-[1.2] text-hm-yellow lg:-ml-[49px] lg:mb-[6px] lg:text-[35px] lg:leading-[42px]">
              {markerHeading}
            </h2>
          )}

          <div className="flex flex-row items-center gap-5">
            <div className="shrink-0 lg:-ml-[55px]">
              <Image
                src={brushSrc}
                alt={brush?.alt ?? ""}
                width={brushWidth}
                height={brushHeight}
                className="h-auto w-[42px] object-contain lg:w-[52px]"
              />
            </div>
            {body && <RichText data={body} className="hm-prose flex-1" />}
          </div>

          {showForm && (
            <SignupForm
              buttonLabel={formButtonLabel ?? "Schrijf me in"}
              source={markerHeading ?? "In de Marge"}
            />
          )}

          {attribution && (
            <h3
              className={cn(
                "-rotate-[4deg] text-center font-marker text-[30px] uppercase leading-[1.2] text-hm-yellow",
                "lg:-ml-[49px] lg:-mt-[6px] lg:text-[35px] lg:leading-[42px]",
              )}
            >
              {attribution}
            </h3>
          )}
        </div>
      </div>
    </section>
  );
}
