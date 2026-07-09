import path from "node:path";
import { fileURLToPath } from "node:url";

import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Bestandsopslag voor de kennisbank (myDrive-patroon): élk bestandstype,
 * los van de site-media zodat Els's mediabibliotheek schoon blijft.
 * Kennisdocumenten verwijzen hiernaar via hun `bestand`-veld.
 */
export const KnowledgeFiles: CollectionConfig = {
  slug: "knowledge-files",
  labels: { singular: "Kennisbank-bestand", plural: "Kennisbank-bestanden" },
  access: dashboardCollectionAccess,
  admin: {
    group: "Kennisbank",
    description: "Bestanden die in de kennisbank zijn geüpload.",
  },
  upload: {
    staticDir: path.resolve(dirname, "../../../../public/bestanden"),
    imageSizes: [{ name: "thumbnail", width: 480 }],
    adminThumbnail: "thumbnail",
  },
  fields: [],
};
