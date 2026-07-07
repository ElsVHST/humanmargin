import type { Block } from "payload";

export const TestimonialsBlock: Block = {
  slug: "testimonials",
  interfaceName: "TestimonialsBlock",
  labels: { singular: "Recensies (carousel)", plural: "Recensie-carousels" },
  fields: [
    { name: "heading", label: "Kop", type: "text" },
    { name: "intro", label: "Introtekst", type: "text" },
    {
      name: "items",
      label: "Recensies",
      type: "array",
      minRows: 1,
      labels: { singular: "Recensie", plural: "Recensies" },
      fields: [
        { name: "quote", label: "Quote", type: "textarea", required: true },
        { name: "name", label: "Naam", type: "text", required: true },
      ],
    },
  ],
};
