# T4c — wiki-content: roadmap & wensen + agents (14 pagina's)

**Bestand (nieuw):** `scripts/seed/wiki-content/roadmap-agents.ts`
**PRD:** §3, §3.2, §4.4-§4.5, §5 (Hermes-node!), §6 (Second Brain, voor de Hermes-taken).

## Doel

Content-module met `export const PAGINAS: WikiPagina[]` (type letterlijk uit CONTEXT.md) voor de mappen **Roadmap & wensen** en **Agents**. Dit is de kennis over alles wat het platform **gaat** kunnen — essentieel voor Hermes.

## Bronnen (echt lezen)

- `docs/superpowers/specs/2026-07-09-els-braindump-analyse.md` — DE bron: strategie (§1), wensen W1-W31 (§2), toolstack (§3), gap-analyse (§4), routekaart (§5), kaders (§7)
- `scripts/seed/seed-routekaart.ts` — de taken die per fase al op het projectenboard staan
- `docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md` §5 — de exacte inhoudsopgave van de Hermes Agent-pagina, §4.4-4.5 — draaiboek, §6 — Second Brain-taak
- `docs/superpowers/specs/2026-07-09-crm-gap-index.md` — voor CRM-afronding

## Te schrijven pagina's

**Map "Roadmap & wensen"** (12):

1. `Strategie — de Human Margin Method` — braindump §1: HM als methode (N=Nurture), AICK wordt product van HM, sector packs + AVG-module, academy, sprekersklussen/podcasts, licentiemodel-wens, VA, de kernpijn (content kost te veel tijd; leads opvolgen moeizaam). Tags `["wiki","roadmap"]`.
2. `Wensenkaart W1–W31` — alle wensen compact: per categorie (A content/repurposing, B funnel/sales, C CRM/prospectie, D kennis, E masterclass/academy, F cijfers) elke wens met nummer + één regel + status (✅ gebouwd / 🔶 kleine uitbreiding / 🏗️ nieuw / ❓ wacht op beslissing) uit de gap-analyse. Link naar de fase-pagina's.
3. t/m 10. **Acht fase-pagina's** (`Fase A — content & formats` … `Fase H — eigen mailmotor`): per fase (250-450 woorden): doel, welke wensen (W-nummers), wat er concreet gebouwd wordt, afhankelijkheden (incl. "wacht op input van Els" waar dat zo is — fase B/D/F), en de taken die al op het projectenboard staan (uit seed-routekaart.ts). Status: fase A is deels gebouwd (CRM-scherpte ✅), de rest **(gepland)**.
11. `CRM-afronding (gap-index)` — de resterende sprints: CSV/Excel-import + dubbel-detectie (hoog), bulk-acties, opgeslagen lijsten, deals-lijstweergave + forecast, LinkedIn DM quick-capture.
12. `Kaders — wat nooit automatisch mag` — braindump §7 + PRD §7: niets publiceren/versturen zonder Els's review (uitgezonderd expliciet aangewezen transactionele flows), alles landt als concept, AVG (EU-verwerkers, geen tracking vóór consent), LinkedIn/Instagram-API-beperkingen eerlijk benoemen, Plug&Pay/Huddle pas opzeggen na volledige migratie. Dit is de belangrijkste pagina voor élke agent. Tags `["wiki","kaders"]`.

**Map "Agents"** (2):

13. `Hermes Agent` — **dé node, exact volgens PRD §5**, alle 7 secties: identiteit (VPS, dagelijkse cron, user hermes@humanmargin.eu, teamlid); toegang (REST-basis, `Authorization: users API-Key <key>` uit VPS-env — key NOOIT in wiki/repo; `/md`-endpoints; verbod op directe DB-toegang); tools (MCP-toolset: wiki lezen/schrijven/zoeken/loggen + board-tools; plus graphify's MCP-server over graph.json: query_graph, get_neighbors, shortest_path, god_nodes, get_community); vaste taken (het dagelijkse draaiboek uit PRD §4.5 stap voor stap, incl. stap 3b Second Brain-verversing en de wekelijkse lint); toekomstige taken **(gepland)** met fase-links (ochtendmail W18/fase D, repurposing W2+W7/fase D, masterclass-flow W19/fase E, KPI-verversing fase G, board-taken via de agent-queue); guardrails (de kaders als harde regels + soft-delete-only + bij twijfel stoppen en vragen via "Heeft mij nodig" + alles loggen); gerelateerd (links naar `[[_Schema — zo werkt deze wiki]]`, `[[Index]]`, `[[In-the-loop OS (agent-queue)]]`, `[[REST & Local API — recepten]]`, `[[Kaders — wat nooit automatisch mag]]`, `[[Second Brain]]` en alle fase-pagina's). Tags `["wiki","agent","hermes"]`.
14. `Dottie (sessie-agent)` — wie Dottie is (AI-partner in Claude Code-sessies, ziet de code én de runtime), hoe ze werkt (Local API als dottie@humanmargin.eu, in-the-loop OS, skills-onderhoudsplicht), haar wiki-plicht (feature opgeleverd = wiki bijgewerkt + log), en de domeinverdeling met Hermes (code-feiten winnen; Hermes vraagt bij twijfel). Tags `["wiki","agent","dottie"]`.

## Vorm & acceptatie

Zoals CONTEXT.md: kopblok, samenvatting, secties, `## Gerelateerd`. Gebouwd vs. **(gepland — fase X)** overal expliciet. eslint schoon; alle `[[…]]` uit de canonieke lijst.
