# CRM op MKB-niveau — volledige index & bouwplan

**Datum:** 2026-07-09 · **Auteur:** Dottie · **Aanleiding:** Chris: "de organisatie is een zakelijke entiteit met adressen en factuurgegevens, contactpersonen moeten vanuit het organisatiepaneel beheerd kunnen worden, en Els moet zelf velden, kolommen, sectoren en functies kunnen beheren — het CRM is nog lang geen hoogwaardig MKB-niveau."
**Referentiekader:** Pipedrive (data fields, contacts-hub, kolomconfiguratie), HubSpot (properties), Twenty (beheerbare stages — patroon al in huis via `makeColumnCollection`).
**Verhouding tot de gap-index** (`2026-07-09-crm-gap-index.md`): dit plan absorbeert gap-punten 7 (deels), 8, 12 en 13 en móét vóór sprint 2 (CSV-import) — import moet immers alle velden incl. custom velden kunnen mappen.

## 1. IST — wat er nu staat (geïndexeerd)

| Onderdeel | Nu | Oordeel |
|---|---|---|
| Org ↔ contact koppeling | `contacts.organisatie` (relationship) + join `organisations.contacten`; org-paneel toont gekoppelde contacten als **links die wegnavigeren** naar `/admin/pipeline?contact=` | Koppeling bestaat; beheer (aanmaken/koppelen/ontkoppelen) vanuit het org-paneel ontbreekt volledig; wegnavigeren breekt de context |
| Nieuw contact | Alleen los via `?contact=nieuw` (organisatie handmatig kiezen) | Geen create vanuit org-paneel met voorinvulling |
| Organisatie-record | naam, website, linkedin, sector (vrije tekst!), logo, notities, relatietype, doelgroep, risicoklasse, opvolgenOp, tags | **Geen adressen, geen factuurgegevens** — geen zakelijke entiteit |
| Contact-record | voornaam/achternaam, email (uniek), extraEmails[], telefoons[], functie (vrije tekst), linkedin, avatar, bron + labels | Arrays **niet bewerkbaar in het paneel**; functie is vrije tekst |
| Sectoren | Vrije tekst op organisations.sector | Niet beheerbaar, geen consistentie, geen filter |
| Functies | Vrije tekst op contacts.functie | Zelfde probleem |
| Custom velden | Bestaan niet | Els kan geen kolommen/velden toevoegen zonder deploy |
| Relatie-overzicht | Vaste kolommen, client-side filters (type/doelgroep/opvolgen/tag), geen sorteren, geen kolomkeuze | Niet configureerbaar |
| Beheerbare lijsten-patroon | `makeColumnCollection` (naam+kleur, orderable, trash, beheerder-CRUD) + generiek `ColumnsPanel` (slepen/hernoemen/soft-delete) | **Herbruikbaar fundament** voor sectoren/functies |
| Per-gebruiker opslag | `users` heeft alleen naam+rol; `update: isBeheerderOrSelf` | Plek voor lijstvoorkeuren is er al qua access |

## 2. Architectuurbesluiten (met waarom)

### B1 — Het organisatiepaneel wordt de relatie-hub
Contactpersonen beheer je wáár je de organisatie ziet (Pipedrive-model):
- **Gestapelde panelen:** contact-links in het org-paneel gaan naar `${pathname}?organisatie=X&contact=Y` — het contactpaneel opent **bovenop** het org-paneel (beide render-paden bestaan al in `RelatiesLijst`/`PipelineBoard`; alleen z-orde/sluitgedrag netjes maken). Sluiten = terug naar de organisatie. Geen-subpagina's-regel blijft intact.
- **"+ Contactpersoon"** in het contacten-blok → `?organisatie=X&contact=nieuw`: `NieuwContact` krijgt prop `standaardOrganisatie` (vooringevuld, wel wijzigbaar). Na aanmaken: contact-paneel bovenop org, én direct zichtbaar in het contacten-blok + de contactpersonenlijst-tab (query-invalidatie op `["relaties","contacten"]` + `["organisatie",X,"contacten"]`).
- **Bestaande koppelen:** zoek-select "Koppel bestaande contactpersoon" (zoekt op naam/e-mail, excl. al gekoppelde) → PATCH `contact.organisatie = X`.
- **Ontkoppelen:** ×-knop op de rij → PATCH `organisatie: null` (contact blijft bestaan in de lijst).

### B2 — Organisatie als zakelijke entiteit: adressen + facturatie
Vaste velden (geen custom fields — dit is kern-datamodel):
- Herbruikbare adres-group `adresVelden(naam, label)`: straat, huisnummer (tekst, incl. toevoeging), postcode, plaats, land (default "Nederland").
- Op organisations: `bezoekadres`, `postadres` + checkbox `postadresZelfdeAlsBezoek` (default aan), `factuuradres` + checkbox `factuuradresZelfdeAlsPost` (default aan). Checkbox aan = subvelden verborgen (conditie), lezers vallen terug op het bronadres.
- Group `facturatie`: kvkNummer, btwNummer, iban, tenaamstelling, factuurEmail, betaaltermijnDagen (default 30).
- Paneel-UX: het org-paneel krijgt **inklapbare secties** (Profiel · Adressen · Facturatie · Extra velden · Contactpersonen · Deals) zodat het niet onafzienbaar wordt; autosave-patroon blijft per veld.

### B3 — Sectoren en functies worden beheerbare lijsten
Vrije tekst → lookup-collecties `sectoren` en `functies` via `makeColumnCollection` (kleur is meegenomen: gratis pills in lijsten).
- **Create-on-type:** in de panelen een combobox (typ → bestaande suggesties → "'X' aanmaken"). Aanmaken mag elk ingelogd teamlid (access-override op de factory: `create: isAuthenticated`); hernoemen/verwijderen blijft beheerder (Els/Chris zijn beheerder).
- **Migratie:** script `scripts/migrate/sectoren-functies.ts` — distinct tekstwaarden → docs, records omhangen, daarna de tekstvelden vervangen door relationships. Seeds en tests mee.
- **Waarom geen custom field:** sector/functie zijn kernvelden met bestaande data, verdienen first-class relaties (filters, rapportage, AC-sync later).
- Relatietype/doelgroep/risicoklasse blijven **vaste** selects: er hangt systeemgedrag aan (prospect→lead-kwalificatie, Els's kwadrant); dat mag niet per ongeluk weggegooid worden.

### B4 — Custom velden: definitie-collectie + JSON-waarden (Pipedrive-patroon)
Els kan zelf kolommen/velden aanmaken, wijzigen, verplaatsen, archiveren — zonder deploy:
- Collectie **`crm-velden`**: label, `sleutel` (auto-slug, onveranderbaar na aanmaak), `type` (tekst / tekstvak / getal / datum / ja-nee / select / multiselect / link), `opties[]` (bij select/multiselect), `geldtVoor` (organisaties / contacten / beide), orderable (volgorde = paneel- én kolomvolgorde), trash (archiveren — waarden blijven staan, nooit destructief).
- Waarden in één `extraVelden` **json-veld** op organisations én contacts: `{ [sleutel]: waarde }`.
- **Waarom zo:** Payload-schema is code; echte kolommen per klant-wens vergen een deploy. Definities-als-data + json-waarden is exact hoe Pipedrive/HubSpot dit doen. Query/filter gebeurt client-side in de lijst (die laadt toch al alles, limit 1000) — ruim voldoende voor MKB-schaal; bij >±5k relaties later server-side op Postgres jsonb.
- Panelen renderen een dynamische sectie "Extra velden" (input per type, zelfde autosave). De lijst biedt custom velden aan als kolommen en (voor select-types) als filters. CSV-import (volgende fase) mapt er ook op.

### B5 — Relatie-overzicht configureerbaar per gebruiker
- **Kolom-kiezer** per tab (organisaties/contacten): tonen/verbergen + volgorde slepen; aanbod = vaste velden + custom velden.
- **Sorteren** op kolomkop (klik = asc/desc), client-side.
- Opslag in `users.lijstVoorkeuren` (json; self-update-access bestaat al) — per gebruiker, zoals Pipedrive. Fallback = huidige standaardkolommen.

### B7 — Pipeline volledig verbonden met relaties (Chris, 2026-07-09)
De pipeline is een weergave van dezelfde relaties, geen eiland:
- **Dealkaart** toont naast de organisatie ook de **contactpersoon** (deals worden al met depth=1 geladen — geen extra query); de board-zoekbalk matcht ook op contactnaam.
- **DealPanel** krijgt een "Gekoppeld"-blok met de échte gegevens van organisatie en contactpersoon (naam, functie, e-mail, telefoon) en doorklik: org/contact openen als **gestapeld paneel bovenop de deal** (`?deal=X&organisatie=Y` / `?deal=X&contact=Z` — de render-paden bestaan al op de pipeline, alleen volgorde en sluit-gedrag met param-behoud).
- **Contactpersoon-select in het DealPanel wordt gefilterd op de gekozen organisatie** (Pipedrive-gedrag); de huidige koppeling blijft altijd zichtbaar.
- Wijzig je organisatie/contact via de gestapelde panelen, dan verversen kaart en dealpaneel automatisch (query-invalidatie is er al).

### B6 — Eén beheerplek: CRM-instellingen-slideover
Potlood-icoon op `/admin/relaties` (zelfde plek als kolommenbeheer op de boards) → slideover met tabs: **Velden** (crm-velden CRUD), **Sectoren**, **Functies** (beide via het bestaande generieke `ColumnsPanel`-patroon), **Kolommen** (B5). Alles zonder Payload-editor; die blijft fallback.

## 3. Verwevenheid — hoe alles op elkaar ingrijpt

1. **Contact aanmaken vanuit org** schrijft gewoon een `contacts`-doc → verschijnt automatisch overal (contactenlijst, ⌘K, panelen) omdat alles op dezelfde collectie draait. Geen dubbele administratie.
2. **Custom velden** zijn één definitie-bron voor: paneel-secties, lijst-kolommen, filters én straks CSV-import-mapping en de Reality-Check-landing (fase B routekaart).
3. **Sectoren/functies** als collecties maken filters, gekleurde pills, rapportage (fase G) en ActiveCampaign-sync (fase B/H) mogelijk; create-on-type houdt de invoer-flow snel.
4. **Volgorde:** eerst records compleet (A), dan lijsten beheerbaar (B), dan custom velden (C), dan de lijst op maat (D), **daarna pas CSV-import** — anders importeer je in een half datamodel.

## 4. Sprintplan met acceptatiecriteria

### Sprint A — Relatie-hub & volledige records (±1 dag)
Adressen + facturatie op organisations (B2, incl. paneel-secties); org-paneel contacten-blok: nieuw (vooringevuld) / bestaand koppelen / ontkoppelen / gestapeld openen (B1); contactpaneel: chips-editors voor telefoons[] en extraEmails[] (patroon `TagsVeld`); **pipeline-verbinding (B7)**: contactpersoon op de dealkaart + Gekoppeld-blok met doorklik in het DealPanel + org-gefilterde contact-select.
**Klaar als:** vanuit een organisatie een contact aanmaken → staat direct in het blok én de contactenlijst-tab; koppelen/ontkoppelen werkt; adres- en factuurvelden autosaven; dealkaart toont org + contact en het DealPanel toont hun echte gegevens met doorklik; check + tests groen.

### Sprint B — Beheerbare lijsten (±1 dag)
`sectoren` + `functies` collecties + migratiescript; combobox create-on-type in beide panelen; sector-filter in de lijst; CRM-instellingen-slideover met tabs Sectoren/Functies (B3, B6-basis).
**Klaar als:** Els een sector/functie kan aanmaken, hernoemen en verwijderen zonder Payload-editor; bestaande data gemigreerd; oude vrije-tekstwaarden nergens meer.

### Sprint C — Custom velden (±1–1,5 dag)
`crm-velden`-collectie + `extraVelden` json (B4); dynamische "Extra velden"-sectie in beide panelen; kolommen + filters in de lijst; Velden-tab in het instellingen-paneel (aanmaken/hernoemen/opties/volgorde/archiveren).
**Klaar als:** Els een veld "Aantal medewerkers" (getal) en "Bron-campagne" (select) kan aanmaken en die direct als paneelveld én lijstkolom ziet, kan verslepen en archiveren zonder dataverlies.

### Sprint D — Lijst op maat (±0,5–1 dag)
Kolom-kiezer + volgorde + sorteren, opgeslagen per gebruiker (B5); meteen meenemen: laatste-contact-kolom uit de tijdlijn (gap-punt 10).
**Klaar als:** kolomkeuze/sortering na herladen en op een ander apparaat voor dezelfde gebruiker bewaard blijft.

**Daarna:** CSV-import + dubbel-detectie (gap-index sprint 2) op het complete datamodel; dan bulk-acties + opgeslagen lijsten (sprint 3).

## 5. Aannames (gemaakt, terug te draaien) & vragen voor Els

- **Aanname:** factuurvelden = KvK, BTW-nummer, IBAN, tenaamstelling, factuur-e-mail, betaaltermijn. **Vraag:** compleet zo? Komt er een boekhoudkoppeling (Moneybird/e-Boekhouden) — dan reserveren we een extern-id-veld.
- **Aanname:** kolomvoorkeuren per gebruiker (niet gedeeld). **Vraag:** wil Els juist één gedeelde teamweergave?
- **Aanname:** custom-field-types v1 = tekst/tekstvak/getal/datum/ja-nee/select/multiselect/link. Formules, relaties-naar-records en bestandsvelden bewust later.
- **Vraag (bestaand, §6 braindump):** de 8 openstaande Els-vragen raken fase B — dit plan blokkeert daar niet op.

## 6. Bewust niet in dit plan

E-mailsync, activiteiten/agenda-koppeling, deals-custom-velden (zelfde patroon, later triviaal uit te breiden via `geldtVoor`), server-side filtering op json-velden (pas nodig >±5k relaties), meertaligheid.

— Dottie
