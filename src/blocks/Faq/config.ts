import type { Block } from "payload";

import { ctaFields } from "@/components/HmButton";

// "Veelgestelde vragen"-accordeon (Elementor nested-accordion). Origineel: gele balk
// voor het open item (#EDFF00), grijze balken voor gesloten items (#DDDDD3), met +/−
// indicator. Onder de accordeon een optionele outro ("Klaar?") + gele CTA-knop.
export const FaqBlock: Block = {
  slug: "faq",
  interfaceName: "FaqBlock",
  labels: { singular: "Veelgestelde vragen", plural: "Veelgestelde vragen-secties" },
  fields: [
    {
      name: "background",
      label: "Achtergrond",
      type: "select",
      defaultValue: "offwhite",
      options: [
        { label: "Gebroken wit (#F4F4F1)", value: "offwhite" },
        { label: "Wit", value: "white" },
        { label: "Grijs (#DDDDD3)", value: "gray" },
        { label: "Zwart", value: "black" },
      ],
    },
    { name: "heading", label: "Kop", type: "text", defaultValue: "Veelgestelde vragen" },
    {
      name: "items",
      label: "Vragen",
      type: "array",
      minRows: 1,
      labels: { singular: "Vraag", plural: "Vragen" },
      fields: [
        { name: "question", label: "Vraag", type: "text", required: true },
        { name: "answer", label: "Antwoord", type: "richText", required: true },
      ],
    },
    { name: "outro", label: "Afsluitende tekst (bv. “Klaar?”)", type: "text" },
    { name: "cta", label: "Knop", type: "group", fields: ctaFields },
  ],
};
