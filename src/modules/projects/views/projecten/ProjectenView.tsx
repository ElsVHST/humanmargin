import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import React from "react";

import { Topbar } from "@/components/admin/shell/Topbar";
import { ProjectenBoard } from "@/modules/projects/views/projecten/ProjectenBoard";

export async function ProjectenView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;
  const { i18n, payload, user } = req;
  const nu = new Date().getTime();

  const [fases, projecten, taken, statussen] = await Promise.all([
    payload.find({
      collection: "project-fases",
      sort: "_order",
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: "projects",
      sort: "position",
      limit: 500,
      depth: 1,
    }),
    // Voor de voortgang op de kaarten (checklist per project)
    payload.find({
      collection: "tasks",
      limit: 1000,
      depth: 0,
    }),
    // Voor het gestapelde TaakPanel
    payload.find({
      collection: "task-statuses",
      sort: "_order",
      limit: 100,
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
      <Topbar titel="Projecten" />
      <Gutter>
        <ProjectenBoard
          initialFases={fases.docs}
          initialProjecten={projecten.docs}
          initialTaken={taken.docs}
          isBeheerder={user?.role === "beheerder"}
          nu={nu}
          statussen={statussen.docs}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
