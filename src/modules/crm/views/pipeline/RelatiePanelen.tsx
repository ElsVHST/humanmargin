"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { RecordTijdlijn } from "@/modules/shared/components/RecordTijdlijn";
import { euro } from "@/modules/shared/ui";
import type { Contact, Deal, Organisation, User } from "@/payload-types";

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

/** Vrije-tekst-tags als chips: Enter/komma voegt toe, × verwijdert. */
function TagsVeld({
  onWijzig,
  tags,
}: {
  onWijzig: (tags: string[]) => void;
  tags: string[];
}) {
  const [invoer, setInvoer] = useState("");

  const voegToe = () => {
    const tag = invoer.trim();
    setInvoer("");
    if (!tag || tags.includes(tag)) return;
    onWijzig([...tags, tag]);
  };

  return (
    <div className="hm-tagsveld">
      {tags.map((tag) => (
        <span className="hm-pill" key={tag}>
          {tag}
          <button
            aria-label={`Tag '${tag}' verwijderen`}
            onClick={() => onWijzig(tags.filter((t) => t !== tag))}
            type="button"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        aria-label="Nieuwe tag"
        onBlur={voegToe}
        onChange={(e) => setInvoer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            voegToe();
          }
        }}
        placeholder={tags.length === 0 ? "Tag + Enter…" : ""}
        value={invoer}
      />
    </div>
  );
}

function tagsVan(rel: { tags?: (string | null)[] | null }): string[] {
  return (rel.tags ?? []).filter((t): t is string => Boolean(t));
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
  const [sector, setSector] = useState("");
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
          sector: sector.trim() || null,
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
              Sector
              <input onChange={(e) => setSector(e.target.value)} value={sector} />
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
        `/api/contacts?where[organisatie][equals]=${organisatieId}&limit=50&depth=0`,
      ),
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
                tags={tagsVan(org)}
              />
            </div>
            <label>
              Sector
              <input
                defaultValue={org.sector ?? ""}
                key={`sector-${org.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (org.sector ?? null)) {
                    opslaan.mutate({ sector: nieuw });
                  }
                }}
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
                <Link
                  href={`/admin/pipeline?contact=${c.id}`}
                  key={c.id}
                  replace
                >
                  {c.naam ?? c.email}
                  <span>{c.functie ?? ""}</span>
                </Link>
              ))}
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
};

function NieuwContact({ onClose, onToast }: Omit<ContactProps, "contactId">) {
  const qc = useQueryClient();
  const router = useRouter();
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [organisatie, setOrganisatie] = useState("");
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
      router.replace(`${window.location.pathname}?contact=${doc.id}`);
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

  const opslaan = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      patchDoc("contacts", contactId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact", contactId] });
      qc.invalidateQueries({ queryKey: ["panel", "contacten"] });
      qc.invalidateQueries({ queryKey: ["relaties", "contacten"] });
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
                tags={tagsVan(contact)}
              />
            </div>
            <label>
              Functie
              <input
                defaultValue={contact.functie ?? ""}
                key={`fu-${contact.updatedAt}`}
                onBlur={(e) => {
                  const nieuw = e.target.value.trim() || null;
                  if (nieuw !== (contact.functie ?? null)) {
                    opslaan.mutate({ functie: nieuw });
                  }
                }}
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
    return <NieuwContact onClose={props.onClose} onToast={props.onToast} />;
  }
  return <ContactDetail {...props} />;
}
