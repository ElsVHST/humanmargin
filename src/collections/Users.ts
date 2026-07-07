import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Gebruiker", plural: "Gebruikers" },
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email"],
    group: "Beheer",
  },
  fields: [{ name: "name", label: "Naam", type: "text", required: true }],
};
