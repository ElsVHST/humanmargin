import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { asMedia, mediaUrl } from "@/lib/media";
import type { PostCardsBlock } from "@/payload-types";

const backgrounds: Record<string, string> = {
  white: "bg-hm-white",
  offwhite: "bg-hm-offwhite",
  gray: "bg-hm-gray",
};

/**
 * Compacte donkere artikel-kaarten (Elementor posts.cards-stijl):
 * thumbnail boven, geel categorielabel, witte titel, korte tekst, gele lees-verder.
 */
export function PostCardsComponent(props: PostCardsBlock) {
  const { background, cards } = props;
  if (!cards?.length) return null;

  return (
    <section className={cn("w-full", backgrounds[background ?? "white"])}>
      <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 gap-[30px] px-5 py-12 md:grid-cols-2 lg:grid-cols-3 lg:px-0">
        {cards.map((card, index) => {
          const media = asMedia(card.image);
          const url = mediaUrl(card.image);
          return (
            <article key={card.id ?? index} className="flex max-w-[360px] flex-col bg-hm-black">
              {url && (
                <Link href={card.href} className="relative block h-[172px] overflow-hidden">
                  <Image
                    src={url}
                    alt={media?.alt ?? ""}
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                  {card.label && (
                    <span className="absolute right-0 top-4 bg-hm-yellow px-2 py-1 font-sans text-[11px] font-bold uppercase text-hm-black">
                      {card.label}
                    </span>
                  )}
                </Link>
              )}
              <div className="flex flex-col gap-3 p-6">
                <h3 className="font-heading text-[18px] uppercase leading-[1.25] text-hm-white">
                  <Link href={card.href}>{card.title}</Link>
                </h3>
                {card.excerpt && (
                  <p className="text-[13px] leading-[1.55] text-hm-white/90">{card.excerpt}</p>
                )}
                <Link
                  href={card.href}
                  className="mt-1 font-sans text-[12px] font-bold uppercase text-hm-yellow"
                >
                  {card.readMore ?? "Lees verder »"}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
