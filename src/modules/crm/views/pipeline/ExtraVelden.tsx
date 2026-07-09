"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

import type { CrmVeld } from "@/payload-types";

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return ((await res.json()) as { docs: T[] }).docs;
}

export function useCrmVelden() {
  return useQuery({
    queryKey: ["lijst", "crm-velden"],
    queryFn: () =>
      fetchDocs<CrmVeld>("/api/crm-velden?limit=200&sort=_order&depth=0"),
  });
}

export type ExtraWaarden = Record<string, unknown>;

function str(waarde: unknown): string {
  return typeof waarde === "string" ? waarde : "";
}

function VeldInput({
  onZet,
  updatedAt,
  veld,
  waarde,
}: {
  veld: CrmVeld;
  waarde: unknown;
  onZet: (waarde: unknown) => void;
  updatedAt: string;
}) {
  const k = `xv-${veld.sleutel}-${updatedAt}`;
  const opties = (veld.opties ?? []).filter(Boolean);

  switch (veld.type) {
    case "tekstvak":
      return (
        <label>
          {veld.label}
          <textarea
            defaultValue={str(waarde)}
            key={k}
            onBlur={(e) => {
              const nieuw = e.target.value.trim() || null;
              if (nieuw !== (str(waarde) || null)) onZet(nieuw);
            }}
            rows={3}
          />
        </label>
      );
    case "getal":
      return (
        <label>
          {veld.label}
          <input
            defaultValue={typeof waarde === "number" ? waarde : ""}
            key={k}
            onBlur={(e) => {
              const nieuw =
                e.target.value === "" ? null : Number(e.target.value);
              if (nieuw !== (typeof waarde === "number" ? waarde : null)) {
                onZet(nieuw);
              }
            }}
            type="number"
          />
        </label>
      );
    case "datum":
      return (
        <label>
          {veld.label}
          <input
            defaultValue={str(waarde)}
            key={k}
            onBlur={(e) => {
              const nieuw = e.target.value || null;
              if (nieuw !== (str(waarde) || null)) onZet(nieuw);
            }}
            type="date"
          />
        </label>
      );
    case "janee":
      return (
        <label className="hm-check">
          <input
            checked={Boolean(waarde)}
            onChange={(e) => onZet(e.target.checked)}
            type="checkbox"
          />
          {veld.label}
        </label>
      );
    case "select":
      return (
        <label>
          {veld.label}
          <select
            onChange={(e) => onZet(e.target.value || null)}
            value={str(waarde)}
          >
            <option value="">—</option>
            {opties.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      );
    case "multiselect": {
      const gekozen = Array.isArray(waarde)
        ? waarde.filter((w): w is string => typeof w === "string")
        : [];
      return (
        <div className="hm-veld">
          {veld.label}
          <div className="hm-multikeuze">
            {opties.map((o) => (
              <label className="hm-check" key={o}>
                <input
                  checked={gekozen.includes(o)}
                  onChange={(e) =>
                    onZet(
                      e.target.checked
                        ? [...gekozen, o]
                        : gekozen.filter((g) => g !== o),
                    )
                  }
                  type="checkbox"
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );
    }
    case "link":
      return (
        <label>
          {veld.label}
          <input
            defaultValue={str(waarde)}
            key={k}
            onBlur={(e) => {
              const nieuw = e.target.value.trim() || null;
              if (nieuw !== (str(waarde) || null)) onZet(nieuw);
            }}
            placeholder="https://…"
            type="url"
          />
        </label>
      );
    default:
      return (
        <label>
          {veld.label}
          <input
            defaultValue={str(waarde)}
            key={k}
            onBlur={(e) => {
              const nieuw = e.target.value.trim() || null;
              if (nieuw !== (str(waarde) || null)) onZet(nieuw);
            }}
          />
        </label>
      );
  }
}

/**
 * Dynamische sectie met Els's eigen CRM-velden (MKB-plan B4): rendert per
 * definitie het juiste input-type; waarden autosaven naar `extraVelden`
 * (json — altijd het volledige object patchen, de kolom wordt vervangen).
 */
export function ExtraVeldenSectie({
  doel,
  onOpslaan,
  updatedAt,
  waarden,
}: {
  doel: "organisaties" | "contacten";
  waarden: ExtraWaarden;
  onOpslaan: (nieuw: ExtraWaarden) => void;
  updatedAt: string;
}) {
  const velden = useCrmVelden();
  const relevant = (velden.data ?? []).filter(
    (v) => v.geldtVoor === "beide" || v.geldtVoor === doel,
  );
  if (relevant.length === 0) return null;

  return (
    <details className="hm-sectie" open>
      <summary>Extra velden</summary>
      <div className="hm-sectie__body">
        {relevant.map((veld) => (
          <VeldInput
            key={veld.id}
            onZet={(waarde) =>
              onOpslaan({ ...waarden, [veld.sleutel ?? ""]: waarde })
            }
            updatedAt={updatedAt}
            veld={veld}
            waarde={veld.sleutel ? waarden[veld.sleutel] : undefined}
          />
        ))}
      </div>
    </details>
  );
}
