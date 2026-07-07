"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Header } from "@/payload-types";

type NavItem = NonNullable<Header["navItems"]>[number];

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

function ChevronDown() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-[9px] w-[9px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7l6 6 6-6" />
    </svg>
  );
}

/**
 * Desktop hoofdmenu (humanmargin.eu, Elementor "menu" widget):
 * - Archivo 15px/18px 700 uppercase, wit; huidige pagina + hover = geel (#EDFF00)
 * - marge 25.5px links/rechts tussen items (eerste/laatste tegen de rand)
 * - Dropdowns (Leeszaal, Neem actie): blauw paneel (#002CCF, uit header-JSON), 156px breed,
 *   open op hover en focus-within (toetsenbord-toegankelijk), schaduw 0 0 10px rgba(0,0,0,.5)
 */
export function HeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const current = normalizePath(pathname ?? "/");

  return (
    <nav aria-label="Hoofdmenu">
      <ul className="flex items-center">
        {items.map((item, index) => {
          const children = item.children ?? [];
          const hasChildren = children.length > 0;
          const active = isActive(current, item.href);
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <li key={item.id ?? item.href} className="group relative flex items-center">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-[6px] whitespace-nowrap py-[13px] font-sans text-[15px] font-bold uppercase leading-[18px] transition-colors duration-[400ms] hover:text-hm-yellow",
                  "mx-[25.5px]",
                  isFirst && "ml-0",
                  isLast && "mr-0",
                  active ? "text-hm-yellow" : "text-hm-white",
                )}
              >
                {item.label}
                {hasChildren && <ChevronDown />}
              </Link>

              {hasChildren && (
                <ul
                  className={cn(
                    "invisible absolute left-[25.5px] top-full z-50 min-w-[156px] translate-y-1 bg-hm-blue opacity-0 shadow-[0_0_10px_0_rgba(0,0,0,0.5)] transition-all duration-200",
                    "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
                    "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                  )}
                >
                  {children.map((child) => (
                    <li key={child.id ?? child.href}>
                      <Link
                        href={child.href}
                        aria-current={isActive(current, child.href) ? "page" : undefined}
                        className="block whitespace-nowrap px-5 py-[10px] font-sans text-[15px] font-bold uppercase leading-[18px] text-hm-white transition-colors hover:text-hm-yellow"
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
  );
}
