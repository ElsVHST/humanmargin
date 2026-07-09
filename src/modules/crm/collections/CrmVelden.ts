import type { CollectionConfig } from "payload";

import { VELD_TYPES } from "@/modules/crm/veldTypes";
import { isAuthenticated, isBeheerder } from "@/modules/shared/access";

/** Label → stabiele sleutel voor de json-waarden (verandert nooit meer). */
function naarSleutel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Door Els beheerbare velddefinities voor het CRM (MKB-plan B4, Pipedrive
 * "data fields"): definities als data, waarden in `extraVelden` (json) op
 * organisations/contacts. Archiveren (prullenbak) is nooit destructief —
 * de waarden blijven in de json staan.
 */
export const CrmVelden: CollectionConfig = {
  slug: "crm-velden",
  labels: { singular: "CRM-veld", plural: "CRM-velden" },
  orderable: true,
  trash: true,
  access: {
    read: isAuthenticated,
    create: isBeheerder,
    update: isBeheerder,
    delete: isBeheerder,
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "type", "geldtVoor"],
    group: "CRM",
  },
  typescript: { interface: "CrmVeld" },
  fields: [
    { name: "label", label: "Label", type: "text", required: true },
    {
      name: "sleutel",
      label: "Sleutel",
      type: "text",
      unique: true,
      access: { update: () => false },
      admin: {
        readOnly: true,
        description:
          "Automatisch afgeleid van het label bij aanmaken; verandert nooit (de opgeslagen waarden hangen eraan).",
      },
      hooks: {
        beforeValidate: [
          ({ data, operation, value }) =>
            operation === "create" && !value && data?.label
              ? naarSleutel(data.label as string)
              : value,
        ],
      },
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      defaultValue: "tekst",
      options: [...VELD_TYPES],
    },
    {
      name: "opties",
      label: "Opties",
      type: "text",
      hasMany: true,
      admin: {
        condition: (data) =>
          data?.type === "select" || data?.type === "multiselect",
        description: "De keuzes voor keuzelijst/meerkeuze-velden.",
      },
    },
    {
      name: "geldtVoor",
      label: "Geldt voor",
      type: "select",
      required: true,
      defaultValue: "beide",
      options: [
        { label: "Organisaties", value: "organisaties" },
        { label: "Contactpersonen", value: "contacten" },
        { label: "Beide", value: "beide" },
      ],
    },
  ],
};
