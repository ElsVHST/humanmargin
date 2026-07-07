/**
 * PageSeed: linkjes — exacte content van humanmargin.eu/linkjes/
 * Sectie 0: linkButtons (logo + gestapelde knoppen) op zwart.
 * Sectie 1: brushNote "In de Marge" met nieuwsbrief-formulier.
 */
import { richText } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    blockType: "linkButtons" as const,
    logo: media(
      "https://humanmargin.eu/wp-content/uploads/2026/06/human-margin-logo-inverted-rgb-900px-w-72ppi.png",
    ),
    links: [
      { label: "Home", href: "/", variant: "blue" as const },
      { label: "AI Reality check", href: "/ai-reality-check", variant: "yellow" as const },
      { label: "Manifest", href: "/manifest", variant: "blue" as const },
    ],
  },
  {
    blockType: "brushNote" as const,
    markerHeading: "In de Marge",
    body: richText([
      "Af en toe stuur ik een mail. Niet omdat een contentkalender dat zegt, maar omdat ik iets gelezen, geleerd of uitgezocht heb dat de moeite waard is om door te geven.",
      "Over AI, de AI Act, werk en mens blijven in een tijd die je voortdurend het tegenovergestelde probeert aan te praten.",
    ]),
    showForm: true,
    formButtonLabel: "Schrijf me in",
  },
];

const page: PageSeed = {
  title: "Linkjes",
  slug: "linkjes",
  layout,
  meta: {
    title: "Linkjes - Human Margin",
    description:
      "Af en toe stuur ik een mail. Niet omdat een contentkalender dat zegt, maar omdat ik iets gelezen, geleerd of uitgezocht heb dat de moeite waard is om door te",
  },
};

export default page;
