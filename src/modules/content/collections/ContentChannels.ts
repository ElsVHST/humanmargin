import { makeColumnCollection } from "@/modules/shared/columnCollection";

export const ContentChannels = makeColumnCollection({
  slug: "content-channels",
  singular: "Contentkanaal",
  plural: "Contentkanalen",
  group: "Content",
  defaultKleur: "paars",
  extraFields: [
    {
      name: "type",
      label: "Kanaaltype",
      type: "select",
      required: true,
      defaultValue: "overig",
      options: [
        { label: "Blog", value: "blog" },
        { label: "Nieuwsbrief", value: "nieuwsbrief" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "Instagram", value: "instagram" },
        { label: "Overig", value: "overig" },
      ],
      admin: {
        description:
          "Vast type dat gedrag bepaalt (blog-kanaal koppelt aan sitepagina's). De naam hierboven is vrij te kiezen.",
      },
    },
  ],
});
