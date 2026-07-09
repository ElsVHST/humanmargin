# Handoff — MKB-CRM + projectenlaag gebouwd; routekaart staat als taken op het bord

**Datum:** 2026-07-10 ~01:30 · **Repo:** master, **23 commits LOKAAL — NOG NIET GEPUSHT** (wacht op akkoord Chris) · **Vorige handoff:** `2026-07-09-1715-crm-relaties-en-checklist.md`

## ⚡ Directe opdracht voor de volgende sessie

**De werkvoorraad staat nu op het bord zelf: `/admin/projecten`.** Tien routekaart-projecten (fase "Gepland") met 27 taken, geprioriteerd. Hoogste prioriteit (taken op "hoog"):

1. **CSV/Excel-import + dubbel-detectie** (project "CRM-afronding") — Chris heeft de CRM-uitbouw gesanctioneerd; datamodel (custom velden, sectoren, adressen) is er klaar voor.
2. **Fase A-rest: formats + transcript→concept-flow** (project "Fase A-rest") — kan zonder input van Els.
3. **Fase D: TLDV + repurposing-pipeline** — alleen de ochtendmail wacht op de bronnenlijst.
4. Fase B (Reality Check) is hoog maar **wacht op Els** — haar 8 vragen staan als taak met checklist op het bord, toegewezen aan Els ("Input van Els (blokkeert fase B/D/F)").

Lees vóór alles de skill `humanmargin-dashboard` — die is volledig actueel.

## Wat er in deze sessie is gebouwd (alles getest + gecommit)

1. **CRM sprint 1** (gap-index): opvolg-reminders (`opvolgenOp` + Opvolgen-kolom/filter + "Vandaag opvolgen"-blok op home), "+ Maak deal van deze relatie" (prospect→lead), `risicoklasse`, tags-chips + tag-filter.
2. **MKB-CRM-plan** (`specs/2026-07-09-crm-mkb-plan.md`) — **sprints A-D volledig**:
   - **A** relatie-hub: adressen (bezoek/post/factuur + zelfde-als-checkboxes) + facturatie op organisaties; contacten aanmaken/koppelen/ontkoppelen vanuit het org-paneel; gestapelde panelen met param-behoud; telefoon/e-mail-chips; **pipeline-verbinding** (kaart toont org · contact, DealPanel Gekoppeld-blok + org-gefilterde contact-select).
   - **B** beheerbare lijsten: `sectoren` + `functies` collecties (create-on-type via `LijstKeuze`, teamlid mag aanmaken), migratie vrije tekst→relaties (scripts/migrate/), CRM-instellingen-slideover.
   - **C** eigen velden: `crm-velden` + `extraVelden`-json, dynamische paneel-sectie, Velden-beheertab.
   - **D** lijst op maat: kolomkiezer (incl. eigen velden), sorteren, per-gebruiker in `users.lijstVoorkeuren`, laatste-contact-kolom.
3. **Projectenlaag** (`specs/2026-07-09-projecten-erp-plan.md`): werkblad `/admin/projecten` (fase-kanban op beheerbare `project-fases`, geseed Gepland/Lopend/Review/Afgerond), self-contained `ProjectPanel` (autosave, teamleden, takenblok + taak-create met project-prefill, tijdlijn, archiveren), verweven: Projecten-blok in org-paneel, projecten in DealPanel, `?project=` stapelt op projecten/pipeline/relaties, `+ Project` op home.
4. **Routekaart geseed** (`scripts/seed/seed-routekaart.ts`, idempotent, als Dottie-user): 10 projecten + 27 taken uit de braindump-analyse.

Stand: check + 50 tests + build groen na elke stap. QA volledig in de browser gedaan (echte interacties).

## Openstaande checklist

- ⬜ **PUSHEN** — 23 commits lokaal; wacht op Chris's akkoord
- ⬜ Review Chris/Els op alle UI van 2026-07-09/10
- ⬜ Els: taak "8 vragen beantwoorden" op het bord (blokkeert fase B/D/F)
- ⬜ Vercel-deploy (env vars, media→Blob, dev-push→migraties)
- ⬜ Alle bouwwerk: zie het projectenboard (bron van waarheid — niet meer deze checklist)
- ⬜ Klein: eerste echte agent-run door de in-the-loop-queue; integratietests voor de nieuwe flows (relatie-hub, projecten, custom velden); filters op custom select-velden (komt mee met opgeslagen lijsten)

## Gotchas (nieuw deze sessie, naast die van de vorige handoff)

- **Destructieve schemawijziging**: dev-push-prompt hangt headless. Runbook: data exporteren → kolommen zelf droppen via psql (DATABASE_URI **én** `humanmargin_test`) → dan pas config wijzigen (push wordt additief) → import-script. Staat ook in de skill.
- **Dev-server draait als detached proces** (nohup, log `/tmp/humanmargin-dev.log`) — de achtergrondtaak-variant werd door de sessie-omgeving gekilld. Chris kan hem killen en zelf `npm run dev` draaien.
- **Json-velden (extraVelden, lijstVoorkeuren) worden bij PATCH VERVANGEN** — altijd volledig object sturen; groups mergen wél per kolom.
- Payload verzint rare enkelvouden ("functies"→Functy) — zet `typescript.interface` expliciet op nieuwe collecties.
- `label` met knoppen erin stuurt clicks naar de eerste knop — gebruik `div.hm-veld`.
- Browsersessie verloopt stil → 403's in console; login via `fetch('/api/users/login',…)` in paginacontext.
- Playwright: synthetische events (dispatchEvent) missen soms React-handlers — gebruik echte fill/click/selectOption.

## Stand van het systeem

Werkbladen: Home · Pipeline · Relaties (configureerbare lijst + instellingen) · **Projecten (nieuw)** · Taken · Kalender · Kennisbank. Alles slideover-panelen die stapelen via query-params; Els beheert zelf fases, sectoren, functies én eigen CRM-velden; alles soft-delete met paper trail. Els's volledige wensenlijst: `specs/2026-07-09-els-braindump-analyse.md` (W1-W31) — nu ook als projecten/taken op het bord.

— Dottie
