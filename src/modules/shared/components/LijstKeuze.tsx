"use client";

import React, { useId, useState } from "react";

export type LijstOptie = { id: number; naam: string };

/**
 * Create-on-type combobox voor beheerbare lijsten (sectoren/functies, MKB-plan
 * B3): typ een naam — bestaande suggestie kiest het doc, een nieuwe naam maakt
 * er één aan via onNieuw. Leegmaken = koppeling wissen.
 */
export function LijstKeuze({
  onKies,
  onNieuw,
  opties,
  placeholder,
  waarde,
}: {
  /** Huidige naam (gepopuleerde relatie) of leeg. */
  waarde: string;
  opties: LijstOptie[];
  onKies: (id: number | null) => void;
  /** Maakt een nieuw doc aan (POST) en koppelt het daarna zelf. */
  onNieuw: (naam: string) => void;
  placeholder?: string;
}) {
  const listId = useId();
  const [tekst, setTekst] = useState(waarde);

  const commit = () => {
    const schoon = tekst.trim();
    if (!schoon) {
      if (waarde) onKies(null);
      return;
    }
    if (schoon === waarde) return;
    const bestaand = opties.find(
      (o) => o.naam.toLowerCase() === schoon.toLowerCase(),
    );
    if (bestaand) {
      setTekst(bestaand.naam);
      onKies(bestaand.id);
    } else {
      onNieuw(schoon);
    }
  };

  return (
    <>
      <input
        list={listId}
        onBlur={commit}
        onChange={(e) => setTekst(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder={placeholder ?? "Typ om te kiezen of toe te voegen…"}
        value={tekst}
      />
      <datalist id={listId}>
        {opties.map((o) => (
          <option key={o.id} value={o.naam} />
        ))}
      </datalist>
    </>
  );
}
