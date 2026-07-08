---
name: humanmargin-payload-cms
description: Use when working on this project's Payload CMS — changing collections/fields/blocks schema, seeding content, admin panel styling or components, generate:types/importmap errors, database or migration issues, or preparing the Vercel/Neon deploy.
---

# Human Margin — Payload CMS

## Overview

Payload 3.85.2 embedded in de Next-app. Entry: `src/payload.config.ts`. Collections: `pages` (blocks-layout, drafts+autosave+live preview), `media` (uploads → `public/media`), `users`, `subscribers` (nieuwsbrief). Globals: `header`, `footer`. Admin op `/admin`, Nederlands, volledig gebrand. **Kernregel: Els moet alles kunnen bewerken** — content in velden (NL-labels), styling in components. Voor frontend-conventies: zie skill `humanmargin-website`. Voor generieke Payload-API-vragen: de globale `/payload`-skill.

## Workflows

**Nieuw block:** `src/blocks/<Naam>/config.ts` (slug, interfaceName, NL-labels) + `Component.tsx` → registreren in `src/blocks/index.ts` (beide lijsten) → `npm run generate:types` → tsc. Content via seed, niet hardcoded.

**Schema gewijzigd:** altijd `npm run generate:types` (schrijft `src/payload-types.ts` — NOOIT hand-editen). Admin-componenten toegevoegd: ook `npm run generate:importmap`.

**Seeden:** `PAGES=<slug,slug> npx payload run scripts/seed/seed-pages.ts` (idempotent; alle pagina-modules in `scripts/seed/pages/*.ts`, type `PageSeed`). Helpers: `scripts/seed/lexical.ts` (richText/htmlToLexical), `media-map.ts` (WP-URL → media-id). Media/globals: `seed-media.ts`, `seed-globals.ts`. Seeds geven `context: { skipRevalidate: true }` mee — verplicht buiten een Next-request.

**Admin-branding:** alles in `src/app/(payload)/custom.scss` (thema-vars licht+donker, merk-knoppen, zwarte nav, login) + `src/components/admin/{Logo,Icon}.tsx`. Nieuwe admin-schermen stylen: eerst class inspecteren (Playwright), dan gericht in custom.scss — geen inline styles in Payload-templates.

## Gotchas (allemaal al eens misgegaan)

| Symptoom | Oorzaak → fix |
|---|---|
| `ERR_REQUIRE_ASYNC_MODULE` bij payload CLI | `"type": "module"` ontbreekt in package.json (staat er nu — niet weghalen) |
| `payload run`-script hangt stil | Drizzle-push wacht op interactieve bevestiging bij destructieve schemawijziging. Dev-DB is wegwerpbaar: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` op Neon, dan seed-media → seed-globals → seed-pages |
| `Invariant: static generation store missing in revalidatePath` | Hook draait buiten request-context → seed zonder `skipRevalidate`-context |
| Types-fout op nieuw block in andere worktree/agent | payload-types nog niet geregenereerd — race; `npm run generate:types` op master |
| `media niet gevonden in map` bij seed | WP-URL met size-suffix; `media()` probeert origineel — anders ontbreekt het bestand in `.seed-assets/media` + `media-manifest.json` |
| Admin toont Engelse UI | Taal volgt browser; `i18n.fallbackLanguage: "nl"` staat in config |

## Omgeving & deploy

`.env` (gitignored): `DATABASE_URI` (Neon van Els), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`. Lokale fallback-DB: `brew services start postgresql@17`, db `humanmargin`. Dev-login: zie `clone-qa-status.md` in projectgeheugen. **Voor Vercel-deploy:** media staat nu op disk — `@payloadcms/storage-vercel-blob` toevoegen (zie `/payload` sub-skill storage-vercel-blob) en dev-push vervangen door echte migraties (`payload migrate:create`).

## Dashboard-modules (Fase 1: fundament)

- **Module-structuur:** dashboard-collections leven in `src/modules/<domein>/collections/` met een `index.ts` per module die `<domein>Collections: CollectionConfig[]` exporteert; `src/payload.config.ts` spreidt die arrays in `collections`. Gedeelde bouwstenen (access-helpers, kolomcollectie-factory) in `src/modules/shared/`.
- **Rollen:** `users.role` = `beheerder` | `teamlid` (select, `saveToJWT`). Access-helpers: `isAuthenticated`, `isBeheerder`, `isBeheerderOrSelf`, `beheerderFieldOnly` uit `src/modules/shared/access.ts`. Promoveren: `npx payload run scripts/seed/make-beheerder.ts -- <email>`.
- **Kolom-collecties** (door Els beheerd): `deal-stages`, `task-statuses`, `content-channels` via `makeColumnCollection()` — `orderable: true` (fractional `_order`), `trash: true` (prullenbak), alleen beheerders muteren. `content-channels.type` is een vaste enum (blog/nieuwsbrief/linkedin/instagram/overig) waar hooks aan hangen. Standaardseed: `npx payload run scripts/seed/seed-dashboard-columns.ts` (idempotent).
- **Tests:** `npm test` (Vitest + Local API). Tests draaien ALTIJD tegen de lokale `humanmargin_test`-database — `tests/int/setup.ts` overschrijft `DATABASE_URI` onvoorwaardelijk (bescherming van Els's Neon). Testdatabase aanmaken: `createdb humanmargin_test`.
- **Spec & onderzoek:** `docs/superpowers/specs/2026-07-08-els-dashboard-design.md`, `docs/research/dashboard/`.

## Dashboard-modules (Fase 2a: CRM-datamodel)

- **CRM-collecties:** `organisations`, `contacts` (uniek `email` = matchsleutel; `naam` auto uit voor+achternaam), `deals` (`fase`→deal-stages optioneel, `uitkomst` vast open/gewonnen/verloren, `position` auto voor kaartvolgorde). Joins: `organisations.contacten`, `organisations.deals`, `contacts.deals`.
- **Timeline:** `activities` in `src/modules/shared/collections/` — polymorf `targets` (hasMany → organisations/contacts/deals; fase 3 voegt projects toe), types notitie/statuswijziging/systeem/email/boeking. Deal-hook `logDealStatusChange` logt fase/uitkomst-wijzigingen met voor/na in `properties`; faalt stil.
- **Presets:** `dashboardCollectionAccess` (teamlid: CRUD + prullenbak — Payload geeft delete-access `data` mee bij trash-poging; permanent verwijderen alleen beheerder), `eigenaarField`, `tagsField` in `src/modules/shared/`.
- **Let op bij create-calls in code/tests:** verplichte selects met defaultValue (zoals `deals.uitkomst`) moeten in getypeerde Local-API-calls expliciet mee.

## Dashboard-modules (Fase 2b: pipeline-UI)

- **Pipeline-board:** custom admin-view op `/admin/pipeline` — `src/modules/crm/views/pipeline/` (PipelineView = server/Local API, PipelineBoard = client/React Query + @hello-pangea/dnd, lib.ts = pure kolom/positie-logica met unit-tests). Registratie: `admin.components.views.pipeline` + `afterNavLinks` in payload.config.
- **Board-gedrag:** alleen open deals; drop = één PATCH {fase, position} optimistic met rollback; wees-deals (fase leeg/verwijderd) vallen in virtuele kolom "Geen fase" vooraan; kolommen toevoegen/inline hernoemen/verwijderen (bevestiging + terugval) alleen beheerder; kolom-вolgorde via de Pipeline-fases-lijst.
- **REST-laag:** `src/modules/crm/api.ts` (`crmApi.updateDeal/createStage/updateStage/trashStage`) — views praten nooit rechtstreeks met endpoints.
- **Timeline:** ui-veld `/components/admin/Timeline#TimelineField` op deals/organisaties/contacten — toont activities polymorf + notitie-invoer (POST activities met `samenvatting`). Statuswijzigingen krijgen leesbare namen (hook zoekt fase-namen op, ook uit prullenbak).
- **Nieuwsbriefstatus:** ui-veld `/components/admin/NieuwsbriefStatus` op contacten — live subscribers-lookup op e-mail.
- **Admin-componenten:** na elke nieuwe component `npm run generate:importmap`; styling in eigen .scss op Payload-theme-vars (`--theme-elevation-*`), zelfde patroon als custom.scss.

## Dashboard-modules (Fase 3: projecten & taken)

- **Collecties:** `projects` (status vast: actief/gepauzeerd/afgerond; organisatie optioneel = intern; join `taken`; timeline-ui-veld) en `tasks` (status→task-statuses, project optioneel = losse taak, prioriteit vast laag/normaal/hoog, checklist-array, `position`). Join `organisations.projecten`.
- **Gewonnen-hook:** `createProjectOnWin` (afterChange deals, ná log-hook) — deal-uitkomst → gewonnen maakt idempotent één project (naam/organisatie van de deal, aanmaker = teamlid), faalt stil.
- **Taken-board:** `/admin/taken` — `src/modules/projects/views/taken/` + `projectsApi`. Client-side filters op project en toegewezen persoon; kaart-badges: prioriteit hoog (rood) en deadline (rood indien verstreken). Kolommenbeheer identiek aan pipeline.
- **Gedeeld:** `buildGenericColumns` in pipeline/lib.ts (wrappers `buildColumns` en `buildTaskColumns`); `ColumnHeader` in `src/modules/shared/components/`; boardstyling in `src/modules/shared/components/board.scss`; nav via `DashboardNavLinks` (uitbreiden bij nieuwe views).
- **activities.targets** bevat nu ook `projects`.

## Dashboard-modules (Fase 4: contentkalender)

- **Collectie:** `content-items` (kanaal→content-channels, status vast idee/concept/gepland/gepubliceerd, publishDate dag+tijd, brief textarea, gekoppeldePagina→pages, organisatie/project/toegewezen optioneel, `groupId` gereserveerd). Zonder publishDate alleen zichtbaar in de lijstweergave.
- **Blog-hook:** `createPageOnPlan` — kanaaltype blog + status→gepland zonder koppeling ⇒ conceptpagina (draft, geslugificeerde titel, conflict-suffix) + terugkoppeling op het item; hook geeft het bijgewerkte doc terug zodat de API-respons de koppeling direct toont. Idempotent, faalt stil.
- **Kalender:** `/admin/kalender` — `src/modules/content/views/kalender/` (lib.ts: maandGrid/weekDagen/itemsPerDag, unit-getest; maandgrid start maandag, 42 dagen). Slepen naar een dag = PATCH publishDate met behoud van tijd; bevestiging bij gepubliceerde items; vandaag-markering; kanaal-kleurstip + statusbadge per item.
- **Bewuste afwijking spec §6:** taak-/contentstatus-wijzigingen worden niet in activities gelogd (targets bevatten geen tasks/content-items; boards/kalender tonen status al).
