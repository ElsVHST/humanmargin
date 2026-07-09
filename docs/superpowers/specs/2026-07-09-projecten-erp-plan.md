# Projectenlaag — Pipedrive Projects voor het Els-dashboard

**Datum:** 2026-07-09 · **Auteur:** Dottie · **Aanleiding:** Chris: "een laag boven taken: Els maakt projecten aan, maakt er taken voor, wijst projecten toe aan organisaties in de pipeline, en de projecttaken zijn zichtbaar in de pipeline-sidebar. Volwaardig, alles bewerken/archiveren/verplaatsen — haar admin moet een volwaardig ERP zijn."
**Referentie:** Pipedrive Projects (phases-kanban, taken per project, koppeling aan deals/organisaties), doorgebouwd op onze bestaande board- en panelen-infra.

## 1. Wat er al ligt (en blijft)

`projects`-collectie (naam, status actief/gepauzeerd/afgerond, organisatie→, deal→ als herkomst, teamleden[], start/deadline, omschrijving, taken-join, referenties, tags, trash), de hook *deal gewonnen → project*, het taken-kanban met `TaakPanel`, `activities.targets` dekt projects (tijdlijn werkt), en het in-the-loop-OS waarmee Dottie taken oppakt. Wat ontbreekt: een **werkoppervlak** (geen werkblad, geen paneel — projecten leven alleen in de Payload-editor) en de **verweving** met pipeline en relaties.

## 2. Besluiten

### P1 — Projecten-kanban op beheerbare fases
Nieuw werkblad **`/admin/projecten`** (rail, tussen Relaties en Taken): kanban over een nieuwe kolom-collectie **`project-fases`** (zelfde patroon als deal-stages: naam+kleur, slepen, hernoemen, soft-delete via het potlood/kolommenbeheer; fallback-kolom "Geen fase"). Defaults geseed: Gepland → Lopend → Review → Afgerond. `projects` krijgt `fase→project-fases` + `position` (fractional ordering). **`status` blijft bestaan als lifecycle** (actief/gepauzeerd/afgerond — daar hangt de won-deal-hook en het taken-filter aan): het board filtert standaard op niet-afgerond; de statusfilter in de toolbar toont desgewenst alles. Projectkaart: naam, organisatie, deadline (rood indien verstreken), **taakvoortgang-meter** (x van y taken klaar), teamleden-avatars.

### P2 — ProjectPanel: het project als record-hub (geen-subpagina's-regel)
Slideover **`?project=<id>`** / `?project=nieuw` (route-onafhankelijk, `useMetParams`): inline autosave op naam/fase/status/organisatie/deal/teamleden/startdatum/deadline/omschrijving/tags/referenties; **Takenblok** — alle taken van het project met status-pill, checklist-voortgang en toegewezen-avatar, "+ Taak" opent het bestaande TaakPanel met het project vooringevuld (nieuw `projectParam`); **RecordTijdlijn** (comments/vragen/logs — Dottie's paper trail werkt hier al); **Archiveren** (trash met dialoog; taken blijven bestaan en tonen "geen project" — herstel via prullenbak); "Openen in volledige editor" als fallback.

### P3 — Verweving met de pipeline (Chris's kern)
- **OrganisatiePanel** krijgt een **Projecten-blok**: projecten van de organisatie met fase-pill + taakvoortgang, "+ Nieuw project" (organisatie vooringevuld), klik = **ProjectPanel gestapeld** bovenop het organisatiepaneel (`?organisatie=X&project=Y`).
- **DealPanel Gekoppeld-blok** toont het project dat uit de deal is voortgekomen (of eraan gekoppeld is) met doorklik gestapeld (`?deal=X&project=Y`).
- **De projecttaken zijn zo één klik vanuit de pipeline-sidebar zichtbaar**: deal/organisatie → project (gestapeld) → takenblok. Op `/admin/projecten` stapelt een taakklik het TaakPanel er direct bovenop (`?project=X&taak=Y`); vanaf pipeline/relaties linkt een taakrij naar `/admin/projecten?project=X&taak=Y` (volle projectcontext).
- `?project=` wordt gerenderd op **projecten, pipeline én relaties**; `?taak=` op projecten (naast taken/kalender die het al hadden).

### P4 — Els + Dottie samenwerken (ERP-gedrag)
Alles wat Els in de UI kan, kan Dottie via de API met dezelfde regels (hooks, tijdlijn, access): projecten aanmaken/verplaatsen (`fase`+`position`), taken aan projecten hangen (in-the-loop-queue: kaarten krijgen projectcontext mee via `project`→ + `contextVooraf`), comments/vragen op het project zelf. Archiveren is overal soft (paper trail); permanent verwijderen alleen beheerder. Fases beheert Els zelf in het kolommenbeheer — geen ontwikkelaar nodig.

## 3. Bewust later
Project-templates (vaste takenlijsten per projecttype), subtaken, Gantt/planning-weergave, uren/budget per project (facturatie-koppeling fase F), automatische fase→status-koppeling. Het schema kan dit allemaal dragen.

## 4. Klaar als
Els kan vanuit een organisatie in de pipeline een project starten, er taken in aanmaken en die aan zichzelf of Dottie toewijzen; het project schuift over het fases-board; de voortgang is zichtbaar op de kaart én in het organisatie/dealpaneel; archiveren en herstellen werkt zonder dataverlies; check + tests groen.

— Dottie
