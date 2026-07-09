"use client";

import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { HmEditor, onbekendeNodeTypes } from "@/components/editor/HmEditor";
import { RichText } from "@/components/RichText";
import type { KnowledgeDoc } from "@/payload-types";

type Props = {
  doc: KnowledgeDoc;
  /** Na een geslaagde save: caller invalideert zijn lijsten. */
  onGewijzigd: () => void;
  onSluit: () => void;
};

type SaveStatus = "rust" | "bezig" | "opgeslagen" | "fout";

function datumLang(iso?: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

async function patchDoc(id: number, data: Record<string, unknown>) {
  const res = await fetch(`/api/knowledge-docs/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PATCH knowledge-docs/${id} → ${res.status}`);
}

/**
 * Documentpaneel: Google Docs-gevoel — klik op een document en schrijf direct,
 * met autosave. Bewaart exact het Payload-richText-formaat (HmEditor).
 */
export function DocPanel({ doc, onGewijzigd, onSluit }: Props) {
  const [status, setStatus] = useState<SaveStatus>("rust");
  const [zichtbaarheid, setZichtbaarheid] = useState(doc.zichtbaarheid);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSluit();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onSluit]);

  // Payload-specifieke nodes (uploads/relaties) kunnen we niet bewerken
  // zonder dataverlies — dan veilige leesweergave + route naar de admin.
  const [vreemdeNodes] = useState(() => onbekendeNodeTypes(doc.inhoud));

  const auteur =
    doc.auteur && typeof doc.auteur === "object" ? doc.auteur.name : null;

  const bewaar = (data: Record<string, unknown>) => {
    setStatus("bezig");
    patchDoc(doc.id, data)
      .then(() => {
        setStatus("opgeslagen");
        onGewijzigd();
      })
      .catch(() => setStatus("fout"));
  };

  const bewaarInhoudVertraagd = (json: unknown) => {
    if (timer.current) clearTimeout(timer.current);
    setStatus("bezig");
    timer.current = setTimeout(() => bewaar({ inhoud: json }), 700);
  };

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
        className="hm-slideover hm-slideover--breed hm-docpanel"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <input
            className="hm-dealpanel__titel"
            defaultValue={doc.titel}
            key={doc.id}
            onBlur={(e) => {
              const naam = e.target.value.trim();
              if (naam && naam !== doc.titel) bewaar({ titel: naam });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
          <span
            className={`hm-docpanel__status${status === "fout" ? " is-fout" : ""}`}
          >
            {status === "bezig" && "Opslaan…"}
            {status === "opgeslagen" && "Opgeslagen"}
            {status === "fout" && "Opslaan mislukt!"}
          </span>
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
          <button
            className={`hm-pill ${zichtbaarheid === "publiek" ? "hm-pill--emerald" : "hm-pill--slate"} hm-docpanel__zicht`}
            onClick={() => {
              const nieuw = zichtbaarheid === "publiek" ? "intern" : "publiek";
              setZichtbaarheid(nieuw);
              bewaar({ zichtbaarheid: nieuw });
            }}
            title="Klik om zichtbaarheid te wisselen"
            type="button"
          >
            {zichtbaarheid === "publiek" ? "Publiek" : "Intern"}
          </button>
          {(doc.tags ?? []).map((tag) => (
            <span className="hm-pill hm-pill--slate" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        {vreemdeNodes.length > 0 ? (
          <div className="hm-slideover__body hm-kb__leesinhoud">
            <p className="hm-kb__banner">
              Dit document bevat elementen ({vreemdeNodes.join(", ")}) die
              alleen de volledige editor aankan — hieronder lees je het veilig.
            </p>
            {doc.inhoud && <RichText data={doc.inhoud} />}
            <p>
              <Link
                className="hm-dealpanel__editorlink"
                href={`/admin/collections/knowledge-docs/${doc.id}`}
              >
                <ExternalLink size={13} strokeWidth={2} />
                Bewerken in de volledige editor
              </Link>
            </p>
          </div>
        ) : (
          <HmEditor
            onWijzig={bewaarInhoudVertraagd}
            placeholder="Begin met schrijven — opslaan gaat vanzelf."
            waarde={doc.inhoud}
          />
        )}
      </aside>
    </>
  );
}
