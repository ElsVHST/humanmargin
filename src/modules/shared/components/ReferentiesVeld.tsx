"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, X } from "lucide-react";
import React, { useState } from "react";

import { DocPanel } from "@/modules/knowledge/views/kennisbank/DocPanel";
import type { KnowledgeDoc } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

type Props = {
  /** Huidige referenties (ids of gepopuleerde docs, zoals Payload ze geeft). */
  waarde: (number | KnowledgeDoc)[] | null | undefined;
  onWijzig: (ids: number[]) => void;
};

function idVan(ref: number | KnowledgeDoc): number {
  return typeof ref === "object" ? ref.id : ref;
}

/**
 * Kennisbank-referenties op een record: chips + toevoegen uit de kennisbank.
 * Chip aanklikken opent het document direct in een gestapeld paneel —
 * context reist mee zonder het record te verlaten.
 */
export function ReferentiesVeld({ onWijzig, waarde }: Props) {
  const [leesDoc, setLeesDoc] = useState<KnowledgeDoc | null>(null);

  const docsQuery = useQuery({
    queryKey: ["panel", "kennisdocs"],
    queryFn: async () => {
      const res = await fetch(
        "/api/knowledge-docs?limit=500&sort=titel&depth=0",
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`GET knowledge-docs → ${res.status}`);
      return ((await res.json()) as { docs: KnowledgeDoc[] }).docs;
    },
  });

  const alleDocs = docsQuery.data ?? [];
  const byId = new Map(alleDocs.map((d) => [d.id, d]));
  const huidige = (waarde ?? []).map(idVan);
  const beschikbaar = alleDocs.filter((d) => !huidige.includes(d.id));

  return (
    <div className="hm-refs">
      <span className="hm-refs__label">Referenties (kennisbank)</span>
      <div className="hm-refs__chips">
        {huidige.map((id) => {
          const doc =
            byId.get(id) ??
            ((waarde ?? []).find(
              (r) => typeof r === "object" && r.id === id,
            ) as KnowledgeDoc | undefined);
          return (
            <span className="hm-refs__chip" key={id}>
              <button
                onClick={() => doc && setLeesDoc(doc)}
                title="Openen"
                type="button"
              >
                <BookOpen size={12} strokeWidth={2} />
                {doc?.titel ?? `#${id}`}
              </button>
              <button
                aria-label="Referentie weghalen"
                className="hm-refs__weg"
                onClick={() => onWijzig(huidige.filter((x) => x !== id))}
                type="button"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          );
        })}
        {huidige.length === 0 && (
          <span className="hm-refs__leeg">Nog geen referenties.</span>
        )}
      </div>
      <select
        className="hm-refs__select"
        onChange={(e) => {
          if (e.target.value) {
            onWijzig([...huidige, Number(e.target.value)]);
            e.target.value = "";
          }
        }}
        value=""
      >
        <option value="">+ Referentie toevoegen…</option>
        {beschikbaar.map((d) => (
          <option key={d.id} value={String(d.id)}>
            {d.titel}
          </option>
        ))}
      </select>

      {leesDoc && (
        <DocPanel
          doc={leesDoc}
          onGewijzigd={() => {}}
          onSluit={() => setLeesDoc(null)}
        />
      )}
    </div>
  );
}
