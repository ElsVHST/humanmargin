import type { CollectionConfig } from "payload";

import { isAuthenticated, isBeheerder } from "@/modules/shared/access";

/**
 * Polymorfe timeline (spec §3, Twenty-referentie §2): één activiteit kan aan
 * meerdere CRM-entiteiten hangen. Fase 3 voegt 'projects' toe aan relationTo.
 * Types 'email' en 'boeking' zijn gereserveerd voor latere fases (spec §1).
 */
export const Activities: CollectionConfig = {
  slug: "activities",
  labels: { singular: "Activiteit", plural: "Activiteiten" },
  trash: true,
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isBeheerder,
    delete: isBeheerder,
  },
  admin: {
    useAsTitle: "type",
    defaultColumns: ["type", "happensAt", "auteur"],
    group: "CRM",
  },
  fields: [
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      defaultValue: "notitie",
      options: [
        { label: "Notitie", value: "notitie" },
        { label: "Statuswijziging", value: "statuswijziging" },
        { label: "Systeem", value: "systeem" },
        { label: "E-mail", value: "email" },
        { label: "Boeking", value: "boeking" },
        // In-the-loop OS: agent stelt vragen vóór hij handelt; LOG sluit taken af
        { label: "Vraag (agent)", value: "vraag" },
        { label: "LOG (beslissing)", value: "log" },
      ],
    },
    {
      name: "samenvatting",
      label: "Samenvatting",
      type: "text",
      admin: {
        description:
          "Korte regel voor de timeline (notities en automatische statuswijzigingen).",
      },
    },
    { name: "tekst", label: "Tekst", type: "richText" },
    {
      name: "targets",
      label: "Gekoppeld aan",
      type: "relationship",
      relationTo: [
        "organisations",
        "contacts",
        "deals",
        "projects",
        "tasks",
        "content-items",
        "knowledge-docs",
      ],
      hasMany: true,
      required: true,
    },
    {
      name: "auteur",
      label: "Auteur",
      type: "relationship",
      relationTo: "users",
      defaultValue: ({ user }) => user?.id,
      admin: { position: "sidebar" },
    },
    {
      name: "happensAt",
      label: "Datum",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "properties",
      label: "Details",
      type: "json",
      admin: { readOnly: true },
    },
  ],
};
