import type { Block } from "payload";

import { ctaFields } from "@/components/HmButton";

export const SplitPhotoTextBlock: Block = {
  slug: "splitPhotoText",
  interfaceName: "SplitPhotoTextBlock",
  labels: { singular: "Foto + tekst", plural: "Foto + tekst-secties" },
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
    {
      name: "imagePosition",
      label: "Fotopositie",
      type: "select",
      defaultValue: "left",
      options: [
        { label: "Links", value: "left" },
        { label: "Rechts", value: "right" },
      ],
    },
    {
      name: "imageTreatment",
      label: "Foto-weergave",
      type: "select",
      defaultValue: "full",
      options: [
        { label: "Rand-tot-rand (vullend)", value: "full" },
        { label: "Ingesprongen (met marge)", value: "inset" },
      ],
    },
    { name: "image", label: "Foto", type: "upload", relationTo: "media", required: true },
    {
      name: "annotation",
      label: "Handgeschreven annotatie (blauw)",
      type: "text",
    },
    {
      name: "annotationFont",
      label: "Annotatie-lettertype",
      type: "select",
      defaultValue: "handwritten",
      options: [
        { label: "Handgeschreven (Feisty)", value: "handwritten" },
        { label: "Marker (Atomic Marker)", value: "marker" },
      ],
      admin: { condition: (_, siblingData) => Boolean(siblingData?.annotation) },
    },
    {
      name: "annotationColor",
      label: "Annotatie-kleur",
      type: "select",
      defaultValue: "blue",
      options: [
        { label: "Blauw", value: "blue" },
        { label: "Geel", value: "yellow" },
      ],
      admin: { condition: (_, siblingData) => Boolean(siblingData?.annotation) },
    },
    {
      name: "annotationPosition",
      label: "Annotatie-positie",
      type: "select",
      defaultValue: "belowHeading",
      options: [
        { label: "Onder de kop (rechts uitgelijnd)", value: "belowHeading" },
        { label: "Boven de kop (links uitgelijnd)", value: "aboveHeading" },
      ],
      admin: { condition: (_, siblingData) => Boolean(siblingData?.annotation) },
    },
    { name: "heading", label: "Kop", type: "text" },
    {
      name: "subheading",
      label: "Gele subkop",
      type: "text",
      admin: { description: "Strakke Archivo-subkop in geel, onder de hoofdkop" },
    },
    {
      name: "headingLevel",
      label: "Kopniveau",
      type: "select",
      defaultValue: "h2",
      options: [
        { label: "H1 (paginakop)", value: "h1" },
        { label: "H2", value: "h2" },
      ],
    },
    { name: "body", label: "Tekst", type: "richText" },
    {
      name: "arrowList",
      label: "Pijl-lijst",
      type: "array",
      fields: [{ name: "text", label: "Tekst", type: "text", required: true }],
    },
    {
      name: "arrowColor",
      label: "Pijl-kleur",
      type: "select",
      defaultValue: "blue",
      options: [
        { label: "Blauw", value: "blue" },
        { label: "Geel", value: "yellow" },
      ],
      admin: { condition: (_, siblingData) => Boolean(siblingData?.arrowList?.length) },
    },
    { name: "bodyBottom", label: "Tekst onder de lijst", type: "richText" },
    { name: "cta", label: "Knop", type: "group", fields: ctaFields },
    {
      name: "markerHeading",
      label: "Gele handschrift-kop (onder de tekst)",
      type: "text",
      admin: {
        description:
          'Marker-lettertype in geel, onder de tekst (bijv. "Ontvang \'in de marge\'"). Voor de nieuwsbrief-variant.',
      },
    },
    {
      name: "showForm",
      label: "Toon nieuwsbrief-formulier",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "formButtonLabel",
      label: "Knoptekst formulier",
      type: "text",
      defaultValue: "Schrijf me in",
      admin: { condition: (_, siblingData) => Boolean(siblingData?.showForm) },
    },
  ],
};
