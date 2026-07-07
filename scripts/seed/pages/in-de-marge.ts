/**
 * PageSeed: in-de-marge — exacte content van humanmargin.eu/in-de-marge/
 * Donkere intro (foto links + kop + gele subkop + tekst) + nieuwsbrief-aanmelding.
 */
import { FORMAT_ITALIC, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    // Donkere intro: foto links + "NIET ALLES HOEFT..." + gele subkop + witte tekst.
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/3.jpg"),
    heading: "Niet alles hoeft een algoritme tevreden te houden.",
    headingLevel: "h1" as const,
    subheading: "En niet alles hoeft drie seconden na publicatie alweer vergeten te zijn.",
    body: richText([
      "Af en toe stuur ik iets. Niet volgens een contentkalender, niet op een vaste dag.",
      "Alleen als ik echt wat te vertellen heb. Time is veel waardevoller dan money, dus ik ga er spaarzaam mee om. Met de jouwe en de mijne.",
      "Dus f*ck het algoritme en marketinggoeroes. I do it my way.",
      paragraph([
        text("Verwacht hier geen tips en trucs, geen "),
        text("“vijf manieren om”", FORMAT_ITALIC),
        text(
          ". Wel wat ik lees, denk en ontdek over AI, werk en mens blijven in een tijd die je voortdurend het tegenovergestelde probeert aan te praten.",
        ),
      ]),
      "En dan vooral wat ik in de marge schreef.",
      "Mijn lievelingsplek, en de plaats waar alles gebeurt.",
    ]),
    // Nieuwsbrief-aanmelding in dezelfde tekstkolom, onder de tekst (origineel:
    // alles staat in één donkere sectie naast de foto).
    markerHeading: "Ontvang 'in de marge'",
    showForm: true,
    formButtonLabel: "Schrijf me in",
  },
];

const page: PageSeed = {
  title: "In de marge",
  slug: "in-de-marge",
  layout,
  meta: {
    title: "In de marge - Human Margin",
    description: "Af en toe stuur ik iets. Niet volgens een contentkalender, niet op een vaste dag.",
  },
};

export default page;
