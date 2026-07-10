/**
 * Wiki-contentpack — kern (root) + map "Werkbladen" (11 pagina's).
 *
 * Geen seed-logica: alleen content. `scripts/seed/seed-wiki.ts` (T5) leest
 * `PAGINAS` uit dit bestand (en de andere content-packs) en zet ze via de
 * Local API in `knowledge-docs` neer.
 *
 * Bronnen: .claude/skills/humanmargin-dashboard/SKILL.md;
 * docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md;
 * docs/handleiding-els-dashboard.md; CLAUDE.md.
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
    map: null,
    titel: "_Schema — zo werkt deze wiki",
    tags: ["wiki", "schema"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md §1, §4

Dit is het conventiedocument voor elke agent die aan deze wiki werkt — Dottie in bouwsessies, Hermes straks op de VPS. Lees deze pagina als eerste bij elke wiki-taak: ze legt vast wat de wiki is, hoe een pagina eruitziet, welke vier operaties er bestaan, wie wat mag schrijven en welke regels nooit wijken.

## Wat deze wiki is

- **Persistent, compounderend, geen RAG.** De wiki wordt niet per vraag opnieuw afgeleid uit bronnen; ze wordt één keer geschreven en daarna bijgehouden. Kruisverwijzingen tussen pagina's en het onderscheid gebouwd/gepland bestaan al in de tekst in plaats van steeds opnieuw uitgezocht te worden.
- **Waar ze leeft.** De wiki is de map "Platform-wiki" in de bestaande kennisbank (\`knowledge-docs\`) — géén nieuwe collectie. Pagina's zijn documenten (\`soort: document\`), submappen zijn \`soort: map\`. Alles wat de kennisbank al kan (boom, zoeken, prullenbak, tags, tijdlijn, referenties) geldt automatisch, ook voor deze wiki.
- **Drie lagen.** Ruwe bronnen (repo: specs, skills, handoffs; runtime: het board, de collecties) zijn onveranderlijk. De wiki is waar agents schrijven en mensen lezen. Dit schema-document is de laag die daarbovenop discipline afdwingt.
- **Twee schrijvers, verschillende zichtlijn.** Dottie ziet de code (repo); Hermes ziet de runtime (REST API). Zie de domeinverdeling verderop.

## Paginaformaat

- Elke pagina begint met een kopblok: **Laatst bijgewerkt:** datum door wie · **Status:** actueel/verouderd/concept · **Bronnen:** korte bronvermelding (bv. skillnaam of specpad).
- Daarna: één alinea samenvatting, dan \`##\`-secties met de feitelijke inhoud, afgesloten met \`## Gerelateerd\` en 2-6 links naar andere pagina's.
- Wiki-links altijd tussen dubbele vierkante haken om de exacte titel van een pagina uit de canonieke structuur — bijvoorbeeld [[Index]]. Een typefout maakt er een dode link van; de lint-pass rapporteert die.
- Alleen markdown-basics: koppen, vet/cursief, lijsten, links, blockquote, code, simpele tabellen. Geen complexe tabellen, geen afbeeldingen, geen HTML.
- **Gebouwd vs. gepland altijd expliciet.** Wat nu bestaat beschrijf je als feit; toekomstige features krijgen het label **(gepland — fase X)** met een link naar de bijbehorende fase-pagina.
- Geen persoonsgegevens van klanten of contacten in wiki-pagina's — die horen in CRM-records, niet hier.

## De vier operaties

### Ingest

Nieuwe kennis verwerken: een opgeleverde feature, een nieuwe spec, een board-wijziging, een beslissing van Els of Chris. Eén ingest raakt typisch 3-10 pagina's: de feature-pagina zelf, de bijbehorende module-pagina, [[Index]], eventueel een fase-pagina, en de [[Hermes Agent]]-node als er een nieuwe tool bijkomt. Status gebouwd/gepland bijwerken waar nodig, Index bijwerken, log-activity schrijven.

### Query

Vragen beantwoorden begint bij [[Index]], dan doorklikken naar de relevante pagina's. Antwoorden met blijvende waarde — vergelijkingen, analyses, beslissingen — worden zelf een wiki-pagina in plaats van te verdampen in een chat of mail.

### Lint (wekelijks, Hermes)

Checklist van zes punten:

1. Tegenspraak tussen pagina's.
2. "Gepland" dat inmiddels gebouwd is (board-status vs. wiki-status).
3. Onopgeloste wiki-links naar pagina's die nog niet bestaan (zichtbaar als platte tekst met dubbele haken).
4. Wees-pagina's zonder inkomende links.
5. Kopblok-datums ouder dan 30 dagen op kernpagina's.
6. Gaten: een concept wordt genoemd maar heeft geen eigen pagina.

Bevindingen worden een log-activity op de wiki-root; grotere reparaties worden een taak op het bord in "Ready (agent)" of "Heeft mij nodig" (zelfde discipline als [[In-the-loop OS (agent-queue)]]).

### Log

Elke run of wijziging krijgt precies één activity op de wiki-root (de map "Platform-wiki"): type "log", samenvatting met prefix \`[ingest|lint|query]\` — wat, waarom, welke pagina's geraakt. De prefix maakt het logboek filterbaar via de API en vervangt Karpathy's append-only \`log.md\`-bestand: activities zijn van nature append-only en al queryable (\`sort=-happensAt\`), zichtbaar als tijdlijn op de wiki-root in de bestaande UI. Zie [[Tijdlijn & activities]].

## Domeinverdeling: Dottie versus Hermes

| | Dottie (sessies) | Hermes (VPS-cron, **gepland — fase 2**) |
|---|---|---|
| Ziet | de code: repo, specs, schema's, skills | de runtime: board, collecties, activities via REST |
| Schrijft | feature-pagina's bij oplevering (bouw-sessie = wiki-update) | statusvoortgang (board→fase-pagina's), lint-fixes, dagelijkse log |
| Bij twijfel | codefeit wint van runtime-observatie | niet overschrijven — vraag-activity + taak "Heeft mij nodig" |

Beiden loggen met dezelfde prefix-conventie, dus de tijdlijn op de wiki-root laat altijd zien wie wat wanneer aanpaste.

## Regels die nooit wijken

- Gebouwd vs. gepland altijd expliciet onderscheiden — nooit een geplande feature beschrijven alsof ze al werkt.
- Geen persoonsgegevens van klanten of contacten in pagina's.
- De wiki blijft **intern** (zichtbaarheid: intern); niets hierin wordt zonder expliciete review publiek.
- Rechtstreekse databasetoegang is verboden voor elke agent — alles loopt via de Local API (Dottie) of de REST API (Hermes), zodat hooks, access en tijdlijn intact blijven.

## Gerelateerd

- [[Index]]
- [[Hermes Agent]]
- [[Dottie (sessie-agent)]]
- [[Tijdlijn & activities]]
- [[Kaders — wat nooit automatisch mag]]`,
  },
  {
    map: null,
    titel: "Index",
    tags: ["wiki", "index"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md §3

Catalogus van de hele Platform-wiki, per map, met per pagina één regel beschrijving. Begin hier bij elke vraag: zoek de sectie, klik door. Deze pagina wordt bijgewerkt bij elke ingest (zie [[_Schema — zo werkt deze wiki]]).

## (root)

- [[_Schema — zo werkt deze wiki]] — het conventiedocument voor agents; lees dit eerst.
- [[Index]] — deze catalogus.
- [[Overzicht — het Human Margin-platform]] — synthese van het hele platform in één pagina.
- [[Second Brain]] — uitleg van de graph-visualisatie van kennisbank + wiki.

## Werkbladen

- [[Werkblad Home]] — Els's dagoverzicht: deals, taken, content, teamactiviteit.
- [[Werkblad Pipeline]] — deals-kanban met fases, kolommenbeheer en een autosave-paneel per deal.
- [[Werkblad Relaties]] — organisaties en contactpersonen als filterbare lijsten, met opvolging.
- [[Werkblad Projecten]] — fase-kanban voor projecten, met takenblok en teamleden.
- [[Werkblad Taken]] — taken-kanban, ook de agent-queue voor Dottie en straks Hermes.
- [[Werkblad Kalender]] — content- en deadline-planning per maand/week/lijst.
- [[Werkblad Kennisbank]] — de myDrive-verkenner waar deze wiki zelf leeft.

## Modules & data

- [[CRM — organisaties, contacten en deals]] — de kerncollecties van pipeline en relatiebeheer.
- [[Projecten & taken]] — fases, statussen, checklists en position-volgorde.
- [[Content & kalender]] — content-items, kanalen en de publicatie-statusflow.
- [[Kennisbank & bestanden]] — de docs-boom, uploads en de prullenbak.
- [[Tijdlijn & activities]] — het polymorfe paper-trail-systeem.
- [[Gebruikers, rollen & voorkeuren]] — users, rollen, lijstvoorkeuren en auth.
- [[Site & CMS]] — de publieke site: pages, blocks, media, draft-preview.

## Automatiseringen

- [[Hooks & automatische acties]] — deal→tijdlijn, gewonnen→project, blog→conceptpagina.
- [[In-the-loop OS (agent-queue)]] — hoe Dottie (en straks Hermes) via het bord werkt.

## API & integraties

- [[REST & Local API — recepten]] — auth, veelgebruikte recepten, gotchas.
- [[Integratie-landschap]] — huidige en geplande koppelingen van Els.

## Roadmap & wensen

- [[Strategie — de Human Margin Method]] — de AICK-methode en de academy-visie.
- [[Wensenkaart W1–W31]] — de volledige braindump-kaart van Els.
- [[Fase A — content & formats]] — contentproductie en formats.
- [[Fase B — Reality Check native]] — Reality Check als eigen tool.
- [[Fase C — publiek & rapporten]] — publieke content en rapportages.
- [[Fase D — repurposing & ochtendmail]] — hergebruik van content en de ochtendmail.
- [[Fase E — masterclass-automatisering]] — automatisering rond masterclasses.
- [[Fase F — academy, betalingen & affiliates]] — de academy met betalingen en affiliates.
- [[Fase G — KPI-dashboard Cijfers]] — het cijfer-dashboard.
- [[Fase H — eigen mailmotor]] — een eigen mailmotor in plaats van een extern platform.
- [[CRM-afronding (gap-index)]] — de resterende CRM-sprints.
- [[Kaders — wat nooit automatisch mag]] — Els's harde grenzen voor automatisering.

## Agents

- [[Hermes Agent]] — de bootstrap-node voor de VPS-agent (gepland — fase 2).
- [[Dottie (sessie-agent)]] — de sessie-agent en haar onderhoudsplicht.

## Gerelateerd

- [[_Schema — zo werkt deze wiki]]
- [[Overzicht — het Human Margin-platform]]`,
  },
  {
    map: null,
    titel: "Overzicht — het Human Margin-platform",
    tags: ["wiki", "overzicht"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** CLAUDE.md; skill humanmargin-dashboard; skill humanmargin-payload-cms

De synthese van het hele platform in één pagina: wat het is, voor wie, welke werkbladen er zijn, welke data eronder ligt en hoe agents ermee werken.

## Wat het is

Eén Next.js 16 + Payload 3-app (Postgres via Neon) die twee dingen combineert: de publieke website van Human Margin (humanmargin.eu) en Els's interne bedrijfsdashboard. Beide draaien op dezelfde database en dezelfde Payload-instance. De publieke site rendert content die Els zelf bewerkt via een Nederlandstalige admin op \`/admin\`; in diezelfde admin zit het dashboard (CRM, projecten, contentkalender, kennisbank).

## Voor wie

Voor Els — AI-compliance en -training (Human Margin, humanmargin.eu). Zij werkt zelf in de UI; Dottie (deze bouwsessies) is haar AI-partner via de Local API, en straks doet Hermes hetzelfde via de REST API vanaf een VPS-cron **(gepland — fase 2)**, zie [[Hermes Agent]].

## De zeven werkbladen

- [[Werkblad Home]]: haar dag in één oogopslag — open deals, taken met deadline, content van deze week, teamactiviteit.
- [[Werkblad Pipeline]]: de deals-kanban, met een paneel per deal en automatische tijdlijn-logging bij faseverandering.
- [[Werkblad Relaties]]: organisaties en contactpersonen als filterbare lijsten, met opvolgreminders.
- [[Werkblad Projecten]]: een fase-kanban voor projecten, inclusief takenblok en teamleden.
- [[Werkblad Taken]]: de taken-kanban — ook de plek waar Dottie's (en straks Hermes') agent-queue leeft.
- [[Werkblad Kalender]]: contentplanning per maand/week/lijst, gekoppeld aan taakdeadlines.
- [[Werkblad Kennisbank]]: de myDrive-achtige documentenverkenner — en de plek waar deze wiki zelf leeft.

## De datamodel-kern

- **CRM:** \`organisations\`, \`contacts\`, \`deals\`, \`deal-stages\` (plus beheerbare sectoren/functies/eigen velden).
- **Projecten & taken:** \`projects\`, \`tasks\`, \`task-statuses\`, \`project-fases\`.
- **Content:** \`content-items\`, \`content-channels\`.
- **Kennisbank:** \`knowledge-docs\` (parent-boom, waaronder deze wiki), \`knowledge-files\` (uploads).
- **Gedeeld:** \`activities\` (de polymorfe tijdlijn), \`users\` (rollen beheerder/teamlid).
- Los daarvan: de site-collecties \`pages\`/\`media\`/\`subscribers\` voor de publieke kant.

Details per domein: [[CRM — organisaties, contacten en deals]], [[Projecten & taken]], [[Content & kalender]], [[Kennisbank & bestanden]], [[Tijdlijn & activities]], [[Site & CMS]].

## Hoe agents ermee werken

Dottie werkt in bouwsessies met filesystem-toegang tot de repo en met de Local API tegen de database (\`overrideAccess: false\` + \`user\`, zodat hooks, access en tijdlijn precies zo werken als wanneer Els het zelf doet). Hermes **(gepland — fase 2)** krijgt geen repo-toegang maar een eigen gebruiker met API-key en werkt uitsluitend via de REST API — dezelfde hooks en regels gelden. Beide agents onderhouden deze wiki volgens [[_Schema — zo werkt deze wiki]].

## Gerelateerd

- [[Index]]
- [[_Schema — zo werkt deze wiki]]
- [[Second Brain]]
- [[Hermes Agent]]`,
  },
  {
    map: null,
    titel: "Second Brain",
    tags: ["wiki", "second-brain"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md §6

Second Brain is het grafenwerkblad dat de hele kennisbank én deze wiki als interactieve knowledge-graph toont — het Obsidian-graph-view-gevoel, gebouwd bovenop het open-source-project graphify.

## Wat je ziet

- Elk kennisdocument — kennisbank én Platform-wiki, want ze leven in dezelfde collectie — is een stip (node) in de graph.
- Verbindingen tussen documenten komen uit wiki-links: elke link tussen twee pagina's wordt 1-op-1 een verbinding (edge) in de graph.
- Documenten met verwante onderwerpen clusteren automatisch samen en krijgen een clusterkleur uit Els's kolomkleur-tokens.

## Hoe je het leest

- De grootte van een stip is evenredig met het aantal verbindingen (degree) — hoe groter, hoe centraler dat document in de kennis.
- Een doorgetrokken lijn is een verbinding die letterlijk uit de tekst is gehaald; een gestippelde, vagere lijn is een afgeleide verbinding. Die eerlijkheidslaag komt rechtstreeks uit graphify's extractie en blijft in de UI zichtbaar via een toggle.
- Labels staan alleen op de belangrijkste hubs, of bij hover/selectie/zoom — zo blijft de graph leesbaar in plaats van een woordenwolk.

## De marge

Links naast de graph staat een echte marge-kolom met kanttekeningen — het signatuur van Human Margin (de naam, de nieuwsbrief "In de Marge"). Van boven naar beneden: een levende kanttekening die meebeweegt met de selectie, "Meest verbonden" (de meest centrale documenten), "Verrassende verbindingen" (bruggen tussen clusters die je niet had verwacht), en de cluster-legenda.

## Hoe hij ververst wordt

De graph wordt gebouwd uit een markdown-export van alle niet-getrashte \`knowledge-docs\`, deterministisch en zonder LLM-kosten (graphify's structurele modus — geen enkele API-call). In deze bouwfase draait Dottie dat handmatig, lokaal, na een wiki-wijziging. **(gepland — fase 2)** Zodra Hermes op de VPS draait, ververst hij de graph dagelijks als vaste stap in zijn cron-run, zichtbaar in de statusbalk onderaan het werkblad ("vannacht ververst door Hermes").

## Doorklikken

Een klik op een node opent het bijbehorende document in het vertrouwde DocPanel van de kennisbank (via de \`?doc=\`-deep-link), inclusief heading-nodes die naar hun ouderdocument doorklikken.

## Gerelateerd

- [[Werkblad Kennisbank]]
- [[Kennisbank & bestanden]]
- [[Hermes Agent]]
- [[_Schema — zo werkt deze wiki]]`,
  },
  {
    map: "Werkbladen",
    titel: "Werkblad Home",
    tags: ["wiki", "werkblad"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; docs/handleiding-els-dashboard.md §1

Werkblad Home is het startscherm na inloggen op \`/admin\` — Els's dag in één oogopslag, met doorklik naar alle andere werkbladen.

## Wat het werkblad doet

Na het inloggen ziet Els direct: haar open deals per pipeline-fase met de totale waarde, de taken die aan de ingelogde gebruiker zijn toegewezen (rode badge = deadline verstreken), de content die deze week gepland staat, en een klikbare activiteiten-feed met de laatste teamactiviteit (avatars + type-pills die naar het onderliggende record linken). Een "Deze week"-blok toont deals met een sluitdatum en taak-deadlines in dezelfde week, zodat de eerstvolgende verplichtingen in één oogopslag zichtbaar zijn. Bovenaan staan snelknoppen om direct een nieuwe deal, taak of content-item aan te maken. Alle kaarten linken door naar het bijbehorende board — Home toont zelf geen details, alleen de samenvatting.

## Interacties

Home heeft geen eigen paneel-query-param — het is een overzichtspagina die doorlinkt naar de panelen van de andere werkbladen. Een klik op een deal-kaart opent bijvoorbeeld \`?deal=<id>\` op de pipeline, een taak opent \`?taak=<id>\` op het taken-board, en een activity in de feed springt naar het record waar hij bij hoort (organisatie, contact, deal, taak, content-item of kennisdocument). Zo blijft elke deep-link hetzelfde query-param-patroon volgen als de rest van het dashboard.

## Onderliggende data

De cijfers op Home zijn afgeleid uit dezelfde collecties als de andere werkbladen: deals en deal-stages ([[CRM — organisaties, contacten en deals]]), tasks ([[Projecten & taken]]), content-items ([[Content & kalender]]) en de activities-tijdlijn ([[Tijdlijn & activities]]).

## Wat Els er typisch doet

Els begint haar dag hier: ze scant openstaande taken en deadlines, checkt of er deals zijn blijven liggen, en klikt door naar wat aandacht nodig heeft. Ze gebruikt de snelknoppen om snel iets nieuws vast te leggen zonder eerst naar het juiste board te navigeren.

## Gerelateerd

- [[Werkblad Pipeline]]
- [[Werkblad Taken]]
- [[Tijdlijn & activities]]
- [[Overzicht — het Human Margin-platform]]`,
  },
  {
    map: "Werkbladen",
    titel: "Werkblad Pipeline",
    tags: ["wiki", "werkblad"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard (Pipeline 2.0); docs/handleiding-els-dashboard.md §2

Werkblad Pipeline is de deals-kanban van Els — haar verkooppijplijn, gesorteerd op fase, met een uitklapbaar paneel per deal.

## Wat het werkblad doet

Op \`/admin/pipeline\` ziet Els haar deals als kaarten in kolommen per pipeline-fase (\`deal-stages\`). De board-toolbar toont het totaal en het gewogen totaal (bedrag × kans) van de zichtbare deals, heeft een live zoekveld, een filter op eigenaar, en een potlood-icoon dat het kolommenbeheer opent (fases hernoemen, toevoegen, verwijderen — verwijderde fases laten hun kaarten veilig terugvallen naar "Geen fase"). Elke kaart toont organisatie, contactpersoon en een status-stip: rood met dagteller als de sluitdatum verstreken is, oranje bij meer dan 14 dagen stilte, groen bij een geplande sluitdatum, grijs als er niets bijzonders is.

## Interacties

Een kaart aanklikken opent het DealPanel via \`?deal=<id>\` (deelbaar als link); "+ Deal" opent \`?deal=nieuw\` (optioneel met \`&fase=<id>\` voorinvulling). Het paneel autosaved op blur/select, heeft een tijdlijn met notitieveld, en knoppen Gewonnen/Verloren/Heropenen (Verloren vraagt om een reden). Een deal naar een andere kolom slepen wordt automatisch gelogd in de tijdlijn ("Fase: Lead → Gesprek"). Slepen naar de actiebalk onderaan kan een deal ook direct verwijderen, verloren of gewonnen maken. Het pil-zoekveld in de topbar (⌘K) en de quick-add "+" linken ook rechtstreeks naar dit paneel, dus een deal is nooit meer dan twee klikken weg.

## Onderliggende data

De volledige veldenset en de automatiseringen staan op [[CRM — organisaties, contacten en deals]] en [[Hooks & automatische acties]] (zoals de deal→project-hook bij "Gewonnen").

## Wat Els er typisch doet

Els volgt hier haar hele verkooptraject: ze sleept deals door de fases naarmate gesprekken vorderen, zet de uitkomst op Gewonnen zodra een klant tekent (waarna het dashboard automatisch een project aanmaakt), of op Verloren met een reden voor latere analyse. Ze past haar fases zelf aan als haar verkoopproces verandert.

## Gerelateerd

- [[CRM — organisaties, contacten en deals]]
- [[Hooks & automatische acties]]
- [[Werkblad Relaties]]
- [[Werkblad Projecten]]`,
  },
  {
    map: "Werkbladen",
    titel: "Werkblad Relaties",
    tags: ["wiki", "werkblad"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard (Relaties-werkblad, CRM-sprints); docs/handleiding-els-dashboard.md §2

Werkblad Relaties is Els's lijstweergave van organisaties en contactpersonen — de plek voor prospectlijsten, opvolging en relatiebeheer buiten de pipeline om.

## Wat het werkblad doet

Op \`/admin/relaties\` staan twee tabs: organisaties en contactpersonen, allebei als filterbare lijst met zoekveld, filter op relatietype (prospect/lead/klant/partner/overig), doelgroep, opvolgdatum ("vandaag"/"achterstallig") en tags. Een Opvolgen-kolom toont een rode pil bij een achterstallige opvolgdatum en amber bij "vandaag". Elke lijst is op maat: een kolomkiezer (aan/uit + volgorde) en sorteren op elke kolomkop, per gebruiker onthouden. Een potlood-icoon opent de CRM-instellingen met tabs Sectoren, Functies en Velden (Els's eigen aangepaste velden).

## Interacties

Een rij aanklikken opent het OrganisatiePanel of ContactPanel via \`?organisatie=<id>\` respectievelijk \`?contact=<id>\` — dezelfde panelen werken ook op \`/admin/pipeline\`. Panelen stapelen via query-params (bijvoorbeeld \`?deal=X&organisatie=Y&contact=Z\`); sluiten verwijdert alleen de eigen parameter. Het organisatiepaneel is de relatie-hub: contactpersonen aanmaken (vooringevuld) of koppelen, adres- en factuurgegevens inklappen, en een "+ Maak deal van deze relatie"-knop die de relatie meteen naar lead zet. Organisaties en contacten hebben daarnaast een risicoklasse (hoog/verboden/geen) als tweede as naast relatietype, en vrije tags voor eigen categorisering.

## Onderliggende data

De volledige velden, sectoren/functies en de eigen-velden-collectie staan op [[CRM — organisaties, contacten en deals]].

## Wat Els er typisch doet

Els gebruikt dit werkblad om haar prospect- en leadlijst bij te houden buiten de actieve pipeline: wie moet ze deze week nog opvolgen, welke relaties liggen stil. Ze voegt zelf sectoren, functies of een nieuw eigen veld toe zodra ze een nieuwe manier wil om organisaties of contacten te categoriseren, en past de zichtbare kolommen en sortering per lijst naar eigen smaak aan.

## Gerelateerd

- [[CRM — organisaties, contacten en deals]]
- [[Werkblad Pipeline]]
- [[Gebruikers, rollen & voorkeuren]]
- [[Werkblad Projecten]]`,
  },
  {
    map: "Werkbladen",
    titel: "Werkblad Projecten",
    tags: ["wiki", "werkblad"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard (Projectenlaag, 2026-07-09)

Werkblad Projecten is de fase-kanban voor projecten — van gewonnen deal tot afgerond werk, met een takenblok per project.

## Wat het werkblad doet

Op \`/admin/projecten\` staan projecten als kaarten in kolommen per project-fase (beheerbaar, net als de pipeline-fases, met kolommenbeheer achter een potlood-icoon). Elke kaart toont organisatie, deadline, aantal taken en een checklist-voortgangsmeter, plus avatars van de teamleden. De board filtert standaard projecten met status "afgerond" weg. Projecten zonder organisatie zijn interne projecten.

## Interacties

Een kaart opent het ProjectPanel via \`?project=<id>\` — een zelfstandig paneel dat op elk werkblad werkt (ook vanuit \`/admin/pipeline\` of \`/admin/relaties\`). Het paneel autosaved de velden, laat teamleden aan- en uitvinken, heeft een takenblok met "+ Taak in dit project" (opent TaakPanel-create voorgevuld met dit project), een tijdlijn en een archiveren-dialoog. Een taak in het takenblok aanklikken stapelt \`?taak=\` op de huidige URL. Omgekeerd toont het DealPanel de projecten die uit een deal zijn ontstaan in zijn Gekoppeld-blok, en heeft het organisatiepaneel een eigen Projecten-blok met een "+ nieuw"-knop die de organisatie voorinvult.

## Onderliggende data

Fases, status-levenscyclus en de koppeling met deals staan op [[Projecten & taken]]; de weving met CRM (organisatiepaneel toont een Projecten-blok, DealPanel toont gekoppelde projecten) staat daar ook beschreven.

## Wat Els er typisch doet

Els start hier na een gewonnen deal (het project is dan al automatisch aangemaakt): ze wijst teamleden toe, zet de deadline, en volgt de voortgang via de checklist-meter op elke kaart. Ze schuift een project door de fases naarmate het werk vordert, en past haar fases (net als bij de pipeline) zelf aan via het kolommenbeheer.

## Gerelateerd

- [[Projecten & taken]]
- [[Werkblad Taken]]
- [[Hooks & automatische acties]]
- [[Werkblad Pipeline]]`,
  },
  {
    map: "Werkbladen",
    titel: "Werkblad Taken",
    tags: ["wiki", "werkblad"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard (Taken-board, In-the-loop OS); docs/handleiding-els-dashboard.md §3

Werkblad Taken is het taken-kanban van het team — en tegelijk de plek waar Dottie (en straks Hermes) hun agent-queue vandaan halen.

## Wat het werkblad doet

Op \`/admin/taken\` staan taken als kaarten in kolommen per taakstatus (beheerbaar, net als bij de pipeline). Elke kaart toont titel, project (optioneel — een losse taak heeft er geen), toegewezen persoon, deadline (rood bij verstreken) en prioriteit (laag/normaal/hoog). Een taak kan een checklist hebben voor terugkerende stappen. Het board is filterbaar op project en op persoon.

## Interacties

Een kaart opent het TaakPanel via \`?taak=<id>\` — met checklist en een commentaar-tijdlijn. Dit paneel werkt ook op \`/admin/kalender\`, waar het \`?taak=\` combineert met een \`datum\`-parameter voor de deadline-voorinvulling. "+ Taak in dit project" op een projectkaart opent hetzelfde paneel met het project al ingevuld. Taakstatussen beheert het team zelf op het board — kolommen toevoegen, hernoemen of verwijderen werkt net als bij de pipeline en de projecten, met dezelfde veilige terugval naar "Geen status".

## Onderliggende data

Statussen, checklist en position staan op [[Projecten & taken]]. De agent-queue (stages "Ready (agent)"/"Heeft mij nodig") en de vraag/log-discipline staan op [[In-the-loop OS (agent-queue)]] — het bestaande systeem waarmee Dottie taken oppakt en straks ook Hermes.

## Wat Els er typisch doet

Els beheert hier haar eigen werk en dat van haar team: taken aanmaken, verdelen, prioriteren, en checken wat is blijven liggen. Een taak kan gekoppeld zijn aan een klant (organisatie) en aan kennisdocumenten als referentie, zodat de context altijd bij de kaart zit. Taken die ze aan Dottie of Hermes toewijst in de kolom "Ready (agent)" worden autonoom opgepakt; ze reageert op vragen die terugkomen in de kolom "Heeft mij nodig".

## Gerelateerd

- [[Projecten & taken]]
- [[In-the-loop OS (agent-queue)]]
- [[Werkblad Projecten]]
- [[Werkblad Kalender]]`,
  },
  {
    map: "Werkbladen",
    titel: "Werkblad Kalender",
    tags: ["wiki", "werkblad"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard (Kalender = planning-hub); docs/handleiding-els-dashboard.md §4

Werkblad Kalender is de contentplanning van Els, gecombineerd met taakdeadlines — haar planning-hub voor de komende weken.

## Wat het werkblad doet

Op \`/admin/kalender\` plant Els haar blogs, nieuwsbrieven en LinkedIn-posts in een maand-, week- of lijstweergave. Elk content-item krijgt een status (idee → concept → gepland → gepubliceerd) en is te herkennen aan het kanaal. Een item zonder publicatiedatum blijft alleen in de lijstweergave staan — handig voor losse ideeën die nog geen datum hebben. Naast content toont de kalender ook taak-deadlines als ✓-chips, zodat Els in één oogopslag ziet wat er die dag speelt; de kalender is zo de planning-hub voor zowel content als werk.

## Interacties

Content slepen naar een andere dag verplaatst de publicatiedatum. Een dagnummer aanklikken opent het DagPanel via \`?dag=YYYY-MM-DD\` met een dagoverzicht en snelknoppen "Content plannen"/"Taak plannen". Een content-item opent het ContentPanel via \`?item=<id>\`; daarin staan onder meer een briefveld voor korte planningsnotities en een koppeling naar een organisatie of project. Het TaakPanel werkt ook hier via \`?taak=<id>\`, en TaakPanel-create accepteert een \`datum\`-parameter om de deadline voor te vullen.

## Onderliggende data

Content-items, kanalen en de statusflow staan op [[Content & kalender]]. De blog-automatisering (status "gepland" op een blog-kanaal maakt automatisch een conceptpagina aan) staat op [[Hooks & automatische acties]].

## Wat Els er typisch doet

Els plant hier haar hele contentmaand: nieuwe ideeën als concept vastleggen, publicatiedata verschuiven door te slepen, en voor blogs meteen doorklikken naar de automatisch aangemaakte conceptpagina om te gaan schrijven. Ze combineert dit met haar taakplanning omdat beide in dezelfde kalender zichtbaar zijn, en beheert haar kanalen (Blog, Nieuwsbrief, LinkedIn, …) zelf onder Contentkanalen.

## Gerelateerd

- [[Content & kalender]]
- [[Hooks & automatische acties]]
- [[Werkblad Taken]]
- [[Site & CMS]]`,
  },
  {
    map: "Werkbladen",
    titel: "Werkblad Kennisbank",
    tags: ["wiki", "werkblad"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard (myDrive-verkenner, 2026-07-09); docs/handleiding-els-dashboard.md §5

Werkblad Kennisbank is Els's interne documentenverkenner — en de map waarin deze hele Platform-wiki leeft.

## Wat het werkblad doet

Op \`/admin/kennisbank\` werkt Els in een myDrive-achtige verkenner: een zijbalk met "+ Nieuw", "Kennisbank" en "Prullenbak", een hoofdvlak met breadcrumb, zoekveld, sorteeropties en een grid/lijst-toggle, en een detailrail met een type-banner, thumbnail en snelle acties. Documenten en mappen (\`soort: document\`/\`map\`) vormen een boomstructuur; losse bestanden (\`soort: bestand\`) zijn uploads. Documenten kunnen "intern" of "publiek" zijn.

## Interacties

Dubbelklikken op een document opent het DocPanel — direct bewerken met autosave (700ms debounce), inline titelbewerking en een zichtbaarheids-toggle. Rechtsklikken of het ⋯-menu geeft opties (openen/hernoemen/verplaatsen/downloaden/prullenbak); slepen kan zowel native (bestanden uploaden) als tussen mapkaarten. Meerdere items selecteren kan met ⌘+klik; een multi-select-balk onderaan geeft dan bulkacties. Documenten linken naar elkaar via \`?doc=<id>\`-deep-links: precies zo openen en stapelen deze wiki's eigen paginalinks naar het juiste document. De map **Platform-wiki** bovenin de boom is deze hele wiki — zie [[_Schema — zo werkt deze wiki]] voor hoe ze is opgebouwd.

## Onderliggende data

De volledige structuur (parent-boom, uploads, prullenbak-mechaniek) staat op [[Kennisbank & bestanden]].

## Wat Els er typisch doet

Els gebruikt de kennisbank voor haar interne documentatie (zoals haar eigen handleiding) en leest of vult hier soms mee aan de Platform-wiki, in dezelfde verkenner die ze al kent. Ze uploadt bestanden, ordent ze in mappen, geeft documenten tags mee om ze terug te vinden, en maakt af en toe een document publiek om te delen op de site.

## Gerelateerd

- [[Kennisbank & bestanden]]
- [[_Schema — zo werkt deze wiki]]
- [[Overzicht — het Human Margin-platform]]
- [[Second Brain]]`,
  },
];
