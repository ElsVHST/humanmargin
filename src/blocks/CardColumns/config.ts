import type { Block } from "payload";

import { ctaFields } from "@/components/HmButton";

// 3-koloms kaartsectie (leeszaal-pagina, sectie 2): elke kaart heeft een kop,
// optionele accent-subkop, lopende tekst, gele knop en een foto eronder.
// Op desktop staan de kaarten naast elkaar (grid), op mobiel gestapeld.
export const CardColumnsBlock: Block = {
  slug: "cardColumns",
  interfaceName: "CardColumnsBlock",
  labels: { singular: "Kaartkolommen", plural: "Kaartkolommen-secties" },
  fields: [
    {
      name: "background",
      label: "Achtergrond",
      type: "select",
      defaultValue: "gray",
      options: [
        { label: "Grijs (#DDDDD3)", value: "gray" },
        { label: "Gebroken wit (#F4F4F1)", value: "offwhite" },
        { label: "Wit", value: "white" },
        { label: "Zwart", value: "black" },
      ],
    },
    {
      name: "cards",
      label: "Kaarten",
      type: "array",
      labels: { singular: "Kaart", plural: "Kaarten" },
      fields: [
        { name: "heading", label: "Kop", type: "text" },
        { name: "subheading", label: "Subkop (accent)", type: "text" },
        { name: "body", label: "Tekst", type: "richText" },
        { name: "cta", label: "Knop", type: "group", fields: ctaFields },
        { name: "image", label: "Foto", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
