"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { contentApi } from "@/modules/content/api";
import { RecordTijdlijn } from "@/modules/shared/components/RecordTijdlijn";
import { ReferentiesVeld } from "@/modules/shared/components/ReferentiesVeld";
import type {
  ContentChannel,
  ContentItem,
  Organisation,
  Project,
  User,
} from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

export type PanelToast = { tekst: string; soort: "ok" | "fout" };

type Props = {
  /** Item-id of "nieuw" (create-variant). */
  itemId: string;
  datumParam: string | null;
  onClose: () => void;
  onToast: (toast: PanelToast) => void;
};

const STATUSSEN: { waarde: ContentItem["status"]; label: string }[] = [
  { waarde: "idee", label: "Idee" },
  { waarde: "concept", label: "Concept" },
  { waarde: "gepland", label: "Gepland" },
  { waarde: "gepubliceerd", label: "Gepubliceerd" },
];

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return ((await res.json()) as { docs: T[] }).docs;
}

async function getItem(id: string): Promise<ContentItem> {
  const res = await fetch(`/api/content-items/${id}?depth=1`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET content-items/${id} → ${res.status}`);
  return (await res.json()) as ContentItem;
}

function relId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    return String((value as { id: string | number }).id);
  }
  return String(value);
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
}

function useKanalen() {
  return useQuery({
    queryKey: ["panel", "kanalen"],
    queryFn: () =>
      fetchDocs<ContentChannel>(
        "/api/content-channels?sort=_order&limit=100&depth=0",
      ),
  });
}

/* ── Create-variant ──────────────────────────────────────────────────── */

function NieuwItem({ datumParam, onClose, onToast }: Omit<Props, "itemId">) {
  const qc = useQueryClient();
  const router = useRouter();
  const kanalen = useKanalen();
  const [titel, setTitel] = useState("");
  const [kanaal, setKanaal] = useState("");
  const [status, setStatus] = useState<ContentItem["status"]>("idee");
  const [datum, setDatum] = useState(datumParam ?? "");
  useEscape(onClose);

  const aanmaken = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/content-items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: titel.trim(),
          status,
          kanaal: kanaal ? Number(kanaal) : null,
          publishDate: datum
            ? new Date(`${datum}T12:00:00`).toISOString()
            : null,
        }),
      });
      if (!res.ok) throw new Error(`POST content-items → ${res.status}`);
      return ((await res.json()) as { doc: ContentItem }).doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["kalender", "items"] });
      onToast({ tekst: `'${doc.titel}' aangemaakt.`, soort: "ok" });
      router.replace(`/admin/kalender?item=${doc.id}`);
    },
    onError: () =>
      onToast({ tekst: "Aanmaken mislukt — is de titel ingevuld?", soort: "fout" }),
  });

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside aria-label="Nieuw content-item" className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3>Nieuw content-item</h3>
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
          <form
            className="hm-dealpanel__form"
            onSubmit={(e) => {
              e.preventDefault();
              if (titel.trim()) aanmaken.mutate();
            }}
          >
            <label>
              Titel *
              <input
                autoFocus
                onChange={(e) => setTitel(e.target.value)}
                placeholder="Bijv. LinkedIn: AI Act in 3 vragen"
                required
                value={titel}
              />
            </label>
            <label>
              Kanaal
              <select onChange={(e) => setKanaal(e.target.value)} value={kanaal}>
                <option value="">—</option>
                {(kanalen.data ?? []).map((k) => (
                  <option key={k.id} value={String(k.id)}>
                    {k.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                onChange={(e) =>
                  setStatus(e.target.value as ContentItem["status"])
                }
                value={status}
              >
                {STATUSSEN.map((s) => (
                  <option key={s.waarde} value={s.waarde}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Publicatiedatum
              <input
                onChange={(e) => setDatum(e.target.value)}
                type="date"
                value={datum}
              />
            </label>
            <button
              className="hm-btn hm-btn--primary"
              disabled={!titel.trim() || aanmaken.isPending}
              type="submit"
            >
              {aanmaken.isPending ? "Aanmaken…" : "Item aanmaken"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

/* ── Detail-variant ──────────────────────────────────────────────────── */

function ItemDetail({ itemId, onClose, onToast }: Omit<Props, "datumParam">) {
  const qc = useQueryClient();
  const kanalen = useKanalen();
  useEscape(onClose);

  const itemQuery = useQuery({
    queryKey: ["content-item", itemId],
    queryFn: () => getItem(itemId),
  });

  const organisaties = useQuery({
    queryKey: ["panel", "orgs"],
    queryFn: () =>
      fetchDocs<Organisation>("/api/organisations?limit=200&sort=naam&depth=0"),
  });
  const projecten = useQuery({
    queryKey: ["panel", "projecten"],
    queryFn: () =>
      fetchDocs<Project>("/api/projects?limit=200&sort=naam&depth=0"),
  });
  const gebruikers = useQuery({
    queryKey: ["panel", "gebruikers"],
    queryFn: () => fetchDocs<User>("/api/users?limit=100&depth=0"),
  });

  const opslaan = useMutation({
    mutationFn: (data: Partial<ContentItem>) =>
      contentApi.updateItem(Number(itemId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-item", itemId] });
      qc.invalidateQueries({ queryKey: ["kalender", "items"] });
    },
    onError: () =>
      onToast({ tekst: "Opslaan mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const item = itemQuery.data;

  if (itemQuery.isLoading || !item) {
    return (
      <>
        <div
          aria-hidden
          className="hm-slideover__backdrop"
          onClick={onClose}
          role="presentation"
        />
        <aside className="hm-slideover" role="dialog">
          <div className="hm-slideover__body">
            <p className="hm-empty">
              {itemQuery.isLoading
                ? "Item laden…"
                : "Dit item bestaat niet (meer)."}
            </p>
          </div>
        </aside>
      </>
    );
  }

  const pagina =
    item.gekoppeldePagina && typeof item.gekoppeldePagina === "object"
      ? item.gekoppeldePagina
      : null;

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label={item.titel}
        className="hm-slideover hm-slideover--breed"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <input
            className="hm-dealpanel__titel"
            defaultValue={item.titel}
            key={`titel-${item.updatedAt}`}
            onBlur={(e) => {
              const naam = e.target.value.trim();
              if (naam && naam !== item.titel) opslaan.mutate({ titel: naam });
            }}
          />
          {opslaan.isPending && (
            <span className="hm-dealpanel__bezig">opslaan…</span>
          )}
          <button
            aria-label="Sluiten"
            className="hm-slideover__close"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status-flow als klikbare stappen (idee → concept → gepland → gepubliceerd) */}
        <div className="hm-dealpanel__uitkomst">
          {STATUSSEN.map((s) => (
            <button
              className={`hm-pill hm-contentpanel__stap${item.status === s.waarde ? " is-actief" : ""}`}
              key={s.waarde}
              onClick={() =>
                item.status !== s.waarde && opslaan.mutate({ status: s.waarde })
              }
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="hm-slideover__body hm-dealpanel__body">
          <div className="hm-dealpanel__velden">
            <label>
              Kanaal
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    kanaal: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(item.kanaal)}
              >
                <option value="">—</option>
                {(kanalen.data ?? []).map((k) => (
                  <option key={k.id} value={String(k.id)}>
                    {k.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Publicatiedatum
              <input
                defaultValue={item.publishDate?.slice(0, 10) ?? ""}
                key={`datum-${item.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value
                    ? new Date(`${e.target.value}T12:00:00`).toISOString()
                    : null;
                  if (nieuw !== (item.publishDate ?? null)) {
                    opslaan.mutate({ publishDate: nieuw });
                  }
                }}
                type="date"
              />
            </label>
            <label>
              Toegewezen aan
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    toegewezen: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(item.toegewezen)}
              >
                <option value="">—</option>
                {(gebruikers.data ?? []).map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Organisatie
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    organisatie: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(item.organisatie)}
              >
                <option value="">—</option>
                {(organisaties.data ?? []).map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Project
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    project: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(item.project)}
              >
                <option value="">—</option>
                {(projecten.data ?? []).map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Publicatielink
              <input
                defaultValue={item.publicatielink ?? ""}
                key={`link-${item.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (item.publicatielink ?? null)) {
                    opslaan.mutate({ publicatielink: nieuw });
                  }
                }}
                placeholder="https://…"
                type="url"
              />
            </label>
          </div>

          <div className="hm-contentpanel__brief">
            <h4>Brief</h4>
            <textarea
              defaultValue={item.brief ?? ""}
              key={`brief-${item.updatedAt}`}
              onBlur={(e) => {
                const nieuw = e.target.value.trim() || null;
                if (nieuw !== (item.brief ?? null)) {
                  opslaan.mutate({ brief: nieuw });
                }
              }}
              placeholder="Invalshoek, kernboodschap, call-to-action…"
              rows={9}
            />
            <ReferentiesVeld
              onWijzig={(ids) => opslaan.mutate({ referenties: ids })}
              waarde={item.referenties}
            />

            <RecordTijdlijn
              onFout={(m) => onToast({ tekst: m, soort: "fout" })}
              recordId={itemId}
              relationTo="content-items"
              titel="Comments & log"
            />

            {pagina && (
              <p className="hm-contentpanel__pagina">
                Gekoppelde pagina:{" "}
                <Link
                  className="hm-dealpanel__editorlink"
                  href={`/admin/collections/pages/${pagina.id}`}
                >
                  <ExternalLink size={13} strokeWidth={2} />
                  {pagina.title ?? `#${pagina.id}`}
                </Link>
              </p>
            )}
            <Link
              className="hm-dealpanel__editorlink"
              href={`/admin/collections/content-items/${item.id}`}
            >
              <ExternalLink size={13} strokeWidth={2} />
              Openen in volledige editor
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

/** Content-slideover: detail met inline edit + status-flow, of create-variant. */
export function ContentPanel(props: Props) {
  if (props.itemId === "nieuw") {
    return (
      <NieuwItem
        datumParam={props.datumParam}
        onClose={props.onClose}
        onToast={props.onToast}
      />
    );
  }
  return (
    <ItemDetail
      itemId={props.itemId}
      onClose={props.onClose}
      onToast={props.onToast}
    />
  );
}
