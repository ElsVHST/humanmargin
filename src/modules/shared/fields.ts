import type { Field } from "payload";

/** Eigenaar-relatie met automatische default naar de ingelogde gebruiker. */
export const eigenaarField: Field = {
  name: "eigenaar",
  label: "Eigenaar",
  type: "relationship",
  relationTo: "users",
  defaultValue: ({ user }) => user?.id,
  admin: { position: "sidebar" },
};

/** Vrije tekst-tags (spec §3). */
export const tagsField: Field = {
  name: "tags",
  label: "Tags",
  type: "text",
  hasMany: true,
};

/** Kennisbank-documenten als referentie — op deals, taken, content en projecten,
    zodat context overal meereist (Asana attachments / Pipedrive files-patroon). */
export const referentiesField: Field = {
  name: "referenties",
  label: "Referenties (kennisbank)",
  type: "relationship",
  relationTo: "knowledge-docs",
  hasMany: true,
  admin: {
    description: "Documenten of bestanden uit de kennisbank die context geven.",
  },
};
