import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { eigenaarField, tagsField } from "@/modules/shared/fields";

export const Organisations: CollectionConfig = {
  slug: "organisations",
  labels: { singular: "Organisatie", plural: "Organisaties" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "naam",
    defaultColumns: ["naam", "sector", "eigenaar"],
    group: "CRM",
  },
  fields: [
    { name: "naam", label: "Naam", type: "text", required: true },
    { name: "website", label: "Website", type: "text" },
    { name: "linkedin", label: "LinkedIn", type: "text" },
    { name: "sector", label: "Sector", type: "text" },
    { name: "logo", label: "Logo", type: "upload", relationTo: "media" },
    { name: "notities", label: "Notities", type: "textarea" },
    {
      name: "contacten",
      label: "Contactpersonen",
      type: "join",
      collection: "contacts",
      on: "organisatie",
    },
    {
      name: "deals",
      label: "Deals",
      type: "join",
      collection: "deals",
      on: "organisatie",
    },
    {
      name: "projecten",
      label: "Projecten",
      type: "join",
      collection: "projects",
      on: "organisatie",
    },
    {
      // Leadlijst-basis (Pipedrive-labels): waar staat deze relatie?
      name: "relatietype",
      label: "Relatietype",
      type: "select",
      defaultValue: "prospect",
      options: [
        { label: "Prospect", value: "prospect" },
        { label: "Lead", value: "lead" },
        { label: "Klant", value: "klant" },
        { label: "Partner", value: "partner" },
        { label: "Overig", value: "overig" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "doelgroep",
      label: "Doelgroep",
      type: "select",
      options: [
        { label: "ZZP", value: "zzp" },
        { label: "MKB", value: "mkb" },
        { label: "Aanbieder", value: "aanbieder" },
        { label: "Overig", value: "overig" },
      ],
      admin: { position: "sidebar" },
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
