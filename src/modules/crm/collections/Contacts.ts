import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { eigenaarField, tagsField } from "@/modules/shared/fields";

export const Contacts: CollectionConfig = {
  slug: "contacts",
  labels: { singular: "Contactpersoon", plural: "Contactpersonen" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "naam",
    defaultColumns: ["naam", "email", "organisatie", "eigenaar"],
    group: "CRM",
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "voornaam", label: "Voornaam", type: "text", required: true },
        { name: "achternaam", label: "Achternaam", type: "text" },
      ],
    },
    {
      // Samengesteld weergaveveld voor useAsTitle en relaties
      name: "naam",
      label: "Volledige naam",
      type: "text",
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) =>
            [siblingData.voornaam, siblingData.achternaam]
              .filter(Boolean)
              .join(" "),
        ],
      },
    },
    {
      name: "email",
      label: "E-mailadres",
      type: "email",
      required: true,
      unique: true,
      admin: {
        description:
          "Uniek — dit is de matchsleutel voor nieuwsbriefstatus en latere e-mailkoppeling.",
      },
    },
    { name: "extraEmails", label: "Extra e-mailadressen", type: "text", hasMany: true },
    { name: "telefoons", label: "Telefoonnummers", type: "text", hasMany: true },
    { name: "functie", label: "Functie", type: "text" },
    { name: "linkedin", label: "LinkedIn", type: "text" },
    { name: "avatar", label: "Foto", type: "upload", relationTo: "media" },
    {
      name: "organisatie",
      label: "Organisatie",
      type: "relationship",
      relationTo: "organisations",
    },
    {
      name: "deals",
      label: "Deals",
      type: "join",
      collection: "deals",
      on: "contactpersoon",
    },
    { name: "bron", label: "Bron", type: "text" },
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
