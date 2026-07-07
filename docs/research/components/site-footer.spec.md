# SiteFooter — zwarte footer (Payload global)

## Overview
- **Bestanden:** `src/globals/Footer.ts` (velden UITBREIDEN) + `src/components/SiteFooter.tsx`
- **Screenshot:** `docs/design-references/humanmargin.eu/section-footer.png`
- **Exacte waarden:** `sections/footer-{desktop,mobile}-summary.txt` + `.json`
- **Interactiemodel:** statisch; link-hovers (kleur uit JSON)

## Structuur (desktop, bg #111010)
- 3 zones (rects in JSON):
  1. Links: "VOLG MIJ:" (stijl uit JSON) + social-icons LinkedIn en Instagram (SVG's — extraheer uit JSON `svg` velden of gebruik lucide equivalenten ALLEEN als het origineel generiek is; check de svg-data!) → hrefs uit JSON
  2. Midden: horizontale linkrij: AFFILIATE → /affiliate; PRIVACYVERKLARING → PDF; ALGEMENE VOORWAARDEN → PDF; AI BELEID → PDF; COOKIEBELEID (EU) → /cookiebeleid-eu (PDF-links: /wp-content/uploads/... op humanmargin.eu — komen als absolute URL's uit seed; render extern met target _blank)
  3. Rechts: "CONTACT" + "els@humanmargin.eu" (mailto)
- Onderste regel: copyright met oranje (#FF5C17) accent — verbatim tekst uit JSON ("COPYRIGHT © 2026 HUMAN MARGIN • BRANDING EN WEBDESIGN DOOR …" — lees exact!)

## Payload-velden (Footer global updaten)
- `followLabel` (text, default "Volg mij:")
- `socials` (array {platform: select linkedin|instagram|x|youtube, href})
- `menu` (array {label, href}) — vervangt/naast bestaande columns-veld: versimpel naar dit platte menu (bestaande `columns` verwijderen mag, nog niets geseed)
- `contactLabel` (text, default "Contact") + `contactEmail` (email)
- `copyright` (text) — met ondersteuning voor accent: render woorden tussen `*…*` in oranje? NEE — houd simpel: `copyright` (text) + `credit` (text, oranje deel) als twee velden

## Responsive
- Mobiel: zones stapelen (volgorde uit mobile JSON)

## Regels
- SVG's van social icons zo exact mogelijk (uit JSON svg-dump); in `src/components/icons.tsx` zetten en importeren
- (frontend)/layout.tsx NIET aanpassen — assemblage na merge
