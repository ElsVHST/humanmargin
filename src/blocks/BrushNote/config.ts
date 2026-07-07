import type { Block } from "payload";

// Terugkerende donkere sectie met gele penseelstreek links. Drie varianten,
// allemaal met dezelfde velden:
//  a) Nieuwsbrief-aanmelding — markerHeading "In de Marge" + body + showForm
//  b) Korte notitie — alleen body (evt. markerHeading)
//  c) Quote — body (het citaat) + attribution (naam in geel handschrift eronder)
export const BrushNoteBlock: Block = {
  slug: "brushNote",
  interfaceName: "BrushNoteBlock",
  labels: { singular: "Marge-notitie", plural: "Marge-notities" },
  fields: [
    {
      name: "markerHeading",
      label: "Gele handschrift-kop",
      type: "text",
      admin: { description: 'Marker-lettertype, geel, bovenaan (bijv. "In de Marge"). Leeg laten mag.' },
    },
    { name: "body", label: "Tekst", type: "richText" },
    {
      name: "attribution",
      label: "Naam bij quote",
      type: "text",
      admin: {
        description: 'Geel handschrift onder de tekst (bijv. "- Stephan Molle"). Alleen voor de quote-variant.',
      },
    },
    {
      name: "showForm",
      label: "Toon nieuwsbrief-formulier",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "formButtonLabel",
      label: "Knoptekst formulier",
      type: "text",
      defaultValue: "Schrijf me in",
      admin: { condition: (_, siblingData) => Boolean(siblingData?.showForm) },
    },
    {
      name: "brushImage",
      label: "Penseelstreek (geel)",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optioneel. Leeg = standaard gele penseelstreek." },
    },
  ],
};
