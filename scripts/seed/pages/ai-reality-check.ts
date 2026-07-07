/**
 * PageSeed: ai-reality-check — humanmargin.eu/ai-reality-check/
 * Marketing-landingspagina die naar de AI Reality Check-quiz leidt.
 */
import { FORMAT_BOLD, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  // Sectie 0 — full-width hero-foto (alle tekst zit in de foto zelf, geen knop)
  {
    blockType: "heroPhoto" as const,
    image: media(
      "https://humanmargin.eu/wp-content/uploads/2026/06/AI-reality-check-header-e1781174315260.jpg",
    ),
    minHeight: 828,
    contentPaddingTop: 300,
  },
  // Sectie 1 — donkere longform: "Waar sta jij in de AI Act?"
  {
    blockType: "longformDark" as const,
    heading: "Waar sta jij in de AI Act?",
    highlight: "Iedereen die iets met AI doet, valt er op de één of andere manier onder.",
    annotations: [{ text: "Ja, ook jij.", font: "handwritten" as const }],
    bodyTop: richText([
      "Ook als je alleen Chat met Claude of kloot met Chat.",
      "Ook als je denkt dat dit vooral iets voor grote bedrijven is.",
      "De AI Act maakt namelijk geen onderscheid tussen “serieuze AI” en “gewone AI”.",
      "Werkelijk alle AI-tools tellen mee.",
    ]),
  },
  // Sectie 2 — foto links + tekst: "Wat wél verschilt..."
  {
    blockType: "splitPhotoText" as const,
    background: "offwhite" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/16-1.jpg"),
    heading: "Wat wél verschilt, is wat de wet van jou verwacht.",
    headingLevel: "h2" as const,
    body: richText(["Dat hangt af van twee dingen:"]),
    arrowList: [
      { text: "welke rol je hebt;" },
      { text: "welk risico jouw AI-gebruik met zich meebrengt." },
    ],
    arrowColor: "blue" as const,
    bodyBottom: richText([
      paragraph([text("Andere rol? ", FORMAT_BOLD), text("Andere regels.")]),
      paragraph([text("Ander risico? ", FORMAT_BOLD), text("Andere verplichtingen.")]),
      "Daarom bestaat deze AI Reality Check.",
      "In een paar minuten ontdek je waar jij staat en wat je daar eventueel mee moet.",
    ]),
    cta: { label: "Doe de AI Reality Check", href: "/doe-de-ai-reality-check", variant: "yellow" as const },
  },
  // Sectie 3 — donkere longform: "Eerst even de basis"
  {
    blockType: "longformDark" as const,
    heading: "Eerst even de basis",
    highlight: "De AI Act is een Europese wet die sinds februari 2025 gefaseerd in werking treedt.",
    annotations: [{ text: "Gebruik jij?", font: "handwritten" as const }],
    bodyTop: richText([
      "Ze geldt voor iedereen die AI gebruikt, aanbiedt of inzet binnen een professionele context. Of je nu zelfstandige bent, freelancer, consultant, winkeluitbater of bedrijf met honderd medewerkers.",
      "Wat je precies moet doen, hangt af van twee assen:",
      paragraph([text("Jouw rol", FORMAT_BOLD)]),
      "Ben je gebruiker? Aanbieder? Of allebei?",
      paragraph([text("Het risico van jouw AI-gebruik", FORMAT_BOLD)]),
      "Gebruik je AI voor iets relatief onschuldigs? Of zit je in een situatie waar de wet strengere regels oplegt?",
      "Dat verschil maakt uit. Veel meer dan de grootte van je bedrijf.",
    ]),
  },
  // Sectie 4 — grijze sectie met checklist + CTA: "Waar sta jij?"
  // AFWIJKING: marker-annotatie "Genoeg theorie." vervalt; checklist als tekstregels
  // (textCta heeft geen list-veld en geen afbeelding, dus splitPhotoText valt af).
  {
    blockType: "textCta" as const,
    background: "gray" as const,
    heading: "Waar sta jij?",
    body: richText([
      "Doe de AI Reality Check en ontdek:",
      "welke rol je hebt onder de AI Act",
      "welke verplichtingen mogelijk voor jou gelden",
      "of je vandaag al iets moet doen",
      "wat je slimste volgende stap is",
    ]),
    cta: { label: "Doe de AI Reality Check", href: "/doe-de-ai-reality-check", variant: "blue" as const },
  },
  // Sectie 5 — foto links + tekst + checklist: "Wil je eerst wat meer begrijpen?"
  {
    blockType: "splitPhotoText" as const,
    background: "white" as const,
    imagePosition: "left" as const,
    imageTreatment: "inset" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/31-1024x682.jpg"),
    annotation: "Klik en lees",
    annotationFont: "handwritten" as const,
    annotationColor: "blue" as const,
    heading: "Wil je eerst wat meer begrijpen?",
    headingLevel: "h2" as const,
    body: richText(["Dan vind je in de Leeszaal alles in gewone mensentaal."]),
    arrowList: [
      { text: "Wat is de AI Act?" },
      { text: "Wat betekent de AI Act voor zelfstandigen?" },
      { text: "Welke boetes riskeer ik echt?" },
    ],
    arrowColor: "blue" as const,
    cta: { label: "Meer in de Leeszaal", href: "/leeszaal", variant: "yellow" as const },
  },
  // Sectie 6 — nieuwsbrief-aanmelding "In de Marge"
  // AFWIJKING: de decoratieve in-de-marge PNG naast de tekst is niet meegenomen.
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
  title: "AI Reality Check",
  slug: "ai-reality-check",
  layout,
  meta: {
    title: "AI Reality Check - Human Margin",
    description: "Ook als je alleen Chat met Claude of kloot met Chat.",
  },
};

export default page;
