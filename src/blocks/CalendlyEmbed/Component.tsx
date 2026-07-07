import { cn } from "@/lib/utils";
import type { CalendlyEmbedBlock } from "@/payload-types";

const backgrounds: Record<string, string> = {
  gray: "bg-hm-gray",
  offwhite: "bg-hm-offwhite",
  white: "bg-hm-white",
};

/**
 * Agenda-sectie van /contact: kop (Archivo Black 40/48 center), blauwe
 * handgeschreven annotatie (-4deg, rechts uitgelijnd) en de Calendly inline
 * widget (720px kolom, 700px hoog, afgerond 3px met subtiele schaduw).
 */
export function CalendlyEmbedComponent(props: CalendlyEmbedBlock) {
  const { background, heading, annotation, calendlyUrl, height } = props;

  const src = `${calendlyUrl}${calendlyUrl.includes("?") ? "&" : "?"}hide_gdpr_banner=1`;

  return (
    <section className={cn("w-full", backgrounds[background ?? "gray"])}>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-5 pb-[86px] pt-[58px] lg:px-0">
        {heading && (
          <h2 className="text-center font-heading text-[27px] uppercase leading-[1.2] text-hm-black lg:text-[40px] lg:leading-[48px]">
            {heading}
          </h2>
        )}
        {annotation && (
          <h3 className="-mt-px -rotate-[4deg] text-right font-handwritten text-[22px] leading-[1.2] text-hm-blue lg:-ml-[35px] lg:text-[30px] lg:leading-[36px]">
            {annotation}
          </h3>
        )}
        <div
          className="-mt-[35px] overflow-hidden rounded-[3px] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_10px_0px_rgba(0,0,0,0.15)]"
          style={{ height: `${height ?? 700}px` }}
        >
          <iframe
            src={src}
            title="Plan een afspraak"
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
