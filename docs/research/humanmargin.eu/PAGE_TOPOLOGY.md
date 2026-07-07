# Human Margin — Page Topology

## Homepage (/) — 6743px hoog @ 1440px

Sectievolgorde (top → bottom), allemaal flow-content; header is sticky overlay:

| # | Werknaam | Interactiemodel | Beschrijving |
|---|---|---|---|
| 0 | **SiteHeader** (global) | sticky + hover-dropdowns | Zwarte balk: logo, menu, zoekicoon, gele CTA "AI REALITY CHECK" |
| 1 | **HeroPhoto** | statisch | Full-width B/W foto (vrouw op klinkers) met tekst-overlay: gele highlight "AI COMPLIANCE", doorgestreept "WIL", handgeschreven blauw "KAN", gele CTA-knop |
| 2 | **StatementBar** | statisch | Zwarte sectie, gecentreerd: witte Archivo Black regels + gele slotregel |
| 3 | **SplitPhotoText** (variant A: foto links) | statisch | 2 kolommen: B/W foto ("RAW POWER" graffiti) + off-white (#F4F4F1) tekstkolom met kop, blauwe Handwritten-annotatie, paragrafen, gele knop |
| 4 | **LongformDark** | statisch | Zwarte longform-sectie: kop, geel-gemarkeerde subkop, paragrafen, blauwe Marker-annotaties in de marge, ingekaderde woordenboek-afbeelding ("AI COMPLIANCE [eɪ aɪ kəmˈplaɪəns]"), pijl-lijst (→), gele CTA |
| 5 | **MethodIntro** | statisch | Witte sectie: kop "DE HUMAN MARGIN METHODE" + tekstkolommen |
| 6 | **SplitPhotoText** (variant B) | statisch | 2 kolommen: B/W foto (boek + gele markeerstift) + tekst "JE HOEFT GEEN AI-EXPERT TE WORDEN." + gele knop "NEEM ACTIE" |
| 7 | **TestimonialCarousel** | click/swipe (Swiper) | Zwarte sectie: groot geel aanhalingsteken, kop "RECENSIES ZIJN LEUK.", 2 off-white testimonial-kaarten met Handwritten-namen, bullets |
| 8 | **AboutTeaser** | statisch | Witte sectie: kop "EN WIE BEN IK ÜBERHAUPT OM DIT TE ZEGGEN?" + tekst + blauwe knop "MEER OVER MIJ" |
| 9 | **SiteFooter** (global) | statisch + link-hovers | Zwart: "VOLG MIJ:" + social icons (LinkedIn, Instagram), footer-menu (deels PDF-links), contact e-mail, copyrightregel met oranje accent |

## Payload-blockmapping (voorlopig)

- HeroPhoto → block `heroPhoto`
- StatementBar → block `statement`
- SplitPhotoText A+B → één block `splitPhotoText` (veld: imagePosition left/right, achtergrond wit/off-white)
- LongformDark → block `longformDark` (richText + annotaties + framed image + arrow-list + CTA)
- MethodIntro → block `textColumns`
- TestimonialCarousel → block `testimonials` (array van quotes)
- AboutTeaser → block `textCta`
- Header/Footer → Payload globals (bestaan al, velden uitbreiden)

## Overige 26 pagina's

Batch-captures in docs/design-references/humanmargin.eu/ (per pagina desktop+mobile). Template-groepering volgt na inspectie van captures — verwachting: dienstenpagina's (aick-*, team-, hoog-risico-) delen een template; leeszaal-familie deelt een template; utility-pagina's (bedankt, cookiebeleid, linkjes) zijn simpele tekstpagina's.
