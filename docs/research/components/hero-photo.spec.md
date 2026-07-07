# Block: heroPhoto — Hero met foto-achtergrond

## Overview
- **Payload block:** `src/blocks/HeroPhoto/config.ts` (slug `heroPhoto`, interfaceName `HeroPhotoBlock`) + `src/blocks/HeroPhoto/Component.tsx`
- **Screenshot:** `docs/design-references/humanmargin.eu/section-0-hero.png` (desktop crop), mobiel in `home-mobile-390-full.png` bovenaan
- **Exacte waarden:** `docs/research/humanmargin.eu/sections/e50ad53-{desktop,mobile}-summary.txt` (+ `.json`)
- **Interactiemodel:** statisch; knop-hover swap (HmButton regelt dat)

## Structuur (desktop 1440)
- Sectie: full-width, `min-height: 810px`, `background-image` (upload-veld) `cover`, `background-position: 50% 0%`, flex column
- LET OP: de headline-tekst ("AI COMPLIANCE VOOR WIE ZELF WIL/KAN NADENKEN") zit IN de foto gebakken — geen tekst-elementen bouwen
- Inner: `max-width 1140px`, gecentreerd, `padding-top: 300px`, `gap 20px`, justify-content center
- Knop: gecentreerd (mx-auto), HmButton variant **blue**, label "doe de AI reality check", href `/ai-reality-check`, padding 20px verticaal → size met py-[20px] px-[50px], rect [569,638,302,55] (dus px-[50px])
- Hover knop: bg → #EDFF00, tekst → #111010 (HmButton blue-variant default)

## Payload-velden
- `image` (upload → media, required, label "Achtergrondfoto")
- `minHeight` (number, default 810, label "Minimale hoogte (px)")
- `contentPaddingTop` (number, default 300, admin.description "Ruimte boven de knop")
- `cta` (group: ctaFields uit HmButton + defaults label "doe de AI reality check", href "/ai-reality-check", variant "blue")

## Responsive (mobiel 390 — zie e50ad53-mobile-summary.txt)
- Zelfde opbouw; hoogte/padding volgens mobile JSON (lees exacte waarden!)
- bg-position blijft 50% 0%

## Regels
- Component: server component; bg via inline `style={{ backgroundImage }}` met `mediaUrl()` helper
- Geen next/image nodig (CSS background), wel `priority` overwegen → n.v.t.
- Gebruik HmButton; GEEN eigen knop-styling
