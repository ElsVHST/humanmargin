# Block: longformDark — Donkere longform-sectie met annotaties

## Overview
- **Payload block:** `src/blocks/LongformDark/config.ts` (slug `longformDark`, interfaceName `LongformDarkBlock`) + Component
- **Screenshot:** `docs/design-references/humanmargin.eu/section-3-longform.png` (1985px hoog!)
- **Exacte waarden:** `sections/29c25367-{desktop,mobile}-summary.txt` (183 regels — LEES VOLLEDIG) + `.json`
- **Interactiemodel:** statisch

## Structuur (desktop, bg #111010, alle tekst wit tenzij anders)
Lees de summary voor de exacte volgorde; hoofdonderdelen:
1. h2 kop: "Voor zij die lezen, maar niet zomaar aannemen" — Archivo Black 40/48 uppercase wit
2. Subkop met GELE HIGHLIGHT: "VOOR ZIJ DIE WILLEN VERSTAAN. OMDAT ZE BEGRIJPEN DAT VRIJHEID EN AUTONOMIE SAMENGAAN MET BEGRIP." — gele achtergrond (#EDFF00) achter de tekst, zwarte tekst, Archivo 26px 500 uppercase (render als inline highlight: `<span class="bg-hm-yellow text-hm-black px-1 box-decoration-clone">`)
3. Body: reeks paragrafen (Archivo 18/27) — met her en der **blauwe marge-annotaties** in Marker/Handwritten font (bv. "Anti-zombie", "En verzet") — positioned naast/tussen de tekst; exacte posities in JSON (absolute/relative offsets)
4. Ingekaderde afbeelding: woordenboek-definitie "AI COMPLIANCE [eɪ aɪ kəmˈplaɪəns]" — een IMG (zie JSON img src) met witte/vlakke rand op donkere bg, gecentreerd
5. Vervolg-paragrafen
6. Pijl-lijst: 4 items met "⟶"-pijl (check JSON: svg of tekstkarakter) + tekst per regel
7. CTA: HmButton blue "DOE DE AI REALITY CHECK" → /ai-reality-check (size/pad uit JSON; hover geel+zwart)

## Payload-velden
- `heading` (text)
- `highlight` (textarea, label "Geel gemarkeerde subkop")
- `bodyTop` (richText, label "Tekst boven de afbeelding")
- `annotations` (array {text, font: handwritten|marker} — de blauwe woorden; render decoratief tussen bodyTop-alinea's zoals origineel; MAX pragmatisch: absolute posities benaderen vanaf JSON rects)
- `framedImage` (upload, label "Ingekaderde afbeelding")
- `bodyBottom` (richText)
- `arrowList` (array {text}, label "Pijl-lijst")
- `cta` (group ctaFields)

## Responsive
- Mobiel: alles stapelt, font-sizes omlaag (27px kop) — zie mobile summary; annotaties inline boven de betreffende alinea

## Regels
- Dit is het grootste block; neem de tijd voor de highlight-rendering (box-decoration-clone!) en de framed image
- Alle teksten via velden; verbatim teksten komen uit de seed
