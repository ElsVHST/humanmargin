import type { Block } from "payload";

// Hello Elementor default-pagina: de door het thema gerenderde paginatitel
// (page-header met entry-title) plus optionele lopende tekst (page-content).
// Gebruikt voor stub-pagina's zonder Elementor-inhoud (bio, neem-actie, ...).
export const PageTitleBlock: Block = {
  slug: "pageTitle",
  interfaceName: "PageTitleBlock",
  labels: { singular: "Paginatitel", plural: "Paginatitels" },
  fields: [
    { name: "title", label: "Titel", type: "text" },
    { name: "body", label: "Tekst (optioneel)", type: "richText" },
  ],
};
