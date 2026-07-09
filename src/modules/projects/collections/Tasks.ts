import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { referentiesField } from "@/modules/shared/fields";

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
      name: "organisatie",
      label: "Organisatie / klant",
      type: "relationship",
      relationTo: "organisations",
      admin: {
        description: "De klant waar deze taak bij hoort (uit het CRM).",
      },
    },
    referentiesField,
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
      // In-the-loop OS (OP1): context die de opdrachtgever al weet — de agent
      // leest dit vóór hij begint en gokt nooit
      name: "contextVooraf",
      label: "Context die ik al weet",
      type: "textarea",
      admin: {
        description:
          "Alles wat de uitvoerder (mens of agent) moet weten voordat het werk start.",
      },
    },
    {
      name: "definitionOfDone",
      label: "Definition of done",
      type: "textarea",
      admin: {
        description: "Wanneer is deze taak écht af?",
      },
    },
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
