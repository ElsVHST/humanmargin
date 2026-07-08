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
  onRename: (id: number, naam: string) => void;
  onTrash: (id: number, kaartAantal: number, naam: string) => void;
};

/** Kolomkop met inline hernoemen en verwijderen (gedeeld door alle boards). */
export function ColumnHeader({
  kolom,
  isBeheerder,
  onRename,
  onTrash,
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
    <div className="hm-pipeline__kolomkop">
      <span className={`hm-kleur hm-kleur--${kolom.kleur}`} />
      {bewerkt ? (
        <input
          autoFocus
          className="hm-pipeline__kolominput"
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
          className="hm-pipeline__kolomnaam"
          disabled={!magBeheren}
          onClick={() => magBeheren && setBewerkt(true)}
          title={magBeheren ? "Klik om te hernoemen" : undefined}
          type="button"
        >
          {kolom.naam}
        </button>
      )}
      <span className="hm-pipeline__aantal">{kolom.deals.length}</span>
      {magBeheren && (
        <button
          aria-label={`Kolom ${kolom.naam} verwijderen`}
          className="hm-pipeline__verwijder"
          onClick={() =>
            onTrash(Number(kolom.id), kolom.deals.length, kolom.naam)
          }
          title="Kolom verwijderen (naar prullenbak)"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
}
