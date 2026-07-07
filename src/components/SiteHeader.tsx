import Image from "next/image";
import Link from "next/link";

import { HeaderNav } from "@/components/HeaderNav";
import { HmButton } from "@/components/HmButton";
import { SiteHeaderMobile } from "@/components/SiteHeaderMobile";
import { mediaAlt, mediaUrl } from "@/lib/media";
import type { Header } from "@/payload-types";

const LOGO_FALLBACK = "/seo/human-margin-logo-inverted-rgb-900px-w-72ppi.png";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[20px] w-[20px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

/**
 * SiteHeader — sticky navigatie van humanmargin.eu (Payload "header" global).
 * Zwarte balk (#111010) met gele onderrand (2px), logo links, horizontaal menu
 * met blauwe hover/focus-dropdowns, decoratief zoek-icoon en blauwe CTA-knop.
 * Hoogte 110px desktop / ~89px mobiel; sticky top-0 op alle devices (geen shrink).
 */
export function SiteHeader({ header }: { header: Header }) {
  const logoUrl = mediaUrl(header.logo) ?? LOGO_FALLBACK;
  const logoAlt = mediaAlt(header.logo) || "Human Margin";
  const navItems = header.navItems ?? [];
  const cta = header.cta ?? null;
  const ctaVariant = cta?.variant ?? "blue";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-hm-yellow bg-hm-black">
      <div className="flex min-h-[89px] items-stretch gap-[10px] p-[10px] lg:min-h-[110px]">
        {/* Logo — origineel: 197px-cel met het logo rechts uitgelijnd (x109-217). */}
        <div className="flex flex-col justify-center p-[10px]">
          <Link href="/" className="flex justify-end lg:w-[197px]">
            <Image
              src={logoUrl}
              alt={logoAlt}
              width={800}
              height={387}
              priority
              className="h-[47px] w-auto lg:h-[53px]"
            />
          </Link>
        </div>

        {/* Desktop: menu + zoeken + CTA. Gaps exact naar het origineel:
            nav→zoeken 20px, zoeken→CTA 67px (gap-5 + ml-[47px]). */}
        <div className="hidden flex-1 items-center justify-end gap-5 lg:flex lg:pr-[56.8px]">
          <HeaderNav items={navItems} />

          <button
            type="button"
            aria-label="Zoeken"
            className="flex h-[33px] w-[33px] items-center justify-center rounded-[3px] text-hm-white transition-opacity hover:opacity-70"
          >
            <SearchIcon />
          </button>

          {cta?.label && cta?.href && (
            <HmButton
              label={cta.label}
              href={cta.href}
              variant={ctaVariant}
              size="sm"
              className="ml-[47px] shadow-[0_0_3px_0_rgba(0,0,0,0.43)]"
            />
          )}
        </div>

        {/* Mobiel: CTA + hamburger + uitklapmenu */}
        <SiteHeaderMobile items={navItems} cta={cta} />
      </div>
    </header>
  );
}
