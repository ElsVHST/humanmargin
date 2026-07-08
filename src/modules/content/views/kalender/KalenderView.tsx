import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import React from "react";

import { Kalender } from "@/modules/content/views/kalender/Kalender";

export async function KalenderView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;
  const { i18n, payload, user } = req;

  const items = await payload.find({
    collection: "content-items",
    sort: "publishDate",
    limit: 500,
    depth: 1,
  });

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
        <h1 className="hm-pipeline__titel">Contentkalender</h1>
        <Kalender initialItems={items.docs} />
      </Gutter>
    </DefaultTemplate>
  );
}
