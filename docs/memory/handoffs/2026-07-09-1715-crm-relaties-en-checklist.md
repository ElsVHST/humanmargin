# Handoff — CRM-relaties gebouwd; volgende sessie: sprint 1 gap-index uitvoeren

**Datum:** 2026-07-09 ~17:15 · **Repo:** master, **18 commits LOKAAL — NOG NIET GEPUSHT** (wacht op akkoord Chris) · **Vorige handoff:** `2026-07-09-1230-ui-overhaul-fase1-3.md` (met 2 aanvullingen — lees die voor alles van eerder vandaag: shell, pipeline 2.0, panelen, kennisbank/HmEditor, cross-koppelingen, in-the-loop OS, dark/mobiel)

## ⚡ Directe opdracht voor de volgende sessie

**Voer sprint 1 uit de CRM gap-index uit** (`docs/superpowers/specs/2026-07-09-crm-gap-index.md`) — Chris heeft dit werk al gesanctioneerd ("dit systeem is nog niet klaar"). Sprint 1 = de dagelijkse prospectie-loop compleet maken:

1. **Opvolg-reminder per relatie**: veld `opvolgenOp` (date) op organisations + contacts (patroon: zie `relatietype`-veld in beide collecties); tonen/zetten in `RelatiePanelen.tsx`; kolom + "vandaag/achterstallig"-filter in `RelatiesLijst.tsx`; blok "Vandaag opvolgen" op home (`HomeView.tsx` — zie "Deze week"-blok als voorbeeldquery met datumvenster).
2. **"Maak deal van deze relatie"**: knop in het organisatie- en contactpaneel → POST /api/deals `{titel: "<orgnaam> — nieuw", uitkomst: "open", organisatie/contactpersoon}` → router.replace naar `/admin/pipeline?deal=<id>`. Zet relatietype automatisch prospect→lead (Pipedrive-kwalificatie).
3. **Risicoklasse-veld** (hoog/verboden/geen) op organisations + contacts — exact hetzelfde patroon als `doelgroep` (zelfde bestanden, zelfde plekken in panel + lijst + filter). Dit is de tweede as van Els's kwadrant (W8/W14).
4. **Tags bewerken + filteren**: tags[] bestaat al op het schema; voeg chips-input toe in de panelen (patroon: `ReferentiesVeld` is vergelijkbaar maar simpeler — vrije tekst) en een tag-filter in de lijst.

Na sprint 1: `npm run check` + `npm test` + browser-QA + commit, skill bijwerken, dan door naar sprint 2 (CSV-import + dubbel-detectie) als Chris akkoord is.

## /admin/relaties — alles wat je moet weten

**Wat het is:** het Pipedrive "Contacts"-werkblad — organisaties & contactpersonen als filterbare lijsten; dé plek voor prospects en leadlijsten. Zit in de rail (Contact-icoon, tussen Pipeline en Taken).

**Bestanden:**
- `src/modules/crm/views/relaties/RelatiesView.tsx` — server view (fetcht orgs + contacts, limit 1000, depth 1), geregistreerd in `payload.config.ts` → views.relaties (path `/relaties`), staat in de importmap.
- `src/modules/crm/views/relaties/RelatiesLijst.tsx` — client: tabs (`?tab=organisaties|contacten`), zoek + relatietype-filter + doelgroep-filter (client-side), tabellen met avatar/label-pills, rij-klik → paneel. Queries: `["relaties","organisaties"]` en `["relaties","contacten"]`.
- `src/modules/crm/views/relaties/relaties.scss` — tabelstijl (zelfde patroon als kennisbank-lijst), mobiel overflow-x.
- Panelen: `src/modules/crm/views/pipeline/RelatiePanelen.tsx` (`OrganisatiePanel` + `ContactPanel`, params `?organisatie=` / `?contact=`, waarde `nieuw` = create). **Route-onafhankelijk**: create-redirect gebruikt `window.location.pathname`; werken op /admin/relaties én /admin/pipeline. Detail-panelen hebben: inline autosave-velden, relatietype/doelgroep-selects, gekoppelde deals + contactpersonen (klikbare rijen), RecordTijdlijn, "Openen in volledige editor"-fallback.

**Schema (net toegevoegd, types gegenereerd):** `relatietype` (select: prospect/lead/klant/partner/overig, defaultValue prospect, NIET required) en `doelgroep` (select: zzp/mkb/aanbieder/overig, optioneel) op **beide** `Organisations.ts` en `Contacts.ts`, vlak boven `tagsField`.

**Links ernaartoe:** ⌘K-zoek (organisaties/contacten), home-feed (`activiteitHref`), quick-add-menu — allemaal naar `/admin/relaties?...`.

**Getest:** prospect aanmaken via + Organisatie ("Testbureau Fotografie BV", staat nog in de dev-DB als voorbeeld), redirect naar detail-paneel, labels in de lijst, filters. Check + 49 tests groen.

## Openstaande checklist (volledig)

### Proces
- ⬜ **PUSHEN** — 18 commits lokaal (`ff0c06b`…`7e7ce2a`); wacht op Chris's akkoord
- ⬜ Review-ronde Chris/Els op álle UI van 2026-07-09 (niets is door anderen gezien)
- ⬜ 8 vragen aan Els (staan in §6 van de braindump-analyse): checknaam, checkvragen+uitkomsten, bronnenlijst ochtendmail, AC koppelen/migreren, licentiemodel-vorm, betaalprovider (voorstel Mollie), tijd-KPI's, toegang Tally/AC
- ⬜ Vercel-deploy (env vars, media→Blob, dev-push→migraties)

### CRM gap-index (`specs/2026-07-09-crm-gap-index.md`)
- ⬜ **Sprint 1** (zie boven — DIRECT OPPAKKEN)
- ⬜ Sprint 2: CSV-import met kolom-mapping + dubbel-detectie/merge
- ⬜ Sprint 3: bulk-acties, opgeslagen lijsten/views, kolom-sorteren, laatste-contact-kolom, deals-lijstweergave + forecast, telefoons/extra e-mails in contactpaneel, notities-veld vs tijdlijn opschonen

### Els's routekaart (braindump: `specs/2026-07-09-els-braindump-analyse.md`, wensen W1-W31)
- ⬜ Fase A-rest: W1 formats + inspreken→concept, W5-rest AI-beeldtagging, W13-rest reminders (= sprint 1 pt 1), testimonials/bronnen/brand-kit-mappen seeden
- ⬜ Fase B: Reality Check native + gepersonaliseerd rapport + CRM-tags + AC-sync (W8-11) — *wacht op Els's antwoorden*
- ⬜ Fase C: publieke kennisbank-rendering + GPT-rapport-generator (W12)
- ⬜ Fase D: repurposing-motor + transcript/shownotes + ochtendmail (W2/W7/W18) — *wacht op bronnenlijst*
- ⬜ Fase E: masterclass-automatisering (W19)
- ⬜ Fase F: Academy + Mollie + affiliates + licenties, Huddle/Plug&Pay eruit (W20-22)
- ⬜ Fase G: KPI-dashboard (W23-31)
- ⬜ Fase H: eigen mailmotor, AC opzeggen
- ⬜ Los: LinkedIn DM quick-capture (W15)

### Klein/optioneel
- ⬜ Eerste echte agent-run door de in-the-loop-queue (OS staat: agent-user Dottie, stages, SOP-map; conventies in de dashboard-skill)
- ⬜ Integratietests voor nieuwe flows (won/verloren, kolom-reorder, upload, relaties)
- ⬜ Diepere restyling resterende Payload-schermen (nl-only staat al)

## Stand van het systeem (na vandaag)

Werkbladen: Home · Pipeline (kanban + won/lost + kolommenpanel) · **Relaties (nieuw)** · Taken (kanban + checklist-meters) · Kalender (content + taak-deadlines + dagpaneel) · Kennisbank (myDrive + HmEditor Google-Docs-editor). Alles opent in slideover-panelen (geen-subpagina's-regel), overal comments-tijdlijn + kennisbank-referenties, dark mode aan (`theme: "all"`), volledig responsive (mobiel = bottom-tab-bar), admin nl-only. In-the-loop OS staat klaar. Skill `humanmargin-dashboard` is actueel en dekt alles — **lees die eerst**.

## Gotchas voor de volgende sessie

- Dev-login: chris@co-creatie.ai / humanmargin-dev-2026 (sessie verloopt; login via `fetch('/api/users/login',…)` in paginacontext — React-form vult niet via .value).
- Verplichte selects met defaultValue expliciet meesturen bij Local-API-creates (deals.uitkomst, knowledge-docs.soort/zichtbaarheid, tasks.prioriteit, content-items.status). `relatietype` is bewust NIET required (voorkomt kettingreactie in tests/seeds).
- hello-pangea: droppables nooit (un)mounten tijdens drag; geen geneste DragDropContexts.
- Mobiel: fixed rail valt uit de grid-flow → `.template-default__wrap { grid-column: 1/-1 }` (shell.scss) — niet weghalen.
- `react-hooks/purity`: geen Date.now() in componentbody; servertijd als prop.
- PATCH-responses zijn depth=0 → invalideren, niet setQueryData'en.

— Dottie
