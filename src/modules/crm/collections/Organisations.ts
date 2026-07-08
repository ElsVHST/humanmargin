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
