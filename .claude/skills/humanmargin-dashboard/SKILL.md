---
name: humanmargin-dashboard
description: Use when working in or on the Els-dashboard (CRM, projecten, taken, contentkalender, kennisbank) — answering Els's data questions, performing actions for her via the Local API (deals verplaatsen, taken/content aanmaken, kolommen beheren), extending dashboard modules/views/hooks, or debugging boards and timeline.
---

# Human Margin — Els-dashboard (Dottie's systeemindex)

Het dashboard leeft ín de Payload-admin van de site (zelfde app, zelfde Neon-DB). Els werkt via de UI; ik (Dottie) werk als haar AI-partner via de **Local API** (`npx payload run` scripts) of REST. Alles wat ik doe volgt dezelfde regels als de UI: hooks vuren, timeline logt, prullenbak vangt op, access geldt (Local API met `overrideAccess: false` + `user` om als iemand te handelen).

## Kaart van het systeem

| Domein | Collections (slug) | Werk-oppervlak | Module |
|---|---|---|---|
| CRM | `organisations`, `contacts`, `deals`, `deal-stages` | `/admin/pipeline` (kanban) | `src/modules/crm/` |
| Projecten | `projects`, `tasks`, `task-statuses` | `/admin/taken` (kanban + filters) | `src/modules/projects/` |
| Content | `content-items`, `content-channels` | `/admin/kalender` (maand/week/lijst) | `src/modules/content/` |
| Kennisbank | `knowledge-docs` (parent-boom) + `knowledge-files` (uploads) | `/admin/kennisbank` (myDrive-verkenner) | `src/modules/knowledge/` |
| Gedeeld | `activities` (polymorfe timeline) | Home: `/admin` (overzicht) | `src/modules/shared/` |

Site-collections (`pages`, `media`, `users`, `subscribers`) staan los hiervan — zie skill `humanmargin-payload-cms` voor schema-conventies, testinfra en alle fase-details.

## Kernvelden per collectie (voor queries en creates)

- **organisations**: naam*, website, linkedin, sector, logo→media, notities, tags[], eigenaar→users. Joins: `contacten`, `deals`, `projecten`.
- **contacts**: voornaam*, achternaam, `naam` (auto), **email* uniek** (matchsleutel), extraEmails[], telefoons[], functie, organisatie→, bron, tags[], eigenaar→. Join: `deals`.
- **deals**: titel*, bedrag+valuta, fase→deal-stages (nullable → "Geen fase"-kolom), **uitkomst*** (open/gewonnen/verloren — vast!), verlorenReden, verwachteSluitdatum, kans, organisatie→, contactpersoon→, eigenaar→, position (auto).
- **projects**: naam*, status* (actief/gepauzeerd/afgerond — vast), organisatie→ (leeg=intern), deal→ (herkomst), teamleden[]→users, startdatum, deadline, omschrijving. Join: `taken`.
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
- **ColumnsPanel** (`shared/components/ColumnsPanel.tsx`, generiek voor `deal-stages`/`task-statuses`, op beide boards achter het potlood-icoon): slepen = `POST /api/reorder` met `{collectionSlug, docsToMove:[id], newKeyWillBe:'less'|'greater', orderableFieldName:'_order', target:{id,key}}` (Payload orderable-endpoint); hernoemen/kleur = PATCH; verwijderen = soft-delete met eigen dialoog (`.hm-dialoog`, géén window.confirm meer).
- **API-laag:** `crmApi` uitgebreid met `getDeal/createDeal/trashDeal/listDealActiviteiten/createDealNotitie`. `euro()` verhuisd naar `shared/ui.ts`.
- **Datum in views:** client-side `Date.now()` in componentbody triggert `react-hooks/purity` — servertijd als `nu`-prop doorgeven (zie `PipelineView`).

## Designsysteem (SaaS-redesign, 2026-07-08)

Het dashboard heeft een eigen SaaS-designlaag bovenop de Payload-admin, gegrond in het merk (electric yellow #edff00, Archivo, merk-blauw #002ccf). Referenties: goedgekeurde analyse-artifact + manakuro/asana-clone-app (boards) en subnub/myDrive (kennisbank), herbouwd op onze stack (géén Mongo/Go/Recoil).

- **Tokens + componentkit:** `src/modules/shared/styles/dashboard.scss` — `--hm-*` tokens. Oppervlakken/lijnen erven van Payload's `--theme-elevation-*` (dus licht/donker automatisch; admin staat nu vast op `theme:"light"`, dark-tokens liggen klaar). Kit: `.hm-card(--hover)`, `.hm-pill(+--rose/amber/slate/emerald)`, `.hm-kleur(+--<token>)` (dot + `--k` setter), `.hm-av(--sm)`, `.hm-meter`, `.hm-btn(--primary/--ghost)`, `.hm-seg`, `.hm-slideover`, `.hm-view__head/title`.
- **Radius zit in één token** `--hm-r` (nu 8px voor SaaS-zachtheid; op 0 = volledig scherp/merkpuur). Merk-knoppen blijven scherp (blauw↔geel).
- **Kleurtokens** (Els's kolomkleuren) leven als `--hm-<kleur>` + `.hm-kleur--<kleur>` (groen/blauw/paars/rood/oranje/geel/turquoise/roze/grijs); pills/dots/balken lezen `--k`.
- **UI-helpers:** `src/modules/shared/ui.ts` → `initialen(naam)`, `avatarKleur(seed)` (deterministisch, 8-kleurenpalet). Gebruik voor alle avatars.
- **Per view:** boards `src/modules/shared/components/board.scss` (deal/taak-kaart = `.hm-card .hm-card--hover .hm-deal` met co-avatar/titel/foot/kans-meter); kalender `kalender.scss`; home `home.scss` (stat-tegels + echte fase-verdelingsbalk).
- **Kennisbank = volledige myDrive-verkenner (2026-07-09):** `KennisbankBrowser.tsx` (zijbalk +Nieuw/Kennisbank/Prullenbak · hoofdvlak met breadcrumb, zoek, sorteer, grid/lijst-toggle, snelle toegang · detailrail met type-banner+thumbnail+acties) + `LeesPanel.tsx` (RichText-lezen), `VerplaatsDialoog.tsx` (mini-verkenner), `bestandstype.ts` (mime→label/kleur/icoon, groottes). Interacties: klik=selecteren (⌘=multi), dubbelklik=openen, rechtsklik/⋯=contextmenu (openen/selecteren/hernoemen/verplaatsen/downloaden/prullenbak), native HTML5-drag naar mapkaarten/breadcrumb, bestanden-drop=upload, multi-select-balk onderaan. Prullenbak: query `?trash=true&where[deletedAt][exists]=true`; herstel = PATCH `?trash=true` met `deletedAt:null`; definitief = DELETE `?trash=true` (beheerder).
- **Regels bij uitbreiden:** styling via `--hm-*` tokens (nooit hardcoded hex behalve de kleurtokens); nieuwe admin-component → `generate:importmap`; geen `Date.now()`/`setState` in render (React-lint streng); interne links via `next/link`; elke view importeert `@/modules/shared/styles/dashboard.scss`.
