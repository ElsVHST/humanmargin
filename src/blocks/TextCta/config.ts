import type { Block } from "payload";

import { ctaFields } from "@/components/HmButton";

export const TextCtaBlock: Block = {
  slug: "textCta",
  interfaceName: "TextCtaBlock",
  labels: { singular: "Tekst + knop", plural: "Tekst + knop-secties" },
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
    { name: "body", label: "Tekst", type: "richText" },
    { name: "cta", label: "Knop", type: "group", fields: ctaFields },
  ],
};
