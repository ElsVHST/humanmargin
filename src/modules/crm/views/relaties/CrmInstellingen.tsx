"use client";

import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { KolommenBeheer } from "@/modules/shared/components/ColumnsPanel";
import type { Functie, Sector } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

type Props = {
  isBeheerder: boolean;
  sectoren: Sector[];
  functies: Functie[];
  aantalPerSector: (id: number) => number;
  aantalPerFunctie: (id: number) => number;
  onClose: () => void;
  onFout: (melding: string) => void;
  onGewijzigd: () => void;
};

/**
 * CRM-instellingen-slideover (MKB-plan B6): één beheerplek voor de
 * beheerbare lijsten van het CRM — zonder de Payload-editor.
 */
export function CrmInstellingen({
  aantalPerFunctie,
  aantalPerSector,
  functies,
  isBeheerder,
  onClose,
  onFout,
  onGewijzigd,
  sectoren,
}: Props) {
  const [tab, setTab] = useState<"sectoren" | "functies">("sectoren");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const naarKolommen = (docs: (Sector | Functie)[]) =>
    docs.map((d) => ({
      id: d.id,
      naam: d.naam,
      kleur: d.kleur,
      _order: d._order,
    }));

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label="CRM-instellingen"
        className="hm-slideover"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <h3>CRM-instellingen</h3>
          <button
            aria-label="Sluiten"
            className="hm-slideover__close"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="hm-slideover__body">
          <div className="hm-seg hm-instellingen__tabs">
            <button
              className={tab === "sectoren" ? "is-actief" : ""}
              onClick={() => setTab("sectoren")}
              type="button"
            >
              Sectoren ({sectoren.length})
            </button>
            <button
              className={tab === "functies" ? "is-actief" : ""}
              onClick={() => setTab("functies")}
              type="button"
            >
              Functies ({functies.length})
            </button>
          </div>

          {tab === "sectoren" ? (
            <KolommenBeheer
              aantalPerKolom={aantalPerSector}
              collectionSlug="sectoren"
              isBeheerder={isBeheerder}
              itemNaam="sector"
              kaartNaam="organisatie"
              kolommen={naarKolommen(sectoren)}
              onFout={onFout}
              onGewijzigd={onGewijzigd}
              toevoegLabel="Sector toevoegen"
              verwijderMelding={(naam, aantal) =>
                aantal > 0
                  ? `${aantal} organisatie${aantal === 1 ? "" : "s"} gebruik${aantal === 1 ? "t" : "en"} '${naam}' — het label vervalt daar.`
                  : `'${naam}' wordt nergens gebruikt.`
              }
            />
          ) : (
            <KolommenBeheer
              aantalPerKolom={aantalPerFunctie}
              collectionSlug="functies"
              isBeheerder={isBeheerder}
              itemNaam="functie"
              kaartNaam="contactpersoon"
              kolommen={naarKolommen(functies)}
              onFout={onFout}
              onGewijzigd={onGewijzigd}
              toevoegLabel="Functie toevoegen"
              verwijderMelding={(naam, aantal) =>
                aantal > 0
                  ? `${aantal} contactperso${aantal === 1 ? "on gebruikt" : "nen gebruiken"} '${naam}' — het label vervalt daar.`
                  : `'${naam}' wordt nergens gebruikt.`
              }
            />
          )}
        </div>
      </aside>
    </>
  );
}
