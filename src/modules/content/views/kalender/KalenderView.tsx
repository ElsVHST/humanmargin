import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import React from "react";

import { Topbar } from "@/components/admin/shell/Topbar";
import { Kalender } from "@/modules/content/views/kalender/Kalender";

export async function KalenderView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;
  const { i18n, payload, user } = req;

  const [items, taken, statussen, projecten] = await Promise.all([
    payload.find({
      collection: "content-items",
      sort: "publishDate",
      limit: 500,
      depth: 1,
    }),
    payload.find({
      collection: "tasks",
      where: { deadline: { exists: true } },
      sort: "deadline",
      limit: 500,
      depth: 1,
    }),
    payload.find({
      collection: "task-statuses",
      sort: "_order",
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: "projects",
      where: { status: { not_equals: "afgerond" } },
      sort: "naam",
      limit: 200,
      depth: 0,
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
      <Topbar titel="Contentkalender" />
      <Gutter>
        <Kalender
          initialItems={items.docs}
          initialTaken={taken.docs}
          projecten={projecten.docs}
          statussen={statussen.docs}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
