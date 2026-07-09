---
name: humanmargin-dashboard
description: Use when working in or on the Els-dashboard (CRM, projecten, taken, contentkalender, kennisbank) — answering Els's data questions, performing actions for her via the Local API (deals verplaatsen, taken/content aanmaken, kolommen beheren), extending dashboard modules/views/hooks, or debugging boards and timeline.
---

# Human Margin — Els-dashboard (Dottie's systeemindex)

Het dashboard leeft ín de Payload-admin van de site (zelfde app, zelfde Neon-DB). Els werkt via de UI; ik (Dottie) werk als haar AI-partner via de **Local API** (`npx payload run` scripts) of REST. Alles wat ik doe volgt dezelfde regels als de UI: hooks vuren, timeline logt, prullenbak vangt op, access geldt (Local API met `overrideAccess: false` + `user` om als iemand te handelen).

## Kaart van het systeem

| Domein | Collections (slug) | Werk-oppervlak | Module |
|---|---|---|---|
| CRM | `organisations`, `contacts`, `deals`, `deal-stages` | `/admin/pipeline` (kanban) + `/admin/relaties` (lijsten) | `src/modules/crm/` |
| Projecten | `projects`, `tasks`, `task-statuses`, `project-fases` | `/admin/projecten` (fase-kanban) + `/admin/taken` (taken-kanban) | `src/modules/projects/` |
| Content | `content-items`, `content-channels` | `/admin/kalender` (maand/week/lijst) | `src/modules/content/` |
| Kennisbank | `knowledge-docs` (parent-boom) + `knowledge-files` (uploads) | `/admin/kennisbank` (myDrive-verkenner) | `src/modules/knowledge/` |
| Gedeeld | `activities` (polymorfe timeline) | Home: `/admin` (overzicht) | `src/modules/shared/` |

Site-collections (`pages`, `media`, `users`, `subscribers`) staan los hiervan — zie skill `humanmargin-payload-cms` voor schema-conventies, testinfra en alle fase-details.

## Kernvelden per collectie (voor queries en creates)

- **organisations**: naam*, website, linkedin, **sector→sectoren** (beheerbare lijst!), **relatietype** (prospect/lead/klant/partner/overig, default prospect), **doelgroep** (zzp/mkb/aanbieder/overig), **risicoklasse** (hoog/verboden/geen — tweede as Els's kwadrant), **opvolgenOp** (date — opvolg-reminder), logo→media, notities, **bezoekadres/postadres/factuuradres** (groups via `adresGroup()` in shared/fields; checkboxes `postadresZelfde`/`factuuradresZelfde` default true verbergen de groepen), **facturatie** (group: kvkNummer/btwNummer/iban/tenaamstelling/factuurEmail/betaaltermijnDagen), tags[], **extraVelden** (json — waarden van Els's eigen velden), eigenaar→users. Joins: `contacten`, `deals`, `projecten`. **Partial-group PATCH is veilig** (Payload merget op kolomniveau), maar **json-velden worden VERVANGEN** — altijd het volledige object patchen (`{extraVelden: {...bestaand, sleutel: waarde}}`).
- **contacts**: voornaam*, achternaam, `naam` (auto), **email* uniek** (matchsleutel), extraEmails[], telefoons[], **functie→functies** (beheerbare lijst!), organisatie→, bron, **relatietype**, **doelgroep**, **risicoklasse**, **opvolgenOp**, tags[], **extraVelden** (json), eigenaar→. Join: `deals`.
- **sectoren / functies**: kolom-collecties (naam+kleur, orderable, trash) via `makeColumnCollection({createRol:"teamlid"})` — élk teamlid mag aanmaken (create-on-type via `LijstKeuze`-combobox in de panelen), beheren alleen beheerder. TypeScript-interfaces expliciet `Sector`/`Functie` (typescript.interface). Migratie vrije tekst→relatie: `scripts/migrate/{export,import}-sector-functie.ts`.
- **crm-velden**: Els's eigen velddefinities (Pipedrive data fields): label*, `sleutel` (auto-slug bij create, onveranderbaar), type* (tekst/tekstvak/getal/datum/janee/select/multiselect/link — `VELD_TYPES` in `crm/veldTypes.ts`, client-safe), opties[] (select/multi), geldtVoor* (organisaties/contacten/beide), orderable, trash (archiveren = nooit dataverlies). Waarden in `extraVelden`-json; UI: `crm/views/pipeline/ExtraVelden.tsx` (`ExtraVeldenSectie` + `useCrmVelden`).
- **users.lijstVoorkeuren** (json, self-update): kolomkeuze + sortering per werkblad (`{relaties:{organisaties:{kolommen,sortering}}}`).
- **deals**: titel*, bedrag+valuta, fase→deal-stages (nullable → "Geen fase"-kolom), **uitkomst*** (open/gewonnen/verloren — vast!), verlorenReden, verwachteSluitdatum, kans, organisatie→, contactpersoon→, eigenaar→, position (auto).
- **projects**: naam*, **fase→project-fases** (kanban-kolom; leeg = "Geen fase") + **position** (fractional), status* (actief/gepauzeerd/afgerond — vast, lifecycle: board filtert standaard niet-afgerond), organisatie→ (leeg=intern), deal→ (herkomst), teamleden[]→users, startdatum, deadline, omschrijving, referenties, tags. Join: `taken`. **Projectenlaag (ERP-plan, 2026-07-09, volledig gebouwd):** werkblad `/admin/projecten` (`ProjectenBoard` — fase-kanban, statusfilter, kolommenbeheer, kaart met org/deadline/taakaantal/checklist-meter/teamavatars) + **`ProjectPanel`** (`?project=`, self-contained: eigen queries, route-onafhankelijk) met autosave-velden, teamleden-checkboxes, **Takenblok** ("+ Taak in dit project" → TaakPanel-create met `projectParam`-prefill; taakklik stapelt op /admin/projecten, elders → `/admin/projecten?project=X&taak=Y`), tijdlijn en archiveren-dialoog. **Verweving:** org-paneel heeft een Projecten-blok (+ nieuw met org-prefill), DealPanel toont projecten van de deal in het Gekoppeld-blok, `?project=` stapelt op projecten/pipeline/relaties. Fases geseed via `scripts/seed/seed-project-fases.ts` (Gepland/Lopend/Review/Afgerond).
- **tasks**: titel*, status→task-statuses (nullable), project→ (nullable=losse taak), toegewezen→users, deadline, prioriteit* (laag/normaal/hoog), checklist[{tekst,klaar}], omschrijving, position.
- **content-items**: titel*, kanaal→content-channels, status* (idee/concept/gepland/gepubliceerd), publishDate (leeg = alleen lijstweergave), brief, gekoppeldePagina→pages, organisatie→, project→, toegewezen→, publicatielink, groupId (gereserveerd).
- **knowledge-docs**: titel*, **soort*** (map/document/bestand — verplicht, expliciet meesturen bij creates!), inhoud (Lexical), **bestand**→knowledge-files (bij soort=bestand), parent→zelf (boom), zichtbaarheid* (intern/publiek), organisatie→, project→, tags[], auteur→ (auto), position.
- **knowledge-files**: upload-collectie (élk bestandstype, thumbnail-size voor beelden; `public/bestanden`) — losse opslag zodat Els's site-`media` schoon blijft. Upload via REST: multipart POST `/api/knowledge-files` met veld `file`.
- **activities**: type* (notitie/statuswijziging/systeem/email/boeking), samenvatting (timeline-regel), tekst (Lexical), **targets*[] polymorf** → organisations/contacts/deals/projects, auteur→ (auto), happensAt*, properties (JSON voor/na).
- **Kolom-collecties** (`deal-stages`, `task-statuses`, `content-channels`): naam*, kleur* (tokens groen/blauw/paars/rood/oranje/geel/turquoise/roze/grijs), `orderable: true` (`_order`), `content-channels.type`* (blog/nieuwsbrief/linkedin/instagram/overig — vast, stuurt hooks).

**LET OP bij getypeerde creates:** verplichte selects met defaultValue (deals.uitkomst, knowledge-docs.zichtbaarheid, tasks.prioriteit, content-items.status, projects.status) moeten expliciet mee in `data`.

## Automatiseringen (hooks — vuren óók via mijn API-calls)

1. `deals` fase/uitkomst-wijziging → `activities` statuswijziging met leesbare namen + samenvatting ("Fase: Lead → Klant").
2. `deals` uitkomst → gewonnen → maakt idempotent een `project` (naam/organisatie van de deal).
3. `content-items` blog-kanaal + status → gepland → maakt concept-`page` en koppelt terug.
Alle hooks zijn idempotent en falen stil (opslag blijft intact; fout in payload-logger).

## In-the-loop OS (2026-07-09) — hoe ík als agent op het board werk

Het board is de single source of truth; ik werk de queue en gok nooit. Seed: `npx payload run scripts/seed/seed-agent-loop.ts` (agent-user `dottie@humanmargin.eu`, stages "Ready (agent)"/"Heeft mij nodig", kennisbank-map "Agent-skills (SOP's)" met werkwijze + SOP-template).

- **Queue check:** find `tasks` where status.naam == "Ready (agent)" AND toegewezen == Dottie-user. Lees de kaart (titel/omschrijving/`contextVooraf`/`definitionOfDone`/`referenties`/`organisatie`) én alle comments (activities met target tasks/<id>).
- **Compleet → uitvoeren:** doe het werk, post resultaat als activity `{type:"notitie", samenvatting, targets:[{relationTo:"tasks", value}]}`, verplaats naar "Review". **Handel altijd als de Dottie-user** (`overrideAccess:false, user`) voor attributie.
- **Onduidelijk → vragen:** elke aanname wordt een genummerde vraag in één activity `{type:"vraag"}`; kaart naar "Heeft mij nodig"; stop. Antwoorden komen als comments terug.
- **Afronden → LOG:** activity `{type:"log", samenvatting:"ask → verheldering → beslissing → waarom"}`. Archiveren = trash, nooit permanent verwijderen (paper trail!).
- **Mine the trail (maandelijks):** `DAGEN=90 npx payload run scripts/agent/mine-trail.ts` → markdown-export van taken+vragen+logs; patronen worden SOP's in de kennisbank-map (gebruik de SOP-template).
- **Nooit** publiceren/versturen richting buitenwereld zonder expliciete goedkeuring op de kaart.

## Cross-koppelingen (Asana/Pipedrive-patroon, 2026-07-09)

- **Elk record = velden + koppelingen + tijdlijn.** `activities.targets` dekt nu ook `tasks`, `content-items`, `knowledge-docs`; types +`vraag`/+`log`. Generieke UI: `shared/components/RecordTijdlijn.tsx` (comments op elk record) en `shared/components/ReferentiesVeld.tsx` (kennisbank-chips; klik = gestapeld DocPanel).
- **Schema:** `referenties` (hasMany → knowledge-docs, via `referentiesField` in shared/fields) op deals, tasks, content-items én projects; tasks hebben ook `organisatie` (klant), `contextVooraf` en `definitionOfDone`.
- **Kalender = planning-hub:** toont content én taak-deadlines (✓-chips); dagnummer-klik → `?dag=YYYY-MM-DD` DagPanel (dagoverzicht + "Content plannen"/"Taak plannen"); TaakPanel werkt ook op /admin/kalender (`?taak=`); TaakPanel-create accepteert `datum`-param voor deadline-prefill.

## Hoe ik dingen doe voor Els (recepten)

- **Als een gebruiker handelen** (timeline-attributie!): `payload.update({ ..., overrideAccess: false, user: <userDoc> })`.
- **Deal verplaatsen**: update `{ fase, position }` (position = tussen buren, zie `positionBetween` in `src/modules/crm/views/pipeline/lib.ts`).
- **Timeline van record X**: find `activities` where `targets.relationTo == <slug>` AND `targets.value == <id>`, sort `-happensAt`.
- **Notitie plaatsen**: create activity `{ type: "notitie", samenvatting, targets: [{relationTo, value}], happensAt }`.
- **Kolom toevoegen/hernoemen**: CRUD op de kolom-collectie (alleen beheerder-access!). Verwijderen = soft delete (`deletedAt` zetten); kaarten vallen automatisch in de fallback-kolom.
- **Trashen vs. permanent**: trash = update `{ deletedAt: ISO }` (mag teamlid); permanent = `payload.delete({ trash: true })` (alleen beheerder). `find` verbergt trash tenzij `trash: true` + where op deletedAt.
- **Rapportagevragen** ("welke deals > 30 dagen in Offerte?"): activities met `properties.fase.naar` + happensAt vergelijken, of createdAt/updatedAt op deals.
- **Kennisbank schrijven**: Lexical-JSON nodig — zie de `lexical()`-helper in `scripts/seed/seed-handleiding.ts` (koppen + paragrafen).
- Scripts draaien: `npx payload run scripts/<pad>.ts` (draait tegen de DB uit `.env`!). Tests: `npm test` (raakt ALLEEN de lokale testdatabase).

## Views & componenten (voor uitbreiding)

- Custom views geregistreerd in `payload.config.ts` → `admin.components.views` (dashboard/pipeline/taken/kalender/kennisbank) + `afterNavLinks` → `DashboardNavLinks` (nieuwe view = link toevoegen).
- **Template-regel:** views op een eigen pad (pipeline/taken/…) wikkelen zichzelf in `DefaultTemplate`; de `dashboard`-view (homepage) NIET — die wordt al gewikkeld.
- Boards: generiek `buildGenericColumns`/`positionBetween` (`crm/views/pipeline/lib.ts`), gedeelde `ColumnHeader` + `board.scss` in `src/modules/shared/components/`. Client-state: TanStack Query met optimistic updates; dnd: @hello-pangea/dnd.
- Na nieuwe admin-componenten: `npm run generate:importmap`; na schemawijziging: `npm run generate:types`. Styling op Payload-theme-vars (`--theme-elevation-*`), nooit hardcoded kleuren behalve de kleurtokens in board.scss.
- React-lint-regels die hier streng staan: geen setState-in-effect (gebruik React Query), geen `Date.now()` in render (bereken vóór de JSX), interne links via `next/link`.

## Documentatie voor Els

- Handleiding: `docs/handleiding-els-dashboard.md` + geseed in de kennisbank onder "Handleiding dashboard" (`scripts/seed/seed-handleiding.ts`, idempotent).
- NL-standaardkolommen: `scripts/seed/seed-dashboard-columns.ts`; beheerder maken: `scripts/seed/make-beheerder.ts -- <email>`.

## Nog niet gebouwd (bewust, spec §1 "later")

E-mailsync, support-inbox, social auto-publish (schema is er klaar voor: channels krijgen token-velden + cron-poller), Cal.com-boekingen, klant-deellinks, publieke kennisbank-rendering, kolom-slepen óp het board (volgorde nu via de lijstweergave). Spec: `docs/superpowers/specs/2026-07-08-els-dashboard-design.md`.

## UI-overhaul naar Pipedrive-patroon (2026-07-09, PRD-fases 1-3)

PRD: `docs/superpowers/specs/2026-07-09-dashboard-ui-overhaul-prd.md` (§2.1 = bindende designtaal). Gebouwd: app-shell, pipeline 2.0, deal-slideover, kolommenbeheer-sidepanel. Fases 4-6 (taken/kalender/kennisbank-verfijning, home 2.0, taal/polish) staan nog open.

- **App-shell:** `src/components/admin/shell/` — `Rail.tsx` vervangt Payload's nav via `admin.components.Nav` (off-black icon-rail, geel actief vierkant; beheer-zone alleen voor rol beheerder). `Topbar.tsx` (per custom view gerenderd, prop `titel` + optioneel `acties`): pil-zoekveld ⌘K → `GlobalSearch.tsx` (REST-zoek over 7 collecties), quick-add "+", user-chip. `shell.scss` forceert `--nav-width: 64px` en verbergt Payload's app-header op shell-views via `.template-default__wrap:has(.hm-topbar)`.
- **Pipeline 2.0** (`PipelineBoard.tsx`): board-toolbar (+ Deal → paneel, totaal + gewogen Σ bedrag·kans, live zoek, eigenaar-filter, potlood → kolommenpanel); trechter-kolomkoppen (`ColumnHeader` met `meta`-prop, chevron via clip-path in `board.scss`; géén trash-knop meer); kaart-anatomie §2.1 (org-tag-strips, status-stip: rood "Xd" = sluitdatum verstreken, oranje = >14 dagen stil op `updatedAt`, groen = sluitdatum gepland, grijs = niets; lichtrode kaarttint bij te laat); sleep-actiebalk VERWIJDEREN/VERLOREN/GEWONNEN.
- **LET OP dnd:** de actiebalk-Droppables zijn **altijd gemonteerd** (verborgen via opacity/pointer-events, klasse `is-actief`) — droppables (un)mounten tijdens een drag geeft hello-pangea invariant-errors. Nested DragDropContexts mogen niet; ColumnsPanel rendert daarom buiten de board-context.
- **DealPanel** (`DealPanel.tsx`): opent via `?deal=<id>` (deelbaar) of `?deal=nieuw(&fase=<id>)`; inline autosave op blur/select (PATCH), tijdlijn + notitie, Gewonnen/Verloren/Heropenen (verloren vraagt reden via `VerliesDialoog`), "Openen in volledige editor" als fallback. GlobalSearch en quick-add linken hierheen.
- **GEEN subpagina's-regel (Chris, 2026-07-09):** records openen áltijd in een slideover-paneel rechts, nooit in een Payload-subpagina. Panelen: `DealPanel`, `TaakPanel` (`?taak=` — checklist + comments), `ContentPanel` (`?item=`), `DocPanel`, `DagPanel` (`?dag=`), en `RelatiePanelen.tsx` → `OrganisatiePanel`/`ContactPanel` (`?organisatie=`/`?contact=`, werken op /admin/relaties én /admin/pipeline; create-redirect is route-onafhankelijk). **Relaties-werkblad** `/admin/relaties` (`crm/views/relaties/`): tabs organisaties/contactpersonen als filterbare lijsten (zoek + relatietype + doelgroep + opvolgdatum "vandaag/achterstallig" + tag) met +knoppen en een Opvolgen-kolom (rode pill = achterstallig, amber = vandaag) — dé plek voor prospects/leadlijsten. **CRM sprint 1 (2026-07-09) is gebouwd:** opvolg-reminder (`opvolgenOp` + "Vandaag opvolgen"-blok op home), "+ Maak deal van deze relatie"-knop in beide panelen (POST deals, zet relatietype prospect→lead, redirect naar `?deal=`), `risicoklasse`-select en tags-chips-invoer (`TagsVeld` in `RelatiePanelen.tsx`, `.hm-tagsveld`; veld-wrapper met knoppen = `.hm-veld`, geen `label` — die stuurt clicks naar de eerste knop). Gap-index van wat nog mist (sprint 2: CSV-import + dedupe; sprint 3: bulk/opgeslagen lijsten): `docs/superpowers/specs/2026-07-09-crm-gap-index.md`. **MKB-CRM-plan VOLLEDIG GEBOUWD (sprints A-D, 2026-07-09)**: `docs/superpowers/specs/2026-07-09-crm-mkb-plan.md`. Sprint B/C/D-oppervlak: CRM-instellingen-slideover (potlood op /admin/relaties) met tabs **Sectoren/Functies** (herbruikbare `KolommenBeheer` uit ColumnsPanel.tsx — content zonder slideover-wrapper) en **Velden** (`VeldenBeheer` in CrmInstellingen.tsx); **kolomkiezer** (Columns3-icoon) per tab met aan/uit + ↑/↓-volgorde, aanbod = vaste kolommen + custom velden + risicoklasse/telefoon/laatste-contact; **sorteren op elke kolomkop**, alles per gebruiker in `users.lijstVoorkeuren` (debounced PATCH). Laatste-contact-map wordt in `RelatiesView` server-side uit activities gebouwd (`organisations:1`→ISO). **Gotcha destructieve schemawijziging:** dev-push prompt hangt headless — data exporteren, kolommen zelf via SQL droppen (psql op DATABASE_URI én humanmargin_test), dán pas de configwijziging (push wordt additief); daarna import-script. **Sprint A (relatie-hub):** org-paneel = relatie-hub (contacten aanmaken vooringevuld/koppelen/ontkoppelen/gestapeld openen; inklapbare `<details class="hm-sectie">` Adressen+Facturatie), contactpaneel heeft chips voor telefoons/extraEmails, en de pipeline is verbonden (kaart toont org · contact, board-zoek matcht contactnaam, DealPanel heeft org-gefilterde contact-select + "Gekoppeld"-blok met doorklik). **Paneel-stapeling:** panelen stapelen via query-params (`?deal=X&organisatie=Y&contact=Z`, render-volgorde deal→org→contact); `useMetParams()` (RelatiePanelen, geëxporteerd) bouwt hrefs met param-behoud; sluiten verwijdert alleen de eigen param. `ContactPanel` accepteert `standaardOrganisatie` (voorinvulling bij `contact=nieuw` vanuit een org). Nieuwe record-types volgen ditzelfde patroon; de Payload-editor blijft alleen als "Openen in volledige editor"-fallback.
- **ColumnsPanel** (`shared/components/ColumnsPanel.tsx`, generiek voor `deal-stages`/`task-statuses`, op beide boards achter het potlood-icoon): slepen = `POST /api/reorder` met `{collectionSlug, docsToMove:[id], newKeyWillBe:'less'|'greater', orderableFieldName:'_order', target:{id,key}}` (Payload orderable-endpoint); hernoemen/kleur = PATCH; verwijderen = soft-delete met eigen dialoog (`.hm-dialoog`, géén window.confirm meer).
- **API-laag:** `crmApi` uitgebreid met `getDeal/createDeal/trashDeal/listDealActiviteiten/createDealNotitie`. `euro()` verhuisd naar `shared/ui.ts`.
- **Datum in views:** client-side `Date.now()` in componentbody triggert `react-hooks/purity` — servertijd als `nu`-prop doorgeven (zie `PipelineView`).
- **Taal:** admin is nl-only (`i18n.supportedLanguages: { nl }`) — geen Engelse systeemteksten meer.
- **Thema & mobiel:** `theme: "all"` — dark mode volgt OS/accountvoorkeur; alle `--hm-*`-tokens erven van Payload-elevations dus beide thema's werken (dark-specifieke overrides: toast/multibalk geïnverteerd). Mobiel (<760px): de rail wordt een **bottom-tab-bar** (fixed; `.template-default__wrap` krijgt `grid-column: 1/-1` omdat de fixed rail uit de grid-flow valt — anders klapt de content naar 0px!), boards krijgen kolom-snap (82vw), kalender-grid scrollt horizontaal met minimale dagcel-breedte, kennisbank-tabel scrollt, toast/dragbar/multibalk schuiven boven de tab-bar. Wees-bestanden: `knowledge-docs.afterDelete`-hook ruimt het gekoppelde `knowledge-files`-doc op bij definitief verwijderen. Home heeft een klikbare activity-feed (avatars + type-pills → record-panelen) en een "Deze week"-blok (deals sluitdatum + taak-deadlines).

## Designsysteem (SaaS-redesign, 2026-07-08)

Het dashboard heeft een eigen SaaS-designlaag bovenop de Payload-admin, gegrond in het merk (electric yellow #edff00, Archivo, merk-blauw #002ccf). Referenties: goedgekeurde analyse-artifact + manakuro/asana-clone-app (boards) en subnub/myDrive (kennisbank), herbouwd op onze stack (géén Mongo/Go/Recoil).

- **Tokens + componentkit:** `src/modules/shared/styles/dashboard.scss` — `--hm-*` tokens. Oppervlakken/lijnen erven van Payload's `--theme-elevation-*` (dus licht/donker automatisch; admin staat nu vast op `theme:"light"`, dark-tokens liggen klaar). Kit: `.hm-card(--hover)`, `.hm-pill(+--rose/amber/slate/emerald)`, `.hm-kleur(+--<token>)` (dot + `--k` setter), `.hm-av(--sm)`, `.hm-meter`, `.hm-btn(--primary/--ghost)`, `.hm-seg`, `.hm-slideover`, `.hm-view__head/title`.
- **Radius zit in één token** `--hm-r` (nu 8px voor SaaS-zachtheid; op 0 = volledig scherp/merkpuur). Merk-knoppen blijven scherp (blauw↔geel).
- **Kleurtokens** (Els's kolomkleuren) leven als `--hm-<kleur>` + `.hm-kleur--<kleur>` (groen/blauw/paars/rood/oranje/geel/turquoise/roze/grijs); pills/dots/balken lezen `--k`.
- **UI-helpers:** `src/modules/shared/ui.ts` → `initialen(naam)`, `avatarKleur(seed)` (deterministisch, 8-kleurenpalet). Gebruik voor alle avatars.
- **Per view:** boards `src/modules/shared/components/board.scss` (deal/taak-kaart = `.hm-card .hm-card--hover .hm-deal` met co-avatar/titel/foot/kans-meter); kalender `kalender.scss`; home `home.scss` (stat-tegels + echte fase-verdelingsbalk).
- **HmEditor (herbruikbare teksteditor, 2026-07-09):** `src/components/editor/HmEditor.tsx` + `editor.scss` — Google Docs-achtige editor op Lexical (directe deps `lexical`/`@lexical/*` 0.41.0, zelfde versie als Payload). Schrijft **exact** Payload's richText-JSON (standaard heading/list/quote-nodes + **Payload's eigen LinkNode** uit `@payloadcms/richtext-lexical/client`), dus inhoud is uitwisselbaar met de Payload-admin en `<RichText />`. Werkbalk: undo/redo, bloktypes, vet/cursief/onderstreept/doorhalen/code, lijsten, citaat, hr, link (eigen `$zetLink`-port van Payloads `$toggleLink`); markdown-shortcuts. **Gebruik deze editor overal waar rijketekst-bewerking nodig is** (props: `waarde`, `onWijzig`, `placeholder`, `autoFocus`). `onbekendeNodeTypes(waarde)` detecteert Payload-only nodes (upload/relationship) — dan leesweergave tonen i.p.v. bewerken (dataverlies-guard); zo doet `DocPanel` het.
- **DocPanel (kennisbank):** document dubbelklikken = direct bewerken in het slideover-paneel met autosave (700ms debounce, status Opslaan…/Opgeslagen), titel-inline-edit, zichtbaarheid-pill-toggle. "Nieuw document" opent het paneel (geen Payload-editor meer).
- **Kennisbank = volledige myDrive-verkenner (2026-07-09):** `KennisbankBrowser.tsx` (zijbalk +Nieuw/Kennisbank/Prullenbak · hoofdvlak met breadcrumb, zoek, sorteer, grid/lijst-toggle, snelle toegang · detailrail met type-banner+thumbnail+acties) + `LeesPanel.tsx` (RichText-lezen), `VerplaatsDialoog.tsx` (mini-verkenner), `bestandstype.ts` (mime→label/kleur/icoon, groottes). Interacties: klik=selecteren (⌘=multi), dubbelklik=openen, rechtsklik/⋯=contextmenu (openen/selecteren/hernoemen/verplaatsen/downloaden/prullenbak), native HTML5-drag naar mapkaarten/breadcrumb, bestanden-drop=upload, multi-select-balk onderaan. Prullenbak: query `?trash=true&where[deletedAt][exists]=true`; herstel = PATCH `?trash=true` met `deletedAt:null`; definitief = DELETE `?trash=true` (beheerder).
- **Regels bij uitbreiden:** styling via `--hm-*` tokens (nooit hardcoded hex behalve de kleurtokens); nieuwe admin-component → `generate:importmap`; geen `Date.now()`/`setState` in render (React-lint streng); interne links via `next/link`; elke view importeert `@/modules/shared/styles/dashboard.scss`.
