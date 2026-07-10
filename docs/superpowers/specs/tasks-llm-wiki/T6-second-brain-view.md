# T6 — het Second Brain-werkblad (`/admin/second-brain`)

**Bestanden:**
- NIEUW: `src/modules/knowledge/views/secondbrain/SecondBrainView.tsx`, `SecondBrainClient.tsx`, `graphTypes.ts`, `secondbrain.scss`
- `src/payload.config.ts` — ALLEEN een view-registratie toevoegen naast de bestaande views
- `src/components/admin/shell/Rail.tsx` — ALLEEN één nav-link toevoegen

**PRD:** §6.3 (bindende designtaal!) — lees die sectie integraal. Fase 1b.3.

## Doel

Het "Second Brain"-werkblad: een canvas-graph van alle kennisdocumenten, in exact het goedgekeurde mockup-design, gevoed door echte graph.json-data.

## Referentie-implementatie (1:1 porten waar zinnig)

`/private/tmp/claude-501/-Users-christianbleeker-Desktop-humanmargin/a5c74233-af8a-454c-a5d0-2f05b3dc0147/scratchpad/second-brain-mockup.html` — de goedgekeurde mockup: complete canvas-engine (physics, camera, bloei-animatie, focusmodus, marge, inspector, zoek, legenda, statusbalk). **Lees dit bestand volledig** en port de engine naar een React-clientcomponent. De physics, interacties en visuele beslissingen zijn goedgekeurd — niet herontwerpen, wel netjes React maken (refs voor mutable sim-state, geen state-updates per frame!).

## Architectuur

1. **`SecondBrainView.tsx`** (server component): het views-patroon van dit repo — kijk naar een bestaande view met eigen pad (bv. de pipeline-view, geregistreerd in `payload.config.ts` onder `admin.components.views`): zelf wikkelen in Payload's `DefaultTemplate`, Topbar renderen met `titel="Second Brain"`. Geef servertijd als prop door als je die nodig hebt (geen `Date.now()` in render). Registreer in `payload.config.ts` als view met pad `/second-brain`, exact naast/zoals de bestaande view-registraties.
2. **`SecondBrainClient.tsx`** ("use client"): de geportete engine. Data-flow:
   - Query (TanStack Query, zoals andere views): `GET /api/knowledge-docs?where[titel][equals]=Second Brain — graph.json&depth=1&limit=1` (credentials include). Uit het doc: `bestand.url` → fetch die URL → parse als graph.json.
   - **Leeg-state** (geen doc of fetch faalt): nette lege staat in de designtaal: kop "Het brein is nog niet gebouwd", tekst "Vraag Dottie om een eerste bouw: scripts/agent/build-second-brain.sh", geen crash.
3. **`graphTypes.ts`**: types voor het graph.json-formaat (NetworkX node-link):
   ```ts
   export type GraphNode = { id: string; label: string; file_type?: string; source_file?: string; community?: number | null; community_name?: string; norm_label?: string };
   export type GraphLink = { source: string; target: string; relation?: string; confidence?: "EXTRACTED" | "INFERRED" | "AMBIGUOUS" | string; confidence_score?: number; weight?: number };
   export type GraphData = { nodes: GraphNode[]; links: GraphLink[]; hyperedges?: unknown[] };
   ```
4. **`secondbrain.scss`**: de mockup-CSS vertaald naar `--hm-*`-tokens (bestudeer `src/modules/shared/styles/dashboard.scss` voor de tokens; oppervlakken/lijnen erven van `--theme-elevation-*` zodat licht/donker automatisch werkt). Kleurtokens voor clusters: gebruik de bestaande `--hm-<kleur>`-tokens (groen/blauw/paars/rood/oranje/turquoise/roze/grijs — GEEN geel als clusterkleur; geel `#edff00`/token is exclusief selectie/zoek/flits). Community→kleur: `kleuren[community % kleuren.length]`. Import `@/modules/shared/styles/dashboard.scss` bovenin de view.

## Data-mapping (echte data i.p.v. mockup-data)

- **Documenten-nodes:** nodes waarvan `source_file` op een corpus-bestand wijst (`<id>--<slug>.md`); parse de doc-id uit de bestandsnaam (regex `/(\d+)--[^/]*\.md$/`). Heading-nodes (zelfde `source_file`, id met suffix) map je op hetzelfde doc; **toon in v1 alléén file-nodes** (filter: één node per uniek `source_file`, degree = som van de edges van dat bestand incl. headings — of eenvoudiger: filter nodes zonder koppelbare doc-id weg en herbereken degree over de overgebleven edges; documenteer je keuze in je notities).
- **Clusters:** `community_name` (of `Cluster <n>`); legenda dynamisch uit de data, met counts.
- **Marge:** god nodes = top-4 op degree; "Verrassende verbindingen" = de 2 INFERRED-edges met hoogste `confidence_score` tussen verschillende communities (als die er niet zijn: sectie verbergen).
- **Kanttekeningen (NOTEN in de mockup):** genereer generiek: "Verbonden met N documenten, vooral binnen <cluster>." — geen hardcoded teksten over specifieke pagina's.
- **"Openen in kennisbank"** + dubbelklik op node → `router.push("/admin/kennisbank?doc=<docId>")` via next/navigation (T1 bouwt die deep-link — bestaat mogelijk nog niet als jij test; noteer dat).
- **Statusbalk:** documenten/verbindingen/clusters/gelezen-afgeleid uit de data; "ververst" = `updatedAt` van het graph.json-doc, geformatteerd in het Nederlands (bereken buiten de render of in useMemo met de fetch-data; geen `Date.now()` in render — voor "hoe lang geleden" mag je de servertijd-prop van de view gebruiken).

## Reactifiëring van de engine (belangrijk)

- Sim-state (nodes met x/y/vx/vy, camera, hover) in `useRef`-structuren; render-loop met `requestAnimationFrame` in één `useEffect` met cleanup; canvas-resize via `ResizeObserver`; DPR-cap 2.
- React-state alléén voor UI die als DOM rendert (selectie voor de inspector, zoekresultaten, legenda-toggles, leeg-state) — nooit per animatieframe `setState`.
- Thema-kleuren live uit CSS lezen (getComputedStyle) + `MutationObserver` op `data-theme` — zoals de mockup.
- `prefers-reduced-motion`: geen bloei/puls/drift (zit in de mockup — behouden).
- Performance-guard: bij >800 zichtbare nodes physics-iteraties halveren en labels uit; noteer als TODO-comment dat Barnes-Hut pas nodig is bij >2000.

## Rail-link

Lees `Rail.tsx`; voeg een link toe naar `/admin/second-brain` met het lucide-icoon `Brain`, label "Second Brain", op de plek ná Kennisbank; volg exact het bestaande item-patroon (actief-status, beheer-zone niet aanraken).

## Acceptatie

- eslint schoon op alle nieuwe/gewijzigde bestanden; geen nieuwe npm-dependencies (canvas-engine is dependency-vrij!).
- Leeg-state werkt zonder data; met data: nodes, clusters, marge, inspector, zoek (⌘K), legenda-toggles, dubbele-klik → kennisbank-URL.
- In je notities: wat de orchestrator moet doen (generate:importmap na registratie; T1-afhankelijkheid; test-URL).
