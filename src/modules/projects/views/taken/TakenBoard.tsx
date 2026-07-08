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
import Link from "next/link";
import React, { useState } from "react";

import {
  buildTaskColumns,
  GEEN_FASE,
  positionBetween,
} from "@/modules/crm/views/pipeline/lib";
import { projectsApi } from "@/modules/projects/api";
import { ColumnHeader } from "@/modules/shared/components/ColumnHeader";
import type { Project, Task, TaskStatus } from "@/payload-types";

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

function toegewezenInitialen(taak: Task): string | null {
  const wie = taak.toegewezen;
  if (wie && typeof wie === "object" && wie.name) {
    return wie.name
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
  }
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

  const createStatus = useMutation({
    mutationFn: () =>
      projectsApi.createStatus({ naam: "Nieuwe status", kleur: "grijs" }),
    onSettled: statusInvalidate,
  });

  const renameStatus = useMutation({
    mutationFn: (input: { id: number; naam: string }) =>
      projectsApi.updateStatus(input.id, { naam: input.naam }),
    onSettled: statusInvalidate,
  });

  const trashStatus = useMutation({
    mutationFn: (id: number) => projectsApi.trashStatus(id),
    onSettled: () => {
      statusInvalidate();
      qc.invalidateQueries({ queryKey: ["taken", "taken"] });
    },
  });

  const handleTrash = (id: number, kaartAantal: number, naam: string) => {
    const melding =
      kaartAantal > 0
        ? `${kaartAantal} ta${kaartAantal === 1 ? "ak valt" : "ken vallen"} terug naar 'Geen status'. Status '${naam}' verwijderen?`
        : `Status '${naam}' verwijderen? (Herstellen kan via de prullenbak van Taakstatussen.)`;
    if (window.confirm(melding)) {
      trashStatus.mutate(id);
    }
  };

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
                    onTrash={handleTrash}
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
                          {(p, kaartSnapshot) => (
                            <Link
                              className={`hm-pipeline__kaart${kaartSnapshot.isDragging ? " is-dragging" : ""}`}
                              href={`/admin/collections/tasks/${taak.id}`}
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                            >
                              <span className="hm-pipeline__kaarttitel">
                                {taak.titel}
                              </span>
                              {projectNaam(taak) && (
                                <span className="hm-pipeline__kaartorg">
                                  {projectNaam(taak)}
                                </span>
                              )}
                              <span className="hm-pipeline__kaartvoet">
                                <span className="hm-board__badges">
                                  {taak.prioriteit === "hoog" && (
                                    <span className="hm-board__prioriteit">
                                      Hoog
                                    </span>
                                  )}
                                  {deadline && (
                                    <span
                                      className={`hm-board__deadline${deadline.verlopen ? " is-verlopen" : ""}`}
                                    >
                                      {deadline.tekst}
                                    </span>
                                  )}
                                </span>
                                {toegewezenInitialen(taak) && (
                                  <span
                                    className="hm-pipeline__avatar"
                                    title="Toegewezen aan"
                                  >
                                    {toegewezenInitialen(taak)}
                                  </span>
                                )}
                              </span>
                            </Link>
                          )}
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
          {isBeheerder && (
            <button
              className="hm-pipeline__nieuwekolom"
              disabled={createStatus.isPending}
              onClick={() => createStatus.mutate()}
              type="button"
            >
              + Status
            </button>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
