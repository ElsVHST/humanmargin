import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { eigenaarField, tagsField } from "@/modules/shared/fields";

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projecten" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "naam",
    defaultColumns: ["naam", "status", "organisatie", "deadline"],
    group: "Projecten",
  },
  fields: [
    { name: "naam", label: "Naam", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: "actief",
      options: [
        { label: "Actief", value: "actief" },
        { label: "Gepauzeerd", value: "gepauzeerd" },
        { label: "Afgerond", value: "afgerond" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "organisatie",
      label: "Organisatie (klant)",
      type: "relationship",
      relationTo: "organisations",
      admin: {
        description: "Leeg laten voor interne projecten.",
      },
    },
    {
      name: "deal",
      label: "Voortgekomen uit deal",
      type: "relationship",
      relationTo: "deals",
      admin: { position: "sidebar" },
    },
    {
      name: "teamleden",
      label: "Teamleden",
      type: "relationship",
      relationTo: "users",
      hasMany: true,
    },
    {
      type: "row",
      fields: [
        { name: "startdatum", label: "Startdatum", type: "date" },
        { name: "deadline", label: "Deadline", type: "date" },
      ],
    },
    { name: "omschrijving", label: "Omschrijving", type: "textarea" },
    {
      name: "taken",
      label: "Taken",
      type: "join",
      collection: "tasks",
      on: "project",
    },
    tagsField,
    eigenaarField,
    {
      name: "timeline",
      label: "Tijdlijn",
      type: "ui",
      admin: {
        components: { Field: "/components/admin/Timeline#TimelineField" },
      },
    },
  ],
};
