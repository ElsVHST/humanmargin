import config from "@payload-config";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";

import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import { RenderBlocks } from "@/components/RenderBlocks";

export const dynamic = "force-dynamic";

async function getPage(slug: string, draft: boolean) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "pages",
    draft,
    overrideAccess: draft,
    limit: 1,
    where: { slug: { equals: slug } },
  });
  return docs[0] ?? null;
}

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const page = await getPage(slug, draft);
  if (!page) notFound();

  return (
    <>
      {draft && <RefreshRouteOnSave />}
      <RenderBlocks blocks={page.layout} />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const page = await getPage(slug, draft);
  if (!page) return {};

  const image = typeof page.meta?.image === "object" ? page.meta?.image?.url : undefined;
  return {
    title: page.meta?.title ?? page.title,
    description: page.meta?.description ?? undefined,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}
