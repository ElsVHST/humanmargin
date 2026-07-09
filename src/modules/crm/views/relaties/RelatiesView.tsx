import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import React from "react";

import { Topbar } from "@/components/admin/shell/Topbar";
import { RelatiesLijst } from "@/modules/crm/views/relaties/RelatiesLijst";

export async function RelatiesView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;
  const { i18n, payload, user } = req;
  const nu = new Date().getTime();

  const [organisaties, contacten, sectoren, functies, activiteiten] =
    await Promise.all([
      payload.find({
        collection: "organisations",
        sort: "naam",
        limit: 1000,
        depth: 1,
      }),
      payload.find({
        collection: "contacts",
        sort: "naam",
        limit: 1000,
        depth: 1,
      }),
      payload.find({
        collection: "sectoren",
        sort: "_order",
        limit: 500,
        depth: 0,
      }),
      payload.find({
        collection: "functies",
        sort: "_order",
        limit: 500,
        depth: 0,
      }),
      // Voor de "Laatste contact"-kolom: recentste activiteit per relatie
      payload.find({
        collection: "activities",
        sort: "-happensAt",
        limit: 2000,
        depth: 0,
      }),
    ]);

  const laatsteContact: Record<string, string> = {};
  for (const a of activiteiten.docs) {
    for (const t of a.targets ?? []) {
      if (t.relationTo !== "organisations" && t.relationTo !== "contacts") {
        continue;
      }
      const sleutel = `${t.relationTo}:${typeof t.value === "object" ? t.value.id : t.value}`;
      // Gesorteerd op -happensAt: de eerste treffer is de recentste
      laatsteContact[sleutel] ??= a.happensAt;
    }
  }

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Topbar titel="Relaties" />
      <Gutter>
        <RelatiesLijst
          gebruikerId={user?.id ?? null}
          initialContacten={contacten.docs}
          initialFuncties={functies.docs}
          initialOrganisaties={organisaties.docs}
          initialSectoren={sectoren.docs}
          initialVoorkeuren={
            (user?.lijstVoorkeuren ?? null) as Record<string, unknown> | null
          }
          isBeheerder={user?.role === "beheerder"}
          laatsteContact={laatsteContact}
          nu={nu}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
