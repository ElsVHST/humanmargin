import type { Block } from "payload";

// Grijze e-book-weggever (lead magnet). Twee kolommen: links de e-book-cover
// (afbeelding), rechts kop + introtekst + aanmeldformulier (Naam/E-mail +
// download-knop). Placeholderpagina van humanmargin.eu/weggever/.
export const EbookOptinBlock: Block = {
  slug: "ebookOptin",
  interfaceName: "EbookOptinBlock",
  labels: { singular: "E-book weggever", plural: "E-book weggevers" },
  fields: [
    { name: "heading", label: "Kop", type: "text" },
    { name: "body", label: "Introtekst", type: "richText" },
    {
      name: "buttonLabel",
      label: "Knoptekst",
      type: "text",
      defaultValue: "Download",
    },
    {
      name: "image",
      label: "E-book-cover (links)",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optioneel. Leeg = lege kolom links." },
    },
  ],
};
