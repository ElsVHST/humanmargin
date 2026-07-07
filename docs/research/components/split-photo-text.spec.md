# Block: splitPhotoText — Twee kolommen: foto + tekst

Dekt TWEE homepage-secties (én varianten op andere pagina's):
- Sectie A `6496af7`: bg **#DDDDD3** (bg-hm-gray), foto links ("RAW POWER" graffiti), tekst rechts
- Sectie B `42c385b`: bg **#F4F4F1** (bg-hm-offwhite), foto links (boek+markeerstift), tekst rechts — met kop er los boven in aparte kolomindeling (zie summary)

## Overview
- **Payload block:** `src/blocks/SplitPhotoText/config.ts` (slug `splitPhotoText`, interfaceName `SplitPhotoTextBlock`) + Component
- **Screenshots:** `section-2-split-a.png`, `section-5-split-b.png`
- **Exacte waarden:** `sections/6496af7-*.txt/json` en `sections/42c385b-*.txt/json`
- **Interactiemodel:** statisch; knop-hover via HmButton

## Gedeelde structuur
- Full-width sectie met instelbare bg-kleur; inner max-w 1140, 2 kolommen (foto ±45%, tekst ±55% — exact in JSON), gap volgens JSON
- Fotokolom: next/image, object-cover; afmetingen/aspect uit JSON
- Tekstkolom bevat (allemaal optioneel):
  - `annotation` — blauwe handgeschreven regel (#002CCF): font 'Handwritten' (Feisty) OF 'Marker' (Atomic Marker) — veld `annotationFont` select; bv. "Dan gaat de AI Act ook over jou." (30px Feisty)
  - `heading` — Archivo Black uppercase (40px desktop; sectie B: exacte maat in JSON)
  - `body` — richText (paragrafen Archivo 18px/27px #111010)
  - `cta` — HmButton (sectie A: geel "DOE DE AI REALITY CHECK" → /ai-reality-check; sectie B: geel "NEEM ACTIE" → /neem-actie; beide hover→blauw; grow-animatie: check class in JSON: `elementor-animation-grow` = ja → grow prop)

## Payload-velden
- `background` (select: gray "#DDDDD3" | offwhite "#F4F4F1" | white | black — label "Achtergrond")
- `imagePosition` (select links|rechts, default links)
- `image` (upload, required) + alt uit media
- `annotation` (text) + `annotationFont` (select handwritten|marker, default handwritten)
- `heading` (text)
- `body` (richText)
- `cta` (group ctaFields, optioneel — render alleen met label+href)

## Responsive
- Mobiel: kolommen stapelen (foto boven, tekst onder — verifieer volgorde in mobile summary!), paddings uit mobile JSON

## Regels
- Kolomverhoudingen exact uit JSON rects (bv. sectie A: foto rect w vs tekst rect w)
- Tekst NIET hardcoden — alles via velden, defaults per sectie komen uit de seed (niet uit dit block)
