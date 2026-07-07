import type { CollectionConfig } from "payload";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Aanmelding", plural: "Aanmeldingen" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "source", "createdAt"],
    group: "Beheer",
    description: "Nieuwsbrief-aanmeldingen via de formulieren op de site",
  },
  access: {
    // publiek mag aanmelden; alleen ingelogde redactie mag lezen/beheren
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", label: "Naam", type: "text" },
    { name: "email", label: "E-mail", type: "email", required: true, unique: true },
    {
      name: "source",
      label: "Bron",
      type: "text",
      admin: { description: "Pagina waar de aanmelding vandaan kwam" },
    },
  ],
};
