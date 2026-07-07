/**
 * PageSeed: leeszaal — exacte content van humanmargin.eu/leeszaal/
 * Overzichtspagina van de Leeszaal: donkere intro + 3 kaarten + nieuwsbrief.
 */
import { richText } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    // Sectie 0 (donker): foto links + "DE LEESZAAL." + gele subkop + witte tekst.
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/Leeszaal-6.png"),
    heading: "De leeszaal.",
    headingLevel: "h1" as const,
    subheading: "Niet alles hoeft te schreeuwen. Sommige dingen vragen om stilte.",
    body: richText([
      "Welkom in de Leeszaal.",
      "Hier verzamel ik wat ik schrijf, lees en de moeite waard vind.",
      "Hier beslis ik wat je te zien krijgt, in plaats van een algoritme.",
      "En kies jij wat je wil lezen, niet wat een slim ontworpen feed je voorschotelt.",
      "Het is even wennen. Maar je kan het, ik geloof in jou.",
    ]),
  },
  {
    // Sectie 1 (grijs): 3 kaarten met kop, tekst, gele knop en foto.
    blockType: "cardColumns" as const,
    background: "gray" as const,
    cards: [
      {
        heading: "In de marge.",
        body: richText([
          "Mijn nieuwsbrieven.",
          "Gedachten, observaties, frustraties, ontdekkingen en af en toe een rant.",
          "Alles wat ik de wereld instuur.",
          "Zonder contentkalender of filter.",
        ]),
        cta: { label: "Leer verder", href: "/in-de-marge", variant: "yellow" as const },
        image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
      },
      {
        heading: "In mensentaal.",
        body: richText([
          "Omdat niet iedereen tijd heeft om wetgeving, rapporten en beleidsdocumenten te ontcijferen.",
          "Hier vertaal ik complexe dingen naar gewone mensentaal.",
          "De AI Act, samenvattingen en andere zaken die volgens mij begrijpelijker mogen.",
        ]),
        cta: { label: "Lees verder", href: "/in-mensentaal", variant: "yellow" as const },
        image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
      },
      {
        // Origineel: derde kaart draagt (foutief) de kop "IN DE MARGE." maar gaat
        // inhoudelijk over Op de leestafel en linkt naar /op-de-leestafel.
        heading: "In de marge.",
        body: richText([
          "Wat ik zelf gelezen heb en de moeite vond om door te geven.",
          "Artikels van anderen. Boeken. Bronnen. Onderzoek.",
          "En natuurlijk ook de volledige AI Act voor wie liever rechtstreeks naar de bron gaat.",
        ]),
        cta: { label: "Lees verder", href: "/op-de-leestafel", variant: "yellow" as const },
        image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
      },
    ],
  },
  {
    // Sectie 2 (donker): gele penseelstreek + "In de Marge"-marker + nieuwsbrief.
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
  title: "Leeszaal",
  slug: "leeszaal",
  layout,
  meta: {
    title: "Leeszaal - Human Margin",
    description: "Welkom in de Leeszaal.",
  },
};

export default page;
