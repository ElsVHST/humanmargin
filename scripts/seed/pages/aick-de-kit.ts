/**
 * PageSeed: aick-de-kit — exacte content van humanmargin.eu/aick-de-kit/
 */
import { FORMAT_BOLD, link, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const KIT_CHECKOUT = "https://checkout.aicompliancekit.eu/checkout/ai-compliance-kit";

const layout = [
  // Sectie 0 — donkere hero: foto links, kop + gele subkop + tekst + gele knop rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/3.jpg"),
    heading: "Compliance die je begrijpt. Niet alleen afvinkt.",
    subheading: "De AI Compliance Kit neemt je mee door wat de AI Act van jou vraagt.",
    headingLevel: "h1" as const,
    body: richText([
      "Op maat van de zelfstandig ondernemer (freelance & ZZP), in mensentaal, op je eigen tempo, exact wat jij nodig hebt.",
      "Niet meer, niet minder.",
      "Geen jurist nodig, je eigen brein volstaat.",
    ]),
    cta: { label: "Start de Kit, 349 euro", href: KIT_CHECKOUT, variant: "yellow" as const },
  },
  // Sectie 1 — gele penseelstreek links, quote + naam.
  {
    blockType: "brushNote" as const,
    body: richText([
      "“Els weet niet alleen waar ze over praat, ze begrijpt ook echt hoe ondernemers werken: weinig tijd, veel op het bord.”",
    ]),
    attribution: "- Edith Heslinga",
    brushImage: media(
      "https://humanmargin.eu/wp-content/uploads/2026/06/in-de-marge-e1781177869154-327x1024.png",
    ),
  },
  // Sectie 2 — gebroken wit: tekst links, foto rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "offwhite" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/14-1.jpg"),
    heading: "Het knaagt, geef toe",
    headingLevel: "h2" as const,
    body: richText([
      "Je weet dat er een AI-wet is en dat hij ook over jou gaat. Je klikte het al een paar keer weg. Maar het blijft hangen. Je wil gewoon weten dat het snor zit, en verder met je werk.",
      paragraph([text("Je opties kloppen geen van alle", FORMAT_BOLD)]),
      "Een advocaat? Hem een mailtje laten tikken kost je al 40€.",
      "Een compliancebureau? Daar is onleesbaarheid soms het verdienmodel.",
      "Een gratis checklist? Een afgevinkt vakje dat je niet begrijpt, is niets waard.",
      "De mannen Chattie of Claude vragen? Die lullen wat bijeen, kennen jouw situatie niet en hebben het steevast over de GDPR/AVG in plaats van de AI Act.",
      "Er ontbrak iets: een oplossing voor ondernemers.",
    ]),
  },
  // Sectie 3 — donkere longform: kop + gele subkop + tekst + blauwe annotatie + gele knop.
  {
    blockType: "longformDark" as const,
    heading: "Wat de AICK- AI Compliance Kit anders maakt",
    highlight:
      "De meeste oplossingen vinken vakjes voor je af. Maar een afgevinkt vakje dat je niet snapt, is niets waard.",
    bodyTop: richText([
      "De Kit doet het omgekeerde: hij laat je nádenken. Een werktool dat je stap voor stap door je eigen AI-gebruik loodst, in gewone taal, zodat je aan het eind niet alleen een document hebt, maar het ook begrijpt.",
      "Want dat is compliance eigenlijk: het bewijs dat je hebt nagedacht.",
      "En ik hoor je denken “ik hoef dit niet te verstaan, ik wil gewoon dat het in orde is en door.” Fair enough.",
      "Maar als je t niet begrijpt, moet je telkens betalen voor iemand die ‘t je uitlegt als er iets verandert: volgende tool, nieuwe situatie, wet die schuift,…",
      "Nu kan je ’t allemaal zelf. Geen jurist bij elke stap. Geen factuur bij elke twijfel.",
    ]),
    annotations: [{ text: "Proof of thought", font: "handwritten" as const }],
    cta: { label: "Start de Kit, 349 euro", href: KIT_CHECKOUT, variant: "yellow" as const },
  },
  // Sectie 4 — grijs: foto links, "Wat je uiteindelijk koopt" + tekst rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "gray" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
    heading: "Wat je uiteindelijk koopt",
    headingLevel: "h2" as const,
    body: richText([
      "Geen map met documenten of verzameling templates.",
      "Zelfs geen certificaat voor aan de muur.",
      "Je koopt rust.",
      "Omdat je weet:",
      "welke AI je gebruikt",
      "waarom je die gebruikt",
      "welke risico's erbij horen",
      "welke verantwoordelijkheid jij draagt",
      "En dat blijft van jou. Ook wanneer er morgen een nieuwe tool opduikt.",
    ]),
  },
  // Sectie 5 — grijs: vinkjeslijst "Wat je krijgt".
  {
    blockType: "iconList" as const,
    background: "gray" as const,
    heading: "Wat je krijgt",
    items: [
      {
        text: "Directe toegang tot de online omgeving",
        description:
          "alles wat je nodig hebt om je AI-gebruik in kaart te brengen en te documenteren.",
      },
      {
        text: "AI geletterdheidstraining",
        description:
          "Zodat je begrijpt wat AI is, wat de AI Act van je vraagt, en hoe je AI verantwoord inzet. Verplicht sinds februari 2025.",
      },
      {
        text: "Het AI Kompas",
        description: "Een praktisch werkboek dat je helpt vastleggen wat je wil met AI. En wat niet.",
      },
      {
        text: "Je eigen AI-beleid",
        description: "De vertaling van jouw keuzes naar duidelijke afspraken",
      },
      {
        text: "Een helder stappenplan",
        description:
          "In de juiste volgorde, zodat je nooit hoeft te raden waar je moet beginnen.",
      },
      {
        text: "Templates en voorbeelden",
        description: "Geen leeg blad maar een stevige start.",
      },
      {
        text: "Updates gedurende een jaar",
        description: "Verandert de wet? Dan krijg jij wat je nodig hebt om mee te blijven.",
      },
      {
        text: "Certificaat en badge",
        description:
          "Voor wanneer klanten, partners of opdrachtgevers willen weten hoe jij met AI omgaat.",
      },
    ],
  },
  // Sectie 6 — donkere prijssectie: kop + gele prijs + blauwe annotatie + tekst + gele knop.
  {
    blockType: "longformDark" as const,
    heading: "Wat het kost",
    highlight: "349 euro.",
    bodyTop: richText([
      "Zet dat naast een advocaat van 4650 euro, en het is geen kost meer, het is een keuze.",
      "Je betaalt niet voor documenten, je betaalt voor begrijpen en de rust die daarbij hoort.",
      "En wat je begrijpt blijft van jou. Nu en wanneer de volgende AI-tool zich aandient.",
    ]),
    annotations: [{ text: "Keuze", font: "handwritten" as const }],
    cta: { label: "Start de AI Compliance Kit", href: KIT_CHECKOUT, variant: "yellow" as const },
  },
  // Sectie 6 (vervolg) — secundaire prompt + link, zwarte achtergrond.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    columns: [
      {
        body: richText([
          "Nog niet zeker of dit jouw pad is?",
          paragraph([link("Doe eerst de AI Reality Check", "/ai-reality-check")]),
        ]),
      },
    ],
  },
  // Sectie 7 — sectiekop boven twee donkere kaarten.
  {
    blockType: "textColumns" as const,
    background: "offwhite" as const,
    heading: "Dit is niet voor iedereen",
    columns: [],
  },
  {
    blockType: "cardColumns" as const,
    background: "black" as const,
    cards: [
      {
        subheading: "Wel voor de zelfstandige ondernemer die...",
        body: richText([
          "AI gebruikt en dat op een verantwoorde manier wil doen",
          "zelf wil begrijpen wat ze doen",
          "zijn autonomie niet wil afgeven aan anderen",
          "niet elke keer wil bijbetalen als er wat verandert",
          "graag op hun eigen tempo werken",
        ]),
        cta: { label: "Start de Kit, 349 euro", href: KIT_CHECKOUT, variant: "yellow" as const },
      },
      {
        subheading: "Maar niet voor...",
        body: richText([
          "mensen die gewoon een lijstje willen afstrepen zonder na te denken. Of die graag afhankelijk blijven van adviseurs.",
          "Die verwijs ik met liefde door naar mijn concullega’s.",
          "En ook niet voor:",
          "organisaties met een team",
          "aanbieders van hoog-risico AI",
          "complexe situaties die maatwerk vragen",
          "Daar is vaak wat meer voor nodig.",
          paragraph([
            text("Neem "),
            link("contact op", "/contact"),
            text(" dan kijken we wat nodig is."),
          ]),
        ]),
      },
    ],
  },
  // Sectie 8/9 — recensie-carousel (quotes niet gecrawld; hergebruik van de echte site-recensies).
  {
    blockType: "testimonials" as const,
    heading: "Recensies zijn leuk.",
    intro:
      "Voor mijn ego, maar mogelijk ook voor jou. En waarom hier wat typen als anderen t al beter zeiden?",
    items: [
      {
        quote:
          "Zelfs als de wet er niet zou zijn, wil ik weten wat ik inzet, waarom, en wat daar de consequenties van zijn. Niet vanuit angst of verplichting, maar vanuit bewustzijn.",
        name: "Miriam Dix",
      },
      {
        quote:
          "Het geeft mij veel rust in mijn hoofd dat ik nu mijn AI gebruik in kaart heb gebracht én voldoe aan de gestelde eisen vanuit de AI Act.",
        name: "Stephan Molle",
      },
    ],
  },
  // Sectie 10 — wit: foto links, "Waarom je dit van mij aanneemt" + tekst + blauwe knop.
  {
    blockType: "splitPhotoText" as const,
    background: "white" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/Els-1-1024x1024.png"),
    heading: "Waarom je dit van mij aanneemt",
    headingLevel: "h2" as const,
    body: richText([
      "Omdat ik ook ondernemer ben en dagelijks AI gebruik.",
      "Omdat ik dus zelf ook klaar moet zijn voor de AI Act.",
      "Omdat ik maar niks concreets vond op maat van kleine ondernemers die klaar wilden zijn voor de AI Act.",
      "Omdat ik uit pure miserie het hele internet heb uitgelezen, Certified AI Compliance Officer (CAICO®) ben geworden, en zelf een stappenplan heb gemaakt.",
      "Omdat ik daar zo belachelijk veel uren in heb gestoken dat het me tot waanzin dreef en ik het niemand anders wil aandoen.",
      "Dus wat je hier krijgt, had ik zelf nodig.",
      "Daarom.",
      "You’re welcome.",
    ]),
    cta: {
      label: "Weten wie ik ben en waarom ik dit doe?",
      href: "/over-mij",
      variant: "blue" as const,
    },
  },
  // Sectie 11 — donkere sectie: kop + gele subkop + blauwe annotatie + tekst + gele knop.
  {
    blockType: "longformDark" as const,
    heading: "Je blijft niet alleen achter.",
    highlight:
      "De gemiddelde ondernemer loopt de Kit in een paar uur door, toch krijg je een jaar toegang.",
    bodyTop: richText([
      "Want het leven gebeurt. (En uitstelgedrag ook.)",
      "Loop je écht vast? Dan is er een noodlijn en kan je een gesprek inplannen om er samen even naar te kijken.",
    ]),
    annotations: [{ text: "Shit happens", font: "handwritten" as const }],
    cta: { label: "Start de Kit, 349 euro", href: KIT_CHECKOUT, variant: "yellow" as const },
  },
];

const page: PageSeed = {
  title: "AICK- de Kit",
  slug: "aick-de-kit",
  layout,
  meta: {
    title: "AICK- de Kit - Human Margin",
    description:
      "Op maat van de zelfstandig ondernemer (freelance & ZZP), in mensentaal, op je eigen tempo, exact wat jij nodig hebt.",
  },
};

export default page;
