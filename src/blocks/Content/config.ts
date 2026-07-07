import type { Block } from "payload";

export const ContentBlock: Block = {
  slug: "content",
  interfaceName: "ContentBlock",
  labels: { singular: "Tekst", plural: "Tekst-secties" },
  fields: [
    {
      name: "richText",
      label: "Tekst",
      type: "richText",
    },
  ],
};
