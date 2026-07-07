import { cn } from "@/lib/utils";
import type { IframeEmbedBlock } from "@/payload-types";

const backgrounds: Record<string, string> = {
  white: "bg-hm-white",
  offwhite: "bg-hm-offwhite",
  gray: "bg-hm-gray",
  black: "bg-hm-black",
};

/** Generieke iframe-embed (Tally-quiz e.d.) in een gecentreerde kolom. */
export function IframeEmbedComponent(props: IframeEmbedBlock) {
  const { background, heading, url, height, maxWidth } = props;

  return (
    <section className={cn("w-full", backgrounds[background ?? "white"])}>
      <div
        className="mx-auto flex w-full flex-col gap-5 px-5 py-12 lg:px-0 lg:py-[72px]"
        style={{ maxWidth: `${maxWidth ?? 720}px` }}
      >
        {heading && (
          <h1
            className={cn(
              "font-heading text-[27px] uppercase leading-[1.2] lg:text-[40px] lg:leading-[48px]",
              background === "black" ? "text-hm-white" : "text-hm-black",
            )}
          >
            {heading}
          </h1>
        )}
        <iframe
          src={url}
          title={heading ?? "Embed"}
          className="w-full border-0"
          style={{ height: `${height ?? 900}px` }}
          loading="lazy"
        />
      </div>
    </section>
  );
}
