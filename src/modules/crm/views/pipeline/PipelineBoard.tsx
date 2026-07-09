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
import { ChevronRight, Pencil, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { crmApi } from "@/modules/crm/api";
import { DealPanel } from "@/modules/crm/views/pipeline/DealPanel";
import {
  ContactPanel,
  OrganisatiePanel,
} from "@/modules/crm/views/pipeline/RelatiePanelen";
import { VerliesDialoog } from "@/modules/crm/views/pipeline/VerliesDialoog";
import {
  buildColumns,
  GEEN_FASE,
  positionBetween,
} from "@/modules/crm/views/pipeline/lib";
import { ColumnHeader } from "@/modules/shared/components/ColumnHeader";
import { ColumnsPanel } from "@/modules/shared/components/ColumnsPanel";
import { avatarKleur, euro, initialen } from "@/modules/shared/ui";
import type { Deal, DealStage } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "@/modules/shared/components/board.scss";

type Props = {
  initialStages: DealStage[];
  initialDeals: Deal[];
  isBeheerder: boolean;
  /** Servertijd (ms) — voorkomt Date.now() in render en hydration-drift. */
  nu: number;
};

export type Toast = { tekst: string; soort: "ok" | "fout" };

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

function orgInfo(
  deal: Deal,
): { naam: string; id: string | number; tags: string[] } | null {
  const org = deal.organisatie;
  if (org && typeof org === "object") {
    return { naam: org.naam, id: org.id, tags: org.tags ?? [] };
  }
  return null;
}

function eigenaarInfo(deal: Deal): { naam: string; id: string | number } | null {
  const e = deal.eigenaar;
  if (e && typeof e === "object" && e.name) return { naam: e.name, id: e.id };
  return null;
}

function contactInfo(deal: Deal): { naam: string; id: string | number } | null {
  const c = deal.contactpersoon;
  if (c && typeof c === "object") return { naam: c.naam ?? c.email, id: c.id };
  return null;
}

const DAG = 86_400_000;
const STILSTAND_DAGEN = 14;

type Signaal =
  | { soort: "laat"; dagen: number }
  | { soort: "stil" }
  | { soort: "gepland" }
  | { soort: "leeg" };

/** Status-stip per kaart (§2.1): rood = over tijd, oranje = stilgevallen,
    groen = sluitdatum gepland, grijs = niets gepland. */
function kaartSignaal(deal: Deal, nu: number): Signaal {
  const sluit = deal.verwachteSluitdatum
    ? new Date(deal.verwachteSluitdatum).getTime()
    : null;
  if (sluit != null && sluit < nu) {
    return { soort: "laat", dagen: Math.max(1, Math.ceil((nu - sluit) / DAG)) };
  }
  const bijgewerkt = new Date(deal.updatedAt).getTime();
  if (nu - bijgewerkt > STILSTAND_DAGEN * DAG) return { soort: "stil" };
  if (sluit != null) return { soort: "gepland" };
  return { soort: "leeg" };
}

function StatusStip({ signaal }: { signaal: Signaal }) {
  if (signaal.soort === "laat") {
    return (
      <span
        className="hm-deal__stip hm-deal__stip--laat"
        title={`Sluitdatum ${signaal.dagen} dag${signaal.dagen === 1 ? "" : "en"} verstreken`}
      >
        {signaal.dagen}d
      </span>
    );
  }
  if (signaal.soort === "stil") {
    return (
      <span
        className="hm-deal__stip hm-deal__stip--stil"
        title={`Meer dan ${STILSTAND_DAGEN} dagen geen beweging`}
      >
        <TriangleAlert size={13} strokeWidth={2.5} />
      </span>
    );
  }
  if (signaal.soort === "gepland") {
    return (
      <span
        className="hm-deal__stip hm-deal__stip--gepland"
        title="Sluitdatum gepland"
      >
        <ChevronRight size={11} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span
      className="hm-deal__stip hm-deal__stip--leeg"
      title="Geen sluitdatum gepland"
    />
  );
}

const ACTIE_GEWONNEN = "actie-gewonnen";
const ACTIE_VERLOREN = "actie-verloren";
const ACTIE_PRULLENBAK = "actie-prullenbak";

function Board({ initialStages, initialDeals, isBeheerder, nu }: Props) {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealParam = searchParams.get("deal");
  const organisatieParam = searchParams.get("organisatie");
  const contactParam = searchParams.get("contact");

  const [zoek, setZoek] = useState("");
  const [eigenaarFilter, setEigenaarFilter] = useState("alle");
  const [sleept, setSleept] = useState(false);
  const [verliesDeal, setVerliesDeal] = useState<Deal | null>(null);
  const [kolommenOpen, setKolommenOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

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

  /** Uitkomst/trash: kaart verdwijnt optimistisch van het open-board. */
  const verwijderVanBoard = async (id: Deal["id"]) => {
    await qc.cancelQueries({ queryKey: ["pipeline", "deals"] });
    const vorige = qc.getQueryData<Deal[]>(["pipeline", "deals"]);
    qc.setQueryData<Deal[]>(["pipeline", "deals"], (oud) =>
      (oud ?? []).filter((d) => String(d.id) !== String(id)),
    );
    return { vorige };
  };

  const wijzigUitkomst = useMutation({
    mutationFn: (input: {
      id: Deal["id"];
      data: Partial<Deal>;
      melding: string;
    }) => crmApi.updateDeal(input.id, input.data),
    onMutate: (input) => verwijderVanBoard(input.id),
    onError: (_err, _input, ctx) => {
      if (ctx?.vorige) qc.setQueryData(["pipeline", "deals"], ctx.vorige);
      setToast({ tekst: "Bijwerken mislukt — probeer het opnieuw.", soort: "fout" });
    },
    onSuccess: (_res, input) => setToast({ tekst: input.melding, soort: "ok" }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["pipeline", "deals"] }),
  });

  const trashDeal = useMutation({
    mutationFn: (id: Deal["id"]) => crmApi.trashDeal(id),
    onMutate: (id) => verwijderVanBoard(id),
    onError: (_err, _input, ctx) => {
      if (ctx?.vorige) qc.setQueryData(["pipeline", "deals"], ctx.vorige);
      setToast({ tekst: "Verwijderen mislukt — probeer het opnieuw.", soort: "fout" });
    },
    onSuccess: () =>
      setToast({
        tekst: "Deal naar de prullenbak — herstellen kan via Deals › Prullenbak.",
        soort: "ok",
      }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["pipeline", "deals"] }),
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
    onSettled: () => qc.invalidateQueries({ queryKey: ["pipeline", "stages"] }),
  });

  const alleDeals = dealsQuery.data ?? [];
  const term = zoek.trim().toLowerCase();
  const gefilterd = alleDeals.filter((d) => {
    if (eigenaarFilter !== "alle") {
      const e = eigenaarInfo(d);
      if (String(e?.id ?? "") !== eigenaarFilter) return false;
    }
    if (term) {
      const org = orgInfo(d)?.naam.toLowerCase() ?? "";
      const contact = contactInfo(d)?.naam.toLowerCase() ?? "";
      if (
        !d.titel.toLowerCase().includes(term) &&
        !org.includes(term) &&
        !contact.includes(term)
      ) {
        return false;
      }
    }
    return true;
  });

  const kolommen = buildColumns(stagesQuery.data ?? [], gefilterd);

  const totaal = gefilterd.reduce((som, d) => som + (d.bedrag ?? 0), 0);
  const gewogen = gefilterd.reduce(
    (som, d) => som + ((d.bedrag ?? 0) * (d.kans ?? 0)) / 100,
    0,
  );

  const eigenaren = new Map<string, string>();
  for (const d of alleDeals) {
    const e = eigenaarInfo(d);
    if (e) eigenaren.set(String(e.id), e.naam);
  }

  const onDragEnd = (result: DropResult) => {
    setSleept(false);
    const { destination, draggableId } = result;
    if (!destination) return;

    const kaart = alleDeals.find((d) => String(d.id) === draggableId);
    if (!kaart) return;

    if (destination.droppableId === ACTIE_GEWONNEN) {
      wijzigUitkomst.mutate({
        id: kaart.id,
        data: { uitkomst: "gewonnen" },
        melding: `Deal '${kaart.titel}' gewonnen 🎉 — project wordt aangemaakt.`,
      });
      return;
    }
    if (destination.droppableId === ACTIE_VERLOREN) {
      setVerliesDeal(kaart);
      return;
    }
    if (destination.droppableId === ACTIE_PRULLENBAK) {
      trashDeal.mutate(kaart.id);
      return;
    }

    const doelKolom = kolommen.find((k) => k.id === destination.droppableId);
    if (!doelKolom) return;

    const zonderKaart = doelKolom.deals.filter(
      (d) => String(d.id) !== draggableId,
    );
    const prev = zonderKaart[destination.index - 1]?.position ?? null;
    const next = zonderKaart[destination.index]?.position ?? null;
    const nieuweFase = doelKolom.id === GEEN_FASE ? null : Number(doelKolom.id);

    moveDeal.mutate({
      id: kaart.id,
      fase: nieuweFase,
      position: positionBetween(prev, next),
    });
  };

  return (
    <div className="hm-pipeline hm-view">
      <div className="hm-board__bar">
        <button
          className="hm-btn hm-btn--primary"
          onClick={() => router.push("/admin/pipeline?deal=nieuw")}
          type="button"
        >
          + Deal
        </button>
        <div className="hm-board__samenvatting">
          <b>{euro(totaal)}</b> · {gefilterd.length} deal
          {gefilterd.length === 1 ? "" : "s"}
          {gewogen > 0 && (
            <span title="Gewogen pipeline: som van bedrag × kans">
              gewogen {euro(Math.round(gewogen))}
            </span>
          )}
        </div>
        <div className="hm-board__bar-rechts">
          <input
            className="hm-board__zoek"
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op deal of organisatie…"
            type="search"
            value={zoek}
          />
          <select
            aria-label="Filter op eigenaar"
            className="hm-board__select"
            onChange={(e) => setEigenaarFilter(e.target.value)}
            value={eigenaarFilter}
          >
            <option value="alle">Iedereen</option>
            {[...eigenaren].map(([id, naam]) => (
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
      </div>

      {moveDeal.isError && (
        <p className="hm-pipeline__fout" role="alert">
          Verplaatsen mislukt — de kaart is teruggezet. Probeer het opnieuw.
        </p>
      )}

      <DragDropContext onDragEnd={onDragEnd} onDragStart={() => setSleept(true)}>
        <div className="hm-pipeline__board">
          {kolommen.map((kolom) => {
            const kolomTotaal = kolom.deals.reduce(
              (som, d) => som + (d.bedrag ?? 0),
              0,
            );
            return (
              <Droppable droppableId={kolom.id} key={kolom.id}>
                {(provided, snapshot) => (
                  <div
                    className={`hm-pipeline__kolom${snapshot.isDraggingOver ? " is-over" : ""}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <ColumnHeader
                      isBeheerder={isBeheerder}
                      kolom={kolom}
                      meta={`${euro(kolomTotaal)} · ${kolom.deals.length} deal${kolom.deals.length === 1 ? "" : "s"}`}
                      onRename={(id, naam) => renameStage.mutate({ id, naam })}
                    />
                    <div className="hm-pipeline__kaarten">
                      {kolom.deals.length === 0 && !snapshot.isDraggingOver && (
                        <p className="hm-pipeline__leeg">
                          Sleep een deal hierheen of maak er één.
                        </p>
                      )}
                      {kolom.deals.map((deal, index) => (
                        <Draggable
                          draggableId={String(deal.id)}
                          index={index}
                          key={deal.id}
                        >
                          {(p, kaartSnapshot) => {
                            const org = orgInfo(deal);
                            const contact = contactInfo(deal);
                            const eigenaar = eigenaarInfo(deal);
                            const bedrag = euro(deal.bedrag);
                            const kans =
                              typeof deal.kans === "number" ? deal.kans : null;
                            const signaal = kaartSignaal(deal, nu);
                            return (
                              <Link
                                className={`hm-card hm-card--hover hm-deal${kaartSnapshot.isDragging ? " is-dragging" : ""}${signaal.soort === "laat" ? " is-laat" : ""}`}
                                href={`/admin/pipeline?deal=${deal.id}`}
                                prefetch={false}
                                ref={p.innerRef}
                                {...p.draggableProps}
                                {...p.dragHandleProps}
                              >
                                <span className="hm-deal__top">
                                  <span className="hm-deal__tags">
                                    {(org?.tags ?? [])
                                      .slice(0, 3)
                                      .map((tag) => (
                                        <i
                                          key={tag}
                                          style={{
                                            background: avatarKleur(tag),
                                          }}
                                          title={tag}
                                        />
                                      ))}
                                  </span>
                                  <StatusStip signaal={signaal} />
                                </span>
                                <span className="hm-deal__title">
                                  {deal.titel}
                                </span>
                                {(org || contact) && (
                                  <span className="hm-deal__org">
                                    {org?.naam}
                                    {org && contact && " · "}
                                    {contact && (
                                      <span className="hm-deal__contact">
                                        {contact.naam}
                                      </span>
                                    )}
                                  </span>
                                )}
                                <span className="hm-deal__foot">
                                  <span className="hm-deal__amount">
                                    {bedrag ?? "—"}
                                  </span>
                                  {eigenaar && (
                                    <span
                                      className="hm-av hm-av--sm"
                                      style={{
                                        background: avatarKleur(eigenaar.id),
                                      }}
                                      title={`Eigenaar: ${eigenaar.naam}`}
                                    >
                                      {initialen(eigenaar.naam)}
                                    </span>
                                  )}
                                </span>
                                {kans !== null && (
                                  <span
                                    className="hm-meter hm-deal__kans"
                                    title={`Kans: ${kans}%`}
                                  >
                                    <i style={{ width: `${kans}%` }} />
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
                          ? "/admin/pipeline?deal=nieuw"
                          : `/admin/pipeline?deal=nieuw&fase=${kolom.id}`
                      }
                    >
                      + Deal
                    </Link>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>

        {/* Altijd gemonteerd: droppables mogen niet (un)mounten tijdens een drag */}
        <div className={`hm-dragbar${sleept ? " is-actief" : ""}`}>
            <Droppable droppableId={ACTIE_PRULLENBAK}>
              {(provided, snapshot) => (
                <div
                  className={`hm-dragbar__zone${snapshot.isDraggingOver ? " is-over" : ""}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <Trash2 size={15} strokeWidth={2.25} />
                  Verwijderen
                  <span style={{ display: "none" }}>{provided.placeholder}</span>
                </div>
              )}
            </Droppable>
            <Droppable droppableId={ACTIE_VERLOREN}>
              {(provided, snapshot) => (
                <div
                  className={`hm-dragbar__zone hm-dragbar__zone--verloren${snapshot.isDraggingOver ? " is-over" : ""}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  Verloren
                  <span style={{ display: "none" }}>{provided.placeholder}</span>
                </div>
              )}
            </Droppable>
            <Droppable droppableId={ACTIE_GEWONNEN}>
              {(provided, snapshot) => (
                <div
                  className={`hm-dragbar__zone hm-dragbar__zone--gewonnen${snapshot.isDraggingOver ? " is-over" : ""}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  Gewonnen
                  <span style={{ display: "none" }}>{provided.placeholder}</span>
                </div>
              )}
            </Droppable>
        </div>
      </DragDropContext>

      {kolommenOpen && (
        <ColumnsPanel
          aantalPerKolom={(id) =>
            alleDeals.filter((d) => {
              const ref = d.fase;
              const faseId = ref && typeof ref === "object" ? ref.id : ref;
              return String(faseId ?? "") === String(id);
            }).length
          }
          collectionSlug="deal-stages"
          isBeheerder={isBeheerder}
          itemNaam="fase"
          kaartNaam="deal"
          kolommen={(stagesQuery.data ?? []).map((s) => ({
            id: s.id,
            naam: s.naam,
            kleur: s.kleur,
            _order: s._order,
          }))}
          onClose={() => setKolommenOpen(false)}
          onFout={(melding) => setToast({ tekst: melding, soort: "fout" })}
          onGewijzigd={() => {
            qc.invalidateQueries({ queryKey: ["pipeline", "stages"] });
            qc.invalidateQueries({ queryKey: ["pipeline", "deals"] });
          }}
        />
      )}

      {verliesDeal && (
        <VerliesDialoog
          dealTitel={verliesDeal.titel}
          onAnnuleer={() => setVerliesDeal(null)}
          onBevestig={(reden) => {
            wijzigUitkomst.mutate({
              id: verliesDeal.id,
              data: { uitkomst: "verloren", verlorenReden: reden || null },
              melding: `Deal '${verliesDeal.titel}' als verloren gemarkeerd.`,
            });
            setVerliesDeal(null);
          }}
        />
      )}

      {/* DealPanel eerst: organisatie/contact stapelen er bovenop */}
      {dealParam && (
        <DealPanel
          dealId={dealParam}
          faseParam={searchParams.get("fase")}
          key={dealParam}
          nu={nu}
          onClose={() => router.push("/admin/pipeline")}
          onToast={setToast}
          stages={stagesQuery.data ?? []}
        />
      )}

      {organisatieParam && (
        <OrganisatiePanel
          key={`org-${organisatieParam}`}
          onClose={() =>
            router.push(
              dealParam
                ? `/admin/pipeline?deal=${dealParam}`
                : "/admin/pipeline",
            )
          }
          onToast={setToast}
          organisatieId={organisatieParam}
        />
      )}

      {contactParam && (
        <ContactPanel
          contactId={contactParam}
          key={`contact-${contactParam}`}
          onClose={() => {
            const p = new URLSearchParams();
            if (dealParam) p.set("deal", dealParam);
            if (organisatieParam) p.set("organisatie", organisatieParam);
            const qs = p.toString();
            router.push(qs ? `/admin/pipeline?${qs}` : "/admin/pipeline");
          }}
          onToast={setToast}
          standaardOrganisatie={organisatieParam ?? undefined}
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
