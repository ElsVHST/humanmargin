import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import React from "react";

import { Topbar } from "@/components/admin/shell/Topbar";
import { PipelineBoard } from "@/modules/crm/views/pipeline/PipelineBoard";

export async function PipelineView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;
  const { i18n, payload, user } = req;

  const [stages, deals] = await Promise.all([
    payload.find({
      collection: "deal-stages",
      sort: "_order",
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: "deals",
      where: { uitkomst: { equals: "open" } },
      sort: "position",
      limit: 500,
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
      <Topbar titel="Pipeline" />
      <Gutter>
        <PipelineBoard
          initialStages={stages.docs}
          initialDeals={deals.docs}
          isBeheerder={user?.role === "beheerder"}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
