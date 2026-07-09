import type { CollectionConfig } from "payload";

import { createPageOnPlan } from "@/modules/content/hooks/createPageOnPlan";
import { dashboardCollectionAccess } from "@/modules/shared/access";
import { referentiesField } from "@/modules/shared/fields";

export const ContentItems: CollectionConfig = {
  slug: "content-items",
  labels: { singular: "Content-item", plural: "Content-items" },
  trash: true,
  access: dashboardCollectionAccess,
  hooks: { afterChange: [createPageOnPlan] },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "kanaal", "status", "publishDate"],
    group: "Content",
  },
  fields: [
    { name: "titel", label: "Titel", type: "text", required: true },
    {
      name: "kanaal",
      label: "Kanaal",
      type: "relationship",
      relationTo: "content-channels",
      admin: {
        description:
          "Waar dit verschijnt. Een blog-kanaal maakt bij status 'Gepland' automatisch een conceptpagina op de site.",
      },
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: "idee",
      options: [
        { label: "Idee", value: "idee" },
        { label: "Concept", value: "concept" },
        { label: "Gepland", value: "gepland" },
        { label: "Gepubliceerd", value: "gepubliceerd" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "publishDate",
      label: "Geplande datum",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Zonder datum verschijnt dit item alleen in de lijstweergave.",
      },
    },
    {
      name: "brief",
      label: "Brief / omschrijving",
      type: "textarea",
      admin: {
        description: "Korte werkomschrijving — de echte content leeft in de gekoppelde pagina of het kanaal zelf.",
      },
    },
    {
      name: "gekoppeldePagina",
      label: "Gekoppelde pagina",
      type: "relationship",
      relationTo: "pages",
      admin: {
        description: "De sitepagina waar deze content leeft (blogposts).",
      },
    },
    {
      name: "organisatie",
      label: "Organisatie",
      type: "relationship",
      relationTo: "organisations",
    },
    {
      name: "project",
      label: "Project",
      type: "relationship",
      relationTo: "projects",
    },
    {
      name: "toegewezen",
      label: "Toegewezen aan",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
    },
    { name: "publicatielink", label: "Publicatielink", type: "text" },
    referentiesField,
    {
      // Gereserveerd voor multi-kanaal/threads later (Postiz-model)
      name: "groupId",
      label: "Groep",
      type: "text",
      admin: { hidden: true },
    },
  ],
};
