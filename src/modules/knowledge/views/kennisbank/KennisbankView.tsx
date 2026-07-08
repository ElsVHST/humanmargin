import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import React from "react";

import { KennisbankBrowser } from "@/modules/knowledge/views/kennisbank/KennisbankBrowser";

export async function KennisbankView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;
  const { i18n, payload, user } = req;

  const docs = await payload.find({
    collection: "knowledge-docs",
    sort: "position",
    limit: 500,
    depth: 0,
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
        <KennisbankBrowser initialDocs={docs.docs} />
      </Gutter>
    </DefaultTemplate>
  );
}
