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

/** Herbruikbare adres-group (bezoek-, post- en factuuradres op organisaties). */
export function adresGroup(
  name: string,
  label: string,
  condition?: (data: Partial<Record<string, unknown>>) => boolean,
): Field {
  return {
    name,
    label,
    type: "group",
    ...(condition ? { admin: { condition } } : {}),
    fields: [
      { name: "straat", label: "Straat", type: "text" },
      { name: "huisnummer", label: "Huisnummer", type: "text" },
      { name: "postcode", label: "Postcode", type: "text" },
      { name: "plaats", label: "Plaats", type: "text" },
      { name: "land", label: "Land", type: "text", defaultValue: "Nederland" },
    ],
  };
}

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
