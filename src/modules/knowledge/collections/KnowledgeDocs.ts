import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { tagsField } from "@/modules/shared/fields";

export const KnowledgeDocs: CollectionConfig = {
  slug: "knowledge-docs",
  labels: { singular: "Kennisdocument", plural: "Kennisdocumenten" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "parent", "zichtbaarheid", "updatedAt"],
    group: "Kennisbank",
  },
  fields: [
    { name: "titel", label: "Titel", type: "text", required: true },
    {
      // Expliciet itemtype (myDrive-patroon); bestaande docs = "document"
      name: "soort",
      label: "Soort",
      type: "select",
      required: true,
      defaultValue: "document",
      options: [
        { label: "Map", value: "map" },
        { label: "Document", value: "document" },
        { label: "Bestand", value: "bestand" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "inhoud", label: "Inhoud", type: "richText" },
    {
      name: "bestand",
      label: "Bestand",
      type: "upload",
      relationTo: "knowledge-files",
      admin: {
        condition: (data) => data?.soort === "bestand",
        description: "Het geüploade bestand (alleen bij soort 'Bestand').",
      },
    },
    {
      name: "parent",
      label: "Hoort onder",
      type: "relationship",
      relationTo: "knowledge-docs",
      admin: {
        position: "sidebar",
        description: "Leeg = hoofdstuk op het hoogste niveau.",
      },
    },
    {
      name: "zichtbaarheid",
      label: "Zichtbaarheid",
      type: "select",
      required: true,
      defaultValue: "intern",
      options: [
        { label: "Intern (alleen team)", value: "intern" },
        { label: "Publiek (later op de site)", value: "publiek" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "organisatie",
      label: "Organisatie",
      type: "relationship",
      relationTo: "organisations",
      admin: { position: "sidebar" },
    },
    {
      name: "project",
      label: "Project",
      type: "relationship",
      relationTo: "projects",
      admin: { position: "sidebar" },
    },
    tagsField,
    {
      name: "auteur",
      label: "Auteur",
      type: "relationship",
      relationTo: "users",
      defaultValue: ({ user }) => user?.id,
      admin: { position: "sidebar" },
    },
    {
      // Sibling-volgorde in de boom (zelfde patroon als kaart-position)
      name: "position",
      label: "Positie",
      type: "number",
      index: true,
      admin: { hidden: true },
      hooks: {
        beforeChange: [({ value }) => (value == null ? Date.now() : value)],
      },
    },
  ],
};
