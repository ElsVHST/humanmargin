import type { CollectionAfterChangeHook } from "payload";

import type { Deal } from "@/payload-types";

function relId(value: Deal["fase"]): string | number | null {
  if (value == null) return null;
  return typeof value === "object" ? value.id : value;
}

const UITKOMST_LABELS: Record<string, string> = {
  open: "Open",
  gewonnen: "Gewonnen",
  verloren: "Verloren",
};

/**
 * Logt fase- en uitkomst-wijzigingen als 'statuswijziging'-activiteit met
 * voor/na (id's + leesbare namen) in properties en een leesbare samenvatting
 * (spec §6, Twenty-patroon: timeline i.p.v. historietabel).
 * Faalt stil: een logfout mag de opslag nooit blokkeren (spec §8).
 */
export const logDealStatusChange: CollectionAfterChangeHook<Deal> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update" || !previousDoc) return doc;

  try {
    const wijzigingen: Record<string, unknown> = {};
    const regels: string[] = [];

    const faseVan = relId(previousDoc.fase);
    const faseNaar = relId(doc.fase);
    if (String(faseVan) !== String(faseNaar)) {
      const naamVan = await faseNaam(req, faseVan);
      const naamNaar = await faseNaam(req, faseNaar);
      wijzigingen.fase = {
        van: faseVan,
        naar: faseNaar,
        vanNaam: naamVan,
        naarNaam: naamNaar,
      };
      regels.push(`Fase: ${naamVan} → ${naamNaar}`);
    }

    if (previousDoc.uitkomst !== doc.uitkomst) {
      wijzigingen.uitkomst = { van: previousDoc.uitkomst, naar: doc.uitkomst };
      regels.push(
        `Uitkomst: ${UITKOMST_LABELS[previousDoc.uitkomst] ?? previousDoc.uitkomst} → ${UITKOMST_LABELS[doc.uitkomst] ?? doc.uitkomst}`,
      );
    }

    if (regels.length === 0) return doc;

    await req.payload.create({
      collection: "activities",
      data: {
        type: "statuswijziging",
        samenvatting: regels.join(" · "),
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

async function faseNaam(
  req: Parameters<CollectionAfterChangeHook<Deal>>[0]["req"],
  id: string | number | null,
): Promise<string> {
  if (id == null) return "Geen fase";
  try {
    const stage = await req.payload.findByID({
      collection: "deal-stages",
      id,
      trash: true,
      depth: 0,
      req,
    });
    return stage?.naam ?? "Onbekende fase";
  } catch {
    return "Onbekende fase";
  }
}
