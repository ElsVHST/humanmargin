/**
 * PageSeed: elementor-828 — "SAMENWERKEN" (humanmargin.eu/elementor-828/)
 * Hello Elementor-paginatitel ("Samenwerken", witte band) boven één split-sectie:
 * donkere tekstkolom links, foto rechts (40-1.jpg).
 * Slug blijft "elementor-828" (zo staat de pagina live).
 */
import { link, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "pageTitle" as const,
    title: "Samenwerken",
  },
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/40-1.jpg"),
    annotation: "Big no-no",
    annotationFont: "handwritten" as const,
    annotationColor: "blue" as const,
    annotationPosition: "belowHeading" as const,
    heading: "SAMENWERKEN",
    headingLevel: "h2" as const,
    body: richText([
      "De beste ideeën zijn zelden van één iemand.",
      "En sparren is nieuwsgierigheid in een gesprek.",
      "Heb je een idee, wil je een podcast opnemen, samen iets maken, of gewoon eens hardop denken over waar dit allemaal heen gaat? Ik luister graag.",
      "Maar wat me niet trekt: de vage “laten we eens synergie zoeken”-mail, of schaamteloos brainpicken.",
      "Schrijf je liever samen in de marge dan met de massa mee? Laat van je horen.",
      paragraph([
        text("Mail "),
        link("els@humanmargin.eu", "mailto:els@humanmargin.eu"),
        text("."),
      ]),
    ]),
  },
];

const page: PageSeed = {
  title: "Samenwerken",
  slug: "elementor-828",
  layout,
  meta: {
    title: "SAMENWERKEN - Human Margin",
    description: "De beste ideeën zijn zelden van één iemand.",
  },
};

export default page;
