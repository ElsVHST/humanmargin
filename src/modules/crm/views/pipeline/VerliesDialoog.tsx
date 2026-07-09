"use client";

import React, { useState } from "react";

import "@/modules/shared/styles/dashboard.scss";

type Props = {
  dealTitel: string;
  onAnnuleer: () => void;
  onBevestig: (reden: string) => void;
};

/** Nette bevestiging bij 'verloren' — vraagt om de reden (verlorenReden). */
export function VerliesDialoog({ dealTitel, onAnnuleer, onBevestig }: Props) {
  const [reden, setReden] = useState("");
  return (
    <>
      <div
        aria-hidden
        className="hm-dialoog__backdrop"
        onClick={onAnnuleer}
        role="presentation"
      />
      <div aria-label="Deal verloren" className="hm-dialoog" role="dialog">
        <h3>Deal verloren</h3>
        <p>
          Markeer <b>{dealTitel}</b> als verloren. Wat was de reden?
        </p>
        <textarea
          autoFocus
          onChange={(e) => setReden(e.target.value)}
          placeholder="Bijv. budget, timing, concurrent… (mag leeg)"
          rows={3}
          value={reden}
        />
        <div className="hm-dialoog__acties">
          <button className="hm-btn hm-btn--ghost" onClick={onAnnuleer} type="button">
            Annuleren
          </button>
          <button
            className="hm-btn hm-btn--gevaar"
            onClick={() => onBevestig(reden.trim())}
            type="button"
          >
            Markeer als verloren
          </button>
        </div>
      </div>
    </>
  );
}
