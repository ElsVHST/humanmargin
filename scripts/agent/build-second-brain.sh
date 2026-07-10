#!/usr/bin/env bash
# Second Brain — orkestratie (T7, PRD §6.2, beslissing B8).
#
# Ketent de drie stappen van de Second Brain-pipeline:
#   1. corpus-export  (knowledge-docs → graphify-corpus/, Local API)
#   2. graphify-build (structureel, geen LLM, geen netwerk)
#   3. upload         (graph.json + rapport.md terug de wiki-map in)
#
# Draaien vanuit de repo-root of overal vandaan: ./scripts/agent/build-second-brain.sh
set -euo pipefail
cd "$(dirname "$0")/../.."   # repo-root

npx payload run scripts/agent/export-second-brain-corpus.ts

# Kies een python met een graphify die markdown-links/[[wikilinks]] als
# references-edges extraheert (graphifyy ≥ 0.9 — de module
# graphify.extractors.markdown bestaat pas sinds die reeks; 0.8.x bouwt
# alleen contains-edges en zou het Second Brain verbindingsloos maken).
# Voorkeursvolgorde:
#   1. de interpreter uit de shebang van de `graphify`-CLI (bv. de eigen
#      venv van `uv tool install graphifyy`) — per definitie de installatie
#      die bij de actuele CLI hoort;
#   2. het systeem-python3 op PATH, mits capabel.
CAPABILITY="from graphify.extractors.markdown import extract_markdown"
PY=""
if command -v graphify >/dev/null 2>&1; then
  CLI_PY=$(head -n1 "$(command -v graphify)" | sed 's/^#!//')
  if [ -x "$CLI_PY" ] && "$CLI_PY" -c "$CAPABILITY" 2>/dev/null; then
    PY="$CLI_PY"
  fi
fi
if [ -z "$PY" ]; then
  SYS_PY=$(command -v python3 || true)
  if [ -n "$SYS_PY" ] && "$SYS_PY" -c "$CAPABILITY" 2>/dev/null; then
    PY="$SYS_PY"
  fi
fi

if [ -z "$PY" ]; then
  echo "Geen bruikbare graphify ≥ 0.9 gevonden (markdown-linkextractie vereist)." >&2
  echo "Installeer/upgrade met: uv tool install --upgrade graphifyy  (of: pip3 install --user --upgrade graphifyy)" >&2
  exit 1
fi

"$PY" scripts/agent/build_graph.py graphify-corpus
npx payload run scripts/agent/upload-second-brain.ts
echo "✓ Second Brain ververst"
