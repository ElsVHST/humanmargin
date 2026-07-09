# CRM gap-index — wat het CRM nog mist t.o.v. Pipedrive (volledig geïndexeerd)

**Datum:** 2026-07-09 · **Auteur:** Dottie · **Aanleiding:** Chris kon geen prospects toevoegen en miste leadlijsten — terechte constatering: het CRM had wel panelen maar geen relaties-werkblad.
**Referenties:** Pipedrive (Leads-inbox, Contacts: People & Organizations) en Notion-CRM's (databases met eigen views/filters).

## 1. Vandaag direct gedicht (gebouwd & getest)

| Gat | Oplossing |
|---|---|
| Geen plek om prospects te zien of toe te voegen | **Nieuwe view `/admin/relaties`** in de rail: tabbladen Organisaties / Contactpersonen als tabel-lijsten met avatar, type-label, doelgroep, sector/e-mail, eigenaar, bijgewerkt |
| Geen leadlijsten/segmenten | **Relatietype-labels** (Prospect/Lead/Klant/Partner/Overig, Pipedrive-stijl gekleurde pills) + **doelgroep** (ZZP/MKB/Aanbieder — Els's kwadrant, W14) op organisaties én contacten; filters + zoeken bovenaan de lijst = gefilterde leadlijsten |
| Prospect toevoegen onvindbaar | Prominente **"+ Organisatie" / "+ Contact"-knop** op het relaties-werkblad (naast het bestaande ⌘K/+-menu); contact koppel je bij aanmaak direct aan een bedrijf |
| Panelen sprongen naar /admin/pipeline terug | Panelen zijn nu route-onafhankelijk; zoeken/feed/quick-add linken naar /admin/relaties |

Bestaand en al werkend (ter context): organisatie-/contactpanelen met inline edit + tijdlijn + gekoppelde deals/contacten, deals-kanban met won/lost, notities op elk record.

## 2. Nog ontbrekend — volledige index (geprioriteerd)

### A. Hoog — raakt Els's dagelijkse prospectie (W13-W15)
1. ~~**Opvolg-reminder per relatie**~~ ✅ **Gebouwd (sprint 1, 2026-07-09):** `opvolgenOp`-veld op beide collecties, datum in de panelen, Opvolgen-kolom + "vandaag/achterstallig"-filter in de lijst, "Vandaag opvolgen"-blok op home.
2. ~~**Leads-inbox-flow**~~ ✅ **Gebouwd (sprint 1):** "+ Maak deal van deze relatie"-knop in organisatie- én contactpaneel; maakt open deal, kwalificeert prospect→lead automatisch, redirect naar het dealpaneel.
3. **CSV/Excel-import** van prospectlijsten (Pipedrive-import met kolom-mapping) — Els gaat outreach doen; lijsten komen van buiten.
4. ~~**Risicoklasse-veld**~~ ✅ **Gebouwd (sprint 1):** `risicoklasse` (hoog/verboden/geen) op beide collecties, select in de panelen.
5. ~~**Tags-beheer in de UI**~~ ✅ **Gebouwd (sprint 1):** tags-chips-invoer (`TagsVeld`) in de panelen + tag-filter in de lijst.
6. **Bulk-acties** op de lijst: selectie → type/doelgroep/eigenaar wijzigen, taggen, verwijderen (multi-select bestaat al in de kennisbank — patroon herbruikbaar).

### B. Middel — completeren het Pipedrive-gevoel
7. **Opgeslagen lijsten/views** (naam + filterset bewaren, bv. "Fotografen MKB — nog benaderen") — nu alleen ad-hoc filters.
8. **Kolommen sorteren/configureren** in de relatie-tabellen.
9. **Deals-lijstweergave + forecast** naast het kanban (segmented control staat al klaar in het ontwerp).
10. **Laatste-contact-kolom** op basis van de tijdlijn (nu "bijgewerkt") + stilte-signaal zoals op dealkaarten.
11. **Dubbel-detectie & samenvoegen** (zelfde e-mail/naam) — belangrijk zodra import (3) er is.
12. **Telefoons/extra e-mails bewerken** in het contactpaneel (schema heeft de arrays al).
13. **Relatie-notitieveld vs. tijdlijn opschonen** — organisaties hebben beide; kies één plek (tijdlijn) en migreer.

### C. Later — al op de routekaart (braindump fases B-H)
14. Reality Check → automatische contact-creatie met tags (fase B) — de labels van vandaag zijn hiervoor de landingsplek.
15. LinkedIn DM quick-capture (W15).
16. Mailreeksen per segment (AC-koppeling, fase B/H).
17. Activiteiten/agenda-koppeling (Google Agenda, meetings per relatie).
18. Rapportage over de funnel (fase G, KPI-view).

## 3. Voorgestelde volgorde

**Sprint 1 (fase A-plus, ±1 dag):** ✅ **AFGEROND 2026-07-09** — punten 1, 2, 4, 5: reminders + deal-vanuit-relatie + risicoklasse + tags-UI. Daarmee is de dagelijkse prospectie-loop compleet: toevoegen → labelen → opvolgen → converteren.
**Sprint 2:** 3 + 11 (import + dedupe) vóór de outreach-campagnes starten.
**Sprint 3:** 6, 7, 8, 10 (bulk, opgeslagen lijsten, sorteren, laatste contact).
Punten 14-18 blijven op de bestaande routekaart.

— Dottie
