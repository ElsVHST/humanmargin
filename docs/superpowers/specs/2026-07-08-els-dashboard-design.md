# Els-dashboard — designspec

**Datum:** 2026-07-08 · **Status:** ter review · **Auteur:** Dottie (met Chris)
**Onderzoeksbasis:** `docs/research/dashboard/{twenty,postiz,appflowy,payload-capabilities}.md`

## 1. Doel & context

Els (Human Margin, 2-5 gebruikers) krijgt naast haar site één geïntegreerd dashboard: **CRM, projectmanagement, kennisbank en contentkalender**, volledig verweven via één datamodel. Alles wordt zelf gebouwd bínnen de bestaande Payload-installatie (Next.js 16 + Payload 3.85.2 + Neon Postgres op Vercel), met de open-source-repos Twenty, Postiz en AppFlowy als referentie-architectuur — we draaien ze niet.

**Randvoorwaarden (besloten met Chris):**
- Onderhoudsarm en goedkoop: geen extra servers, geen Redis, geen achtergrondwerkers. Infra blijft exact Vercel + Neon.
- Els beheert kolommen (pipeline-fases, taakstatussen, contentkanalen) volledig zelf: aanmaken, hernoemen, herordenen, verwijderen.
- Multi-user met rollen: **beheerder** (Els + Chris) en **teamlid**.
- Alles in het Nederlands, in de bestaande Human Margin-admin-branding.

**Later (buiten deze spec, schema is er wél op voorbereid):** e-mailsync, support-inbox, social auto-publiceren, boekingen (Cal.com), klant-deellinks met tracking, publieke kennisbank op de site.

## 2. Architectuur

Het dashboard is een **uitbreiding van de bestaande Payload-app** — zelfde repo, database en `/admin`. Modulaire opbouw per domein:

```
src/modules/
  crm/          collections: Organisations, Contacts, Deals, DealStages
  projects/     collections: Projects, Tasks, TaskStatuses
  content/      collections: ContentItems, ContentChannels
  knowledge/    collection:  KnowledgeDocs
  shared/       collection:  Activities + gedeelde veld-presets (eigenaar, position, …)
```

Elke module exporteert zijn collections, admin-views en hooks; `src/payload.config.ts` importeert alleen modules. Bestaande site-collections (`Pages`, `Media`, `Users`, `Subscribers`) blijven onaangeroerd. Admin-groepen: **CRM · Projecten · Content · Kennisbank · Site**.

**Service layer:** domeinlogica in Payload-hooks (server), data-toegang voor de views via één dun getypeerd API-laagje per module (`src/modules/<domein>/api.ts`) bovenop Payload REST. Views praten nooit rechtstreeks met endpoints. Alles is daardoor óók bereikbaar via REST/GraphQL/Local API voor latere integraties.

**Technische keuzes (geverifieerd in `payload-capabilities.md`):**
- Custom admin-views via `admin.components.views` + navigatie via `afterNavLinks`.
- Drag & drop: `@hello-pangea/dnd` (Twenty's productie-board draait erop).
- Client-state: TanStack Query met optimistic updates + rollback; geen Redux/Recoil.
- Datumlogica kalender: `dayjs` (Postiz-patroon).
- Volgorde: Payload's ingebouwde `orderable: true` (fractional indexing) voor kolom-collecties; een eigen numeriek `position`-veld voor kaarten op boards (Twenty-patroon: drop = één update met kolom + positie).
- Soft delete: `trash: true` op alle dashboard-collections — verwijderen = herstelbare prullenbak (les uit alle drie de referentie-apps).
- Nieuwe dependency: `@payloadcms/plugin-nested-docs` (kennisbank-boom), versie in lockstep met Payload.
- **Nul achtergrondwerk in fase 1**: alle logica draait synchroon in hooks. Payload's ingebouwde Jobs Queue is aanwezig voor later (auto-publish), wordt nu bewust niet gebruikt.

## 3. Datamodel

Het knooppunt is de **organisatie**, de rode draad is de **activiteit**. Alle collections: Engelse slugs, Nederlandse labels (repo-conventie), `trash: true`, timestamps aan.

### CRM (referentie: twenty.md §1-4)

| Collection | Velden (kern) |
|---|---|
| `organisations` | naam, website (link), LinkedIn (link), sector, logo (upload→media), notities, tags (vrije tekst, array — geldt voor alle tags-velden in deze spec), eigenaar (→users) |
| `contacts` | voornaam+achternaam, e-mails (array, eerste = primair; **primair adres uniek afgedwongen** — matchsleutel voor latere mailsync), telefoons (array), functie, LinkedIn, avatar, organisatie (→organisations), bron, tags, eigenaar; nieuwsbriefstatus uit bestaand `subscribers` getoond via een klein UI-veld (lookup op e-mailadres — geen join, subscribers heeft geen relatie naar contacts) |
| `deals` | titel, bedrag+valuta (group-veld), fase (→dealStages), **uitkomst** (select: open/gewonnen/verloren + verlorenReden), verwachte sluitdatum, kans %, organisatie (→organisations), contactpersoon (→contacts), eigenaar, `position` (kaartvolgorde) |
| `dealStages` | label, kleur, `orderable: true` — door Els beheerd |

Fase en uitkomst zijn bewust gescheiden: fases zijn door Els bewerkbaar (geen magische "Klant"-fase waar logica aan hangt); de hook "gewonnen → project" hangt aan **uitkomst**, die vast is.

### Projecten

| Collection | Velden (kern) |
|---|---|
| `projects` | naam, status (select: actief/gepauzeerd/afgerond), organisatie (→organisations, optioneel — intern project kan), deal (→deals, herkomst), teamleden (→users, hasMany), start/deadline, omschrijving |
| `tasks` | titel, status (→taskStatuses), project (→projects, optioneel — losse taken kunnen), toegewezen (→users), deadline, prioriteit (select), checklist (array), omschrijving, `position` |
| `taskStatuses` | label, kleur, `orderable: true` — door Els beheerd |

### Content (referentie: postiz.md §1-3)

| Collection | Velden (kern) |
|---|---|
| `contentItems` | titel, type/kanaal (→contentChannels), status (select: idee/concept/gepland/gepubliceerd), **publishDate** (geplande datum+tijd), brief/omschrijving (richtext), gekoppelde pagina (→pages, voor blogposts), organisatie/project (optioneel), toegewezen (→users), publicatielink, `groupId` (tekst, gereserveerd voor multi-kanaal later) |
| `contentChannels` | label, type (select: blog/nieuwsbrief/linkedin/instagram/overig), kleur, `orderable: true` — door Els beheerd. Krijgt bij auto-publish later token-velden erbij (Postiz Integration-model), schema hoeft niet verbouwd |

### Kennisbank (referentie: appflowy.md §3)

| Collection | Velden (kern) |
|---|---|
| `knowledgeDocs` | titel, inhoud (Lexical richtext), parent (nested-docs), tags, zichtbaarheid (select: intern/publiek — publieke rendering is latere fase), organisatie/project (optioneel: "documentatie bij klant X"), auteur |

### Gedeeld (referentie: twenty.md §2)

| Collection | Velden (kern) |
|---|---|
| `activities` | type (select: notitie/statuswijziging/systeem — enum bevat alvast e-mail/boeking voor later), tekst (richtext), targets (**polymorf** relationship → organisations/contacts/deals/projects, hasMany), auteur (→users), happensAt, properties (JSON: voor/na bij statuswijzigingen) |

`users` krijgt een `role`-veld (select: beheerder/teamlid).

## 4. Kolommenbeheer door Els

Geldt voor pipeline-fases, taakstatussen en contentkanalen (elk een eigen kleine collectie):

- **Toevoegen:** "+"-knop rechts naast de laatste kolom op het board zelf.
- **Hernoemen:** inline, klik op de kolomtitel.
- **Herordenen:** kolom slepen; persist via `orderable`.
- **Verwijderen:** bevestigingsdialoog ("X kaarten vallen terug naar 'Geen fase'"); kaarten worden **nooit** verwijderd of geblokkeerd — items met een verwijderde/lege kolomreferentie verschijnen in een virtuele **fallback-kolom** ("Geen fase" / "Geen status" / "Geen kanaal") die het board automatisch toont zolang zulke items bestaan (AppFlowy-patroon, appflowy.md §1-2). Van daaruit sleept Els ze naar een echte kolom.
- Minimaal één echte kolom blijft altijd bestaan. Nieuwe kaarten starten in de eerste kolom.

## 5. Views (custom admin-views)

1. **Dashboard-home** — na inloggen: open deals per fase, mijn taken deze week, geplande content deze week, recente activiteit. Server-rendered via Local API.
2. **Pipeline-board** — kanban van deals per fase; drag & drop = één update (fase + position), optimistic. Kaart: titel, organisatie, bedrag, eigenaar-avatar.
3. **Taken-board** — kanban per status; filter op project en persoon.
4. **Contentkalender** — maand/week/lijst-switch (Postiz-patroon); items op publishDate; slepen = datum wijzigen; bevestigingsmodal bij verslepen van al gepubliceerde items.
5. **Kennisbank** — boomnavigatie (nested docs) + zoeken; schrijven in de bekende Lexical-editor.

Detailpagina's (contact/organisatie/deal/project) = standaard Payload-bewerkschermen + **activiteiten-timeline**-component en join-velden (bv. alle deals en projecten op het organisatiescherm).

## 6. Domeinlogica (hooks)

- **Deal-uitkomst → gewonnen:** maakt automatisch een project aan (naam = dealtitel, organisatie + eigenaar mee), idempotent — bestaat er al een project met die deal-referentie, dan niets.
- **ContentItem (kanaaltype blog) → status gepland:** maakt een concept-`page` aan op de site en koppelt die; idempotent via de bestaande koppeling.
- **Statuswijzigingen** (dealfase, deal-uitkomst, taakstatus, contentstatus) worden automatisch als `activities`-regel gelogd met voor/na in `properties` (Twenty-patroon, twenty.md §4).
- Hook-fouten blokkeren nooit de opslag zelf: try/catch, fout wordt zichtbaar als admin-melding.

## 7. Toegang & rollen

Server-side afgedwongen via access-functies (UI verbergen is nooit de beveiliging):
- **beheerder:** alles — incl. kolom-collecties beheren, prullenbak legen, gebruikersbeheer.
- **teamlid:** lezen/aanmaken/bewerken in alle dashboard-collections; verwijderen (naar prullenbak) mag; prullenbak definitief legen, kolommen beheren en gebruikersbeheer niet.
- Site-collections behouden hun bestaande toegangsregels.

## 8. Foutafhandeling

- Hooks idempotent (zie §6); falende hook = opslag intact + zichtbare melding.
- Boards/kalender: optimistic updates met automatische rollback + toast bij serverfout.
- Verwijderen is altijd soft (prullenbak); definitief verwijderen alleen beheerder, met bevestiging.
- Dangling referenties (bv. verwijderde stage) breken nooit een view — fallback-kolom vangt ze op.

## 9. Testen & kwaliteit

- **Integratietests** (Vitest + Payload Local API, nieuw in dit repo) voor: alle hooks (§6, incl. idempotentie), access control per rol (§7), fallback-gedrag bij kolomverwijdering (§4).
- **Hands-on QA-checklist** per view (drag & drop, inline hernoemen, optimistic rollback, mobiel-bruikbaarheid van de admin-views).
- CI blijft `npm run check` + de nieuwe tests. Na elke schemawijziging: `npm run generate:types`; na nieuwe admin-componenten: `npm run generate:importmap`.
- Migraties: lokaal auto-sync (dev), richting Els's Neon-productie nette Payload-migraties. Seed: NL-standaardkolommen (fases: Lead/Gesprek/Offerte/Klant; taakstatussen: To-do/Bezig/Review/Klaar; kanalen: Blog/Nieuwsbrief/LinkedIn) via seed-script, door Els daarna vrij aanpasbaar.

## 10. Bouwvolgorde

Zes stappen, elk apart opleverbaar; elk stap eindigt met werkende software voor Els:

1. **Fundament** — module-structuur, rollen, kolom-collecties + seed, `activities`, admin-groepen.
2. **CRM** — organisations/contacts/deals + pipeline-board + timeline-component.
3. **Projecten** — projects/tasks + taken-board + gewonnen-hook.
4. **Content** — contentItems/channels + kalender + blog-hook.
5. **Kennisbank** — nested docs, boom-navigatie, zoeken.
6. **Dashboard-home** — overzicht + eindpolish + QA-ronde.

## 11. Kosten

€0 extra: geen nieuwe infra, geen SaaS-abonnementen in fase 1. Latere fases (auto-publish, mailsync) introduceren pas kosten op het moment dat Chris/Els daarvoor kiezen.
