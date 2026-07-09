"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useMetParams } from "@/modules/crm/views/pipeline/RelatiePanelen";
import { projectsApi } from "@/modules/projects/api";
import { RecordTijdlijn } from "@/modules/shared/components/RecordTijdlijn";
import { ReferentiesVeld } from "@/modules/shared/components/ReferentiesVeld";
import { lijstVan, TagsVeld } from "@/modules/shared/components/TagsVeld";
import { avatarKleur, initialen, naamVan } from "@/modules/shared/ui";
import type {
  Deal,
  Organisation,
  Project,
  ProjectFase,
  Task,
  User,
} from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

export type PanelToast = { tekst: string; soort: "ok" | "fout" };

type Props = {
  /** Project-id of "nieuw" (create-variant). */
  projectId: string;
  onClose: () => void;
  onToast: (toast: PanelToast) => void;
  /** Vooringevulde organisatie bij aanmaken vanuit het organisatiepaneel. */
  standaardOrganisatie?: string;
};

const STATUSSEN = [
  { waarde: "actief", label: "Actief" },
  { waarde: "gepauzeerd", label: "Gepauzeerd" },
  { waarde: "afgerond", label: "Afgerond" },
] as const;

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return ((await res.json()) as { docs: T[] }).docs;
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

function useFases() {
  return useQuery({
    queryKey: ["projecten", "fases"],
    queryFn: () =>
      fetchDocs<ProjectFase>("/api/project-fases?sort=_order&limit=100"),
  });
}

function useOrgs() {
  return useQuery({
    queryKey: ["panel", "orgs"],
    queryFn: () =>
      fetchDocs<Organisation>("/api/organisations?limit=200&sort=naam&depth=0"),
  });
}

/** Checklistvoortgang over een lijst taken: [klaar, totaal]. */
export function checklistVoortgang(taken: Task[]): [number, number] {
  let klaar = 0;
  let totaal = 0;
  for (const t of taken) {
    for (const punt of t.checklist ?? []) {
      totaal += 1;
      if (punt.klaar) klaar += 1;
    }
  }
  return [klaar, totaal];
}

/* ═══ Nieuw project ════════════════════════════════════════════════════ */

function NieuwProject({
  onClose,
  onToast,
  standaardOrganisatie,
}: Omit<Props, "projectId">) {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fases = useFases();
  const orgs = useOrgs();
  const [naam, setNaam] = useState("");
  const [organisatie, setOrganisatie] = useState(standaardOrganisatie ?? "");
  // Fase-prefill vanuit de kolomvoet (+ Project in een fase-kolom)
  const [fase, setFase] = useState(searchParams.get("fase") ?? "");
  useEscape(onClose);

  const aanmaken = useMutation({
    mutationFn: () =>
      projectsApi.createProject({
        naam: naam.trim(),
        status: "actief",
        organisatie: organisatie ? Number(organisatie) : null,
        fase: fase ? Number(fase) : null,
        position: 0,
      }),
    onSuccess: ({ doc }) => {
      qc.invalidateQueries({ queryKey: ["projecten"] });
      qc.invalidateQueries({ queryKey: ["organisatie"] });
      onToast({ tekst: `Project '${doc.naam}' aangemaakt.`, soort: "ok" });
      const p = new URLSearchParams(window.location.search);
      p.set("project", String(doc.id));
      router.replace(`${window.location.pathname}?${p.toString()}`);
    },
    onError: () =>
      onToast({ tekst: "Aanmaken mislukt — is de naam ingevuld?", soort: "fout" }),
  });

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside aria-label="Nieuw project" className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3>Nieuw project</h3>
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
              if (naam.trim()) aanmaken.mutate();
            }}
          >
            <label>
              Naam *
              <input
                autoFocus
                onChange={(e) => setNaam(e.target.value)}
                required
                value={naam}
              />
            </label>
            <label>
              Organisatie (klant)
              <select
                onChange={(e) => setOrganisatie(e.target.value)}
                value={organisatie}
              >
                <option value="">— (intern project)</option>
                {(orgs.data ?? []).map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fase
              <select onChange={(e) => setFase(e.target.value)} value={fase}>
                <option value="">Geen fase</option>
                {(fases.data ?? []).map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.naam}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="hm-btn hm-btn--primary"
              disabled={!naam.trim() || aanmaken.isPending}
              type="submit"
            >
              {aanmaken.isPending ? "Aanmaken…" : "Project aanmaken"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

/* ═══ Project-detail ═══════════════════════════════════════════════════ */

function ProjectDetail({ onClose, onToast, projectId }: Props) {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const metParams = useMetParams();
  const fases = useFases();
  const orgs = useOrgs();
  const [archiveerOpen, setArchiveerOpen] = useState(false);
  useEscape(onClose);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}?depth=1`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`GET projects/${projectId} → ${res.status}`);
      return (await res.json()) as Project;
    },
  });

  const takenQuery = useQuery({
    queryKey: ["project", projectId, "taken"],
    queryFn: () =>
      fetchDocs<Task>(
        `/api/tasks?where[project][equals]=${projectId}&sort=position&limit=200&depth=1`,
      ),
  });

  const gebruikers = useQuery({
    queryKey: ["panel", "gebruikers"],
    queryFn: () => fetchDocs<User>("/api/users?limit=100&depth=0"),
  });

  const deals = useQuery({
    queryKey: ["panel", "deals"],
    queryFn: () =>
      fetchDocs<Deal>("/api/deals?limit=200&sort=-updatedAt&depth=0"),
  });

  const opslaan = useMutation({
    mutationFn: (data: Partial<Project>) =>
      projectsApi.updateProject(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["projecten"] });
      qc.invalidateQueries({ queryKey: ["organisatie"] });
    },
    onError: () =>
      onToast({ tekst: "Opslaan mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const archiveer = useMutation({
    mutationFn: () =>
      projectsApi.updateProject(projectId, {
        deletedAt: new Date().toISOString(),
      } as Partial<Project>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projecten"] });
      qc.invalidateQueries({ queryKey: ["organisatie"] });
      onToast({
        tekst: "Project gearchiveerd — herstellen kan via de prullenbak.",
        soort: "ok",
      });
      onClose();
    },
    onError: () =>
      onToast({ tekst: "Archiveren mislukt.", soort: "fout" }),
  });

  const project = projectQuery.data;
  if (!project) {
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
              {projectQuery.isLoading ? "Laden…" : "Niet gevonden."}
            </p>
          </div>
        </aside>
      </>
    );
  }

  const taken = takenQuery.data ?? [];
  const [klaar, totaal] = checklistVoortgang(taken);
  const opProjectenblad = pathname === "/admin/projecten";
  const taakHref = (id: number | "nieuw") =>
    opProjectenblad
      ? metParams({ project: projectId, taak: String(id) })
      : `/admin/projecten?project=${projectId}&taak=${id}`;
  const teamledenIds = (project.teamleden ?? []).map((t) => relId(t));

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label={project.naam}
        className="hm-slideover hm-slideover--breed"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <input
            className="hm-dealpanel__titel"
            defaultValue={project.naam}
            key={`naam-${project.updatedAt}`}
            onBlur={(e) => {
              const naam = e.target.value.trim();
              if (naam && naam !== project.naam) opslaan.mutate({ naam });
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
              Fase
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    fase: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(project.fase)}
              >
                <option value="">Geen fase</option>
                {(fases.data ?? []).map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    status: e.target.value as Project["status"],
                  })
                }
                value={project.status}
              >
                {STATUSSEN.map((s) => (
                  <option key={s.waarde} value={s.waarde}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Organisatie (klant)
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    organisatie: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(project.organisatie)}
              >
                <option value="">— (intern project)</option>
                {(orgs.data ?? []).map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Voortgekomen uit deal
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    deal: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(project.deal)}
              >
                <option value="">—</option>
                {(deals.data ?? []).map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.titel}
                  </option>
                ))}
              </select>
            </label>
            <div className="hm-veld">
              Teamleden
              <div className="hm-multikeuze">
                {(gebruikers.data ?? []).map((u) => (
                  <label className="hm-check" key={u.id}>
                    <input
                      checked={teamledenIds.includes(String(u.id))}
                      onChange={(e) => {
                        const nieuw = e.target.checked
                          ? [...teamledenIds, String(u.id)]
                          : teamledenIds.filter((id) => id !== String(u.id));
                        opslaan.mutate({ teamleden: nieuw.map(Number) });
                      }}
                      type="checkbox"
                    />
                    {u.name}
                  </label>
                ))}
              </div>
            </div>
            <label>
              Startdatum
              <input
                defaultValue={project.startdatum?.slice(0, 10) ?? ""}
                key={`start-${project.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value
                    ? new Date(`${e.target.value}T12:00:00`).toISOString()
                    : null;
                  if (nieuw !== (project.startdatum ?? null)) {
                    opslaan.mutate({ startdatum: nieuw });
                  }
                }}
                type="date"
              />
            </label>
            <label>
              Deadline
              <input
                defaultValue={project.deadline?.slice(0, 10) ?? ""}
                key={`dl-${project.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value
                    ? new Date(`${e.target.value}T12:00:00`).toISOString()
                    : null;
                  if (nieuw !== (project.deadline ?? null)) {
                    opslaan.mutate({ deadline: nieuw });
                  }
                }}
                type="date"
              />
            </label>
            <label>
              Omschrijving
              <textarea
                defaultValue={project.omschrijving ?? ""}
                key={`oms-${project.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (project.omschrijving ?? null)) {
                    opslaan.mutate({ omschrijving: nieuw });
                  }
                }}
                rows={3}
              />
            </label>
            <div className="hm-veld">
              Tags
              <TagsVeld
                onWijzig={(tags) => opslaan.mutate({ tags })}
                tags={lijstVan(project.tags)}
              />
            </div>

            <div className="hm-relatie__blok">
              <h4>
                Taken ({taken.length})
                {totaal > 0 && (
                  <span className="hm-project__voortgangtekst">
                    {" "}
                    · checklist {klaar}/{totaal}
                  </span>
                )}
              </h4>
              {totaal > 0 && (
                <span className="hm-meter hm-project__meter">
                  <i style={{ width: `${(klaar / totaal) * 100}%` }} />
                </span>
              )}
              {taken.map((t) => {
                const status =
                  t.status && typeof t.status === "object" ? t.status : null;
                const punten = t.checklist ?? [];
                const af = punten.filter((p) => p.klaar).length;
                const wie =
                  t.toegewezen && typeof t.toegewezen === "object"
                    ? t.toegewezen
                    : null;
                return (
                  <Link href={taakHref(t.id)} key={t.id} replace={opProjectenblad}>
                    {t.titel}
                    <span>
                      {status && (
                        <span
                          className={`hm-pill hm-kleur--${status.kleur}`}
                        >
                          {status.naam}
                        </span>
                      )}
                      {punten.length > 0 && ` ${af}/${punten.length}`}
                      {wie?.name && (
                        <span
                          className="hm-av hm-av--sm"
                          style={{ background: avatarKleur(wie.id) }}
                          title={`Toegewezen aan ${wie.name}`}
                        >
                          {initialen(wie.name)}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
              <button
                className="hm-btn"
                onClick={() => router.replace(taakHref("nieuw"))}
                type="button"
              >
                + Taak in dit project
              </button>
            </div>

            {project.organisatie && typeof project.organisatie === "object" && (
              <div className="hm-relatie__blok">
                <h4>Gekoppeld</h4>
                <Link
                  href={metParams({
                    organisatie: String(project.organisatie.id),
                  })}
                  replace
                >
                  {project.organisatie.naam}
                  <span>organisatie{naamVan(project.organisatie.sector) ? ` · ${naamVan(project.organisatie.sector)}` : ""}</span>
                </Link>
              </div>
            )}

            <ReferentiesVeld
              onWijzig={(ids) => opslaan.mutate({ referenties: ids })}
              waarde={project.referenties}
            />

            <button
              className="hm-btn hm-btn--ghost hm-project__archiveer"
              onClick={() => setArchiveerOpen(true)}
              type="button"
            >
              Project archiveren…
            </button>

            <Link
              className="hm-dealpanel__editorlink"
              href={`/admin/collections/projects/${project.id}`}
            >
              <ExternalLink size={13} strokeWidth={2} />
              Openen in volledige editor
            </Link>
          </div>

          <RecordTijdlijn
            onFout={(m) => onToast({ tekst: m, soort: "fout" })}
            recordId={projectId}
            relationTo="projects"
          />
        </div>
      </aside>

      {archiveerOpen && (
        <>
          <div
            aria-hidden
            className="hm-dialoog__backdrop"
            onClick={() => setArchiveerOpen(false)}
            role="presentation"
          />
          <div
            aria-label="Project archiveren"
            className="hm-dialoog"
            role="dialog"
          >
            <h3>Project archiveren</h3>
            <p>
              &apos;{project.naam}&apos; verdwijnt van het board;{" "}
              {taken.length > 0
                ? `de ${taken.length} ${taken.length === 1 ? "taak blijft" : "taken blijven"} bestaan zonder project. `
                : ""}
              Herstellen kan via de prullenbak.
            </p>
            <div className="hm-dialoog__acties">
              <button
                className="hm-btn hm-btn--ghost"
                onClick={() => setArchiveerOpen(false)}
                type="button"
              >
                Annuleren
              </button>
              <button
                className="hm-btn hm-btn--gevaar"
                onClick={() => {
                  setArchiveerOpen(false);
                  archiveer.mutate();
                }}
                type="button"
              >
                Archiveren
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function ProjectPanel(props: Props) {
  if (props.projectId === "nieuw") {
    return (
      <NieuwProject
        onClose={props.onClose}
        onToast={props.onToast}
        standaardOrganisatie={props.standaardOrganisatie}
      />
    );
  }
  return <ProjectDetail {...props} />;
}
