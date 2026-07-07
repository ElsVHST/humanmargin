# Block: testimonials — Recensie-carousel (zwart)

## Overview
- **Payload block:** `src/blocks/Testimonials/config.ts` (slug `testimonials`, interfaceName `TestimonialsBlock`) + Component (client component — carousel!)
- **Screenshot:** `docs/design-references/humanmargin.eu/section-6-testimonials.png`
- **Exacte waarden:** `sections/69d31d71-{desktop,mobile}-summary.txt` + `.json`
- **Interactiemodel:** click/swipe-carousel (Swiper op origineel)

## Structuur (desktop, bg #111010)
- Groot geel aanhalingsteken (") — check JSON: tekstkarakter of icoon; geel #EDFF00, groot (maat in JSON)
- h2 "Recensies zijn leuk." — Archivo Black 40/48 uppercase wit, center
- Intro-regel wit Archivo 18/27 center: "Voor mijn ego, maar mogelijk ook voor jou. En waarom hier wat typen als anderen 't al beter zeiden?"
- Carousel: **3 slides per view desktop / 1 mobiel**, gap 10px, loop, snelheid 500ms, bullets onderaan; GEEN autoplay
  - 2 kaarten (uit seed): off-white bg (#F4F4F1 of #DDDDD3 — check JSON), quote cursief/regular Archivo (maat in JSON), naam in **Handwritten (Feisty)** stijl (maat/kleur in JSON)
- Bullets: kleur/maat uit JSON (Swiper-pagination stijl)

## Implementatie carousel
- Gebruik `embla-carousel-react` (^8) — voeg dependency toe aan package.json
- Opties: loop true, align start, duration ~. Bullets = dots-state via embla API; swipe werkt native
- 'use client' alleen voor de carousel-subcomponent; block Component zelf mag server zijn met client-carousel als kind

## Payload-velden
- `heading` (text), `intro` (text)
- `items` (array {quote: textarea, name: text}, minRows 1)

## Responsive
- Mobiel: 1 slide per view; overige maten uit mobile summary

## Regels
- Met 2 items en 3-per-view desktop toont het origineel gewoon 2 kaarten naast elkaar (loop maakt slide 3 dubbel) — render exact zoals origineel eruitziet (vergelijk screenshot!)
