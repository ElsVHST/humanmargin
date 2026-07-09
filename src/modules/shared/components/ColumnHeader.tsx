"use client";

import React, { useState } from "react";

type KolomInfo = {
  id: string;
  naam: string;
  kleur: string;
  isFallback: boolean;
  deals: unknown[];
};

export type ColumnHeaderProps = {
  kolom: KolomInfo;
  isBeheerder: boolean;
  /** Metaregel onder de naam, Pipedrive-stijl: "€ 12.400 · 3 deals". */
  meta?: string;
  onRename: (id: number, naam: string) => void;
};

/**
 * Kolomkop als trechter-segment (PRD §2.1): naam + metaregel, chevron-vorm
 * via board.scss. Verwijderen/kleur/volgorde loopt via het kolommen-sidepanel.
 */
export function ColumnHeader({
  kolom,
  isBeheerder,
  meta,
  onRename,
}: ColumnHeaderProps) {
  const [bewerkt, setBewerkt] = useState(false);
  const [naam, setNaam] = useState(kolom.naam);

  const magBeheren = isBeheerder && !kolom.isFallback;

  const bevestigNaam = () => {
    setBewerkt(false);
    const schoon = naam.trim();
    if (schoon && schoon !== kolom.naam) {
      onRename(Number(kolom.id), schoon);
    } else {
      setNaam(kolom.naam);
    }
  };

  return (
    <div
      className={`hm-kolomkop${kolom.isFallback ? " hm-kolomkop--fallback" : ""}`}
    >
      <div className="hm-kolomkop__rij">
        <span className={`hm-kleur hm-kleur--${kolom.kleur}`} />
        {bewerkt ? (
          <input
            autoFocus
            className="hm-kolomkop__input"
            onBlur={bevestigNaam}
            onChange={(e) => setNaam(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") bevestigNaam();
              if (e.key === "Escape") {
                setNaam(kolom.naam);
                setBewerkt(false);
              }
            }}
            value={naam}
          />
        ) : (
          <button
            className="hm-kolomkop__naam"
            disabled={!magBeheren}
            onClick={() => magBeheren && setBewerkt(true)}
            title={magBeheren ? "Klik om te hernoemen" : undefined}
            type="button"
          >
            {kolom.naam}
          </button>
        )}
        <span className="hm-kolomkop__aantal">{kolom.deals.length}</span>
      </div>
      {meta && <div className="hm-kolomkop__meta">{meta}</div>}
    </div>
  );
}
