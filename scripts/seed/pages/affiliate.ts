/**
 * PageSeed: affiliate — exacte content van humanmargin.eu/affiliate/
 * Sectie 0: donkere splitPhotoText (foto rechts, rand-tot-rand).
 * Sectie 1: grijze splitPhotoText (portretfoto links, ingesprongen) met blauwe
 * handgeschreven annotatie en gele "Word affiliate"-knop.
 */
import { richText } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/8.jpg"),
    heading: "Affiliate",
    headingLevel: "h1" as const,
    body: richText([
      "Op een doordachte en verantwoorde manier met AI omgaan wordt elke dag belangrijker.",
      "Maar de PR-dienst van de Europese Commissie is helaas niet wat ’t zou moeten zijn.",
      "Dus moeten wij het maar doen.",
    ]),
  },
  {
    blockType: "splitPhotoText" as const,
    background: "gray" as const,
    imagePosition: "left" as const,
    imageTreatment: "inset" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
    heading: "Gratis reclame mag altijd.",
    headingLevel: "h2" as const,
    annotation: "Je moet weten waar je het over hebt.",
    annotationFont: "handwritten" as const,
    annotationColor: "blue" as const,
    annotationPosition: "belowHeading" as const,
    body: richText([
      "Maar heb je de AI Compliance Kit zelf gedaan, op wat voor manier dan ook, dan kan je ook affiliate worden.",
      "Deed je de Kit, ben je al margeschrijver, en zeg je toch al tegen anderen dat ze hun AI gebruik op orde moeten brengen?",
      "Dan kan je er net zo goed iets aan verdienen.",
      "Jij deelt het nieuws, ik deel de prijs. Je krijgt 20% commissie, en elke maand content om met je community te delen.",
      "Klaar om door te geven?",
    ]),
    cta: {
      label: "Word affiliate",
      href: "https://partners.plugandpay.com/signup?merchant_id=23265",
      variant: "yellow" as const,
    },
  },
];

const page: PageSeed = {
  title: "Affiliate",
  slug: "affiliate",
  layout,
  meta: {
    title: "Affiliate - Human Margin",
    description:
      "Op een doordachte en verantwoorde manier met AI omgaan wordt elke dag belangrijker.",
  },
};

export default page;
