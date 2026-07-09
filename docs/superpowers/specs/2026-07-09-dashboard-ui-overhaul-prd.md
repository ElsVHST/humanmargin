# PRD — Dashboard UI-overhaul: van "werkt" naar "fantastisch"

**Datum:** 2026-07-09 · **Auteur:** Dottie · **Status:** concept, ter review door Chris (en daarna Els)
**Referentiebeeld:** Pipedrive deals-pipeline (`Screenshot 2026-07-09 at 11.15.46.jpg`, Desktop van Chris)
**Vorige spec:** `2026-07-08-els-dashboard-design.md` (functioneel ontwerp — blijft geldig; dit PRD gaat over de UI-laag)

---

## 1. Samenvatting & doel

Het Els-dashboard is functioneel af (CRM, projecten, contentkalender, kennisbank; 49 tests groen), maar de beleving haalt het niveau van een moderne SaaS-tool niet. De custom boards zijn een eind op weg, maar **zodra Els ergens op klikt valt ze door de vloer naar de kale Payload-admin**: een zwart menu met hoofdletterlinks, Engelse systeemteksten, formulieren zonder context en beheer via losse database-schermen.

**Doel:** het hele dashboard voelt als één samenhangend, modern CRM-product (referentie: Pipedrive) op het merk van Human Margin — waarbij Els *nooit* het gevoel heeft in een database-admin te werken. Alles wat ze dagelijks doet (deals slepen, bewerken, kolommen beheren, taken en content bijhouden) gebeurt in-context: op het board zelf, in slide-over panelen, zonder paginawissels.

**Kernwens van Chris (expliciet):** het CRM krijgt een **mooi sidepanel met alle kolommen erin, zodat Els alles kan bewerken, slepen en beheren** — zoals Pipedrive's pipeline-editor.

---

## 2. Wat maakt de referentie (Pipedrive) goed?

**Richtinggevend besluit (Chris, 2026-07-09):** we volgen Pipedrive's UI-design zelf — layout, dichtheid, kaart-anatomie, kleurdiscipline — niet alleen de UX-patronen. Human Margin-accenten (geel/blauw/Archivo) vervangen de Pipedrive-kleuren, maar het scherm moet als Pipedrive *aanvoelen*. §2.1 is daarvoor de bindende designtaal.

Uit het referentiebeeld, vertaald naar patronen:

| Patroon | Wat Pipedrive doet | Waarom het werkt |
|---|---|---|
| App-shell | Smalle icon-rail links, topbar met zoekveld + globale "+" + profiel | Navigatie kost geen aandacht; zoeken en toevoegen altijd binnen bereik |
| Kolomkoppen | Per fase: naam, **€-totaal en aantal deals** ("€ 10.700 · 4 deals") | Het board ís de rapportage; je ziet de gezondheid van de funnel in één blik |
| Board-toolbar | Pipeline-totaal, filter/eigenaar-selector, weergave-switch, "+ Deal"-knop | Alle boardacties op één vaste plek |
| Kaarten | Compact: titel, org, bedrag, eigenaar-avatar, status-stip; hover toont acties | Hoge dichtheid zonder rommelig te worden |
| Slepen | Tijdens het slepen verschijnt onderin een actiebalk: **VERLOREN / GEWONNEN / VERWIJDEREN / VERPLAATSEN** | Uitkomst afhandelen = één beweging, geen formulier |
| Detail | Deal opent als overlay/paneel mét timeline, niet als losse pagina | Context blijft; bewerken voelt licht |
| Beheer | Pipeline-fases bewerk je in een editor met slepen, hernoemen, kleuren | Beheer hoort bij het board, niet in een aparte database-view |

### 2.1 UI-designtaal (bindend voor alle epics)

Gedetailleerde analyse van het referentiebeeld, als concrete designspecificatie:

**Shell**
- **Icon-rail** (~64px): donker vlak, alleen lijn-iconen zonder labels; actief item = afgerond vierkant in accentkleur; notificatie-badges als dots op de iconen; logo boven, "⋯"-overflow onder. HM-vertaling: off-black rail, actief vierkant **electric yellow met zwart icoon**.
- **Topbar** (wit, ~64px): paginatitel links (semibold ~20px) · **pil-vormig zoekveld gecentreerd** (bewust het rondste element van het scherm) · ronde "+"-knop ernaast · rechts hulp-icoon en **avatar + naam + bedrijfsnaam in twee kleine regels**.
- **Board-toolbar** (tweede rij, wit): links segmented control met weergave-iconen (board/lijst/forecast) + de **enige verzadigde knop van het scherm** ("+ Deal"); rechts kaal samenvattingstekstje ("21 280€ · 13 deals"), pipeline-selector met trechter-icoon, **potlood-icoon = ingang kolommen-editor**, filter/sorteer. Witte knoppen, 1px grijze rand, kleine radius.

**Board**
- Canvas lichtgrijs (`~#f7f7f8`), kaarten wit — kolommen hebben géén eigen kaders in rust; de **doelkolom kleurt egaal grijs tijdens drag** (dropzone-highlight).
- **Kolomkoppen vormen een trechter-strip**: schuine chevron-scheidingen tussen de fasen (pijlvorm → je ziet de flowrichting). Per kop: fasenaam (semibold ~15px) + metaregel met weegschaal-icoon + **"10 700€ · 4 deals"** (~12px, grijs). Rapportage woont ín de koppen.

**Kaart-anatomie** (boven → onder)
1. **Label-strips**: 2-3 gekleurde mini-balkjes (~3×24px) — subtieler dan pills.
2. Titel (semibold ~14px, max 2 regels) → organisatienaam (grijs) → onderste rij: mini-avatar + bedrag.
3. Rechtsboven: **status-cirkel volgende activiteit** — groen+pijl = gepland, grijs = niets gepland, rood + "3D"-pil = dagen over tijd, oranje driehoek = deal stilgevallen. Dé signatuur: één blik over het board = weten waar actie nodig is.
4. **Statustint over de hele kaart**: lichtrood = achterstallig, lichtgroen + "WON"-pill + groen topbalkje = zojuist gewonnen.
5. Kaarten zijn vlak (1px rand, nauwelijks schaduw, radius 4-6px); **elevatie is gereserveerd voor de drag-state** (schaduw + lichte schaal-up).

**Drag-actiebalk**: verschijnt onderin tijdens slepen; vier zones gescheiden door stippellijnen — DELETE · LOST (rood) · WON (groen) · MOVE/CONVERT — all-caps met letterspacing (de enige all-caps in de hele UI), royale hit-areas.

**Token-vertaling naar Human Margin**

| Token | Pipedrive | Human Margin |
|---|---|---|
| Rail-vlak / actief item | donker indigo / paars vierkant | off-black / **geel vierkant, zwart icoon** |
| Primaire actie (max 1 per scherm) | verzadigd groen | merk-knop blauw `#002ccf` ↔ geel |
| Canvas / kaart | `#f7f7f8` / wit, 1px rand | bestaande `--theme-elevation-*` |
| Statuskleuren | groen/rood/oranje cirkels + kaarttinten | bestaande kleurtokens + nieuw `--hm-tint-*` (rood/groen/oranje zweem) |
| Radius | kaarten/knoppen 4-6px; zoekpil 100%; avatars rond | `--hm-r: 6px` (voorstel — beantwoordt de radius-vraag) |
| Typografie | één sans, hiërarchie via gewicht+grijswaarde: 20/15/14/12 | Archivo, zelfde schaal |
| Schaduw | vlak in rust, elevatie alleen bij drag | `.hm-card` versoberen; `.is-dragging` krijgt de schaduw |
| Kleurdiscipline | monochroom canvas; kleur = betekenis (status, labels, 1 primaire knop) | idem — geel/blauw nooit decoratief strooien |

---

## 3. Deel 1 — Analyse van de huidige UI

Geverifieerd in de draaiende app (localhost:3000, 1440px, ingelogd als beheerder). Screenshots in sessie-scratchpad: `audit-01…08`.

### 3.1 Systemisch: het dashboard is twee werelden

Het grootste probleem is niet één scherm, maar de breuk tussen twee lagen:

1. **De custom views** (`/admin`, `/admin/pipeline`, `/admin/taken`, `/admin/kalender`, `/admin/kennisbank`) — hebben al een designsysteem (`--hm-*` tokens, kaarten, pills, avatars) en voelen redelijk modern.
2. **Alles daarachter is rauw Payload.** Kaart aanklikken (`PipelineBoard.tsx:230` → `href=/admin/collections/deals/{id}`), "+ Deal", een fase aanmaken, een organisatie bekijken — álles dumpt Els in de standaard Payload-admin: ander lettergebruik, andere dichtheid, Engelse knoppen, geen timeline-context naast het formulier.

Elke klik is een gok: blijf ik in het mooie dashboard of val ik terug naar "de database"? Dat is de jaren-90-ervaring.

### 3.2 App-shell: sidebar & topbar (audit-01)

- De sidebar is de standaard Payload-nav: **zwart vlak met ALL-CAPS tekstlinks**, geen iconen, geen actieve-status anders dan tekst. Groepen (CONTENT, BEHEER, CRM, PROJECTEN, KENNISBANK, SITE) tonen **rauwe database-collecties** (Organisaties, Deals, Pipeline-fases, Taakstatussen…) naast de echte werk-oppervlakken — twee ingangen naar hetzelfde, waarvan één de verkeerde.
- De vier dashboardlinks (Pipeline/Taken/Kalender/Kennisbank) hangen als los lijstje onderaan (`DashboardNavLinks.tsx` — letterlijk vier tekstlinks met inline styles).
- De topbar is vrijwel leeg: logo + avatar. **Geen globale zoekfunctie, geen quick-add, geen breadcrumb** in de custom views.
- De sidebar duwt de hele viewport (fysiek paneel), geen icon-rail of inklap-gedrag zoals in het referentiebeeld.

### 3.3 Pipeline-board (audit-02)

Sterk: kanban werkt, slepen werkt (optimistic updates), kaarten hebben org-avatar + titel + bedrag (+ kans-meter indien gevuld), kolommen hebben kleurstip en aantal.

Zwak, gemeten aan de referentie:

- **Geen €-totaal per kolom** en geen pipeline-totaal/gewogen waarde — het board vertelt niets over geld, terwijl dat de kern van een CRM-board is (de home-view berekent het wél; het board zelf niet).
- **Geen board-toolbar**: geen zoeken, geen filter op eigenaar, geen "+ Deal"-hoofdknop. Deal toevoegen kan alleen via de kleine "+ Deal" onderin elke kolom — en die linkt naar het rauwe Payload-createformulier.
- **Geen gewonnen/verloren-afhandeling op het board.** `uitkomst` (open/gewonnen/verloren) bestaat in het schema en er hangt zelfs een hook aan (gewonnen → project), maar de enige weg ernaartoe is het Payload-formulier. Pipedrive's sleep-naar-WON/LOST ontbreekt volledig.
- **Kolomkop heeft een kale "×"** als delete-actie — permanent zichtbaar, gevaarlijk ogend, en bevestiging via `window.confirm()` (browser-dialoog = systeemvreemd).
- **Kolommen slepen kan niet** op het board; volgorde wijzigen kan alleen in de Payload-lijstview van Pipeline-fases (spec §1 "later", maar met het sidepanel uit dit PRD lossen we het nu op).
- Layout: kolommen zweven los in een verder lege pagina; horizontale scrollbar hangt halverwege het scherm; onder het board gaapt witruimte. Kolommen zouden de viewport-hoogte moeten vullen.
- Paginakop is alleen de tekst "PIPELINE" — geen context, geen acties.

### 3.4 Deal openen = contextbreuk (audit-07)

Klik op een kaart → volledige paginawissel naar het Payload-editformulier:

- Bovenaan Engelse metadata ("Last Modified: July 8th 2026, 10:25 AM"), tabs "EDIT/API", een "SAVE"-knop — database-taal, geen CRM-taal.
- Het formulier toont alle velden even groot en even belangrijk; **de timeline (het hart van een CRM-record) hangt er onderaan bij** in plaats van als eigen kolom naast de velden.
- Terug naar het board = browser-back. Els verliest haar plek, filters en scroll-positie.
- Zelfde verhaal voor taken, content-items, organisaties, contacten en kennisdocument-metadata.

### 3.5 Kolommenbeheer (audit-08)

Fases beheren = de Payload-lijstview van "Pipeline-fases": een datatabel met checkboxes, "CREATE NEW", zoekbalk "Search by Naam", paginering "1-4 of 4". Kleur is een tekstkolom ("Blauw", "Paars") zonder swatch. Er zijn drag-handles (Payload `orderable`), maar dit scherm is en blijft een database-tabel — precies wat Chris' sidepanel-wens moet vervangen.

### 3.6 Taken-board (audit-03)

Zelfde skelet als pipeline, dus dezelfde gaten (geen toolbar-zoek, kale ×, lege onderkant). Extra:

- De filters (project/persoon) zijn **native `<select>`-elementen** zonder styling — vallen uit het designsysteem.
- Kaarten tonen prioriteit/deadline-pills, maar **geen assignee-avatar** en **geen checklist-voortgang** (schema heeft beide).
- Geen "mijn taken"-sneltoets of gruppering per project.

### 3.7 Contentkalender (audit-04)

Functioneel prima (maand/week/lijst, status-pills, vandaag-marker). Verbeterpunten: items op een dag zijn krap leesbaar; nieuwe content plannen kan niet door op een dag te klikken (moet via nav → Payload-form); geen kanaal-filter; drag om te verplaatsen ontbreekt.

### 3.8 Kennisbank (audit-05)

De myDrive-opzet staat er (breadcrumb, mappen/documenten-grid, detailrail, zoeken, "+ NIEUW"). Zwakker: veel lege ruimte bij weinig content; documentkaarten missen preview/typering; document openen → Payload-editformulier voor de Lexical-editor (zelfde contextbreuk als 3.4).

### 3.9 Home (audit-01)

Beste scherm van de vijf: begroeting, quick-actions, stat-tegels met echte fase-verdelingsbalk, activity-feed. Maar: de quick-action-knoppen linken naar rauwe Payload-createformulieren; "Recente activiteit" is puur tekst zonder iconen/avatars; de derde kolom blijft leeg bij weinig data.

### 3.10 Taal & microcopy

`i18n.fallbackLanguage: "nl"` staat goed, maar de ingelogde gebruiker staat op Engels → mengtaal door de hele admin ("CREATE NEW" naast "Zoeken in de kennisbank…", "<No Organisatie>", "Per Page"). Bedragen in lijstviews zijn ongeformatteerd (`8900` i.p.v. `€ 8.900`). Datums Engels ("July 8th 2026").

### 3.11 Wat al goed is (behouden, niet opnieuw bouwen)

- Tokensysteem `--hm-*` + componentkit (`.hm-card`, `.hm-pill`, `.hm-av`, `.hm-meter`, `.hm-slideover`, …) in `dashboard.scss` — de overhaul bouwt hierop voort.
- Board-architectuur: TanStack Query + optimistic updates + `@hello-pangea/dnd` + `positionBetween` — solide fundament, alleen de schil eromheen moet af.
- Hooks & datamodel (timeline, gewonnen→project, blog→pagina) — UI-werk raakt het schema niet.
- Kalender- en kennisbank-basislayouts.
- Admin-branding (logo, geel accent, Archivo).

---

## 4. Deel 2 — De overhaul

Noordster: **Els verlaat de custom views nooit meer voor dagelijks werk.** Payload-formulieren blijven alleen bestaan als "onderwater-scherm" voor beheerders.

Het merk blijft leidend: electric yellow `#edff00`, brand-blauw `#002ccf`, Archivo, scherpe merk-knoppen. We klonen Pipedrive's *patronen*, niet z'n huisstijl.

### Epic A — App-shell 2.0 (sidebar + topbar)  · prioriteit P0

Vervang de standaard Payload-nav door een eigen shell (Payload 3: `admin.components.Nav`-override; bestaand `DashboardNavLinks.tsx` vervalt).

- **Icon-rail conform §2.1**: off-black rail (~64px) met alleen lijn-iconen (Lucide), actief item = geel afgerond vierkant met zwart icoon, tooltips bij hover. Twee zones:
  1. *Werken* (voor Els): Home, Pipeline, Taken, Kalender, Kennisbank.
  2. *Beheer* (onderaan, boven "⋯"-overflow): Site-content (Pagina's, Media, Header/Footer), Instellingen (Gebruikers, Abonnees) — alleen-beheerder.
- **Topbar conform §2.1** in alle custom views: paginatitel links; **pil-vormig zoekveld gecentreerd** (⌘K: zoekt over deals, organisaties, contacten, taken, content, kennisdocs via REST, gegroepeerde resultaten); ronde "+"-knop ernaast (quick-add-menu → slide-over uit Epic C, geen Payload-form); rechts avatar + naam + "Human Margin" in twee regels, met menu (profiel, uitloggen, taal).
- Rauwe collecties (Deals, Organisaties, Contactpersonen, Activiteiten, Pipeline-fases, Taakstatussen, Kanalen…) verdwijnen uit de nav voor niet-beheerders (`admin.hidden` per collectie op rol) — ze blijven via URL/API bereikbaar.

**Acceptatie:** Els ziet na inloggen alleen nog de vijf werk-oppervlakken + beheer-sectie; nav heeft iconen en klapt in; ⌘K vindt "Demo Consultancy" vanuit elk scherm; "+" maakt een deal aan zonder paginawissel.

### Epic B — Pipeline 2.0 (het visitekaartje)  · prioriteit P0

- **Board-toolbar conform §2.1** (vaste kop): links segmented control (board/lijst — lijst mag later) + primaire knop **"+ Deal"** (→ slide-over, de enige verzadigde knop); rechts **pipeline-totaal + gewogen waarde** (Σ bedrag·kans) + aantal open deals als kaal tekstje, eigenaar-filter, zoekveld (filtert kaarten live) en het **potlood-icoon** → kolommen-sidepanel (Epic D).
- **Kolomkoppen als trechter-strip** (§2.1): schuine chevron-scheidingen tussen de fasen; per kop fasenaam + metaregel **"€ 12.400 · 3 deals"**. De "×" verdwijnt volledig uit de kop; kolomacties (hernoemen, kleur, verwijderen) verhuizen naar het kolommen-sidepanel.
- **Sleep-actiebalk conform §2.1**: tijdens het slepen verschijnt onderin de balk met stippellijn-zones — **VERWIJDEREN · VERLOREN (rood) · GEWONNEN (groen)** (all-caps, letterspacing, royale hit-areas). VERLOREN vraagt om `verlorenReden` in een klein dialoog; GEWONNEN triggert de bestaande hook (project ontstaat automatisch) + toast "Deal gewonnen 🎉 — project aangemaakt". Doelkolom kleurt egaal grijs tijdens drag.
- **Kaarten conform §2.1-anatomie**: gekleurde label-strips (tags), titel (max 2 regels), organisatienaam, onderste rij mini-avatar + bedrag; **status-cirkel rechtsboven** (groen = taak/activiteit gepland via gekoppeld project of deadline, grijs = niets gepland, rood + "3d"-pil = over tijd, oranje = stilgevallen > X dagen uit `updatedAt`); **statustint** over de hele kaart bij achterstallig (lichtrood) en zojuist gewonnen (lichtgroen + WON-pill). Kans-meter blijft.
- **Layout**: kaarten vlak (1px rand, radius `--hm-r`), elevatie alleen op `.is-dragging`; kolommen vullen de viewport-hoogte (flex-kolom met interne scroll per kolom), board scrollt alleen horizontaal binnen zijn eigen container; lege kolommen tonen een nette lege-staat ("Sleep een deal hierheen of maak er één").
- "+ Deal" per kolom opent de slide-over met de fase voorgeselecteerd.

**Acceptatie:** kolomtotalen kloppen live mee bij slepen; deal naar GEWONNEN slepen maakt project aan zonder paginawissel; zoeken filtert kaarten < 100ms; het board heeft geen dode witruimte meer op 1440px.

### Epic C — Slide-over record-panelen (einde van de contextbreuk)  · prioriteit P0

Eén generiek `RecordPanel`-patroon op de bestaande `.hm-slideover`-kit, per recordtype ingevuld. Opent vanaf kaarten, kalenderitems, zoekresultaten en quick-add; URL krijgt `?deal=3` zodat panelen deelbaar/herlaadbaar zijn.

- **Deal-paneel** (eerst): kop met titel + org + fase-selector (pill-dropdown) + uitkomst-knoppen (Gewonnen/Verloren); linkerkolom bewerkbare velden (bedrag, kans, sluitdatum, contactpersoon, eigenaar — inline edit, autosave met toast); rechterkolom **timeline** (activities, nieuwste boven) + notitieveld bovenaan. Onderin: "Openen in volledige editor" (Payload-form, voor de zeldzame gevallen).
- Daarna zelfde patroon voor **Taak** (checklist afvinkbaar in het paneel), **Content-item** (status-flow idee→concept→gepland→gepubliceerd als stappen), **Organisatie** (met tabbladen: gegevens / contacten / deals / timeline), **Contact**.
- Create-variant: zelfde paneel leeg, verplichte velden gemarkeerd; vervangt alle links naar `/admin/collections/*/create` in home-quick-actions en boards.

**Acceptatie:** kaartklik op het board opent het paneel (geen navigatie); veld wijzigen → autosave → board-kaart update optimistisch; timeline toont de wijziging direct; Esc/klik-buiten sluit en herstelt scroll-positie.

### Epic D — Kolommenbeheer-sidepanel (Chris' expliciete wens)  · prioriteit P0

Eén paneel, bereikbaar via een "Kolommen"-knop (⚙) in de board-toolbar van Pipeline én Taken (en Kanalen op de kalender):

- Lijst van alle kolommen/fases met **drag-handle om te herordenen** (persist via Payload `_order`), **inline hernoemen**, **kleur-swatch-picker** (de 9 bestaande kleurtokens als stippen), **"+ Kolom toevoegen"** onderaan, verwijderen via ⋯-menu met nette bevestiging ("3 kaarten vallen terug naar 'Geen fase'").
- Wijzigingen zijn direct zichtbaar op het board erachter (optimistic, TanStack Query-invalidatie bestaat al).
- Alleen-beheerder blijft van kracht (bestaande access-regels); teamleden zien het paneel read-only met uitleg.
- Vervangt de Payload-lijstviews van `deal-stages` / `task-statuses` / `content-channels` als beheeringang (collecties gaan uit de nav, Epic A).

**Acceptatie:** Els (beheerder) kan zonder de pipeline te verlaten een fase toevoegen, hernoemen, een kleur geven en verslepen; volgorde blijft na refresh; kaarten in een verwijderde fase staan direct in "Geen fase".

### Epic E — Taken, Kalender & Kennisbank verfijning  · prioriteit P1

- **Taken:** toolbar gelijk aan pipeline (zoek + gestylede filter-dropdowns i.p.v. native selects, "Alleen mijn taken"-toggle); kaarten krijgen assignee-avatar + checklist-voortgang ("2/5" mini-meter); zelfde sleep-actiebalk ("KLAAR" i.p.v. WON/LOST is niet nodig — status ís de kolom; wel VERWIJDEREN).
- **Kalender:** klik op een dag = nieuw content-item in slide-over met datum vooringevuld; items verslepen naar een andere dag (dnd, update `publishDate`); kanaal-filter in de toolbar; items tonen kanaal-icoon.
- **Kennisbank:** document openen in een lees-slide-over (RichText render) met "Bewerken"-knop (die mag naar de Payload Lexical-editor blijven gaan — daar is die editor goed); mappen slepen om te nestelen; lege-staten met illustratie + CTA.

**Acceptatie:** geen native selects meer in het dashboard; content plannen kan volledig vanuit de kalender; kennisdocument lezen kost nul paginawissels.

### Epic F — Home 2.0  · prioriteit P1

- Quick-actions openen de create-slide-overs (Epic C) i.p.v. Payload-forms.
- Activity-feed met type-iconen + auteur-avatars; klik op regel opent het bijbehorende record-paneel.
- Derde kolom krijgt een "Deze week"-blok (deals met sluitdatum, taken met deadline) zodat het grid nooit leeg oogt.

### Epic G — Taal, formattering & Payload-restyling  · prioriteit P1

- Gebruikerstaal geforceerd/standaard op **nl** (en desnoods `supportedLanguages` beperken tot nl) — weg met "CREATE NEW"/"Per Page".
- Datum/valuta overal `nl-NL` (bestaande `euro()`-helper verhuist naar `shared/ui.ts` en wordt overal gebruikt).
- De Payload-schermen die overblijven (volledige editor, site-content, Lexical) krijgen een lichte restyling via `custom.scss`: Archivo, geel accent, NL-labels — zodat óók het onderwater-scherm niet meer als een ander product voelt.

### Epic H — Polish & staten  · prioriteit P2

- Toast-systeem (succes/fout) dashboard-breed; alle `window.confirm`/`alert` weg.
- Lege staten en foutstaten per view (geen witte vlaktes).
- Responsive-QA op 390px (boards → horizontale snap-scroll met kolom-peek; panelen → volledig scherm).
- Dark-mode-tokens visueel QA'en zodra de toggle aan mag; **radius-besluit** (`--hm-r` 8px vs 0) door Chris vóór deze epic.
- Micro-interacties: hover-lift bestaat al; toevoegen: sleep-schaduw, drop-pulse, skeleton-loaders bij eerste load.

---

## 5. Fasering

| Fase | Inhoud | Waarom deze volgorde |
|---|---|---|
| 1 | Epic A (shell) | Bepaalt het gevoel van álles; alle andere epics landen in deze shell |
| 2 | Epic C (deal-paneel) + Epic B (pipeline 2.0) | Samen het Pipedrive-moment: board + paneel = het CRM-verhaal af |
| 3 | Epic D (kolommen-sidepanel) | Chris' expliciete wens; bouwt op paneel-patroon uit C |
| 4 | Epic C-rest (taak/content/org/contact-panelen) + Epic E | Patroon uitrollen over de andere oppervlakken |
| 5 | Epic F + G | Home, taal, restyling van de restjes |
| 6 | Epic H | Polish, responsive, dark, radius |

Elke fase eindigt met visuele QA (screenshots 1440 + 390) en `npm run check` + tests groen. Na elke fase de skill `humanmargin-dashboard` bijwerken (onderhoudsplicht).

## 6. Technische kaders

- **Geen schemawijzigingen nodig** voor P0 (alles staat al in de collecties: uitkomst, verlorenReden, kans, sluitdatum, kleur, `_order`). Stilstand-indicator gebruikt `updatedAt`.
- Stack blijft: `@hello-pangea/dnd`, TanStack Query, REST (`credentials: 'include'`), `.hm-*`-kit. Nieuwe componenten → `npm run generate:importmap`.
- Nav-override via `admin.components.Nav`; collecties verbergen via `admin.hidden` (functie op user-rol). Views blijven geregistreerd zoals nu (`payload.config.ts` regel 52-71).
- Access-regels ongemoeid: kolombeheer alleen-beheerder; panelen respecteren veldrechten (REST geeft 403 → nette foutstaat).
- Lint-regels: geen `Date.now()` in render (stilstand berekenen vóór JSX), geen setState-in-effect, interne links `next/link`.
- Risico: Payload-versie-upgrades kunnen de Nav-override raken → in de skill documenteren welke Payload-API's we overriden.

## 7. Niet in scope

E-mailsync, support-inbox, social auto-publish, Cal.com, klant-deellinks, publieke kennisbank-rendering (allemaal spec §1 "later"); Vercel-deploy (loopt apart); meerdere pipelines (Els heeft er één; datamodel kan het later aan).

## 8. Open beslissingen (voor Chris)

1. ~~Radius~~ **Beantwoord door §2.1:** `--hm-r: 6px` (Pipedrive-vlak, kaarten 4-6px); zoekpil als bewuste uitzondering 100% rond. Akkoord Chris nog formeel nodig.
2. ~~Sidebar-stijl~~ **Beantwoord door §2.1:** icon-rail-only (Pipedrive), geel actief vierkant; labels via tooltips.
3. **Dark mode:** aanzetten in deze overhaul of bewust light-only naar Els? Voorstel: light-only tot na Els' review.
4. **Stilstand-drempel:** na hoeveel dagen kleurt een deal "stil"? Voorstel: 14 dagen.
5. **Label-strips op kaarten:** deals hebben nu geen tags-veld (organisaties wel). Optie A: org-tags tonen; optie B: `tags[]` aan deals toevoegen (kleine schemawijziging, breekt niets). Voorstel: A nu, B later als Els erom vraagt.

## 9. Definition of Done (per epic én geheel)

- Els kan haar dagelijkse flows (deal van lead → gewonnen; taak aanmaken en afronden; content plannen; document opzoeken) volledig doorlopen **zonder één Payload-standaardscherm te zien**.
- Geen Engelse systeemteksten meer in Els' zicht; alle bedragen/datums nl-NL.
- Visuele QA op 1440 én 390; `npm run check` groen; bestaande 49 tests groen + nieuwe tests voor won/lost-flow en kolomherordening.
- Skill `humanmargin-dashboard` en handleiding voor Els (`docs/handleiding-els-dashboard.md` + kennisbank-seed) bijgewerkt op de nieuwe UI.

— Dottie
