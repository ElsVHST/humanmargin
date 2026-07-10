"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Brain, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import type { GraphData, GraphNode } from "@/modules/knowledge/views/secondbrain/graphTypes";
import type { KnowledgeDoc } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "./secondbrain.scss";

/* ── Datamodel na verwerking (v1: alléén document-knopen, zie notities) ── */

type KleurNaam =
  | "groen"
  | "blauw"
  | "paars"
  | "rood"
  | "oranje"
  | "turquoise"
  | "roze"
  | "grijs";

// Geel is exclusief selectie/zoek/flits (--hm-accent) — nooit een clusterkleur.
const KLEUR_NAMEN: readonly KleurNaam[] = [
  "groen",
  "blauw",
  "paars",
  "rood",
  "oranje",
  "turquoise",
  "roze",
  "grijs",
];

const GRAPH_DOC_TITEL = "Second Brain — graph.json";

type Knoop = {
  id: number;
  label: string;
  fileType: string | null;
  community: string;
  graad: number;
  buren: { knoopId: number; extracted: boolean }[];
  // sim-state (gemuteerd door de canvas-engine, niet door React):
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  geboorte: number;
};

type Verband = {
  a: number;
  b: number;
  extracted: boolean;
  confidence?: string;
  confidenceScore: number | null;
  crossCommunity: boolean;
};

type Cluster = { key: string; naam: string; kleur: KleurNaam; aantal: number };

type VerwerkteGraph = {
  knopen: Knoop[];
  verbanden: Verband[];
  clusters: Cluster[];
  clusterPerSleutel: Map<string, Cluster>;
  knoopPerId: Map<number, Knoop>;
  godKnopen: Knoop[];
  verrassingen: { a: Knoop; b: Knoop }[];
};

function docIdVanBron(bron?: string): number | null {
  const match = bron?.match(/(\d+)--[^/]*\.md$/);
  return match ? Number(match[1]) : null;
}

function communitySleutel(node: GraphNode): string {
  if (node.community_name) return node.community_name;
  if (node.community != null) return `Cluster ${node.community}`;
  return "Overig";
}

/**
 * Fallback-label als er geen echte `titel` uit knowledge-docs is opgehaald:
 * bestand-nodes uit graphify dragen de ruwe corpusbestandsnaam
 * (`<id>--een-slug.md`) als label — dit zet die om naar leesbare tekst.
 * Niet-bestandslabels (headings, of onverwachte vormen) blijven ongewijzigd.
 */
function labelSchoon(ruw: string): string {
  const match = ruw.match(/^\d+--(.+)\.md$/);
  if (!match) return ruw;
  const woorden = match[1].split("-").filter(Boolean);
  if (woorden.length === 0) return ruw;
  const [eerste, ...rest] = woorden;
  return [eerste.charAt(0).toUpperCase() + eerste.slice(1), ...rest].join(" ");
}

/**
 * Bouwt de weergavegraaf uit het ruwe graph.json. V1 toont alléén
 * document-knopen: heading-nodes delen `source_file` met hun bestand en
 * worden samengevoegd tot één representant per doc-id (kortste node-id —
 * bestand-nodes hebben doorgaans een kortere id dan heading-nodes).
 * Begrip-nodes zonder koppelbare `source_file` vallen weg (de "eenvoudiger"
 * optie uit het taakblad). Randen worden herschreven naar doc-id's; randen
 * naar weggevallen knopen en zelf-lussen (samengevoegde headings van
 * hetzelfde document) worden overgeslagen. `titelPerId` is de echte
 * `knowledge-docs.titel` per doc-id (los opgehaald); ontbreekt die, dan valt
 * het label terug op een opgeschoonde bestandsnaam.
 */
function verwerkGraph(
  data: GraphData,
  titelPerId: ReadonlyMap<number, string>,
): VerwerkteGraph {
  const groepen = new Map<number, GraphNode[]>();
  for (const node of data.nodes) {
    const docId = docIdVanBron(node.source_file);
    if (docId === null) continue;
    const lijst = groepen.get(docId);
    if (lijst) lijst.push(node);
    else groepen.set(docId, [node]);
  }

  const representant = new Map<number, GraphNode>();
  const docIdPerNodeId = new Map<string, number>();
  for (const [docId, lijst] of groepen) {
    const gekozen = [...lijst].sort((a, b) => a.id.length - b.id.length)[0];
    representant.set(docId, gekozen);
    for (const node of lijst) docIdPerNodeId.set(node.id, docId);
  }

  const clusterTellers = new Map<string, number>();
  const communityPerDocId = new Map<number, string>();
  for (const [docId, node] of representant) {
    const sleutel = communitySleutel(node);
    communityPerDocId.set(docId, sleutel);
    clusterTellers.set(sleutel, (clusterTellers.get(sleutel) ?? 0) + 1);
  }
  const clusters: Cluster[] = [...clusterTellers.entries()].map(
    ([sleutel, aantal], i) => ({
      key: sleutel,
      naam: sleutel,
      kleur: KLEUR_NAMEN[i % KLEUR_NAMEN.length],
      aantal,
    }),
  );
  const clusterPerSleutel = new Map(clusters.map((c) => [c.key, c]));
  const clusterIndex = new Map(clusters.map((c, i) => [c.key, i]));

  type RauwVerband = {
    a: number;
    b: number;
    extracted: boolean;
    confidence?: string;
    score: number | null;
  };
  const rauw: RauwVerband[] = [];
  for (const link of data.links) {
    const a = docIdPerNodeId.get(String(link.source));
    const b = docIdPerNodeId.get(String(link.target));
    if (a == null || b == null || a === b) continue;
    rauw.push({
      a,
      b,
      extracted: link.confidence === "EXTRACTED",
      confidence: link.confidence,
      score: typeof link.confidence_score === "number" ? link.confidence_score : null,
    });
  }

  const graad = new Map<number, number>();
  const buren = new Map<number, { knoopId: number; extracted: boolean }[]>();
  const verbanden: Verband[] = rauw.map((v) => {
    graad.set(v.a, (graad.get(v.a) ?? 0) + 1);
    graad.set(v.b, (graad.get(v.b) ?? 0) + 1);
    const voegBuurToe = (van: number, naar: number) => {
      const lijst = buren.get(van) ?? [];
      lijst.push({ knoopId: naar, extracted: v.extracted });
      buren.set(van, lijst);
    };
    voegBuurToe(v.a, v.b);
    voegBuurToe(v.b, v.a);
    return {
      a: v.a,
      b: v.b,
      extracted: v.extracted,
      confidence: v.confidence,
      confidenceScore: v.score,
      crossCommunity: communityPerDocId.get(v.a) !== communityPerDocId.get(v.b),
    };
  });

  const maxGraad = Math.max(
    1,
    ...[...representant.keys()].map((id) => graad.get(id) ?? 0),
  );
  const hoekPer = (Math.PI * 2) / Math.max(1, clusters.length);
  const knopen: Knoop[] = [...representant.entries()].map(([docId, node], i) => {
    const sleutel = communityPerDocId.get(docId) ?? "Overig";
    const ci = clusterIndex.get(sleutel) ?? 0;
    const g = graad.get(docId) ?? 0;
    const hoek = ci * hoekPer + hoekPer / 2 + (i % 7) * 0.14 - 0.42;
    const straal = 120 + (i % 5) * 46;
    return {
      id: docId,
      label: titelPerId.get(docId) ?? labelSchoon(node.label),
      fileType: node.file_type ?? null,
      community: sleutel,
      graad: g,
      buren: (buren.get(docId) ?? []).sort(
        (p, q) => (graad.get(q.knoopId) ?? 0) - (graad.get(p.knoopId) ?? 0),
      ),
      x: Math.cos(hoek) * straal,
      y: Math.sin(hoek) * straal,
      vx: 0,
      vy: 0,
      r: 4.5 + 11 * Math.sqrt(g / maxGraad),
      geboorte: 240 + ci * 110 + (i % 8) * 26,
    };
  });
  const knoopPerId = new Map(knopen.map((k) => [k.id, k]));

  const godKnopen = [...knopen].sort((a, b) => b.graad - a.graad).slice(0, 4);

  const verrassingen = verbanden
    .filter((v) => v.confidence === "INFERRED" && v.crossCommunity && v.confidenceScore != null)
    .sort((p, q) => (q.confidenceScore ?? 0) - (p.confidenceScore ?? 0))
    .slice(0, 2)
    .map((v) => {
      const a = knoopPerId.get(v.a);
      const b = knoopPerId.get(v.b);
      return a && b ? { a, b } : null;
    })
    .filter((v): v is { a: Knoop; b: Knoop } => v !== null);

  return { knopen, verbanden, clusters, clusterPerSleutel, knoopPerId, godKnopen, verrassingen };
}

function kanttekeningVoor(knoop: Knoop): string {
  return `Verbonden met ${knoop.graad} document${knoop.graad === 1 ? "" : "en"}, vooral binnen ${knoop.community.toLowerCase()}.`;
}

function verrassingTekst(a: Knoop, b: Knoop): string {
  return `Afgeleid verband tussen ${a.community} en ${b.community} — geen directe verwijzing, wel een sterke overeenkomst.`;
}

function relatieveVerversing(updatedAtIso: string, nu: number): string {
  const bijgewerkt = new Date(updatedAtIso);
  const huidig = new Date(nu);
  const tijd = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(bijgewerkt);
  if (bijgewerkt.toDateString() === huidig.toDateString()) {
    return `Vandaag om ${tijd} ververst door Hermes`;
  }
  const gisteren = new Date(huidig);
  gisteren.setDate(gisteren.getDate() - 1);
  if (bijgewerkt.toDateString() === gisteren.toDateString()) {
    return `Gisteren om ${tijd} ververst door Hermes`;
  }
  const datum = new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(bijgewerkt);
  return `${datum} om ${tijd} ververst door Hermes`;
}

function bestandUrlVan(doc: KnowledgeDoc | null): string | null {
  if (!doc) return null;
  const bestand = doc.bestand;
  if (bestand && typeof bestand === "object") return bestand.url ?? null;
  return null;
}

/* ── Canvas-engine (geport uit de goedgekeurde mockup, PRD §6.3) ────────── */

type GraphCanvasHandle = {
  vliegNaarKnoop: (id: number) => void;
  flitsRand: (a: number, b: number) => void;
};

type GraphCanvasProps = {
  knopen: Knoop[];
  verbanden: Verband[];
  clusters: Cluster[];
  toonInferred: boolean;
  toonAlleLabels: boolean;
  clusterUit: ReadonlySet<string>;
  geselecteerdId: number | null;
  onSelecteer: (id: number | null) => void;
  onOpenen: (id: number) => void;
  ref?: React.Ref<GraphCanvasHandle>;
};

function GraphCanvas({
  knopen,
  verbanden,
  clusters,
  toonInferred,
  toonAlleLabels,
  clusterUit,
  geselecteerdId,
  onSelecteer,
  onOpenen,
  ref,
}: GraphCanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef({ toonInferred, toonAlleLabels, clusterUit, geselecteerdId });
  const callbacksRef = useRef({ onSelecteer, onOpenen });
  const engineRef = useRef<{
    vliegNaar: (id: number) => void;
    flitsRand: (a: number, b: number) => void;
  } | null>(null);

  useEffect(() => {
    configRef.current = { toonInferred, toonAlleLabels, clusterUit, geselecteerdId };
  }, [toonInferred, toonAlleLabels, clusterUit, geselecteerdId]);

  useEffect(() => {
    callbacksRef.current = { onSelecteer, onOpenen };
  }, [onSelecteer, onOpenen]);

  useImperativeHandle(
    ref,
    () => ({
      vliegNaarKnoop: (id: number) => engineRef.current?.vliegNaar(id),
      flitsRand: (a: number, b: number) => engineRef.current?.flitsRand(a, b),
    }),
    [],
  );

  // Zwaartepunt van de engine: sim-state leeft in gewone `let`/closure-vars
  // binnen deze ene effect (geen re-renders per animatieframe); alleen wat
  // van buitenaf (imperative handle) bereikbaar moet zijn staat in refs.
  useEffect(() => {
    const canvasMisschien = canvasElRef.current;
    if (!canvasMisschien) return;
    const ctxMisschien = canvasMisschien.getContext("2d");
    if (!ctxMisschien) return;
    // Herbinden met een expliciet niet-nullable type: TS narrowt een
    // `const` niet automatisch binnen geneste function-declarations die
    // pas later (RAF/observer/event) worden aangeroepen.
    const canvas: HTMLCanvasElement = canvasMisschien;
    const ctx: CanvasRenderingContext2D = ctxMisschien;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fontFamily = getComputedStyle(canvas).fontFamily || "Archivo, sans-serif";

    const simKnopen: Knoop[] = knopen.map((k) => ({ ...k }));
    const simById = new Map(simKnopen.map((k) => [k.id, k]));
    const maxGraad = Math.max(1, ...simKnopen.map((n) => n.graad));

    const hoekPer = (Math.PI * 2) / Math.max(1, clusters.length);
    const anker = clusters.map((_, ci) => {
      const hoek = ci * hoekPer + hoekPer / 2;
      return { x: Math.cos(hoek) * 235, y: Math.sin(hoek) * 235 };
    });
    const clusterIndexBijSleutel = new Map(clusters.map((c, i) => [c.key, i]));

    let W = 0;
    let H = 0;
    let DPR = 1;
    const cam = { x: 0, y: 0, z: 1 };

    function maat() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
    }
    const resizeObserver = new ResizeObserver(maat);
    resizeObserver.observe(canvas);
    maat();

    let K = {
      ink: "",
      dim: "",
      zacht: "",
      accent: "",
      lijn: "",
      grond: "",
      clusters: [] as string[],
    };
    function leesKleuren() {
      const s = getComputedStyle(document.documentElement);
      K = {
        ink: s.getPropertyValue("--hm-ink").trim(),
        dim: s.getPropertyValue("--hm-muted").trim(),
        zacht: s.getPropertyValue("--hm-faint").trim(),
        accent: s.getPropertyValue("--hm-accent").trim(),
        lijn: s.getPropertyValue("--hm-line").trim(),
        grond: s.getPropertyValue("--hm-bg").trim(),
        clusters: clusters.map((c) => s.getPropertyValue(`--hm-${c.kleur}`).trim()),
      };
    }
    leesKleuren();
    const themeObserver = new MutationObserver(leesKleuren);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const schemaMedia = window.matchMedia("(prefers-color-scheme: dark)");
    schemaMedia.addEventListener("change", leesKleuren);

    const naarScherm = (x: number, y: number): [number, number] => [
      (x - cam.x) * cam.z + W / 2,
      (y - cam.y) * cam.z + H / 2,
    ];
    const naarWereld = (px: number, py: number): [number, number] => [
      (px - W / 2) / cam.z + cam.x,
      (py - H / 2) / cam.z + cam.y,
    ];

    let simWarm = 1;
    let zwaarModus = false;
    let frame = 0;
    let sleepNode: Knoop | null = null;

    function stap() {
      frame += 1;
      const zichtbareTelling = simKnopen.reduce(
        (n, k) => n + (configRef.current.clusterUit.has(k.community) ? 0 : 1),
        0,
      );
      zwaarModus = zichtbareTelling > 800;
      // Performance-guard (T6-taakblad): bij >800 zichtbare knopen de
      // fysica-iteraties halveren door om de frame over te slaan.
      // TODO: Barnes-Hut-benadering nodig zodra dit >2000 knopen moet dragen
      // (huidige afstoting is O(n²), prima tot een paar honderd knopen).
      if (zwaarModus && frame % 2 === 0) {
        if (simWarm > 0.02) simWarm *= 0.996;
        return;
      }

      for (let i = 0; i < simKnopen.length; i++) {
        const a = simKnopen[i];
        for (let j = i + 1; j < simKnopen.length; j++) {
          const b = simKnopen[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) d2 = 1;
          const kracht = 1500 / d2;
          const d = Math.sqrt(d2);
          dx /= d;
          dy /= d;
          a.vx += dx * kracht;
          a.vy += dy * kracht;
          b.vx -= dx * kracht;
          b.vy -= dy * kracht;
        }
      }
      for (const v of verbanden) {
        const a = simById.get(v.a);
        const b = simById.get(v.b);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 92) * 0.012;
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f;
        b.vy -= (dy / d) * f;
      }
      for (const n of simKnopen) {
        const ci = clusterIndexBijSleutel.get(n.community) ?? 0;
        const ank = anker[ci] ?? { x: 0, y: 0 };
        n.vx += (ank.x - n.x) * 0.006 + (0 - n.x) * 0.0012;
        n.vy += (ank.y - n.y) * 0.006 + (0 - n.y) * 0.0012;
        n.vx *= 0.86;
        n.vy *= 0.86;
        if (n !== sleepNode) {
          n.x += n.vx * simWarm;
          n.y += n.vy * simWarm;
        }
      }
      if (simWarm > 0.02) simWarm *= 0.996;
    }

    function zichtbaar(n: Knoop): boolean {
      return !configRef.current.clusterUit.has(n.community);
    }
    function inFocus(n: Knoop, kern: Knoop | null): boolean {
      if (!kern) return true;
      return n === kern || kern.buren.some((b) => b.knoopId === n.id);
    }

    let hover: Knoop | null = null;
    let flitsVerband: Verband | null = null;
    let flitsTot = 0;
    const start = performance.now();

    function teken(t: number) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const verstreken = t - start;
      const selectieId = configRef.current.geselecteerdId;
      const selectieKnoop = selectieId != null ? (simById.get(selectieId) ?? null) : null;
      const kern = hover || selectieKnoop;

      for (const v of verbanden) {
        if (!configRef.current.toonInferred && !v.extracted) continue;
        const a = simById.get(v.a);
        const b = simById.get(v.b);
        if (!a || !b || !zichtbaar(a) || !zichtbaar(b)) continue;
        const [ax, ay] = naarScherm(a.x, a.y);
        const [bx, by] = naarScherm(b.x, b.y);
        const raaktKern = kern != null && (a === kern || b === kern);
        const geflitst = flitsVerband === v && t < flitsTot;
        let alpha = v.extracted ? 0.3 : 0.16;
        if (kern) alpha = raaktKern ? (v.extracted ? 0.75 : 0.5) : 0.05;
        if (geflitst) alpha = 0.95;
        ctx.globalAlpha = alpha;
        const andereKnoop = a === kern ? b : a;
        const ci = clusterIndexBijSleutel.get(andereKnoop.community) ?? 0;
        ctx.strokeStyle = geflitst ? K.accent : raaktKern ? (K.clusters[ci] ?? K.dim) : K.dim;
        ctx.lineWidth = geflitst ? 2.2 : v.extracted ? 1.3 : 1;
        ctx.setLineDash(v.extracted ? [] : [4, 4]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const n of simKnopen) {
        if (!zichtbaar(n)) continue;
        const [x, y] = naarScherm(n.x, n.y);
        let schaal = 1;
        if (!reducedMotion && verstreken < n.geboorte + 500) {
          if (verstreken < n.geboorte) continue;
          const p = (verstreken - n.geboorte) / 500;
          schaal = 1 - Math.pow(1 - p, 3);
        }
        const r = n.r * schaal * cam.z;
        const focus = inFocus(n, kern);
        const ci = clusterIndexBijSleutel.get(n.community) ?? 0;
        const kleur = K.clusters[ci] ?? K.dim;

        if (n === selectieKnoop) {
          const puls = reducedMotion ? 0 : Math.sin(t / 300) * 2.5;
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = K.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, r + 6 + puls, 0, Math.PI * 2);
          ctx.stroke();
        }

        const glr = r * 2.6;
        const gl = ctx.createRadialGradient(x, y, r * 0.4, x, y, glr);
        gl.addColorStop(0, kleur);
        gl.addColorStop(1, "transparent");
        ctx.globalAlpha = focus ? 0.28 : 0.04;
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(x, y, glr, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = focus ? 1 : 0.15;
        ctx.fillStyle = kleur;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (n === hover || n === selectieKnoop) {
          ctx.fillStyle = K.grond;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(1.6, r * 0.32), 0, Math.PI * 2);
          ctx.fill();
        }

        const hub = n.graad >= maxGraad * 0.4;
        const toon =
          n === hover ||
          n === selectieKnoop ||
          (kern != null && kern.buren.some((b) => b.knoopId === n.id)) ||
          (!zwaarModus &&
            (configRef.current.toonAlleLabels || hub || cam.z > 1.5) &&
            focus);
        if (toon) {
          ctx.globalAlpha = focus ? 1 : 0.25;
          ctx.font = `${n === selectieKnoop || hub ? "600 " : ""}${Math.max(10.5, 11.5 * Math.min(cam.z, 1.3))}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.lineWidth = 3;
          ctx.strokeStyle = K.grond;
          ctx.strokeText(n.label, x, y + r + 14);
          ctx.fillStyle = n === selectieKnoop ? K.ink : K.dim;
          ctx.fillText(n.label, x, y + r + 14);
        }
      }
      ctx.globalAlpha = 1;
    }

    function knoopOp(px: number, py: number): Knoop | null {
      const [wx, wy] = naarWereld(px, py);
      let beste: Knoop | null = null;
      let besteAfstand = Infinity;
      for (const n of simKnopen) {
        if (!zichtbaar(n)) continue;
        const d = Math.hypot(n.x - wx, n.y - wy);
        if (d < Math.max(n.r + 6, 13) / cam.z && d < besteAfstand) {
          beste = n;
          besteAfstand = d;
        }
      }
      return beste;
    }

    let laatst: { x: number; y: number } | null = null;
    let bewogen = false;
    let isPan = false;

    // Mobiel: twee-vinger pinch-zoom (PRD §6.3 "canvas krijgt pinch-zoom").
    // Elke actieve aanraking wordt bijgehouden op pointerId; zodra er twee
    // zijn schakelen we van pan/sleep naar pinch (afstand → cam.z).
    const actieveVingers = new Map<number, { x: number; y: number }>();
    let pinchStartAfstand: number | null = null;
    let pinchStartZ = 1;

    function vingerAfstand(): number {
      const punten = [...actieveVingers.values()];
      if (punten.length < 2) return 0;
      return Math.hypot(punten[0].x - punten[1].x, punten[0].y - punten[1].y);
    }

    function onPointerDown(ev: PointerEvent) {
      canvas.setPointerCapture(ev.pointerId);
      actieveVingers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (actieveVingers.size >= 2) {
        pinchStartAfstand = vingerAfstand();
        pinchStartZ = cam.z;
        laatst = null;
        sleepNode = null;
        isPan = false;
        return;
      }
      laatst = { x: ev.clientX, y: ev.clientY };
      bewogen = false;
      const rect = canvas.getBoundingClientRect();
      sleepNode = knoopOp(ev.clientX - rect.left, ev.clientY - rect.top);
      isPan = !sleepNode;
      canvas.classList.add("is-sleept");
    }
    function onPointerMove(ev: PointerEvent) {
      if (actieveVingers.has(ev.pointerId)) {
        actieveVingers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      }
      if (actieveVingers.size >= 2 && pinchStartAfstand) {
        const huidigeAfstand = vingerAfstand();
        cam.z = Math.min(
          3.2,
          Math.max(0.35, pinchStartZ * (huidigeAfstand / pinchStartAfstand)),
        );
        bewogen = true;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      if (laatst) {
        const dx = ev.clientX - laatst.x;
        const dy = ev.clientY - laatst.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) bewogen = true;
        if (sleepNode) {
          const [wx, wy] = naarWereld(px, py);
          sleepNode.x = wx;
          sleepNode.y = wy;
          sleepNode.vx = 0;
          sleepNode.vy = 0;
          simWarm = Math.max(simWarm, 0.4);
        } else if (isPan) {
          cam.x -= dx / cam.z;
          cam.y -= dy / cam.z;
        }
        laatst = { x: ev.clientX, y: ev.clientY };
      } else {
        hover = knoopOp(px, py);
        canvas.classList.toggle("is-wijst", !!hover);
      }
    }
    function onPointerUp(ev: PointerEvent) {
      actieveVingers.delete(ev.pointerId);
      if (actieveVingers.size < 2) pinchStartAfstand = null;
      const rect = canvas.getBoundingClientRect();
      if (!bewogen) {
        const n = knoopOp(ev.clientX - rect.left, ev.clientY - rect.top);
        callbacksRef.current.onSelecteer(n ? n.id : null);
      }
      laatst = null;
      sleepNode = null;
      isPan = false;
      canvas.classList.remove("is-sleept");
    }
    function onWheel(ev: WheelEvent) {
      ev.preventDefault();
      const f = Math.exp(-ev.deltaY * 0.0012);
      cam.z = Math.min(3.2, Math.max(0.35, cam.z * f));
    }
    function onDblClick(ev: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const n = knoopOp(ev.clientX - rect.left, ev.clientY - rect.top);
      if (n) callbacksRef.current.onOpenen(n.id);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDblClick);

    function vliegNaar(id: number) {
      const n = simById.get(id);
      if (!n) return;
      const van = { x: cam.x, y: cam.y, z: cam.z };
      const naar = { x: n.x, y: n.y, z: Math.max(cam.z, 1.5) };
      if (reducedMotion) {
        cam.x = naar.x;
        cam.y = naar.y;
        cam.z = naar.z;
        return;
      }
      const t0 = performance.now();
      const duur = 550;
      function stapAnim(t: number) {
        const p = Math.min(1, (t - t0) / duur);
        const e = 1 - Math.pow(1 - p, 3);
        cam.x = van.x + (naar.x - van.x) * e;
        cam.y = van.y + (naar.y - van.y) * e;
        cam.z = van.z + (naar.z - van.z) * e;
        if (p < 1) requestAnimationFrame(stapAnim);
      }
      requestAnimationFrame(stapAnim);
    }

    function flitsRand(a: number, b: number) {
      const verband = verbanden.find(
        (v) => (v.a === a && v.b === b) || (v.a === b && v.b === a),
      );
      if (verband) {
        flitsVerband = verband;
        flitsTot = performance.now() + 2400;
      }
    }

    engineRef.current = { vliegNaar, flitsRand };

    let rafId = 0;
    function lus(t: number) {
      if (!reducedMotion || simWarm > 0.05) stap();
      teken(t);
      rafId = requestAnimationFrame(lus);
    }
    rafId = requestAnimationFrame(lus);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      schemaMedia.removeEventListener("change", leesKleuren);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDblClick);
      engineRef.current = null;
    };
  }, [knopen, verbanden, clusters]);

  return (
    <canvas
      aria-label="Kennisgraaf-canvas — sleep om te pannen, scroll om te zoomen"
      className="hm-sb__canvas"
      ref={canvasElRef}
    />
  );
}

/* ── Werkblad: databinding, marge, toolbar, inspector, statusbalk ───────── */

async function haalDoc(): Promise<KnowledgeDoc | null> {
  const params = new URLSearchParams();
  params.set("where[titel][equals]", GRAPH_DOC_TITEL);
  params.set("depth", "1");
  params.set("limit", "1");
  const res = await fetch(`/api/knowledge-docs?${params.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET knowledge-docs → ${res.status}`);
  const data = (await res.json()) as { docs: KnowledgeDoc[] };
  return data.docs[0] ?? null;
}

async function haalGraaf(url: string): Promise<GraphData> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET graph.json → ${res.status}`);
  return (await res.json()) as GraphData;
}

/** Echte titels erbij halen (graph.json-labels van bestand-nodes zijn ruwe
    corpusbestandsnamen, geen leestitels) — best-effort, geen crash bij fout. */
async function haalTitels(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();
  const params = new URLSearchParams();
  params.set("where[id][in]", ids.join(","));
  params.set("depth", "0");
  params.set("limit", String(ids.length));
  const res = await fetch(`/api/knowledge-docs?${params.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET knowledge-docs (titels) → ${res.status}`);
  const data = (await res.json()) as { docs: KnowledgeDoc[] };
  return new Map(data.docs.map((d) => [d.id, d.titel]));
}

function Werkblad({ nu }: { nu: number }) {
  const router = useRouter();
  const canvasRef = useRef<GraphCanvasHandle>(null);
  const zoekInputRef = useRef<HTMLInputElement>(null);

  const [geselecteerdId, setGeselecteerdId] = useState<number | null>(null);
  const [zoekterm, setZoekterm] = useState("");
  const [toonInferred, setToonInferred] = useState(true);
  const [toonAlleLabels, setToonAlleLabels] = useState(false);
  const [clusterUit, setClusterUit] = useState<ReadonlySet<string>>(new Set());
  const [margeOpen, setMargeOpen] = useState(false);

  const docQuery = useQuery({
    queryKey: ["second-brain", "doc"],
    queryFn: haalDoc,
    retry: false,
  });
  const doc = docQuery.data ?? null;
  const bestandUrl = bestandUrlVan(doc);

  const graafQuery = useQuery({
    queryKey: ["second-brain", "graaf", bestandUrl],
    queryFn: () => haalGraaf(bestandUrl as string),
    enabled: bestandUrl != null,
    retry: false,
  });

  // Doc-id's rechtstreeks uit het ruwe graph.json (onafhankelijk van
  // `verwerkt`, anders ontstaat een circulaire afhankelijkheid): gebruikt om
  // de echte titels op te halen waarmee `verwerkGraph` de labels verrijkt.
  const docIds = useMemo(() => {
    if (!graafQuery.data) return [];
    const ids = new Set<number>();
    for (const node of graafQuery.data.nodes) {
      const docId = docIdVanBron(node.source_file);
      if (docId !== null) ids.add(docId);
    }
    return [...ids];
  }, [graafQuery.data]);

  const titelsQuery = useQuery({
    queryKey: ["second-brain", "titels", docIds],
    queryFn: () => haalTitels(docIds),
    enabled: docIds.length > 0,
    retry: false,
  });

  const verwerkt = useMemo(
    () =>
      graafQuery.data
        ? verwerkGraph(graafQuery.data, titelsQuery.data ?? new Map())
        : null,
    [graafQuery.data, titelsQuery.data],
  );

  const bezig = docQuery.isPending || (bestandUrl != null && graafQuery.isPending);

  const selecteer = useCallback((id: number | null, vlieg: boolean) => {
    setGeselecteerdId(id);
    if (vlieg && id != null) canvasRef.current?.vliegNaarKnoop(id);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        zoekInputRef.current?.focus();
      }
      if (e.key === "Escape" && geselecteerdId != null) selecteer(null, false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [geselecteerdId, selecteer]);

  const toggleCluster = (key: string) => {
    const wordtVerborgen = !clusterUit.has(key);
    setClusterUit((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (wordtVerborgen) {
      const geselecteerd = verwerkt?.knoopPerId.get(geselecteerdId ?? -1);
      if (geselecteerd?.community === key) setGeselecteerdId(null);
    }
  };

  const zoekResultaten = useMemo(() => {
    const q = zoekterm.trim().toLowerCase();
    if (!q || !verwerkt) return [];
    return verwerkt.knopen.filter((k) => k.label.toLowerCase().includes(q)).slice(0, 7);
  }, [zoekterm, verwerkt]);

  if (bezig) {
    return (
      <div className="hm-sb hm-view">
        <div className="hm-sb__leeg">
          <Brain size={32} strokeWidth={1.25} />
          <h2>Bezig met laden…</h2>
        </div>
      </div>
    );
  }

  if (!verwerkt) {
    return (
      <div className="hm-sb hm-view">
        <div className="hm-sb__leeg">
          <Brain size={32} strokeWidth={1.25} />
          <h2>Het brein is nog niet gebouwd</h2>
          <p>
            Vraag Dottie om een eerste bouw: <code>scripts/agent/build-second-brain.sh</code>
          </p>
        </div>
      </div>
    );
  }

  const gelezenAantal = verwerkt.verbanden.filter((v) => v.extracted).length;
  const afgeleidAantal = verwerkt.verbanden.length - gelezenAantal;
  const geselecteerdeKnoop =
    geselecteerdId != null ? (verwerkt.knoopPerId.get(geselecteerdId) ?? null) : null;
  const clusterVanGeselecteerde = geselecteerdeKnoop
    ? (verwerkt.clusterPerSleutel.get(geselecteerdeKnoop.community) ?? null)
    : null;

  return (
    <div className="hm-sb hm-view">
      <div className="hm-sb__balk">
        <div className="hm-sb__zoekwrap">
          <Search className="hm-sb__zoekicoon" size={14} strokeWidth={2.4} />
          <input
            aria-label="Zoek in het brein"
            autoComplete="off"
            className="hm-sb__zoekpil"
            onChange={(e) => setZoekterm(e.target.value)}
            placeholder="Zoek een document of begrip…"
            ref={zoekInputRef}
            type="text"
            value={zoekterm}
          />
          <span className="hm-sb__sneltoets">⌘K</span>
          {zoekterm.trim() && (
            <div className="hm-sb__zoeklijst" role="listbox">
              {zoekResultaten.length > 0 ? (
                zoekResultaten.map((k) => {
                  const cluster = verwerkt.clusterPerSleutel.get(k.community);
                  return (
                    <button
                      aria-selected={false}
                      className="hm-sb__zoekitem"
                      key={k.id}
                      onClick={() => {
                        selecteer(k.id, true);
                        setZoekterm("");
                      }}
                      role="option"
                      type="button"
                    >
                      <span
                        className={`hm-sb__stip hm-kleur hm-kleur--${cluster?.kleur ?? "grijs"}`}
                      />
                      {k.label}
                      <small>{k.community}</small>
                    </button>
                  );
                })
              ) : (
                <p className="hm-sb__zoekleeg">Niets gevonden.</p>
              )}
            </div>
          )}
        </div>
        <div className="hm-sb__schakels">
          <button
            aria-pressed={toonInferred}
            className="hm-sb__schakel"
            onClick={() => setToonInferred((v) => !v)}
            type="button"
          >
            <span className="hm-sb__vinkje" />
            Afgeleide verbanden
          </button>
          <button
            aria-pressed={toonAlleLabels}
            className="hm-sb__schakel"
            onClick={() => setToonAlleLabels((v) => !v)}
            type="button"
          >
            <span className="hm-sb__vinkje" />
            Alle labels
          </button>
        </div>
        <button
          className="hm-sb__margetoggle"
          onClick={() => setMargeOpen((v) => !v)}
          type="button"
        >
          In de marge
        </button>
      </div>

      <div className="hm-sb__vlak">
        <aside className={`hm-sb__marge${margeOpen ? " is-open" : ""}`}>
          <div>
            <h3>In de marge</h3>
            {geselecteerdeKnoop ? (
              <p className="hm-sb__kanttekening">
                <b>{geselecteerdeKnoop.label}</b> — {kanttekeningVoor(geselecteerdeKnoop)}
              </p>
            ) : (
              <p className="hm-sb__kanttekening">
                Het brein telt <b>{verwerkt.knopen.length} documenten</b> in{" "}
                {verwerkt.clusters.length} cluster{verwerkt.clusters.length === 1 ? "" : "s"}.
                Klik een stip om te lezen wat er hangt.
              </p>
            )}
          </div>
          <div>
            <h3>Meest verbonden</h3>
            <div className="hm-sb__margelijst">
              {verwerkt.godKnopen.map((k) => (
                <button
                  className="hm-sb__margeknop"
                  key={k.id}
                  onClick={() => selecteer(k.id, true)}
                  type="button"
                >
                  <span className="hm-sb__nr">{k.graad}</span>
                  {k.label}
                </button>
              ))}
            </div>
          </div>
          {verwerkt.verrassingen.length > 0 && (
            <div>
              <h3>Verrassende verbindingen</h3>
              <div>
                {verwerkt.verrassingen.map((v) => (
                  <button
                    className="hm-sb__verrassing"
                    key={`${v.a.id}-${v.b.id}`}
                    onClick={() => {
                      selecteer(v.a.id, true);
                      canvasRef.current?.flitsRand(v.a.id, v.b.id);
                    }}
                    type="button"
                  >
                    <span className="hm-sb__paar">
                      {v.a.label} ↔ {v.b.label}
                    </span>
                    <br />
                    {verrassingTekst(v.a, v.b)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3>Clusters</h3>
            <div className="hm-sb__legenda">
              {verwerkt.clusters.map((c) => (
                <button
                  className={`hm-sb__legendarij${clusterUit.has(c.key) ? " is-uit" : ""}`}
                  key={c.key}
                  onClick={() => toggleCluster(c.key)}
                  type="button"
                >
                  <span className={`hm-kleur hm-kleur--${c.kleur}`} />
                  {c.naam}
                  <span className="hm-sb__aantal">{c.aantal}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="hm-sb__canvaswrap">
          <GraphCanvas
            clusterUit={clusterUit}
            clusters={verwerkt.clusters}
            geselecteerdId={geselecteerdId}
            knopen={verwerkt.knopen}
            onOpenen={(id) => router.push(`/admin/kennisbank?doc=${id}`)}
            onSelecteer={(id) => selecteer(id, false)}
            ref={canvasRef}
            toonAlleLabels={toonAlleLabels}
            toonInferred={toonInferred}
            verbanden={verwerkt.verbanden}
          />
          {geselecteerdeKnoop && (
            <aside aria-live="polite" className="hm-sb__inspector">
              <div className="hm-sb__insp-kop">
                <h2 className="hm-sb__insp-titel">{geselecteerdeKnoop.label}</h2>
                <button
                  aria-label="Inspector sluiten"
                  className="hm-sb__sluit"
                  onClick={() => selecteer(null, false)}
                  type="button"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="hm-sb__pilrij">
                <span
                  className={`hm-pill hm-kleur--${clusterVanGeselecteerde?.kleur ?? "grijs"}`}
                >
                  <span
                    className={`hm-kleur hm-kleur--${clusterVanGeselecteerde?.kleur ?? "grijs"}`}
                  />
                  {clusterVanGeselecteerde?.naam ?? geselecteerdeKnoop.community}
                </span>
                <span className="hm-pill hm-pill--slate">
                  {geselecteerdeKnoop.fileType ?? "Document"}
                </span>
                <span className="hm-pill hm-pill--slate">
                  {geselecteerdeKnoop.graad} verbinding{geselecteerdeKnoop.graad === 1 ? "" : "en"}
                </span>
              </div>
              <p className="hm-sb__insp-noot">{kanttekeningVoor(geselecteerdeKnoop)}</p>
              <p className="hm-sb__insp-sectie">
                Hangt samen met ({geselecteerdeKnoop.buren.length})
              </p>
              <div className="hm-sb__buurlijst">
                {geselecteerdeKnoop.buren.map((b) => {
                  const buurKnoop = verwerkt.knoopPerId.get(b.knoopId);
                  if (!buurKnoop) return null;
                  const buurCluster = verwerkt.clusterPerSleutel.get(buurKnoop.community);
                  return (
                    <button
                      className="hm-sb__buur"
                      key={b.knoopId}
                      onClick={() => selecteer(b.knoopId, true)}
                      style={{ borderLeftColor: `var(--hm-${buurCluster?.kleur ?? "grijs"})` }}
                      type="button"
                    >
                      {buurKnoop.label}
                      <small>{b.extracted ? "gelezen" : "afgeleid"}</small>
                    </button>
                  );
                })}
              </div>
              <button
                className="hm-sb__open-knop"
                onClick={() => router.push(`/admin/kennisbank?doc=${geselecteerdeKnoop.id}`)}
                type="button"
              >
                Openen in kennisbank
              </button>
            </aside>
          )}
        </div>
      </div>

      <div className="hm-sb__status">
        <span>
          <b>{verwerkt.knopen.length}</b> documenten
        </span>
        <span className="hm-sb__punt">·</span>
        <span>
          <b>{verwerkt.verbanden.length}</b> verbindingen
        </span>
        <span className="hm-sb__punt">·</span>
        <span>
          <b>{verwerkt.clusters.length}</b> clusters
        </span>
        <span className="hm-sb__punt">·</span>
        <span>
          <b>{gelezenAantal}</b> gelezen / <b>{afgeleidAantal}</b> afgeleid
        </span>
        {doc?.updatedAt && (
          <span className="hm-sb__hermes">
            <span className="hm-sb__lampje" />
            {relatieveVerversing(doc.updatedAt, nu)}
          </span>
        )}
      </div>
    </div>
  );
}

export function SecondBrainClient({ nu }: { nu: number }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Werkblad nu={nu} />
    </QueryClientProvider>
  );
}
