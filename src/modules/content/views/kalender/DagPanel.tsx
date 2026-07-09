"use client";

import { CalendarDays, Plus, SquareCheck, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

import type { ContentItem, Task } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

type Props = {
  /** YYYY-MM-DD */
  dag: string;
  content: ContentItem[];
  taken: Task[];
  onClose: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  idee: "Idee",
  concept: "Concept",
  gepland: "Gepland",
  gepubliceerd: "Gepubliceerd",
};

function kanaalNaam(item: ContentItem): string | null {
  if (item.kanaal && typeof item.kanaal === "object") return item.kanaal.naam;
  return null;
}

function projectNaam(taak: Task): string | null {
  if (taak.project && typeof taak.project === "object") {
    return taak.project.naam;
  }
  return null;
}

/**
 * Dagpaneel: alles wat op één dag speelt (content + taak-deadlines) met
 * directe planknoppen — de kalender als planning-hub.
 */
export function DagPanel({ content, dag, onClose, taken }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const label = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dag}T12:00:00`));

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside aria-label={label} className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3 style={{ textTransform: "capitalize" }}>{label}</h3>
          <button
            aria-label="Sluiten"
            className="hm-slideover__close"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="hm-slideover__body hm-dagpanel">
          <div className="hm-dagpanel__acties">
            <Link
              className="hm-btn hm-btn--primary"
              href={`/admin/kalender?item=nieuw&datum=${dag}`}
            >
              <Plus size={14} strokeWidth={2.5} /> Content plannen
            </Link>
            <Link
              className="hm-btn hm-btn--ghost"
              href={`/admin/kalender?taak=nieuw&datum=${dag}`}
            >
              <Plus size={14} strokeWidth={2.5} /> Taak plannen
            </Link>
          </div>

          <h4 className="hm-dagpanel__kop">
            <CalendarDays size={14} strokeWidth={2} /> Content ({content.length})
          </h4>
          {content.length === 0 && (
            <p className="hm-empty">Niets gepland op deze dag.</p>
          )}
          <ul className="hm-dagpanel__lijst">
            {content.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/kalender?item=${item.id}`}>
                  <span className="hm-dagpanel__titel">{item.titel}</span>
                  <span className="hm-dagpanel__meta">
                    {kanaalNaam(item) ? `${kanaalNaam(item)} · ` : ""}
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h4 className="hm-dagpanel__kop">
            <SquareCheck size={14} strokeWidth={2} /> Taken met deadline (
            {taken.length})
          </h4>
          {taken.length === 0 && (
            <p className="hm-empty">Geen taak-deadlines op deze dag.</p>
          )}
          <ul className="hm-dagpanel__lijst">
            {taken.map((taak) => (
              <li key={taak.id}>
                <Link href={`/admin/kalender?taak=${taak.id}`}>
                  <span className="hm-dagpanel__titel">{taak.titel}</span>
                  <span className="hm-dagpanel__meta">
                    {projectNaam(taak) ? `${projectNaam(taak)} · ` : ""}
                    prioriteit {taak.prioriteit}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
