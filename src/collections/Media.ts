import path from "node:path";
import { fileURLToPath } from "node:url";

import type { CollectionConfig } from "payload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media", plural: "Media" },
  admin: { group: "Content" },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
    mimeTypes: ["image/*", "video/*", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 480 },
      { name: "medium", width: 1024 },
      { name: "large", width: 1920 },
    ],
    focalPoint: true,
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      label: "Alt-tekst",
      type: "text",
      required: true,
      admin: {
        description: "Beschrijving van de afbeelding voor SEO en toegankelijkheid",
      },
    },
  ],
};
