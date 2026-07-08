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

import { crmApi } from "@/modules/crm/api";
import { ColumnHeader } from "@/modules/shared/components/ColumnHeader";
import {
  buildColumns,
  GEEN_FASE,
  positionBetween,
} from "@/modules/crm/views/pipeline/lib";
import type { Deal, DealStage } from "@/payload-types";

import "@/modules/shared/components/board.scss";

type Props = {
  initialStages: DealStage[];
  initialDeals: Deal[];
  isBeheerder: boolean;
};

export function PipelineBoard(props: Props) {
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

function euro(bedrag?: number | null): string | null {
  if (bedrag == null) return null;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(bedrag);
}

function orgNaam(deal: Deal): string | null {
  const org = deal.organisatie;
  if (org && typeof org === "object") return org.naam;
  return null;
}

function eigenaarInitialen(deal: Deal): string | null {
  const eigenaar = deal.eigenaar;
  if (eigenaar && typeof eigenaar === "object" && eigenaar.name) {
    return eigenaar.name
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
  }
  return null;
}

function Board({ initialStages, initialDeals, isBeheerder }: Props) {
  const qc = useQueryClient();

  const stagesQuery = useQuery({
    queryKey: ["pipeline", "stages"],
    queryFn: () =>
      fetchJson<{ docs: DealStage[] }>(
        "/api/deal-stages?sort=_order&limit=100",
      ).then((r) => r.docs),
    initialData: initialStages,
  });

  const dealsQuery = useQuery({
    queryKey: ["pipeline", "deals"],
    queryFn: () =>
      fetchJson<{ docs: Deal[] }>(
        "/api/deals?where[uitkomst][equals]=open&sort=position&limit=500&depth=1",
      ).then((r) => r.docs),
    initialData: initialDeals,
  });

  const moveDeal = useMutation({
    mutationFn: (input: {
      id: Deal["id"];
      fase: Deal["fase"];
      position: number;
    }) =>
      crmApi.updateDeal(input.id, {
        fase: input.fase,
        position: input.position,
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["pipeline", "deals"] });
      const vorige = qc.getQueryData<Deal[]>(["pipeline", "deals"]);
      qc.setQueryData<Deal[]>(["pipeline", "deals"], (oud) =>
        (oud ?? []).map((d) =>
          String(d.id) === String(input.id)
            ? { ...d, fase: input.fase, position: input.position }
            : d,
        ),
      );
      return { vorige };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.vorige) qc.setQueryData(["pipeline", "deals"], ctx.vorige);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["pipeline", "deals"] }),
  });

  const stageInvalidate = () =>
    qc.invalidateQueries({ queryKey: ["pipeline", "stages"] });

  const createStage = useMutation({
    mutationFn: () => crmApi.createStage({ naam: "Nieuwe fase", kleur: "grijs" }),
    onSettled: stageInvalidate,
  });

  const renameStage = useMutation({
    mutationFn: (input: { id: number; naam: string }) =>
      crmApi.updateStage(input.id, { naam: input.naam }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["pipeline", "stages"] });
      qc.setQueryData<DealStage[]>(["pipeline", "stages"], (oud) =>
        (oud ?? []).map((s) =>
          String(s.id) === String(input.id) ? { ...s, naam: input.naam } : s,
        ),
      );
    },
    onSettled: stageInvalidate,
  });

  const trashStage = useMutation({
    mutationFn: (id: number) => crmApi.trashStage(id),
    onSettled: () => {
      stageInvalidate();
      qc.invalidateQueries({ queryKey: ["pipeline", "deals"] });
    },
  });

  const handleTrash = (id: number, kaartAantal: number, naam: string) => {
    const melding =
      kaartAantal > 0
        ? `${kaartAantal} kaart${kaartAantal === 1 ? "" : "en"} vallen terug naar 'Geen fase'. Fase '${naam}' verwijderen?`
        : `Fase '${naam}' verwijderen? (Herstellen kan via de prullenbak van Pipeline-fases.)`;
    if (window.confirm(melding)) {
      trashStage.mutate(id);
    }
  };

  const kolommen = buildColumns(stagesQuery.data ?? [], dealsQuery.data ?? []);

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const doelKolom = kolommen.find((k) => k.id === destination.droppableId);
    if (!doelKolom) return;

    const kaart = (dealsQuery.data ?? []).find(
      (d) => String(d.id) === draggableId,
    );
    if (!kaart) return;

    const zonderKaart = doelKolom.deals.filter(
      (d) => String(d.id) !== draggableId,
    );
    const prev = zonderKaart[destination.index - 1]?.position ?? null;
    const next = zonderKaart[destination.index]?.position ?? null;
    const nieuweFase =
      doelKolom.id === GEEN_FASE ? null : Number(doelKolom.id);

    moveDeal.mutate({
      id: kaart.id,
      fase: nieuweFase,
      position: positionBetween(prev, next),
    });
  };

  return (
    <div className="hm-pipeline">
      {moveDeal.isError && (
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
                    onRename={(id, naam) => renameStage.mutate({ id, naam })}
                    onTrash={handleTrash}
                  />
                  <div className="hm-pipeline__kaarten">
                    {kolom.deals.map((deal, index) => (
                      <Draggable
                        draggableId={String(deal.id)}
                        index={index}
                        key={deal.id}
                      >
                        {(p, kaartSnapshot) => (
                          <Link
                            className={`hm-pipeline__kaart${kaartSnapshot.isDragging ? " is-dragging" : ""}`}
                            href={`/admin/collections/deals/${deal.id}`}
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                          >
                            <span className="hm-pipeline__kaarttitel">
                              {deal.titel}
                            </span>
                            {orgNaam(deal) && (
                              <span className="hm-pipeline__kaartorg">
                                {orgNaam(deal)}
                              </span>
                            )}
                            <span className="hm-pipeline__kaartvoet">
                              {euro(deal.bedrag) && (
                                <span className="hm-pipeline__bedrag">
                                  {euro(deal.bedrag)}
                                </span>
                              )}
                              {eigenaarInitialen(deal) && (
                                <span
                                  className="hm-pipeline__avatar"
                                  title="Eigenaar"
                                >
                                  {eigenaarInitialen(deal)}
                                </span>
                              )}
                            </span>
                          </Link>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  <Link
                    className="hm-pipeline__nieuw"
                    href="/admin/collections/deals/create"
                  >
                    + Deal
                  </Link>
                </div>
              )}
            </Droppable>
          ))}
          {isBeheerder && (
            <button
              className="hm-pipeline__nieuwekolom"
              disabled={createStage.isPending}
              onClick={() => createStage.mutate()}
              type="button"
            >
              + Fase
            </button>
          )}
        </div>
      </DragDropContext>
      {!isBeheerder && (
        <p className="hm-pipeline__hint">
          Kolommen beheren (toevoegen, hernoemen, verwijderen) kan alleen als
          beheerder.
        </p>
      )}
    </div>
  );
}
