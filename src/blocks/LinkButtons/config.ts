import type { Block } from "payload";

// Linktree-achtige sectie (/linkjes): gecentreerd logo + gestapelde full-width
// knoppen (blauw/geel afwisselend) op een zwarte achtergrond.
export const LinkButtonsBlock: Block = {
  slug: "linkButtons",
  interfaceName: "LinkButtonsBlock",
  labels: { singular: "Linkknoppen", plural: "Linkknoppen-secties" },
  fields: [
    { name: "logo", label: "Logo", type: "upload", relationTo: "media" },
    {
      name: "links",
      label: "Knoppen",
      type: "array",
      labels: { singular: "Knop", plural: "Knoppen" },
      fields: [
        { name: "label", label: "Knoptekst", type: "text", required: true },
        { name: "href", label: "Link", type: "text", required: true },
        {
          name: "variant",
          label: "Kleur",
          type: "select",
          defaultValue: "blue",
          options: [
            { label: "Blauw", value: "blue" },
            { label: "Geel", value: "yellow" },
          ],
        },
      ],
    },
  ],
};
