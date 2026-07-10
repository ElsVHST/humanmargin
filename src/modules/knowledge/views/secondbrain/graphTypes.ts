/**
 * Types voor het graph.json-formaat dat `graphify` produceert (NetworkX
 * node-link-JSON). Zie PRD §6.1/§6.2 — dit is het enige contract tussen de
 * Python-pipeline (buiten deze app) en de Second Brain-renderer.
 */

export type GraphNode = {
  id: string;
  label: string;
  file_type?: string;
  source_file?: string;
  community?: number | null;
  community_name?: string;
  norm_label?: string;
};

export type GraphLink = {
  source: string;
  target: string;
  relation?: string;
  confidence?: "EXTRACTED" | "INFERRED" | "AMBIGUOUS" | string;
  confidence_score?: number;
  weight?: number;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
  hyperedges?: unknown[];
};
