"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { crmApi } from "@/modules/crm/api";
import type { Toast } from "@/modules/crm/views/pipeline/PipelineBoard";
import { useMetParams } from "@/modules/crm/views/pipeline/RelatiePanelen";
import { VerliesDialoog } from "@/modules/crm/views/pipeline/VerliesDialoog";
import { RecordTijdlijn } from "@/modules/shared/components/RecordTijdlijn";
import { ReferentiesVeld } from "@/modules/shared/components/ReferentiesVeld";
import { avatarKleur, euro, initialen, naamVan } from "@/modules/shared/ui";
import type {
  Contact,
  Deal,
  DealStage,
  Organisation,
  User,
} from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

type Props = {
  /** Deal-id of "nieuw" (create-variant). */
  dealId: string;
  faseParam: string | null;
  nu: number;
  onClose: () => void;
  onToast: (toast: Toast) => void;
  stages: DealStage[];
};

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const data = (await res.json()) as { docs: T[] };
  return data.docs;
}

/** Sluit op Escape — panelen en dialogen horen toetsenbord-sluitbaar te zijn. */
function useEscape(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
}

function relId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    return String((value as { id: string | number }).id);
  }
  return String(value);
}

/* ── Create-variant ──────────────────────────────────────────────────── */

function NieuweDeal({
  faseParam,
  onClose,
  onToast,
  stages,
}: Pick<Props, "faseParam" | "onClose" | "onToast" | "stages">) {
  const qc = useQueryClient();
  const router = useRouter();
  const [titel, setTitel] = useState("");
  const [bedrag, setBedrag] = useState("");
  const [fase, setFase] = useState(faseParam ?? "");
  const [organisatie, setOrganisatie] = useState("");
  useEscape(onClose);

  const orgs = useQuery({
    queryKey: ["panel", "orgs"],
    queryFn: () =>
      fetchDocs<Organisation>("/api/organisations?limit=200&sort=naam&depth=0"),
  });

  const aanmaken = useMutation({
    mutationFn: () =>
      crmApi.createDeal({
        titel: titel.trim(),
        uitkomst: "open",
        bedrag: bedrag ? Number(bedrag) : null,
        fase: fase ? Number(fase) : null,
        organisatie: organisatie ? Number(organisatie) : null,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["pipeline", "deals"] });
      onToast({ tekst: `Deal '${res.doc.titel}' aangemaakt.`, soort: "ok" });
      router.replace(`/admin/pipeline?deal=${res.doc.id}`);
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
      <aside aria-label="Nieuwe deal" className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3>Nieuwe deal</h3>
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
                placeholder="Bijv. AICK-training najaar"
                required
                value={titel}
              />
            </label>
            <label>
              Bedrag (€)
              <input
                inputMode="numeric"
                min={0}
                onChange={(e) => setBedrag(e.target.value)}
                type="number"
                value={bedrag}
              />
            </label>
            <label>
              Fase
              <select onChange={(e) => setFase(e.target.value)} value={fase}>
                <option value="">Geen fase</option>
                {stages.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Organisatie
              <select
                onChange={(e) => setOrganisatie(e.target.value)}
                value={organisatie}
              >
                <option value="">—</option>
                {(orgs.data ?? []).map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="hm-btn hm-btn--primary"
              disabled={!titel.trim() || aanmaken.isPending}
              type="submit"
            >
              {aanmaken.isPending ? "Aanmaken…" : "Deal aanmaken"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

/* ── Detail-variant ──────────────────────────────────────────────────── */

function DealDetail({
  dealId,
  onClose,
  onToast,
  stages,
}: Pick<Props, "dealId" | "onClose" | "onToast" | "stages">) {
  const qc = useQueryClient();
  const [verliesOpen, setVerliesOpen] = useState(false);
  useEscape(() => {
    if (verliesOpen) setVerliesOpen(false);
    else onClose();
  });

  const dealQuery = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => crmApi.getDeal(dealId),
  });

  const orgs = useQuery({
    queryKey: ["panel", "orgs"],
    queryFn: () =>
      fetchDocs<Organisation>("/api/organisations?limit=200&sort=naam&depth=0"),
  });
  const contacten = useQuery({
    queryKey: ["panel", "contacten"],
    queryFn: () =>
      fetchDocs<Contact>("/api/contacts?limit=300&sort=naam&depth=0"),
  });
  const gebruikers = useQuery({
    queryKey: ["panel", "gebruikers"],
    queryFn: () => fetchDocs<User>("/api/users?limit=100&depth=0"),
  });
  const metParams = useMetParams();

  const opslaan = useMutation({
    mutationFn: (data: Partial<Deal>) => crmApi.updateDeal(Number(dealId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deal", dealId] });
      qc.invalidateQueries({ queryKey: ["pipeline", "deals"] });
      qc.invalidateQueries({ queryKey: ["deal-activiteiten", dealId] });
    },
    onError: () =>
      onToast({ tekst: "Opslaan mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const deal = dealQuery.data;

  if (dealQuery.isLoading) {
    return (
      <>
        <div aria-hidden className="hm-slideover__backdrop" onClick={onClose} role="presentation" />
        <aside className="hm-slideover hm-slideover--breed">
          <div className="hm-slideover__body">
            <p className="hm-empty">Deal laden…</p>
          </div>
        </aside>
      </>
    );
  }

  if (!deal) {
    return (
      <>
        <div aria-hidden className="hm-slideover__backdrop" onClick={onClose} role="presentation" />
        <aside className="hm-slideover hm-slideover--breed">
          <div className="hm-slideover__head">
            <h3>Deal niet gevonden</h3>
            <button aria-label="Sluiten" className="hm-slideover__close" onClick={onClose} type="button">
              <X size={18} />
            </button>
          </div>
          <div className="hm-slideover__body">
            <p className="hm-empty">
              Deze deal bestaat niet (meer) of je hebt er geen toegang toe.
            </p>
          </div>
        </aside>
      </>
    );
  }

  const isOpen = deal.uitkomst === "open";

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label={`Deal ${deal.titel}`}
        className="hm-slideover hm-slideover--breed"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <input
            className="hm-dealpanel__titel"
            defaultValue={deal.titel}
            key={`titel-${deal.updatedAt}`}
            onBlur={(e) => {
              const naam = e.target.value.trim();
              if (naam && naam !== deal.titel) opslaan.mutate({ titel: naam });
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

        <div className="hm-dealpanel__uitkomst">
          {isOpen ? (
            <>
              <button
                className="hm-btn hm-dealpanel__win"
                onClick={() => {
                  opslaan.mutate({ uitkomst: "gewonnen" });
                  onToast({
                    tekst: `Deal '${deal.titel}' gewonnen 🎉 — project wordt aangemaakt.`,
                    soort: "ok",
                  });
                }}
                type="button"
              >
                Gewonnen
              </button>
              <button
                className="hm-btn hm-btn--gevaar"
                onClick={() => setVerliesOpen(true)}
                type="button"
              >
                Verloren
              </button>
            </>
          ) : (
            <>
              <span
                className={`hm-pill ${deal.uitkomst === "gewonnen" ? "hm-pill--emerald" : "hm-pill--rose"}`}
              >
                {deal.uitkomst === "gewonnen" ? "Gewonnen" : "Verloren"}
              </span>
              {deal.uitkomst === "verloren" && deal.verlorenReden && (
                <span className="hm-dealpanel__reden">
                  Reden: {deal.verlorenReden}
                </span>
              )}
              <button
                className="hm-btn hm-btn--ghost"
                onClick={() => opslaan.mutate({ uitkomst: "open" })}
                type="button"
              >
                Heropenen
              </button>
            </>
          )}
        </div>

        <div className="hm-slideover__body hm-dealpanel__body">
          <div className="hm-dealpanel__velden">
            <label>
              Bedrag (€)
              <input
                defaultValue={deal.bedrag ?? ""}
                inputMode="numeric"
                key={`bedrag-${deal.updatedAt}`}
                min={0}
                onBlur={(e) => {
                  const nieuw = e.target.value === "" ? null : Number(e.target.value);
                  if (nieuw !== (deal.bedrag ?? null)) {
                    opslaan.mutate({ bedrag: nieuw });
                  }
                }}
                type="number"
              />
            </label>
            <label>
              Kans (%)
              <input
                defaultValue={deal.kans ?? ""}
                inputMode="numeric"
                key={`kans-${deal.updatedAt}`}
                max={100}
                min={0}
                onBlur={(e) => {
                  const nieuw = e.target.value === "" ? null : Number(e.target.value);
                  if (nieuw !== (deal.kans ?? null)) opslaan.mutate({ kans: nieuw });
                }}
                type="number"
              />
            </label>
            <label>
              Verwachte sluitdatum
              <input
                defaultValue={deal.verwachteSluitdatum?.slice(0, 10) ?? ""}
                key={`sluit-${deal.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value
                    ? new Date(`${e.target.value}T12:00:00`).toISOString()
                    : null;
                  if (nieuw !== (deal.verwachteSluitdatum ?? null)) {
                    opslaan.mutate({ verwachteSluitdatum: nieuw });
                  }
                }}
                type="date"
              />
            </label>
            <label>
              Fase
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    fase: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(deal.fase)}
              >
                <option value="">Geen fase</option>
                {stages.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Organisatie
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    organisatie: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(deal.organisatie)}
              >
                <option value="">—</option>
                {(orgs.data ?? []).map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.naam}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Contactpersoon
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    contactpersoon: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                value={relId(deal.contactpersoon)}
              >
                <option value="">—</option>
                {/* Gefilterd op de gekozen organisatie (Pipedrive-gedrag);
                    de huidige koppeling blijft altijd zichtbaar */}
                {(contacten.data ?? [])
                  .filter(
                    (c) =>
                      !relId(deal.organisatie) ||
                      relId(c.organisatie) === relId(deal.organisatie) ||
                      String(c.id) === relId(deal.contactpersoon),
                  )
                  .map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.naam ?? c.email}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Eigenaar
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    eigenaar: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(deal.eigenaar)}
              >
                <option value="">—</option>
                {(gebruikers.data ?? []).map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>

            {deal.bedrag != null && deal.kans != null && (
              <p className="hm-dealpanel__gewogen">
                Gewogen waarde:{" "}
                <b>{euro(Math.round((deal.bedrag * deal.kans) / 100))}</b>
              </p>
            )}

            {deal.eigenaar && typeof deal.eigenaar === "object" && (
              <p className="hm-dealpanel__eigenaar">
                <span
                  className="hm-av hm-av--sm"
                  style={{ background: avatarKleur(deal.eigenaar.id) }}
                >
                  {initialen(deal.eigenaar.name)}
                </span>
                {deal.eigenaar.name}
              </p>
            )}

            {((deal.organisatie && typeof deal.organisatie === "object") ||
              (deal.contactpersoon &&
                typeof deal.contactpersoon === "object")) && (
              <div className="hm-relatie__blok">
                <h4>Gekoppeld</h4>
                {deal.organisatie && typeof deal.organisatie === "object" && (
                  <Link
                    href={metParams({
                      organisatie: String(deal.organisatie.id),
                    })}
                    replace
                  >
                    {deal.organisatie.naam}
                    <span>organisatie</span>
                  </Link>
                )}
                {deal.contactpersoon &&
                  typeof deal.contactpersoon === "object" && (
                    <Link
                      href={metParams({
                        contact: String(deal.contactpersoon.id),
                      })}
                      replace
                    >
                      {deal.contactpersoon.naam ?? deal.contactpersoon.email}
                      <span>
                        {[
                          naamVan(deal.contactpersoon.functie),
                          deal.contactpersoon.email,
                          (deal.contactpersoon.telefoons ?? [])[0],
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </Link>
                  )}
              </div>
            )}

            <ReferentiesVeld
              onWijzig={(ids) => opslaan.mutate({ referenties: ids })}
              waarde={deal.referenties}
            />

            <Link
              className="hm-dealpanel__editorlink"
              href={`/admin/collections/deals/${deal.id}`}
            >
              <ExternalLink size={13} strokeWidth={2} />
              Openen in volledige editor
            </Link>
          </div>

          <RecordTijdlijn
            onFout={(m) => onToast({ tekst: m, soort: "fout" })}
            recordId={dealId}
            relationTo="deals"
          />
        </div>
      </aside>

      {verliesOpen && (
        <VerliesDialoog
          dealTitel={deal.titel}
          onAnnuleer={() => setVerliesOpen(false)}
          onBevestig={(reden) => {
            opslaan.mutate({ uitkomst: "verloren", verlorenReden: reden || null });
            setVerliesOpen(false);
            onToast({
              tekst: `Deal '${deal.titel}' als verloren gemarkeerd.`,
              soort: "ok",
            });
          }}
        />
      )}
    </>
  );
}

/** Deal-slideover: detail met inline edit + tijdlijn, of create-variant. */
export function DealPanel(props: Props) {
  if (props.dealId === "nieuw") {
    return (
      <NieuweDeal
        faseParam={props.faseParam}
        onClose={props.onClose}
        onToast={props.onToast}
        stages={props.stages}
      />
    );
  }
  return (
    <DealDetail
      dealId={props.dealId}
      onClose={props.onClose}
      onToast={props.onToast}
      stages={props.stages}
    />
  );
}
