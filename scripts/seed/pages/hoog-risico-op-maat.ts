/**
 * PageSeed: hoog-risico-op-maat — exacte content van humanmargin.eu/hoog-risico-op-maat/
 */
import { FORMAT_BOLD, link, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  // Sectie 0 — donkere hero: foto links, kop + gele subkop + tekst + gele knop rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/3.jpg"),
    heading: "Hoog-risico maatwerk",
    subheading: "Werkt je AI mee aan beslissingen over mensen?",
    headingLevel: "h1" as const,
    body: richText([
      "Bijvoorbeeld in zorg, financiën, werving en selectie, onderwijs of een ander hoog-risico domein?",
      "Dan gelden de zwaarste regels van de AI Act.",
      "Dat klinkt erger dan het meestal is.",
      "Hoog-risico betekent niet dat je iets verkeerd doet. Het betekent wel dat er meer documentatie, meer controles en meer verantwoordelijkheid bij komen kijken.",
      "Dat regel je niet met een werkboek en meestal ook niet alleen.",
      "Daarom bestaat dit maatwerktraject.",
    ]),
    cta: { label: "Plan een gesprek", href: "/contact", variant: "yellow" as const },
  },
  // Sectie 1 — gele penseelstreek links, korte notitie met inline link.
  {
    blockType: "brushNote" as const,
    body: richText([
      "Geen prijs op deze pagina.",
      "En met opzet.",
      "Maatwerk laat zich niet vooraf in een pakket gieten. In een gesprek bepalen we samen de scope, zodat je weet waar je aan toe bent.",
      "Niet zeker of jouw toepassing hoog-risico is?",
      paragraph([link("Doe eerst de AI Reality Check", "/ai-reality-check")]),
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
      "Voor ondernemers en organisaties waarvan AI raakt aan beslissingen over mensen.",
      "Denk aan:",
    ]),
    arrowList: [
      { text: "zorg en gezondheid" },
      { text: "financiën en kredietverlening" },
      { text: "personeelsbeheer" },
      { text: "onderwijs en examinering" },
      { text: "of een ander terrein dat onder de hoog-risicoregels van de AI Act valt" },
    ],
    arrowColor: "blue" as const,
    bodyBottom: richText([
      "Niet zeker of jij hieronder valt?",
      paragraph([
        text("Dat is precies wat de "),
        link("AI Reality Check", "/ai-reality-check"),
        text(" voor je uitzoekt."),
      ]),
    ]),
  },
  // Sectie 3 — donkere longform: kop + gele subkop + tekst met bold accent.
  {
    blockType: "longformDark" as const,
    heading: "Hoe het werkt",
    highlight:
      "Het begint met een gesprek. Ik wil weten wat je doet, voor wie, en waar het tricky wordt.",
    bodyTop: richText([
      "Eerst bekijken we of jouw toepassing effectief hoog-risico is. Want soms blijkt dat niet zo te zijn. En andere keren kunnen we een toepassing anders organiseren waardoor ze niet langer onder de hoog-risicoregels valt.",
      "Als dat lukt, bespaar je jezelf een hoop tijd, energie en geld.",
      paragraph([
        text(
          "Ik heb liever dat je een probleem niet hebt, dan dat ik er een traject rond mag verkopen.",
          FORMAT_BOLD,
        ),
      ]),
      "Toch hoog risico? Dan stel ik een traject voor dat past, niet minder maar ook niet meer dan jouw situatie vraagt.",
      "Zodat je jouw AI-toepassing verantwoord, veilig en met een gerust hart kunt inzetten.",
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
      "Omdat ik zelf ondernemer ben.",
      "Omdat ik ondertussen meer dan vijftien jaar weet hoe het voelt wanneer er alweer iets op je bord belandt terwijl je eigenlijk gewoon je werk wilt doen.",
      "Omdat ik zelf het liefst mensen heb die me écht advies geven, in plaats van het duurste traject aan te smeren. En zo werk ik dus ook.",
      "Omdat ik Certified AI Compliance Officer (CAICO®) ben.",
      "Maar vooral omdat ik Gewoon Mens spreek.",
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
  // Sectie 5 (vervolg) — mailregel, zwarte achtergrond.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    columns: [
      {
        body: richText([
          paragraph([text("Of mail me op "), text("info@humanmargin.eu", FORMAT_BOLD)]),
        ]),
      },
    ],
  },
];

const page: PageSeed = {
  title: "Hoog risico op maat",
  slug: "hoog-risico-op-maat",
  layout,
  meta: {
    title: "Hoog risico op maat - Human Margin",
    description:
      "Bijvoorbeeld in zorg, financiën, werving en selectie, onderwijs of een ander hoog-risico domein?",
  },
};

export default page;
