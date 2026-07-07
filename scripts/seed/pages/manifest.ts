/**
 * PageSeed: manifest — humanmargin.eu/manifest/
 * 9 secties: 3 full-width fotosecties met ingebakken tekst (heroPhoto),
 * donkere longform-secties met gele Marker-subkoppen + blauwe handschrift-
 * annotaties (longformDark) en twee foto+tekst-secties (splitPhotoText, zwart).
 */
import { FORMAT_BOLD, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  // Sectie 0 — full-width hero, tekst "NIEUWSGIERIGHEID IS VERZET" in de foto.
  {
    blockType: "heroPhoto" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MANIFEST2.jpg"),
    minHeight: 810,
    mobileMinHeight: 211,
    mobileContentPaddingTop: 10,
  },
  // Sectie 1 — Welkom: tekst links, portretfoto (handen) rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MANIFEST_HANDEN_PORTRAIT_GRAIN.jpg"),
    heading: "Welkom.",
    subheading: "Welkom aan de margeschrijvers.",
    headingLevel: "h2" as const,
    body: richText([
      "Zij die lezen maar niet zomaar aannemen. Zij die denken, verbanden leggen. Zij die de dingen in twijfel trekken, niet alleen omdat het kan, maar omdat ze weten dat het moet. Zij die niet alleen denken, maar ook doen. Zij die doorhebben wat er op het spel staat.",
      "Zij die voelden dat het anders moest en de ballen hadden om het anders te doen. En die dat nu weer gaan doen. Zij die te hard werkten aan hun vrijheid om die nu op te geven aan AI.",
      "Want de vraag is niet: to think or not to think. De vraag is: als schrijven denken is, en we laten het schrijven over aan AI, wie denkt er dan nog?",
      "Human Margin is niet voor wie blindelings AI-trends volgt zonder zich daar ongemakkelijk bij te voelen. Niet voor wie enkel wil optimaliseren en daar snelheid mee wil pakken. Maar voor wie nadenkt over wat dan wel optimaal zou zijn. Niet voor bedrijven die AI als heilige graal zien.",
    ]),
  },
  // Sectie 2 — full-width hero, tekst "ANTI-ZOMBIE. PRO-MENS." in de foto.
  {
    blockType: "heroPhoto" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MANIFEST_ANTIZOMBIE_GRAIN.jpg"),
    minHeight: 810,
    mobileMinHeight: 211,
    mobileContentPaddingTop: 10,
  },
  // Sectie 3 — donkere longform: "En nee, wij zijn niet anti-AI."
  {
    blockType: "longformDark" as const,
    heading: "En nee, wij zijn niet anti-AI.",
    highlight: "De plot twist.",
    bodyTop: richText([
      "Wij zijn anti-zombie en pro-mens.",
      "Want dit is het tipping point.",
      "Het stukje zwijgen tussen twee zinnen, de witregel tussen paragrafen. Hier moet het gebeuren.",
      "En toch laten we ons weer overtuigen. Opjagen door feature fluffers en prompt promoters die efficiëntie en productiviteit beloven. Maar een 30% efficiëntere variant van het verkeerde werk maakt het niet beter. Het maakt het sneller verkeerd.",
      "Zij willen ons doen geloven dat AI een trein is die je moet halen, in plaats van een gereedschap dat je bewust inzet. Zij focussen zo op features dat ze de functie niet meer zien. Zij zetten ons aan tot digitaal hoarden van tools en cursussen, onder het mom van vooruitgang, efficiëntie, productiviteit en zelfontwikkeling. Alles om onze aangepraatte AI-FOMO te proberen stillen. Om ons wijs te maken dat AI beter zou zijn dan de mens.",
      "Want ja, AI belooft efficiëntie en productiviteit. En maakt dat deels waar. Maar we moeten alert blijven dat we onze menselijkheid niet afgeven. Onze creativiteit, onze authenticiteit, niet weggeven aan een algoritme.",
      "Want plots is het allemaal kwantiteit, geen kwaliteit. Plots ligt de focus op productiviteit.",
      paragraph([text("Maar de mens is geen fabriek.", FORMAT_BOLD)]),
    ]),
  },
  // Sectie 4 — donkere longform: "Het is tijd om in de marge te schrijven."
  {
    blockType: "longformDark" as const,
    heading: "Het is tijd om in de marge te schrijven.",
    highlight: "Nieuwsgierigheid is verzet.",
    annotations: [{ text: "No beige please", font: "handwritten" as const }],
    bodyTop: richText([
      "Om niet alles zomaar aan te nemen.",
      "Om van nieuwsgierigheid ons verzet te maken.",
      "Verzet tegen de verbeige-ing. Tegen het beige by design.",
    ]),
  },
  // Sectie 5 — foto (boek + marker) links, tekst rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MARGESCHRIJVER-3-1024x750.jpg"),
    heading: "Het is tijd om kleur te bekennen.",
    headingLevel: "h2" as const,
    body: richText([
      "Om ons leven weer in handen te nemen. Zelf na te denken, zelf te kiezen. Want ook al kies je verkeerd, je zal weten waarom. En je leert uit je fouten.",
      "Dus dit is voor wie geen schrik heeft. Voor wie niet louter op AI-FOMO gaat, maar het juiste wil doen. Voor wie begrijpt dat AI, verantwoordelijkheid en professionaliteit hand in hand gaan.",
      "Voor wie te veel heeft gebouwd, te lang vertrouwen heeft opgebouwd, om het nu te breken met ondoordacht AI-gebruik. Want zij weten: voldoen aan de AI Act is meer dan een checklist. Het is klantvertrouwen. Het is transparantie. Het is een strategisch merkvoordeel.",
      "Daarom bestaat Human Margin. Voor hen maakte ik de AI Compliance Kit.",
      "En ik ben geen jurist of standaard compliance bureau. Hier geen jargon dat je nodig hebt om bij de wet te kunnen. Maar een gids in Gewoon Mens, leesbaar voor allen, betaalbaar voor allen. Want onleesbaarheid is een verdienmodel. En dat breken we door.",
    ]),
  },
  // Sectie 6 — donkere longform: "Human Margin is de mens in de marge."
  {
    blockType: "longformDark" as const,
    heading: "Human Margin is de mens in de marge.",
    highlight: "Stel vragen. Blijf vragen. Nieuwsgierigheid is verzet.",
    annotations: [{ text: "De mens hier", font: "handwritten" as const }],
    bodyTop: richText([
      "Jouw bedenkingen, jouw verbanden, jouw vragen.",
      paragraph([text("Jouw gedachten in de kantlijn. En de winst onder aan de streep.", FORMAT_BOLD)]),
      "Dus stel de dingen in vraag. Maak aantekeningen. Neem de regie terug.",
    ]),
  },
  // Sectie 7 — full-width hero-fotosectie (zie afwijking in rapport: bron-JSON bevat
  // geen backgroundImage; best passende hero-afbeelding uit de media-map gebruikt).
  {
    blockType: "heroPhoto" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MANIFEST_HOOFD_GRAIN.jpg"),
    minHeight: 810,
    mobileMinHeight: 186,
    mobileContentPaddingTop: 10,
  },
  // Sectie 8 — "de mens achter human margin": foto links, kop + blauwe knop rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MANIFEST_OVERMIJ_GRAIN-668x1024.jpg"),
    annotation: "de mens achter human margin",
    annotationFont: "marker" as const,
    annotationColor: "yellow" as const,
    annotationPosition: "aboveHeading" as const,
    heading: "En wie ben ik überhaupt?",
    headingLevel: "h2" as const,
    cta: { label: "Meer over mij", href: "/over-mij", variant: "blue" as const },
  },
];

const page: PageSeed = {
  title: "Manifest",
  slug: "manifest",
  layout,
  meta: {
    title: "Manifest - Human Margin",
    description:
      "Zij die lezen maar niet zomaar aannemen. Zij die denken, verbanden leggen. Zij die de dingen in twijfel trekken, niet alleen omdat het kan, maar omdat ze",
  },
};

export default page;
