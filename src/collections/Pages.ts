import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from "payload";

import { blockConfigs } from "@/blocks";
import { getServerSideURL } from "@/lib/url";

const pagePath = (slug?: string | null) => (slug === "home" ? "/" : `/${slug ?? ""}`);

const revalidatePage: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (req.context?.skipRevalidate) return doc;
  try {
    const { revalidatePath } = await import("next/cache");
    if (doc._status === "published") revalidatePath(pagePath(doc.slug));
    // oude URL leegmaken als de slug wijzigt of de pagina gedepubliceerd wordt
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) revalidatePath(pagePath(previousDoc.slug));
    if (previousDoc?._status === "published" && doc._status !== "published") {
      revalidatePath(pagePath(doc.slug));
    }
  } catch {
    // buiten een Next-request-context (bv. payload run-scripts) is revalidate niet nodig
  }
  return doc;
};

const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  const { revalidatePath } = await import("next/cache");
  revalidatePath(pagePath(doc?.slug));
  return doc;
};

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Pagina", plural: "Pagina's" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: "Content",
    livePreview: {
      url: ({ data }) =>
        `${getServerSideURL()}/next/preview?path=${encodeURIComponent(pagePath(data?.slug as string))}`,
    },
    preview: (data) =>
      `${getServerSideURL()}/next/preview?path=${encodeURIComponent(pagePath(data?.slug as string))}`,
  },
  access: {
    // publiek leest alleen gepubliceerde pagina's; ingelogde redacteuren zien alles
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: "published" } };
    },
  },
  versions: {
    drafts: { autosave: { interval: 375 } },
    maxPerDoc: 50,
  },
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: "title", label: "Titel", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: 'URL-pad van de pagina. Gebruik "home" voor de homepage.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const source = (value as string) || (data?.title as string) || "";
            return source
              .toLowerCase()
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
          },
        ],
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Inhoud",
          fields: [
            {
              name: "layout",
              label: "Secties",
              type: "blocks",
              blocks: blockConfigs,
            },
          ],
        },
        // Het SEO-tabblad wordt door @payloadcms/plugin-seo aan deze collectie toegevoegd
      ],
    },
  ],
};
