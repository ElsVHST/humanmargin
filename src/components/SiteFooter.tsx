import Link from "next/link";

import { SocialIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Footer } from "@/payload-types";

/**
 * SiteFooter — zwarte footer, exact naar humanmargin.eu (Elementor).
 *
 * Zones (desktop, bg #111010, gele bovenrand 2px):
 *   1. Links   — "VOLG MIJ:" + social-iconen (LinkedIn, Instagram)
 *   2. Midden  — horizontale menu-rij, geflankeerd door korte gele verticale delers
 *   3. Rechts  — "CONTACT" + mailto-adres
 *   + Onderregel — copyright met credit in hm-orange, gescheiden door grijze deler
 *
 * Kleuren/maten uit de computed-style dump:
 *   - koppen (Volg mij / Contact): Archivo 15px/700 uppercase, #f4f4f1 (hm-offwhite)
 *   - menu-links: Archivo 15px uppercase, #f4f4f1
 *   - e-mail: Poppins 14px, #ddddd3 (hm-gray)
 *   - copyright: Poppins 10px/500 uppercase, letter-spacing 0.6px, #ddddd3
 *   - bovenrand 2px #edff00 (hm-yellow), verticale delers 1px hm-yellow,
 *     horizontale deler 1px #ddddd3 (hm-gray)
 */

type SiteFooterProps = {
  footer: Footer;
};

/** Externe link (of PDF) → nieuwe tab; interne route → Next Link. */
function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//") || href.toLowerCase().endsWith(".pdf");
}

function FooterLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

const HEADING_CLASS = "font-sans text-[15px] font-bold uppercase leading-[18px] text-hm-offwhite";

/** Hamburger-icoon voor het samengevouwen footer-menu op mobiel. */
function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function SiteFooter({ footer }: SiteFooterProps) {
  const { followLabel, socials, menu, contactLabel, contactEmail, copyright, credit } = footer;

  const menuLinks = (menu ?? []).map((item, index) => (
    <li key={item.id ?? index}>
      <FooterLink
        href={item.href}
        className="whitespace-nowrap font-sans text-[15px] font-medium uppercase leading-[27px] text-hm-offwhite transition-colors hover:text-hm-yellow"
      >
        {item.label}
      </FooterLink>
    </li>
  ));

  return (
    <footer className="w-full border-t-2 border-hm-yellow bg-hm-black">
      <div className="mx-auto w-full pt-[25px] md:w-[94%] md:max-w-[1354px]">
        {/* Zone-rij: Volg mij / Menu / Contact */}
        <div className="flex flex-wrap md:border-b md:border-hm-gray">
          {/* 1. Volg mij + social-iconen */}
          <div className="flex w-[53%] flex-col items-center justify-center gap-5 p-[10px] py-[26px] md:w-[270px] md:min-h-[131px] md:py-[10px]">
            <h3 className={HEADING_CLASS}>{followLabel ?? "Volg mij:"}</h3>
            {socials && socials.length > 0 ? (
              <ul className="flex items-center justify-center gap-x-[14px]">
                {socials.map((social, index) => (
                  <li key={social.id ?? index} className="inline-flex">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="text-hm-offwhite transition-colors hover:text-hm-yellow"
                    >
                      <SocialIcon platform={social.platform} className="h-[17px] w-[17px]" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* 2. Menu — mobiel samengevouwen tot hamburger (zoals humanmargin.eu),
              op desktop een horizontale rij tussen korte gele verticale delers. */}
          <div className="flex w-[47%] items-center justify-center border-l border-hm-yellow py-[10px] md:w-auto md:flex-1 md:border-l-0">
            {/* Mobiel: hamburger-toggle */}
            <details className="group relative md:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-center text-hm-yellow [&::-webkit-details-marker]:hidden">
                <MenuIcon />
              </summary>
              <ul className="absolute right-0 z-10 mt-2 flex w-max flex-col items-end gap-2 bg-hm-black p-4 shadow-[0_0_10px_0_rgba(0,0,0,0.5)]">
                {menuLinks}
              </ul>
            </details>
            {/* Desktop: horizontale lijst */}
            <nav className="hidden w-full md:block md:border-x md:border-hm-yellow md:px-[30px] md:py-[12px]">
              <ul className="flex flex-wrap items-center justify-center gap-x-[14px] gap-y-2">{menuLinks}</ul>
            </nav>
          </div>

          {/* 3. Contact */}
          <div className="flex w-full flex-col items-center justify-center gap-[10px] p-[10px] py-[26px] md:w-[270px] md:min-h-[131px] md:py-[10px]">
            <h3 className={HEADING_CLASS}>{contactLabel ?? "Contact"}</h3>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="font-poppins text-[14px] leading-[21px] text-hm-gray transition-colors hover:text-hm-white"
              >
                {contactEmail}
              </a>
            ) : null}
          </div>
        </div>

        {/* Onderregel: copyright + credit */}
        {(copyright || credit) && (
          <div className="px-[20px]">
            <div className="mx-auto max-w-[1140px] py-[20px]">
              <p
                className={cn(
                  "text-center font-poppins text-[10px] font-medium uppercase leading-[15px] tracking-[0.6px] text-hm-gray",
                )}
              >
                {copyright}
                {credit ? <>{copyright ? " " : ""}<span className="text-hm-orange">{credit}</span></> : null}
              </p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
