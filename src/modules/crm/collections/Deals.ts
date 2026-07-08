import type { CollectionConfig } from "payload";

import { logDealStatusChange } from "@/modules/crm/hooks/logDealStatusChange";
import { dashboardCollectionAccess } from "@/modules/shared/access";
import { eigenaarField } from "@/modules/shared/fields";

export const Deals: CollectionConfig = {
  slug: "deals",
  labels: { singular: "Deal", plural: "Deals" },
  trash: true,
  access: dashboardCollectionAccess,
  hooks: { afterChange: [logDealStatusChange] },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "organisatie", "fase", "uitkomst", "bedrag"],
    group: "CRM",
  },
  fields: [
    { name: "titel", label: "Titel", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "bedrag", label: "Bedrag", type: "number", min: 0 },
        {
          name: "valuta",
          label: "Valuta",
          type: "select",
          defaultValue: "EUR",
          options: [
            { label: "€ EUR", value: "EUR" },
            { label: "$ USD", value: "USD" },
          ],
        },
      ],
    },
    {
      name: "fase",
      label: "Fase",
      type: "relationship",
      relationTo: "deal-stages",
      admin: {
        description:
          "Kolom op het pipeline-board. Leeg of verwijderde fase = kolom 'Geen fase'.",
      },
    },
    {
      name: "uitkomst",
      label: "Uitkomst",
      type: "select",
      required: true,
      defaultValue: "open",
      options: [
        { label: "Open", value: "open" },
        { label: "Gewonnen", value: "gewonnen" },
        { label: "Verloren", value: "verloren" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "verlorenReden",
      label: "Reden verloren",
      type: "text",
      admin: {
        position: "sidebar",
        condition: (data) => data?.uitkomst === "verloren",
      },
    },
    {
      name: "verwachteSluitdatum",
      label: "Verwachte sluitdatum",
      type: "date",
      admin: { position: "sidebar" },
    },
    {
      name: "kans",
      label: "Kans (%)",
      type: "number",
      min: 0,
      max: 100,
      admin: { position: "sidebar" },
    },
    {
      name: "organisatie",
      label: "Organisatie",
      type: "relationship",
      relationTo: "organisations",
    },
    {
      name: "contactpersoon",
      label: "Contactpersoon",
      type: "relationship",
      relationTo: "contacts",
    },
    eigenaarField,
    {
      // Kaartvolgorde binnen een kolom (Twenty-patroon: numeriek, drop = fase+position in één update)
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
