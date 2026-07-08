import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";

export const Tasks: CollectionConfig = {
  slug: "tasks",
  labels: { singular: "Taak", plural: "Taken" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "status", "project", "toegewezen", "deadline"],
    group: "Projecten",
  },
  fields: [
    { name: "titel", label: "Titel", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "relationship",
      relationTo: "task-statuses",
      admin: {
        description:
          "Kolom op het taken-board. Leeg of verwijderde status = kolom 'Geen status'.",
      },
    },
    {
      name: "project",
      label: "Project",
      type: "relationship",
      relationTo: "projects",
      admin: {
        description: "Leeg laten voor een losse taak.",
      },
    },
    {
      name: "toegewezen",
      label: "Toegewezen aan",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
    },
    {
      name: "deadline",
      label: "Deadline",
      type: "date",
      admin: { position: "sidebar" },
    },
    {
      name: "prioriteit",
      label: "Prioriteit",
      type: "select",
      required: true,
      defaultValue: "normaal",
      options: [
        { label: "Laag", value: "laag" },
        { label: "Normaal", value: "normaal" },
        { label: "Hoog", value: "hoog" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "checklist",
      label: "Checklist",
      type: "array",
      labels: { singular: "Punt", plural: "Punten" },
      fields: [
        { name: "tekst", label: "Tekst", type: "text", required: true },
        { name: "klaar", label: "Klaar", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "omschrijving", label: "Omschrijving", type: "textarea" },
    {
      // Kaartvolgorde binnen een kolom (zelfde patroon als deals.position)
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
