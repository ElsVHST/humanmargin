import type { Block } from "payload";

export const CalendlyEmbedBlock: Block = {
  slug: "calendlyEmbed",
  interfaceName: "CalendlyEmbedBlock",
  labels: { singular: "Agenda-embed (Calendly)", plural: "Agenda-embeds" },
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
      ],
    },
    { name: "heading", label: "Kop", type: "text" },
    {
      name: "annotation",
      label: "Handgeschreven annotatie (blauw)",
      type: "text",
    },
    {
      name: "calendlyUrl",
      label: "Calendly-link",
      type: "text",
      required: true,
      admin: { description: "Bijv. https://calendly.com/human-margin-info/30min" },
    },
    { name: "height", label: "Hoogte (px)", type: "number", defaultValue: 700 },
  ],
};
