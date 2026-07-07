import Image from "next/image";
import Link from "next/link";

import { asMedia, mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { LinkButtonsBlock } from "@/payload-types";

// Origineel (/linkjes, 1440px): gecentreerde kolom breedte 561.6px, verticale
// padding 96.77px, gap 20px. Knoppen: Archivo 15px/15px 700 uppercase, padding
// 12px/24px, full-width, box-shadow 0 0 3px rgba(0,0,0,0.43).
// blauw:  bg #002CCF, witte tekst. geel: bg #EDFF00, blauwe tekst.
const variants: Record<string, string> = {
  blue: "bg-hm-blue text-hm-white hover:bg-hm-yellow hover:text-hm-blue",
  yellow: "bg-hm-yellow text-hm-blue hover:bg-hm-blue hover:text-hm-white",
};

export function LinkButtonsComponent(props: LinkButtonsBlock) {
  const { logo, links } = props;
  const logoMedia = asMedia(logo);
  const logoUrl = mediaUrl(logo);

  return (
    <section className="w-full bg-hm-black px-5">
      <div className="mx-auto flex w-full max-w-[561.6px] flex-col gap-5 py-16 lg:py-[96.77px]">
        {logoMedia && logoUrl && (
          <Image
            src={logoUrl}
            alt={logoMedia.alt ?? ""}
            width={logoMedia.width ?? 800}
            height={logoMedia.height ?? 388}
            className="mx-auto h-auto w-[275px] max-w-full"
          />
        )}
        {links?.map((link, index) => {
          const classes = cn(
            "block w-full px-6 py-3 text-center font-sans text-[15px] font-bold uppercase leading-[15px] shadow-[0_0_3px_0_rgba(0,0,0,0.43)] transition-colors duration-300",
            variants[link.variant ?? "blue"],
          );
          const isInternal = link.href.startsWith("/") || link.href.startsWith("#");
          return isInternal ? (
            <Link key={link.id ?? index} href={link.href} className={classes}>
              {link.label}
            </Link>
          ) : (
            <a key={link.id ?? index} href={link.href} className={classes} rel="noopener">
              {link.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
