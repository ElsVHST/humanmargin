# SiteHeader — sticky navigatie (Payload global)

## Overview
- **Bestanden:** `src/globals/Header.ts` (velden UITBREIDEN) + `src/components/SiteHeader.tsx` (+ client-subcomponenten voor dropdown/hamburger)
- **Screenshot:** `docs/design-references/humanmargin.eu/section-header.png`
- **Exacte waarden:** `sections/header-{desktop,mobile}-summary.txt` (345 regels desktop — bevat menu 2×: desktop + mobiel-clone; dedupliceer mentaal) + `.json`
- **Interactiemodel:** sticky top (alle devices, geen stijlverandering bij scroll), hover-dropdowns desktop, hamburger mobiel

## Structuur (desktop, bg #111010, hoogte 110px — verifieer in JSON)
- Logo links: `public/seo/human-margin-logo-inverted-rgb-900px-w-72ppi.png` (800×387) — render-afmetingen uit JSON rect
- Menu horizontaal: Home, Manifest, Leeszaal ▾, Neem actie ▾, Over mij, Contact — Archivo (maat/kleur/spacing uit JSON), hover-kleur uit JSON (check `_hoverRules`/JSON: nav-items hover → geel? verifieer), actieve pagina-stijl
- Dropdowns (Leeszaal: In de marge, In mensentaal, Op de leestafel; Neem actie: AICK- de Kit, AICK Sprint, AICK Aanbieder, TEAM op maat, Hoog risico op maat): wit paneel, verticale links (stijl uit JSON `sub-menu`), open op hover met kleine delay, angle-down SVG-icoon naast label
- Zoek-icoon (vergrootglas, wit): render als icoon-knop; functionaliteit = geen (decoratief; later Payload-search) — houd 'm klikbaar maar no-op/aria-disabled
- CTA: HmButton variant… LET OP: header-knop = geel? check JSON — eerder gemeten: bg #002CCF? De headerknop "AI REALITY CHECK" oogt GEEL in screenshot; JSON header-summary is leidend. size sm (px 20/py 10)

## Mobiel (390)
- Balk: logo + CTA + hamburger (volgorde/maten uit mobile JSON)
- Hamburger → uitklappend paneel met alle items + sub-items (Elementor dropdown-clone); stijl uit mobile JSON

## Payload-velden (Header global updaten — bestaand bestand uitbreiden)
- `logo` (upload) — blijft
- `navItems` (array): { label, href, children (array {label, href}) } — children toevoegen
- `cta` (group: label, href, variant) — blijft
- Sticky is design, geen veld

## Regels
- z-index hoog (overlay dropdowns over content), `position: sticky; top: 0`
- Dropdown-open-state: pure CSS (group-hover) mag, mits toetsenbord-toegankelijk (focus-within)
- Hamburger vergt 'use client' subcomponent
- (frontend)/layout.tsx NIET aanpassen — assemblage doe ik zelf na merge
