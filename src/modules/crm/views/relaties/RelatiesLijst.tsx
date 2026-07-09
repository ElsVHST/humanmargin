"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Columns3, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  ContactPanel,
  OrganisatiePanel,
  type PanelToast,
} from "@/modules/crm/views/pipeline/RelatiePanelen";
import { CrmInstellingen } from "@/modules/crm/views/relaties/CrmInstellingen";
import { useCrmVelden } from "@/modules/crm/views/pipeline/ExtraVelden";
import { ProjectPanel } from "@/modules/projects/views/projecten/ProjectPanel";
import { avatarKleur, initialen, naamVan } from "@/modules/shared/ui";
import type {
  Contact,
  CrmVeld,
  Functie,
  Organisation,
  Sector,
} from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "@/modules/shared/components/board.scss";
import "./relaties.scss";

type Props = {
  initialOrganisaties: Organisation[];
  initialContacten: Contact[];
  initialSectoren: Sector[];
  initialFuncties: Functie[];
  isBeheerder: boolean;
  /** Voor het opslaan van kolomkeuze/sortering (users.lijstVoorkeuren). */
  gebruikerId: number | null;
  initialVoorkeuren: Record<string, unknown> | null;
  /** Recentste tijdlijn-activiteit per relatie: "organisations:1" → ISO. */
  laatsteContact: Record<string, string>;
  /** Servertijd (ms) — geen Date.now() in de componentbody (react-hooks/purity). */
  nu: number;
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

const RISICOKLASSEN: { waarde: string; label: string }[] = [
  { waarde: "hoog", label: "Hoog risico" },
  { waarde: "verboden", label: "Verboden" },
  { waarde: "geen", label: "Geen risico" },
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

function relIdVan(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "object") return String((value as { id: number }).id);
  return String(value);
}

async function fetchDocs<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return ((await res.json()) as { docs: T[] }).docs;
}

/* ── Configureerbare kolommen (MKB-plan B5) ──────────────────────────── */

type KolomDef<T> = {
  sleutel: string;
  label: string;
  render: (rel: T) => React.ReactNode;
  sorteer: (rel: T) => string | number;
};

type TabVoorkeur = {
  kolommen?: string[];
  sortering?: { kolom: string; richting: "asc" | "desc" };
};

type Voorkeuren = {
  relaties?: { organisaties?: TabVoorkeur; contacten?: TabVoorkeur };
};

const ORG_STANDAARD = [
  "type",
  "doelgroep",
  "opvolgen",
  "sector",
  "eigenaar",
  "bijgewerkt",
];
const CONTACT_STANDAARD = [
  "type",
  "opvolgen",
  "email",
  "organisatie",
  "functie",
  "bijgewerkt",
];

function xvWaarde(
  rel: Organisation | Contact,
  veld: CrmVeld,
): unknown {
  return ((rel.extraVelden ?? {}) as Record<string, unknown>)[
    veld.sleutel ?? ""
  ];
}

function xvCel(rel: Organisation | Contact, veld: CrmVeld): React.ReactNode {
  const w = xvWaarde(rel, veld);
  if (w == null || w === "" || (Array.isArray(w) && w.length === 0)) return "—";
  if (veld.type === "janee") return w ? "Ja" : "Nee";
  if (Array.isArray(w)) return w.join(", ");
  if (veld.type === "datum") return datumKort(String(w));
  if (veld.type === "link") {
    return (
      <a
        href={String(w)}
        onClick={(e) => e.stopPropagation()}
        rel="noreferrer"
        target="_blank"
      >
        {String(w)}
      </a>
    );
  }
  return String(w);
}

function KolomKiezer({
  aanbod,
  actief,
  onWijzig,
}: {
  aanbod: { sleutel: string; label: string }[];
  actief: string[];
  onWijzig: (kolommen: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const verplaats = (sleutel: string, delta: number) => {
    const i = actief.indexOf(sleutel);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= actief.length) return;
    const kopie = [...actief];
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    onWijzig(kopie);
  };

  return (
    <div className="hm-kolomkiezer">
      <button
        aria-label="Kolommen kiezen"
        className="hm-board__icoonknop"
        onClick={() => setOpen((v) => !v)}
        title="Kolommen kiezen"
        type="button"
      >
        <Columns3 size={15} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div
            aria-hidden
            className="hm-menu__backdrop"
            onClick={() => setOpen(false)}
            role="presentation"
          />
          <div className="hm-kolomkiezer__menu">
            {actief.map((sleutel) => {
              const k = aanbod.find((a) => a.sleutel === sleutel);
              if (!k) return null;
              return (
                <div className="hm-kolomkiezer__rij" key={sleutel}>
                  <label className="hm-check">
                    <input
                      checked
                      onChange={() =>
                        onWijzig(actief.filter((s) => s !== sleutel))
                      }
                      type="checkbox"
                    />
                    {k.label}
                  </label>
                  <span className="hm-kolomkiezer__pijlen">
                    <button
                      aria-label={`${k.label} omhoog`}
                      onClick={() => verplaats(sleutel, -1)}
                      type="button"
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`${k.label} omlaag`}
                      onClick={() => verplaats(sleutel, 1)}
                      type="button"
                    >
                      ↓
                    </button>
                  </span>
                </div>
              );
            })}
            {aanbod
              .filter((k) => !actief.includes(k.sleutel))
              .map((k) => (
                <div className="hm-kolomkiezer__rij" key={k.sleutel}>
                  <label className="hm-check">
                    <input
                      checked={false}
                      onChange={() => onWijzig([...actief, k.sleutel])}
                      type="checkbox"
                    />
                    {k.label}
                  </label>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function Lijst({
  gebruikerId,
  initialContacten,
  initialFuncties,
  initialOrganisaties,
  initialSectoren,
  initialVoorkeuren,
  isBeheerder,
  laatsteContact,
  nu,
}: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const organisatieParam = searchParams.get("organisatie");
  const contactParam = searchParams.get("contact");
  const projectParam = searchParams.get("project");
  const tabParam = searchParams.get("tab");

  const [tab, setTab] = useState<"organisaties" | "contacten">(
    tabParam === "contacten" ? "contacten" : "organisaties",
  );
  const [zoek, setZoek] = useState("");
  const [typeFilter, setTypeFilter] = useState("alle");
  const [doelgroepFilter, setDoelgroepFilter] = useState("alle");
  const [sectorFilter, setSectorFilter] = useState("alle");
  const [opvolgFilter, setOpvolgFilter] = useState("alle");
  const [tagFilter, setTagFilter] = useState("alle");
  const [instellingenOpen, setInstellingenOpen] = useState(false);
  const [toast, setToast] = useState<PanelToast | null>(null);
  const [voorkeuren, setVoorkeuren] = useState<Voorkeuren>(
    (initialVoorkeuren ?? {}) as Voorkeuren,
  );
  const opslaanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vandaag = new Date(nu);
  const startVandaag = new Date(
    vandaag.getFullYear(),
    vandaag.getMonth(),
    vandaag.getDate(),
  ).getTime();
  const eindVandaag = startVandaag + 86400000;

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

  const sectorenQuery = useQuery({
    queryKey: ["lijst", "sectoren"],
    queryFn: () =>
      fetchDocs<Sector>("/api/sectoren?limit=500&sort=_order&depth=0"),
    initialData: initialSectoren,
  });

  const functiesQuery = useQuery({
    queryKey: ["lijst", "functies"],
    queryFn: () =>
      fetchDocs<Functie>("/api/functies?limit=500&sort=_order&depth=0"),
    initialData: initialFuncties,
  });

  const veldenQuery = useCrmVelden();

  const term = zoek.trim().toLowerCase();

  const filterRelatie = (rel: Organisation | Contact, naam: string) => {
    if (typeFilter !== "alle" && (rel.relatietype ?? "prospect") !== typeFilter) {
      return false;
    }
    if (doelgroepFilter !== "alle" && rel.doelgroep !== doelgroepFilter) {
      return false;
    }
    if (
      sectorFilter !== "alle" &&
      (!("sector" in rel) || relIdVan(rel.sector) !== sectorFilter)
    ) {
      return false;
    }
    if (opvolgFilter !== "alle") {
      const t = rel.opvolgenOp ? new Date(rel.opvolgenOp).getTime() : null;
      if (t == null) return false;
      // "vandaag" = vandaag opvolgen, achterstallig telt mee
      if (opvolgFilter === "vandaag" && t >= eindVandaag) return false;
      if (opvolgFilter === "achterstallig" && t >= startVandaag) return false;
    }
    if (
      tagFilter !== "alle" &&
      !(rel.tags ?? []).some((tag) => tag === tagFilter)
    ) {
      return false;
    }
    if (term && !naam.toLowerCase().includes(term)) return false;
    return true;
  };

  const alleTags = Array.from(
    new Set(
      [...(orgsQuery.data ?? []), ...(contactenQuery.data ?? [])].flatMap(
        (rel) => (rel.tags ?? []).filter((tag): tag is string => Boolean(tag)),
      ),
    ),
  ).sort((a, b) => a.localeCompare(b, "nl"));

  const opvolgCel = (iso?: string | null): React.ReactNode => {
    if (!iso) return "—";
    const t = new Date(iso).getTime();
    if (t < startVandaag) {
      return (
        <span className="hm-pill hm-pill--rose">
          {datumKort(iso)} · achterstallig
        </span>
      );
    }
    if (t < eindVandaag) {
      return <span className="hm-pill hm-pill--amber">vandaag</span>;
    }
    return datumKort(iso);
  };

  const typeCel = (waarde?: string | null) => {
    const type = typeInfo(waarde);
    return (
      <span className={`hm-pill hm-kleur--${type.kleur}`}>{type.label}</span>
    );
  };

  /* ── Kolomaanbod per tab (vaste + Els's eigen velden) ─────────────── */

  const xvKolommen = <T extends Organisation | Contact>(
    doel: "organisaties" | "contacten",
  ): KolomDef<T>[] =>
    (veldenQuery.data ?? [])
      .filter((v) => v.geldtVoor === "beide" || v.geldtVoor === doel)
      .map((v) => ({
        sleutel: `xv:${v.sleutel}`,
        label: v.label,
        render: (rel: T) => xvCel(rel, v),
        sorteer: (rel: T) => {
          const w = xvWaarde(rel, v);
          return typeof w === "number" ? w : String(w ?? "");
        },
      }));

  const orgKolommen: KolomDef<Organisation>[] = [
    {
      sleutel: "type",
      label: "Type",
      render: (o) => typeCel(o.relatietype),
      sorteer: (o) => o.relatietype ?? "prospect",
    },
    {
      sleutel: "doelgroep",
      label: "Doelgroep",
      render: (o) =>
        DOELGROEPEN.find((d) => d.waarde === o.doelgroep)?.label ?? "—",
      sorteer: (o) => o.doelgroep ?? "",
    },
    {
      sleutel: "risicoklasse",
      label: "Risicoklasse",
      render: (o) =>
        RISICOKLASSEN.find((r) => r.waarde === o.risicoklasse)?.label ?? "—",
      sorteer: (o) => o.risicoklasse ?? "",
    },
    {
      sleutel: "opvolgen",
      label: "Opvolgen",
      render: (o) => opvolgCel(o.opvolgenOp),
      sorteer: (o) => o.opvolgenOp ?? "9999",
    },
    {
      sleutel: "sector",
      label: "Sector",
      render: (o) => naamVan(o.sector) ?? "—",
      sorteer: (o) => naamVan(o.sector) ?? "",
    },
    {
      sleutel: "eigenaar",
      label: "Eigenaar",
      render: (o) => eigenaarNaam(o) ?? "—",
      sorteer: (o) => eigenaarNaam(o) ?? "",
    },
    {
      sleutel: "laatsteContact",
      label: "Laatste contact",
      render: (o) => datumKort(laatsteContact[`organisations:${o.id}`]),
      sorteer: (o) => laatsteContact[`organisations:${o.id}`] ?? "",
    },
    {
      sleutel: "bijgewerkt",
      label: "Bijgewerkt",
      render: (o) => datumKort(o.updatedAt),
      sorteer: (o) => o.updatedAt,
    },
    ...xvKolommen<Organisation>("organisaties"),
  ];

  const contactKolommen: KolomDef<Contact>[] = [
    {
      sleutel: "type",
      label: "Type",
      render: (c) => typeCel(c.relatietype),
      sorteer: (c) => c.relatietype ?? "prospect",
    },
    {
      sleutel: "opvolgen",
      label: "Opvolgen",
      render: (c) => opvolgCel(c.opvolgenOp),
      sorteer: (c) => c.opvolgenOp ?? "9999",
    },
    {
      sleutel: "email",
      label: "E-mail",
      render: (c) => c.email,
      sorteer: (c) => c.email,
    },
    {
      sleutel: "telefoon",
      label: "Telefoon",
      render: (c) => (c.telefoons ?? [])[0] ?? "—",
      sorteer: (c) => (c.telefoons ?? [])[0] ?? "",
    },
    {
      sleutel: "organisatie",
      label: "Organisatie",
      render: (c) => orgNaamVan(c) ?? "—",
      sorteer: (c) => orgNaamVan(c) ?? "",
    },
    {
      sleutel: "functie",
      label: "Functie",
      render: (c) => naamVan(c.functie) ?? "—",
      sorteer: (c) => naamVan(c.functie) ?? "",
    },
    {
      sleutel: "doelgroep",
      label: "Doelgroep",
      render: (c) =>
        DOELGROEPEN.find((d) => d.waarde === c.doelgroep)?.label ?? "—",
      sorteer: (c) => c.doelgroep ?? "",
    },
    {
      sleutel: "risicoklasse",
      label: "Risicoklasse",
      render: (c) =>
        RISICOKLASSEN.find((r) => r.waarde === c.risicoklasse)?.label ?? "—",
      sorteer: (c) => c.risicoklasse ?? "",
    },
    {
      sleutel: "laatsteContact",
      label: "Laatste contact",
      render: (c) => datumKort(laatsteContact[`contacts:${c.id}`]),
      sorteer: (c) => laatsteContact[`contacts:${c.id}`] ?? "",
    },
    {
      sleutel: "bijgewerkt",
      label: "Bijgewerkt",
      render: (c) => datumKort(c.updatedAt),
      sorteer: (c) => c.updatedAt,
    },
    ...xvKolommen<Contact>("contacten"),
  ];

  /* ── Voorkeuren (kolomkeuze + sortering) per gebruiker ────────────── */

  const tabVoorkeur = voorkeuren.relaties?.[tab] ?? {};
  const standaard = tab === "organisaties" ? ORG_STANDAARD : CONTACT_STANDAARD;
  const kolomAanbod =
    tab === "organisaties"
      ? orgKolommen.map((k) => ({ sleutel: k.sleutel, label: k.label }))
      : contactKolommen.map((k) => ({ sleutel: k.sleutel, label: k.label }));
  const actieveSleutels = (tabVoorkeur.kolommen ?? standaard).filter((s) =>
    kolomAanbod.some((k) => k.sleutel === s),
  );
  const sortering = tabVoorkeur.sortering ?? {
    kolom: "naam",
    richting: "asc" as const,
  };

  const zetTabVoorkeur = (deel: Partial<TabVoorkeur>) => {
    const nieuw: Voorkeuren = {
      ...voorkeuren,
      relaties: {
        ...voorkeuren.relaties,
        [tab]: { ...voorkeuren.relaties?.[tab], ...deel },
      },
    };
    setVoorkeuren(nieuw);
    if (!gebruikerId) return;
    if (opslaanTimer.current) clearTimeout(opslaanTimer.current);
    opslaanTimer.current = setTimeout(() => {
      void fetch(`/api/users/${gebruikerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lijstVoorkeuren: nieuw }),
      });
    }, 600);
  };

  const toggleSort = (kolom: string) =>
    zetTabVoorkeur({
      sortering:
        sortering.kolom === kolom
          ? { kolom, richting: sortering.richting === "asc" ? "desc" : "asc" }
          : { kolom, richting: "asc" },
    });

  const indicator = (kolom: string) =>
    sortering.kolom === kolom ? (
      <span aria-hidden className="hm-relaties__sort">
        {sortering.richting === "asc" ? "▲" : "▼"}
      </span>
    ) : null;

  const sorteerRijen = <T,>(
    rijen: T[],
    kolommen: KolomDef<T>[],
    naamWaarde: (rel: T) => string,
  ): T[] => {
    const def =
      sortering.kolom === "naam"
        ? null
        : kolommen.find((k) => k.sleutel === sortering.kolom);
    const waarde = def ? def.sorteer : naamWaarde;
    const dir = sortering.richting === "desc" ? -1 : 1;
    return [...rijen].sort((a, b) => {
      const wa = waarde(a);
      const wb = waarde(b);
      if (typeof wa === "number" && typeof wb === "number") {
        return (wa - wb) * dir;
      }
      return (
        String(wa).localeCompare(String(wb), "nl", { numeric: true }) * dir
      );
    });
  };

  const tabelVoor = <T extends { id: number }>(
    rijen: T[],
    kolommen: KolomDef<T>[],
    naamCel: (rel: T) => React.ReactNode,
    naamWaarde: (rel: T) => string,
    onKlik: (rel: T) => void,
  ) => {
    const actief = actieveSleutels
      .map((s) => kolommen.find((k) => k.sleutel === s))
      .filter((k): k is KolomDef<T> => Boolean(k));
    return (
      <table className="hm-relaties__tabel">
        <thead>
          <tr>
            <th className="is-sorteerbaar" onClick={() => toggleSort("naam")}>
              Naam{indicator("naam")}
            </th>
            {actief.map((k) => (
              <th
                className="is-sorteerbaar"
                key={k.sleutel}
                onClick={() => toggleSort(k.sleutel)}
              >
                {k.label}
                {indicator(k.sleutel)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorteerRijen(rijen, kolommen, naamWaarde).map((rel) => (
            <tr key={rel.id} onClick={() => onKlik(rel)}>
              <td>{naamCel(rel)}</td>
              {actief.map((k) => (
                <td key={k.sleutel}>{k.render(rel)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const organisaties = (orgsQuery.data ?? []).filter((o) =>
    filterRelatie(o, `${o.naam} ${naamVan(o.sector) ?? ""}`),
  );
  const contacten = (contactenQuery.data ?? []).filter((c) =>
    filterRelatie(c, `${c.naam ?? ""} ${c.email} ${orgNaamVan(c) ?? ""}`),
  );

  const openPaneel = (soort: "organisatie" | "contact", id: number | "nieuw") =>
    router.push(`/admin/relaties?tab=${tab}&${soort}=${id}`);

  const filtersActief =
    Boolean(term) ||
    typeFilter !== "alle" ||
    doelgroepFilter !== "alle" ||
    sectorFilter !== "alle" ||
    opvolgFilter !== "alle" ||
    tagFilter !== "alle";

  const aantalPerSector = (id: number) =>
    (orgsQuery.data ?? []).filter((o) => relIdVan(o.sector) === String(id))
      .length;
  const aantalPerFunctie = (id: number) =>
    (contactenQuery.data ?? []).filter(
      (c) => relIdVan(c.functie) === String(id),
    ).length;

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
          {tab === "organisaties" && (
            <select
              aria-label="Filter op sector"
              className="hm-board__select"
              onChange={(e) => setSectorFilter(e.target.value)}
              value={sectorFilter}
            >
              <option value="alle">Alle sectoren</option>
              {(sectorenQuery.data ?? []).map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.naam}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label="Filter op opvolgdatum"
            className="hm-board__select"
            onChange={(e) => setOpvolgFilter(e.target.value)}
            value={opvolgFilter}
          >
            <option value="alle">Opvolgen: alles</option>
            <option value="vandaag">Vandaag opvolgen</option>
            <option value="achterstallig">Achterstallig</option>
          </select>
          <select
            aria-label="Filter op tag"
            className="hm-board__select"
            disabled={alleTags.length === 0}
            onChange={(e) => setTagFilter(e.target.value)}
            value={tagFilter}
          >
            <option value="alle">Alle tags</option>
            {alleTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <KolomKiezer
            aanbod={kolomAanbod}
            actief={actieveSleutels}
            onWijzig={(kolommen) => zetTabVoorkeur({ kolommen })}
          />
          <button
            aria-label="CRM-instellingen"
            className="hm-board__icoonknop"
            onClick={() => setInstellingenOpen(true)}
            title="CRM-instellingen (sectoren, functies, velden)"
            type="button"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {tab === "organisaties" ? (
        organisaties.length === 0 ? (
          <div className="hm-relaties__leeg">
            <p>
              {filtersActief
                ? "Geen organisaties gevonden met deze filters."
                : "Nog geen organisaties — voeg je eerste prospect toe."}
            </p>
          </div>
        ) : (
          tabelVoor(
            organisaties,
            orgKolommen,
            (org) => (
              <span className="hm-relaties__naam">
                <span
                  className="hm-av hm-av--sm"
                  style={{ background: avatarKleur(org.id) }}
                >
                  {initialen(org.naam)}
                </span>
                {org.naam}
              </span>
            ),
            (org) => org.naam,
            (org) => openPaneel("organisatie", org.id),
          )
        )
      ) : contacten.length === 0 ? (
        <div className="hm-relaties__leeg">
          <p>
            {filtersActief
              ? "Geen contactpersonen gevonden met deze filters."
              : "Nog geen contactpersonen — voeg je eerste contact toe."}
          </p>
        </div>
      ) : (
        tabelVoor(
          contacten,
          contactKolommen,
          (contact) => (
            <span className="hm-relaties__naam">
              <span
                className="hm-av hm-av--sm"
                style={{ background: avatarKleur(contact.id) }}
              >
                {initialen(contact.naam ?? contact.email)}
              </span>
              {contact.naam ?? contact.email}
            </span>
          ),
          (contact) => contact.naam ?? contact.email,
          (contact) => openPaneel("contact", contact.id),
        )
      )}

      {instellingenOpen && (
        <CrmInstellingen
          aantalPerFunctie={aantalPerFunctie}
          aantalPerSector={aantalPerSector}
          functies={functiesQuery.data ?? []}
          isBeheerder={isBeheerder}
          onClose={() => setInstellingenOpen(false)}
          onFout={(m) => setToast({ tekst: m, soort: "fout" })}
          onGewijzigd={() => {
            qc.invalidateQueries({ queryKey: ["lijst", "sectoren"] });
            qc.invalidateQueries({ queryKey: ["lijst", "functies"] });
            qc.invalidateQueries({ queryKey: ["lijst", "crm-velden"] });
            qc.invalidateQueries({ queryKey: ["relaties", "organisaties"] });
            qc.invalidateQueries({ queryKey: ["relaties", "contacten"] });
          }}
          sectoren={sectorenQuery.data ?? []}
          velden={veldenQuery.data ?? []}
        />
      )}

      {organisatieParam && (
        <OrganisatiePanel
          key={`org-${organisatieParam}`}
          onClose={() => router.push(`/admin/relaties?tab=${tab}`)}
          onToast={setToast}
          organisatieId={organisatieParam}
        />
      )}

      {/* Project stapelt bovenop het organisatiepaneel (projecten-ERP-plan P3) */}
      {projectParam && (
        <ProjectPanel
          key={`project-${projectParam}`}
          onClose={() =>
            router.push(
              organisatieParam
                ? `/admin/relaties?tab=${tab}&organisatie=${organisatieParam}`
                : `/admin/relaties?tab=${tab}`,
            )
          }
          onToast={setToast}
          projectId={projectParam}
          standaardOrganisatie={organisatieParam ?? undefined}
        />
      )}

      {contactParam && (
        <ContactPanel
          contactId={contactParam}
          key={`contact-${contactParam}`}
          onClose={() =>
            router.push(
              organisatieParam
                ? `/admin/relaties?tab=${tab}&organisatie=${organisatieParam}`
                : `/admin/relaties?tab=${tab}`,
            )
          }
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
