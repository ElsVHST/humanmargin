/**
 * Wiki-contentpack — map "Roadmap & wensen" (12) + map "Agents" (3) — 15 pagina's.
 *
 * Geen seed-logica: alleen content. `scripts/seed/seed-wiki.ts` (T5) leest
 * `PAGINAS` uit dit bestand (en de andere content-packs) en zet ze via de
 * Local API in `knowledge-docs` neer.
 *
 * Bronnen: docs/superpowers/specs/2026-07-09-els-braindump-analyse.md;
 * docs/superpowers/specs/2026-07-09-crm-gap-index.md;
 * docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md (§3, §3.2, §4.4-§4.5, §5, §6);
 * scripts/seed/seed-routekaart.ts.
 */

/** Submap-titel uit de canonieke structuur, of null voor root-niveau. */
export type WikiPagina = {
  map: string | null;
  titel: string;
  tags: string[]; // altijd minimaal ["wiki"]
  markdown: string;
};

export const PAGINAS: WikiPagina[] = [
  {
    map: "Roadmap & wensen",
    titel: "Strategie — de Human Margin Method",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §1

Human Margin (HM) legt de AI Act op een menselijke manier uit via social, de Leestafel, de kennisbank "AI Act in Mensentaal" en de nieuwsbrief "In de Marge" — en is bezig van tool naar methode te groeien. Deze pagina is de strategische bril waaronder alle andere roadmap-pagina's vallen.

## Wat Human Margin nu is

- Communicatiekanalen: social (LinkedIn/Instagram), de **Leestafel** (boekbesprekingen/opinies op de site) en de kennisbank **"AI Act in Mensentaal"**, plus de nieuwsbrief **"In de Marge"**.
- Leestafel en AI Act in Mensentaal hebben elk een **vast format** — de basis voor de contentformats die in [[Fase A — content & formats]] gebouwd worden.

## Human Margin wordt de Human Margin Method

Els wil HM registreren als methode — de **N staat voor Nurture** — inzetbaar voor alles wat ze doet, niet alleen AI-compliance. **(gepland, richting nog verder te bepalen)**

## AICK wordt een product ván Human Margin

De **AI Compliance Kit (AICK)** krijgt geen aparte site meer; de huidige AICK-site verdwijnt. Binnen de methode wordt onderscheid gemaakt tussen:

- **AICK Core** — wat er nu al staat.
- **Sector packs** — voor fotografen, recruiters, VA's, finance, makelaars **(gepland)**.
- Waarschijnlijk een **AVG-module** **(gepland, vorm nog open)**.

Dit landt bouwtechnisch in [[Fase F — academy, betalingen & affiliates]] (productenmodel).

## Academy, sprekersklussen & podcasts (gepland)

**Human Margin Academy** — masterclasses over AI menselijk gebruiken en de teruggewonnen tijd bewust inzetten — noemt Els zelf "de natte droom". Daarnaast: meer **sprekersklussen** en video-**podcasts** over de menselijke marge. Beide zijn nog niet gebouwd; de academy-infrastructuur zit in [[Fase F — academy, betalingen & affiliates]].

## Licentiemodel & team (open vragen)

Er moet **iets licentiemodel-achtigs** komen: eenvoudig deelbaar, niet alleen door Els zelf te gebruiken — de precieze vorm is nog een open vraag aan Els (voor wie: partners, bedrijven met meerdere medewerkers?). De architectuur van de academy modelleert daarom "toegang" alvast los van "gebruiker" (zie [[Fase F — academy, betalingen & affiliates]]). Els overweegt daarnaast een **VA** ("virtuele assistent") die administratief werk overneemt — rollen/rechten daarvoor bestaan al op basisniveau (zie [[Gebruikers, rollen & voorkeuren]]).

## De kernpijn die alles stuurt

Content maken en verspreiden kost Els veel te veel tijd; leads binnenhalen, opvolgen en verkopen loopt moeizaam. Betaling en levering lopen wél vlot. Vrijwel elke fase in de routekaart (zie [[Wensenkaart W1–W31]]) lost een stukje van precies deze twee pijnpunten op.

## Harde kaders

Wat hierboven gepland staat, mag nooit ten koste gaan van Els's controle over wat naar buiten gaat: zie [[Kaders — wat nooit automatisch mag]] voor de regels die voor élke fase en élke agent gelden.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Fase A — content & formats]]
- [[Fase F — academy, betalingen & affiliates]]
- [[Kaders — wat nooit automatisch mag]]
- [[Overzicht — het Human Margin-platform]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Wensenkaart W1–W31",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §2, §4

Alle 31 wensen uit Els's braindump, per categorie, elk met de status uit de gap-analyse en een link naar de fase die het oppakt. Voor de uitgeschreven inhoud per fase: zie de fase-pagina's; voor de regels die overal gelden: zie [[Kaders — wat nooit automatisch mag]].

## A. Content & repurposing

- **W1** — Inspreken → vast format (Leestafel/Mensentaal). 🔶 kleine uitbreiding → [[Fase A — content & formats]]
- **W2** — Repurposing-motor: podcast-/masterclass-opnames worden snippets, social posts, blogs, nieuwsbrief-items. 🔶/🔌 → [[Fase D — repurposing & ochtendmail]]
- **W3** — Editing tools voor geluid en beeld. 🔌 blijft extern (Descript/Opus Clip e.d.), wij leveren tijdcodes + teksten → [[Fase D — repurposing & ochtendmail]]
- **W4** — Brand-getrainde opmaak (social posts/presentaties automatisch in huisstijl). 🏗️ later, tot dan Canva → [[Strategie — de Human Margin Method]]
- **W5** — Beeldbank: foto's classificeren en doorzoeken. 🔶 (AI-tagging bij upload) → [[Fase A — content & formats]]
- **W6** — Dubbels opruimen + concepten voorbereiden (nooit automatisch publiceren). ✅ gebouwd (statusflow idee→concept→gepland→gepubliceerd + blog→conceptpagina-hook) → [[Kaders — wat nooit automatisch mag]]
- **W7** — Transcriptie + shownotes automatisch naar aanwezigen. 🔶/🔌 → [[Fase D — repurposing & ochtendmail]]

## B. Funnel, sales & automatisering

- **W8** — AI Reality Check native (naam volgt): vragenflow + kwadrant-segmentatie + risiconiveau. 🏗️ nieuw → [[Fase B — Reality Check native]]
- **W9** — Gepersonaliseerd rapport op naam, volledig automatisch gegenereerd. 🏗️ nieuw (deelt de rapport-motor met W12) → [[Fase B — Reality Check native]]
- **W10** — Zeven opvolgmailreeksen met gepast aanbod per segment. 🔌 dan 🏗️ (fase 1: ActiveCampaign-tags, fase 2: eigen mailmotor) → [[Fase B — Reality Check native]], [[Fase H — eigen mailmotor]]
- **W11** — Volledige funnel: post → Reality Check → tag → mailreeks → aanbod → aankoop → toegang → vragenlijst → meeting → resultaat. 🔌 dan 🏗️ → [[Fase B — Reality Check native]]
- **W12** — Custom-GPT-rapport in huisstijl (na Els's review automatisch in de juiste layout). 🔶/🏗️ → [[Fase C — publiek & rapporten]]

## C. CRM & prospectie

- **W13** — Lichtgewicht CRM: tags, lijsten, opvolgen, reminders, achtergrondinfo. ✅/🔶 grotendeels gebouwd → [[CRM — organisaties, contacten en deals]]
- **W14** — Prospectiegroepen (bedrijven/zzp'ers/aanbieders) apart volgen. 🔶 gebouwd (doelgroep-veld) → [[CRM — organisaties, contacten en deals]]
- **W15** — LinkedIn-DM-opvolging: labelen en bijhouden i.p.v. Canbox. 🔌/❓ (geen officiële LinkedIn-DM-API) → [[CRM-afronding (gap-index)]]
- **W16** — Samenwerken met een VA (rollen/rechten, taken overdragen). ✅ basis gebouwd → [[Gebruikers, rollen & voorkeuren]]

## D. Kennis & informatie

- **W17** — Tweede brein: centrale plek met teksten, bronnen, onderzoek, testimonials, brand-assets. ✅/🔶 (kennisbank staat, mappen-conventie volgt) → [[Kennisbank & bestanden]], [[Second Brain]]
- **W18** — Dagelijkse ochtendmail met AI Act-nieuws, regelgeving, handhaving. 🏗️ klein → [[Fase D — repurposing & ochtendmail]]

## E. Masterclasses & academy

- **W19** — Masterclass-automatisering: inschrijving → betaling → Meet-link → herinneringen → opname-mail, zonder dat Els het aanraakt. 🏗️ → [[Fase E — masterclass-automatisering]]
- **W20** — Cursusplatform (Huddle-vervanging): video's, documenten, automatische toegang na betaling. 🏗️ groot → [[Fase F — academy, betalingen & affiliates]]
- **W21** — Affiliates: pagina's, kortingen per persoon, persoonlijke links. 🏗️ groot → [[Fase F — academy, betalingen & affiliates]]
- **W22** — Licentiemodel (vorm nog open, ❓ aan Els). 🏗️ groot → [[Fase F — academy, betalingen & affiliates]]

## F. Cijfers (KPI-dashboard)

- **W23** — Kern-tegels: omzet, nieuwe leads, conversie, masterclasses, verkoop, cash. 🏗️ gefaseerd (v1 uit eigen data) → [[Fase G — KPI-dashboard Cijfers]]
- **W24** — Marketing: LinkedIn (posts/views/DM's), Instagram (volgers). 🏗️ v2, API's beperkt → handinvoer → [[Fase G — KPI-dashboard Cijfers]]
- **W25** — Nieuwsbrief: verzonden, open rate, click rate, unsubscribe %, nieuwe subscribers. 🏗️ v2 (AC of eigen mail-stats) → [[Fase G — KPI-dashboard Cijfers]], [[Fase H — eigen mailmotor]]
- **W26** — Website: bezoekers, unieke bezoekers, populairste pagina's, herkomst. 🏗️ v2 (Plausible/PostHog) → [[Fase G — KPI-dashboard Cijfers]]
- **W27** — Funnel-KPI: bezoekers → test ingevuld → afgehaakt bij checkout. 🏗️ v1-basis (uit de check) → [[Fase G — KPI-dashboard Cijfers]]
- **W28** — Sales: omzet, orderwaarde, upsell/refund %, supportvragen, masterclasses + conversies, affiliate-uitbetalingen, ROAS. 🏗️ v2 → [[Fase G — KPI-dashboard Cijfers]]
- **W29** — Financieel: omzet, winst, kosten; automatische omzet (Plug&Pay) vs. maatwerktrajecten apart. 🏗️ v2 → [[Fase G — KPI-dashboard Cijfers]]
- **W30** — Tijd: uren naar consultancy/administratie/productontwikkeling/social. 🏗️ (urenregistratie of wekelijkse invoer, ❓ aan Els) → [[Fase G — KPI-dashboard Cijfers]]
- **W31** — Ritmes: maand/kwartaal/jaar-overzichten (content, campagnes, nieuwe producten, omzet/groei, strategie). 🏗️ gefaseerd → [[Fase G — KPI-dashboard Cijfers]]

## Legenda

✅ gebouwd · 🔶 kleine uitbreiding op bestaande bouwstenen · 🏗️ nieuw te bouwen · 🔌 externe integratie nodig · ❓ wacht op beslissing van Els/Chris

## Gerelateerd

- [[Strategie — de Human Margin Method]]
- [[Fase A — content & formats]]
- [[Fase B — Reality Check native]]
- [[Fase G — KPI-dashboard Cijfers]]
- [[Kaders — wat nooit automatisch mag]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase A — content & formats",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §5; scripts/seed/seed-routekaart.ts

Fase A bouwt volledig op wat er al staat: geen nieuwe infrastructuur nodig. Het grootste deel — de CRM-scherpte — is al gebouwd; het contentgedeelte (formats, beeldbank, kennisbank-mappen) staat nog open.

## Doel

CRM-scherpte afronden en de eerste twee vaste contentformats (Leestafel, AI Act in Mensentaal) van inspreken tot concept automatiseren, zonder dat er iets nieuws hoeft te worden opgetuigd.

## Wensen die dit oplost

W1 (inspreken → format), W5 (beeldbank), W13 (licht CRM), W14 (prospectiegroepen), W17 (tweede brein), deels W6 (concepten & kaders). Zie [[Wensenkaart W1–W31]].

## Al gebouwd (✅)

De CRM-scherpte-helft van fase A is al opgeleverd, verspreid over sprint 1 van de gap-index en de MKB-CRM-plan-sprints A-D: doelgroep- en risicoklasse-velden, opvolg-reminders + "Vandaag opvolgen"-blok op Home, tags-UI, "+ Maak deal van deze relatie", adressen/facturatie, beheerbare sectoren/functies, eigen velden (crm-velden), configureerbare kolommen. Zie [[CRM — organisaties, contacten en deals]] voor de details.

## Nog te bouwen (gepland)

- Leestafel- en Mensentaal-formats + een "Transcript → concept"-actie in de contentkalender (W1).
- Beeldbank: AI-tagging bij upload zodat zoeken op bijvoorbeeld "workshop" of "portret" werkt (W5).
- Testimonials-, bronnen- en brand-kit-mappen met conventie in de kennisbank, zodat Dottie en straks Hermes altijd uit de juiste bronnen putten (W17).

## Taken op het bord

Project **"Fase A-rest — Content & formats"**: "Leestafel + Mensentaal-formats + transcript→concept-flow", "Beeldbank: AI-tagging bij upload", "Testimonials-, bronnen- en brand-kit-mappen seeden".

## Afhankelijkheden

Geen — dit is de enige fase die volledig op bestaande bouwstenen bouwt, zonder input van Els of een externe koppeling nodig te hebben.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[CRM — organisaties, contacten en deals]]
- [[Kennisbank & bestanden]]
- [[Content & kalender]]
- [[Fase B — Reality Check native]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase B — Reality Check native",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §5-6; scripts/seed/seed-routekaart.ts

Fase B vervangt Tally en het losse formulier door een eigen check op de site die meteen segmenteert, tagt en een gepersonaliseerd rapport oplevert — de belangrijkste stap in Els's funnel.

## Doel

Leads die de check invullen automatisch labelen (kwadrant aanbieder/gebruiker × zzp/mkb + risiconiveau) en meteen het juiste vervolg geven, zonder Tally.

## Wensen die dit oplost

W8 (Reality Check native), W9 (gepersonaliseerd rapport), W10 (fase 1: via ActiveCampaign), W27-basis (funnel-KPI). Zie [[Wensenkaart W1–W31]].

## Wat er concreet gebouwd wordt

- Vragenflow + scoringslogica als block/route in Payload: circa 10 uitkomsten in het kwadrant aanbieder/gebruiker × zzp/mkb plus risiconiveau (hoog/verboden/geen).
- Automatische contact-creatie in het CRM: elke uitkomst zet doelgroep/risicoklasse/tags op het (nieuwe) contact — landt op de velden die fase A al opleverde.
- Gepersonaliseerd rapport op naam in HM-huisstijl (zelfde motor als W12/[[Fase C — publiek & rapporten]]).
- ActiveCampaign-tag-sync zodat de 7 bestaande mailreeksen (W10) blijven lopen — migreren naar een eigen mailmotor is [[Fase H — eigen mailmotor]].

## Afhankelijkheden

**Wacht op input van Els**: een nieuwe naam voor de check en de vragen + 10 uitkomstteksten (inhoudelijk anders dan aicompliancehub.nl/scanner). Beide staan als checklist-item in de taak "8 vragen beantwoorden (braindump §6)" in project **"Input van Els (blokkeert fase B/D/F)"** op het bord.

## Taken op het bord

Project **"Fase B — Reality Check native"**: "Vragenflow + scoringslogica (kwadrant × risico, 10 uitkomsten)", "Automatische contact-creatie + CRM-tags vanuit de check", "Gepersonaliseerd rapport op naam (rapport-motor)", "ActiveCampaign-tag-sync (7 bestaande reeksen blijven lopen)".

## Status

**(gepland)** — nog niet gebouwd, wacht op Els's input.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Fase C — publiek & rapporten]]
- [[Fase H — eigen mailmotor]]
- [[CRM — organisaties, contacten en deals]]
- [[Kaders — wat nooit automatisch mag]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase C — publiek & rapporten",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §5; scripts/seed/seed-routekaart.ts

Fase C zet de kennisbank publiek (AI Act in Mensentaal op de site) en bouwt de rapport-generator die fase B ook nodig heeft.

## Doel

De bestaande "zichtbaarheid: publiek"-optie in de kennisbank écht laten renderen op de site, en een herbruikbare rapport-motor bouwen voor gepersonaliseerde en GPT-rapporten.

## Wensen die dit oplost

Mensentaal publiek (bij W17), W12 (GPT-rapport → huisstijl). Zie [[Wensenkaart W1–W31]].

## Wat er concreet gebouwd wordt

- Publieke kennisbank-rendering: het veld \`zichtbaarheid: publiek\` bestaat al in het schema (zie [[Kennisbank & bestanden]]); wat ontbreekt is de rendering + navigatie op de site zelf — dit wordt "AI Act in Mensentaal" op humanmargin.eu, met dezelfde blocks-architectuur als de rest van de publieke site (zie [[Site & CMS]]).
- GPT-rapport-generator: gestileerd HTML-template in HM-huisstijl + PDF-export. Input is de output van Els's custom GPT (AI Act-risicoklassificatie), die zij plakt of uploadt na eigen review; het rapport wordt gekoppeld aan de organisatie in het CRM.
- Beide onderdelen zijn losstaand bruikbaar: de publieke kennisbank-rendering kan zonder de rapport-generator al live, en andersom.

## Afhankelijkheden

Deelt de rapport-motor met [[Fase B — Reality Check native]] (W9) — bouwt daar dus inhoudelijk op voort. Geen aparte blokkade van Els nodig; kan zodra fase B's rapport-motor er is.

## Taken op het bord

Project **"Fase C — Publiek + rapporten"**: "Publieke kennisbank-rendering (AI Act in Mensentaal op de site)", "GPT-rapport-generator in huisstijl + PDF-export".

## Status

**(gepland)**.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Fase B — Reality Check native]]
- [[Kennisbank & bestanden]]
- [[Site & CMS]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase D — repurposing & ochtendmail",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §5-6; scripts/seed/seed-routekaart.ts

Fase D hergebruikt opnames tot content en scant dagelijks het AI Act-nieuws — de twee grootste tijdvreters uit de kernpijn.

## Doel

Van elke opname (podcast/masterclass) automatisch bruikbare content maken, en Els elke ochtend een kant-en-klare samenvatting van wat er speelt rond AI/AI Act geven.

## Wensen die dit oplost

W2 (repurposing-motor), W7 (transcriptie + shownotes), W18 (ochtendmail). Zie [[Wensenkaart W1–W31]].

## Wat er concreet gebouwd wordt

- TLDV-koppeling: opname → transcript (via de TLDV-API) → shownotes-document in de kennisbank + mail-concept naar aanwezigen (W7).
- Repurposing-pipeline: Dottie/Hermes genereren uit transcripten content-items in status idee/concept (snippets, social posts, blog, nieuwsbrief-items) — zie [[Content & kalender]]. Videoknippen zelf (W3) blijft extern (Descript/Opus Clip e.d.); wij leveren de tijdcodes en teksten.
- Dagelijkse ochtendmail: cron-agent scant een vaste bronnenlijst (regelgeving, handhaving, nieuwe richtsnoeren, nieuws, AI-fuck-ups, papers, trendrapporten) → samenvatting in Els's format → mail (Resend) + archief in de kennisbank.

## Afhankelijkheden

TLDV-koppeling en de repurposing-pipeline hebben geen open vraag. De ochtendmail **wacht op input van Els**: de vaste bronnenlijst (welke sites/nieuwsbrieven/instanties ze nu volgt) — checklist-item in de taak "8 vragen beantwoorden (braindump §6)" in project **"Input van Els (blokkeert fase B/D/F)"**.

## Taken op het bord

Project **"Fase D — Repurposing & ochtendmail"**: "TLDV-koppeling: transcript + shownotes automatisch", "Repurposing-pipeline: opname → snippets/posts/blog/nieuwsbrief", "Dagelijkse ochtendmail: bronnen-scan + samenvatting".

## Status

**(gepland)**.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Fase E — masterclass-automatisering]]
- [[Content & kalender]]
- [[Hermes Agent]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase E — masterclass-automatisering",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §5; scripts/seed/seed-routekaart.ts

Fase E maakt de hele masterclass-flow — inschrijving tot opname-mail — "volledig zonder dat ik het aanraak" (Els's eigen woorden).

## Doel

Registratie, betaling, Meet-link, herinneringen en de nazorg (opname + shownotes) volledig automatiseren.

## Wensen die dit oplost

W19 (masterclass-automatisering). Zie [[Wensenkaart W1–W31]].

## Wat er concreet gebouwd wordt

- Registraties-collectie gekoppeld aan een eerste betaalstap (Mollie) → automatische mail met Meet-link + herinnerings-crons vóór de masterclass.
- Na afloop: TLDV-transcript → opname-mail met shownotes naar alle aanwezigen (bouwt op de TLDV-koppeling van [[Fase D — repurposing & ochtendmail]]).
- Nu nog handmatig: Google Meet of tools van partners; WebinarGeek is overwogen maar wordt **niet** aangeschaft — dit bouwen we zelf op Meet, wat ook meteen de licentiekosten van WebinarGeek vermijdt.
- Deze fase levert de eerste concrete betaalflow van het hele platform (Mollie); die infrastructuur wordt in [[Fase F — academy, betalingen & affiliates]] hergebruikt voor de bredere academy.

## Afhankelijkheden

Bouwt op [[Fase D — repurposing & ochtendmail]] (de transcript-infrastructuur) en op de eerste betaalstap (Mollie) — Els's akkoord op Mollie als betaalprovider staat als open vraag in de taak "8 vragen beantwoorden (braindump §6)".

## Taken op het bord

Project **"Fase E — Masterclass-automatisering"**: "Registratie + betaling → Meet-link + herinnerings-mails", "Opname-mail + shownotes naar aanwezigen na afloop".

## Status

**(gepland)**.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Fase D — repurposing & ochtendmail]]
- [[Fase F — academy, betalingen & affiliates]]
- [[Integratie-landschap]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase F — academy, betalingen & affiliates",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §3, §5; scripts/seed/seed-routekaart.ts

De grootste fase: een eigen academy-module die Huddle én Plug&Pay vervangt, met betalingen, affiliates en een licentiemodel.

## Doel

AICK Core + sector packs + AVG-module als producten aanbieden, met eigen video-hosting, automatische toegang na betaling, affiliates en een licentiemodel — Huddle en Plug&Pay opzeggen.

## Wensen die dit oplost

W20 (cursusplatform), W21 (affiliates), W22 (licentiemodel). Zie [[Wensenkaart W1–W31]] en [[Strategie — de Human Margin Method]].

## Wat er concreet gebouwd wordt

- Productenmodel: AICK Core, sector packs (fotografen, recruiters, VA's, finance, makelaars), waarschijnlijk een AVG-module; video's via Bunny/Mux-hosting; documenten via de publieke kennisbank.
- Mollie-betalingen → automatische account + toegang: wie op de salespagina betaalt, krijgt meteen login — dezelfde kracht die Plug&Pay↔Huddle nu al hebben.
- Affiliates: persoonlijke links, kortingscodes per persoon, attributie en een uitbetaaloverzicht — dé reden voor de dure Plug&Pay-licentie vandaag.
- Licentiemodel-architectuur: "toegang" wordt los van "gebruiker" gemodelleerd zodat multi-seat/deelbare licenties later passen — de precieze vorm is nog een open vraag.

## Afhankelijkheden

**Wacht op input van Els**: voor wie het licentiemodel is (partners? bedrijven met meerdere medewerkers?) — open vraag in project "Input van Els (blokkeert fase B/D/F)". Bouwt daarnaast op de betaal-infrastructuur van [[Fase E — masterclass-automatisering]] (eerste Mollie-stap).

## Taken op het bord

Project **"Fase F — Academy, betalingen & affiliates"**: "Productenmodel + video-hosting (AICK Core, sector packs, AVG)", "Mollie-betalingen → automatische account + toegang", "Affiliates: persoonlijke links, kortingen, attributie, uitbetaling", "Licentiemodel-architectuur (toegang los van gebruiker)".

## Structurele besparing

Bij volledige uitvoering (incl. Huddle, Plug&Pay, Tally, Canbox en het vermeden WebinarGeek): circa **€2.000+/jaar**, plus twee WordPress-hostings.

## Status

**(gepland)**.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Strategie — de Human Margin Method]]
- [[Fase E — masterclass-automatisering]]
- [[Fase G — KPI-dashboard Cijfers]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase G — KPI-dashboard Cijfers",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §2, §5; scripts/seed/seed-routekaart.ts

Een nieuwe view "Cijfers" met tegels per ritme (maand/kwartaal/jaar) — de enige fase die grotendeels parallel aan de rest kan starten.

## Doel

Els inzicht geven in omzet, marketing, funnel, sales, financiën en tijd, opgebouwd uit wat het platform al weet plus (later) API-koppelingen.

## Wensen die dit oplost

W23 t/m W31 (alle cijfer-wensen). Zie [[Wensenkaart W1–W31]].

## Wat er concreet gebouwd wordt

- **v1 (eigen data + handinvoer):** pipeline/deals als omzetprognose, funnel-events uit de Reality Check, content-aantallen, plus wekelijkse handinvoer voor social en tijd.
- **v2 (API's):** Mollie/Plug&Pay (omzet, gemiddelde orderwaarde, refunds), ActiveCampaign of eigen mail-stats, website-analytics (Plausible/PostHog), academy-afrondingen.
- LinkedIn/Instagram organic-stats-API's zijn zeer beperkt — daar blijft handmatige of halfautomatische invoer de realistische weg; het dashboard belooft daar bewust niets meer dan dat.

## Afhankelijkheden

Elk blok wordt rijker naarmate [[Fase B — Reality Check native]], [[Fase E — masterclass-automatisering]] en [[Fase F — academy, betalingen & affiliates]] landen. Tijd-KPI's (W30) wachten op Els's antwoord: écht uren bijhouden of is een wekelijkse schatting genoeg? — open vraag in project "Input van Els (blokkeert fase B/D/F)".

## Taken op het bord

Project **"Fase G — KPI-dashboard Cijfers"**: "Cijfers-view v1: eigen data + handinvoer-tegels", "Cijfers v2: API-koppelingen (betalingen, mail-stats, analytics)".

## Status

**(gepland)** — v1 kan al starten, gaandeweg gevuld naarmate andere fases landen.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Fase B — Reality Check native]]
- [[Fase F — academy, betalingen & affiliates]]
- [[Integratie-landschap]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Fase H — eigen mailmotor",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §3, §5; scripts/seed/seed-routekaart.ts

Een optionele, laatste stap: mailreeksen en nieuwsbrief volledig in eigen beheer, zodat ActiveCampaign opgezegd kan worden.

## Doel

W10 en W25 volledig zelf bouwen — reeks-editor, nieuwsbrief en mail-stats — zonder ActiveCampaign.

## Wensen die dit oplost

W10 (volledig, na de fase-1-tag-sync in [[Fase B — Reality Check native]]), W25 (nieuwsbrief-cijfers). Zie [[Wensenkaart W1–W31]].

## Wat er concreet gebouwd wordt

Een automation-module met wachtrij/cron en een reeks-editor in het dashboard, plus eigen nieuwsbrief-verzending en -statistieken (verzonden, open rate, click rate, unsubscribe %, nieuwe subscribers — voedt [[Fase G — KPI-dashboard Cijfers]]). De transactionele flows (funnelmails, toegang, herinneringen) blijven — net als nu — volautomatisch; dat is de enige uitzondering op het kader "niets automatisch versturen" (zie [[Kaders — wat nooit automatisch mag]]). De zeven bestaande opvolgmailreeksen (W10) worden hierbij één-op-één overgezet, niet opnieuw ontworpen — het risico zit in de migratie, niet in het concept. Zodra deze fase draait, kan het maandelijkse ActiveCampaign-abonnement worden opgezegd — de laatste besparing uit de toolstack-analyse.

## Afhankelijkheden

Optioneel, en pas verstandig als [[Fase B — Reality Check native]] stabiel draait — eerst bewijzen dat de nieuwe check + tag-sync werkt, dan pas migreren weg van ActiveCampaign.

## Taken op het bord

Project **"Fase H — Eigen mailmotor (optioneel)"**: "Reeks-editor + nieuwsbrief + eigen mail-stats (Resend)".

## Status

**(gepland, optioneel)**.

## Gerelateerd

- [[Wensenkaart W1–W31]]
- [[Fase B — Reality Check native]]
- [[Fase G — KPI-dashboard Cijfers]]
- [[Integratie-landschap]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "CRM-afronding (gap-index)",
    tags: ["wiki", "roadmap"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-crm-gap-index.md; scripts/seed/seed-routekaart.ts

De resterende CRM-sprints uit de gap-index (na sprint 1 en het MKB-CRM-plan) — vooral gericht op import en schaal, niet op nieuwe velden.

## Al gebouwd

Sprint 1 (2026-07-09): opvolg-reminders, "+ Maak deal van deze relatie", risicoklasse-veld, tags-UI. MKB-CRM-plan sprints A-D: adressen/facturatie, contactbeheer vanuit het org-paneel, beheerbare sectoren/functies, eigen velden (crm-velden + extraVelden-json), configureerbare kolommen per tab, sorteren, laatste-contact-kolom. Zie [[CRM — organisaties, contacten en deals]] voor de velden zelf.

## Sprint 2 — import & dedupe (hoog)

- **CSV/Excel-import** met kolom-mapping van prospectlijsten (Pipedrive-import-stijl) — nodig vóórdat Els grootschalige outreach start.
- **Dubbel-detectie & samenvoegen** (zelfde e-mail/naam) — wordt pas echt belangrijk zódra de import er is.

## Sprint 3 — bulk, lijsten, forecast, DM-capture

- **Bulk-acties** op de relatielijst: selectie → type/doelgroep/eigenaar wijzigen, taggen, verwijderen (multi-select-patroon uit de kennisbank is herbruikbaar).
- **Opgeslagen lijsten/views**: naam + filterset bewaren (bijvoorbeeld "Fotografen MKB — nog benaderen").
- **Deals-lijstweergave + forecast** naast het kanban (de segmented control staat al in het ontwerp).
- **LinkedIn DM quick-capture** (W15 v1): snel iemand + notitie + opvolgdatum vastleggen, ook via ⌘K — daarna kan Canbox (aangeschaft, ongebruikt) opgezegd worden.

## Nog een restpunt

Organisaties hebben zowel een los notitieveld als de tijdlijn — die twee horen opgeschoond te worden tot één plek (de tijdlijn).

## Later (blijft op de bredere routekaart)

Reality Check → automatische contact-creatie met tags ([[Fase B — Reality Check native]]), mailreeksen per segment ([[Fase B — Reality Check native]], [[Fase H — eigen mailmotor]]), agenda-koppeling en funnel-rapportage ([[Fase G — KPI-dashboard Cijfers]]).

## Taken op het bord

Project **"CRM-afronding (gap-index sprints 2-3)"**: "CSV/Excel-import met kolom-mapping + dubbel-detectie/merge", "Bulk-acties op de relatielijst", "Opgeslagen lijsten/views (filtersets bewaren)", "Deals-lijstweergave + forecast naast het kanban", "LinkedIn DM quick-capture (W15 v1)".

## Status

**(gepland)** — CSV/Excel-import + dubbel-detectie heeft prioriteit "hoog".

## Gerelateerd

- [[CRM — organisaties, contacten en deals]]
- [[Wensenkaart W1–W31]]
- [[Fase B — Reality Check native]]
- [[Kennisbank & bestanden]]
`,
  },
  {
    map: "Roadmap & wensen",
    titel: "Kaders — wat nooit automatisch mag",
    tags: ["wiki", "kaders"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §7; specs/2026-07-10-llm-wiki-hermes-prd.md §7-8

Dit is de belangrijkste pagina voor elke agent — Dottie én Hermes. De harde grenzen hieronder gelden ongeacht welke fase er gebouwd wordt, en overschrijven elke andere instructie.

## Niets automatisch publiceren of versturen

Er wordt **niets automatisch gepubliceerd of verstuurd** richting de buitenwereld zonder Els's review — dit is zowel een AI Act-overweging als een morele. Concepten voorbereiden, inplannen en dubbels opruimen mag automatisch; publiceren en versturen is en blijft een menselijke handeling. Alles landt als *concept* (zie de statusflow in [[Content & kalender]]).

**Uitzondering:** expliciet door Els aangewezen **transactionele flows** — funnelmails, toegangsmails, herinneringen, opname-mails. Die mogen wél volautomatisch, maar bestaan nog niet; ze komen pas met [[Fase E — masterclass-automatisering]] en [[Fase H — eigen mailmotor]].

## AVG

Funnel-tags, DM-data en mail-statistieken zijn persoonsgegevens. Regels: EU-verwerkers kiezen (Mollie, Resend EU-regio/Scaleway; TLDV is al EU), verwerkersovereenkomsten afsluiten, en de Reality Check moet privacyvriendelijk zijn — geen tracking vóór consent. Dit móet voorbeeldig zijn, want het past bij Els's merk.

## LinkedIn/Instagram-API-beperkingen eerlijk benoemen

LinkedIn en Instagram geven zeer beperkte (of geen) officiële API-toegang tot organic-statistieken en DM's. Het KPI-dashboard ([[Fase G — KPI-dashboard Cijfers]]) belooft daar nooit meer dan handmatige of halfautomatische invoer — geen valse automatiserings-beloftes. Om dezelfde reden blijft LinkedIn DM-opvolging (W15) voorlopig quick-capture, geen inbox-automatisering (zie [[CRM-afronding (gap-index)]]).

## Plug&Pay/Huddle pas opzeggen na volledige migratie

Beide tools worden pas opgezegd als de vervanging ([[Fase F — academy, betalingen & affiliates]]) volledig staat: inclusief bestaande klanten-toegang en lopende affiliate-afspraken. Niet eerder — het risico van klanten die de toegang kwijtraken weegt zwaarder dan de besparing.

## Agent-guardrails (gelden bovenop het bovenstaande)

- Alleen **soft-delete** (trash); nooit permanent verwijderen.
- **Geen persoonsgegevens van klanten/contacten** in wiki-pagina's — persoonsgegevens horen in CRM-records, niet in de wiki (de wiki zelf blijft bovendien altijd intern).
- Bij twijfel: **stoppen en vragen**, niet gokken — een vraag-activity + taak naar "Heeft mij nodig" (zie [[In-the-loop OS (agent-queue)]]).
- **Alles loggen**: elke wijziging krijgt een log-activity, zodat de tijdlijn altijd laat zien wie wat wanneer deed.

## Gerelateerd

- [[Strategie — de Human Margin Method]]
- [[Hermes Agent]]
- [[Dottie (sessie-agent)]]
- [[In-the-loop OS (agent-queue)]]
- [[Content & kalender]]
- [[Fase G — KPI-dashboard Cijfers]]
`,
  },
  {
    map: "Agents",
    titel: "Hermes Agent",
    tags: ["wiki", "agent", "hermes"],
    markdown: `**Laatst bijgewerkt:** 2026-07-13 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-10-llm-wiki-hermes-prd.md §5, §4.5, §6; Hostinger API (live-inventaris 2026-07-13)

Hermes Agent is Human Margin's autonome onderhouds- en automatiseringsagent — deze pagina is zijn bootstrap-document: de eerste leesopdracht bij élke run.

## Identiteit

Hermes Agent is de autonome onderhouds- en automatiseringsagent van Human Margin. Hij draait op een **VPS met een dagelijkse cron** en handelt in het dashboard als de user \`hermes@humanmargin.eu\` (rol **teamlid**) — hetzelfde gebruikerspatroon als de Dottie-user, inclusief attributie en tijdlijn-logging bij elke actie. De VPS bestaat sinds 2026-07-10 echt en draait Hostinger's Hermes Agent-omgeving in Docker — machine, toegang en aandachtspunten staan op [[Hostinger VPS (Hermes-host)]].

## Toegang

- **REST API** van deze app als enige toegangsweg — zodra de Vercel-deploy live is (harde afhankelijkheid van fase 2, zie Status).
- **Authenticatie:** \`Authorization: users API-Key <key>\`. De key leeft alléén in de VPS-omgevingsvariabelen — **nooit** in de wiki, de repo of een log; roteerbaar door in de admin een nieuwe key te genereren.
- **Markdown-endpoints:** \`GET/PATCH /api/wiki/:id/md\` (gebouwd) — Hermes leest en schrijft wiki-pagina's als platte markdown; de app converteert server-side naar/van Lexical.
- **Verbod:** rechtstreekse toegang tot de Neon-database is niet toegestaan — dat omzeilt hooks, access-regels en de tijdlijn. Alles loopt via de app.

## Tools

**Wiki-toolset (MCP, fase 2):** \`wiki_index\`, \`wiki_lees(id|titel)\`, \`wiki_schrijf(id, markdown)\`, \`wiki_nieuw(titel, parent, markdown)\`, \`wiki_zoek(term)\`, \`wiki_log(samenvatting)\`. Later **(gepland)** board-tools zoals \`taak_queue\`/\`taak_comment\` voor de Els-automatiseringen.

**Graphify's eigen MCP-server** (over \`graph.json\`, fase 1b/2): \`query_graph\`, \`get_neighbors\`, \`shortest_path\`, \`god_nodes\`, \`get_community\`. Vuistregel: de **graph** voor "hoe hangt alles samen", de **wiki** voor "wat is er waar" — zie [[Second Brain]].

## Vaste taken (het dagelijkse draaiboek)

1. **Bootstrap:** lees deze pagina → [[_Schema — zo werkt deze wiki]] → [[Index]] → de laatste 10 log-activities.
2. **Delta-scan** via REST (alles met \`updatedAt\` sinds de vorige run): taken/projecten (roadmap-voortgang), crm-velden/sectoren/functies/kolom-collecties, knowledge-docs buiten de wiki, activities (beslissingen in comments).
3. **Ingest** van de delta's in de betreffende pagina's + de Index.
   **3b. Second Brain verversen:** gewijzigde docs als markdown naar het corpus, \`graphify --update\`, \`graph.json\` + rapport terug-uploaden.
4. **Lint-pass** (roterend, 1x per week volledig) — de 6-punts checklist uit [[_Schema — zo werkt deze wiki]].
5. **Agent-queue check:** taken in "Ready (agent)" toegewezen aan Hermes, volgens [[In-the-loop OS (agent-queue)]].
6. **Log-activity** met de samenvatting van de run. Bij onduidelijkheid: een vraag-activity + taak naar "Heeft mij nodig" — nooit gokken.

## Toekomstige taken (gepland)

- **Dagelijkse ochtendmail** (W18) → [[Fase D — repurposing & ochtendmail]]
- **Repurposing-pipeline** (W2/W7) → [[Fase D — repurposing & ochtendmail]]
- **Masterclass-flow-bewaking** (W19) → [[Fase E — masterclass-automatisering]]
- **KPI-verversing** → [[Fase G — KPI-dashboard Cijfers]]
- **Board-taken** via de agent-queue, zodra er automatiseringen op het bord landen.

## Guardrails

De kaders van Els gelden voor Hermes als harde regels (volledige tekst: [[Kaders — wat nooit automatisch mag]]): nooit iets publiceren of versturen naar de buitenwereld zonder Els's review (uitzondering: expliciet aangewezen transactionele flows — die nog niet bestaan); alleen soft-delete, nooit permanent verwijderen; geen persoonsgegevens in wiki-pagina's; bij twijfel stoppen en vragen via "Heeft mij nodig"; alles loggen.

## Status

Fase 1 (deze release) levert alleen de infrastructuur en dit bootstrap-document op. Hermes zelf komt pas live in **fase 2**, met een harde afhankelijkheid van de Vercel-deploy (zonder publiek bereikbare app-URL kan de VPS nergens heen). Tot die tijd doet Dottie al het wiki-onderhoud (zie [[Dottie (sessie-agent)]]).

## Gerelateerd

- [[Hostinger VPS (Hermes-host)]]
- [[_Schema — zo werkt deze wiki]]
- [[Index]]
- [[In-the-loop OS (agent-queue)]]
- [[REST & Local API — recepten]]
- [[Kaders — wat nooit automatisch mag]]
- [[Second Brain]]
- [[Fase A — content & formats]]
- [[Fase B — Reality Check native]]
- [[Fase C — publiek & rapporten]]
- [[Fase D — repurposing & ochtendmail]]
- [[Fase E — masterclass-automatisering]]
- [[Fase F — academy, betalingen & affiliates]]
- [[Fase G — KPI-dashboard Cijfers]]
- [[Fase H — eigen mailmotor]]
`,
  },
  {
    map: "Agents",
    titel: "Dottie (sessie-agent)",
    tags: ["wiki", "agent", "dottie"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-10-llm-wiki-hermes-prd.md §4.4; CLAUDE.md

Dottie is de AI-partner die in Claude Code-sessies aan dit platform bouwt — ze ziet zowel de code als de draaiende runtime, en is de eerste (en tot fase 2 de enige) onderhouder van deze wiki.

## Wie Dottie is

Dottie is de sessie-identiteit van de assistent die in Claude Code aan de Human Margin-codebase werkt (vastgelegd in CLAUDE.md). Ze ziet de repo (specs, schema's, commits, skills) én — via de Local API — de draaiende runtime (board, collecties, activities). Dat maakt haar zichtlijn breder dan die van Hermes, die alleen de runtime ziet.

## Hoe ze werkt

- Handelt in het dashboard als user \`dottie@humanmargin.eu\` (rol teamlid) via de **Local API**, met \`overrideAccess: false\` en expliciete \`user\`-attributie — elke actie krijgt een naam op de tijdlijn.
- Werkt volgens het **in-the-loop OS**: taken in "Ready (agent)" oppakken, bij onduidelijkheid nooit gokken maar een genummerde vraag stellen en de kaart naar "Heeft mij nodig" verplaatsen (zie [[In-the-loop OS (agent-queue)]]).
- Heeft een **skills-onderhoudsplicht**: wijzigt ze blocks, schema, tooling of conventies, dan werkt ze in dezelfde sessie de betreffende skill (\`.claude/skills/\`) bij.

## Haar wiki-plicht

Dezelfde onderhoudsplicht geldt voor de wiki: **feature opgeleverd = wiki bijgewerkt (ingest) + log**. Een bouw-sessie die een collectie, hook of werkblad wijzigt, werkt in dezelfde sessie de betreffende wiki-pagina('s) bij — feature-pagina, module-pagina, de Index, eventueel de fase-pagina — en schrijft een log-activity op de wiki-root. Dit staat vastgelegd in CLAUDE.md en de dashboard-skill.

## Domeinverdeling met Hermes

| | Dottie | Hermes |
|---|---|---|
| Bron | de repo (code, specs, commits) | de REST API (runtime) |
| Schrijft | feature-pagina's bij oplevering | statusvoortgang, lint-fixes, dagelijkse log |
| Conflictregel | **code-feiten winnen** van runtime-observaties | bij twijfel niet overschrijven, maar een vraag-activity + taak "Heeft mij nodig" |

Beiden loggen elke wijziging met dezelfde prefix-conventie (\`[ingest|lint|query]\`), zodat de tijdlijn altijd laat zien wie wat wanneer aanpaste.

## Gerelateerd

- [[Hermes Agent]]
- [[_Schema — zo werkt deze wiki]]
- [[In-the-loop OS (agent-queue)]]
- [[Index]]
- [[Kaders — wat nooit automatisch mag]]
`,
  },
  {
    map: "Agents",
    titel: "Hostinger VPS (Hermes-host)",
    tags: ["wiki", "agent", "hermes", "infra"],
    markdown: `**Laatst bijgewerkt:** 2026-07-13 door Dottie · **Status:** actueel · **Bronnen:** Hostinger API (live-inventaris 2026-07-13); skill humanmargin-hostinger

De fysieke machine achter [[Hermes Agent]]: een Hostinger-VPS van Els, die Dottie via de Hostinger API van buitenaf kan inspecteren en — met toestemming van Chris — beheren.

## De machine

- **VPS \`1819178\`** — plan KVM 2: 2 vCPU, 8 GB RAM, 100 GB disk, 8 TB bandbreedte; datacenter **Frankfurt**; template "Ubuntu 24.04 with Docker and Traefik"; draait sinds 2026-07-10.
- **Adres:** \`srv1819178.hstgr.cloud\` (hostname + PTR), IPv4 \`187.124.188.147\`, IPv6 \`2a02:4780:79:f36d::1\`.

## Wat erop draait (Docker)

- **\`hermes-agent-7zmf\`** — Hostinger's eigen Hermes Agent-omgeving (image \`ghcr.io/hostinger/hvps-hermes-agent\`), web-UI via Traefik op \`https://hermes-agent-7zmf.srv1819178.hstgr.cloud\` (Let's Encrypt). Inloggegevens leven uitsluitend in de \`.env\` op de VPS — nooit in wiki, repo of logs.
- **\`traefik\`** — reverse proxy op poort 80/443 (host-network), HTTP→HTTPS-redirect, automatische certificaten.

## Beheer & toegang

- **Hostinger API** (Dottie): vijf MCP-servers (vps/domains/dns/billing/hosting) met local scope op Chris's machine, plus een curl-fallback. De API ziet ook de Docker-laag (projecten, containers, logs, compose). Details, werkregels en gotchas: skill \`humanmargin-hostinger\` in de repo.
- **Werkregel:** read-only vrij; elke mutatie (reboot, restore, firewall, DNS, billing) eerst langs Chris — dit is productie-infra, zie [[Kaders — wat nooit automatisch mag]].
- **SSH:** root-wachtwoord op 2026-07-13 via hPanel gezet; er zijn geen SSH-keys via de API geregistreerd.

## Vangnet & geld

- Automatische backups aanwezig (restore ±30 minuten); er is geen snapshot.
- Abonnement KVM 2: **$275,88 per jaar (USD)**, auto-renew aan, volgende afschrijving **2027-06-26**.

## Aandachtspunten (stand 2026-07-13)

- **Geen firewall**: alle poorten staan open, inclusief SSH (22) en de direct gepubliceerde Hermes-containerpoort 32768 (zonder TLS, buiten Traefik om).
- Monarx-malwarescanner is niet geïnstalleerd.
- **humanmargin.eu staat bij WPProvider, niet bij Hostinger** — als Hermes ooit op een eigen (sub)domein moet, loopt die DNS-wijziging buiten Hostinger om. In het account ligt nog een ongebruikt gratis-domein-tegoed.

## Gerelateerd

- [[Hermes Agent]]
- [[Integratie-landschap]]
- [[Kaders — wat nooit automatisch mag]]
`,
  },
];
