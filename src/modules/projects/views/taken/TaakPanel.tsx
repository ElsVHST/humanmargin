"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { projectsApi } from "@/modules/projects/api";
import { RecordTijdlijn } from "@/modules/shared/components/RecordTijdlijn";
import { ReferentiesVeld } from "@/modules/shared/components/ReferentiesVeld";
import type { Organisation, Project, Task, TaskStatus, User } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

export type PanelToast = { tekst: string; soort: "ok" | "fout" };

type Props = {
  /** Taak-id of "nieuw" (create-variant). */
  taakId: string;
  statusParam: string | null;
  /** Deadline-prefill (YYYY-MM-DD) voor de create-variant, bv. vanuit de kalender. */
  datumParam?: string | null;
  onClose: () => void;
  onToast: (toast: PanelToast) => void;
  projecten: Project[];
  statussen: TaskStatus[];
};

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return ((await res.json()) as { docs: T[] }).docs;
}

async function getTaak(id: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}?depth=1`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET tasks/${id} → ${res.status}`);
  return (await res.json()) as Task;
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

/* ── Create-variant ──────────────────────────────────────────────────── */

function NieuweTaak({
  datumParam,
  onClose,
  onToast,
  projecten,
  statusParam,
  statussen,
}: Omit<Props, "taakId">) {
  const qc = useQueryClient();
  const router = useRouter();
  const [titel, setTitel] = useState("");
  const [status, setStatus] = useState(statusParam ?? "");
  const [project, setProject] = useState("");
  const [prioriteit, setPrioriteit] = useState<Task["prioriteit"]>("normaal");
  useEscape(onClose);

  const aanmaken = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: titel.trim(),
          prioriteit,
          status: status ? Number(status) : null,
          project: project ? Number(project) : null,
          deadline: datumParam
            ? new Date(`${datumParam}T12:00:00`).toISOString()
            : null,
        }),
      });
      if (!res.ok) throw new Error(`POST tasks → ${res.status}`);
      return ((await res.json()) as { doc: Task }).doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["taken", "taken"] });
      qc.invalidateQueries({ queryKey: ["kalender", "taken"] });
      onToast({ tekst: `Taak '${doc.titel}' aangemaakt.`, soort: "ok" });
      router.replace(`${window.location.pathname}?taak=${doc.id}`);
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
      <aside aria-label="Nieuwe taak" className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3>Nieuwe taak</h3>
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
                placeholder="Bijv. Nieuwsbrief schrijven"
                required
                value={titel}
              />
            </label>
            <label>
              Status
              <select onChange={(e) => setStatus(e.target.value)} value={status}>
                <option value="">Geen status</option>
                {statussen.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Project
              <select
                onChange={(e) => setProject(e.target.value)}
                value={project}
              >
                <option value="">Losse taak</option>
                {projecten.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prioriteit
              <select
                onChange={(e) =>
                  setPrioriteit(e.target.value as Task["prioriteit"])
                }
                value={prioriteit}
              >
                <option value="laag">Laag</option>
                <option value="normaal">Normaal</option>
                <option value="hoog">Hoog</option>
              </select>
            </label>
            <button
              className="hm-btn hm-btn--primary"
              disabled={!titel.trim() || aanmaken.isPending}
              type="submit"
            >
              {aanmaken.isPending ? "Aanmaken…" : "Taak aanmaken"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

/* ── Detail-variant ──────────────────────────────────────────────────── */

function TaakDetail({
  onClose,
  onToast,
  projecten,
  statussen,
  taakId,
}: Omit<Props, "statusParam">) {
  const qc = useQueryClient();
  const [nieuwPunt, setNieuwPunt] = useState("");
  useEscape(onClose);

  const taakQuery = useQuery({
    queryKey: ["taak", taakId],
    queryFn: () => getTaak(taakId),
  });

  const gebruikers = useQuery({
    queryKey: ["panel", "gebruikers"],
    queryFn: () => fetchDocs<User>("/api/users?limit=100&depth=0"),
  });

  const organisaties = useQuery({
    queryKey: ["panel", "orgs"],
    queryFn: () =>
      fetchDocs<Organisation>("/api/organisations?limit=200&sort=naam&depth=0"),
  });

  const opslaan = useMutation({
    mutationFn: (data: Partial<Task>) =>
      projectsApi.updateTask(Number(taakId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["taak", taakId] });
      qc.invalidateQueries({ queryKey: ["taken", "taken"] });
      qc.invalidateQueries({ queryKey: ["kalender", "taken"] });
    },
    onError: () =>
      onToast({ tekst: "Opslaan mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const taak = taakQuery.data;

  if (taakQuery.isLoading || !taak) {
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
              {taakQuery.isLoading
                ? "Taak laden…"
                : "Deze taak bestaat niet (meer)."}
            </p>
          </div>
        </aside>
      </>
    );
  }

  const checklist = taak.checklist ?? [];
  const klaarTeller = checklist.filter((p) => p.klaar).length;

  const zetChecklist = (nieuw: NonNullable<Task["checklist"]>) =>
    opslaan.mutate({ checklist: nieuw });

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label={`Taak ${taak.titel}`}
        className="hm-slideover hm-slideover--breed"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <input
            className="hm-dealpanel__titel"
            defaultValue={taak.titel}
            key={`titel-${taak.updatedAt}`}
            onBlur={(e) => {
              const naam = e.target.value.trim();
              if (naam && naam !== taak.titel) opslaan.mutate({ titel: naam });
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

        <div className="hm-slideover__body hm-dealpanel__body">
          <div className="hm-dealpanel__velden">
            <label>
              Status
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    status: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(taak.status)}
              >
                <option value="">Geen status</option>
                {statussen.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.naam}
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
                value={relId(taak.project)}
              >
                <option value="">Losse taak</option>
                {projecten.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Toegewezen aan
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    toegewezen: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(taak.toegewezen)}
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
              Deadline
              <input
                defaultValue={taak.deadline?.slice(0, 10) ?? ""}
                key={`deadline-${taak.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value
                    ? new Date(`${e.target.value}T12:00:00`).toISOString()
                    : null;
                  if (nieuw !== (taak.deadline ?? null)) {
                    opslaan.mutate({ deadline: nieuw });
                  }
                }}
                type="date"
              />
            </label>
            <label>
              Prioriteit
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    prioriteit: e.target.value as Task["prioriteit"],
                  })
                }
                value={taak.prioriteit}
              >
                <option value="laag">Laag</option>
                <option value="normaal">Normaal</option>
                <option value="hoog">Hoog</option>
              </select>
            </label>
            <label>
              Organisatie / klant
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    organisatie: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(taak.organisatie)}
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
              Omschrijving
              <textarea
                defaultValue={taak.omschrijving ?? ""}
                key={`omschrijving-${taak.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (taak.omschrijving ?? null)) {
                    opslaan.mutate({ omschrijving: nieuw });
                  }
                }}
                rows={4}
              />
            </label>
            <label>
              Context die ik al weet
              <textarea
                defaultValue={taak.contextVooraf ?? ""}
                key={`context-${taak.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (taak.contextVooraf ?? null)) {
                    opslaan.mutate({ contextVooraf: nieuw });
                  }
                }}
                placeholder="Wat moet de uitvoerder (mens of agent) vooraf weten?"
                rows={3}
              />
            </label>
            <label>
              Definition of done
              <textarea
                defaultValue={taak.definitionOfDone ?? ""}
                key={`dod-${taak.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (taak.definitionOfDone ?? null)) {
                    opslaan.mutate({ definitionOfDone: nieuw });
                  }
                }}
                placeholder="Wanneer is deze taak écht af?"
                rows={2}
              />
            </label>

            <ReferentiesVeld
              onWijzig={(ids) => opslaan.mutate({ referenties: ids })}
              waarde={taak.referenties}
            />

            <Link
              className="hm-dealpanel__editorlink"
              href={`/admin/collections/tasks/${taak.id}`}
            >
              <ExternalLink size={13} strokeWidth={2} />
              Openen in volledige editor
            </Link>
          </div>

          <div className="hm-taakpanel__checklist">
            <h4>
              Checklist
              {checklist.length > 0 && (
                <span>
                  {klaarTeller}/{checklist.length}
                </span>
              )}
            </h4>
            {checklist.length > 0 && (
              <span className="hm-meter hm-taakpanel__meter">
                <i
                  style={{
                    width: `${(klaarTeller / checklist.length) * 100}%`,
                  }}
                />
              </span>
            )}
            <ul>
              {checklist.map((punt, i) => (
                <li key={punt.id ?? i}>
                  <label className="hm-taakpanel__punt">
                    <input
                      checked={!!punt.klaar}
                      onChange={(e) =>
                        zetChecklist(
                          checklist.map((p, j) =>
                            j === i ? { ...p, klaar: e.target.checked } : p,
                          ),
                        )
                      }
                      type="checkbox"
                    />
                    <span className={punt.klaar ? "is-klaar" : ""}>
                      {punt.tekst}
                    </span>
                  </label>
                  <button
                    aria-label={`'${punt.tekst}' verwijderen`}
                    onClick={() =>
                      zetChecklist(checklist.filter((_, j) => j !== i))
                    }
                    type="button"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="hm-taakpanel__nieuwpunt"
              onSubmit={(e) => {
                e.preventDefault();
                const tekst = nieuwPunt.trim();
                if (!tekst) return;
                zetChecklist([...checklist, { tekst, klaar: false }]);
                setNieuwPunt("");
              }}
            >
              <input
                onChange={(e) => setNieuwPunt(e.target.value)}
                placeholder="Punt toevoegen…"
                value={nieuwPunt}
              />
              <button
                aria-label="Punt toevoegen"
                className="hm-btn hm-btn--ghost"
                disabled={!nieuwPunt.trim()}
                type="submit"
              >
                <Plus size={14} />
              </button>
            </form>

            <RecordTijdlijn
              onFout={(m) => onToast({ tekst: m, soort: "fout" })}
              recordId={taakId}
              relationTo="tasks"
              titel="Comments & log"
            />
          </div>
        </div>
      </aside>
    </>
  );
}

/** Taak-slideover: detail met inline edit + checklist, of create-variant. */
export function TaakPanel(props: Props) {
  if (props.taakId === "nieuw") {
    return (
      <NieuweTaak
        datumParam={props.datumParam}
        onClose={props.onClose}
        onToast={props.onToast}
        projecten={props.projecten}
        statusParam={props.statusParam}
        statussen={props.statussen}
      />
    );
  }
  return (
    <TaakDetail
      onClose={props.onClose}
      onToast={props.onToast}
      projecten={props.projecten}
      statussen={props.statussen}
      taakId={props.taakId}
    />
  );
}
