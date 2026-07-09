"use client";

import { Pencil, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

import { RichText } from "@/components/RichText";
import type { KnowledgeDoc } from "@/payload-types";

type Props = {
  doc: KnowledgeDoc;
  onSluit: () => void;
};

function datumLang(iso?: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Lees-slideover voor kennisdocumenten: inhoud lezen zonder de editor in te gaan. */
export function LeesPanel({ doc, onSluit }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSluit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSluit]);

  const auteur =
    doc.auteur && typeof doc.auteur === "object" ? doc.auteur.name : null;

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onSluit}
        role="presentation"
      />
      <aside
        aria-label={doc.titel}
        className="hm-slideover hm-slideover--breed"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <h3>{doc.titel}</h3>
          <Link
            className="hm-btn hm-btn--ghost hm-kb__leesbewerk"
            href={`/admin/collections/knowledge-docs/${doc.id}`}
          >
            <Pencil size={13} strokeWidth={2} />
            Bewerken
          </Link>
          <button
            aria-label="Sluiten"
            className="hm-slideover__close"
            onClick={onSluit}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="hm-kb__leesmeta">
          {auteur && <span>{auteur}</span>}
          <span>bijgewerkt {datumLang(doc.updatedAt)}</span>
          <span
            className={`hm-pill ${doc.zichtbaarheid === "publiek" ? "hm-pill--emerald" : "hm-pill--slate"}`}
          >
            {doc.zichtbaarheid === "publiek" ? "Publiek" : "Intern"}
          </span>
          {(doc.tags ?? []).map((tag) => (
            <span className="hm-pill hm-pill--slate" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="hm-slideover__body hm-kb__leesinhoud">
          {doc.inhoud ? (
            <RichText data={doc.inhoud} />
          ) : (
            <p className="hm-empty">
              Dit document heeft nog geen inhoud — klik op Bewerken om te
              schrijven.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
