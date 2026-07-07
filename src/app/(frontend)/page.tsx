import config from "@payload-config";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { getPayload } from "payload";

import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import { RenderBlocks } from "@/components/RenderBlocks";

export const dynamic = "force-dynamic";

async function getHomePage(draft: boolean) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "pages",
    draft,
    overrideAccess: draft,
    limit: 1,
    where: { slug: { equals: "home" } },
  });
  return docs[0] ?? null;
}

export default async function Home() {
  const { isEnabled: draft } = await draftMode();
  const page = await getHomePage(draft);

  if (!page) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-3xl font-semibold">Human Margin</h1>
        <p className="max-w-md text-balance opacity-70">
          Er is nog geen pagina met slug &ldquo;home&rdquo; gepubliceerd. Maak die aan in het{" "}
          <Link href="/admin" className="underline">
            CMS-beheer
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <>
      {draft && <RefreshRouteOnSave />}
      <RenderBlocks blocks={page.layout} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode();
  const page = await getHomePage(draft);
  if (!page) return { title: "Human Margin" };
  return {
    title: page.meta?.title ?? page.title,
    description: page.meta?.description ?? undefined,
  };
}
