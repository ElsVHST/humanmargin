"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  ContactPanel,
  OrganisatiePanel,
  type PanelToast,
} from "@/modules/crm/views/pipeline/RelatiePanelen";
import { avatarKleur, initialen } from "@/modules/shared/ui";
import type { Contact, Organisation } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "@/modules/shared/components/board.scss";
import "./relaties.scss";

type Props = {
  initialOrganisaties: Organisation[];
  initialContacten: Contact[];
};

export function RelatiesLijst(props: Props) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Lijst {...props} />
    </QueryClientProvider>
  );
}

const RELATIETYPES: { waarde: string; label: string; kleur: string }[] = [
  { waarde: "prospect", label: "Prospect", kleur: "blauw" },
  { waarde: "lead", label: "Lead", kleur: "oranje" },
  { waarde: "klant", label: "Klant", kleur: "groen" },
  { waarde: "partner", label: "Partner", kleur: "paars" },
  { waarde: "overig", label: "Overig", kleur: "grijs" },
];

const DOELGROEPEN: { waarde: string; label: string }[] = [
  { waarde: "zzp", label: "ZZP" },
  { waarde: "mkb", label: "MKB" },
  { waarde: "aanbieder", label: "Aanbieder" },
  { waarde: "overig", label: "Overig" },
];

function typeInfo(waarde?: string | null) {
  return RELATIETYPES.find((t) => t.waarde === waarde) ?? RELATIETYPES[0];
}

function datumKort(iso?: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(iso));
}

function eigenaarNaam(rel: Organisation | Contact): string | null {
  const e = rel.eigenaar;
  if (e && typeof e === "object" && e.name) return e.name;
  return null;
}

function orgNaamVan(contact: Contact): string | null {
  const o = contact.organisatie;
  if (o && typeof o === "object") return o.naam;
  return null;
}

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return ((await res.json()) as { docs: T[] }).docs;
}

function Lijst({ initialContacten, initialOrganisaties }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organisatieParam = searchParams.get("organisatie");
  const contactParam = searchParams.get("contact");
  const tabParam = searchParams.get("tab");

  const [tab, setTab] = useState<"organisaties" | "contacten">(
    tabParam === "contacten" ? "contacten" : "organisaties",
  );
  const [zoek, setZoek] = useState("");
  const [typeFilter, setTypeFilter] = useState("alle");
  const [doelgroepFilter, setDoelgroepFilter] = useState("alle");
  const [toast, setToast] = useState<PanelToast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const orgsQuery = useQuery({
    queryKey: ["relaties", "organisaties"],
    queryFn: () =>
      fetchDocs<Organisation>(
        "/api/organisations?sort=naam&limit=1000&depth=1",
      ),
    initialData: initialOrganisaties,
  });

  const contactenQuery = useQuery({
    queryKey: ["relaties", "contacten"],
    queryFn: () =>
      fetchDocs<Contact>("/api/contacts?sort=naam&limit=1000&depth=1"),
    initialData: initialContacten,
  });

  const term = zoek.trim().toLowerCase();

  const filterRelatie = (rel: Organisation | Contact, naam: string) => {
    if (typeFilter !== "alle" && (rel.relatietype ?? "prospect") !== typeFilter) {
      return false;
    }
    if (doelgroepFilter !== "alle" && rel.doelgroep !== doelgroepFilter) {
      return false;
    }
    if (term && !naam.toLowerCase().includes(term)) return false;
    return true;
  };

  const organisaties = (orgsQuery.data ?? []).filter((o) =>
    filterRelatie(o, `${o.naam} ${o.sector ?? ""}`),
  );
  const contacten = (contactenQuery.data ?? []).filter((c) =>
    filterRelatie(c, `${c.naam ?? ""} ${c.email} ${orgNaamVan(c) ?? ""}`),
  );

  const openPaneel = (soort: "organisatie" | "contact", id: number | "nieuw") =>
    router.push(`/admin/relaties?tab=${tab}&${soort}=${id}`);

  return (
    <div className="hm-relaties">
      <div className="hm-board__bar">
        <button
          className="hm-btn hm-btn--primary"
          onClick={() =>
            openPaneel(tab === "organisaties" ? "organisatie" : "contact", "nieuw")
          }
          type="button"
        >
          {tab === "organisaties" ? "+ Organisatie" : "+ Contact"}
        </button>
        <div className="hm-seg">
          <button
            className={tab === "organisaties" ? "is-actief" : ""}
            onClick={() => setTab("organisaties")}
            type="button"
          >
            Organisaties ({(orgsQuery.data ?? []).length})
          </button>
          <button
            className={tab === "contacten" ? "is-actief" : ""}
            onClick={() => setTab("contacten")}
            type="button"
          >
            Contactpersonen ({(contactenQuery.data ?? []).length})
          </button>
        </div>
        <div className="hm-board__bar-rechts">
          <input
            className="hm-board__zoek"
            onChange={(e) => setZoek(e.target.value)}
            placeholder={
              tab === "organisaties"
                ? "Zoek op naam of sector…"
                : "Zoek op naam, e-mail of organisatie…"
            }
            type="search"
            value={zoek}
          />
          <select
            aria-label="Filter op relatietype"
            className="hm-board__select"
            onChange={(e) => setTypeFilter(e.target.value)}
            value={typeFilter}
          >
            <option value="alle">Alle types</option>
            {RELATIETYPES.map((t) => (
              <option key={t.waarde} value={t.waarde}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter op doelgroep"
            className="hm-board__select"
            onChange={(e) => setDoelgroepFilter(e.target.value)}
            value={doelgroepFilter}
          >
            <option value="alle">Alle doelgroepen</option>
            {DOELGROEPEN.map((d) => (
              <option key={d.waarde} value={d.waarde}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tab === "organisaties" ? (
        organisaties.length === 0 ? (
          <div className="hm-relaties__leeg">
            <p>
              {term || typeFilter !== "alle" || doelgroepFilter !== "alle"
                ? "Geen organisaties gevonden met deze filters."
                : "Nog geen organisaties — voeg je eerste prospect toe."}
            </p>
          </div>
        ) : (
          <table className="hm-relaties__tabel">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Type</th>
                <th>Doelgroep</th>
                <th>Sector</th>
                <th>Eigenaar</th>
                <th>Bijgewerkt</th>
              </tr>
            </thead>
            <tbody>
              {organisaties.map((org) => {
                const type = typeInfo(org.relatietype);
                return (
                  <tr key={org.id} onClick={() => openPaneel("organisatie", org.id)}>
                    <td>
                      <span className="hm-relaties__naam">
                        <span
                          className="hm-av hm-av--sm"
                          style={{ background: avatarKleur(org.id) }}
                        >
                          {initialen(org.naam)}
                        </span>
                        {org.naam}
                      </span>
                    </td>
                    <td>
                      <span className={`hm-pill hm-kleur--${type.kleur}`}>
                        {type.label}
                      </span>
                    </td>
                    <td>
                      {DOELGROEPEN.find((d) => d.waarde === org.doelgroep)
                        ?.label ?? "—"}
                    </td>
                    <td>{org.sector ?? "—"}</td>
                    <td>{eigenaarNaam(org) ?? "—"}</td>
                    <td>{datumKort(org.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      ) : contacten.length === 0 ? (
        <div className="hm-relaties__leeg">
          <p>
            {term || typeFilter !== "alle" || doelgroepFilter !== "alle"
              ? "Geen contactpersonen gevonden met deze filters."
              : "Nog geen contactpersonen — voeg je eerste contact toe."}
          </p>
        </div>
      ) : (
        <table className="hm-relaties__tabel">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Type</th>
              <th>E-mail</th>
              <th>Organisatie</th>
              <th>Functie</th>
              <th>Bijgewerkt</th>
            </tr>
          </thead>
          <tbody>
            {contacten.map((contact) => {
              const type = typeInfo(contact.relatietype);
              return (
                <tr
                  key={contact.id}
                  onClick={() => openPaneel("contact", contact.id)}
                >
                  <td>
                    <span className="hm-relaties__naam">
                      <span
                        className="hm-av hm-av--sm"
                        style={{ background: avatarKleur(contact.id) }}
                      >
                        {initialen(contact.naam ?? contact.email)}
                      </span>
                      {contact.naam ?? contact.email}
                    </span>
                  </td>
                  <td>
                    <span className={`hm-pill hm-kleur--${type.kleur}`}>
                      {type.label}
                    </span>
                  </td>
                  <td>{contact.email}</td>
                  <td>{orgNaamVan(contact) ?? "—"}</td>
                  <td>{contact.functie ?? "—"}</td>
                  <td>{datumKort(contact.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {organisatieParam && (
        <OrganisatiePanel
          key={`org-${organisatieParam}`}
          onClose={() => router.push(`/admin/relaties?tab=${tab}`)}
          onToast={setToast}
          organisatieId={organisatieParam}
        />
      )}

      {contactParam && (
        <ContactPanel
          contactId={contactParam}
          key={`contact-${contactParam}`}
          onClose={() => router.push(`/admin/relaties?tab=${tab}`)}
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
