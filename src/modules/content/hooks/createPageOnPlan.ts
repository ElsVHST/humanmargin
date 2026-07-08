import type { CollectionAfterChangeHook } from "payload";

import type { ContentItem } from "@/payload-types";

function slugify(titel: string): string {
  return titel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Blog-item op 'Gepland' → maakt een conceptpagina op de site en koppelt die
 * terug (spec §6). Idempotent via de gekoppeldePagina-relatie; faalt stil.
 */
export const createPageOnPlan: CollectionAfterChangeHook<ContentItem> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "update" && operation !== "create") return doc;
  if (doc.status !== "gepland" || doc.gekoppeldePagina) return doc;
  if (!doc.kanaal) return doc;

  try {
    const kanaalId = typeof doc.kanaal === "object" ? doc.kanaal.id : doc.kanaal;
    const kanaal = await req.payload.findByID({
      collection: "content-channels",
      id: kanaalId,
      trash: true,
      depth: 0,
      req,
    });
    if (kanaal?.type !== "blog") return doc;

    let slug = slugify(doc.titel);
    const bestaand = await req.payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
      req,
    });
    if (bestaand.totalDocs > 0) {
      slug = `${slug}-${String(Date.now()).slice(-5)}`;
    }

    const pagina = await req.payload.create({
      collection: "pages",
      draft: true,
      data: {
        title: doc.titel,
        slug,
        _status: "draft",
      },
      req,
    });

    await req.payload.update({
      collection: "content-items",
      id: doc.id,
      data: { gekoppeldePagina: pagina.id },
      req,
    });
    return { ...doc, gekoppeldePagina: pagina.id };
  } catch (error) {
    req.payload.logger.error(
      { err: error },
      `Kon geen conceptpagina aanmaken voor content-item ${doc.id}`,
    );
  }
  return doc;
};
