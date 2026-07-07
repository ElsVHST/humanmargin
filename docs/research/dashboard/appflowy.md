# AppFlowy — Conceptuele referentie voor taken-board & kennisbank

> Eigen analyse (opensrc, github.com/AppFlowy-IO/AppFlowy) t.b.v. het Els-dashboard. AppFlowy is Rust+Flutter — geen code-hergebruik, wel UX-regels en datamodel-concepten. Paden repo-relatief.

## 1. Board-kolommen als gebruikersdata

Boardlogica: `frontend/rust-lib/flowy-database2/src/services/group/`.

- **Een kolom = een "group"** gebonden aan een select-optie van het groepeer-veld. Kolom toevoegen = select-optie toevoegen (`single_select_controller.rs:88-106`: nieuwe optie in type option + `add_new_group`).
- **Kolom verwijderen** (`single_select_controller.rs:108-124`): de select-optie wordt uit het veld verwijderd en de groep uit de configuratie. Kaarten worden **niet verwijderd of geblokkeerd** — rijen zonder (bestaande) optie vallen automatisch in de ingebouwde **"No Status"-groep** (`controller.rs:76-140`, `update_no_status_group`; nieuwe rijen zonder waarde: `controller.rs:224-280`).
- **Kolomvolgorde** = geordende lijst in de view-instellingen; herordenen is een index-move (`configuration.rs:176`, `move_group` met from/to-index).
- **Kaartvolgorde** binnen een groep is eveneens orde-in-lijst per groep (row order in group state).

**Vertaling naar ons ontwerp:** de "No Status"-fallback is eleganter dan verplicht "verplaats eerst alle kaarten": kolom weg → kaarten vallen zichtbaar terug in een standaardkolom (bij ons: de eerste kolom of een "Geen fase"-kolom), niets gaat verloren. We combineren dit met een bevestigingsdialoog (AppFlowy toont die ook) zodat Els weet wat er gebeurt.

## 2. Selectvelden & verwijderde opties

Select-opties leven in de field type-option (id + naam + kleur). Rijen bewaren optie-**id's**; verwijst een rij naar een niet-meer-bestaande optie, dan telt hij als "zonder waarde" en valt in de No Status-groep. Geen cascade-delete van rijen — het veld wordt gewoon leeg-equivalent. Zelfde gedrag nemen wij over via relaties: `deals.stage` naar een verwijderde stage ⇒ board toont de deal in de fallback-kolom.

## 3. Documentboom (wiki-hiërarchie)

Folder-model: `frontend/rust-lib/flowy-folder/src/manager.rs`.

- Pagina's ("views") vormen een boom via `parent_view_id` (manager.rs:447-479); siblings hebben een volgorde.
- **Verplaatsen**: `move_nested_view` (manager.rs:905) = nieuwe parent + positie t.o.v. vorige sibling; `move_view` (manager.rs:943) = herordenen binnen dezelfde parent (from/to-index).
- **Verwijderen** = `move_view_to_trash` (manager.rs:818) — prullenbak, geen hard delete. Herstelbaar.

**Vertaling:** onze `knowledgeDocs` krijgen `parent` (relatie naar zichzelf) + `position`; verwijderen = soft delete (Payload heeft drafts/trash-patronen; minimaal een `deletedAt`). Payload's nested-docs-plugin levert parent/breadcrumbs.

## 4. UX-regels die we overnemen

1. Kolom hernoemen: inline op het board (klik op kolomtitel), niet via een apart instellingenscherm.
2. Kolom toevoegen: "+"-knop rechts naast de laatste kolom.
3. Kolom verwijderen: bevestigingsdialoog + kaarten vallen terug in fallback-kolom (geen dataverlies).
4. Kaart toevoegen: "+" onderaan élke kolom (nieuwe kaart start in die kolom/fase).
5. Kolommen én kaarten herordenen met drag & drop; volgorde wordt direct gepersisteerd.
6. Verwijderen van documenten/pagina's = prullenbak (herstelbaar), nooit direct definitief.
7. Documentboom: slepen om te nesten/herordenen; inline hernoemen.
8. Lege kolommen blijven zichtbaar (optioneel verbergbaar — AppFlowy heeft "hide empty groups" als instelling).
