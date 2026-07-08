import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import React from "react";

import { TakenBoard } from "@/modules/projects/views/taken/TakenBoard";

export async function TakenView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;
  const { i18n, payload, user } = req;

  const [statussen, taken, projecten] = await Promise.all([
    payload.find({
      collection: "task-statuses",
      sort: "_order",
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: "tasks",
      sort: "position",
      limit: 500,
      depth: 1,
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
      <Gutter>
        <h1 className="hm-pipeline__titel">Taken</h1>
        <TakenBoard
          initialStatussen={statussen.docs}
          initialTaken={taken.docs}
          projecten={projecten.docs}
          isBeheerder={user?.role === "beheerder"}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
