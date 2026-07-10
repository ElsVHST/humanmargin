/**
 * Wiki-content: Modules & data + Automatiseringen + API & integraties (T4b).
 * Onderdeel van de Platform-wiki-seed (scripts/seed/seed-wiki.ts, T5).
 * Type letterlijk gedeeld met de andere content-packs (zie CONTEXT.md).
 */

export type WikiPagina = {
  /** Submap-titel uit de canonieke structuur, of null voor root-niveau. */
  map: string | null;
  titel: string;
  tags: string[]; // altijd minimaal ["wiki"]
  markdown: string;
};

export const PAGINAS: WikiPagina[] = [
  {
    map: "Modules & data",
    titel: "CRM — organisaties, contacten en deals",
    tags: ["wiki", "module"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; src/modules/crm/collections/*.ts

Het CRM is de basis van het dashboard: organisaties, contactpersonen en deals in een Pipedrive-achtig model, met een pipeline-kanban en een relaties-werkblad. Dit is de kern van wat Els dagelijks gebruikt om prospects, klanten en het verkoopproces bij te houden.

## Collecties
- \`organisations\` (Organisatie): het bedrijf/de klant.
- \`contacts\` (Contactpersoon): een persoon, gekoppeld aan een organisatie.
- \`deals\` (Deal): een verkoopkans in de pipeline.
- \`deal-stages\` (Pipeline-fase): de kolommen van het pipeline-board.
- \`crm-velden\` (CRM-veld): Els's eigen velddefinities (zie onder).
- \`sectoren\` / \`functies\`: beheerbare keuzelijsten.

## Kernvelden
\`organisations\`: naam* (verplicht), website, linkedin, sector→sectoren, logo→media, notities, bezoekadres/postadres/factuuradres (groepen met "zelfde als"-checkboxes die default true de groep verbergen), facturatie (kvkNummer/btwNummer/iban/tenaamstelling/factuurEmail/betaaltermijnDagen), relatietype (prospect/lead/klant/partner/overig, optionele select met default \`prospect\`), doelgroep (zzp/mkb/aanbieder/overig, geen default), risicoklasse (hoog/verboden/geen, geen default), opvolgenOp (datum), tags, eigenaar→users.

\`contacts\`: voornaam* + achternaam, \`naam\` (auto-samengesteld, alleen-lezen), email* (uniek — de matchsleutel voor nieuwsbriefstatus), extraEmails[]/telefoons[], functie→functies, organisatie→organisations, bron, dezelfde relatietype/doelgroep/risicoklasse/opvolgenOp-velden als organisaties, tags, eigenaar.

\`deals\`: titel*, bedrag+valuta (EUR/USD), fase→deal-stages (leeg of verwijderde fase valt in de virtuele kolom "Geen fase"), **uitkomst (open/gewonnen/verloren — verplichte select, default \`open\`, altijd expliciet meesturen bij een create)**, verlorenReden (bij verloren), verwachteSluitdatum, kans (%), organisatie, contactpersoon, referenties (kennisbank), eigenaar, position (fractioneel, kaartvolgorde).

## Relaties & joins
\`organisations.contacten\` (join op \`contacts.organisatie\`), \`organisations.deals\` (join op \`deals.organisatie\`), \`organisations.projecten\` (join op \`projects.organisatie\`), \`contacts.deals\` (join op \`deals.contactpersoon\`).

## Beheerbare lijsten
\`sectoren\` en \`functies\` zijn kolom-collecties (naam+kleur, orderable, prullenbak) — elk teamlid mag ze aanmaken via de comboboxen in de panelen ("create-on-type"); hernoemen/verwijderen is beheerder-only. \`deal-stages\` is dezelfde kolom-collectie-factory, maar alleen beheerder mag aanmaken/beheren — dit zijn de kolommen van het pipeline-board.

## Eigen velden (crm-velden + extraVelden)
Els kan zelf CRM-velden toevoegen (Pipedrive "data fields"-patroon): \`crm-velden\` slaat label, een automatisch afgeleide en onveranderlijke \`sleutel\`, **type** (tekst/tekstvak/getal/datum/janee/select/multiselect/link — verplichte select, default \`tekst\`), opties (bij select/multiselect) en **geldtVoor** (organisaties/contacten/beide — verplichte select, default \`beide\`) op; beide moeten bij een create expliciet mee. De waarden zelf staan in het \`extraVelden\`-json-veld op \`organisations\` en \`contacts\`, in de vorm \`{ [sleutel]: waarde }\`. **Belangrijke gotcha:** json-velden worden bij een PATCH volledig VERVANGEN, niet gemerged — je moet dus altijd het complete object meesturen (\`{ extraVelden: { ...bestaand, sleutel: waarde } }\`), anders verlies je de andere waarden. Archiveren van een crm-veld (trash) is nooit destructief voor de opgeslagen waarden.

## Werkblad-oppervlak
De pipeline draait op [[Werkblad Pipeline]] (kanban op deal-stages, deal-slideover met inline autosave); organisaties en contactpersonen leven als filterbare lijsten (zoek + relatietype + doelgroep + opvolgdatum + tag) op [[Werkblad Relaties]], inclusief een CRM-instellingen-paneel voor sectoren/functies/eigen velden.

## Gerelateerd
- [[Werkblad Pipeline]]
- [[Werkblad Relaties]]
- [[Tijdlijn & activities]]
- [[Projecten & taken]]
- [[CRM-afronding (gap-index)]]`,
  },
  {
    map: "Modules & data",
    titel: "Projecten & taken",
    tags: ["wiki", "module"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; src/modules/projects/collections/*.ts

De projectenlaag is het ERP-achtige vervolg op een gewonnen deal: projecten met een eigen fase-kanban en teamleden, en taken die los of aan een project hangen, inclusief het agent-queue-mechanisme van het in-the-loop OS.

## Collecties
- \`projects\` (Project)
- \`tasks\` (Taak)
- \`project-fases\` (Projectfase): kolommen van het projecten-kanban.
- \`task-statuses\` (Taakstatus): kolommen van het taken-kanban.

## Kernvelden
\`projects\`: naam*, fase→project-fases (kanban-kolom; leeg of verwijderde fase = "Geen fase"), position (fractioneel, sidebar-verborgen), **status (actief/gepauzeerd/afgerond — verplichte select, default \`actief\`; het board filtert standaard niet-afgerond)**, organisatie (leeg = intern project), deal (herkomst — welke deal dit project heeft opgeleverd), teamleden[]→users, startdatum/deadline, omschrijving, referenties (kennisbank), tags, eigenaar, join \`taken\`.

\`tasks\`: titel*, status→task-statuses (leeg of verwijderde status = "Geen status"), project (leeg = losse taak, niet aan een project gekoppeld), organisatie (de klant uit het CRM), referenties, toegewezen→users, deadline, **prioriteit (laag/normaal/hoog — verplichte select, default \`normaal\`)**, checklist[{tekst, klaar}], omschrijving, contextVooraf (wat de uitvoerder al moet weten vóór hij begint — in-the-loop OS), definitionOfDone (wanneer is de taak écht af), position (fractioneel).

## Relaties & joins
\`projects.taken\` (join op \`tasks.project\`); \`organisations.projecten\` (join op \`projects.organisatie\`, zie [[CRM — organisaties, contacten en deals]]).

## Beheerbare lijsten
\`project-fases\` en \`task-statuses\` zijn kolom-collecties (naam+kleur, orderable, prullenbak, beheerder-only) — identiek patroon aan \`deal-stages\`. Verwijderen van een kolom is soft-delete; kaarten met een verwijderde kolom vallen automatisch in de fallback-kolom.

## Automatisering
Een gewonnen deal maakt idempotent één project aan (\`createProjectOnWin\`, naam/organisatie van de deal) — zie [[Hooks & automatische acties]].

## Werkblad-oppervlak
[[Werkblad Projecten]] is het fase-kanban (drag-and-drop, kolommenbeheer, kaart met organisatie/deadline/taakaantal/checklist-voortgangsmeter/teamavatars) met een \`ProjectPanel\` (autosave, teamleden, takenblok met voortgang en taak-create met project-prefill, tijdlijn, archiveren). [[Werkblad Taken]] is het taken-kanban met filters op project en toegewezen persoon, kaart-badges voor hoge prioriteit en verstreken deadlines — en tegelijk de plek waar het agent-queue-mechanisme leeft: taken in de kolom "Ready (agent)" toegewezen aan een agent-user vormen de wachtrij, zie [[In-the-loop OS (agent-queue)]]. Projecten en taken zijn verweven met de pipeline: het org-paneel en het deal-paneel tonen gekoppelde projecten, en \`?project=\`/\`?taak=\` stapelen als query-parameters op elk werkblad.

## Gerelateerd
- [[Werkblad Projecten]]
- [[Werkblad Taken]]
- [[Hooks & automatische acties]]
- [[In-the-loop OS (agent-queue)]]
- [[CRM — organisaties, contacten en deals]]`,
  },
  {
    map: "Modules & data",
    titel: "Content & kalender",
    tags: ["wiki", "module"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; src/modules/content/collections/*.ts

De contentkalender plant en volgt alles wat Els publiceert — blogposts, nieuwsbrieven en social — met een vaste statusflow en een automatische koppeling naar de website voor blogcontent. Item en kanaal zijn losgekoppeld: één kanaal (bijvoorbeeld het blog) herbergt meerdere content-items, elk met zijn eigen status en planning.

## Collecties
- \`content-items\` (Content-item)
- \`content-channels\` (Contentkanaal): kolommen van de kalender/statusflow.

## Kernvelden
\`content-items\`: titel*, kanaal→content-channels, **status (idee/concept/gepland/gepubliceerd — verplichte select, default \`idee\`, vaste statusflow)**, publishDate (dag+tijd; zonder publishDate is een item alleen zichtbaar in de lijstweergave, niet in het maand/weekgrid), brief (korte werkomschrijving — de échte content leeft in de gekoppelde pagina of het kanaal zelf), gekoppeldePagina→pages (de sitepagina waar dit leeft, met name bij blogposts), organisatie, project, toegewezen→users, publicatielink, referenties (kennisbank), groupId (gereserveerd voor latere multi-kanaal-threads). Organisatie en project op een item maken het ook mogelijk klantgerichte content (bijvoorbeeld een sector-pack-artikel) te herleiden tot de juiste relatie in het CRM.

\`content-channels\`: naam*, kleur* (kolom-token), **type (blog/nieuwsbrief/linkedin/instagram/overig — verplichte select, default \`overig\`; dit vaste type stuurt de hook-logica hieronder, de naam zelf is vrij te kiezen)**.

## Automatisering
Een blog-kanaal + status → \`gepland\` zonder bestaande koppeling maakt automatisch een conceptpagina op de site aan (draft, geslugificeerde titel, conflict-suffix bij dubbele slugs) en koppelt die terug op het content-item — zie [[Hooks & automatische acties]] en [[Site & CMS]]. Niets wordt automatisch gepubliceerd: de pagina blijft draft totdat Els hem in de admin publiceert.

## Bewuste afwijking
Anders dan bij CRM-records loggen statuswijzigingen op content-items géén \`activities\`-item (\`targets\` bevat \`content-items\` niet voor dat doel) — het kalenderbord en de statuskolommen tonen de status zelf al, dus dat zou dubbelop zijn.

## Werkblad-oppervlak
[[Werkblad Kalender]] toont een maand/week/lijst-weergave (maandgrid start op maandag, 42 dagen); slepen naar een andere dag past \`publishDate\` aan met behoud van tijd (met bevestiging bij al gepubliceerde items); vandaag wordt gemarkeerd, elk item toont een kanaal-kleurstip en statusbadge. De lijstweergave is bovendien filterbaar op kanaal en status, zodat in één oogopslag zichtbaar is wat waar in de flow idee → concept → gepland → gepubliceerd zit. De kalender is ook de planning-hub voor taak-deadlines (✓-chips) en heeft een dag-paneel (\`?dag=\`) met snelkoppelingen "Content plannen"/"Taak plannen".

## Gerelateerd
- [[Werkblad Kalender]]
- [[Hooks & automatische acties]]
- [[Site & CMS]]
- [[Fase A — content & formats]]`,
  },
  {
    map: "Modules & data",
    titel: "Kennisbank & bestanden",
    tags: ["wiki", "module"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; src/modules/knowledge/collections/*.ts; PRD 2026-07-10-llm-wiki-hermes-prd.md §2-§4

De kennisbank is de myDrive-achtige documentenboom van het dashboard — en sinds deze release ook het thuis van de Platform-wiki, de LLM-onderhouden documentatie van het hele systeem.

## Collecties
- \`knowledge-docs\` (Kennisdocument): mappen én documenten in één boomstructuur.
- \`knowledge-files\` (Kennisbank-bestand): de fysieke uploads, los van Els's site-\`media\` zodat die bibliotheek schoon blijft.

## Kernvelden
\`knowledge-docs\`: titel*, **soort (map/document/bestand — verplichte select met default \`document\`; toch altijd expliciet meesturen bij een create, want voor een map of bestand wil je vrijwel nooit de default)**, inhoud (Lexical richText), bestand→knowledge-files (alleen bij soort \`bestand\`), parent→knowledge-docs (zelfrelatie — de boom; leeg = hoofdstuk op het hoogste niveau), **zichtbaarheid (intern/publiek — verplichte select, default \`intern\`, ook altijd expliciet meesturen; publieke rendering op de site is een latere fase)**, organisatie, project, tags, auteur→users (automatisch de ingelogde gebruiker), position (sibling-volgorde, automatisch bij aanmaken).

\`knowledge-files\`: pure upload-collectie zonder eigen velden, elk bestandstype, met een thumbnail-formaat voor afbeeldingen; opslag op \`public/bestanden\`. Een \`afterDelete\`-hook op \`knowledge-docs\` ruimt het gekoppelde bestand-doc automatisch mee op bij definitief verwijderen (geen weesbestanden).

## De Platform-wiki (deze release)
De wiki is **geen nieuwe collectie** maar een map "Platform-wiki" binnen \`knowledge-docs\` zelf (soort \`map\`), met submappen en pagina's als gewone documenten (soort \`document\`). Daardoor werkt alles wat de kennisbank al kan — boom, zoeken, tags, prullenbak, tijdlijn, referenties — automatisch ook voor wiki-pagina's. Elke wiki-pagina draagt de tag \`wiki\` plus een categorietag. Twee kleine uitbreidingen horen hierbij **(gebouwd in deze release)**: een \`?doc=<id>\`-deep-link in de kennisbank-verkenner (zelfde patroon als \`?deal=\`/\`?taak=\` op de andere werkbladen) zodat wiki-pagina's direct deelbaar en aanklikbaar zijn, en de custom endpoints \`GET/PATCH /api/wiki/:id/md\` die de Lexical-inhoud als platte markdown teruggeven resp. aannemen — zie [[REST & Local API — recepten]]. Zie ook [[Second Brain]] voor de graph-visualisatie die later bovenop dezelfde kennisdocumenten wordt gebouwd **(gepland — fase 1b)**.

## Werkblad-oppervlak
[[Werkblad Kennisbank]] is de volledige myDrive-verkenner: zijbalk (Nieuw/Kennisbank/Prullenbak), hoofdvlak met breadcrumb/zoek/sorteer/grid-of-lijst, detailrail met type-banner en acties. Klikken selecteert, dubbelklikken opent (het DocPanel bewerkt Lexical-documenten met autosave), rechtsklik geeft een contextmenu (hernoemen/verplaatsen/downloaden/prullenbak). De prullenbak is een aparte query op \`deletedAt\`; herstellen en definitief verwijderen (beheerder-only) gaan via dezelfde endpoints als de rest van het dashboard.

## Gerelateerd
- [[Werkblad Kennisbank]]
- [[REST & Local API — recepten]]
- [[Second Brain]]
- [[Tijdlijn & activities]]`,
  },
  {
    map: "Modules & data",
    titel: "Tijdlijn & activities",
    tags: ["wiki", "module"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; src/modules/shared/collections/Activities.ts

\`activities\` is het polymorfe paper-trail-systeem van het dashboard: elke notitie, statuswijziging en agent-actie hangt hier als losse activiteit aan één of meer records, zichtbaar als tijdlijn op elk werkblad. Zonder deze ene collectie zou elk werkblad zijn eigen historieveld nodig hebben; nu delen organisatie, deal, project, taak, content-item en kennisdocument dezelfde tijdlijn-UI en dezelfde query's.

## Collectie
- \`activities\` (Activiteit) — één collectie, gekoppeld aan zeven andere.

## Kernvelden
**type (verplichte select, default \`notitie\`)**: notitie, statuswijziging, systeem, e-mail, boeking (dit en \`email\` zijn gereserveerd voor latere fases), en twee in-the-loop-OS-typen: vraag (agent) en LOG (beslissing). samenvatting (de korte regel die op de tijdlijn verschijnt), tekst (Lexical richText, voor langere notities), **targets (verplicht, polymorfe relatie hasMany naar \`organisations\`/\`contacts\`/\`deals\`/\`projects\`/\`tasks\`/\`content-items\`/\`knowledge-docs\` — één activiteit kan aan meerdere records tegelijk hangen)**, auteur→users (automatisch de ingelogde gebruiker), happensAt* (datum+tijd, default nu), properties (json, alleen-lezen — voor/na-waarden bij automatische statuswijzigingen).

## Access
Lezen en aanmaken mag elke ingelogde gebruiker; bewerken en verwijderen is beheerder-only — een activiteit is bedoeld als onveranderlijk logboek, geen bewerkbaar veld.

## Wie schrijft hier
Mensen (notities via de tijdlijn-UI op elk record), automatische hooks (\`logDealStatusChange\` bij een fase/uitkomst-wijziging op een deal — zie [[Hooks & automatische acties]]), en agents in het in-the-loop OS (vraag/log-activiteiten, zie [[In-the-loop OS (agent-queue)]]). Statuswijzigingen krijgen altijd leesbare namen: de hook zoekt de fase- of statusnaam actief op, ook als die kolom inmiddels in de prullenbak staat.

## Recepten
Tijdlijn van record X ophalen: \`find activities where targets.relationTo == <slug> AND targets.value == <id>\`, gesorteerd op \`-happensAt\`. Notitie plaatsen: \`create activities { type: "notitie", samenvatting, targets: [{relationTo, value}], happensAt }\`. Als een specifieke gebruiker handelen (voor correcte attributie): \`overrideAccess: false\` + \`user: <userDoc>\` meegeven bij de Local API, of de API-key van die gebruiker gebruiken via REST. Alle activiteiten van één dag ophalen (bv. voor een dagoverzicht): \`find activities where happensAt >= <start> AND happensAt < <eind>\`.

## De wiki-tijdlijn (deze release)
Het Logboek van de Platform-wiki is bewust géén losse pagina maar de tijdlijn óp de wiki-root zelf: elke ingest/lint/query-run wordt een \`activities\`-item met \`targets\` naar de wiki-hoofdmap en een samenvatting met het prefix \`[ingest|lint|query]\`. Dat maakt het log append-only per constructie, chronologisch queryable, en zichtbaar in dezelfde tijdlijn-UI die elk ander record al heeft.

## Gerelateerd
- [[Hooks & automatische acties]]
- [[In-the-loop OS (agent-queue)]]
- [[CRM — organisaties, contacten en deals]]
- [[REST & Local API — recepten]]`,
  },
  {
    map: "Modules & data",
    titel: "Gebruikers, rollen & voorkeuren",
    tags: ["wiki", "module"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** src/collections/Users.ts; src/modules/shared/access.ts; PRD 2026-07-10-llm-wiki-hermes-prd.md §2 (B6)

\`users\` is Payload's auth-collectie én de basis van rechten, toewijzingen en persoonlijke lijstinstellingen — en sinds deze release ook de plek waar agent-identiteiten (Dottie, Hermes) hun toegang krijgen. De collectie draait op Payload's eigen auth (login, wachtwoord-reset, sessies); \`email\` is tegelijk het inlogadres.

## Collectie
- \`users\` (Gebruiker) — \`auth: { useAPIKey: true }\`.

## Kernvelden
name*, email (auth-veld), **role (verplichte select, default \`teamlid\`, \`saveToJWT\` zodat de rol direct in de sessie beschikbaar is)**: beheerder of teamlid — alleen een beheerder mag deze rol van een ander wijzigen. lijstVoorkeuren (json, zelf bij te werken): per werkblad de kolomkeuze en sortering die een gebruiker gekozen heeft (bv. \`{relaties:{organisaties:{kolommen,sortering}}}\`), debounced gepatcht vanuit de UI.

## Rollen & rechten
Access-helpers in \`src/modules/shared/access.ts\`: \`isAuthenticated\` (ingelogd, elke rol), \`isBeheerder\` (alleen rol beheerder), \`isBeheerderOrSelf\` (beheerder, of de gebruiker die zijn eigen document bewerkt), \`beheerderFieldOnly\` (veldniveau — alleen beheerder mag dit specifieke veld wijzigen, gebruikt op \`role\` zelf). Beheerders beheren gebruikers, kolom-collecties (deal-stages/task-statuses/content-channels/project-fases) en mogen permanent verwijderen uit de prullenbak; teamleden werken in alle domeinen maar zonder die drie bevoegdheden. In de admin staat \`users\` in de groep Beheer, met naam/e-mail/rol als standaardkolommen in het overzicht.

## API-key-authenticatie (deze release, B6)
Naast sessie-login ondersteunt \`users\` nu API-keys: header \`Authorization: users API-Key <key>\`. Dit is speciaal bedoeld voor agent-gebruikers die geen browsersessie hebben — een key wordt alleen aangezet op agent-accounts, nooit op menselijke gebruikers. De rol van de agent-user bepaalt zijn rechten net als bij iedere andere gebruiker (teamlid: geen kolom-/gebruikersbeheer, geen permanent verwijderen). Zie [[REST & Local API — recepten]] voor het volledige recept.

## Agent-gebruikers
\`dottie@humanmargin.eu\` (rol teamlid) is de bestaande sessie-agent — zie [[Dottie (sessie-agent)]]. \`hermes@humanmargin.eu\` (rol teamlid, "Hermes (AI-agent)") is nieuw in deze release: de VPS-cron-agent die via REST + API-key werkt, nooit rechtstreeks op de database — zie [[Hermes Agent]]. Beide agent-gebruikers handelen met attributie: elke wijziging die ze maken staat op naam op de tijdlijn, en ze krijgen verder geen speciale behandeling in de UI — een agent is gewoon een teamlid met een avatar en een rol.

## Gerelateerd
- [[REST & Local API — recepten]]
- [[Hermes Agent]]
- [[Dottie (sessie-agent)]]
- [[Tijdlijn & activities]]`,
  },
  {
    map: "Modules & data",
    titel: "Site & CMS",
    tags: ["wiki", "module"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** CLAUDE.md; skill humanmargin-payload-cms; src/collections/Pages.ts; src/blocks/index.ts

De publieke website van Human Margin draait op dezelfde Payload-app als het dashboard — Els bewerkt elke pagina zelf via blocks, met live-preview en draft/publish-workflow.

## Collecties
- \`pages\` (Pagina): elke publieke pagina als document met een blocks-layout.
- \`media\` (Media): uploads voor sitecontent, opgeslagen op \`public/media\` — bewust gescheiden van \`knowledge-files\` op \`public/bestanden\` (kennisbank) zodat Els's mediabibliotheek voor de site schoon blijft, zie [[Kennisbank & bestanden]].
- Globals \`header\` en \`footer\`: sitebrede navigatie en voettekst.

## Kernvelden
\`pages\`: title*, slug* (uniek, geïndexeerd; automatisch geslugificeerd uit de titel als je geen eigen slug invult; \`"home"\` is de speciale slug voor de homepage → route \`/\`), layout (het \`blocks\`-veld — een array van sectietypes, zie hieronder). \`versions.drafts\` staat aan met autosave (interval 375ms) en tot 50 versies per document; publieke bezoekers zien alleen \`_status: published\`-pagina's, ingelogde redacteuren zien alles.

## Blocks (paginasecties)
Elke paginasectie is een Payload-block: schema in \`src/blocks/<Naam>/config.ts\` (velden die Els bewerkt, Nederlandse labels) + renderer in \`Component.tsx\` (styling), samen geregistreerd in \`src/blocks/index.ts\` (\`blockConfigs\` voor het schema, \`blockComponents\` voor de mapping). Op dit moment zijn dat achttien blocktypes (o.a. HeroPhoto, PageTitle, Content, TextColumns, SplitPhotoText, CardColumns, IconList, LinkButtons, Faq, Testimonials, PostCards, Statement, LongformDark, BrushNote, EbookOptin, CalendlyEmbed, IframeEmbed, TextCta). \`RenderBlocks\` loopt door het \`layout\`-array van een pagina en rendert per item het bijbehorende component via die registry — pagina-content wordt dus nooit hardcoded in een route, altijd via een block. Een los tabblad "SEO" wordt door de \`@payloadcms/plugin-seo\`-plugin aan \`pages\` toegevoegd (meta-titel, meta-omschrijving, share-afbeelding) — geen eigen block, maar een collectiebrede uitbreiding.

## Draft-preview
Live-preview in de admin wijst naar \`/next/preview?path=<pad>\`, dat authenticeert, Next's draft mode aanzet en doorstuurt naar de echte pagina; draft-pagina's renderen \`RefreshRouteOnSave\` zodat de preview live meebeweegt met bewerkingen. Verlaten via \`/next/exit-preview\`.

## Hooks
Een \`afterChange\`-hook revalideert (\`revalidatePath\`) het publieke pad zodra een pagina wordt gepubliceerd, van slug wisselt, of gedepubliceerd wordt; buiten een Next-requestcontext (seeds/scripts) slaat dit stil over. Een blog-contentitem dat op \`gepland\` gezet wordt maakt via een hook op \`content-items\` automatisch een conceptpagina hier aan — zie [[Content & kalender]] en [[Hooks & automatische acties]].

## Gerelateerd
- [[Content & kalender]]
- [[Hooks & automatische acties]]
- [[Kennisbank & bestanden]]`,
  },
  {
    map: "Automatiseringen",
    titel: "Hooks & automatische acties",
    tags: ["wiki", "automatisering"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; src/modules/crm/hooks/; src/modules/content/hooks/

Drie \`afterChange\`-hooks doen het automatische werk van het dashboard: ze loggen, koppelen en genereren concepten zodra een record in een bepaalde staat komt — zonder ooit iets naar buiten te sturen.

## De drie hooks
1. **Deal-fasewijziging → tijdlijn-activity** (\`logDealStatusChange\`, op \`deals\`): bij een wijziging in \`fase\` of \`uitkomst\` maakt deze hook een \`activities\`-item van het type statuswijziging aan, met een leesbare samenvatting (bijvoorbeeld "Fase: Lead → Klant") en de voor/na-waarden in \`properties\`. Zie [[Tijdlijn & activities]].
2. **Deal gewonnen → project** (\`createProjectOnWin\`, ná de log-hook op \`deals\`): zodra \`uitkomst\` naar \`gewonnen\` gaat, maakt deze hook idempotent één \`project\` aan met de naam en organisatie van de deal. Idempotent betekent hier: als er al een project uit deze deal bestaat, komt er geen tweede bij. Zie [[Projecten & taken]].
3. **Blog-content gepland → conceptpagina** (\`createPageOnPlan\`, op \`content-items\`): een item op een blog-kanaal dat naar status \`gepland\` gaat zonder al een gekoppelde pagina te hebben, krijgt automatisch een conceptpagina (draft, geslugificeerde titel met conflict-suffix bij dubbele slugs) en de koppeling wordt teruggeschreven op het content-item. Zie [[Content & kalender]] en [[Site & CMS]].

## Eigenschappen
Alle drie de hooks zijn **idempotent** (opnieuw draaien maakt geen dubbele activiteiten/projecten/pagina's) en **falen stil** — een fout in de hooklogica breekt nooit de eigenlijke opslag, en wordt alleen naar de payload-logger geschreven. Ze vuren op elke wijziging via \`afterChange\`, dus ook bij API-calls (REST of Local API) — niet alleen bij handmatige bewerking in de admin-UI. Zie [[REST & Local API — recepten]].

## Het kader
**Niets publiceert of verstuurt automatisch.** Een conceptpagina blijft een draft totdat Els hem zelf publiceert; een idempotent aangemaakt project staat gewoon als elk ander project op het bord; een tijdlijn-activiteit is puur informatief. Automatisering hier betekent: het saaie boekhoudwerk overnemen (loggen, koppelen, klaarzetten), nooit een beslissing nemen die naar buiten toe zichtbaar is. Dat kader geldt onverkort voor toekomstige hooks en voor Hermes — zie [[Kaders — wat nooit automatisch mag]].

## Gerelateerd
- [[Tijdlijn & activities]]
- [[Projecten & taken]]
- [[Content & kalender]]
- [[Kaders — wat nooit automatisch mag]]`,
  },
  {
    map: "Automatiseringen",
    titel: "In-the-loop OS (agent-queue)",
    tags: ["wiki", "automatisering"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; scripts/seed/seed-agent-loop.ts

Het in-the-loop OS is de werkwijze waarmee agents (Dottie nu, Hermes straks) op het taken-bord meewerken: het bord is single source of truth, en een agent gokt nooit — hij doet het werk, vraagt, of stopt.

## De kolommen
Naast Els's eigen taakstatussen bestaan twee vaste kolommen op \`task-statuses\`: **"Ready (agent)"** (taken klaar om door een agent opgepakt te worden) en **"Heeft mij nodig"** (taken waar een agent is vastgelopen en een mens moet beslissen). Beide zijn gewone kolommen op [[Werkblad Taken]], geseed via \`scripts/seed/seed-agent-loop.ts\`.

## De loop
1. **Queue check (lezen):** de agent zoekt \`tasks\` waar \`status.naam == "Ready (agent)"\` en \`toegewezen\` op de agent-user staat, en leest de kaart volledig — titel, omschrijving, \`contextVooraf\`, \`definitionOfDone\`, \`referenties\` en alle bestaande comments (\`activities\` met \`targets\` naar deze taak).
2. **Compleet → doen:** de agent voert het werk uit, plaatst het resultaat als een \`activities\`-item van het type notitie (\`targets\` naar de taak), en verplaatst de kaart naar "Review". Dit gebeurt altijd als de agent-user zelf (\`overrideAccess: false\` + \`user\`), zodat de tijdlijn correcte attributie toont.
3. **Onduidelijk → vragen:** elke aanname die de agent zou moeten maken wordt in plaats daarvan een genummerde vraag, als één \`activities\`-item van het type **vraag**; de kaart gaat naar "Heeft mij nodig" en de agent stopt. Antwoorden komen terug als comments op dezelfde taak.
4. **Review → mens keurt goed.**
5. **Afronden → LOG:** een \`activities\`-item van het type **log** vat de cyclus samen (vraag → verheldering → beslissing → waarom). Archiveren van een taak is altijd trash, nooit permanent verwijderen — de paper trail blijft bestaan.

## Mine the trail
Maandelijks (\`DAGEN=90 npx payload run scripts/agent/mine-trail.ts\`) wordt een markdown-export gemaakt van taken, vragen en logs; terugkerende patronen worden omgezet in SOP's in de kennisbank-map "Agent-skills (SOP's)" (met een vaste SOP-sjabloon).

## Kader
Een agent publiceert of verstuurt nooit iets richting de buitenwereld zonder expliciete goedkeuring op de kaart. Deze discipline geldt nu voor Dottie (zie [[Dottie (sessie-agent)]]) en gaat straks onverkort gelden voor Hermes' dagelijkse cron-run (zie [[Hermes Agent]]) **(gepland — fase 2)**.

## Gerelateerd
- [[Werkblad Taken]]
- [[Tijdlijn & activities]]
- [[Dottie (sessie-agent)]]
- [[Hermes Agent]]`,
  },
  {
    map: "API & integraties",
    titel: "REST & Local API — recepten",
    tags: ["wiki", "api"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; PRD 2026-07-10-llm-wiki-hermes-prd.md §2 (B6/B7), §4.5

Alles wat een agent voor Els doet, loopt via de API van deze app — nooit rechtstreeks op de database — zodat hooks, rechten en de tijdlijn altijd intact blijven. Deze pagina is het draaiboek: hoe agents met het systeem praten.

## Twee toegangswegen
**Local API** (binnen de app zelf, bv. \`npx payload run scripts/...ts\`): directe \`payload.find/create/update/delete\`-aanroepen — dit is hoe Dottie in een sessie werkt, met bestaande database-toegang. **REST** (\`/api/<slug>\`, standaard Payload-CRUD op elke collectie): dit is hoe een extern proces zoals Hermes praat, over HTTP.

## Authenticatie
Sessie (browser-cookie, voor ingelogde mensen), of — **(gebouwd in deze release)** — een API-key: header \`Authorization: users API-Key <key>\`. Keys staan alleen aan op agent-gebruikers (\`dottie@humanmargin.eu\`, \`hermes@humanmargin.eu\`), nooit op menselijke accounts; zie [[Gebruikers, rollen & voorkeuren]]. Access-regels gelden onverkort — een teamlid-agent kan geen kolommen beheren en niets permanent verwijderen.

## /md-endpoints voor wiki-pagina's (gebouwd in deze release)
\`GET /api/wiki/:id/md\` geeft de \`inhoud\` van een kennisdocument terug als platte markdown; \`PATCH /api/wiki/:id/md\` neemt markdown aan en converteert die server-side terug naar Lexical. Dit is het agent-vriendelijke oppervlak boven op \`knowledge-docs\` — agents lezen en schrijven markdown, de opslag blijft native Lexical zodat het DocPanel en \`<RichText/>\` gewoon blijven werken. Zie [[Kennisbank & bestanden]].

## Recepten
- **Als een gebruiker handelen** (voor correcte attributie op de tijdlijn): Local API met \`overrideAccess: false\` + \`user: <userDoc>\`; via REST gebeurt dit automatisch door de API-key van die gebruiker te gebruiken.
- **Tijdlijn van record X:** \`find activities where targets.relationTo == <slug> AND targets.value == <id>\`, sorteer op \`-happensAt\`.
- **Notitie plaatsen:** \`create activities { type: "notitie", samenvatting, targets: [{relationTo, value}] }\`.
- **Trash vs. permanent verwijderen:** trash = \`update { deletedAt: <ISO> }\` (mag een teamlid); permanent = \`delete\` met \`?trash=true\` (alleen beheerder). Een gewone \`find\` verbergt getrashte documenten tenzij je \`trash=true\` meegeeft en filtert op \`deletedAt\`.

## Gotcha's
Json-velden (\`extraVelden\`, \`lijstVoorkeuren\`, \`properties\`) worden bij een PATCH **volledig vervangen**, nooit gemerged — altijd het complete object meesturen. Verplichte selects met een default (\`deals.uitkomst\`, \`knowledge-docs.soort\`/\`zichtbaarheid\`, \`tasks.prioriteit\`, \`content-items.status\`, \`projects.status\`, \`crm-velden.type\`/\`geldtVoor\`) moeten bij een create expliciet mee, ook al hebben ze een default — anders vergeet een getypeerde call ze.

## Gerelateerd
- [[Gebruikers, rollen & voorkeuren]]
- [[Kennisbank & bestanden]]
- [[Tijdlijn & activities]]
- [[Hermes Agent]]`,
  },
  {
    map: "API & integraties",
    titel: "Integratie-landschap",
    tags: ["wiki", "api"],
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** specs/2026-07-09-els-braindump-analyse.md §3

Els gebruikt vandaag een los landschap van tools naast dit dashboard; deze pagina houdt bij wat blijft, wat gekoppeld wordt en wat straks vervangen wordt door eigen platformfunctionaliteit — en in welke fase.

## Behouden
- **Google Workspace** (Gmail/Agenda/Meet): blijft de basis voor mail en meetings; agenda- en Meet-links worden gekoppeld voor de masterclass-flow **(gepland — [[Fase E — masterclass-automatisering]])**.
- **TLDV** (Meet-opnames + transcript, EU): blijft; krijgt een API-koppeling voor de repurposing-pipeline **(gepland — [[Fase D — repurposing & ochtendmail]])** en voor masterclass-shownotes **(gepland — [[Fase E — masterclass-automatisering]])**.
- **Wispr Flow / Dicteren AI** (spraak naar tekst): blijft, voedt de inspreek-naar-format-flow **(gepland — [[Fase A — content & formats]])**.
- **Canva** ("Claude Design"): blijft voor social en presentaties; eigen merkopmaak vermindert de afhankelijkheid op termijn maar vervangt Canva niet.
- **Microsoft-pakket** (Office): blijft ongewijzigd.

## Koppelen, later mogelijk vervangen
- **ActiveCampaign** (mailreeksen + nieuwsbrief): eerst koppelen (tags/automations via de API) zodat de zeven bestaande reeksen blijven lopen zodra de eigen Reality Check live gaat **(gepland — [[Fase B — Reality Check native]])**; pas als een eigen mailmotor stabiel draait wordt AC opgezegd **(gepland — [[Fase H — eigen mailmotor]])**.
- **Calendly** (meetings inplannen): koppelen of vervangen door Cal.com — staat op de "later"-lijst van het dashboard-schema, nog niet aan een specifieke fase A–H toegewezen.

## Vervangen
- **WordPress + Elementor** (twee sites): de Human Margin-site draait al op deze Next.js/Payload-app; de AICK-site verdwijnt zodra de eigen academy-module de content overneemt **(gepland — [[Fase F — academy, betalingen & affiliates]])**.
- **Tally** (Reality Check-formulier): vervangen door de native check op de site **(gepland — [[Fase B — Reality Check native]])**.
- **Plug&Pay** (betalingen + affiliates, ±€1.200/jr): vervangen door Mollie/Stripe + een eigen affiliate-module — de grootste besparing **(gepland — [[Fase F — academy, betalingen & affiliates]])**.
- **Huddle** (cursusplatform AICK, ±€700/jr): vervangen door een eigen academy-module **(gepland — [[Fase F — academy, betalingen & affiliates]])**.
- **Canbox** (LinkedIn-CRM, aangeschaft maar ongebruikt): opzeggen — de v1-vervanging (relatietype/opvolgenOp/tags + "Vandaag opvolgen"-blok in het CRM) is al gebouwd, zie [[CRM — organisaties, contacten en deals]].

## Niet aanschaffen
- **WebinarGeek** (overwogen voor webinars): niet nodig — de masterclass-flow wordt zelf gebouwd bovenop Google Meet **(gepland — [[Fase E — masterclass-automatisering]])**.

## Besparing
Bij volledige uitvoering van bovenstaande vervangingen (Huddle + Plug&Pay + Tally + Canbox + het vermeden WebinarGeek) schat de braindump-analyse een structurele besparing van **±€2.000+/jaar**, plus twee WordPress-hostings die vervallen.

## Gerelateerd
- [[CRM — organisaties, contacten en deals]]
- [[Fase B — Reality Check native]]
- [[Fase F — academy, betalingen & affiliates]]
- [[Fase H — eigen mailmotor]]
- [[Strategie — de Human Margin Method]]`,
  },
];
