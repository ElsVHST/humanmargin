# Payload 3.85.2 — capability-verificatie voor het dashboard-ontwerp

> Eigen verificatie tegen de geïnstalleerde packages in deze repo (node_modules), 2026-07-08. Elk ontwerpbesluit hieronder is bevestigd tegen de werkelijke types — niet uit geheugen.

| # | Ontwerpbesluit | Status | API (bevestigd in types) |
|---|---|---|---|
| 1 | Custom admin-views met eigen routes | ✅ | `admin.components.views` map (`AdminViewConfig`, ook `dashboard` vervangbaar) — `node_modules/payload/dist/config/types.d.ts:746-753`. Nav-ingangen via `afterNavLinks`/`beforeNavLinks` (`types.d.ts:690`); experimenteel `admin.dashboard` widgets-config aanwezig. |
| 2 | Importmap-flow voor admin-componenten | ✅ | `npm run generate:importmap` bestaat al in dit repo (gebruikt voor admin-branding Logo/Icon); `admin.importMap` + `admin.dependencies` in config-types. |
| 3 | Polymorfe `activities` | ✅ | Relationship-veld met `relationTo: ['contacts','organisations','deals','projects']` (+ `hasMany`) is standaard Payload; opgeslagen als `{relationTo, value}`; te queryen met `where: { 'targets.value': ..., 'targets.relationTo': ... }`. |
| 4 | Join-velden ("alle deals op het organisatiescherm") | ✅ | `type: 'join'` veldtype — `node_modules/payload/dist/fields/config/types.d.ts:1378`, zelfs met `orderable` optie op de join (r.1376). |
| 5 | Kolomvolgorde door Els beheerbaar | ✅ | `orderable: true` op collections — `collections/config/types.d.ts:594`; gebruikt **fractional indexing** onder de motorkap (zelfde idee als Twenty's float `position`), drag-reorder in de admin-lijst. Gemarkeerd `@experimental`. Fallback: eigen numeriek `position`-veld. |
| 6 | Bewerkbare kolommen als collectie i.p.v. select-opties | ✅ (juiste patroon) | Select-opties zijn build-time config in Payload; runtime-bewerkbare kolommen vereisen een eigen collectie (`stages`, `taskStatuses`, `channels`) + relationship — precies wat het ontwerp doet. |
| 7 | Kennisbank-boom | ✅ (installeren) | `@payloadcms/plugin-nested-docs` is nog niet geïnstalleerd; @payloadcms-plugins versies lopen in lockstep met payload (3.85.2 beschikbaar). Levert `parent` + breadcrumbs. Alternatief: eigen `parent`-relatie + `position`. |
| 8 | Prullenbak / soft delete | ✅ ingebouwd | `trash: true` per collectie — `collections/config/types.d.ts:603-611`: zet `deletedAt`, admin krijgt trash-weergave. Dekt de AppFlowy-les "verwijderen = herstelbaar". |
| 9 | Rollen (beheerder/teamlid) | ✅ | Standaard access-functies op collection- en veldniveau o.b.v. `req.user` (rolveld op Users toevoegen). Server-side afgedwongen. |
| 10 | Jobs queue (later, voor auto-publish) | ✅ aanwezig | `node_modules/payload/dist/queues/` — payload.jobs (tasks/workflows, autorun/cron). Fase 1 gebruikt dit bewust níet. |
| 11 | Admin-groepen | ✅ | `admin.group` al in gebruik (`src/collections/Pages.ts:36`, group "Content"); nieuwe groepen CRM/Projecten/Kennisbank volgen dezelfde conventie, NL-labels zoals de rest van de admin. |

**Repo-conventies voor nieuwe modules** (uit CLAUDE.md/AGENTS.md + bestaande code): Nederlandse labels op alle velden; na schemawijziging `npm run generate:types`; na nieuwe admin-componenten `npm run generate:importmap`; content bewerkbaar door Els = veld in Payload, styling = component; TypeScript strict, named exports, 2-space indent; CI = `npm run check`.
