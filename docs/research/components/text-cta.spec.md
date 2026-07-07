# Block: textCta — Tekst + knop ("En wie ben ik überhaupt…")

## Overview
- **Payload block:** `src/blocks/TextCta/config.ts` (slug `textCta`, interfaceName `TextCtaBlock`) + Component
- **Screenshot:** `docs/design-references/humanmargin.eu/section-7-about.png`
- **Exacte waarden:** `sections/31c180cc-{desktop,mobile}-summary.txt` + `.json`
- **Interactiemodel:** statisch; HmButton hover

## Structuur (desktop, bg wit)
- Inner max-w 1140; kop "En wie ben ik überhaupt om dit te zeggen?" — Archivo Black 40/48 uppercase #111010 (uitlijning/kolom uit JSON)
- Body-paragrafen Archivo 18/27
- CTA: HmButton **blue** "MEER OVER MIJ" → /over-mij (exacte padding/rect in JSON; grow indien class aanwezig)

## Payload-velden
- `background` (select white|offwhite|gray|black, default white)
- `heading` (text)
- `body` (richText)
- `cta` (group ctaFields)

## Responsive
- Mobiel: stapelen, maten uit mobile summary

## Regels
- Generiek: wordt hergebruikt op andere pagina's als kop+tekst+knop-sectie
