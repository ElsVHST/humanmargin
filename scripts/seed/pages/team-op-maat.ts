/**
 * PageSeed: team-op-maat — exacte content van humanmargin.eu/team-op-maat/
 */
import { FORMAT_ITALIC, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  // Sectie 0 — donkere hero: foto links, kop + gele subkop + tekst + gele knop rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/3.jpg"),
    heading: "Maatwerk voor teams",
    subheading: "Een bedrijf met een team werkt anders dan een zelfstandige.",
    headingLevel: "h1" as const,
    body: richText([
      "Meer mensen, tools, meningen. En meer manieren waarop dingen mis kunnen lopen.",
      "En dus ook meer redenen waarom een standaardoplossing zelden werkt.",
      "Daarom begin ik met begrijpen wie jullie zijn, hoe jullie werken en wat jullie nodig hebben. Zodat je een beleid hebt dat ook degelijk landt bij jouw mensen.",
    ]),
    cta: { label: "Plan een gesprek", href: "/contact", variant: "yellow" as const },
  },
  // Sectie 1 — gele penseelstreek links, korte notitie.
  {
    blockType: "brushNote" as const,
    body: richText([
      "Geen prijs op deze pagina.",
      "En met opzet.",
      "Elk bedrijf is anders. In een gesprek bepalen we samen wat nodig is, zodat je weet waar je aan toe bent.",
    ]),
    brushImage: media(
      "https://humanmargin.eu/wp-content/uploads/2026/06/in-de-marge-e1781177869154-327x1024.png",
    ),
  },
  // Sectie 2 — gebroken wit: tekst links met pijl-lijst, foto rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "offwhite" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/14-1.jpg"),
    heading: "Voor wie?",
    headingLevel: "h2" as const,
    body: richText([
      "Voor organisaties groter dan één persoon.",
      "Bijvoorbeeld wanneer:",
    ]),
    arrowList: [
      { text: "meerdere medewerkers AI gebruiken" },
      { text: "er verschillende AI-tools of systemen in gebruik zijn" },
      { text: "je behoefte hebt aan één duidelijke lijn voor de hele organisatie" },
      { text: "er meerdere betrokkenen zijn die mee moeten in hetzelfde verhaal." },
    ],
    arrowColor: "blue" as const,
    bodyBottom: richText([
      "Werk je daarnaast ook in een hoog-risicodomein?",
      "Dan nemen we dat gewoon mee in hetzelfde gesprek.",
    ]),
  },
  // Sectie 3 — donkere longform: kop + gele subkop + tekst.
  {
    blockType: "longformDark" as const,
    heading: "Hoe het werkt",
    highlight:
      "Het begint met een gesprek. Ik wil je bedrijf snappen: wie gebruikt wat, waar zit het risico, en wat staat er al.",
    bodyTop: richText([
      "Daarna bouwen we een aanpak op maat: beleid, afspraken en training, zodat je team niet alleen wéét wat mag, maar het ook doet. En zodat je het nodige doet. Niet te weinig, maar ook niet te veel.",
      "Geen dik rapport dat in een la verdwijnt, zo hebben we er genoeg. Maar wat werkt op de vloer zodat mensen weten wat ze moeten doen en dat ook daadwerkelijk doen.",
    ]),
  },
  // Sectie 4 — wit: foto links, "Waarom ik?" + tekst + blauwe knop rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "white" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/Els-1-1024x1024.png"),
    heading: "Waarom ik?",
    headingLevel: "h2" as const,
    body: richText([
      "Omdat ik zelf al meer dan vijftien jaar ondernemer ben en ik in verschillende bedrijven heb meegedraaid, zowel van mezelf als van anderen.",
      "Omdat ik weet hoeveel ballen je tegelijk in de lucht probeert te houden.",
      "Omdat beleid pas werkt als het op de vloer landt in plaats van in een la.",
      "Omdat ik je het advies geef dat ik zelf zou willen krijgen, en de scope reken die je echt nodig hebt. Geen duurste-traject-verkoper.",
      "Omdat ik liever heb dat je een probleem niet hebt, dan dat ik er een traject rond moet verkopen.",
      "Omdat ik Certified AI Compliance Officer (CAICO®) ben en Gewoon Mens spreek, zodat niet alleen jij het snapt, maar je hele team.",
    ]),
    cta: { label: "meer over mij", href: "/over-mij", variant: "blue" as const },
  },
  // Sectie 5 — donkere prijssectie: kop + tekst + gele knop.
  {
    blockType: "longformDark" as const,
    heading: "Wat het kost",
    bodyTop: richText([
      "Dat hangt af van de omvang van je toepassing, de sector waarin je werkt en wat er al aanwezig is.",
      "Daarom werken we niet met vaste pakketten.",
      "Na een eerste gesprek krijg je een duidelijke inschatting van de aanpak, de scope en de investering.",
      "Dan weet je waar je aan toe bent.",
    ]),
    cta: { label: "Plan een gesprek", href: "/contact", variant: "yellow" as const },
  },
  // Sectie 5 (vervolg) — mailregel + juridische disclaimer, zwarte achtergrond.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    columns: [
      {
        body: richText([
          "Of mail me op info@humanmargin.eu",
          paragraph([
            text(
              "Human Margin biedt geen juridisch advies. Een maatwerktraject helpt je je AI-gebruik in kaart te brengen, beleid op te stellen en je team mee te krijgen. Of je uiteindelijk aan alle wettelijke vereisten voldoet, blijft jouw verantwoordelijkheid.",
              FORMAT_ITALIC,
            ),
          ]),
        ]),
      },
    ],
  },
];

const page: PageSeed = {
  title: "TEAM op maat",
  slug: "team-op-maat",
  layout,
  meta: {
    title: "TEAM op maat - Human Margin",
    description:
      "Meer mensen, tools, meningen. En meer manieren waarop dingen mis kunnen lopen.",
  },
};

export default page;
