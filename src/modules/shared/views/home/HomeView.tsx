import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import React from "react";

import { Topbar } from "@/components/admin/shell/Topbar";
import { avatarKleur, initialen } from "@/modules/shared/ui";
import { relationId } from "@/modules/crm/views/pipeline/lib";
import type { Activity, ContentItem, Task } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "./home.scss";

function begroeting(naam?: string | null): string {
  const uur = new Date().getHours();
  const dagdeel =
    uur < 6 ? "Goedenacht" : uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond";
  const voornaam = naam?.split(/\s+/)[0];
  return voornaam ? `${dagdeel}, ${voornaam}!` : `${dagdeel}!`;
}

function euro(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(bedrag);
}

function datumKort(iso?: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

function taakStatusNaam(taak: Task): string | null {
  if (taak.status && typeof taak.status === "object") return taak.status.naam;
  return null;
}

function kanaalNaam(item: ContentItem): string | null {
  if (item.kanaal && typeof item.kanaal === "object") return item.kanaal.naam;
  return null;
}

function activiteitAuteur(a: Activity): string | null {
  if (a.auteur && typeof a.auteur === "object") return a.auteur.name;
  return null;
}

const TYPE_LABEL: Record<Activity["type"], string> = {
  notitie: "Notitie",
  statuswijziging: "Status",
  systeem: "Systeem",
  email: "E-mail",
  boeking: "Boeking",
  vraag: "Vraag",
  log: "LOG",
};

/** Link naar het paneel van het eerste target van een activiteit. */
function activiteitHref(a: Activity): string | null {
  const t = (a.targets ?? [])[0];
  if (!t) return null;
  const id = typeof t.value === "object" ? t.value.id : t.value;
  switch (t.relationTo) {
    case "deals":
      return `/admin/pipeline?deal=${id}`;
    case "organisations":
      return `/admin/relaties?organisatie=${id}`;
    case "contacts":
      return `/admin/relaties?contact=${id}`;
    case "tasks":
      return `/admin/taken?taak=${id}`;
    case "content-items":
      return `/admin/kalender?item=${id}`;
    case "knowledge-docs":
      return "/admin/kennisbank";
    default:
      return null;
  }
}

export async function HomeView({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  const { payload, user } = req;

  const vandaag = new Date();
  const nu = vandaag.getTime();
  const startVandaag = new Date(
    vandaag.getFullYear(),
    vandaag.getMonth(),
    vandaag.getDate(),
  );
  const overEenWeek = new Date(startVandaag.getTime() + 7 * 86400000);
  const eindVandaag = new Date(startVandaag.getTime() + 86400000);

  const [
    openDeals,
    stages,
    mijnTaken,
    weekContent,
    recenteActiviteit,
    weekDeals,
    opvolgOrgs,
    opvolgContacten,
  ] =
    await Promise.all([
      payload.find({
        collection: "deals",
        where: { uitkomst: { equals: "open" } },
        limit: 500,
        depth: 0,
      }),
      payload.find({
        collection: "deal-stages",
        sort: "_order",
        limit: 100,
        depth: 0,
      }),
      user
        ? payload.find({
            collection: "tasks",
            where: { toegewezen: { equals: user.id } },
            sort: "deadline",
            limit: 8,
            depth: 1,
          })
        : Promise.resolve({ docs: [] as Task[] }),
      payload.find({
        collection: "content-items",
        where: {
          and: [
            { publishDate: { greater_than_equal: startVandaag.toISOString() } },
            { publishDate: { less_than: overEenWeek.toISOString() } },
          ],
        },
        sort: "publishDate",
        limit: 8,
        depth: 1,
      }),
      payload.find({
        collection: "activities",
        sort: "-happensAt",
        limit: 8,
        depth: 1,
      }),
      payload.find({
        collection: "deals",
        where: {
          and: [
            { uitkomst: { equals: "open" } },
            {
              verwachteSluitdatum: {
                greater_than_equal: startVandaag.toISOString(),
              },
            },
            { verwachteSluitdatum: { less_than: overEenWeek.toISOString() } },
          ],
        },
        sort: "verwachteSluitdatum",
        limit: 8,
        depth: 0,
      }),
      // Vandaag opvolgen: opvolgdatum vandaag of eerder (achterstallig telt mee)
      payload.find({
        collection: "organisations",
        where: { opvolgenOp: { less_than: eindVandaag.toISOString() } },
        sort: "opvolgenOp",
        limit: 8,
        depth: 0,
      }),
      payload.find({
        collection: "contacts",
        where: { opvolgenOp: { less_than: eindVandaag.toISOString() } },
        sort: "opvolgenOp",
        limit: 8,
        depth: 0,
      }),
    ]);

  const opvolgRelaties = [
    ...opvolgOrgs.docs.map((o) => ({
      key: `org-${o.id}`,
      naam: o.naam,
      href: `/admin/relaties?organisatie=${o.id}`,
      soort: "organisatie",
      op: o.opvolgenOp ?? "",
    })),
    ...opvolgContacten.docs.map((c) => ({
      key: `contact-${c.id}`,
      naam: c.naam ?? c.email,
      href: `/admin/relaties?contact=${c.id}`,
      soort: "contact",
      op: c.opvolgenOp ?? "",
    })),
  ]
    .sort((a, b) => a.op.localeCompare(b.op))
    .slice(0, 8);

  const totaalWaarde = openDeals.docs.reduce(
    (som, d) => som + (d.bedrag ?? 0),
    0,
  );
  const perFase = new Map<string, number>();
  for (const d of openDeals.docs) {
    const ref = relationId(d.fase) ?? "geen";
    perFase.set(ref, (perFase.get(ref) ?? 0) + 1);
  }

  // Geen DefaultTemplate: Payload wikkelt de dashboard-route zelf al in het admin-template
  return (
    <>
      <Topbar titel="Home" />
      <Gutter>
        <div className="hm-home__kop">
          <h1>{begroeting(user?.name)}</h1>
          <p className="hm-home__datum">
            {new Intl.DateTimeFormat("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(vandaag)}
          </p>
        </div>

        <div className="hm-home__snel">
          <Link href="/admin/pipeline?deal=nieuw">+ Deal</Link>
          <Link href="/admin/taken?taak=nieuw">+ Taak</Link>
          <Link href="/admin/kalender?item=nieuw">+ Content</Link>
          <Link href="/admin/relaties?organisatie=nieuw">
            + Organisatie
          </Link>
          <Link href="/admin/collections/knowledge-docs/create">
            + Kennisdocument
          </Link>
        </div>

        <div className="hm-home__stats">
          <div className="hm-home__stat">
            <div className="hm-home__statlb">Open pipeline</div>
            <div className="hm-home__statbig">
              {totaalWaarde > 0 ? euro(totaalWaarde) : openDeals.totalDocs}
              <small>
                {totaalWaarde > 0
                  ? ` · ${openDeals.totalDocs} deal${openDeals.totalDocs === 1 ? "" : "s"}`
                  : ` open deal${openDeals.totalDocs === 1 ? "" : "s"}`}
              </small>
            </div>
            {openDeals.totalDocs > 0 && (
              <div className="hm-home__bar">
                {stages.docs.map((fase) => {
                  const c = perFase.get(String(fase.id)) ?? 0;
                  if (c === 0) return null;
                  return (
                    <span
                      key={fase.id}
                      className={`hm-home__barseg hm-kleur--${fase.kleur}`}
                      style={{ width: `${(c / openDeals.totalDocs) * 100}%` }}
                      title={`${fase.naam}: ${c}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
          <div className="hm-home__stat">
            <div className="hm-home__statlb">Mijn taken</div>
            <div className="hm-home__statbig">{mijnTaken.docs.length}</div>
            <div className="hm-home__statfoot">
              {(() => {
                const verlopen = mijnTaken.docs.filter(
                  (t) => t.deadline && new Date(t.deadline).getTime() < nu,
                ).length;
                return verlopen > 0 ? (
                  <span className="hm-pill hm-pill--rose">
                    {verlopen} verlopen
                  </span>
                ) : (
                  <span className="hm-home__ok">Niets over de datum</span>
                );
              })()}
            </div>
          </div>
          <div className="hm-home__stat">
            <div className="hm-home__statlb">Content deze week</div>
            <div className="hm-home__statbig">{weekContent.totalDocs}</div>
            <div className="hm-home__statfoot hm-home__chandots">
              {weekContent.docs.slice(0, 6).map((item) => {
                const kanaal = item.kanaal;
                const kleur =
                  kanaal && typeof kanaal === "object" ? kanaal.kleur : "grijs";
                return (
                  <span
                    key={item.id}
                    className={`hm-kleur hm-kleur--${kleur}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="hm-home__grid">
          <section className="hm-home__kaart">
            <header>
              <h2>Vandaag opvolgen</h2>
              <Link href="/admin/relaties">Naar relaties →</Link>
            </header>
            {opvolgRelaties.length === 0 ? (
              <p className="hm-home__leeg">
                Geen relaties om vandaag op te volgen.
              </p>
            ) : (
              <ul className="hm-home__lijst">
                {opvolgRelaties.map((rel) => (
                  <li key={rel.key}>
                    <Link className="hm-home__itemtekst" href={rel.href}>
                      {rel.naam}
                    </Link>
                    <span className="hm-home__badge">{rel.soort}</span>
                    <span
                      className={`hm-home__badge${new Date(rel.op).getTime() < startVandaag.getTime() ? " is-verlopen" : ""}`}
                    >
                      {datumKort(rel.op)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="hm-home__kaart">
            <header>
              <h2>Pipeline</h2>
              <Link href="/admin/pipeline">Naar het board →</Link>
            </header>
            <p className="hm-home__cijfer">
              {openDeals.totalDocs}{" "}
              <span>open deal{openDeals.totalDocs === 1 ? "" : "s"}</span>
              {totaalWaarde > 0 && (
                <span className="hm-home__waarde"> · {euro(totaalWaarde)}</span>
              )}
            </p>
            <ul className="hm-home__lijst">
              {stages.docs.map((fase) => (
                <li key={fase.id}>
                  <span className={`hm-kleur hm-kleur--${fase.kleur}`} />
                  <span className="hm-home__itemtekst">{fase.naam}</span>
                  <span className="hm-home__aantal">
                    {perFase.get(String(fase.id)) ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="hm-home__kaart">
            <header>
              <h2>Mijn taken</h2>
              <Link href="/admin/taken">Naar het board →</Link>
            </header>
            {mijnTaken.docs.length === 0 ? (
              <p className="hm-home__leeg">
                Geen taken aan jou toegewezen. Lekker bezig!
              </p>
            ) : (
              <ul className="hm-home__lijst">
                {mijnTaken.docs.map((taak) => (
                  <li key={taak.id}>
                    <Link
                      className="hm-home__itemtekst"
                      href={`/admin/taken?taak=${taak.id}`}
                    >
                      {taak.titel}
                    </Link>
                    {taakStatusNaam(taak) && (
                      <span className="hm-home__badge">
                        {taakStatusNaam(taak)}
                      </span>
                    )}
                    {taak.deadline && (
                      <span
                        className={`hm-home__badge${new Date(taak.deadline).getTime() < nu ? " is-verlopen" : ""}`}
                      >
                        {datumKort(taak.deadline)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="hm-home__kaart">
            <header>
              <h2>Content deze week</h2>
              <Link href="/admin/kalender">Naar de kalender →</Link>
            </header>
            {weekContent.docs.length === 0 ? (
              <p className="hm-home__leeg">Niets gepland deze week.</p>
            ) : (
              <ul className="hm-home__lijst">
                {weekContent.docs.map((item) => (
                  <li key={item.id}>
                    <Link
                      className="hm-home__itemtekst"
                      href={`/admin/kalender?item=${item.id}`}
                    >
                      {item.titel}
                    </Link>
                    {kanaalNaam(item) && (
                      <span className="hm-home__badge">{kanaalNaam(item)}</span>
                    )}
                    <span className="hm-home__badge">
                      {datumKort(item.publishDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="hm-home__kaart">
            <header>
              <h2>Recente activiteit</h2>
              <Link href="/admin/collections/activities">Alles →</Link>
            </header>
            {recenteActiviteit.docs.length === 0 ? (
              <p className="hm-home__leeg">Nog geen activiteit.</p>
            ) : (
              <ul className="hm-home__lijst hm-home__feed">
                {recenteActiviteit.docs.map((a) => {
                  const href = activiteitHref(a);
                  const auteur = activiteitAuteur(a);
                  const kern = (
                    <>
                      {auteur && (
                        <span
                          className="hm-av hm-av--sm"
                          style={{
                            background: avatarKleur(
                              typeof a.auteur === "object"
                                ? a.auteur?.id
                                : a.auteur,
                            ),
                          }}
                        >
                          {initialen(auteur)}
                        </span>
                      )}
                      <span className={`hm-pill hm-tijdlijn__type--${a.type}`}>
                        {TYPE_LABEL[a.type]}
                      </span>
                      <span className="hm-home__itemtekst">
                        {a.samenvatting ?? a.type}
                      </span>
                      <span className="hm-home__meta">
                        {datumKort(a.happensAt)}
                      </span>
                    </>
                  );
                  return (
                    <li key={a.id}>
                      {href ? (
                        <Link className="hm-home__feedlink" href={href}>
                          {kern}
                        </Link>
                      ) : (
                        kern
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="hm-home__kaart">
            <header>
              <h2>Deze week</h2>
              <Link href="/admin/kalender">Naar de kalender →</Link>
            </header>
            {weekDeals.docs.length === 0 && mijnTaken.docs.length === 0 ? (
              <p className="hm-home__leeg">Geen deadlines deze week.</p>
            ) : (
              <ul className="hm-home__lijst">
                {weekDeals.docs.map((deal) => (
                  <li key={`deal-${deal.id}`}>
                    <Link
                      className="hm-home__itemtekst"
                      href={`/admin/pipeline?deal=${deal.id}`}
                    >
                      {deal.titel}
                    </Link>
                    <span className="hm-home__badge">deal sluit</span>
                    <span className="hm-home__badge">
                      {datumKort(deal.verwachteSluitdatum)}
                    </span>
                  </li>
                ))}
                {mijnTaken.docs
                  .filter(
                    (taak) =>
                      taak.deadline &&
                      new Date(taak.deadline).getTime() <
                        overEenWeek.getTime(),
                  )
                  .map((taak) => (
                    <li key={`taak-${taak.id}`}>
                      <Link
                        className="hm-home__itemtekst"
                        href={`/admin/taken?taak=${taak.id}`}
                      >
                        {taak.titel}
                      </Link>
                      <span className="hm-home__badge">taak</span>
                      <span
                        className={`hm-home__badge${new Date(taak.deadline ?? 0).getTime() < nu ? " is-verlopen" : ""}`}
                      >
                        {datumKort(taak.deadline)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      </Gutter>
    </>
  );
}
