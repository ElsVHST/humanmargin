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
    {
      name: "nieuwsbriefStatus",
      label: " ",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/NieuwsbriefStatus#NieuwsbriefStatusField",
        },
      },
    },
    { name: "extraEmails", label: "Extra e-mailadressen", type: "text", hasMany: true },
    { name: "telefoons", label: "Telefoonnummers", type: "text", hasMany: true },
    {
      // Beheerbare lijst (MKB-plan B3) — was vrije tekst, gemigreerd 2026-07-09
      name: "functie",
      label: "Functie",
      type: "relationship",
      relationTo: "functies",
    },
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
    {
      // Tweede as van Els's kwadrant (W8/W14): AI-risicoklasse van de relatie
      name: "risicoklasse",
      label: "Risicoklasse",
      type: "select",
      options: [
        { label: "Hoog risico", value: "hoog" },
        { label: "Verboden", value: "verboden" },
        { label: "Geen risico", value: "geen" },
      ],
      admin: { position: "sidebar" },
    },
    {
      // Pipedrive-kern (W13): geen relatie zonder geplande volgende actie
      name: "opvolgenOp",
      label: "Opvolgen op",
      type: "date",
      admin: { position: "sidebar" },
    },
    tagsField,
    {
      // Waarden van Els's eigen CRM-velden (crm-velden-collectie, MKB-plan B4):
      // { [sleutel]: waarde }. Beheer via de panelen, niet via de admin-editor.
      name: "extraVelden",
      label: "Extra velden",
      type: "json",
      admin: { hidden: true },
    },
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
