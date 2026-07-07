/**
 * PageSeed: aick-sprint — exacte content van humanmargin.eu/aick-sprint/
 */
import { FORMAT_BOLD, FORMAT_ITALIC, link, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const WACHTLIJST = "https://checkout.aicompliancekit.eu/wachtlijst-aick-sprint";

const layout = [
  // Sectie 0 — donkere hero: foto links, kop + tekst + prijs + gele knop rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/3.jpg"),
    heading: "Maar dan eentje die je effectief afmaakt.",
    subheading: "De AI Compliance Kit.",
    headingLevel: "h1" as const,
    body: richText([
      "De AICK Sprint is voor mensen die ondertussen voldoende zelfkennis hebben om te weten dat “ik doe het wel eens op mijn eigen tempo” meestal betekent dat het binnen zes maanden nog altijd op hun to-do lijst staat.",
      "Dus plannen we gewoon een voormiddag in. Jij, ik en een paar andere ondernemers die hetzelfde komen doen. Online doorlopen we samen de Kit, ik beantwoord onderweg alle vragen en tegen de lunch ben je klaar.",
      paragraph([
        text(
          "Dezelfde Kit, maar met één groot verschil: je werkt ‘m ook echt af in 3 uur.",
          FORMAT_BOLD,
        ),
      ]),
      paragraph([text("499€", FORMAT_BOLD)]),
    ]),
    cta: { label: "Zet je op de wachtlijst", href: WACHTLIJST, variant: "yellow" as const },
  },
  // Sectie 1 — gele penseelstreek links, quote + naam.
  {
    blockType: "brushNote" as const,
    body: richText([
      "“Els weet niet alleen waar ze over praat, ze begrijpt ook echt hoe ondernemers werken: weinig tijd, veel op het bord.”",
    ]),
    attribution: "- Stephan Molle",
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
    heading: "Je hebt dit al eens meegemaakt",
    headingLevel: "h2" as const,
    body: richText([
      "Je hebt al meer dan één digitale cursus gekocht met het idee: “die ga ik er deze maand even doorheen knallen.”",
      paragraph([
        text("En hij ligt er nog steeds, bij de rest, stof te happen.", FORMAT_BOLD),
      ]),
      "De cursus is waarschijnlijk niet eens slecht. Maar ’s avonds wint Netflix het gewoon van de AI Act.",
      "En het is leuk dat alles op eigen tempo kan. Alleen is dat eigen tempo er voorlopig niet van gekomen.",
      "Ondertussen weet je ook dat je iets moet doen met die AI Act.",
      "Alleen komt er altijd iets tussen. En dat iets ben je meestal zelf.",
    ]),
  },
  // Sectie 3 — donkere longform: kop + gele subkop + tekst met bold labels + blauwe annotatie.
  {
    blockType: "longformDark" as const,
    heading: "Waarom alleen werken vaak niet lukt",
    highlight: "Dit ligt niet aan jou: 87% van digitale cursussen wordt nooit afgemaakt.",
    bodyTop: richText([
      "Een cursus zonder deadline, zonder groep en zonder vast moment in je agenda blijft vaak gewoon liggen.",
      "Want net die dingen die ervoor zorgen dat we wél in actie schieten, ontbreken meestal:",
      paragraph([
        text("Tijdsdruk. ", FORMAT_BOLD),
        text("Wat geen deadline heeft, wordt uitgesteld."),
      ]),
      paragraph([
        text("Vragen kunnen stellen. ", FORMAT_BOLD),
        text(
          "Loop je vast in een online cursus, dan zoek je het zelf uit. Of je laat het rusten. Voor eeuwig en altijd. Amen.",
        ),
      ]),
      paragraph([
        text("Accountability. ", FORMAT_BOLD),
        text(
          "Niemand merkt het als je dit weekend toch naar zee gaat. En drie maanden later weet je nog steeds niet wat de AI Act van je vraagt.",
        ),
      ]),
      "Daarom bestaat de AICK Sprint.",
    ]),
    annotations: [{ text: "Tiktak-tiktak", font: "handwritten" as const }],
    cta: { label: "Aanmelden voor de wachtlijst", href: WACHTLIJST, variant: "yellow" as const },
  },
  // Sectie 4 — grijs: foto links, "Dit is de AICK Sprint" + tekst rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "gray" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
    heading: "Dit is de AICK Sprint",
    headingLevel: "h2" as const,
    body: richText([
      "Eén voormiddag, online, samen met maximaal elf andere zelfstandigen.",
      "We starten met een live AI-geletterdheidstraining. Daarna gaat iedereen aan de slag met de Kit.",
      "Je krijgt samen de uitleg, kunt onderweg vragen stellen en wie vastloopt krijgt meteen hulp.",
      "Geen ticketsysteem, geen chatbot, maar ook geen excuses meer.",
      "Het is exact dezelfde Kit als wanneer je hem apart koopt, met dat verschil dat er een datum opstaat en je vragen meteen beantwoord worden. Bovendien zitten er nog andere ondernemers die op hetzelfde moment hetzelfde komen doen. (En die zien als jij ineens weg bent.)",
      "Aan het einde van de voormiddag is het geregeld.",
      "Check. Done.",
    ]),
  },
  // Sectie 5 — grijs: vinkjeslijst "Wat je krijgt".
  {
    blockType: "iconList" as const,
    background: "gray" as const,
    heading: "Wat je krijgt",
    items: [
      {
        text: "De volledige AICK (€349 waarde)",
        description:
          "inclusief AI-geletterdheidstraining, AI Kompas, templates, disclaimers en alle werkdocumenten.",
      },
      { text: "Drie uur live begeleiding door mij." },
      { text: "Een kleine groep van maximaal twaalf deelnemers." },
      { text: "Antwoorden op al je vragen terwijl je bezig bent." },
      { text: "Een jaar toegang tot de volledige Kit." },
      { text: "Updates wanneer er iets verandert in de AI Act." },
      { text: "Een certificaat en badge voor wie het traject afrondt." },
    ],
  },
  // Sectie 6 — wit: foto links, "Waarom je dit van mij aanneemt" + tekst + blauwe knop.
  {
    blockType: "splitPhotoText" as const,
    background: "white" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/Els-1-1024x1024.png"),
    heading: "Waarom je dit van mij aanneemt",
    headingLevel: "h2" as const,
    body: richText([
      "Omdat ik zelf ook een ontzettende procrastinator ben. Dus ik ken het, geloof me.",
      "Omdat ik ook ondernemer ben en dagelijks AI gebruik.",
      "Omdat ik dus zelf ook klaar moet zijn voor de AI Act.",
      "Omdat ik nergens iets vond dat geschreven was voor ondernemers zoals wij.",
      "Dus ben ik het zelf gaan uitzoeken.",
      "Ik las de wet, volgde opleidingen, sprak met juristen en beleidsmakers en werd Certified AI Compliance Officer (CAICO®).",
      "Niet omdat ik droomde van een carrière in compliance. Wel omdat ik een oplossing zocht die niet bestond.",
      "En omdat ik daar zo belachelijk veel uren in gestoken heb dat ik het niemand anders wil aandoen.",
      "Dus wat jij hier krijgt?",
      "Dat had ik zelf nodig.",
      "Daarom.",
      "You’re welcome.",
    ]),
    cta: {
      label: "Weten wie ik ben en waarom ik dit doe?",
      href: "/over-mij",
      variant: "blue" as const,
    },
  },
  // Sectie 7 — donkere prijssectie: kop + gele prijs + tekst + gele knop.
  {
    blockType: "longformDark" as const,
    heading: "Wat kost het?",
    highlight: "€499 excl. btw.",
    bodyTop: richText([
      "De AICK alleen kost €349.",
      "De extra €150 koopt je geen extra inhoud.",
      "Je krijgt dezelfde Kit.",
      "Wat die €150 koopt, is de zekerheid dat je hem ook echt doorloopt.",
      "Anders is ook die €349 weggesmeten geld.",
      "Up to you.",
    ]),
    cta: {
      label: "Schrijf je in voor de volgende Sprint",
      href: WACHTLIJST,
      variant: "yellow" as const,
    },
  },
  // Sectie 7 (vervolg) — secundaire prompt + link, zwarte achtergrond.
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
  // Sectie 8 — FAQ-accordeon met gele outro + knop.
  {
    blockType: "faq" as const,
    background: "offwhite" as const,
    heading: "Veelgestelde vragen",
    items: [
      {
        question: "Wat als ik geen drie uur vrij heb?",
        answer: richText([
          "Wel, als we eerlijk zijn, heb je die wel. Maar alleen niet hiervoor en dat is fair enough. Er zijn zowat om de twee maanden Sprint sessies, met data ruim op voorhand gepland. Maar als dat niet lukt, dan is meer wat voor jou. Dan doe je het allemaal op je eigen tempo.",
        ]),
      },
      {
        question: "Wat als ik niet graag in groep werk?",
        answer: richText([
          "Begrijpelijk. Dan is de Sprint waarschijnlijk niet jouw ding en is de een betere keuze.",
        ]),
      },
      {
        question: "Wat als ik na de Sprint nog vragen heb?",
        answer: richText([
          "Je houdt een jaar toegang tot alle materialen en kunt één opvolggesprek inplannen als je ergens op vastloopt.",
        ]),
      },
      {
        question: "Wat als ik toch niet kan op de gekozen datum?",
        answer: richText([
          "Tot een week vooraf kun je doorschuiven naar een volgende Sprint. En je krijgt sowieso toegang tot de volledige AICK.",
        ]),
      },
      {
        question: "Wat als ik niet graag in groep werk én het alleen niet zie zitten?",
        answer: richText([
          "Stuur me gewoon een bericht. Dan kijken we samen hoe we het geregeld krijgen.",
        ]),
      },
    ],
    outro: "Klaar?",
    cta: {
      label: "Schrijf je in voor de volgende Sprint (€499 excl. btw)",
      href: WACHTLIJST,
      variant: "yellow" as const,
    },
  },
  // Sectie 9 — juridische disclaimer, zwarte achtergrond.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    columns: [
      {
        body: richText([
          paragraph([
            text(
              "Human Margin biedt geen juridisch advies. De AICK Sprint helpt je de stappen zetten die de AI Act van zelfstandigen vraagt en je werk te documenteren. Of je uiteindelijk aan alle wettelijke vereisten voldoet, wordt bepaald door de bevoegde toezichthouder.",
              FORMAT_ITALIC,
            ),
          ]),
        ]),
      },
    ],
  },
];

const page: PageSeed = {
  title: "AICK Sprint",
  slug: "aick-sprint",
  layout,
  meta: {
    title: "AICK Sprint - Human Margin",
    description:
      'De AICK Sprint is voor mensen die ondertussen voldoende zelfkennis hebben om te weten dat "ik doe het wel eens op mijn eigen tempo" meestal betekent dat het',
  },
};

export default page;
