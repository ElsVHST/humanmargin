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
import React, { useEffect, useState } from "react";

import {
  buildTaskColumns,
  GEEN_FASE,
  positionBetween,
} from "@/modules/crm/views/pipeline/lib";
import { projectsApi } from "@/modules/projects/api";
import { ColumnHeader } from "@/modules/shared/components/ColumnHeader";
import { ColumnsPanel } from "@/modules/shared/components/ColumnsPanel";
import { avatarKleur, initialen } from "@/modules/shared/ui";
import type { Project, Task, TaskStatus } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "@/modules/shared/components/board.scss";

type Props = {
  initialStatussen: TaskStatus[];
  initialTaken: Task[];
  projecten: Project[];
  isBeheerder: boolean;
};

export function TakenBoard(props: Props) {
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

function projectNaam(taak: Task): string | null {
  const project = taak.project;
  if (project && typeof project === "object") return project.naam;
  return null;
}

function toegewezenInfo(taak: Task): { naam: string; id: string | number } | null {
  const wie = taak.toegewezen;
  if (wie && typeof wie === "object" && wie.name) return { naam: wie.name, id: wie.id };
  return null;
}

function deadlineLabel(taak: Task): { tekst: string; verlopen: boolean } | null {
  if (!taak.deadline) return null;
  const datum = new Date(taak.deadline);
  return {
    tekst: new Intl.DateTimeFormat("nl-NL", {
      day: "numeric",
      month: "short",
    }).format(datum),
    verlopen: datum.getTime() < Date.now(),
  };
}

function Board({ initialStatussen, initialTaken, projecten, isBeheerder }: Props) {
  const qc = useQueryClient();
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [persoonFilter, setPersoonFilter] = useState<string>("");
  const [kolommenOpen, setKolommenOpen] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    if (!fout) return;
    const timer = setTimeout(() => setFout(null), 4000);
    return () => clearTimeout(timer);
  }, [fout]);

  const statussenQuery = useQuery({
    queryKey: ["taken", "statussen"],
    queryFn: () =>
      fetchJson<{ docs: TaskStatus[] }>(
        "/api/task-statuses?sort=_order&limit=100",
      ).then((r) => r.docs),
    initialData: initialStatussen,
  });

  const takenQuery = useQuery({
    queryKey: ["taken", "taken"],
    queryFn: () =>
      fetchJson<{ docs: Task[] }>(
        "/api/tasks?sort=position&limit=500&depth=1",
      ).then((r) => r.docs),
    initialData: initialTaken,
  });

  const moveTask = useMutation({
    mutationFn: (input: {
      id: Task["id"];
      status: Task["status"];
      position: number;
    }) =>
      projectsApi.updateTask(input.id, {
        status: input.status,
        position: input.position,
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["taken", "taken"] });
      const vorige = qc.getQueryData<Task[]>(["taken", "taken"]);
      qc.setQueryData<Task[]>(["taken", "taken"], (oud) =>
        (oud ?? []).map((t) =>
          String(t.id) === String(input.id)
            ? { ...t, status: input.status, position: input.position }
            : t,
        ),
      );
      return { vorige };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.vorige) qc.setQueryData(["taken", "taken"], ctx.vorige);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["taken", "taken"] }),
  });

  const statusInvalidate = () =>
    qc.invalidateQueries({ queryKey: ["taken", "statussen"] });

  const renameStatus = useMutation({
    mutationFn: (input: { id: number; naam: string }) =>
      projectsApi.updateStatus(input.id, { naam: input.naam }),
    onSettled: statusInvalidate,
  });

  const alleTaken = takenQuery.data ?? [];
  const gefilterd = alleTaken.filter((t) => {
    if (projectFilter) {
      const pid = t.project
        ? String(typeof t.project === "object" ? t.project.id : t.project)
        : null;
      if (pid !== projectFilter) return false;
    }
    if (persoonFilter) {
      const uid = t.toegewezen
        ? String(
            typeof t.toegewezen === "object" ? t.toegewezen.id : t.toegewezen,
          )
        : null;
      if (uid !== persoonFilter) return false;
    }
    return true;
  });

  const personen = new Map<string, string>();
  for (const t of alleTaken) {
    if (t.toegewezen && typeof t.toegewezen === "object" && t.toegewezen.name) {
      personen.set(String(t.toegewezen.id), t.toegewezen.name);
    }
  }

  const kolommen = buildTaskColumns(statussenQuery.data ?? [], gefilterd);

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const doelKolom = kolommen.find((k) => k.id === destination.droppableId);
    if (!doelKolom) return;
    const kaart = alleTaken.find((t) => String(t.id) === draggableId);
    if (!kaart) return;

    const zonderKaart = doelKolom.deals.filter(
      (t) => String(t.id) !== draggableId,
    );
    const prev = zonderKaart[destination.index - 1]?.position ?? null;
    const next = zonderKaart[destination.index]?.position ?? null;
    const nieuweStatus =
      doelKolom.id === GEEN_FASE ? null : Number(doelKolom.id);

    moveTask.mutate({
      id: kaart.id,
      status: nieuweStatus,
      position: positionBetween(prev, next),
    });
  };

  return (
    <div className="hm-pipeline">
      <div className="hm-board__filters">
        <select
          className="hm-board__filter"
          onChange={(e) => setProjectFilter(e.target.value)}
          value={projectFilter}
        >
          <option value="">Alle projecten</option>
          {projecten.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.naam}
            </option>
          ))}
        </select>
        <select
          className="hm-board__filter"
          onChange={(e) => setPersoonFilter(e.target.value)}
          value={persoonFilter}
        >
          <option value="">Iedereen</option>
          {[...personen.entries()].map(([id, naam]) => (
            <option key={id} value={id}>
              {naam}
            </option>
          ))}
        </select>
        <button
          aria-label="Kolommen beheren"
          className="hm-board__icoonknop"
          onClick={() => setKolommenOpen(true)}
          title="Kolommen beheren"
          type="button"
        >
          <Pencil size={15} strokeWidth={2} />
        </button>
      </div>
      {moveTask.isError && (
        <p className="hm-pipeline__fout" role="alert">
          Verplaatsen mislukt — de kaart is teruggezet. Probeer het opnieuw.
        </p>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="hm-pipeline__board">
          {kolommen.map((kolom) => (
            <Droppable droppableId={kolom.id} key={kolom.id}>
              {(provided, snapshot) => (
                <div
                  className={`hm-pipeline__kolom${snapshot.isDraggingOver ? " is-over" : ""}${kolom.isFallback ? " is-fallback" : ""}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <ColumnHeader
                    isBeheerder={isBeheerder}
                    kolom={kolom}
                    onRename={(id, naam) => renameStatus.mutate({ id, naam })}
                  />
                  <div className="hm-pipeline__kaarten">
                    {kolom.deals.map((taak, index) => {
                      const deadline = deadlineLabel(taak);
                      return (
                        <Draggable
                          draggableId={String(taak.id)}
                          index={index}
                          key={taak.id}
                        >
                          {(p, kaartSnapshot) => {
                            const wie = toegewezenInfo(taak);
                            return (
                              <Link
                                className={`hm-card hm-card--hover hm-deal${kaartSnapshot.isDragging ? " is-dragging" : ""}`}
                                href={`/admin/collections/tasks/${taak.id}`}
                                ref={p.innerRef}
                                {...p.draggableProps}
                                {...p.dragHandleProps}
                              >
                                {projectNaam(taak) && (
                                  <span className="hm-deal__co">
                                    <span className="hm-deal__coname">
                                      {projectNaam(taak)}
                                    </span>
                                  </span>
                                )}
                                <span className="hm-deal__title">
                                  {taak.titel}
                                </span>
                                <span className="hm-deal__foot">
                                  <span className="hm-board__badges">
                                    {taak.prioriteit === "hoog" && (
                                      <span className="hm-pill hm-pill--rose">
                                        Hoog
                                      </span>
                                    )}
                                    {taak.prioriteit === "laag" && (
                                      <span className="hm-pill hm-pill--slate">
                                        Laag
                                      </span>
                                    )}
                                    {deadline && (
                                      <span
                                        className={`hm-pill ${deadline.verlopen ? "hm-pill--rose" : "hm-pill--slate"}`}
                                      >
                                        {deadline.tekst}
                                      </span>
                                    )}
                                  </span>
                                  {wie && (
                                    <span
                                      className="hm-av hm-av--sm"
                                      style={{ background: avatarKleur(wie.id) }}
                                      title={`Toegewezen aan: ${wie.naam}`}
                                    >
                                      {initialen(wie.naam)}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            );
                          }}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                  <Link
                    className="hm-pipeline__nieuw"
                    href="/admin/collections/tasks/create"
                  >
                    + Taak
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
            alleTaken.filter((t) => {
              const ref = t.status;
              const statusId = ref && typeof ref === "object" ? ref.id : ref;
              return String(statusId ?? "") === String(id);
            }).length
          }
          collectionSlug="task-statuses"
          isBeheerder={isBeheerder}
          itemNaam="status"
          kaartNaam="taak"
          kolommen={(statussenQuery.data ?? []).map((s) => ({
            id: s.id,
            naam: s.naam,
            kleur: s.kleur,
            _order: s._order,
          }))}
          onClose={() => setKolommenOpen(false)}
          onFout={setFout}
          onGewijzigd={() => {
            statusInvalidate();
            qc.invalidateQueries({ queryKey: ["taken", "taken"] });
          }}
        />
      )}

      {fout && (
        <div className="hm-toast hm-toast--fout" role="status">
          {fout}
        </div>
      )}
    </div>
  );
}
