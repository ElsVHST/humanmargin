import type { Block } from "payload";

export const StatementBlock: Block = {
  slug: "statement",
  interfaceName: "StatementBlock",
  labels: { singular: "Statement-balk", plural: "Statement-balken" },
  fields: [
    {
      name: "heading",
      label: "Witte regels",
      type: "textarea",
      required: true,
      admin: { description: "Regelbreuken blijven behouden" },
    },
    {
      name: "accent",
      label: "Gele slotregel",
      type: "text",
    },
  ],
};
