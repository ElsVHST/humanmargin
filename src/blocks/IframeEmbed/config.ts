import type { Block } from "payload";

export const IframeEmbedBlock: Block = {
  slug: "iframeEmbed",
  interfaceName: "IframeEmbedBlock",
  labels: { singular: "Embed (iframe)", plural: "Embeds" },
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
        { label: "Zwart", value: "black" },
      ],
    },
    { name: "heading", label: "Kop", type: "text" },
    {
      name: "url",
      label: "Embed-URL",
      type: "text",
      required: true,
      admin: { description: "Bijv. https://tally.so/embed/b5LLQe?alignLeft=1&hideTitle=1" },
    },
    { name: "height", label: "Hoogte (px)", type: "number", defaultValue: 900 },
    {
      name: "maxWidth",
      label: "Maximale breedte (px)",
      type: "number",
      defaultValue: 720,
    },
  ],
};
