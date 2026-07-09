"use client";

import { ArrowLeft, Folder, House, Search } from "lucide-react";
import React, { useMemo, useState } from "react";

import type { KnowledgeDoc } from "@/payload-types";

type Props = {
  /** Alle (niet-getrashte) docs, voor de mappenlijst. */
  docs: KnowledgeDoc[];
  /** Ids van items die verplaatst worden (incl. hun subtrees = verboden doelen). */
  teVerplaatsen: number[];
  onKies: (parent: number | null) => void;
  onSluit: () => void;
};

function parentIdOf(doc: KnowledgeDoc): number | null {
  const p = doc.parent;
  if (p == null) return null;
  return typeof p === "object" ? p.id : p;
}

/** Verplaats-popup (myDrive MoverPopup): mini-verkenner door de mappenboom. */
export function VerplaatsDialoog({ docs, onKies, onSluit, teVerplaatsen }: Props) {
  const [huidig, setHuidig] = useState<number | null>(null);
  const [zoek, setZoek] = useState("");

  const byId = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);

  // Verboden doelen: de items zelf + al hun nakomelingen (geen cykels maken)
  const verboden = useMemo(() => {
    const set = new Set<number>(teVerplaatsen);
    let groeide = true;
    while (groeide) {
      groeide = false;
      for (const d of docs) {
        const pid = parentIdOf(d);
        if (pid != null && set.has(pid) && !set.has(d.id)) {
          set.add(d.id);
          groeide = true;
        }
      }
    }
    return set;
  }, [docs, teVerplaatsen]);

  const heeftKinderen = (id: number) => docs.some((d) => parentIdOf(d) === id);
  const isMap = (d: KnowledgeDoc) => d.soort === "map" || heeftKinderen(d.id);

  const term = zoek.trim().toLowerCase();
  const mappen = docs
    .filter((d) => isMap(d) && !verboden.has(d.id))
    .filter((d) =>
      term
        ? d.titel.toLowerCase().includes(term)
        : parentIdOf(d) === huidig,
    )
    .sort((a, b) => a.titel.localeCompare(b.titel, "nl"));

  const huidigeMap = huidig != null ? byId.get(huidig) : null;
  const doelNaam = huidigeMap?.titel ?? "Kennisbank (hoofdniveau)";

  return (
    <>
      <div
        aria-hidden
        className="hm-dialoog__backdrop"
        onClick={onSluit}
        role="presentation"
      />
      <div aria-label="Verplaatsen" className="hm-dialoog hm-kb__mover" role="dialog">
        <div className="hm-kb__moverkop">
          <button
            aria-label="Map omhoog"
            className="hm-kb__movernav"
            disabled={huidig == null}
            onClick={() =>
              setHuidig(huidigeMap ? parentIdOf(huidigeMap) : null)
            }
            type="button"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="hm-kb__moverzoek">
            <Search size={14} />
            <input
              onChange={(e) => setZoek(e.target.value)}
              placeholder="Map zoeken…"
              value={zoek}
            />
          </span>
          <button
            aria-label="Naar hoofdniveau"
            className="hm-kb__movernav"
            onClick={() => {
              setHuidig(null);
              setZoek("");
            }}
            type="button"
          >
            <House size={16} />
          </button>
        </div>

        <p className="hm-kb__moverpad">{doelNaam}</p>

        <div className="hm-kb__moverlijst">
          {mappen.length === 0 && (
            <p className="hm-empty">
              {term ? "Geen mappen gevonden." : "Geen submappen hier."}
            </p>
          )}
          {mappen.map((map) => (
            <button
              className="hm-kb__moverrij"
              key={map.id}
              onClick={() => {
                setHuidig(map.id);
                setZoek("");
              }}
              type="button"
            >
              <Folder size={16} style={{ color: "#3b82f6" }} />
              {map.titel}
            </button>
          ))}
        </div>

        <div className="hm-dialoog__acties">
          <button className="hm-btn hm-btn--ghost" onClick={onSluit} type="button">
            Annuleren
          </button>
          <button
            className="hm-btn hm-btn--primary"
            onClick={() => onKies(huidig)}
            type="button"
          >
            Verplaats naar {huidigeMap?.titel ?? "hoofdniveau"}
          </button>
        </div>
      </div>
    </>
  );
}
