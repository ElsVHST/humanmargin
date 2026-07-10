import type { CollectionConfig } from "payload";

import {
  beheerderFieldOnly,
  isAuthenticated,
  isBeheerder,
  isBeheerderOrSelf,
} from "@/modules/shared/access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Gebruiker", plural: "Gebruikers" },
  auth: { useAPIKey: true },
  access: {
    read: isAuthenticated,
    create: isBeheerder,
    update: isBeheerderOrSelf,
    delete: isBeheerder,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Beheer",
  },
  fields: [
    { name: "name", label: "Naam", type: "text", required: true },
    {
      name: "role",
      label: "Rol",
      type: "select",
      required: true,
      defaultValue: "teamlid",
      saveToJWT: true,
      options: [
        { label: "Beheerder", value: "beheerder" },
        { label: "Teamlid", value: "teamlid" },
      ],
      access: { update: beheerderFieldOnly },
      admin: {
        description:
          "Beheerders beheren gebruikers, kolommen en de prullenbak; teamleden werken in alle domeinen.",
      },
    },
    {
      // Per-gebruiker lijstinstellingen (MKB-plan B5): kolomkeuze + sortering
      // per werkblad. Zelf bij te werken (isBeheerderOrSelf op de collectie).
      name: "lijstVoorkeuren",
      label: "Lijstvoorkeuren",
      type: "json",
      admin: { hidden: true },
    },
  ],
};
