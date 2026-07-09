"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

import type { Activity } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

/** Record-types waar een tijdlijn aan kan hangen (activities.targets). */
export type TijdlijnDoel =
  | "organisations"
  | "contacts"
  | "deals"
  | "projects"
  | "tasks"
  | "content-items"
  | "knowledge-docs";

type Props = {
  relationTo: TijdlijnDoel;
  recordId: number | string;
  onFout?: (melding: string) => void;
  titel?: string;
};

const TYPE_LABEL: Record<Activity["type"], string> = {
  notitie: "Notitie",
  statuswijziging: "Status",
  systeem: "Systeem",
  email: "E-mail",
  boeking: "Boeking",
  vraag: "Vraag",
  log: "LOG",
};

function datumTijd(iso?: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function auteurNaam(a: Activity): string | null {
  if (a.auteur && typeof a.auteur === "object") return a.auteur.name;
  return null;
}

/**
 * Generieke tijdlijn + notitieveld voor élk record (in-the-loop OS: comments,
 * vragen en LOG-beslissingen leven op de kaart — dat is het geheugen).
 */
export function RecordTijdlijn({ onFout, recordId, relationTo, titel }: Props) {
  const qc = useQueryClient();
  const [notitie, setNotitie] = useState("");
  const sleutel = ["tijdlijn", relationTo, String(recordId)];

  const activiteiten = useQuery({
    queryKey: sleutel,
    queryFn: async () => {
      const res = await fetch(
        `/api/activities?where[targets.relationTo][equals]=${relationTo}&where[targets.value][equals]=${recordId}&sort=-happensAt&limit=60&depth=1`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`GET activities → ${res.status}`);
      return ((await res.json()) as { docs: Activity[] }).docs;
    },
  });

  const plaats = useMutation({
    mutationFn: async (tekst: string) => {
      const res = await fetch("/api/activities", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notitie",
          samenvatting: tekst,
          targets: [{ relationTo, value: Number(recordId) }],
          happensAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`POST activities → ${res.status}`);
    },
    onSuccess: () => {
      setNotitie("");
      qc.invalidateQueries({ queryKey: sleutel });
    },
    onError: () => onFout?.("Notitie plaatsen mislukt."),
  });

  return (
    <div className="hm-dealpanel__tijdlijn hm-tijdlijn">
      <h4>{titel ?? "Tijdlijn"}</h4>
      <form
        className="hm-dealpanel__notitie"
        onSubmit={(e) => {
          e.preventDefault();
          const tekst = notitie.trim();
          if (tekst) plaats.mutate(tekst);
        }}
      >
        <textarea
          onChange={(e) => setNotitie(e.target.value)}
          placeholder="Notitie of antwoord toevoegen…"
          rows={2}
          value={notitie}
        />
        <button
          className="hm-btn hm-btn--ghost"
          disabled={!notitie.trim() || plaats.isPending}
          type="submit"
        >
          Toevoegen
        </button>
      </form>
      {activiteiten.isLoading && <p className="hm-empty">Laden…</p>}
      {activiteiten.data?.length === 0 && (
        <p className="hm-empty">Nog geen activiteit.</p>
      )}
      <ul className="hm-dealpanel__feed">
        {(activiteiten.data ?? []).map((a) => (
          <li key={a.id}>
            <span className={`hm-pill hm-tijdlijn__type--${a.type}`}>
              {TYPE_LABEL[a.type]}
            </span>
            <div>
              <p>{a.samenvatting ?? "—"}</p>
              <small>
                {auteurNaam(a) ? `${auteurNaam(a)} · ` : ""}
                {datumTijd(a.happensAt)}
              </small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
