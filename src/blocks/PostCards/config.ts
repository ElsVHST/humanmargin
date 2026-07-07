import type { Block } from "payload";

export const PostCardsBlock: Block = {
  slug: "postCards",
  interfaceName: "PostCardsBlock",
  labels: { singular: "Artikel-kaarten", plural: "Artikel-kaarten" },
  fields: [
    {
      name: "background",
      label: "Achtergrond",
      type: "select",
      defaultValue: "white",
      options: [
        { label: "Wit", value: "white" },
        { label: "Gebroken wit (#F4F4F1)", value: "offwhite" },
        { label: "Grijs (#DDDDD3)", value: "gray" },
      ],
    },
    {
      name: "cards",
      label: "Kaarten",
      type: "array",
      minRows: 1,
      fields: [
        { name: "image", label: "Afbeelding", type: "upload", relationTo: "media" },
        { name: "label", label: "Categorie-label (geel)", type: "text" },
        { name: "title", label: "Titel", type: "text", required: true },
        { name: "excerpt", label: "Samenvatting", type: "textarea" },
        { name: "href", label: "Link", type: "text", required: true },
        { name: "readMore", label: "Lees-verder-tekst", type: "text", defaultValue: "Lees verder »" },
      ],
    },
  ],
};
