"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { VELD_TYPES } from "@/modules/crm/veldTypes";
import { KolommenBeheer } from "@/modules/shared/components/ColumnsPanel";
import { lijstVan, TagsVeld } from "@/modules/shared/components/TagsVeld";
import type { CrmVeld, Functie, Sector } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

type Props = {
  isBeheerder: boolean;
  sectoren: Sector[];
  functies: Functie[];
  velden: CrmVeld[];
  aantalPerSector: (id: number) => number;
  aantalPerFunctie: (id: number) => number;
  onClose: () => void;
  onFout: (melding: string) => void;
  onGewijzigd: () => void;
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

const GELDT_VOOR = [
  { label: "Organisaties", value: "organisaties" },
  { label: "Contactpersonen", value: "contacten" },
  { label: "Beide", value: "beide" },
] as const;

function typeLabel(waarde: string): string {
  return VELD_TYPES.find((t) => t.value === waarde)?.label ?? waarde;
}

/** Beheer van Els's eigen CRM-velden (MKB-plan B4): hernoemen, opties,
    doelgroep, volgorde (slepen) en archiveren — definities als data. */
function VeldenBeheer({
  isBeheerder,
  onFout,
  onGewijzigd,
  velden,
}: {
  isBeheerder: boolean;
  onFout: (melding: string) => void;
  onGewijzigd: () => void;
  velden: CrmVeld[];
}) {
  const [bezig, setBezig] = useState(false);
  const [verwijderVeld, setVerwijderVeld] = useState<CrmVeld | null>(null);
  const [nieuwLabel, setNieuwLabel] = useState("");
  const [nieuwType, setNieuwType] = useState("tekst");
  const [nieuwVoor, setNieuwVoor] = useState("beide");

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
    const versleept = velden[source.index];
    const zonder = velden.filter((_, i) => i !== source.index);
    const doelBuur = zonder[destination.index] ?? null;
    const target = doelBuur ?? zonder[zonder.length - 1];
    if (!target?._order) return;
    void voerUit(() =>
      rest("/api/reorder", "POST", {
        collectionSlug: "crm-velden",
        docsToMove: [String(versleept.id)],
        newKeyWillBe: doelBuur ? "less" : "greater",
        orderableFieldName: "_order",
        target: { id: String(target.id), key: target._order },
      }),
    );
  };

  return (
    <>
      {bezig && <span className="hm-dealpanel__bezig">opslaan…</span>}
      {!isBeheerder && (
        <p className="hm-kolompanel__hint">
          Alleen beheerders kunnen velden wijzigen — je kijkt mee in leesmodus.
        </p>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="veldenbeheer">
          {(provided) => (
            <div
              className="hm-kolompanel__lijst"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {velden.map((veld, index) => (
                <Draggable
                  draggableId={String(veld.id)}
                  index={index}
                  isDragDisabled={!isBeheerder}
                  key={veld.id}
                >
                  {(p, snapshot) => (
                    <div
                      className={`hm-veldbeheer__rij${snapshot.isDragging ? " is-dragging" : ""}`}
                      ref={p.innerRef}
                      {...p.draggableProps}
                      {...p.dragHandleProps}
                    >
                      <div className="hm-veldbeheer__kop">
                        <span
                          aria-hidden
                          className={`hm-kolompanel__grip${isBeheerder ? "" : " is-uit"}`}
                        >
                          <GripVertical size={15} strokeWidth={2} />
                        </span>
                        <input
                          className="hm-kolompanel__naam"
                          defaultValue={veld.label}
                          disabled={!isBeheerder}
                          key={`lbl-${veld.id}-${veld.updatedAt}`}
                          onBlur={(e) => {
                            const nieuw = e.target.value.trim();
                            if (nieuw && nieuw !== veld.label) {
                              void voerUit(() =>
                                rest(`/api/crm-velden/${veld.id}`, "PATCH", {
                                  label: nieuw,
                                }),
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                        />
                        <span className="hm-pill">{typeLabel(veld.type)}</span>
                        <select
                          aria-label="Geldt voor"
                          className="hm-veldbeheer__voor"
                          disabled={!isBeheerder}
                          onChange={(e) =>
                            void voerUit(() =>
                              rest(`/api/crm-velden/${veld.id}`, "PATCH", {
                                geldtVoor: e.target.value,
                              }),
                            )
                          }
                          value={veld.geldtVoor}
                        >
                          {GELDT_VOOR.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                        {isBeheerder && (
                          <button
                            aria-label={`Veld '${veld.label}' archiveren`}
                            className="hm-kolompanel__verwijder"
                            onClick={() => setVerwijderVeld(veld)}
                            title="Archiveren (naar prullenbak; waarden blijven bewaard)"
                            type="button"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                      {(veld.type === "select" ||
                        veld.type === "multiselect") && (
                        <div className="hm-veldbeheer__opties">
                          <TagsVeld
                            onWijzig={(opties) =>
                              void voerUit(() =>
                                rest(`/api/crm-velden/${veld.id}`, "PATCH", {
                                  opties,
                                }),
                              )
                            }
                            placeholder="Optie + Enter…"
                            tags={lijstVan(veld.opties)}
                          />
                        </div>
                      )}
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
        <form
          className="hm-veldbeheer__nieuw"
          onSubmit={(e) => {
            e.preventDefault();
            const label = nieuwLabel.trim();
            if (!label) return;
            setNieuwLabel("");
            void voerUit(() =>
              rest("/api/crm-velden", "POST", {
                label,
                type: nieuwType,
                geldtVoor: nieuwVoor,
              }),
            );
          }}
        >
          <input
            aria-label="Label van het nieuwe veld"
            onChange={(e) => setNieuwLabel(e.target.value)}
            placeholder="Nieuw veld…"
            value={nieuwLabel}
          />
          <select
            aria-label="Type van het nieuwe veld"
            onChange={(e) => setNieuwType(e.target.value)}
            value={nieuwType}
          >
            {VELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Geldt voor"
            onChange={(e) => setNieuwVoor(e.target.value)}
            value={nieuwVoor}
          >
            {GELDT_VOOR.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <button
            className="hm-btn hm-btn--primary"
            disabled={!nieuwLabel.trim() || bezig}
            type="submit"
          >
            <Plus size={14} strokeWidth={2.5} />
            Toevoegen
          </button>
        </form>
      )}

      {verwijderVeld && (
        <>
          <div
            aria-hidden
            className="hm-dialoog__backdrop"
            onClick={() => setVerwijderVeld(null)}
            role="presentation"
          />
          <div aria-label="Veld archiveren" className="hm-dialoog" role="dialog">
            <h3>Veld archiveren</h3>
            <p>
              Het veld &apos;{verwijderVeld.label}&apos; verdwijnt uit de
              panelen en lijsten; opgeslagen waarden blijven bewaard.
              Herstellen kan via de prullenbak.
            </p>
            <div className="hm-dialoog__acties">
              <button
                className="hm-btn hm-btn--ghost"
                onClick={() => setVerwijderVeld(null)}
                type="button"
              >
                Annuleren
              </button>
              <button
                className="hm-btn hm-btn--gevaar"
                onClick={() => {
                  const veld = verwijderVeld;
                  setVerwijderVeld(null);
                  void voerUit(() =>
                    rest(`/api/crm-velden/${veld.id}`, "PATCH", {
                      deletedAt: new Date().toISOString(),
                    }),
                  );
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

/**
 * CRM-instellingen-slideover (MKB-plan B6): één beheerplek voor de
 * beheerbare lijsten en eigen velden van het CRM — zonder de Payload-editor.
 */
export function CrmInstellingen({
  aantalPerFunctie,
  aantalPerSector,
  functies,
  isBeheerder,
  onClose,
  onFout,
  onGewijzigd,
  sectoren,
  velden,
}: Props) {
  const [tab, setTab] = useState<"sectoren" | "functies" | "velden">(
    "sectoren",
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const naarKolommen = (docs: (Sector | Functie)[]) =>
    docs.map((d) => ({
      id: d.id,
      naam: d.naam,
      kleur: d.kleur,
      _order: d._order,
    }));

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label="CRM-instellingen"
        className="hm-slideover"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <h3>CRM-instellingen</h3>
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
          <div className="hm-seg hm-instellingen__tabs">
            <button
              className={tab === "sectoren" ? "is-actief" : ""}
              onClick={() => setTab("sectoren")}
              type="button"
            >
              Sectoren ({sectoren.length})
            </button>
            <button
              className={tab === "functies" ? "is-actief" : ""}
              onClick={() => setTab("functies")}
              type="button"
            >
              Functies ({functies.length})
            </button>
            <button
              className={tab === "velden" ? "is-actief" : ""}
              onClick={() => setTab("velden")}
              type="button"
            >
              Velden ({velden.length})
            </button>
          </div>

          {tab === "sectoren" && (
            <KolommenBeheer
              aantalPerKolom={aantalPerSector}
              collectionSlug="sectoren"
              isBeheerder={isBeheerder}
              itemNaam="sector"
              kaartNaam="organisatie"
              kolommen={naarKolommen(sectoren)}
              onFout={onFout}
              onGewijzigd={onGewijzigd}
              toevoegLabel="Sector toevoegen"
              verwijderMelding={(naam, aantal) =>
                aantal > 0
                  ? `${aantal} organisatie${aantal === 1 ? "" : "s"} gebruik${aantal === 1 ? "t" : "en"} '${naam}' — het label vervalt daar.`
                  : `'${naam}' wordt nergens gebruikt.`
              }
            />
          )}
          {tab === "functies" && (
            <KolommenBeheer
              aantalPerKolom={aantalPerFunctie}
              collectionSlug="functies"
              isBeheerder={isBeheerder}
              itemNaam="functie"
              kaartNaam="contactpersoon"
              kolommen={naarKolommen(functies)}
              onFout={onFout}
              onGewijzigd={onGewijzigd}
              toevoegLabel="Functie toevoegen"
              verwijderMelding={(naam, aantal) =>
                aantal > 0
                  ? `${aantal} contactperso${aantal === 1 ? "on gebruikt" : "nen gebruiken"} '${naam}' — het label vervalt daar.`
                  : `'${naam}' wordt nergens gebruikt.`
              }
            />
          )}
          {tab === "velden" && (
            <VeldenBeheer
              isBeheerder={isBeheerder}
              onFout={onFout}
              onGewijzigd={onGewijzigd}
              velden={velden}
            />
          )}
        </div>
      </aside>
    </>
  );
}
