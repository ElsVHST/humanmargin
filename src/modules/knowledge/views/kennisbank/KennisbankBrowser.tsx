"use client";

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { avatarKleur } from "@/modules/shared/ui";
import type { KnowledgeDoc } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "./kennisbank.scss";

type Props = { initialDocs: KnowledgeDoc[] };

export function KennisbankBrowser({ initialDocs }: Props) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Browser initialDocs={initialDocs} />
    </QueryClientProvider>
  );
}

function parentIdOf(doc: KnowledgeDoc): number | null {
  const p = doc.parent;
  if (p == null) return null;
  return typeof p === "object" ? p.id : p;
}

function auteurNaam(doc: KnowledgeDoc): string | null {
  const a = doc.auteur;
  if (a && typeof a === "object" && a.name) return a.name;
  return null;
}

function datumKort(iso?: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        fill="currentColor"
      />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
      <path d="M14 3v4h4" fill="rgba(255,255,255,.55)" />
    </svg>
  );
}

function Browser({ initialDocs }: Props) {
  const router = useRouter();
  const [parentId, setParentId] = useState<number | null>(null);
  const [zoek, setZoek] = useState("");
  const [selId, setSelId] = useState<number | null>(null);

  const docsQuery = useQuery({
    queryKey: ["kennisbank", "docs"],
    queryFn: async () => {
      const res = await fetch(
        "/api/knowledge-docs?sort=position&limit=500&depth=1",
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`GET knowledge-docs → ${res.status}`);
      return ((await res.json()) as { docs: KnowledgeDoc[] }).docs;
    },
    initialData: initialDocs,
  });

  const nieuwDoc = useMutation({
    mutationFn: async (parent: number | null) => {
      const res = await fetch("/api/knowledge-docs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: "Nieuw document",
          zichtbaarheid: "intern",
          ...(parent ? { parent } : {}),
        }),
      });
      if (!res.ok) throw new Error(`POST knowledge-docs → ${res.status}`);
      return ((await res.json()) as { doc: KnowledgeDoc }).doc;
    },
    onSuccess: (doc) => {
      router.push(`/admin/collections/knowledge-docs/${doc.id}`);
    },
  });

  const docs = docsQuery.data ?? [];
  const byId = new Map(docs.map((d) => [d.id, d]));
  const kinderenVan = (pid: number | null) =>
    docs
      .filter((d) => parentIdOf(d) === pid)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const heeftKinderen = (id: number) =>
    docs.some((d) => parentIdOf(d) === id);
  const aantalKinderen = (id: number) =>
    docs.filter((d) => parentIdOf(d) === id).length;

  // Breadcrumb-pad naar de huidige map
  const pad: KnowledgeDoc[] = [];
  let cur: number | null = parentId;
  const gezien = new Set<number>();
  while (cur != null && !gezien.has(cur)) {
    gezien.add(cur);
    const d = byId.get(cur);
    if (!d) break;
    pad.unshift(d);
    cur = parentIdOf(d);
  }

  const zoekterm = zoek.trim().toLowerCase();
  const items = zoekterm
    ? docs.filter((d) => d.titel.toLowerCase().includes(zoekterm))
    : kinderenVan(parentId);
  const mappen = items.filter((d) => heeftKinderen(d.id));
  const documenten = items.filter((d) => !heeftKinderen(d.id));

  const recent = [...docs]
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() -
        new Date(a.updatedAt ?? 0).getTime(),
    )
    .slice(0, 4);

  const huidigeMap = parentId != null ? byId.get(parentId) : null;
  const geselecteerd =
    selId != null ? byId.get(selId) : (huidigeMap ?? null);

  const openMap = (id: number | null) => {
    setParentId(id);
    setSelId(null);
    setZoek("");
  };

  const kaart = (doc: KnowledgeDoc) => {
    const isMap = heeftKinderen(doc.id);
    const kleur = avatarKleur(doc.id);
    const inner = (
      <>
        <span className="hm-kb__icon" style={{ color: kleur }}>
          {isMap ? <FolderIcon /> : <DocIcon />}
        </span>
        <span className="hm-kb__naam">{doc.titel}</span>
        <span className="hm-kb__meta">
          {isMap
            ? `${aantalKinderen(doc.id)} item${aantalKinderen(doc.id) === 1 ? "" : "s"}`
            : `bijgewerkt ${datumKort(doc.updatedAt)}`}
        </span>
      </>
    );
    return (
      <div className="hm-kb__cardwrap" key={doc.id}>
        {isMap ? (
          <button
            className="hm-card hm-card--hover hm-kb__card"
            onClick={() => openMap(doc.id)}
            type="button"
          >
            {inner}
          </button>
        ) : (
          <Link
            className="hm-card hm-card--hover hm-kb__card"
            href={`/admin/collections/knowledge-docs/${doc.id}`}
          >
            {inner}
          </Link>
        )}
        <button
          aria-label="Details"
          className="hm-kb__info"
          onClick={() => setSelId(doc.id)}
          title="Details tonen"
          type="button"
        >
          ⓘ
        </button>
        {isMap && (
          <button
            aria-label={`Subdocument in ${doc.titel}`}
            className="hm-kb__plus"
            disabled={nieuwDoc.isPending}
            onClick={() => nieuwDoc.mutate(doc.id)}
            title="Subdocument toevoegen"
            type="button"
          >
            +
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="hm-view hm-kb">
      <div className="hm-view__head">
        <div className="hm-view__actions">
          <input
            className="hm-kb__zoek"
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoeken in de kennisbank…"
            type="search"
            value={zoek}
          />
          <button
            className="hm-btn hm-btn--primary"
            disabled={nieuwDoc.isPending}
            onClick={() => nieuwDoc.mutate(parentId)}
            type="button"
          >
            + Nieuw
          </button>
        </div>
      </div>

      {!zoekterm && recent.length > 0 && (
        <div className="hm-kb__qa">
          <span className="hm-kb__qalabel">Recent</span>
          {recent.map((d) => (
            <Link
              className="hm-kb__qchip"
              href={`/admin/collections/knowledge-docs/${d.id}`}
              key={d.id}
            >
              <span
                className="hm-kleur"
                style={{ "--k": avatarKleur(d.id) } as React.CSSProperties}
              />
              {d.titel}
            </Link>
          ))}
        </div>
      )}

      <nav className="hm-kb__crumbs" aria-label="Pad">
        <button
          className="hm-kb__crumb"
          onClick={() => openMap(null)}
          type="button"
        >
          Kennisbank
        </button>
        {pad.map((d, i) => (
          <React.Fragment key={d.id}>
            <span className="hm-kb__sep">›</span>
            {i === pad.length - 1 ? (
              <span className="hm-kb__crumb is-current">{d.titel}</span>
            ) : (
              <button
                className="hm-kb__crumb"
                onClick={() => openMap(d.id)}
                type="button"
              >
                {d.titel}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="hm-kb__layout">
        <div className="hm-kb__main">
          {items.length === 0 ? (
            <p className="hm-empty">
              {zoekterm
                ? "Niets gevonden. Probeer een andere zoekterm."
                : "Deze map is leeg. Maak een document aan met + Nieuw."}
            </p>
          ) : (
            <>
              {mappen.length > 0 && (
                <>
                  <div className="hm-kb__sectlabel">Mappen</div>
                  <div className="hm-kb__grid">{mappen.map(kaart)}</div>
                </>
              )}
              {documenten.length > 0 && (
                <>
                  <div className="hm-kb__sectlabel">Documenten</div>
                  <div className="hm-kb__grid">{documenten.map(kaart)}</div>
                </>
              )}
            </>
          )}
        </div>

        <aside className="hm-card hm-kb__rail">
          {geselecteerd ? (
            <>
              <div className="hm-kb__railtitle">{geselecteerd.titel}</div>
              <div className="hm-kb__kv">
                <span>Type</span>
                <span>
                  {heeftKinderen(geselecteerd.id)
                    ? `Map · ${aantalKinderen(geselecteerd.id)} items`
                    : "Document"}
                </span>
              </div>
              <div className="hm-kb__kv">
                <span>Auteur</span>
                <span>{auteurNaam(geselecteerd) ?? "—"}</span>
              </div>
              <div className="hm-kb__kv">
                <span>Bijgewerkt</span>
                <span>{datumKort(geselecteerd.updatedAt)}</span>
              </div>
              <div className="hm-kb__kv">
                <span>Zichtbaar</span>
                <span
                  className={`hm-pill ${geselecteerd.zichtbaarheid === "publiek" ? "hm-pill--emerald" : "hm-pill--slate"}`}
                >
                  {geselecteerd.zichtbaarheid === "publiek"
                    ? "Publiek"
                    : "Intern"}
                </span>
              </div>
              <Link
                className="hm-btn hm-btn--ghost hm-kb__railopen"
                href={`/admin/collections/knowledge-docs/${geselecteerd.id}`}
              >
                Openen in editor
              </Link>
            </>
          ) : (
            <>
              <div className="hm-kb__railtitle">Kennisbank</div>
              <div className="hm-kb__kv">
                <span>Mappen</span>
                <span>{docs.filter((d) => heeftKinderen(d.id)).length}</span>
              </div>
              <div className="hm-kb__kv">
                <span>Documenten</span>
                <span>{docs.filter((d) => !heeftKinderen(d.id)).length}</span>
              </div>
              <p className="hm-kb__railhint">
                Klik op ⓘ bij een item voor details.
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
