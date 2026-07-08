import type { CollectionAfterChangeHook } from "payload";

import type { Deal } from "@/payload-types";

function relIdNum(value: Deal["organisatie"]): number | null {
  if (value == null) return null;
  return typeof value === "object" ? value.id : value;
}

/**
 * Deal-uitkomst → gewonnen: maakt automatisch een project aan (spec §6).
 * Idempotent: bestaat er al een project met deze deal-referentie, dan niets.
 * Faalt stil: de opslag van de deal blijft altijd intact (spec §8).
 */
export const createProjectOnWin: CollectionAfterChangeHook<Deal> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update" || !previousDoc) return doc;
  if (doc.uitkomst !== "gewonnen" || previousDoc.uitkomst === "gewonnen") {
    return doc;
  }

  try {
    const bestaand = await req.payload.find({
      collection: "projects",
      where: { deal: { equals: doc.id } },
      limit: 1,
      req,
    });
    if (bestaand.totalDocs > 0) return doc;

    await req.payload.create({
      collection: "projects",
      data: {
        naam: doc.titel,
        status: "actief",
        organisatie: relIdNum(doc.organisatie),
        deal: doc.id,
        teamleden: req.user ? [req.user.id] : [],
      },
      req,
    });
  } catch (error) {
    req.payload.logger.error(
      { err: error },
      `Kon geen project aanmaken voor gewonnen deal ${doc.id}`,
    );
  }
  return doc;
};
