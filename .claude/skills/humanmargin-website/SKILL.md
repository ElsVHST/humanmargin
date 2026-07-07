---
name: humanmargin-website
description: Use when working on the Human Margin frontend — building or styling page sections/blocks, adding pages, fixing responsive issues at 390/1440px, running visual QA or pixel-diffs against humanmargin.eu, or looking up exact brand values (colors, fonts, buttons).
---

# Human Margin — Website (frontend)

## Overview

De site is een pixelgetrouwe herbouw van humanmargin.eu. **Alle paginacontent rendert uit Payload-blocks** — nooit hardcoden in JSX-routes. Elke sectie = blockconfig (`src/blocks/<Naam>/config.ts`) + component (`Component.tsx`) + registratie in `src/blocks/index.ts`. Voor CMS-/schemawerk: zie skill `humanmargin-payload-cms`.

## Merkwaarden (exact, uit Elementor kit post-10.css)

| Token | Waarde | Tailwind |
|---|---|---|
| Zwart | #111010 | `bg-hm-black` |
| Blauw | #002CCF | `bg-hm-blue` |
| Geel | #EDFF00 | `bg-hm-yellow` |
| Grijs | #DDDDD3 | `bg-hm-gray` |
| Gebroken wit | #F4F4F1 | `bg-hm-offwhite` |
| Oranje (accent/credit) | #FF5C17 | `text-hm-orange` |

Fonts: `font-heading` = Archivo Black (koppen, altijd uppercase, 40/48 desktop → 27px mobiel), `font-sans` = Archivo (body 18/27 via `.hm-prose`), `font-marker` = Atomic Marker, `font-handwritten` = Feisty (blauwe annotaties, -4° rotatie), `font-lily` = Lily Script One (aanhalingsteken recensies). Radius overal 0.

## Vaste conventies

- **Knoppen:** altijd `HmButton` (`src/components/HmButton.tsx`): blauw↔geel kleuren-swap op hover, 15px/700 uppercase; sectie-CTA's -2° gedraaid met `shadow-[0px_0px_4px_0px_rgba(0,0,0,0.45)]`.
- **Responsive:** default classes = mobiel (390-data), `lg:` = desktop (1440-data). Exacte px via arbitrary values. Hero's schalen mobiel via CSS-vars (`mobileMinHeight`-velden), niet via percentages.
- **Lopende tekst:** `RichText`-component + `.hm-prose` (alinea-marge 14,4px).
- **Media in components:** upload-velden zijn `number | Media` — gebruik `mediaUrl()`/`asMedia()` uit `src/lib/media.ts`.

## Blocks-index (welk block waarvoor)

`heroPhoto` (foto-hero, tekst zit ín de foto) · `statement` (zwarte centreerbalk) · `splitPhotoText` (2-koloms foto+tekst; varianten: inset/full, annotaties, subheading, arrowList, nieuwsbriefvorm) · `longformDark` (donkere longform met annotaties/framed image/pijl-lijst) · `textColumns` (kop+kolommen; align/compact) · `textCta` · `testimonials` (embla-carousel, 2/view desktop) · `cardColumns` (3 kaarten) · `postCards` (compacte artikel-kaarten) · `brushNote` (penseelstreek + quote/nieuwsbrief) · `linkButtons` (linktree) · `iconList` (vinkjes) · `faq` (accordeon, 1 open) · `calendlyEmbed` · `iframeEmbed` (Tally) · `pageTitle` (thema-stubs) · `ebookOptin` (weggever) · `content` (kaal richText). Details: lees de config van het block.

## QA-workflow (pixel-vergelijking met origineel)

```bash
node scripts/capture-pages.mjs --base http://localhost:3000 --out qa/current --only <slug>
node scripts/qa-diff.mjs --only <slug> [--viewport mobile-390]   # composiet in qa/diff/
ONLY=<slug> VIEWPORT_W=390 node scripts/extract-all-pages.mjs    # verse computed styles origineel
```

Bronwaarheid origineel: `docs/research/humanmargin.eu/` (sections-summaries, pages/, pages-mobile/) + screenshots in `docs/design-references/humanmargin.eu/`. Diff-scores op lange pagina's hebben een font-wrapping-vloer (~30-50%) — structuur vergelijken via de composiet, niet blind op het percentage.

## Bekende geaccepteerde afwijkingen

Single-post-chrome (TOC/deelknoppen/sidebar) niet gecloond; salespage blauwe secties; weggever-placeholders; Complianz-cookiebanner bewust weggelaten.
