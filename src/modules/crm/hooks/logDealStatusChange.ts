import type { CollectionAfterChangeHook } from "payload";

import type { Deal } from "@/payload-types";

function relId(value: Deal["fase"]): string | number | null {
  if (value == null) return null;
  return typeof value === "object" ? value.id : value;
}

/**
 * Logt fase- en uitkomst-wijzigingen als 'statuswijziging'-activiteit met
 * voor/na in properties (spec §6, Twenty-patroon: timeline i.p.v. historietabel).
 * Faalt stil: een logfout mag de opslag nooit blokkeren (spec §8).
 */
export const logDealStatusChange: CollectionAfterChangeHook<Deal> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update" || !previousDoc) return doc;

  const wijzigingen: Record<string, { van: unknown; naar: unknown }> = {};
  const faseVan = relId(previousDoc.fase);
  const faseNaar = relId(doc.fase);
  if (String(faseVan) !== String(faseNaar)) {
    wijzigingen.fase = { van: faseVan, naar: faseNaar };
  }
  if (previousDoc.uitkomst !== doc.uitkomst) {
    wijzigingen.uitkomst = { van: previousDoc.uitkomst, naar: doc.uitkomst };
  }
  if (Object.keys(wijzigingen).length === 0) return doc;

  try {
    await req.payload.create({
      collection: "activities",
      data: {
        type: "statuswijziging",
        targets: [{ relationTo: "deals", value: doc.id }],
        auteur: req.user?.id ?? null,
        happensAt: new Date().toISOString(),
        properties: wijzigingen,
      },
      req,
    });
  } catch (error) {
    req.payload.logger.error(
      { err: error },
      `Statuswijziging van deal ${doc.id} kon niet worden gelogd`,
    );
  }
  return doc;
};
