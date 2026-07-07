import type { Block } from "payload";

// Generiek kop + tekstkolommen-block. Instantie op de homepage: "De Human Margin
// Methode" (sectie de97d97) — kop links, één tekstkolom eronder op een gebroken
// witte achtergrond. Meerdere kolommen leggen op desktop naast elkaar.
export const TextColumnsBlock: Block = {
  slug: "textColumns",
  interfaceName: "TextColumnsBlock",
  labels: { singular: "Tekstkolommen", plural: "Tekstkolommen-secties" },
  fields: [
    {
      name: "background",
      label: "Achtergrond",
      type: "select",
      defaultValue: "offwhite",
      options: [
        { label: "Grijs (#DDDDD3)", value: "gray" },
        { label: "Gebroken wit (#F4F4F1)", value: "offwhite" },
        { label: "Wit", value: "white" },
        { label: "Zwart", value: "black" },
      ],
    },
    { name: "heading", label: "Kop", type: "text" },
    {
      name: "compact",
      label: "Compact (vervolgtekst)",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Vinkje = geen minimumhoogte van 630px en kleinere verticale padding. Voor korte vervolgteksten die bij de vorige sectie horen.",
      },
    },
    {
      name: "align",
      label: "Uitlijning",
      type: "select",
      defaultValue: "left",
      options: [
        { label: "Links", value: "left" },
        { label: "Gecentreerd", value: "center" },
      ],
    },
    {
      name: "columns",
      label: "Tekstkolommen",
      type: "array",
      labels: { singular: "Tekstkolom", plural: "Tekstkolommen" },
      fields: [{ name: "body", label: "Tekst", type: "richText" }],
    },
  ],
};
