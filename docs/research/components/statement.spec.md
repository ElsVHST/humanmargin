# Block: statement — Zwarte statement-balk

## Overview
- **Payload block:** `src/blocks/Statement/config.ts` (slug `statement`, interfaceName `StatementBlock`) + `src/blocks/Statement/Component.tsx`
- **Screenshot:** `docs/design-references/humanmargin.eu/section-1-statement.png`
- **Exacte waarden:** `docs/research/humanmargin.eu/sections/b1b2985-{desktop,mobile}-summary.txt`
- **Interactiemodel:** statisch

## Structuur (desktop)
- Sectie: full-width `bg #111010` (bg-hm-black)
- Inner: max-w 1140px, py 72px, gap 20px, alles gecentreerd
- h2: "AI hoef je niet te vrezen,\nniet blind te vertrouwen." — wit #FFFFFF, Archivo Black 40px/48px, uppercase, center (br na komma — behoud regelbreuk)
- h3: "Wel te begrijpen." — geel #EDFF00, Archivo 26px/31.2px, weight 500, uppercase, center, marginTop ~20px (gap)

## Payload-velden
- `heading` (textarea, label "Witte regels" — render regelbreuken als <br>)
- `accent` (text, label "Gele slotregel")
- Defaults = huidige teksten

## Responsive
- Mobiel: font-sizes uit kit: h2 → 27px (mobiel), h3 → 20px; lees b1b2985-mobile-summary.txt voor exacte waarden

## Regels
- Whitespace-pre-line of split op \n voor de heading-regelbreuken
