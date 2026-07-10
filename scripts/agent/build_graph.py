#!/usr/bin/env python3
"""Second Brain — structurele graphify-run (T7, PRD §6.2 stap 2, beslissing B8).

Bouwt `graphify-corpus/` (geschreven door export-second-brain-corpus.ts) om
tot `graphify-out/graph.json` + `graphify-out/rapport.md`. Puur structureel:
geen LLM, geen netwerk — alleen graphify's deterministische markdown-extractie
(detect → extract → build → cluster → analyze → export, zie PRD §6.1).

Draaien: python3 scripts/agent/build_graph.py [corpus-map]
  (default corpus-map: graphify-corpus, relatief aan de huidige werkmap)

LET OP (voor de orchestrator/Chris — zie T7-rapport): de API-signaturen
hieronder zijn geverifieerd tegen de lokaal geïnstalleerde graphifyy. Er
bestaat een versieverschil dat relevant is voor dit script: `to_json()`
accepteert `community_labels` pas vanaf een latere graphifyy-release; dit
script detecteert dat zelf via `inspect.signature` en valt anders terug op
zelf `community_name` inpatchen na het schrijven — zie `schrijf_graph_json`.
"""
from __future__ import annotations

import inspect
import json
import sys
from collections import Counter
from pathlib import Path

try:
    from graphify.detect import detect
    from graphify.extract import collect_files, extract
    from graphify.build import build_from_json
    from graphify.cluster import cluster
    from graphify.analyze import god_nodes, surprising_connections
    from graphify.export import to_json
except ImportError as fout:
    print(
        "graphify (pip-pakket 'graphifyy') ontbreekt of is onvolledig "
        f"geïnstalleerd ({fout}).\n"
        "Installeer met: uv tool install graphifyy  (of: pip3 install --user graphifyy)",
        file=sys.stderr,
    )
    sys.exit(1)


def _mapnaam_uit_pad(source_file: str) -> str:
    """Directe oudermap van het bestand (voorlaatste padsegment), zodat
    submappen als 'platform-wiki/werkbladen' hun eigen clusterlabel krijgen
    i.p.v. allemaal 'Platform Wiki' te heten. 'graphify-corpus/platform-wiki/
    werkbladen/12--x.md' → 'werkbladen'; bestand op corpus-rootniveau →
    'algemeen'; leeg pad → lege string."""
    delen = [deel for deel in source_file.split("/") if deel]
    if len(delen) < 2:
        return "algemeen" if delen else ""
    ouder = delen[-2]
    if ouder == "graphify-corpus":
        return "algemeen"
    return ouder


_WOORD_UITZONDERINGEN = {"api": "API", "crm": "CRM", "sop": "SOP"}


def _titel_case(mapslug: str) -> str:
    schoon = mapslug.replace("-", " ").replace("_", " ").strip()
    woorden = [
        _WOORD_UITZONDERINGEN.get(woord.lower(), woord.capitalize())
        for woord in schoon.split()
    ]
    return " ".join(woorden) or mapslug


def bereken_community_labels(graaf, communities: "dict[int, list[str]]") -> "dict[int, str]":
    """Label per cluster = de mapnaam die het vaakst voorkomt in de
    source_file-paden van de community-leden — geen LLM (PRD §6.2)."""
    labels: "dict[int, str]" = {}
    for community_id, node_ids in communities.items():
        tellingen: "Counter[str]" = Counter()
        for node_id in node_ids:
            data = graaf.nodes.get(node_id, {})
            mapnaam = _mapnaam_uit_pad(data.get("source_file", "") or "")
            if mapnaam:
                tellingen[mapnaam] += 1
        if tellingen:
            top_mapslug, _ = tellingen.most_common(1)[0]
            labels[community_id] = _titel_case(top_mapslug)
        else:
            labels[community_id] = f"Cluster {community_id}"
    return labels


def schrijf_graph_json(
    graaf,
    communities: "dict[int, list[str]]",
    output_pad: Path,
    labels: "dict[int, str]",
) -> bool:
    """`to_json` met `community_labels` als de geïnstalleerde graphify-versie
    dat ondersteunt; anders zelf `community_name` inpatchen na het schrijven
    (API-verschil tussen graphify-versies — zie de module-docstring)."""
    signature = inspect.signature(to_json)
    if "community_labels" in signature.parameters:
        return to_json(
            graaf, communities, str(output_pad), force=True, community_labels=labels
        )

    gelukt = to_json(graaf, communities, str(output_pad), force=True)
    if gelukt:
        data = json.loads(output_pad.read_text(encoding="utf-8"))
        for node in data.get("nodes", []):
            cid = node.get("community")
            if cid is not None:
                node["community_name"] = labels.get(cid, f"Cluster {cid}")
        output_pad.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return gelukt


def schrijf_rapport(
    rapport_pad: Path,
    detectie: dict,
    graaf,
    communities: "dict[int, list[str]]",
    labels: "dict[int, str]",
    god: "list[dict]",
    verrassend: "list[dict]",
) -> None:
    regels = [
        "# Second Brain — bouwrapport",
        "",
        "Structurele graphify-run, geen LLM (PRD §6.2). Automatisch gegenereerd "
        "door scripts/agent/build_graph.py — niet handmatig bewerken.",
        "",
        "## Totalen",
        f"- Documenten gescand: {detectie.get('total_files', 0)}",
        f"- Nodes: {graaf.number_of_nodes()}",
        f"- Edges: {graaf.number_of_edges()}",
        f"- Clusters: {len(communities)}",
        "",
        "## Clusters",
    ]
    for community_id in sorted(communities):
        aantal = len(communities[community_id])
        naam = labels.get(community_id, f"Cluster {community_id}")
        regels.append(f"- **{naam}** ({aantal} nodes)")

    regels += ["", "## Meest verbonden (god nodes)"]
    if god:
        for node in god:
            regels.append(
                f"- {node.get('label', node.get('id'))} — graad {node.get('degree')}"
            )
    else:
        regels.append("- (geen)")

    regels += ["", "## Verrassende verbindingen"]
    if verrassend:
        for surprise in verrassend:
            bron = surprise.get("source", "?")
            doel = surprise.get("target", "?")
            # "why" (cross-file) of "note" (cross-community-fallback) — beide
            # versies van graphify's analyze-module gebruiken een ander veld.
            toelichting = surprise.get("why") or surprise.get("note") or ""
            regel = f"- {bron} ↔ {doel}"
            if toelichting:
                regel += f" — {toelichting}"
            regels.append(regel)
    else:
        regels.append("- (geen)")

    rapport_pad.write_text("\n".join(regels) + "\n", encoding="utf-8")


def main() -> None:
    corpus_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("graphify-corpus")
    if not corpus_dir.exists():
        print(
            f"Corpusmap '{corpus_dir}' bestaat niet — draai eerst "
            "export-second-brain-corpus.ts.",
            file=sys.stderr,
        )
        sys.exit(1)

    output_dir = Path("graphify-out")
    output_dir.mkdir(parents=True, exist_ok=True)

    detectie = detect(corpus_dir)
    bestanden = collect_files(corpus_dir)
    if not bestanden:
        print(f"Geen bestanden gevonden in '{corpus_dir}'.", file=sys.stderr)
        sys.exit(1)

    extractie = extract(bestanden, cache_root=Path("."))
    graaf = build_from_json(extractie)
    communities = cluster(graaf)
    labels = bereken_community_labels(graaf, communities)

    graph_json_pad = output_dir / "graph.json"
    gelukt = schrijf_graph_json(graaf, communities, graph_json_pad, labels)
    if not gelukt:
        print(
            "graphify weigerde graph.json te overschrijven (anti-krimp-guard) "
            "— zie de waarschuwing hierboven.",
            file=sys.stderr,
        )
        sys.exit(1)

    god = god_nodes(graaf, top_n=10)
    verrassend = surprising_connections(graaf, communities, top_n=5)
    rapport_pad = output_dir / "rapport.md"
    schrijf_rapport(rapport_pad, detectie, graaf, communities, labels, god, verrassend)

    print(
        f"✓ Second Brain gebouwd: {graaf.number_of_nodes()} nodes, "
        f"{graaf.number_of_edges()} edges, {len(communities)} clusters "
        f"→ {graph_json_pad} + {rapport_pad}"
    )


if __name__ == "__main__":
    main()
