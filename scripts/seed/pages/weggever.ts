/**
 * PageSeed: weggever — humanmargin.eu/weggever/
 *
 * Placeholder e-book-downloadpagina (nog met demo-/lorem-content). Origineel: grijze
 * sectie (#DDDDD3, 801px hoog), twee kolommen — links de e-book-cover, rechts een
 * gecentreerde kop ("Titel van je e-book hier", Archivo 40px), een introzin en een
 * aanmeldformulier (Naam + E-mail + gele knop "Download").
 *
 * Gemapt op het ebookOptin-blok. De linker cover-afbeelding (placeholder-1-1.png)
 * ontbreekt in de media-map en wordt weggelaten; de linkerkolom blijft dan leeg grijs.
 */
import { richText } from "../lexical";
import type { PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "ebookOptin" as const,
    heading: "Titel van je e-book hier",
    body: richText([
      "En leer al mijn geheimen. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum efficitur quam vel scelerisque consectetur.",
    ]),
    buttonLabel: "Download",
  },
];

const page: PageSeed = {
  title: "Weggever",
  slug: "weggever",
  layout,
  meta: {
    title: "Weggever - Human Margin",
    description:
      "En leer al mijn geheimen. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum efficitur quam vel scelerisque consectetur.",
  },
};

export default page;
