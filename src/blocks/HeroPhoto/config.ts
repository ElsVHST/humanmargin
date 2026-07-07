import type { Block } from "payload";

import { ctaFields } from "@/components/HmButton";

export const HeroPhotoBlock: Block = {
  slug: "heroPhoto",
  interfaceName: "HeroPhotoBlock",
  labels: { singular: "Hero met foto", plural: "Hero's met foto" },
  fields: [
    {
      name: "image",
      label: "Achtergrondfoto",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "Full-width foto; eventuele tekst zit in de foto zelf" },
    },
    {
      name: "minHeight",
      label: "Minimale hoogte (px)",
      type: "number",
      defaultValue: 810,
    },
    {
      name: "contentPaddingTop",
      label: "Ruimte boven de knop (px)",
      type: "number",
      defaultValue: 300,
    },
    {
      name: "mobileMinHeight",
      label: "Minimale hoogte mobiel (px)",
      type: "number",
      admin: { description: "Optioneel. Leeg = desktop-hoogte × 0,45 op mobiel." },
    },
    {
      name: "mobileContentPaddingTop",
      label: "Ruimte boven de knop mobiel (px)",
      type: "number",
      admin: { description: "Optioneel. Leeg = desktop-waarde × 0,48 op mobiel." },
    },
    {
      name: "cta",
      label: "Knop",
      type: "group",
      fields: ctaFields,
    },
  ],
};
