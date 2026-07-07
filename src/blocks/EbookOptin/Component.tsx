import Image from "next/image";

import { RichText } from "@/components/RichText";
import { asMedia, mediaUrl } from "@/lib/media";
import type { EbookOptinBlock } from "@/payload-types";

import { DownloadForm } from "./DownloadForm";

// Grijze e-book-weggever van humanmargin.eu/weggever/. Sectie #DDDDD3, 801px hoog,
// 1300px-container (70px marge) met flex-row: links de e-book-cover (718px), rechts
// de content (572px) verticaal gecentreerd — kop + introtekst gecentreerd, dan het
// aanmeldformulier. De cover ontbreekt in de media-map: dan blijft links leeg grijs.
export function EbookOptinComponent(props: EbookOptinBlock) {
  const { heading, body, buttonLabel, image } = props;
  const media = asMedia(image);
  const url = mediaUrl(image);

  return (
    <section className="w-full bg-hm-gray text-hm-black">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[10px] px-5 py-[50px] lg:min-h-[801px] lg:flex-row lg:items-stretch lg:px-[70px]">
        <div className="flex items-center justify-center lg:w-[718px] lg:shrink-0">
          {url && (
            <Image
              src={url}
              alt={media?.alt ?? ""}
              width={media?.width ?? 698}
              height={media?.height ?? 900}
              className="h-auto w-full max-w-[698px] object-contain"
            />
          )}
        </div>
        <div className="flex flex-col justify-center gap-5 p-[10px] lg:w-[572px] lg:shrink-0">
          {heading && (
            <h2 className="text-center font-sans text-[32px] font-normal leading-[1.2] lg:text-[40px] lg:leading-[48px]">
              {heading}
            </h2>
          )}
          {body && <RichText data={body} className="hm-prose text-center" />}
          <DownloadForm buttonLabel={buttonLabel ?? "Download"} source={heading ?? "Weggever"} />
        </div>
      </div>
    </section>
  );
}
