import type { Block } from "payload";

import { ctaFields } from "@/components/HmButton";

export const LongformDarkBlock: Block = {
  slug: "longformDark",
  interfaceName: "LongformDarkBlock",
  labels: { singular: "Donkere longform-sectie", plural: "Donkere longform-secties" },
  fields: [
    { name: "heading", label: "Kop", type: "text" },
    {
      name: "highlight",
      label: "Geel gemarkeerde subkop",
      type: "textarea",
    },
    {
      name: "bodyTop",
      label: "Tekst boven de afbeelding",
      type: "richText",
    },
    {
      name: "annotations",
      label: "Blauwe annotaties",
      type: "array",
      labels: { singular: "Annotatie", plural: "Annotaties" },
      admin: {
        description:
          "Decoratieve blauwe handgeschreven woorden. Op desktop rond de tekst geplaatst, op mobiel inline.",
      },
      fields: [
        { name: "text", label: "Tekst", type: "text", required: true },
        {
          name: "font",
          label: "Lettertype",
          type: "select",
          defaultValue: "handwritten",
          options: [
            { label: "Handgeschreven (Feisty)", value: "handwritten" },
            { label: "Marker (Atomic Marker)", value: "marker" },
          ],
        },
      ],
    },
    {
      name: "framedImage",
      label: "Ingekaderde afbeelding",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "bodyBottom",
      label: "Tekst onder de afbeelding",
      type: "richText",
    },
    {
      name: "arrowList",
      label: "Pijl-lijst",
      type: "array",
      labels: { singular: "Regel", plural: "Regels" },
      fields: [{ name: "text", label: "Regel", type: "text", required: true }],
    },
    { name: "cta", label: "Knop", type: "group", fields: ctaFields },
  ],
};
