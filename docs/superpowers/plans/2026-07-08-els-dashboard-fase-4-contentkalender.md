# Els-dashboard Fase 4: Contentkalender — Implementation Plan (compact)

> Uitgevoerd inline door Dottie (auto-modus). Zelfde Global Constraints als eerdere fases. Referentie: `docs/research/dashboard/postiz.md`.

**Goal:** Contentplanning in een maand/week/lijst-kalender, gekoppeld aan de site-blog: een gepland blog-item maakt automatisch een conceptpagina aan.

## Beslissingen

1. **`content-items`**: titel, kanaal (→content-channels), status (vaste select: idee/concept/gepland/gepubliceerd, default idee), publishDate (dag+tijd), brief (textarea — bewust géén richtext: de echte content leeft in de gekoppelde pagina; de brief is een korte werkomschrijving), gekoppeldePagina (→pages), organisatie/project (optioneel), toegewezen (→users), publicatielink, `groupId` (hidden, gereserveerd voor multi-kanaal later, Postiz §1). Access-preset + trash, groep Content.
2. **Blog-hook** (`createPageOnPlan`, afterChange): kanaaltype `blog` + status → `gepland` + nog geen gekoppelde pagina ⇒ maakt een concept-`page` (draft; slug geslugified uit titel, bij conflict suffix) en koppelt die terug op het content-item. Idempotent via de koppeling zelf; faalt stil.
3. **Bewuste afwijking van spec §6:** taakstatus- en contentstatus-wijzigingen worden (nog) niet in activities gelogd — `activities.targets` bevat geen tasks/content-items en de boards/kalender tonen die status al direct. Deal-logging (de waardevolle) draait sinds fase 2a.
4. **Kalender-view** `/admin/kalender`: maand (6×7-grid, start maandag), week en lijst; navigatie vorige/volgende/vandaag; items tonen kanaal-kleurstip + statusbadge; slepen naar een andere dag = PATCH publishDate (tijd blijft behouden) met bevestiging als het item al gepubliceerd is (Postiz-UX); items zonder publishDate verschijnen alleen in de lijstweergave ("Nog niet gepland"). Pure datum/groepeer-logica in `lib.ts` met unit-tests.
5. **Nav:** Kalender toegevoegd aan `DashboardNavLinks`.

## Taken

- [x] T1: unit-tests kalender-lib (maandgrid, itemsPerDag) + int-tests blog-hook → collectie + hook + registratie → types → groen → commit
- [x] T2: kalender-view (maand/week/lijst + dnd + bevestiging) + contentApi + nav + importmap → browser-QA → commit
- [x] T3: skill-docs + push
