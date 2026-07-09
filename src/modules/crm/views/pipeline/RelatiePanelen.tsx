"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { LijstKeuze } from "@/modules/shared/components/LijstKeuze";
import { RecordTijdlijn } from "@/modules/shared/components/RecordTijdlijn";
import { lijstVan, TagsVeld } from "@/modules/shared/components/TagsVeld";
import { ExtraVeldenSectie } from "@/modules/crm/views/pipeline/ExtraVelden";
import { euro, naamVan } from "@/modules/shared/ui";
import type {
  Contact,
  Deal,
  Functie,
  Organisation,
  Sector,
  User,
} from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";

export type PanelToast = { tekst: string; soort: "ok" | "fout" };

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return ((await res.json()) as { docs: T[] }).docs;
}

async function getDoc<T>(slug: string, id: string): Promise<T> {
  const res = await fetch(`/api/${slug}/${id}?depth=1`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET ${slug}/${id} → ${res.status}`);
  return (await res.json()) as T;
}

async function patchDoc<T>(
  slug: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`/api/${slug}/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PATCH ${slug}/${id} → ${res.status}`);
  return (await res.json()) as T;
}

async function postDoc<T>(
  slug: string,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`/api/${slug}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST ${slug} → ${res.status}`);
  return ((await res.json()) as { doc: T }).doc;
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

function useGebruikers() {
  return useQuery({
    queryKey: ["panel", "gebruikers"],
    queryFn: () => fetchDocs<User>("/api/users?limit=100&depth=0"),
  });
}

function useSectoren() {
  return useQuery({
    queryKey: ["lijst", "sectoren"],
    queryFn: () =>
      fetchDocs<Sector>("/api/sectoren?limit=500&sort=naam&depth=0"),
  });
}

function useFuncties() {
  return useQuery({
    queryKey: ["lijst", "functies"],
    queryFn: () =>
      fetchDocs<Functie>("/api/functies?limit=500&sort=naam&depth=0"),
  });
}


/** Stel een href samen op de huidige route met gewijzigde query-params
    (null = param verwijderen) — houdt tab/deal/organisatie intact. */
export function useMetParams() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (wijzig: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(wijzig)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
}

type Adres = NonNullable<Organisation["bezoekadres"]>;

/** Vijf adres-inputs met autosave per veld (partial-group PATCH). */
function AdresVelden({
  adres,
  onOpslaan,
  prefix,
  updatedAt,
}: {
  adres: Adres | null | undefined;
  onOpslaan: (deel: Record<string, string | null>) => void;
  prefix: string;
  updatedAt: string;
}) {
  const veld = (naam: keyof Adres & string, label: string) => (
    <label>
      {label}
      <input
        defaultValue={(adres?.[naam] as string | null) ?? ""}
        key={`${prefix}-${naam}-${updatedAt}`}
        onBlur={(e) => {
          const nieuw = e.target.value.trim() || null;
          if (nieuw !== ((adres?.[naam] as string | null) ?? null)) {
            onOpslaan({ [naam]: nieuw });
          }
        }}
      />
    </label>
  );
  return (
    <div className="hm-adres">
      {veld("straat", "Straat")}
      {veld("huisnummer", "Huisnummer")}
      {veld("postcode", "Postcode")}
      {veld("plaats", "Plaats")}
      {veld("land", "Land")}
    </div>
  );
}

/* ═══ Organisatie-paneel ═══════════════════════════════════════════════ */

type OrgProps = {
  organisatieId: string;
  onClose: () => void;
  onToast: (toast: PanelToast) => void;
};

function NieuweOrganisatie({ onClose, onToast }: Omit<OrgProps, "organisatieId">) {
  const qc = useQueryClient();
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [website, setWebsite] = useState("");
  useEscape(onClose);

  const aanmaken = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/organisations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naam: naam.trim(),
          website: website.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(`POST organisations → ${res.status}`);
      return ((await res.json()) as { doc: Organisation }).doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["panel", "orgs"] });
      qc.invalidateQueries({ queryKey: ["relaties", "organisaties"] });
      onToast({ tekst: `Organisatie '${doc.naam}' aangemaakt.`, soort: "ok" });
      router.replace(`${window.location.pathname}?organisatie=${doc.id}`);
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
      <aside aria-label="Nieuwe organisatie" className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3>Nieuwe organisatie</h3>
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
              Website
              <input
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://…"
                type="url"
                value={website}
              />
            </label>
            <button
              className="hm-btn hm-btn--primary"
              disabled={!naam.trim() || aanmaken.isPending}
              type="submit"
            >
              {aanmaken.isPending ? "Aanmaken…" : "Organisatie aanmaken"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function OrganisatieDetail({ onClose, onToast, organisatieId }: OrgProps) {
  const qc = useQueryClient();
  const router = useRouter();
  const metParams = useMetParams();
  const gebruikers = useGebruikers();
  useEscape(onClose);

  const orgQuery = useQuery({
    queryKey: ["organisatie", organisatieId],
    queryFn: () => getDoc<Organisation>("organisations", organisatieId),
  });

  const dealsQuery = useQuery({
    queryKey: ["organisatie", organisatieId, "deals"],
    queryFn: () =>
      fetchDocs<Deal>(
        `/api/deals?where[organisatie][equals]=${organisatieId}&sort=-updatedAt&limit=20&depth=0`,
      ),
  });

  const contactenQuery = useQuery({
    queryKey: ["organisatie", organisatieId, "contacten"],
    queryFn: () =>
      fetchDocs<Contact>(
        `/api/contacts?where[organisatie][equals]=${organisatieId}&limit=50&depth=1`,
      ),
  });
  const sectoren = useSectoren();

  const nieuweSector = useMutation({
    mutationFn: async (naam: string) => {
      const doc = await postDoc<Sector>("sectoren", { naam, kleur: "grijs" });
      await patchDoc("organisations", organisatieId, { sector: doc.id });
      return doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["lijst", "sectoren"] });
      qc.invalidateQueries({ queryKey: ["organisatie", organisatieId] });
      qc.invalidateQueries({ queryKey: ["relaties", "organisaties"] });
      onToast({ tekst: `Sector '${doc.naam}' aangemaakt.`, soort: "ok" });
    },
    onError: () =>
      onToast({ tekst: "Sector aanmaken mislukt.", soort: "fout" }),
  });

  const alleContacten = useQuery({
    queryKey: ["panel", "contacten"],
    queryFn: () =>
      fetchDocs<Contact>("/api/contacts?limit=300&sort=naam&depth=0"),
  });

  const invalideerContacten = () => {
    qc.invalidateQueries({ queryKey: ["organisatie", organisatieId, "contacten"] });
    qc.invalidateQueries({ queryKey: ["panel", "contacten"] });
    qc.invalidateQueries({ queryKey: ["relaties", "contacten"] });
  };

  const contactKoppelen = useMutation({
    mutationFn: (contactId: string) =>
      patchDoc("contacts", contactId, { organisatie: Number(organisatieId) }),
    onSuccess: invalideerContacten,
    onError: () =>
      onToast({ tekst: "Koppelen mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const contactOntkoppelen = useMutation({
    mutationFn: (contactId: string) =>
      patchDoc("contacts", contactId, { organisatie: null }),
    onSuccess: invalideerContacten,
    onError: () =>
      onToast({
        tekst: "Ontkoppelen mislukt — probeer het opnieuw.",
        soort: "fout",
      }),
  });

  const opslaan = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      patchDoc("organisations", organisatieId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organisatie", organisatieId] });
      qc.invalidateQueries({ queryKey: ["panel", "orgs"] });
      qc.invalidateQueries({ queryKey: ["relaties", "organisaties"] });
      qc.invalidateQueries({ queryKey: ["pipeline", "deals"] });
    },
    onError: () =>
      onToast({ tekst: "Opslaan mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const maakDeal = useMutation({
    mutationFn: async () => {
      const huidig = orgQuery.data;
      const deal = await postDoc<Deal>("deals", {
        titel: `${huidig?.naam ?? "Relatie"} — nieuw`,
        uitkomst: "open",
        organisatie: Number(organisatieId),
      });
      // Pipedrive-kwalificatie: prospect wordt lead zodra er een deal ontstaat
      if ((huidig?.relatietype ?? "prospect") === "prospect") {
        await patchDoc("organisations", organisatieId, { relatietype: "lead" });
      }
      return deal;
    },
    onSuccess: (deal) => {
      qc.invalidateQueries({ queryKey: ["organisatie", organisatieId] });
      qc.invalidateQueries({ queryKey: ["relaties", "organisaties"] });
      qc.invalidateQueries({ queryKey: ["pipeline", "deals"] });
      onToast({ tekst: `Deal '${deal.titel}' aangemaakt.`, soort: "ok" });
      router.replace(`/admin/pipeline?deal=${deal.id}`);
    },
    onError: () =>
      onToast({
        tekst: "Deal aanmaken mislukt — probeer het opnieuw.",
        soort: "fout",
      }),
  });

  const org = orgQuery.data;
  if (!org) {
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
              {orgQuery.isLoading ? "Laden…" : "Niet gevonden."}
            </p>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label={org.naam}
        className="hm-slideover hm-slideover--breed"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <input
            className="hm-dealpanel__titel"
            defaultValue={org.naam}
            key={`naam-${org.updatedAt}`}
            onBlur={(e) => {
              const naam = e.target.value.trim();
              if (naam && naam !== org.naam) opslaan.mutate({ naam });
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
              Relatietype
              <select
                onChange={(e) => opslaan.mutate({ relatietype: e.target.value })}
                value={org.relatietype ?? "prospect"}
              >
                <option value="prospect">Prospect</option>
                <option value="lead">Lead</option>
                <option value="klant">Klant</option>
                <option value="partner">Partner</option>
                <option value="overig">Overig</option>
              </select>
            </label>
            <label>
              Doelgroep
              <select
                onChange={(e) =>
                  opslaan.mutate({ doelgroep: e.target.value || null })
                }
                value={org.doelgroep ?? ""}
              >
                <option value="">—</option>
                <option value="zzp">ZZP</option>
                <option value="mkb">MKB</option>
                <option value="aanbieder">Aanbieder</option>
                <option value="overig">Overig</option>
              </select>
            </label>
            <label>
              Risicoklasse
              <select
                onChange={(e) =>
                  opslaan.mutate({ risicoklasse: e.target.value || null })
                }
                value={org.risicoklasse ?? ""}
              >
                <option value="">—</option>
                <option value="hoog">Hoog risico</option>
                <option value="verboden">Verboden</option>
                <option value="geen">Geen risico</option>
              </select>
            </label>
            <label>
              Opvolgen op
              <input
                defaultValue={org.opvolgenOp?.slice(0, 10) ?? ""}
                key={`opvolg-${org.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value
                    ? new Date(`${e.target.value}T12:00:00`).toISOString()
                    : null;
                  if (nieuw !== (org.opvolgenOp ?? null)) {
                    opslaan.mutate({ opvolgenOp: nieuw });
                  }
                }}
                type="date"
              />
            </label>
            <div className="hm-veld">
              Tags
              <TagsVeld
                onWijzig={(tags) => opslaan.mutate({ tags })}
                tags={lijstVan(org.tags)}
              />
            </div>
            <label>
              Sector
              <LijstKeuze
                key={`sector-${org.updatedAt}`}
                onKies={(id) => opslaan.mutate({ sector: id })}
                onNieuw={(naam) => nieuweSector.mutate(naam)}
                opties={(sectoren.data ?? []).map((s) => ({
                  id: s.id,
                  naam: s.naam,
                }))}
                waarde={naamVan(org.sector) ?? ""}
              />
            </label>
            <label>
              Website
              <input
                defaultValue={org.website ?? ""}
                key={`website-${org.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (org.website ?? null)) {
                    opslaan.mutate({ website: nieuw });
                  }
                }}
                placeholder="https://…"
                type="url"
              />
            </label>
            <label>
              LinkedIn
              <input
                defaultValue={org.linkedin ?? ""}
                key={`linkedin-${org.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (org.linkedin ?? null)) {
                    opslaan.mutate({ linkedin: nieuw });
                  }
                }}
                placeholder="https://linkedin.com/company/…"
                type="url"
              />
            </label>
            <label>
              Eigenaar
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    eigenaar: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(org.eigenaar)}
              >
                <option value="">—</option>
                {(gebruikers.data ?? []).map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notities
              <textarea
                defaultValue={org.notities ?? ""}
                key={`notities-${org.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (org.notities ?? null)) {
                    opslaan.mutate({ notities: nieuw });
                  }
                }}
                rows={4}
              />
            </label>

            <details className="hm-sectie">
              <summary>Adressen</summary>
              <div className="hm-sectie__body">
                <h5>Bezoekadres</h5>
                <AdresVelden
                  adres={org.bezoekadres}
                  onOpslaan={(deel) => opslaan.mutate({ bezoekadres: deel })}
                  prefix="bezoek"
                  updatedAt={org.updatedAt}
                />
                <label className="hm-check">
                  <input
                    checked={org.postadresZelfde ?? true}
                    onChange={(e) =>
                      opslaan.mutate({ postadresZelfde: e.target.checked })
                    }
                    type="checkbox"
                  />
                  Postadres gelijk aan bezoekadres
                </label>
                {!(org.postadresZelfde ?? true) && (
                  <>
                    <h5>Postadres</h5>
                    <AdresVelden
                      adres={org.postadres}
                      onOpslaan={(deel) => opslaan.mutate({ postadres: deel })}
                      prefix="post"
                      updatedAt={org.updatedAt}
                    />
                  </>
                )}
                <label className="hm-check">
                  <input
                    checked={org.factuuradresZelfde ?? true}
                    onChange={(e) =>
                      opslaan.mutate({ factuuradresZelfde: e.target.checked })
                    }
                    type="checkbox"
                  />
                  Factuuradres gelijk aan postadres
                </label>
                {!(org.factuuradresZelfde ?? true) && (
                  <>
                    <h5>Factuuradres</h5>
                    <AdresVelden
                      adres={org.factuuradres}
                      onOpslaan={(deel) => opslaan.mutate({ factuuradres: deel })}
                      prefix="factuur"
                      updatedAt={org.updatedAt}
                    />
                  </>
                )}
              </div>
            </details>

            <details className="hm-sectie">
              <summary>Facturatie</summary>
              <div className="hm-sectie__body">
                <div className="hm-adres">
                  {(
                    [
                      ["kvkNummer", "KvK-nummer"],
                      ["btwNummer", "BTW-nummer"],
                      ["iban", "IBAN"],
                      ["tenaamstelling", "Tenaamstelling"],
                      ["factuurEmail", "Factuur-e-mail"],
                    ] as const
                  ).map(([naam, label]) => (
                    <label key={naam}>
                      {label}
                      <input
                        defaultValue={org.facturatie?.[naam] ?? ""}
                        key={`fact-${naam}-${org.updatedAt}`}
                        onBlur={(e) => {
                          const nieuw = e.target.value.trim() || null;
                          if (nieuw !== (org.facturatie?.[naam] ?? null)) {
                            opslaan.mutate({ facturatie: { [naam]: nieuw } });
                          }
                        }}
                      />
                    </label>
                  ))}
                  <label>
                    Betaaltermijn (dagen)
                    <input
                      defaultValue={org.facturatie?.betaaltermijnDagen ?? 30}
                      key={`fact-termijn-${org.updatedAt}`}
                      min={0}
                      onBlur={(e) => {
                        const nieuw =
                          e.target.value === "" ? null : Number(e.target.value);
                        if (nieuw !== (org.facturatie?.betaaltermijnDagen ?? null)) {
                          opslaan.mutate({
                            facturatie: { betaaltermijnDagen: nieuw },
                          });
                        }
                      }}
                      type="number"
                    />
                  </label>
                </div>
              </div>
            </details>

            <ExtraVeldenSectie
              doel="organisaties"
              onOpslaan={(extraVelden) => opslaan.mutate({ extraVelden })}
              updatedAt={org.updatedAt}
              waarden={(org.extraVelden ?? {}) as Record<string, unknown>}
            />

            <div className="hm-relatie__blok">
              <h4>Deals ({(dealsQuery.data ?? []).length})</h4>
              {(dealsQuery.data ?? []).map((deal) => (
                <Link
                  href={`/admin/pipeline?deal=${deal.id}`}
                  key={deal.id}
                  replace
                >
                  {deal.titel}
                  <span>
                    {deal.uitkomst}
                    {deal.bedrag != null ? ` · ${euro(deal.bedrag)}` : ""}
                  </span>
                </Link>
              ))}
              <button
                className="hm-btn"
                disabled={maakDeal.isPending}
                onClick={() => maakDeal.mutate()}
                type="button"
              >
                {maakDeal.isPending
                  ? "Deal aanmaken…"
                  : "+ Maak deal van deze relatie"}
              </button>
            </div>

            <div className="hm-relatie__blok">
              <h4>Contactpersonen ({(contactenQuery.data ?? []).length})</h4>
              {(contactenQuery.data ?? []).map((c) => (
                <div className="hm-relatie__rij" key={c.id}>
                  <Link
                    href={metParams({
                      organisatie: organisatieId,
                      contact: String(c.id),
                    })}
                    replace
                  >
                    {c.naam ?? c.email}
                    <span>{naamVan(c.functie) ?? ""}</span>
                  </Link>
                  <button
                    aria-label={`${c.naam ?? c.email} ontkoppelen`}
                    className="hm-relatie__ontkoppel"
                    disabled={contactOntkoppelen.isPending}
                    onClick={() => contactOntkoppelen.mutate(String(c.id))}
                    title="Ontkoppelen van deze organisatie"
                    type="button"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                className="hm-btn"
                onClick={() =>
                  router.replace(
                    metParams({ organisatie: organisatieId, contact: "nieuw" }),
                  )
                }
                type="button"
              >
                + Nieuw contactpersoon
              </button>
              {(alleContacten.data ?? []).some(
                (c) => relId(c.organisatie) !== organisatieId,
              ) && (
                <select
                  aria-label="Koppel bestaande contactpersoon"
                  className="hm-relatie__koppel"
                  disabled={contactKoppelen.isPending}
                  onChange={(e) => {
                    if (e.target.value) contactKoppelen.mutate(e.target.value);
                  }}
                  value=""
                >
                  <option value="">Koppel bestaande contactpersoon…</option>
                  {(alleContacten.data ?? [])
                    .filter((c) => relId(c.organisatie) !== organisatieId)
                    .map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.naam ?? c.email}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <Link
              className="hm-dealpanel__editorlink"
              href={`/admin/collections/organisations/${org.id}`}
            >
              <ExternalLink size={13} strokeWidth={2} />
              Openen in volledige editor
            </Link>
          </div>

          <RecordTijdlijn
            onFout={(m) => onToast({ tekst: m, soort: "fout" })}
            recordId={organisatieId}
            relationTo="organisations"
          />
        </div>
      </aside>
    </>
  );
}

export function OrganisatiePanel(props: OrgProps) {
  if (props.organisatieId === "nieuw") {
    return <NieuweOrganisatie onClose={props.onClose} onToast={props.onToast} />;
  }
  return <OrganisatieDetail {...props} />;
}

/* ═══ Contact-paneel ═══════════════════════════════════════════════════ */

type ContactProps = {
  contactId: string;
  onClose: () => void;
  onToast: (toast: PanelToast) => void;
  /** Vooringevulde organisatie bij aanmaken vanuit het organisatiepaneel. */
  standaardOrganisatie?: string;
};

function NieuwContact({
  onClose,
  onToast,
  standaardOrganisatie,
}: Omit<ContactProps, "contactId">) {
  const qc = useQueryClient();
  const router = useRouter();
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [organisatie, setOrganisatie] = useState(standaardOrganisatie ?? "");
  useEscape(onClose);

  const orgs = useQuery({
    queryKey: ["panel", "orgs"],
    queryFn: () =>
      fetchDocs<Organisation>("/api/organisations?limit=200&sort=naam&depth=0"),
  });

  const aanmaken = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/contacts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voornaam: voornaam.trim(),
          achternaam: achternaam.trim() || null,
          email: email.trim(),
          organisatie: organisatie ? Number(organisatie) : null,
        }),
      });
      if (!res.ok) throw new Error(`POST contacts → ${res.status}`);
      return ((await res.json()) as { doc: Contact }).doc;
    },
    onSuccess: (doc) => {
      onToast({
        tekst: `Contact '${doc.naam ?? doc.email}' aangemaakt.`,
        soort: "ok",
      });
      qc.invalidateQueries({ queryKey: ["panel", "contacten"] });
      qc.invalidateQueries({ queryKey: ["relaties", "contacten"] });
      qc.invalidateQueries({ queryKey: ["organisatie"] });
      // Behoud bestaande params (tab/organisatie) zodat het contact
      // gestapeld op het organisatiepaneel opent.
      const p = new URLSearchParams(window.location.search);
      p.set("contact", String(doc.id));
      router.replace(`${window.location.pathname}?${p.toString()}`);
    },
    onError: () =>
      onToast({
        tekst: "Aanmaken mislukt — voornaam en uniek e-mailadres zijn verplicht.",
        soort: "fout",
      }),
  });

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside aria-label="Nieuw contact" className="hm-slideover" role="dialog">
        <div className="hm-slideover__head">
          <h3>Nieuw contactpersoon</h3>
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
              if (voornaam.trim() && email.trim()) aanmaken.mutate();
            }}
          >
            <label>
              Voornaam *
              <input
                autoFocus
                onChange={(e) => setVoornaam(e.target.value)}
                required
                value={voornaam}
              />
            </label>
            <label>
              Achternaam
              <input
                onChange={(e) => setAchternaam(e.target.value)}
                value={achternaam}
              />
            </label>
            <label>
              E-mail *
              <input
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
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
              disabled={!voornaam.trim() || !email.trim() || aanmaken.isPending}
              type="submit"
            >
              {aanmaken.isPending ? "Aanmaken…" : "Contact aanmaken"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function ContactDetail({ contactId, onClose, onToast }: ContactProps) {
  const qc = useQueryClient();
  const router = useRouter();
  const gebruikers = useGebruikers();
  useEscape(onClose);

  const contactQuery = useQuery({
    queryKey: ["contact", contactId],
    queryFn: () => getDoc<Contact>("contacts", contactId),
  });

  const orgs = useQuery({
    queryKey: ["panel", "orgs"],
    queryFn: () =>
      fetchDocs<Organisation>("/api/organisations?limit=200&sort=naam&depth=0"),
  });
  const functies = useFuncties();

  const nieuweFunctie = useMutation({
    mutationFn: async (naam: string) => {
      const doc = await postDoc<Functie>("functies", { naam, kleur: "grijs" });
      await patchDoc("contacts", contactId, { functie: doc.id });
      return doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["lijst", "functies"] });
      qc.invalidateQueries({ queryKey: ["contact", contactId] });
      qc.invalidateQueries({ queryKey: ["relaties", "contacten"] });
      qc.invalidateQueries({ queryKey: ["organisatie"] });
      onToast({ tekst: `Functie '${doc.naam}' aangemaakt.`, soort: "ok" });
    },
    onError: () =>
      onToast({ tekst: "Functie aanmaken mislukt.", soort: "fout" }),
  });

  const opslaan = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      patchDoc("contacts", contactId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact", contactId] });
      qc.invalidateQueries({ queryKey: ["panel", "contacten"] });
      qc.invalidateQueries({ queryKey: ["relaties", "contacten"] });
      qc.invalidateQueries({ queryKey: ["organisatie"] });
    },
    onError: () =>
      onToast({ tekst: "Opslaan mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const maakDeal = useMutation({
    mutationFn: async () => {
      const huidig = contactQuery.data;
      const orgId = relId(huidig?.organisatie);
      const orgNaam =
        huidig?.organisatie && typeof huidig.organisatie === "object"
          ? huidig.organisatie.naam
          : null;
      const deal = await postDoc<Deal>("deals", {
        titel: `${orgNaam ?? huidig?.naam ?? huidig?.email ?? "Relatie"} — nieuw`,
        uitkomst: "open",
        contactpersoon: Number(contactId),
        organisatie: orgId ? Number(orgId) : null,
      });
      // Pipedrive-kwalificatie: prospect wordt lead zodra er een deal ontstaat
      if ((huidig?.relatietype ?? "prospect") === "prospect") {
        await patchDoc("contacts", contactId, { relatietype: "lead" });
      }
      return deal;
    },
    onSuccess: (deal) => {
      qc.invalidateQueries({ queryKey: ["contact", contactId] });
      qc.invalidateQueries({ queryKey: ["relaties", "contacten"] });
      qc.invalidateQueries({ queryKey: ["pipeline", "deals"] });
      onToast({ tekst: `Deal '${deal.titel}' aangemaakt.`, soort: "ok" });
      router.replace(`/admin/pipeline?deal=${deal.id}`);
    },
    onError: () =>
      onToast({
        tekst: "Deal aanmaken mislukt — probeer het opnieuw.",
        soort: "fout",
      }),
  });

  const contact = contactQuery.data;
  if (!contact) {
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
              {contactQuery.isLoading ? "Laden…" : "Niet gevonden."}
            </p>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      <div
        aria-hidden
        className="hm-slideover__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <aside
        aria-label={contact.naam ?? contact.email}
        className="hm-slideover hm-slideover--breed"
        role="dialog"
      >
        <div className="hm-slideover__head">
          <h3>{contact.naam ?? contact.email}</h3>
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
              Voornaam
              <input
                defaultValue={contact.voornaam}
                key={`vn-${contact.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim();
                  if (nieuw && nieuw !== contact.voornaam) {
                    opslaan.mutate({ voornaam: nieuw });
                  }
                }}
              />
            </label>
            <label>
              Achternaam
              <input
                defaultValue={contact.achternaam ?? ""}
                key={`an-${contact.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (contact.achternaam ?? null)) {
                    opslaan.mutate({ achternaam: nieuw });
                  }
                }}
              />
            </label>
            <label>
              E-mail
              <input
                defaultValue={contact.email}
                key={`em-${contact.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim();
                  if (nieuw && nieuw !== contact.email) {
                    opslaan.mutate({ email: nieuw });
                  }
                }}
                type="email"
              />
            </label>
            <div className="hm-veld">
              Telefoonnummers
              <TagsVeld
                onWijzig={(telefoons) => opslaan.mutate({ telefoons })}
                placeholder="Nummer + Enter…"
                tags={lijstVan(contact.telefoons)}
              />
            </div>
            <div className="hm-veld">
              Extra e-mailadressen
              <TagsVeld
                onWijzig={(extraEmails) => opslaan.mutate({ extraEmails })}
                placeholder="E-mail + Enter…"
                tags={lijstVan(contact.extraEmails)}
              />
            </div>
            <label>
              Relatietype
              <select
                onChange={(e) => opslaan.mutate({ relatietype: e.target.value })}
                value={contact.relatietype ?? "prospect"}
              >
                <option value="prospect">Prospect</option>
                <option value="lead">Lead</option>
                <option value="klant">Klant</option>
                <option value="partner">Partner</option>
                <option value="overig">Overig</option>
              </select>
            </label>
            <label>
              Doelgroep
              <select
                onChange={(e) =>
                  opslaan.mutate({ doelgroep: e.target.value || null })
                }
                value={contact.doelgroep ?? ""}
              >
                <option value="">—</option>
                <option value="zzp">ZZP</option>
                <option value="mkb">MKB</option>
                <option value="aanbieder">Aanbieder</option>
                <option value="overig">Overig</option>
              </select>
            </label>
            <label>
              Risicoklasse
              <select
                onChange={(e) =>
                  opslaan.mutate({ risicoklasse: e.target.value || null })
                }
                value={contact.risicoklasse ?? ""}
              >
                <option value="">—</option>
                <option value="hoog">Hoog risico</option>
                <option value="verboden">Verboden</option>
                <option value="geen">Geen risico</option>
              </select>
            </label>
            <label>
              Opvolgen op
              <input
                defaultValue={contact.opvolgenOp?.slice(0, 10) ?? ""}
                key={`opvolg-${contact.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value
                    ? new Date(`${e.target.value}T12:00:00`).toISOString()
                    : null;
                  if (nieuw !== (contact.opvolgenOp ?? null)) {
                    opslaan.mutate({ opvolgenOp: nieuw });
                  }
                }}
                type="date"
              />
            </label>
            <div className="hm-veld">
              Tags
              <TagsVeld
                onWijzig={(tags) => opslaan.mutate({ tags })}
                tags={lijstVan(contact.tags)}
              />
            </div>
            <label>
              Functie
              <LijstKeuze
                key={`fu-${contact.updatedAt}`}
                onKies={(id) => opslaan.mutate({ functie: id })}
                onNieuw={(naam) => nieuweFunctie.mutate(naam)}
                opties={(functies.data ?? []).map((f) => ({
                  id: f.id,
                  naam: f.naam,
                }))}
                waarde={naamVan(contact.functie) ?? ""}
              />
            </label>
            <label>
              Organisatie
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    organisatie: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(contact.organisatie)}
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
              Bron
              <input
                defaultValue={contact.bron ?? ""}
                key={`br-${contact.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (contact.bron ?? null)) {
                    opslaan.mutate({ bron: nieuw });
                  }
                }}
                placeholder="Bijv. LinkedIn, referral…"
              />
            </label>
            <label>
              Eigenaar
              <select
                onChange={(e) =>
                  opslaan.mutate({
                    eigenaar: e.target.value ? Number(e.target.value) : null,
                  })
                }
                value={relId(contact.eigenaar)}
              >
                <option value="">—</option>
                {(gebruikers.data ?? []).map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>

            <ExtraVeldenSectie
              doel="contacten"
              onOpslaan={(extraVelden) => opslaan.mutate({ extraVelden })}
              updatedAt={contact.updatedAt}
              waarden={(contact.extraVelden ?? {}) as Record<string, unknown>}
            />

            <div className="hm-relatie__blok">
              <button
                className="hm-btn"
                disabled={maakDeal.isPending}
                onClick={() => maakDeal.mutate()}
                type="button"
              >
                {maakDeal.isPending
                  ? "Deal aanmaken…"
                  : "+ Maak deal van deze relatie"}
              </button>
            </div>

            <Link
              className="hm-dealpanel__editorlink"
              href={`/admin/collections/contacts/${contact.id}`}
            >
              <ExternalLink size={13} strokeWidth={2} />
              Openen in volledige editor
            </Link>
          </div>

          <RecordTijdlijn
            onFout={(m) => onToast({ tekst: m, soort: "fout" })}
            recordId={contactId}
            relationTo="contacts"
          />
        </div>
      </aside>
    </>
  );
}

export function ContactPanel(props: ContactProps) {
  if (props.contactId === "nieuw") {
    return (
      <NieuwContact
        onClose={props.onClose}
        onToast={props.onToast}
        standaardOrganisatie={props.standaardOrganisatie}
      />
    );
  }
  return <ContactDetail {...props} />;
}
