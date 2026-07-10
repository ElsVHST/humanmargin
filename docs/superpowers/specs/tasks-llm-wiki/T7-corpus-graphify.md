# T7 — corpus-export + graphify-build + upload (Second Brain-pipeline)

**Bestanden (alle nieuw, behalve .gitignore):**
- `scripts/agent/export-second-brain-corpus.ts`
- `scripts/agent/build_graph.py`
- `scripts/agent/build-second-brain.sh`
- `scripts/agent/upload-second-brain.ts`
- `.gitignore` — voeg ALLEEN twee regels toe: `graphify-corpus/` en `graphify-out/`

**PRD:** §6.2 (pipeline, beslissing B8). Fase 1b.1/1b.2. **NIETS uitvoeren tegen de database of installeren — alleen schrijven.**

## 1. `export-second-brain-corpus.ts` (payload-run-script)

Exporteert alle kennisdocumenten naar `graphify-corpus/` als markdown. Patroon: zie andere scripts in `scripts/` (`getPayload({ config })` uit `@payload-config`).

1. Haal ALLE niet-getrashte `knowledge-docs` op (`limit: 0` of pagineren; `depth: 0`).
2. Bouw de boom via `parent`; padnaam per map = `slugify(titel)` (lowercase, spaties→`-`, alleen `[a-z0-9-]`). Root van de export = `graphify-corpus/`.
3. Per doc `soort === "document"`: schrijf `<mapPad>/<id>--<slug(titel)>.md` met:
   - YAML-frontmatter: `titel`, `tags` (als array), `zichtbaarheid`, `soort`.
   - Body: `await lexicalNaarMarkdown(doc.inhoud, resolveId)` — import uit `src/modules/knowledge/wiki/wikiMarkdown.ts` (bestaat; gebouwd door T2). `resolveId` moet hier GEEN `[[titel]]` teruggeven maar `null` — we willen juist échte relatieve md-links (zie 4).
4. **Link-herschrijving voor graphify:** na conversie: vervang elke markdown-link naar `/admin/kennisbank?doc=<id>` door een **relatieve link naar het corpus-bestand** van dat doc (`[label](../modules-data/123--crm.md)` — bereken het relatieve pad met `node:path.relative`). Zo ziet graphify's markdown-extractor ze als `references`-edges tussen de juiste bestanden. Onvindbare ids → link laten vervallen naar platte tekst (label behouden).
5. Per doc `soort === "bestand"`: schrijf een stub `<id>--<slug>.md` met frontmatter + één regel `Bestand: <bestandsnaam> (<mimetype>)`.
6. Leeg `graphify-corpus/` eerst (rm -rf equivalent via `node:fs` — ALLEEN die map!), zodat verwijderde docs verdwijnen.
7. Console: aantal geschreven bestanden per map + totaal; exit 0.

## 2. `build_graph.py` (structurele graphify-run, geen LLM)

Python-script dat de graphify-bibliotheek direct aanroept (het pypi-pakket heet **`graphifyy`**, de import is `graphify`). Stappen exact:

```python
# corpus detecteren, structureel extraheren, bouwen, clusteren, exporteren — geen LLM
from pathlib import Path
import json, sys
from graphify.detect import detect
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster
from graphify.analyze import god_nodes, surprising_connections
from graphify.report import generate  # alleen als de signatuur eenvoudig blijkt; anders rapport overslaan
from graphify.export import to_json
```

- Input-dir = argv[1] (default `graphify-corpus`), output = `graphify-out/graph.json`.
- `collect_files(Path(corpus))` → `extract(files, cache_root=Path('.'))` (markdown zit in de structurele dispatch — dit belt géén LLM en géén netwerk).
- `G = build_from_json(extractie)`; `communities = cluster(G)`.
- **Community-labels:** zonder LLM: label = de mapnaam die het vaakst voorkomt in de `source_file`-paden van de community-leden (netjes: `pad.split('/')[1]` → mapslug → title-case met spaties). Geef door aan `to_json(..., community_labels=labels)`.
- `to_json(G, communities, 'graphify-out/graph.json', force=True, community_labels=labels)`.
- Schrijf ook `graphify-out/rapport.md`: simpel zelfgebouwd (aantallen, top-10 god nodes via `god_nodes(G)`, surprising connections) — gebruik de graphify-functies maar bouw de markdown zelf (de officiële `generate` heeft veel parameters; alleen gebruiken als het makkelijk kan).
- Foutafhandeling: ontbrekende imports → duidelijke melding "pip-pakket 'graphifyy' ontbreekt — installeer met: uv tool install graphifyy (of pip3 install --user graphifyy)" en exit 1.
- LET OP: de API-signaturen hierboven komen uit de broncode-analyse van vandaag maar kunnen per versie iets afwijken — schrijf defensief (probeer/inspecteer met `inspect.signature` waar het spannend is) en houd het script kort.

## 3. `build-second-brain.sh` (orkestratie, uitvoerbaar)

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."   # repo-root
npx payload run scripts/agent/export-second-brain-corpus.ts
PY=$(command -v python3 || true)
if command -v graphify >/dev/null 2>&1; then :; elif ! "$PY" -c "import graphify" 2>/dev/null; then
  echo "graphify ontbreekt — probeer: uv tool install graphifyy  of  pip3 install --user graphifyy" >&2; exit 1
fi
"$PY" scripts/agent/build_graph.py graphify-corpus
npx payload run scripts/agent/upload-second-brain.ts
echo "✓ Second Brain ververst"
```
(Verfijn: als `graphify` als CLI bestaat maar de import faalt, gebruik dan de python uit de shebang van die CLI — hou het pragmatisch en becommentarieerd. `chmod +x` het bestand.)

## 4. `upload-second-brain.ts` (payload-run-script)

1. Lees `graphify-out/graph.json` en `graphify-out/rapport.md`; ontbreken ze → duidelijke fout, exit 1.
2. Vind de wiki-rootmap "Platform-wiki" (knowledge-docs, soort map). Ontbreekt → fout "draai eerst seed-wiki.ts".
3. **graph.json:** find-or-create `knowledge-files` op `filename` `second-brain-graph.json` — Payload-uploads via Local API: `payload.create({ collection: "knowledge-files", data: {}, filePath })` en bij bestaan `payload.update({ ..., filePath })` (onderzoek de exacte Local-API-upload-signatuur in de payload-docs/types; `overwriteExistingFiles: true` kan nodig zijn). Zorg dat het bestand daarna op precies die filename staat.
4. Find-or-create knowledge-doc **"Second Brain — graph.json"** (`soort: "bestand"`, `bestand: <file-id>`, parent: Platform-wiki, `zichtbaarheid: "intern"`, tags `["wiki","second-brain"]`). Zelfde voor rapport: file `second-brain-rapport.md` + doc **"Second Brain — rapport"**.
5. Log-activity op de rootmap: `type: "log"`, `samenvatting: "[ingest] Second Brain herbouwd: <N> nodes, <M> edges, <K> clusters"`, als Dottie-user (patroon: seed-routekaart.ts).
6. Exit 0 met totalenregel.

## Acceptatie

eslint schoon op de .ts-bestanden; `bash -n scripts/agent/build-second-brain.sh` zonder fouten; python-bestand syntactisch valide (`python3 -m py_compile` mag je draaien — dat raakt geen DB). In je notities: aannames over de graphify-API en wat de orchestrator moet verifiëren bij de eerste echte run.
