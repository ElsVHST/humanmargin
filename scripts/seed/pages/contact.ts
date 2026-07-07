/**
 * PageSeed: contact — exacte content van humanmargin.eu/contact/
 * Sectie 0: donkere splitPhotoText (foto rechts) met LinkedIn- en e-mail-link.
 * Sectie 1: Calendly-agenda-embed op grijze achtergrond.
 */
import { link, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/34.jpg"),
    heading: "Contact",
    headingLevel: "h1" as const,
    body: richText([
      "Geen formulier, geen ticketsysteem, geen bot die “ik begrijp je vraag” zegt en je vraag dan niet begrijpt.",
      "Gewoon ik.",
      "En dat kan op verschillende manieren.",
      paragraph([
        text("Vind me op "),
        link("LinkedIn", "https://www.linkedin.com/in/els-verheirstraeten/", true),
        text("."),
      ]),
      paragraph([
        text("Of mail me op "),
        link("els@humanmargin.eu", "mailto:els@humanmargin.eu"),
        text("."),
      ]),
      "Ik antwoord zelf. Dat duurt soms iets langer.",
    ]),
  },
  {
    blockType: "calendlyEmbed" as const,
    background: "gray" as const,
    heading: "Liever oldschool telefoneren of gewoon even videobellen?",
    annotation: "Plan iets in mijn agenda.",
    calendlyUrl: "https://calendly.com/human-margin-info/30min",
  },
];

const page: PageSeed = {
  title: "Contact",
  slug: "contact",
  layout,
  meta: {
    title: "Contact - Human Margin",
    description:
      "Geen formulier, geen ticketsysteem, geen bot die \"ik begrijp je vraag\" zegt en je vraag dan niet begrijpt.",
  },
};

export default page;
