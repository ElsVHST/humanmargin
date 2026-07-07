import { RichText } from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { TextColumnsBlock } from "@/payload-types";

const backgrounds: Record<string, string> = {
  gray: "bg-hm-gray",
  offwhite: "bg-hm-offwhite",
  white: "bg-hm-white",
  black: "bg-hm-black",
};

export function TextColumnsComponent(props: TextColumnsBlock) {
  const { background, heading, align, columns, compact } = props;
  const count = columns?.length ?? 0;
  const centered = align === "center";

  // Origineel (sectie de97d97): kop links op x=144, kolominhoud 584px breed,
  // verticaal gecentreerd in een 630px-hoge sectie (py ~101px, gap 20px).
  // Kop Archivo Black 40/48 uppercase; lopende tekst via .hm-prose (18/27 desktop).
  // compact = korte vervolgtekst binnen de vorige sectie: geen minimumhoogte,
  // kleinere verticale padding (anders rekt min-h-[630px] elk deelblok op).
  return (
    <section className={cn("w-full", backgrounds[background ?? "offwhite"])}>
      <div
        className={cn(
          "flex flex-col justify-center gap-5 px-[27px] py-[27px]",
          centered
            ? "mx-auto w-full max-w-[795px] items-center text-center lg:py-[72px]"
            : compact
              ? "lg:py-[16px] lg:pl-[144px] lg:pr-[100px]"
              : "lg:min-h-[630px] lg:py-[101px] lg:pl-[144px] lg:pr-[100px]",
          background === "black" ? "text-hm-white" : "text-hm-black",
        )}
      >
        {heading && (
          <h2
            className={cn(
              "font-heading text-[27px] uppercase leading-[29.7px] lg:text-[40px] lg:leading-[48px]",
              !centered && "lg:max-w-[584px]",
            )}
          >
            {heading}
          </h2>
        )}
        {count > 0 && (
          <div
            className={cn(
              "grid grid-cols-1 gap-x-[60px] gap-y-8",
              count === 2 && "lg:grid-cols-2",
              count >= 3 && "lg:grid-cols-3",
            )}
          >
            {columns?.map((column, index) =>
              column.body ? (
                <RichText key={column.id ?? index} data={column.body} className="hm-prose lg:max-w-[584px]" />
              ) : null,
            )}
          </div>
        )}
      </div>
    </section>
  );
}
