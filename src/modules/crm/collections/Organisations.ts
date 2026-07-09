import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { adresGroup, eigenaarField, tagsField } from "@/modules/shared/fields";

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
    {
      // Beheerbare lijst (MKB-plan B3) — was vrije tekst, gemigreerd 2026-07-09
      name: "sector",
      label: "Sector",
      type: "relationship",
      relationTo: "sectoren",
    },
    { name: "logo", label: "Logo", type: "upload", relationTo: "media" },
    { name: "notities", label: "Notities", type: "textarea" },
    adresGroup("bezoekadres", "Bezoekadres"),
    {
      name: "postadresZelfde",
      label: "Postadres gelijk aan bezoekadres",
      type: "checkbox",
      defaultValue: true,
    },
    adresGroup("postadres", "Postadres", (data) => !data?.postadresZelfde),
    {
      name: "factuuradresZelfde",
      label: "Factuuradres gelijk aan postadres",
      type: "checkbox",
      defaultValue: true,
    },
    adresGroup(
      "factuuradres",
      "Factuuradres",
      (data) => !data?.factuuradresZelfde,
    ),
    {
      name: "facturatie",
      label: "Factuurgegevens",
      type: "group",
      fields: [
        { name: "kvkNummer", label: "KvK-nummer", type: "text" },
        { name: "btwNummer", label: "BTW-nummer", type: "text" },
        { name: "iban", label: "IBAN", type: "text" },
        { name: "tenaamstelling", label: "Tenaamstelling", type: "text" },
        { name: "factuurEmail", label: "Factuur-e-mailadres", type: "text" },
        {
          name: "betaaltermijnDagen",
          label: "Betaaltermijn (dagen)",
          type: "number",
          defaultValue: 30,
          min: 0,
        },
      ],
    },
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
