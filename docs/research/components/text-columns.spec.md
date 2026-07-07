# Block: textColumns — "De Human Margin Methode"

## Overview
- **Payload block:** `src/blocks/TextColumns/config.ts` (slug `textColumns`, interfaceName `TextColumnsBlock`) + Component
- **Screenshot:** `docs/design-references/humanmargin.eu/section-4-methode.png`
- **Exacte waarden:** `sections/de97d97-{desktop,mobile}-summary.txt` + `.json`
- **Interactiemodel:** statisch

## Structuur (desktop, bg #F4F4F1)
- Inner max-w 1140; kop links: "De Human Margin Methode" — Archivo Black 40/48 uppercase #111010 (exacte kolombreedte in JSON)
- Tekstblokken (Archivo 18/27 #111010) in kolomindeling — lees JSON voor de exacte kolomstructuur (1 kop-kolom + tekstkolom(men), breedtes uit rects)

## Payload-velden
- `background` (select gray|offwhite|white|black, default offwhite)
- `heading` (text)
- `columns` (array van {body: richText}, label "Tekstkolommen")

## Responsive
- Mobiel: stapelen; maten uit mobile summary

## Regels
- Generiek houden: dit block wordt op meer pagina's hergebruikt voor kop+tekst-secties
