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

  const [organisaties, contacten] = await Promise.all([
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
  ]);

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
          initialContacten={contacten.docs}
          initialOrganisaties={organisaties.docs}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
