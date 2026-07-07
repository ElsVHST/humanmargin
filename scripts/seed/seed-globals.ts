/**
 * Seed de Header- en Footer-globals met de exacte navigatie/inhoud van humanmargin.eu.
 * Draaien: npx payload run scripts/seed/seed-globals.ts
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

const ROOT = process.cwd();
const mediaMap: Record<string, number> = JSON.parse(
  readFileSync(path.join(ROOT, "docs/research/humanmargin.eu/media-map.json"), "utf8"),
);

const payload = await getPayload({ config });

const logoId =
  mediaMap["https://humanmargin.eu/wp-content/uploads/2026/06/human-margin-logo-inverted-rgb-900px-w-72ppi.png"];

await payload.updateGlobal({
  slug: "header",
  data: {
    logo: logoId,
    navItems: [
      { label: "Home", href: "/" },
      { label: "Manifest", href: "/manifest" },
      {
        label: "Leeszaal",
        href: "/leeszaal",
        children: [
          { label: "In de marge", href: "/in-de-marge" },
          { label: "In mensentaal", href: "/in-mensentaal" },
          { label: "Op de leestafel", href: "/op-de-leestafel" },
        ],
      },
      {
        label: "Neem actie",
        href: "/neem-actie",
        children: [
          { label: "AICK- de Kit", href: "/aick-de-kit" },
          { label: "AICK Sprint", href: "/aick-sprint" },
          { label: "AICK Aanbieder", href: "/aick-aanbieder" },
          { label: "TEAM op maat", href: "/team-op-maat" },
          { label: "Hoog risico op maat", href: "/hoog-risico-op-maat" },
        ],
      },
      { label: "Over mij", href: "/over-mij" },
      { label: "Contact", href: "/contact" },
    ],
    cta: { label: "AI reality check", href: "/ai-reality-check", variant: "blue" },
  },
});
console.log("header-global geseed");

await payload.updateGlobal({
  slug: "footer",
  data: {
    followLabel: "Volg mij:",
    socials: [
      { platform: "linkedin", href: "https://www.linkedin.com/in/els-verheirstraeten/" },
      { platform: "instagram", href: "https://www.instagram.com/humanmargin.eu/" },
    ],
    menu: [
      { label: "Affiliate", href: "/affiliate" },
      // PDF's staan in de Payload media-collectie (geseed via seed-media) en
      // worden lokaal geserveerd — geen verwijzingen naar de oude WordPress-site
      {
        label: "Privacyverklaring",
        href: "/media/2026_06_PRIVACYVERKLARING-06.2026.pdf",
      },
      {
        label: "Algemene Voorwaarden",
        href: "/media/2026_06_ALGEMENE-VOROWAARDEN-05.2026.pdf",
      },
      {
        label: "AI Beleid",
        href: "/media/2026_06_AI-Gebruiksverklaring.pdf",
      },
      { label: "Cookiebeleid (EU)", href: "/cookiebeleid-eu" },
    ],
    contactLabel: "Contact",
    contactEmail: "els@humanmargin.eu",
    copyright: "Copyright © 2026 Human Margin | Branding en Webdesign door",
    credit: "Brand it Up",
  },
});
console.log("footer-global geseed");
process.exit(0);
