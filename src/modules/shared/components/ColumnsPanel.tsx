"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import "@/modules/shared/styles/dashboard.scss";

/** De kleurtokens die Els per kolom kan kiezen (zelfde set als de collecties). */
const KLEUREN = [
  "groen",
  "blauw",
  "paars",
  "rood",
  "oranje",
  "geel",
  "turquoise",
  "roze",
  "grijs",
] as const;

export type PanelKolom = {
  id: number;
  naam: string;
  kleur: string;
  _order?: string | null;
};

type Props = {
  /** bv. "deal-stages" — bepaalt de REST-endpoints. */
  collectionSlug: string;
  /** Kolommen in huidige volgorde (gesorteerd op _order). */
  kolommen: PanelKolom[];
  /** Aantal kaarten per kolom-id, voor de verwijder-melding. */
  aantalPerKolom: (id: number) => number;
  isBeheerder: boolean;
  itemNaam: string; // "fase" | "status"
  kaartNaam: string; // "deal" | "taak"
  onClose: () => void;
  /** Na elke geslaagde wijziging: caller invalideert zijn queries. */
  onGewijzigd: () => void;
  onFout: (melding: string) => void;
};

async function rest(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return res.json();
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

function KolomRij({
  aantal,
  isBeheerder,
  kolom,
  onKleur,
  onRename,
  onVerwijder,
}: {
  aantal: number;
  isBeheerder: boolean;
  kolom: PanelKolom;
  onKleur: (kleur: string) => void;
  onRename: (naam: string) => void;
  onVerwijder: () => void;
}) {
  const [naam, setNaam] = useState(kolom.naam);
  const [kiezerOpen, setKiezerOpen] = useState(false);

  const bevestig = () => {
    const schoon = naam.trim();
    if (schoon && schoon !== kolom.naam) onRename(schoon);
    else setNaam(kolom.naam);
  };

  return (
    <div className="hm-kolompanel__rij">
      <span
        aria-hidden
        className={`hm-kolompanel__grip${isBeheerder ? "" : " is-uit"}`}
      >
        <GripVertical size={15} strokeWidth={2} />
      </span>
      <span className="hm-kolompanel__kleurwrap">
        <button
          aria-label={`Kleur van ${kolom.naam} wijzigen`}
          className={`hm-kleur hm-kleur--${kolom.kleur} hm-kolompanel__kleurknop`}
          disabled={!isBeheerder}
          onClick={() => setKiezerOpen((v) => !v)}
          type="button"
        />
        {kiezerOpen && (
          <>
            <div
              aria-hidden
              className="hm-menu__backdrop"
              onClick={() => setKiezerOpen(false)}
              role="presentation"
            />
            <div className="hm-kolompanel__kiezer">
              {KLEUREN.map((kleur) => (
                <button
                  aria-label={kleur}
                  className={`hm-kleur hm-kleur--${kleur} hm-kolompanel__swatch${kleur === kolom.kleur ? " is-actief" : ""}`}
                  key={kleur}
                  onClick={() => {
                    setKiezerOpen(false);
                    if (kleur !== kolom.kleur) onKleur(kleur);
                  }}
                  title={kleur}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </span>
      <input
        className="hm-kolompanel__naam"
        disabled={!isBeheerder}
        onBlur={bevestig}
        onChange={(e) => setNaam(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setNaam(kolom.naam);
        }}
        value={naam}
      />
      <span className="hm-kolompanel__aantal">{aantal}</span>
      {isBeheerder && (
        <button
          aria-label={`${kolom.naam} verwijderen`}
          className="hm-kolompanel__verwijder"
          onClick={onVerwijder}
          title="Verwijderen (naar prullenbak)"
          type="button"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

/**
 * Kolommenbeheer-sidepanel (PRD Epic D): alle kolommen slepen, hernoemen,
 * kleuren, toevoegen en verwijderen — zonder het board te verlaten.
 * Generiek over kolom-collecties (deal-stages, task-statuses).
 */
export function ColumnsPanel({
  aantalPerKolom,
  collectionSlug,
  isBeheerder,
  itemNaam,
  kaartNaam,
  kolommen,
  onClose,
  onFout,
  onGewijzigd,
}: Props) {
  useEscape(onClose);
  const [bezig, setBezig] = useState(false);
  const [verwijderKolom, setVerwijderKolom] = useState<PanelKolom | null>(null);

  const voerUit = async (actie: () => Promise<unknown>) => {
    setBezig(true);
    try {
      await actie();
      onGewijzigd();
    } catch {
      onFout("Wijziging opslaan mislukt — probeer het opnieuw.");
    } finally {
      setBezig(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const versleept = kolommen[source.index];
    const zonder = kolommen.filter((_, i) => i !== source.index);
    const doelBuur = zonder[destination.index] ?? null;

    // Payload's orderable-endpoint: plaats vóór (less) of ná (greater) een target
    const target = doelBuur ?? zonder[zonder.length - 1];
    if (!target?._order) return;
    const newKeyWillBe = doelBuur ? "less" : "greater";

    void voerUit(() =>
      rest("/api/reorder", "POST", {
        collectionSlug,
        docsToMove: [String(versleept.id)],
        newKeyWillBe,
        orderableFieldName: "_order",
        target: { id: String(target.id), key: target._order },
      }),
    );
  };

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside aria-label="Kolommen beheren" className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3>Kolommen</h3>
          {bezig && <span className="hm-dealpanel__bezig">opslaan…</span>}
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
          {!isBeheerder && (
            <p className="hm-kolompanel__hint">
              Alleen beheerders kunnen kolommen wijzigen — je kijkt mee in
              leesmodus.
            </p>
          )}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="kolompanel">
              {(provided) => (
                <div
                  className="hm-kolompanel__lijst"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {kolommen.map((kolom, index) => (
                    <Draggable
                      draggableId={String(kolom.id)}
                      index={index}
                      isDragDisabled={!isBeheerder}
                      key={kolom.id}
                    >
                      {(p, snapshot) => (
                        <div
                          className={
                            snapshot.isDragging ? "is-dragging" : undefined
                          }
                          ref={p.innerRef}
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                        >
                          <KolomRij
                            aantal={aantalPerKolom(kolom.id)}
                            isBeheerder={isBeheerder}
                            kolom={kolom}
                            onKleur={(kleur) =>
                              void voerUit(() =>
                                rest(
                                  `/api/${collectionSlug}/${kolom.id}`,
                                  "PATCH",
                                  { kleur },
                                ),
                              )
                            }
                            onRename={(naam) =>
                              void voerUit(() =>
                                rest(
                                  `/api/${collectionSlug}/${kolom.id}`,
                                  "PATCH",
                                  { naam },
                                ),
                              )
                            }
                            onVerwijder={() => setVerwijderKolom(kolom)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {isBeheerder && (
            <button
              className="hm-kolompanel__nieuw"
              disabled={bezig}
              onClick={() =>
                void voerUit(() =>
                  rest(`/api/${collectionSlug}`, "POST", {
                    naam: `Nieuwe ${itemNaam}`,
                    kleur: "grijs",
                  }),
                )
              }
              type="button"
            >
              <Plus size={15} strokeWidth={2.25} />
              Kolom toevoegen
            </button>
          )}
        </div>
      </aside>

      {verwijderKolom && (
        <>
          <div
            aria-hidden
            className="hm-dialoog__backdrop"
            onClick={() => setVerwijderKolom(null)}
            role="presentation"
          />
          <div aria-label="Kolom verwijderen" className="hm-dialoog" role="dialog">
            <h3>Kolom verwijderen</h3>
            <p>
              {aantalPerKolom(verwijderKolom.id) > 0
                ? `${aantalPerKolom(verwijderKolom.id)} ${kaartNaam}${aantalPerKolom(verwijderKolom.id) === 1 ? "" : "s"} in '${verwijderKolom.naam}' ${aantalPerKolom(verwijderKolom.id) === 1 ? "valt" : "vallen"} terug naar de kolom 'Geen ${itemNaam}'.`
                : `'${verwijderKolom.naam}' is leeg.`}{" "}
              Herstellen kan via de prullenbak.
            </p>
            <div className="hm-dialoog__acties">
              <button
                className="hm-btn hm-btn--ghost"
                onClick={() => setVerwijderKolom(null)}
                type="button"
              >
                Annuleren
              </button>
              <button
                className="hm-btn hm-btn--gevaar"
                onClick={() => {
                  const kolom = verwijderKolom;
                  setVerwijderKolom(null);
                  void voerUit(() =>
                    rest(`/api/${collectionSlug}/${kolom.id}`, "PATCH", {
                      deletedAt: new Date().toISOString(),
                    }),
                  );
                }}
                type="button"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
