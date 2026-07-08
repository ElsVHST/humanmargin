"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";

import type { Activity } from "@/payload-types";

import "./timeline.scss";

const TYPE_LABELS: Record<string, string> = {
  notitie: "Notitie",
  statuswijziging: "Statuswijziging",
  systeem: "Systeem",
  email: "E-mail",
  boeking: "Boeking",
};

function datumLabel(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function auteurNaam(activiteit: Activity): string | null {
  const auteur = activiteit.auteur;
  if (auteur && typeof auteur === "object") return auteur.name;
  return null;
}

export function TimelineField() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <TimelineInner />
    </QueryClientProvider>
  );
}

function TimelineInner() {
  const { id, collectionSlug } = useDocumentInfo();
  const qc = useQueryClient();
  const [notitie, setNotitie] = useState("");

  const activiteiten = useQuery({
    queryKey: ["timeline", collectionSlug, id],
    enabled: Boolean(id && collectionSlug),
    queryFn: async () => {
      const qs = new URLSearchParams({
        "where[and][0][targets.relationTo][equals]": String(collectionSlug),
        "where[and][1][targets.value][equals]": String(id),
        sort: "-happensAt",
        limit: "50",
        depth: "1",
      });
      const res = await fetch(`/api/activities?${qs.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`GET activities → ${res.status}`);
      return ((await res.json()) as { docs: Activity[] }).docs;
    },
  });

  const voegToe = useMutation({
    mutationFn: async (samenvatting: string) => {
      const res = await fetch("/api/activities", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notitie",
          samenvatting,
          targets: [{ relationTo: collectionSlug, value: id }],
          happensAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`POST activities → ${res.status}`);
    },
    onSuccess: () => {
      setNotitie("");
      void qc.invalidateQueries({ queryKey: ["timeline", collectionSlug, id] });
    },
  });

  if (!id) return null;

  const items = activiteiten.data ?? [];

  return (
    <div className="hm-timeline">
      <h3 className="hm-timeline__titel">Tijdlijn</h3>
      <div className="hm-timeline__invoer">
        <input
          className="hm-timeline__veld"
          onChange={(e) => setNotitie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && notitie.trim()) {
              voegToe.mutate(notitie.trim());
            }
          }}
          placeholder="Notitie toevoegen…"
          value={notitie}
        />
        <button
          className="hm-timeline__knop"
          disabled={voegToe.isPending || notitie.trim() === ""}
          onClick={() => voegToe.mutate(notitie.trim())}
          type="button"
        >
          Toevoegen
        </button>
      </div>
      {voegToe.isError && (
        <p className="hm-timeline__fout" role="alert">
          Notitie opslaan mislukt. Probeer het opnieuw.
        </p>
      )}
      {items.length === 0 ? (
        <p className="hm-timeline__leeg">
          {activiteiten.isLoading ? "Laden…" : "Nog geen activiteiten."}
        </p>
      ) : (
        <ul className="hm-timeline__lijst">
          {items.map((item) => (
            <li className="hm-timeline__item" key={item.id}>
              <span
                className={`hm-timeline__type hm-timeline__type--${item.type}`}
              >
                {TYPE_LABELS[item.type] ?? item.type}
              </span>
              <span className="hm-timeline__tekst">
                {item.samenvatting ?? "—"}
              </span>
              <span className="hm-timeline__meta">
                {auteurNaam(item) ? `${auteurNaam(item)} · ` : ""}
                {datumLabel(item.happensAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
