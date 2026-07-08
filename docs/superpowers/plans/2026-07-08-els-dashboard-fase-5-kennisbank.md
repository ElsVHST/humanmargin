# Els-dashboard Fase 5: Kennisbank — Implementation Plan (compact)

> Uitgevoerd inline door Dottie (auto-modus). Zelfde Global Constraints. Referentie: `docs/research/dashboard/appflowy.md` §3-4 (documentboom-UX).

**Goal:** Een doorzoekbare kennisbank met paginaboom, geschreven in de vertrouwde Lexical-editor, met prullenbak en (voorbereide) publiek/intern-vlag.

## Beslissingen

1. **`knowledge-docs`**: titel, inhoud (Lexical richText — zelfde editor als de site), parent (self-relationship → boom), `position` (sibling-volgorde, zelfde patroon als kaarten), zichtbaarheid (vaste select intern/publiek, default intern — publieke site-rendering is een latere fase), tags, organisatie/project (optioneel: "documentatie bij klant X"), auteur (default ingelogde gebruiker), trash + access-preset, groep "Kennisbank".
2. **Bewuste afwijking van de spec:** géén `@payloadcms/plugin-nested-docs` — een eigen `parent`-relatie + `position` dekt de boom zonder extra dependency; de plugin-meerwaarde (breadcrumbs/URL's) is pas relevant bij publieke rendering. AppFlowy-les blijft: verwijderen = prullenbak, herstelbaar.
3. **Kennisbank-view** `/admin/kennisbank`: boomnavigatie (inklapbaar per tak), zoekveld dat de boom filtert op titel, klik = openen in de Lexical-editview, "+ Nieuw document" (root) en "+" per tak (maakt direct een subdocument via POST en navigeert naar de editor). Verslepen-om-te-nesten is bewust v2 — hernesten kan via het parent-veld in de editview.
4. **Boomlogica** puur in `lib.ts` (`buildTree`: roots + children gesorteerd op position; docs met verdwenen parent worden root) met unit-tests.
5. **Nav:** Kennisbank in `DashboardNavLinks`.

## Taken

- [x] T1: unit-tests buildTree + int-tests (parent-koppeling, default zichtbaarheid intern) → collectie + registratie → types → groen → commit
- [x] T2: view (boom + zoeken + subdocument-knop) + nav + importmap → browser-QA → commit
- [x] T3: skill-docs + push
