import { cn } from "@/lib/utils";
import type { IconListBlock } from "@/payload-types";

const backgrounds: Record<string, string> = {
  gray: "bg-hm-gray",
  offwhite: "bg-hm-offwhite",
  white: "bg-hm-white",
  black: "bg-hm-black",
};

// FontAwesome "fa-check" (solid), exact uit de dump: e-fas-check, viewBox 0 0 512 512.
// Origineel: span 26x26, kleur rgb(237,255,0) = hm-yellow.
function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 512 512"
      className="h-[26px] w-[26px] shrink-0 text-hm-yellow"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
    </svg>
  );
}

export function IconListComponent(props: IconListBlock) {
  const { background, heading, items } = props;

  // Origineel (sectie /aick-sprint "Wat je krijgt"): kop links op x=144,
  // inhoud 584px breed, verticaal gecentreerd in een 630px-hoge sectie
  // (py ~101px, gap 20px). Kop Archivo Black 40/48 uppercase; icon-box: rij
  // met vink (26x26) + tekst, gap 46px; regel h3 15/18 bold uppercase (mt 8px);
  // sublijn p 18/27.
  return (
    <section className={cn("w-full", backgrounds[background ?? "gray"])}>
      <div
        className={cn(
          "flex flex-col justify-center gap-5 px-[27px] py-[27px] lg:min-h-[630px] lg:py-[101px] lg:pl-[144px] lg:pr-[100px]",
          background === "black" ? "text-hm-white" : "text-hm-black",
        )}
      >
        {heading && (
          <h2 className="font-heading text-[27px] uppercase leading-[29.7px] lg:max-w-[584px] lg:text-[40px] lg:leading-[48px]">
            {heading}
          </h2>
        )}
        {items && items.length > 0 && (
          <div className="flex flex-col gap-5 lg:max-w-[584px]">
            {items.map((item, index) => (
              <div key={item.id ?? index} className="flex flex-row items-center gap-4 lg:gap-[46px]">
                <CheckIcon />
                <div>
                  <h3 className="mt-2 text-[15px] font-bold uppercase leading-[18px]">{item.text}</h3>
                  {item.description && (
                    <p className="text-[18px] leading-[27px]">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
