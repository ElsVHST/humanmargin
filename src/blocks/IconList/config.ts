import type { Block } from "payload";

// Kop + lijst van regels met geel vink-icoon (Elementor icon-boxes).
// Instantie op /aick-sprint: sectie "Wat je krijgt" (grijze achtergrond).
// Elke regel is een korte bold-uppercase tekst; de eerste regel heeft
// optioneel een sublijn (beschrijving in lopende tekst).
export const IconListBlock: Block = {
  slug: "iconList",
  interfaceName: "IconListBlock",
  labels: { singular: "Vinkjeslijst", plural: "Vinkjeslijst-secties" },
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
    { name: "heading", label: "Kop", type: "text" },
    {
      name: "items",
      label: "Regels",
      type: "array",
      labels: { singular: "Regel", plural: "Regels" },
      fields: [
        { name: "text", label: "Regel", type: "text", required: true },
        {
          name: "description",
          label: "Sublijn (optioneel)",
          type: "text",
        },
      ],
    },
  ],
};
