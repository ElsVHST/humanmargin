"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { HmButton } from "@/components/HmButton";
import { cn } from "@/lib/utils";
import type { Header } from "@/payload-types";

type NavItem = NonNullable<Header["navItems"]>[number];
type Cta = NonNullable<Header["cta"]>;

function normalizePath(path: string): string {
  if (!path) return "/";
  const clean = path.split(/[?#]/)[0];
  return clean.length > 1 ? clean.replace(/\/+$/, "") : "/";
}

function isActive(current: string, href: string): boolean {
  const target = normalizePath(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

/**
 * Mobiele header-cluster: gele CTA + hamburger. Uitklapmenu = blauw paneel
 * (#002CCF, uit header-JSON) dat over de volle breedte onder de balk valt.
 * Items: Archivo 700 uppercase geel; huidige pagina = zwarte achtergrond.
 */
export function SiteHeaderMobile({ items, cta }: { items: NavItem[]; cta: Cta | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = normalizePath(pathname ?? "/");

  // Sluit het menu wanneer de route verandert (ook bij back/forward) — reset
  // tijdens render i.p.v. in een effect (React-aanbevolen patroon).
  const [trackedPath, setTrackedPath] = useState(pathname);
  if (pathname !== trackedPath) {
    setTrackedPath(pathname);
    setOpen(false);
  }

  // Sluit met Escape wanneer het menu open is.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const ctaVariant = cta?.variant ?? "blue";

  return (
    <div className="flex flex-1 items-center justify-end gap-[10px] lg:hidden">
      {cta?.label && cta?.href && (
        <HmButton
          label={cta.label}
          href={cta.href}
          variant={ctaVariant}
          size="sm"
          className="text-[12px] leading-[12px] shadow-[0_0_3px_0_rgba(0,0,0,0.43)]"
        />
      )}

      <button
        type="button"
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-[33px] w-[33px] items-center justify-center rounded-[3px] text-hm-yellow transition-transform hover:scale-110"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <nav
        id="mobile-menu"
        aria-label="Mobiel menu"
        className={cn(
          "absolute inset-x-0 top-full z-40 bg-hm-blue shadow-[0_0_10px_0_rgba(0,0,0,0.5)]",
          open ? "block" : "hidden",
        )}
      >
        <ul className="flex flex-col">
          {items.map((item) => {
            const children = item.children ?? [];
            const active = isActive(current, item.href);
            return (
              <li key={item.id ?? item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-5 py-[10px] font-sans text-[15px] font-bold uppercase leading-[18px] text-hm-yellow transition-colors",
                    active ? "bg-hm-black" : "hover:bg-hm-black",
                  )}
                >
                  {item.label}
                </Link>
                {children.length > 0 && (
                  <ul className="flex flex-col border-t border-white/10">
                    {children.map((child) => (
                      <li key={child.id ?? child.href}>
                        <Link
                          href={child.href}
                          aria-current={isActive(current, child.href) ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className="block py-[10px] pl-10 pr-5 font-sans text-[13px] font-bold uppercase leading-[18px] text-hm-yellow transition-colors hover:bg-hm-black"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
