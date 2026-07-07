# Human Margin — Behaviors (interaction sweep, 2026-07-07)

Bron: live site via Playwright, Elementor data-settings + computed styles.

## Globaal

- **Sticky header** — Elementor Pro sticky: `sticky: top`, actief op ALLE devices, `sticky_offset: 0`, `sticky_effects_offset: 0`. Header plakt bovenaan zonder stijlverandering bij scroll (geen shrink/schaduw-effect). Implementatie clone: `position: sticky; top: 0; z-index` op de header.
- **Geen entrance-animaties** — `elementor-invisible` count = 0, alle `animation:"none"`. Content staat direct; GEEN fade-ups bouwen.
- **Geen smooth-scroll library** — geen Lenis/Locomotive; native scroll.
- **Cookie-banner** — Complianz (paars/zwart consent-dialoog rechtsonder). Plugin-UI, NIET clonen als block; later apart consent-oplossing kiezen. In screenshots verborgen.
- **Transities** — knoppen: `transition: 0.3s` (all). Hover op hoofdknop: subtiele verandering (Elementor grow-animatie CSS geladen: `e-animation-grow`, `e-animation-grow-rotate` — check per knop welke `hover_animation` in data-settings staat).

## Navigatie

- **Desktop**: horizontaal menu, dropdowns op hover voor "Leeszaal" en "Neem actie" (angle-down SVG-icoon). Dropdown = wit paneel met verticale links.
- **Mobiel**: hamburger (`.elementor-menu-toggle`) → uitklapmenu. Logo + gele CTA-knop blijven zichtbaar.
- **Menustructuur (Header global):**
  - Home → /
  - Manifest → /manifest/
  - Leeszaal → /leeszaal/ ▾ [In de marge, In mensentaal, Op de leestafel]
  - Neem actie → /neem-actie/ ▾ [AICK- de Kit, AICK Sprint, AICK Aanbieder, TEAM op maat, Hoog risico op maat]
  - Over mij → /over-mij/
  - Contact → /contact/
  - CTA-knop: "AI REALITY CHECK" → /ai-reality-check/ (geel #EDFF00 op zwart in header)
- **Zoek-icoon** in header (Elementor Pro search-form widget) — klik opent zoekveld.
- **Footer-menu:** Affiliate → /affiliate/; Privacyverklaring → PDF (/wp-content/uploads/2026/06/PRIVACYVERKLARING-06.2026.pdf); Algemene Voorwaarden → PDF (ALGEMENE-VOROWAARDEN-05.2026.pdf); AI Beleid → PDF (AI-Gebruiksverklaring.pdf); Cookiebeleid (EU) → /cookiebeleid-eu/

## Testimonial-carousel (homepage)

- Widget: Elementor Pro `testimonial-carousel` op Swiper 8
- Settings: `slides_per_view: 3` (desktop), pagination `bullets`, `speed: 500`, `loop: yes`, `space_between: 10px`; mobiel 1 per view
- **2 slides totaal** (Miriam Dix, Edith Heslenga) — met loop
- GEEN autoplay aangetroffen in settings → handmatige navigatie via bullets/swipe

## Knoppen (globale stijl)

- Primair (geel): bg #EDFF00, tekst #111010, Archivo 15px 700 uppercase, padding 10px 20px, radius 0
- Secundair (blauw): bg #002CCF (rgb(0,44,207)), tekst #EDFF00, zelfde typografie
- transition: 0.3s; hover: Elementor `grow`-animatie CSS geladen (scale). Per knop verifiëren.

## Typografie-gedrag (responsive font-sizes uit kit post-10.css)

| Token | Desktop | ~Tablet | ~Mobiel |
|---|---|---|---|
| primary (Archivo Black, uppercase, lh 1.2/1.1) | 40px | 35/30px | 27px |
| secondary (Archivo 500 uppercase) | 26px | 24/22px | 20/19px |
| text (Archivo 400) | 18px | 17px | 17px |
| accent (Archivo 700 uppercase) | 15px | — | 12px |
| Marker (Atomic Marker) | 35px | — | 25px |
| Handwritten (Feisty) | 30px | — | 22px |
