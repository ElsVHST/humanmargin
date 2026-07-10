# PRD — LLM-wiki in de kennisbank + Hermes Agent

**Datum:** 2026-07-10 · **Auteur:** Dottie · **Status:** concept, wacht op review Chris
**Bronnen:** Karpathy's "LLM Wiki"-patroon (aangeleverd door Chris), `2026-07-09-els-braindump-analyse.md` (W1-W31, fases A-H), `2026-07-08-els-dashboard-design.md`, skill `humanmargin-dashboard`, codebase-verificatie (zie §2), broncode-analyse van [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) (zie §6)

---

## 0. Samenvatting

We bouwen een **Platform-wiki als map in de bestaande kennisbank**: een samenhangende, gelinkte verzameling kennisdocumenten die het hele platform beschrijft — elk werkblad, elke collectie, elke hook, de complete roadmap (fases A-H, wensen W1-W31) en de kaders van Els. De wiki wordt **niet** opnieuw afgeleid per vraag (RAG), maar is een **persistent, compounderend artefact** dat door agents wordt onderhouden: **Dottie** (deze sessies, ziet de code) en straks **Hermes Agent** (VPS, dagelijkse cron, ziet het draaiende systeem via de REST API + MCP-tools).

Onderdeel van fase 1 is de **Hermes Agent-node**: één wiki-pagina die alles bevat wat Hermes nodig heeft — identiteit, toegang, tools, taken, guardrails en links naar de rest van de wiki. Dat is Hermes' bootstrap-document: zijn eerste leesopdracht bij elke run.

Geen nieuwe collectie, geen nieuw werkblad voor de wiki zelf: die gebruikt `knowledge-docs` zoals die er staat, plus drie kleine uitbreidingen (deep-link `?doc=`, markdown-conversie-endpoint, API-key-auth voor de Hermes-user).

Bovenop de wiki komt **Second Brain** (§6): een nieuw werkblad dat kennisbank + wiki als interactieve knowledge-graph visualiseert (nodes, links, communities — het Obsidian-graph-view-gevoel), gebouwd op **graphify**. De graph wordt deterministisch (zonder LLM-kosten) uit de markdown-export van alle kennisdocumenten gebouwd; Hermes ververst hem dagelijks en krijgt er via graphify's MCP-server ook query-tools bij (`query_graph`, `shortest_path`, …). Dit is de visuele invulling van Els's W17 ("tweede brein").

---

## 1. Analyse van het Karpathy-patroon → vertaling naar dit platform

### 1.1 De kern van het patroon

1. **Geen RAG maar accumulatie.** De LLM bouwt en onderhoudt een persistente wiki; kennis wordt één keer gecompileerd en daarna bijgehouden, niet per vraag opnieuw opgegraven. Kruisverwijzingen bestaan al, tegenstrijdigheden zijn al gemarkeerd.
2. **Drie lagen:** ruwe bronnen (immutable) → wiki (de LLM schrijft, de mens leest) → schema (het conventie-document dat van de LLM een gedisciplineerde wiki-beheerder maakt).
3. **Drie operaties:** *ingest* (bron verwerken, 10-15 pagina's raken), *query* (antwoorden die waardevol zijn worden zélf wiki-pagina's), *lint* (periodieke gezondheidscheck: tegenspraak, verouderde claims, wees-pagina's, gaten).
4. **Twee navigatiebestanden:** `index.md` (inhoudelijk: catalogus van alle pagina's) en `log.md` (chronologisch: append-only, parseerbaar).
5. **De mens cureert en vraagt; de LLM doet al het boekhoudwerk.** Wiki's sterven normaal aan onderhoudslast — voor een LLM is die last bijna nul.

### 1.2 Wat bij ons wezenlijk anders ligt dan bij Karpathy

| Karpathy | Human Margin |
|---|---|
| Wiki = markdown-bestanden op schijf, Obsidian als leesvenster | Wiki = `knowledge-docs`-boom in de kennisbank; **de myDrive-verkenner + DocPanel zijn ons Obsidian** — Els leest en kan zelfs meeschrijven in de UI die ze al kent |
| Bronnen = artikelen/papers die je erin gooit | Bronnen = **het platform zelf**: de repo (specs, skills, handoffs, schema's) én het draaiende systeem (collecties, board, activities). Het platform documenteert zichzelf |
| Eén agent (Claude Code) met filesystem-toegang | **Twee agents met verschillende zichtlijnen:** Dottie ziet de code (repo), Hermes ziet de runtime (REST API). Beiden schrijven; het schema-doc verdeelt het domein (§5.4) |
| `log.md` als append-only bestand | **`activities` bestaan al** als polymorf paper-trail-systeem met target `knowledge-docs` — het log wordt de tijdlijn óp de wiki-root, zichtbaar in de bestaande `RecordTijdlijn`-UI én queryable via de API |
| Schema-doc = CLAUDE.md/AGENTS.md | Schema-doc = wiki-pagina "_Schema" ín de wiki zelf, zodat élke agent (ook Hermes, die geen repo heeft) hem via de API leest |
| CLI-zoektool (qmd) als de wiki groeit | Payload-queries (`where`, `like`, tags) + de Index-pagina; ~30-60 pagina's blijft ruim binnen wat een index-first-aanpak aankan |

### 1.3 Waarom de kennisbank de juiste plek is (en geen aparte map/repo)

- **W17 ("tweede brein") ís deze wens:** één centrale plek waaruit Els én de AI putten "zodat de AI geen bullshit-antwoorden geeft". De wiki is de systematische invulling daarvan voor platform-kennis.
- Els kan meelezen, corrigeren en aanvullen in de verkenner die ze al gebruikt; `zichtbaarheid=intern` houdt alles privé; trash + tijdlijn geven een paper trail.
- `referenties` op deals/taken/content/projecten wijst al naar kennisdocumenten — een taak op het bord kan dus direct naar de relevante wiki-pagina linken.
- Hermes heeft **geen filesystem-toegang tot de repo nodig**: alles loopt via de REST API van de app, met attributie, access-regels en hooks intact.

---

## 2. Ontwerpbeslissingen

Geverifieerd in de codebase vóór deze beslissingen: (a) `convertMarkdownToLexical`/`lexicalToMarkdown` zitten in de geïnstalleerde `@payloadcms/richtext-lexical` (`dist/features/converters/`), (b) het DocPanel opent nu via component-state, er is **geen** `?doc=`-deep-link, (c) `users` heeft `auth: true` zonder API-keys, (d) `activities.targets` dekt `knowledge-docs` al.

**B1 — Wiki = map "Platform-wiki" in `knowledge-docs`; géén nieuwe collectie.**
Pagina's zijn gewone kennisdocumenten (`soort: document`), mappen zijn `soort: map`. Alles wat de kennisbank al kan (boom, zoeken, trash, tags, tijdlijn, referenties) geldt automatisch. Tag-conventie: elke wiki-pagina krijgt tag `wiki` + een categorietag (`wiki-werkblad`, `wiki-module`, `wiki-roadmap`, `wiki-agent`, …).

**B2 — Opslag is Lexical; agents werken in markdown; conversie server-side.**
Hermes (en LLM's in het algemeen) schrijven het best markdown. De app krijgt een klein conversie-oppervlak: custom endpoints **`GET/PATCH /api/wiki/:id/md`** (Payload custom endpoints) die `inhoud` als markdown teruggeven resp. aannemen, en server-side converteren met de meegeleverde converters en de eigen editor-config. Zo blijft de opslag native (DocPanel/HmEditor/`<RichText/>` werken gewoon) en is het agent-formaat platte markdown. De seed (fase 1) gebruikt dezelfde converter-helper direct.
*Beperking die we accepteren:* wiki-pagina's houden zich aan markdown-compatibele nodes (koppen, lijsten, links, quotes, code) — geen upload/relationship-nodes; de bestaande `onbekendeNodeTypes`-guard beschermt de andere kant op al.

**B3 — Wiki-links: `[[Paginatitel]]` in markdown → LinkNode met `?doc=<id>`; kennisbank krijgt een deep-link.**
De converter lost `[[…]]` op naar Payload-LinkNodes met href `/admin/kennisbank?doc=<id>` (op ID, dus hernoemen breekt niets; de linktekst blijft de titel). Daarvoor krijgt `KennisbankBrowser` een kleine uitbreiding: bij `?doc=<id>` opent het DocPanel — hetzelfde query-param-patroon als `?deal=`/`?taak=`/`?project=` op de andere werkbladen, en het maakt wiki-pagina's meteen deelbaar/linkbaar vanaf het bord. Onopgeloste `[[links]]` blijven platte tekst met de dubbele haken: dat is (net als bij Karpathy/Obsidian) een marker voor "pagina moet nog komen" die de lint-pass rapporteert.

**B4 — Index = wiki-pagina; Logboek = `activities`.**
- **Index**: één pagina, per categorie alle pagina's met één regel samenvatting; bijgewerkt bij elke ingest. Dit is het navigatie-startpunt voor agents (index lezen → doorklikken), precies Karpathy's index-first-aanpak.
- **Logboek**: géén append-pagina (Lexical-appends zijn fragiel), maar **activities** `{type: "log", samenvatting: "[ingest|lint|query] …", targets: [wiki-root]}`. Voordelen: append-only per constructie, chronologisch queryable (`sort=-happensAt`), zichtbaar als tijdlijn op de wiki-root in de bestaande UI, en Hermes' runs zijn zo meteen auditbaar. Dit is hetzelfde LOG-mechanisme als het in-the-loop OS al voorschrijft.

**B5 — Geen schemawijziging aan `knowledge-docs` in v1.**
Metadata (laatst gecontroleerd, bronnen, status) staat als vast kopblok bovenin elke pagina (§4.2). Pas als de lint-pass aantoont dat we queryable metadata nodig hebben, overwegen we een `wikiMeta`-json-veld (fase 3).

**B6 — Hermes-toegang: eigen user + API-key via de REST API; nooit rechtstreeks op de database.**
- User `hermes@humanmargin.eu` (rol **teamlid**, naam "Hermes (AI-agent)") — zelfde patroon als de Dottie-user; elke wijziging krijgt attributie en de tijdlijn logt.
- `Users.auth` wordt `{ useAPIKey: true }`; alleen op de Hermes-user (en evt. Dottie) wordt een key aangezet. Header: `Authorization: users API-Key <key>`. Access-regels gelden gewoon (teamlid: geen kolom-/gebruikersbeheer, geen permanent verwijderen — precies goed).
- **Rechtstreekse Neon-toegang is verboden**: dat zou hooks, access en tijdlijn omzeilen. Alles via de app.

**B7 — MCP-laag: dunne server op de VPS die de REST API wrapt (fase 2).**
Tools: `wiki_index`, `wiki_lees(id|titel)`, `wiki_schrijf(id, markdown)`, `wiki_nieuw(titel, parent, markdown)`, `wiki_zoek(term)`, `wiki_log(samenvatting)`, plus later board-tools (`taak_queue`, `taak_comment`, …) voor de Els-automatiseringen. De REST API blijft de bron; MCP is alleen de tool-interface voor Hermes' model. (Eerst checken of `@payloadcms/plugin-mcp` inmiddels bruikbaar/stabiel is — zo ja, dan die evalueren vóór eigen bouw.)

---

## 3. Wiki-structuur (initiële boom, ~32 pagina's)

```
📁 Platform-wiki
├── 📄 _Schema — zo werkt deze wiki (lees mij eerst)   ← het Karpathy-schema-doc
├── 📄 Index                                            ← catalogus, bijgewerkt bij elke ingest
├── 📄 Overzicht — het Human Margin-platform            ← synthese: wat het is, voor wie, de architectuur in 1 pagina
├── 📁 Werkbladen
│   ├── 📄 Home (overzicht & vandaag)
│   ├── 📄 Pipeline (deals-kanban)
│   ├── 📄 Relaties (organisaties & contacten)
│   ├── 📄 Projecten (fase-kanban)
│   ├── 📄 Taken (taken-kanban + agent-queue)
│   ├── 📄 Kalender (content + deadlines)
│   └── 📄 Kennisbank (verkenner — waar deze wiki zelf leeft)
├── 📁 Modules & data
│   ├── 📄 CRM — organisaties, contacten, deals, sectoren, functies, eigen velden
│   ├── 📄 Projecten & taken — fases, statussen, checklist, position
│   ├── 📄 Content & kalender — items, kanalen, statusflow
│   ├── 📄 Kennisbank & bestanden — docs-boom, uploads, prullenbak
│   ├── 📄 Tijdlijn & activities — het paper-trail-systeem (typen, targets, recepten)
│   ├── 📄 Gebruikers, rollen & voorkeuren
│   └── 📄 Site & CMS — pages, blocks, media, draft-preview (de publieke kant)
├── 📁 Automatiseringen
│   ├── 📄 Hooks — deal→tijdlijn, gewonnen→project, blog→conceptpagina
│   └── 📄 In-the-loop OS — agent-queue, vraag/log-discipline, SOP-mining
├── 📁 API & integraties
│   ├── 📄 REST & Local API — auth, recepten, gotchas (json-replace, verplichte selects, trash)
│   └── 📄 Integratie-landschap — huidige tools van Els + gepland (TLDV, AC, Mollie, Resend, Cal.com)
├── 📁 Roadmap & wensen
│   ├── 📄 Strategie — Human Margin Method, AICK als product, academy
│   ├── 📄 Wensenkaart W1-W31 — de volledige braindump-kaart
│   ├── 📄 Fase A-rest — content & formats          ┐
│   ├── 📄 Fase B — Reality Check native            │
│   ├── 📄 Fase C — publiek + rapporten             │ per fase: doel, wensen,
│   ├── 📄 Fase D — repurposing & ochtendmail       │ taken op het bord (link),
│   ├── 📄 Fase E — masterclass-automatisering      │ afhankelijkheden, status
│   ├── 📄 Fase F — academy, betalingen, affiliates │
│   ├── 📄 Fase G — KPI-dashboard Cijfers           │
│   ├── 📄 Fase H — eigen mailmotor                 ┘
│   ├── 📄 CRM-afronding — gap-index sprints 2-3
│   └── 📄 Kaders — niets automatisch publiceren/versturen, AVG, API-beperkingen
└── 📁 Agents
    ├── 📄 Hermes Agent — dé node (§6)
    └── 📄 Dottie — sessie-agent, in-the-loop-werkwijze, skills-onderhoudsplicht
```

Het **Logboek** is geen pagina maar de tijdlijn op de map "Platform-wiki" zelf (B4).

### 3.1 Waar de content vandaan komt (initiële compilatie, fase 1)

| Wiki-deel | Bron |
|---|---|
| Werkbladen, Modules & data, Automatiseringen, API | skill `humanmargin-dashboard` (actueel), collectie-configs in `src/modules/*/collections/`, handleiding-doc |
| Roadmap & wensen | `2026-07-09-els-braindump-analyse.md` (integraal), routekaart-projecten/taken op het bord, gap-index |
| Strategie & kaders | braindump-analyse §1 en §7 |
| Site & CMS | CLAUDE.md, skill `humanmargin-payload-cms` |
| Agents | seed-agent-loop-docs + dit PRD (§6) |

De wiki **vervangt** de specs/skills niet — dat blijven de repo-bronnen voor wie de code aanraakt. De wiki is de compilatie daarvan die óók zonder repo-toegang leesbaar is (Els, Hermes) en die per feature de actuele status bijhoudt.

### 3.2 Paginaformaat

Elke pagina begint met een vast kopblok (platte tekst, geen schema-veld — B5):

> **Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** skill humanmargin-dashboard; specs/2026-07-09-…md

Daarna: 1 alinea samenvatting → inhoud met `##`-koppen → onderaan sectie **Gerelateerd** met `[[links]]`. Feiten die uit een spec of beslissing komen noemen die bron inline. Toekomstige features staan er expliciet als *gepland* in, met link naar de fase-pagina — nooit alsof ze al bestaan (het onderscheid gebouwd/gepland is voor Hermes essentieel).

---

## 4. Operaties (wat het _Schema-doc voorschrijft)

**Ingest** — nieuwe kennis (opgeleverde feature, nieuwe spec, board-wijziging, beslissing van Els/Chris) verwerken: relevante pagina's bijwerken (één wijziging raakt typisch 3-10 pagina's: feature-pagina, module-pagina, Index, fase-pagina, Hermes-node bij nieuwe tools), status gebouwd/gepland omzetten, Index bijwerken, log-activity schrijven.

**Query** — vragen beantwoorden begint bij de Index, dan doorklikken. Antwoorden die blijvende waarde hebben (vergelijkingen, analyses, beslissingen) worden als pagina teruggefiled in de wiki i.p.v. te verdampen in chat/mail.

**Lint** (wekelijks, Hermes) — checklist: (1) tegenspraak tussen pagina's, (2) "gepland" dat inmiddels gebouwd is (board-status vs. wiki-status), (3) onopgeloste `[[links]]`, (4) wees-pagina's zonder inkomende links, (5) kopblok-datums ouder dan 30 dagen op kernpagina's, (6) gaten (concept genoemd maar geen pagina). Bevindingen → log-activity; grotere reparaties → als taak op het bord in "Ready (agent)" of "Heeft mij nodig".

**Log** — elke run/wijziging één activity op de wiki-root: `[ingest|lint|query] wat, waarom, welke pagina's geraakt`. Prefix-conventie maakt het filterbaar via de API.

### 4.4 Twee schrijvers, één wiki: de domeinverdeling

| | **Dottie** (sessies, ziet de code) | **Hermes** (VPS-cron, ziet de runtime) |
|---|---|---|
| Bron | repo: specs, schema's, commits, skills | API: board, collecties, activities, kolommen |
| Schrijft | feature-pagina's bij oplevering (bouw-sessie = wiki-update, zelfde plicht als skills-onderhoud) | statusvoortgang (board→fase-pagina's), lint-fixes, nieuwe kolommen/velden/SOP's, dagelijkse log |
| Conflictregel | code-feiten winnen van runtime-observaties | bij twijfel niet overschrijven maar vraag-activity + taak "Heeft mij nodig" |

Beiden loggen elke wijziging (zelfde prefix-conventie), dus de tijdlijn laat altijd zien wie wat wanneer aanpaste. De Dottie-plicht wordt vastgelegd in CLAUDE.md (onderhoudsplicht-sectie) en de dashboard-skill.

### 4.5 Hermes' dagelijkse cron-run (het onderhoudsdraaiboek)

1. **Bootstrap:** lees `[[Hermes Agent]]`-node → `[[_Schema]]` → `[[Index]]` → laatste 10 log-activities (wat is er al gedaan).
2. **Delta-scan** (alles via REST, `updatedAt > laatste run`): taken/projecten (roadmap-voortgang), crm-velden/sectoren/functies/kolom-collecties (nieuwe configuratie), knowledge-docs buiten de wiki (nieuwe kennis van Els), activities (beslissingen in comments).
3. **Ingest** van de delta's in de betreffende pagina's + Index.
   3b. **Second Brain verversen** (fase 1b+): gewijzigde docs als markdown naar het corpus, `graphify --update`, graph.json + rapport terug-uploaden (§6.2).
4. **Lint-pass** (roterend, 1x/week volledig).
5. **Agent-queue check:** taken in "Ready (agent)" toegewezen aan Hermes (het bestaande in-the-loop OS geldt onverkort voor Hermes).
6. **Log-activity** met de samenvatting van de run. Bij onduidelijkheid: vraag-activity + taak naar "Heeft mij nodig" — nooit gokken (bestaande discipline).

---

## 5. Hermes Agent-node (inhoud van dé pagina)

De pagina `Agents/Hermes Agent` is Hermes' zelfbeschrijving en bootstrap. Secties:

1. **Identiteit** — Hermes Agent, autonome onderhouds- en automatiseringsagent van Human Margin; draait op een VPS met dagelijkse cron; handelt in het dashboard als user `hermes@humanmargin.eu` (teamlid).
2. **Toegang** — REST API-basis-URL, API-key-authenticatie (`Authorization: users API-Key …`, key in VPS-env, nooit in de wiki/repo!), markdown-endpoints `/api/wiki/:id/md`, en het verbod op directe DB-toegang.
3. **Tools** — de MCP-toolset (B7) met per tool wat hij doet en wanneer, plus (fase 2) graphify's eigen MCP-server over graph.json: `query_graph`, `get_neighbors`, `shortest_path`, `god_nodes`, `get_community` — de graph voor "hoe hangt alles samen", de wiki voor "wat is er waar".
4. **Vaste taken** — het dagelijkse draaiboek (§4.5, incl. de Second Brain-verversing van stap 3b), de wekelijkse lint, de log-discipline.
5. **Toekomstige taken** (gepland, expliciet gelabeld) — de Els-automatiseringen die op Hermes landen zodra de betreffende fase gebouwd is: dagelijkse ochtendmail (W18, fase D), repurposing-pipeline (W2/W7, fase D), masterclass-flow-bewaking (W19, fase E), KPI-verversing (fase G), plus board-taken via de agent-queue. Per taak een link naar de fase-pagina.
6. **Guardrails** — de kaders van Els als harde regels: **nooit iets publiceren of versturen richting de buitenwereld** (alles landt als concept; uitzondering alleen expliciet aangewezen transactionele flows, en die bestaan nog niet); alleen soft-delete; nooit permanent verwijderen; geen persoonsgegevens in wiki-pagina's; bij twijfel stoppen en vragen ("Heeft mij nodig"); alles loggen.
7. **Gerelateerd** — links naar _Schema, Index, In-the-loop OS, REST-recepten, Kaders, alle fase-pagina's.

---

## 6. Second Brain — de graph-visualisatie van kennisbank + wiki (graphify)

Chris's opdracht: één pagina met nodes, genaamd **"Second Brain"**, die álles uit de kennisbank én de LLM-wiki visualiseert. We bouwen dit op **graphify** (Graphify-Labs, MIT-licentie, Python ≥3.10, pypi `graphifyy`). De repo is volledig geanalyseerd (broncode, niet alleen README); de voor ons dragende feiten:

### 6.1 Wat graphify is (analyse-samenvatting)

- **Pipeline:** `detect → extract → build (NetworkX) → cluster → analyze → report → export`. Elke stap is een losse module zonder gedeelde state; alles landt in `graphify-out/`.
- **Markdown-extractie is deterministisch en LLM-vrij** (geverifieerd: `.md` staat in de structurele dispatch-map, `extractors/markdown.py` is pure regel-parsing). Per bestand: een file-node + heading-nodes + `contains`-nesting, en `references`-edges voor **`[[wikilinks]]`**, inline `[tekst](./ander.md)` en reference-links. Onze `[[Paginatitel]]`-conventie uit B3 wordt dus 1-op-1 een graph-edge — de wiki-linkstructuur ís de graph.
- **Clustering:** Leiden (graspologic, optioneel) met Louvain-fallback (networkx) → communities met labels; `analyze` levert god nodes (meest verbonden concepten), surprising connections (cross-community-bruggen) en suggested questions.
- **`graph.json`** = standaard NetworkX node-link-JSON: `nodes[{id, label, file_type, source_file, source_location, community, community_name, …}]`, `links[{source, target, relation, confidence: EXTRACTED|INFERRED|AMBIGUOUS, confidence_score, weight}]`, `hyperedges[]`, `built_at_commit`. Elke edge draagt een eerlijkheidslabel — precies de audit-discipline die onze wiki ook hanteert. Anti-krimp-guard bij overschrijven (weigert stilzwijgend kleinere graphs).
- **`graph.html`** = kant-en-klare vis-network-visualisatie (zoek, legenda, community-filter, node-inspector), maar **laadt vis-network van een CDN (unpkg)** en heeft een eigen dark-stijl — daarom bouwen wij onze eigen renderer (§6.3, beslissing B8).
- **MCP-server** (`python -m graphify.serve graph.json`, stdio én HTTP via starlette): tools `query_graph`, `get_node`, `get_neighbors`, `get_community`, `god_nodes`, `graph_stats`, `shortest_path` + resources (report, stats, audit, suggested questions).
- **Query-feedback-loop:** `graphify query/path/explain` beantwoordt vragen door graph-traversal (BFS/DFS) en `save-result` slaat het antwoord terug op — bij de volgende `--update` wordt de Q&A zelf een node. Dat is exact Karpathy's "antwoorden terugfilen" (§1.1-3), maar dan op de graph-laag.
- **Incrementeel:** `--update` (manifest-diff, alleen gewijzigde bestanden), extraction-cache, `--watch`, git-hook. Dagelijkse verversing kost dus vrijwel niets.
- **Overige exports** (optioneel voor later): Obsidian-vault, SVG, GraphML, Neo4j/FalkorDB-Cypher, en een eigen `--wiki`-export (index + artikel per community).
- **Security ingebouwd:** sensitive-file-skip (secrets/env), URL-validatie, label-sanitization, pad-containment. Relevant omdat ons corpus intern is.
- **Platform-support:** `graphify install` registreert de skill bij 15+ agent-platforms — de pyproject noemt **Hermes** expliciet als ondersteund platform, en `always_on/`-templates (AGENTS.md e.d.) maken de graph ambient voor agents. Hermes kan graphify dus native als skill draaien.

### 6.2 Beslissing B8 — de Second Brain-pipeline

**Corpus-export → deterministische graph-build → publicatie in de app → eigen renderer.**

1. **Export** (`scripts/agent/export-second-brain-corpus.ts`): alle niet-getrashte `knowledge-docs` (kennisbank én Platform-wiki — beide leven in dezelfde collectie, dus "alles uit beide" is één query) → markdown-corpus op schijf. Mappen volgen de parent-boom; bestandsnaam = **`<id>--<slug>.md`** zodat elke graph-node via `source_file` terug te mappen is op zijn document (click-through, §6.3). Lexical→markdown via de B2-converters; interne LinkNodes (`?doc=<id>`) worden relatieve md-links naar het doelbestand zodat de extractor ze als `references`-edge pakt; YAML-frontmatter draagt titel/tags/zichtbaarheid/auteur mee. Bestanden (`soort: bestand`) komen mee als node via een stub-md met metadata (het binaire bestand zelf hoeft niet in de graph).
2. **Build:** `graphify` structurele run op het corpus — **geen LLM-kosten** (§6.1). Optioneel periodiek een semantische verdiepingsronde (`--mode deep`, INFERRED-concept-edges): Dottie in-sessie, of Hermes met een geconfigureerde Gemini-key. De dagelijkse run is altijd de gratis structurele.
3. **Publicatie:** `graph.json` + `GRAPH_REPORT.md` worden als bestanden in de wiki-map gezet (upload naar `knowledge-files`, vaste titels "Second Brain — graph.json"/"— rapport", idempotent vervangen). De app hoeft géén Python te draaien; hij consumeert alleen het JSON-artefact.
4. **Renderer** (B8-kern): **eigen React-view, niet de meegeleverde `graph.html`**. Redenen: graph.html hangt aan een CDN (unpkg), heeft een eigen huisstijl, en kan niet doorklikken naar onze panelen. Het `graph.json`-formaat is simpel en stabiel — wij renderen het met de **dependency-vrije canvas-engine uit de goedgekeurde mockup** (§6.3): eigen force-simulatie, geen vis-network, geen enkele nieuwe npm-dependency. *(Bijgewerkt 2026-07-10 bij de bouw: een eerdere versie van deze paragraaf noemde vis-network-als-npm-dep; de mockup-engine bleek beter — bewezen ontwerp, nul dependencies, volledig in onze designtaal.)*

**Wie draait de build:** fase 1b = Dottie (lokaal script + graphify-CLI, handmatig/na wiki-wijzigingen); fase 2 = Hermes' dagelijkse cron op de VPS (corpus via REST ophalen → `graphify --update` → graph.json terug-uploaden), als stap 3b in het draaiboek van §4.5. Hermes draait daarnaast `graphify.serve` lokaal als extra MCP-server: daarmee kan hij het hele tweede brein **structureel bevragen** (paden, communities, god nodes) naast het wiki-lezen — graph voor "hoe hangt alles samen", wiki voor "wat is er waar".

### 6.3 Het werkblad "Second Brain" — designtaal (bindend voor fase 1b)

**Interactieve design-mockup (goedgekeurde richting wordt hier gebouwd):** https://claude.ai/code/artifact/ea8511c1-765b-4941-b2f1-a43ea9046915

**Het signatuur: de marge.** Human Margin heet naar de marge; Els's nieuwsbrief heet "In de Marge"; de Leestafel is boekbesprekingen. Het werkblad is daarom opgezet als een opengeslagen leesblad: de graph is het leesveld, en links staat een echte **marge-kolom (±248px)** met kanttekeningen — afgescheiden door een dunne rode kantlijn (het Nederlandse schoolschrift). In de marge, van boven naar beneden: een levende kanttekening in cursieve serif (Georgia italic) die meebeweegt met de selectie, "Meest verbonden" (god nodes uit graph.json, klik = vlieg ernaartoe), "Verrassende verbindingen" (surprising connections uit het GRAPH_REPORT, klik = flits de edge geel op), en de cluster-legenda (kleurstip + aantal, klik = cluster dimmen).

**Kleur & typografie.** Grond off-black (`--hm`-tokens, licht thema = ivoor papier); community-kleuren = Els's kolomkleur-tokens; **electric yellow uitsluitend voor selectie, zoek-focus en flits** (nooit als community-kleur — schaarste maakt het accent). UI-tekst Archivo (zit al in de app); marginalia Georgia italic; tellers ui-monospace met tabular-nums. De "Openen in kennisbank"-knop volgt het merk-knop-patroon: scherp (0 radius), blauw → geel op hover.

**Graph-gedrag** (geïnformeerd door de graphify-broncode-analyse):
- Node-grootte ∝ √degree; labels alleen op hubs (≥40% van max-degree) en bij hover/selectie/zoom — precies graphify's aanpak, die voorkomt dat het een woordenwolk wordt. Toggle "Alle labels".
- EXTRACTED-edges doorgetrokken, INFERRED gestippeld en vager; toggle "Afgeleide verbanden". De eerlijkheidslaag van graphify blijft dus zichtbaar in de UI.
- Hover/selectie = focusmodus: de buurt licht op in clusterkleur, de rest dimt naar ±10%.
- Selectie: gele ring met zachte puls; camera vliegt in 550ms (ease-out) naar zoek- of buurklik-resultaten.
- **Eén georkestreerd laadmoment:** nodes bloeien per cluster op (±0,2s stagger, 0,5s ease-out), daarna physics-settle met heel subtiele drift. `prefers-reduced-motion` schakelt bloei, puls en drift uit.
- Physics: forceAtlas2-achtig (repulsie + veren + cluster-ankers), na stabilisatie bevroren op een lichte drift na — graphify's eigen freeze-patroon.

**Inspector** (rechts, zwevend paneel in slideover-stijl): titel, pillen (cluster, soort, aantal verbindingen), een kanttekening-regel in serif-cursief, buren-lijst gesorteerd op degree met clusterkleur als linker-rand en "gelezen/afgeleid"-label per verbinding, en onderaan **"Openen in kennisbank"** → `?doc=`-deep-link (fase 1.1; de doc-ID zit in `source_file`, §6.2-1). Heading-nodes openen hun ouderdocument.

**Statusbalk** onderaan: documenten · verbindingen · clusters · gelezen/afgeleid-verdeling · **"Vannacht om 03:12 ververst door Hermes"** met groen lampje — de audit-transparantie als zichtbaar vertrouwenselement.

**Overig:** nieuwe admin-view `/admin/second-brain` + rail-link (Brain-icoon) volgens het views-patroon (eigen pad → zelf in `DefaultTemplate`, Topbar met titel + pil-zoekveld ⌘K). Mobiel: marge wordt een inschuifpaneel achter een "In de marge"-knop, inspector wordt bottom-sheet, canvas krijgt pinch-zoom. Zoeken matcht op `norm_label` (diakriet-vrij, zit al in graph.json).

### 6.4 Scope-afbakening

Second Brain v1 visualiseert **knowledge-docs** (kennisbank + wiki). CRM-records (organisaties, deals, projecten) zijn v1 géén nodes — maar graphify accepteert elk extraction-JSON dat aan het schema voldoet, dus een latere uitbreiding kan een eigen exporter toevoegen die relaties (organisatie↔deal↔project↔taak↔kennisdoc-referenties) als extra nodes/edges meegeeft: "het hele bedrijf als graph". Dat is een fase-3-kandidaat en een open vraag (§9-5).

---

## 7. Fasering

### Fase 1 — Wiki integreren + Hermes-node (dit repo, nu te bouwen)

| # | Werk | Omvang |
|---|---|---|
| 1.1 | `?doc=`-deep-link in `KennisbankBrowser` (DocPanel opent op query-param; zelfde patroon als `?deal=`) | klein |
| 1.2 | Markdown-helper: `wikiMarkdown.ts` (md↔Lexical met de meegeleverde converters + `[[link]]`-resolutie) + custom endpoints `GET/PATCH /api/wiki/:id/md` | middel |
| 1.3 | `scripts/seed/seed-wiki.ts` — idempotent (op titel+parent), als Dottie-user, bouwt de volledige boom van §3 met echte content uit de §3.1-bronnen; schrijft de eerste log-activity | groot (vooral content) |
| 1.4 | Hermes-user + `useAPIKey` op Users + key genereren (alleen agent-users) | klein |
| 1.5 | Hermes Agent-node (onderdeel van de seed, inhoud §5) | onderdeel 1.3 |
| 1.6 | Onderhoudsplicht in CLAUDE.md + dashboard-skill: "feature opgeleverd = wiki bijgewerkt (ingest + log)" | klein |

**Acceptatiecriteria fase 1:** alle pagina's zichtbaar en leesbaar in de verkenner én het DocPanel; `[[links]]` klikbaar en stapelbaar via `?doc=`; Index dekt 100% van de pagina's; log-tijdlijn toont de seed-ingest; GET/PATCH van een pagina als markdown werkt round-trip zonder inhoudsverlies; Hermes-user kan met API-key via REST een wiki-pagina lezen én bijwerken (met attributie op de tijdlijn); Els kan een pagina in de UI bewerken zonder dat er iets breekt; `npm run check` + tests groen.

### Fase 1b — Second Brain v1 (direct na de wiki-seed)

| # | Werk | Omvang |
|---|---|---|
| 1b.1 | `scripts/agent/export-second-brain-corpus.ts` — knowledge-docs → markdown-corpus (`<id>--<slug>.md`, boomstructuur, frontmatter, links herschreven) | middel |
| 1b.2 | Graphify-run lokaal (structureel, LLM-vrij) + upload-script voor graph.json/rapport naar de wiki-map | klein |
| 1b.3 | `SecondBrainView` + route `/admin/second-brain` + rail-link (vis-network via npm, tokens-styling, node-klik → `?doc=`) | groot |
| 1b.4 | Wiki-pagina "Second Brain" (uitleg + hoe te lezen) + Hermes-node bijwerken met de graph-taak en MCP-tools | klein |

**Acceptatiecriteria fase 1b:** de graph toont álle niet-getrashte kennisdocumenten (kennisbank + wiki) als nodes; `[[wikilinks]]` en referentie-links zijn zichtbare edges; communities hebben kleuren uit onze tokens en een legenda; node-klik opent het juiste document in het DocPanel; zoeken werkt; licht/donker en mobiel kloppen; de build draait zonder LLM-kosten en een re-run na een wiki-wijziging ververst de graph.

### Fase 2 — Hermes live op de VPS

MCP-server (B7) op de VPS; agent-runtime (voorstel: Claude Agent SDK met een klein draaiboek-prompt = de _Schema- en Hermes-node-pagina's zelf); dagelijkse cron; eerste begeleide runs (wij reviewen de log-activities); daarna vrijgeven. **Harde afhankelijkheid: de Vercel-deploy** (staat al op de checklist) — zonder publiek bereikbare app-URL kan de VPS nergens heen. Monitoring = de log-tijdlijn + "Heeft mij nodig"-taken op het bord.

Hermes' cron krijgt er een stap bij (§4.5-3b): corpus-delta ophalen via REST → `graphify --update` (manifest-diff, alleen gewijzigde docs) → graph.json + rapport terug-uploaden. Daarnaast draait Hermes `python -m graphify.serve graph.json` als tweede MCP-server naast de dashboard-tools: `query_graph`/`shortest_path`/`god_nodes` over het hele tweede brein. `pip install graphifyy` op de VPS (Python ≥3.10); `graphify install` ondersteunt Hermes als platform expliciet.

### Fase 3 — Verdieping (na stabiel draaien)

Backlinks-blok in het DocPanel ("pagina's die hierheen linken" — kan direct uit graph.json!); wiki-zoek verbeteren als de omvang dat vraagt; evt. `wikiMeta`-json (B5) voor Dataview-achtige overzichten; Els-automatiseringen als SOP-pagina's in de wiki naarmate fases D-G landen; geselecteerde pagina's publiek (koppelt aan de publieke kennisbank-rendering van fase C — alleen na expliciete review, kader!); optioneel een `--mode deep`-semantische ronde voor INFERRED-conceptedges; optioneel CRM-records als nodes ("het hele bedrijf als graph", §6.4).

---

## 8. Risico's & kaders

- **Twee-schrijvers-conflict** → domeinverdeling + logplicht (§4.4); Hermes overschrijft nooit bij twijfel.
- **Wiki-drift** (wiki zegt iets anders dan het systeem) → dat is precies wat de lint-pass en het gebouwd/gepland-onderscheid bewaken; de wiki noemt bij elk feit zijn bron.
- **Lexical-conversieverlies** → wiki beperkt zich tot markdown-compatibele nodes; round-trip-test in de acceptatiecriteria; `onbekendeNodeTypes`-guard blijft de vangrail.
- **API-key-lek** = volledige teamlid-toegang → key alleen in VPS-env, roteerbaar (key opnieuw genereren in de admin), nooit in wiki/repo/log; rol teamlid beperkt de schade (geen beheer, geen permanent verwijderen).
- **Kaders van Els** gelden onverkort voor Hermes: niets publiceren/versturen, alles als concept, mens keurt goed. De wiki zelf is en blijft `intern`.
- **AVG:** de wiki beschrijft het systeem, nooit klantdata; persoonsgegevens horen in CRM-records, niet in pagina's (regel in het _Schema-doc).
- **JSON-velden worden bij PATCH vervangen** (bestaande gotcha) — geldt niet voor `inhoud` (richText), wél als Hermes ooit `lijstVoorkeuren`/`extraVelden` aanraakt; staat in de REST-receptenpagina.
- **Second Brain / graphify:** het corpus wordt lokaal (Dottie) of op de VPS (Hermes) op schijf gezet — nooit naar derden; de structurele build belt geen enkele API (geverifieerd). De semantische `--mode deep`-ronde is opt-in en alleen met een bewust gekozen backend. graph.json bevat titels/koppen/linkstructuur, geen klantdata (volgt uit de AVG-regel hierboven). `graph.html` van graphify zelf gebruiken we niet (CDN-dependency, geen huisstijl) — eigen renderer met vis-network als npm-dep. Python is een VPS-dependency, niet een app-dependency: de Next.js-app consumeert alleen graph.json. Licentie MIT — inbouw is vrij.

## 9. Open vragen voor Chris

1. **Hermes-runtime:** Claude Agent SDK op de VPS (mijn voorstel — zelfde model-familie, MCP native) of iets anders dat je al draait?
2. **Volgorde:** fase 2 vereist de Vercel-deploy. Deploy eerst afronden, of wil je Hermes eerder testen via een tunnel naar lokaal?
3. **Mandaat Hermes op het bord:** mag hij zelf taken aanmaken (lint-bevindingen als kaarten) of alleen wiki + log + comments? (Voorstel: wel aanmaken, altijd in "Heeft mij nodig".)
4. **Taal:** wiki in het Nederlands, consistent met het hele dashboard — akkoord? (Aanname: ja.)
5. **Second Brain-scope later:** moeten CRM-records (organisaties/deals/projecten/taken) in een latere fase ook nodes worden, zodat de graph het hele bedrijf toont i.p.v. alleen de kennislaag? (§6.4 — kan via een eigen extraction-JSON, graphify accepteert dat.)

---

*Fase 1 kan direct gebouwd worden; alle bouwstenen (kennisbank, activities, converters, user-patroon) staan er al. Geschatte volgorde: 1.1+1.2+1.4 eerst (de infrastructuur), dan 1.3+1.5 (de content-seed), dan 1.6, dan fase 1b (Second Brain heeft de gevulde wiki nodig om iets te laten zien).*

— Dottie
