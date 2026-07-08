# Els-dashboard Fase 3: Projecten & taken — Implementation Plan (compact)

> Uitgevoerd inline door Dottie in dezelfde sessie als fase 1/2 (auto-modus). Zelfde Global Constraints als fase 1/2a/2b. Patronen zijn gevestigd; dit plan legt structuur en beslissingen vast, de code volgt de bewezen recepten (factory/presets/board).

**Goal:** Klant- en interne projecten met taken-kanban, plus de "deal gewonnen → project"-automatisering — verweven met CRM via relaties en de gedeelde timeline.

## Beslissingen

1. **`projects`**: naam, status (vaste select: actief/gepauzeerd/afgerond, default actief), organisatie (→organisations, optioneel — interne projecten), deal (→deals, herkomst), teamleden (→users hasMany), startdatum, deadline, omschrijving (textarea), timeline-ui-veld. Joins: `organisations.projecten`, taken-join op project. `dashboardCollectionAccess` + trash.
2. **`tasks`**: titel, status (→task-statuses), project (→projects, optioneel — losse taken), toegewezen (→users), deadline, prioriteit (vaste select laag/normaal/hoog, default normaal), checklist (array: tekst + klaar), omschrijving, `position` (zelfde beforeChange-patroon als deals). Join: `projects.taken`.
3. **Gewonnen-hook** (`createProjectOnWin`, afterChange op deals ná de log-hook): alleen bij overgang naar `gewonnen`; idempotent via find op `projects.deal`; project erft naam/organisatie van de deal, aanmaker wordt teamlid; faalt stil (spec §8).
4. **`activities.targets`** += `projects`; timeline-ui-veld ook op projects.
5. **Taken-board** op `/admin/taken`: `lib.ts` gegeneraliseerd (`buildGenericColumns` + dunne deal/taak-wrappers, bestaande API blijft), `ColumnHeader` geëxtraheerd naar shared, `projectsApi` (updateTask + status-CRUD), client-side filters op project en toegewezen persoon, kaart toont titel/project/deadline (rood bij overschrijding)/prioriteit/initialen. Kolommenbeheer identiek aan pipeline (beheerder).
6. **Nav**: één `DashboardNavLinks`-component (Pipeline + Taken, uitbreidbaar voor kalender/kennisbank/home) vervangt PipelineNavLink.

## Taken

- [x] T1: failing int-tests (projects/tasks CRUD, gewonnen-hook idempotent, activities-target projects) → collecties + hook + registratie → types → groen → commit
- [x] T2: lib-generalisatie (unit-tests blijven groen) + ColumnHeader shared → TakenBoard + view + navlinks + importmap → browser-QA (board, filters, dnd) → commit
- [x] T3: skill-docs + push
