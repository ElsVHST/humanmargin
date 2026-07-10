# T4a — wiki-content: kern + werkbladen (11 pagina's)

**Bestand (nieuw):** `scripts/seed/wiki-content/kern-werkbladen.ts`
**PRD:** §3 (structuur + bronnen), §3.2 (paginaformaat), §4 (operaties — nodig voor _Schema).

## Doel

Jij schrijft de daadwerkelijke wiki-content voor de **kernpagina's** en de map **Werkbladen** als TypeScript-module. Geen code-logica — alleen content. Declareer bovenin letterlijk het `WikiPagina`-type uit CONTEXT.md en exporteer `export const PAGINAS: WikiPagina[]`.

## Bronnen (LEES DEZE ECHT, schrijf uit kennis, niet uit fantasie)

- `.claude/skills/humanmargin-dashboard/SKILL.md` — dé feitenbron over alle werkbladen en het systeem
- `docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md` — §1 (patroon), §4 (operaties: ingest/query/lint/log + domeinverdeling Dottie/Hermes + Hermes' dagelijkse draaiboek)
- `docs/handleiding-els-dashboard.md` — hoe Els de werkbladen gebruikt
- `CLAUDE.md` (repo-root) — platform-architectuur

## Te schrijven pagina's (titels EXACT uit CONTEXT.md)

**Root-niveau (`map: null`):**

1. **`_Schema — zo werkt deze wiki`** — het conventie-document voor agents (Karpathy's schema-doc). Moet bevatten: wat de wiki is (persistent, compounderend; geen RAG); paginaformaat (kopblok, samenvatting, secties, Gerelateerd, `[[links]]`); de vier operaties **Ingest / Query / Lint / Log** exact volgens PRD §4 (incl. de lint-checklist van 6 punten); de domeinverdeling Dottie (ziet code) vs. Hermes (ziet runtime) met de conflictregel; de logdiscipline (activities type "log" op de wiki-root, prefix `[ingest|lint|query]`); de regels: gebouwd vs. gepland expliciet, geen persoonsgegevens, wiki blijft intern. Tags: `["wiki","schema"]`.
2. **`Index`** — de catalogus: per map een sectie met élke pagina als `[[link]]` + één regel beschrijving. Alle 37 pagina's uit de canonieke structuur moeten erin staan (ook die van T4b/T4c — je kent hun titels uit CONTEXT.md; schrijf de éénregelige beschrijving op basis van de titel + PRD §3). Tags: `["wiki","index"]`.
3. **`Overzicht — het Human Margin-platform`** — de synthese: wat het platform is (site + dashboard in één Next.js/Payload-app), voor wie (Els; AI-compliance/training), de zeven werkbladen in één alinea elk gelinkt, de datamodel-kern (welke collecties er zijn), en hoe agents ermee werken. Tags: `["wiki","overzicht"]`.
4. **`Second Brain`** — uitleg van het graph-werkblad: wat je ziet (documenten als stippen, verbindingen uit wiki-links, clusters met kleuren), hoe je het leest (grootte = aantal verbindingen; doorgetrokken = gelezen uit de tekst, gestippeld = afgeleid), de marge-kanttekeningen, dat Hermes het dagelijks ververst, en dat klikken doorlinkt naar het document. Tags: `["wiki","second-brain"]`.

**Map "Werkbladen" (`map: "Werkbladen"`):** 7 pagina's — `Werkblad Home`, `Werkblad Pipeline`, `Werkblad Relaties`, `Werkblad Projecten`, `Werkblad Taken`, `Werkblad Kalender`, `Werkblad Kennisbank`. Per pagina (300-500 woorden): wat het werkblad doet, de belangrijkste interacties (panelen via query-params! noem het param: `?deal=`, `?taak=`, `?project=`, `?organisatie=`/`?contact=`, `?item=`, `?dag=`, `?doc=`), welke data eronder ligt (link naar de module-pagina van T4b, bv. `[[CRM — organisaties, contacten en deals]]`), en wat Els er typisch doet. Feiten uit de dashboard-skill — verzin niets. Tags: `["wiki","werkblad"]`.

## Vorm

- Elke pagina volgens het paginaformaat uit CONTEXT.md (kopblok met bronnen, samenvatting, `##`-secties, afsluitend `## Gerelateerd` met 2-6 `[[links]]`).
- Markdown in template-literals; escape backticks in de content of vermijd ze.
- Schrijf feitelijk en compact; Els moet het kunnen lezen, Hermes moet erop kunnen navigeren.

## Acceptatie

- 11 pagina's, exact de juiste titels/mappen; `npx eslint scripts/seed/wiki-content/kern-werkbladen.ts --max-warnings=0` schoon; elk `[[…]]` matcht een canonieke titel.
