"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  buildGenericColumns,
  GEEN_FASE,
  positionBetween,
  relationId,
} from "@/modules/crm/views/pipeline/lib";
import {
  OrganisatiePanel,
} from "@/modules/crm/views/pipeline/RelatiePanelen";
import { projectsApi } from "@/modules/projects/api";
import {
  checklistVoortgang,
  ProjectPanel,
  type PanelToast,
} from "@/modules/projects/views/projecten/ProjectPanel";
import { TaakPanel } from "@/modules/projects/views/taken/TaakPanel";
import { ColumnHeader } from "@/modules/shared/components/ColumnHeader";
import { ColumnsPanel } from "@/modules/shared/components/ColumnsPanel";
import { avatarKleur, initialen } from "@/modules/shared/ui";
import type {
  Project,
  ProjectFase,
  Task,
  TaskStatus,
} from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "@/modules/shared/components/board.scss";

type Props = {
  initialFases: ProjectFase[];
  initialProjecten: Project[];
  initialTaken: Task[];
  statussen: TaskStatus[];
  isBeheerder: boolean;
  nu: number;
};

export function ProjectenBoard(props: Props) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Board {...props} />
    </QueryClientProvider>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return (await res.json()) as T;
}

function orgNaam(project: Project): string | null {
  const o = project.organisatie;
  if (o && typeof o === "object") return o.naam;
  return null;
}

const DAG = 86_400_000;

function Board({
  initialFases,
  initialProjecten,
  initialTaken,
  isBeheerder,
  nu,
  statussen,
}: Props) {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project");
  const taakParam = searchParams.get("taak");
  const organisatieParam = searchParams.get("organisatie");

  const [zoek, setZoek] = useState("");
  const [statusFilter, setStatusFilter] = useState("lopend");
  const [kolommenOpen, setKolommenOpen] = useState(false);
  const [toast, setToast] = useState<PanelToast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fasesQuery = useQuery({
    queryKey: ["projecten", "fases"],
    queryFn: () =>
      fetchJson<{ docs: ProjectFase[] }>(
        "/api/project-fases?sort=_order&limit=100",
      ).then((r) => r.docs),
    initialData: initialFases,
  });

  const projectenQuery = useQuery({
    queryKey: ["projecten", "projecten"],
    queryFn: () =>
      fetchJson<{ docs: Project[] }>(
        "/api/projects?sort=position&limit=500&depth=1",
      ).then((r) => r.docs),
    initialData: initialProjecten,
  });

  const takenQuery = useQuery({
    queryKey: ["projecten", "taken"],
    queryFn: () =>
      fetchJson<{ docs: Task[] }>(
        "/api/tasks?limit=1000&depth=0",
      ).then((r) => r.docs),
    initialData: initialTaken,
  });

  const moveProject = useMutation({
    mutationFn: (input: {
      id: Project["id"];
      fase: Project["fase"];
      position: number;
    }) =>
      projectsApi.updateProject(input.id, {
        fase: input.fase,
        position: input.position,
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["projecten", "projecten"] });
      const vorige = qc.getQueryData<Project[]>(["projecten", "projecten"]);
      qc.setQueryData<Project[]>(["projecten", "projecten"], (oud) =>
        (oud ?? []).map((p) =>
          String(p.id) === String(input.id)
            ? { ...p, fase: input.fase, position: input.position }
            : p,
        ),
      );
      return { vorige };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.vorige) {
        qc.setQueryData(["projecten", "projecten"], ctx.vorige);
      }
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["projecten", "projecten"] }),
  });

  const renameFase = useMutation({
    mutationFn: async (input: { id: number; naam: string }) => {
      const res = await fetch(`/api/project-fases/${input.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam: input.naam }),
      });
      if (!res.ok) throw new Error(`PATCH project-fases → ${res.status}`);
      return res.json();
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["projecten", "fases"] }),
  });

  const alleProjecten = projectenQuery.data ?? [];
  const term = zoek.trim().toLowerCase();

  const gefilterd = alleProjecten.filter((p) => {
    if (statusFilter === "lopend" && p.status === "afgerond") return false;
    if (
      statusFilter !== "lopend" &&
      statusFilter !== "alles" &&
      p.status !== statusFilter
    ) {
      return false;
    }
    if (term) {
      const org = orgNaam(p)?.toLowerCase() ?? "";
      if (!p.naam.toLowerCase().includes(term) && !org.includes(term)) {
        return false;
      }
    }
    return true;
  });

  // Taken per project (voor voortgang op de kaart)
  const takenPerProject = new Map<string, Task[]>();
  for (const t of takenQuery.data ?? []) {
    const pid = relationId(t.project);
    if (!pid) continue;
    const lijst = takenPerProject.get(pid) ?? [];
    lijst.push(t);
    takenPerProject.set(pid, lijst);
  }

  const kolommen = buildGenericColumns(
    fasesQuery.data ?? [],
    gefilterd,
    (p) => relationId(p.fase),
    "Geen fase",
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const doelKolom = kolommen.find((k) => k.id === destination.droppableId);
    if (!doelKolom) return;
    const kaart = alleProjecten.find((p) => String(p.id) === draggableId);
    if (!kaart) return;

    const zonderKaart = doelKolom.deals.filter(
      (p) => String(p.id) !== draggableId,
    );
    const prev = zonderKaart[destination.index - 1]?.position ?? null;
    const next = zonderKaart[destination.index]?.position ?? null;
    const nieuweFase =
      doelKolom.id === GEEN_FASE ? null : Number(doelKolom.id);

    moveProject.mutate({
      id: kaart.id,
      fase: nieuweFase,
      position: positionBetween(prev ?? null, next ?? null),
    });
  };

  const sluit = (params: string[]) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const naam of params) p.delete(naam);
    const qs = p.toString();
    router.push(qs ? `/admin/projecten?${qs}` : "/admin/projecten");
  };

  return (
    <div className="hm-pipeline">
      <div className="hm-board__bar">
        <Link
          className="hm-btn hm-btn--primary"
          href="/admin/projecten?project=nieuw"
        >
          + Project
        </Link>
        <div className="hm-board__bar-rechts">
          <input
            className="hm-board__zoek"
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op project of organisatie…"
            type="search"
            value={zoek}
          />
          <select
            aria-label="Filter op status"
            className="hm-board__select"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="lopend">Lopend (niet afgerond)</option>
            <option value="alles">Alles</option>
            <option value="actief">Actief</option>
            <option value="gepauzeerd">Gepauzeerd</option>
            <option value="afgerond">Afgerond</option>
          </select>
          <button
            aria-label="Fases beheren"
            className="hm-board__icoonknop"
            onClick={() => setKolommenOpen(true)}
            title="Fases beheren"
            type="button"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="hm-pipeline__board">
          {kolommen.map((kolom) => (
            <Droppable droppableId={kolom.id} key={kolom.id}>
              {(provided, snapshot) => (
                <div
                  className={`hm-pipeline__kolom${snapshot.isDraggingOver ? " is-over" : ""}${kolom.isFallback ? " is-fallback" : ""}`}
                >
                  <ColumnHeader
                    isBeheerder={isBeheerder}
                    kolom={kolom}
                    meta={`${kolom.deals.length} project${kolom.deals.length === 1 ? "" : "en"}`}
                    onRename={(id, naam) => renameFase.mutate({ id, naam })}
                  />
                  <div
                    className="hm-pipeline__kaarten"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {kolom.deals.map((project, index) => (
                      <Draggable
                        draggableId={String(project.id)}
                        index={index}
                        key={project.id}
                      >
                        {(p, kaartSnapshot) => {
                          const taken =
                            takenPerProject.get(String(project.id)) ?? [];
                          const [klaar, totaal] = checklistVoortgang(taken);
                          const teLaat =
                            project.deadline &&
                            project.status !== "afgerond" &&
                            new Date(project.deadline).getTime() < nu;
                          const dagenTeLaat = teLaat
                            ? Math.max(
                                1,
                                Math.ceil(
                                  (nu -
                                    new Date(
                                      project.deadline as string,
                                    ).getTime()) /
                                    DAG,
                                ),
                              )
                            : 0;
                          return (
                            <Link
                              className={`hm-card hm-card--hover hm-deal${kaartSnapshot.isDragging ? " is-dragging" : ""}${teLaat ? " is-laat" : ""}`}
                              href={`/admin/projecten?project=${project.id}`}
                              prefetch={false}
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                            >
                              <span className="hm-deal__top">
                                <span className="hm-deal__tags" />
                                {teLaat && (
                                  <span
                                    className="hm-deal__stip hm-deal__stip--laat"
                                    title={`Deadline ${dagenTeLaat} dag${dagenTeLaat === 1 ? "" : "en"} verstreken`}
                                  >
                                    {dagenTeLaat}d
                                  </span>
                                )}
                              </span>
                              <span className="hm-deal__title">
                                {project.naam}
                              </span>
                              {orgNaam(project) && (
                                <span className="hm-deal__org">
                                  {orgNaam(project)}
                                </span>
                              )}
                              <span className="hm-deal__foot">
                                <span className="hm-deal__amount">
                                  {taken.length}{" "}
                                  {taken.length === 1 ? "taak" : "taken"}
                                </span>
                                <span className="hm-project__avatars">
                                  {(project.teamleden ?? [])
                                    .slice(0, 3)
                                    .map((lid) =>
                                      lid && typeof lid === "object" ? (
                                        <span
                                          className="hm-av hm-av--sm"
                                          key={lid.id}
                                          style={{
                                            background: avatarKleur(lid.id),
                                          }}
                                          title={lid.name}
                                        >
                                          {initialen(lid.name)}
                                        </span>
                                      ) : null,
                                    )}
                                </span>
                              </span>
                              {totaal > 0 && (
                                <span
                                  className="hm-meter hm-deal__kans"
                                  title={`Checklist: ${klaar}/${totaal}`}
                                >
                                  <i
                                    style={{
                                      width: `${(klaar / totaal) * 100}%`,
                                    }}
                                  />
                                </span>
                              )}
                            </Link>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  <Link
                    className="hm-pipeline__nieuw"
                    href={
                      kolom.isFallback
                        ? "/admin/projecten?project=nieuw"
                        : `/admin/projecten?project=nieuw&fase=${kolom.id}`
                    }
                  >
                    + Project
                  </Link>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {kolommenOpen && (
        <ColumnsPanel
          aantalPerKolom={(id) =>
            alleProjecten.filter((p) => relationId(p.fase) === String(id))
              .length
          }
          collectionSlug="project-fases"
          isBeheerder={isBeheerder}
          itemNaam="fase"
          kaartNaam="project"
          kolommen={(fasesQuery.data ?? []).map((f) => ({
            id: f.id,
            naam: f.naam,
            kleur: f.kleur,
            _order: f._order,
          }))}
          onClose={() => setKolommenOpen(false)}
          onFout={(melding) => setToast({ tekst: melding, soort: "fout" })}
          onGewijzigd={() => {
            qc.invalidateQueries({ queryKey: ["projecten", "fases"] });
            qc.invalidateQueries({ queryKey: ["projecten", "projecten"] });
          }}
        />
      )}

      {projectParam && (
        <ProjectPanel
          key={`project-${projectParam}`}
          onClose={() => sluit(["project", "taak", "organisatie", "fase"])}
          onToast={setToast}
          projectId={projectParam}
        />
      )}

      {organisatieParam && (
        <OrganisatiePanel
          key={`org-${organisatieParam}`}
          onClose={() => sluit(["organisatie"])}
          onToast={setToast}
          organisatieId={organisatieParam}
        />
      )}

      {taakParam && (
        <TaakPanel
          key={taakParam}
          onClose={() => sluit(["taak"])}
          onToast={setToast}
          projectParam={projectParam}
          projecten={alleProjecten}
          statusParam={null}
          statussen={statussen}
          taakId={taakParam}
        />
      )}

      {toast && (
        <div
          className={`hm-toast${toast.soort === "fout" ? " hm-toast--fout" : ""}`}
          role="status"
        >
          {toast.tekst}
        </div>
      )}
    </div>
  );
}
