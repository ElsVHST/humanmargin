import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Human Margin CTA-knop — exact naar humanmargin.eu (Elementor kit 10 + post-84):
 * - Archivo 15px/15px 700 uppercase, radius 0, transition 0.3s
 * - blue:   bg #002CCF, tekst #EDFF00 → hover: bg #EDFF00, tekst #111010
 * - yellow: bg #EDFF00, tekst #002CCF → hover: bg #002CCF, tekst #EDFF00
 * - grow: hover scale(1.1) (Elementor "elementor-animation-grow")
 */
export type HmButtonProps = {
  label: string;
  href: string;
  variant?: "blue" | "yellow" | null;
  size?: "sm" | "md" | null;
  grow?: boolean | null;
  className?: string;
};

export function HmButton({ label, href, variant = "blue", size = "md", grow = false, className }: HmButtonProps) {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const classes = cn(
    "inline-block rounded-none text-center font-sans text-[15px] font-bold uppercase leading-[15px] transition-all duration-300",
    variant === "yellow"
      ? "bg-hm-yellow text-hm-blue hover:bg-hm-blue hover:text-hm-yellow"
      : "bg-hm-blue text-hm-yellow hover:bg-hm-yellow hover:text-hm-black",
    size === "sm" ? "px-[20px] py-[10px]" : "px-[50px] py-[20px]",
    grow && "hover:scale-110",
    className,
  );
  if (isInternal) {
    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} target={href.endsWith(".pdf") ? "_blank" : undefined} rel="noopener">
      {label}
    </a>
  );
}

/** Gedeelde Payload-veldenset voor CTA-knoppen in blocks. */
export const ctaFields = [
  { name: "label", label: "Knoptekst", type: "text" as const },
  { name: "href", label: "Link", type: "text" as const },
  {
    name: "variant",
    label: "Kleur",
    type: "select" as const,
    defaultValue: "blue",
    options: [
      { label: "Blauw", value: "blue" },
      { label: "Geel", value: "yellow" },
    ],
  },
];
