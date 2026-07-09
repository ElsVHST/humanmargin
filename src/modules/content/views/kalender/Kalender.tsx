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
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { contentApi } from "@/modules/content/api";
import {
  ContentPanel,
  type PanelToast,
} from "@/modules/content/views/kalender/ContentPanel";
import {
  dagSleutel,
  itemsPerDag,
  maandGrid,
  weekDagen,
} from "@/modules/content/views/kalender/lib";
import type { ContentItem } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "./kalender.scss";

type Weergave = "maand" | "week" | "lijst";

type Props = { initialItems: ContentItem[] };

export function Kalender({ initialItems }: Props) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <KalenderInner initialItems={initialItems} />
    </QueryClientProvider>
  );
}

const STATUS_LABELS: Record<string, string> = {
  idee: "Idee",
  concept: "Concept",
  gepland: "Gepland",
  gepubliceerd: "Gepubliceerd",
};

function kanaalInfo(item: ContentItem): { naam: string; kleur: string } | null {
  const kanaal = item.kanaal;
  if (kanaal && typeof kanaal === "object") {
    return { naam: kanaal.naam, kleur: kanaal.kleur };
  }
  return null;
}

function KalenderInner({ initialItems }: Props) {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemParam = searchParams.get("item");
  const [weergave, setWeergave] = useState<Weergave>("maand");
  const [anker, setAnker] = useState(() => new Date());
  const [toast, setToast] = useState<PanelToast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const itemsQuery = useQuery({
    queryKey: ["kalender", "items"],
    queryFn: async () => {
      const res = await fetch(
        "/api/content-items?sort=publishDate&limit=500&depth=1",
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`GET content-items → ${res.status}`);
      return ((await res.json()) as { docs: ContentItem[] }).docs;
    },
    initialData: initialItems,
  });

  const verplaats = useMutation({
    mutationFn: (input: { id: ContentItem["id"]; publishDate: string }) =>
      contentApi.updateItem(input.id, { publishDate: input.publishDate }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["kalender", "items"] });
      const vorige = qc.getQueryData<ContentItem[]>(["kalender", "items"]);
      qc.setQueryData<ContentItem[]>(["kalender", "items"], (oud) =>
        (oud ?? []).map((i) =>
          String(i.id) === String(input.id)
            ? { ...i, publishDate: input.publishDate }
            : i,
        ),
      );
      return { vorige };
    },
    onError: (_e, _i, ctx) => {
      if (ctx?.vorige) qc.setQueryData(["kalender", "items"], ctx.vorige);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["kalender", "items"] }),
  });

  const alle = itemsQuery.data ?? [];
  const perDag = itemsPerDag(alle);
  const ongepland = alle.filter((i) => !i.publishDate);
  const vandaagSleutel = dagSleutel(new Date());

  const dagen =
    weergave === "maand"
      ? maandGrid(anker.getFullYear(), anker.getMonth())
      : weergave === "week"
        ? weekDagen(anker)
        : [];

  const stap = (richting: 1 | -1) => {
    if (weergave === "maand") {
      setAnker(new Date(anker.getFullYear(), anker.getMonth() + richting, 1));
    } else {
      setAnker(
        new Date(
          anker.getFullYear(),
          anker.getMonth(),
          anker.getDate() + richting * 7,
        ),
      );
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const item = alle.find((i) => String(i.id) === String(draggableId));
    if (!item) return;

    if (
      item.status === "gepubliceerd" &&
      !window.confirm(
        "Dit item is al gepubliceerd. Weet je zeker dat je de datum wilt wijzigen?",
      )
    ) {
      return;
    }

    // Behoud de tijd, wijzig alleen de dag
    const oud = item.publishDate ? new Date(item.publishDate) : new Date();
    const [jaar, maand, dag] = destination.droppableId.split("-").map(Number);
    const nieuw = new Date(
      jaar,
      maand - 1,
      dag,
      oud.getHours(),
      oud.getMinutes(),
    );
    verplaats.mutate({ id: item.id, publishDate: nieuw.toISOString() });
  };

  const maandLabel = new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
  }).format(anker);

  return (
    <div className="hm-kalender">
      <div className="hm-kalender__balk">
        <div className="hm-kalender__nav">
          <button onClick={() => stap(-1)} type="button">
            ‹
          </button>
          <button onClick={() => setAnker(new Date())} type="button">
            Vandaag
          </button>
          <button onClick={() => stap(1)} type="button">
            ›
          </button>
          <span className="hm-kalender__label">{maandLabel}</span>
        </div>
        <div className="hm-kalender__weergaven">
          {(["maand", "week", "lijst"] as Weergave[]).map((w) => (
            <button
              className={weergave === w ? "is-actief" : ""}
              key={w}
              onClick={() => setWeergave(w)}
              type="button"
            >
              {w[0].toUpperCase() + w.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {verplaats.isError && (
        <p className="hm-pipeline__fout" role="alert">
          Verplaatsen mislukt — het item is teruggezet.
        </p>
      )}

      {weergave === "lijst" ? (
        <div className="hm-kalender__lijst">
          {ongepland.length > 0 && (
            <>
              <h3>Nog niet gepland</h3>
              {ongepland.map((item) => (
                <ItemChip item={item} key={item.id} toonDatum />
              ))}
            </>
          )}
          <h3>Gepland</h3>
          {alle
            .filter((i) => i.publishDate)
            .map((item) => (
              <ItemChip item={item} key={item.id} toonDatum />
            ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            className={`hm-kalender__grid${weergave === "week" ? " is-week" : ""}`}
          >
            {["ma", "di", "wo", "do", "vr", "za", "zo"].map((d) => (
              <div className="hm-kalender__dagkop" key={d}>
                {d}
              </div>
            ))}
            {dagen.map((dag) => {
              const sleutel = dagSleutel(dag);
              const dagItems = perDag.get(sleutel) ?? [];
              const anderemaand =
                weergave === "maand" && dag.getMonth() !== anker.getMonth();
              return (
                <Droppable droppableId={sleutel} key={sleutel}>
                  {(provided, snapshot) => (
                    <div
                      className={`hm-kalender__dag${anderemaand ? " is-andere-maand" : ""}${sleutel === vandaagSleutel ? " is-vandaag" : ""}${snapshot.isDraggingOver ? " is-over" : ""}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <button
                        aria-label={`Nieuw item op ${sleutel}`}
                        className="hm-kalender__dagnummer"
                        onClick={() =>
                          router.push(`/admin/kalender?item=nieuw&datum=${sleutel}`)
                        }
                        title="Klik om hier content te plannen"
                        type="button"
                      >
                        {dag.getDate()}
                      </button>
                      {dagItems.map((item, index) => (
                        <Draggable
                          draggableId={String(item.id)}
                          index={index}
                          key={item.id}
                        >
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                            >
                              <ItemChip item={item} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}
      <p className="hm-kalender__voet">
        <Link href="/admin/kalender?item=nieuw">+ Nieuw content-item</Link>
      </p>

      {itemParam && (
        <ContentPanel
          datumParam={searchParams.get("datum")}
          itemId={itemParam}
          key={itemParam}
          onClose={() => router.push("/admin/kalender")}
          onToast={setToast}
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

function ItemChip({
  item,
  toonDatum = false,
}: {
  item: ContentItem;
  toonDatum?: boolean;
}) {
  const kanaal = kanaalInfo(item);
  return (
    <Link
      className={`hm-kalender__item is-${item.status}`}
      href={`/admin/kalender?item=${item.id}`}
      prefetch={false}
    >
      {kanaal && <span className={`hm-kleur hm-kleur--${kanaal.kleur}`} />}
      <span className="hm-kalender__itemtitel">{item.titel}</span>
      <span className="hm-kalender__status">
        {STATUS_LABELS[item.status] ?? item.status}
      </span>
      {toonDatum && item.publishDate && (
        <span className="hm-kalender__datum">
          {new Intl.DateTimeFormat("nl-NL", {
            day: "numeric",
            month: "short",
          }).format(new Date(item.publishDate))}
        </span>
      )}
    </Link>
  );
}
