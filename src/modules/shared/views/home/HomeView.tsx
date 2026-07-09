import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import React from "react";

import { Topbar } from "@/components/admin/shell/Topbar";
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

  const [openDeals, stages, mijnTaken, weekContent, recenteActiviteit] =
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
    ]);

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
          <Link href="/admin/collections/organisations/create">
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
              <ul className="hm-home__lijst">
                {recenteActiviteit.docs.map((a) => (
                  <li key={a.id}>
                    <span className="hm-home__itemtekst">
                      {a.samenvatting ?? a.type}
                    </span>
                    <span className="hm-home__meta">
                      {activiteitAuteur(a) ? `${activiteitAuteur(a)} · ` : ""}
                      {datumKort(a.happensAt)}
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
