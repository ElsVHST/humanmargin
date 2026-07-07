/**
 * PageSeed: over-mij — humanmargin.eu/over-mij/
 * 10 secties: hero (heroPhoto), donkere longform-secties met gele Marker-subkoppen
 * + blauwe handschrift-annotaties (longformDark), foto+tekst (splitPhotoText zwart),
 * twee lichte tekstsecties (textColumns, gebroken wit) en een nieuwsbrief-blok
 * (brushNote) onderaan.
 */
import { richText } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  // Sectie 0 — full-width hero met portret + ingebakken blauwe annotaties.
  {
    blockType: "heroPhoto" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/OVER-MIJ-1.jpg"),
    minHeight: 810,
  },
  // Sectie 1 — donkere intro: kop + gele Marker-subkop (geen body).
  {
    blockType: "longformDark" as const,
    heading: "Ik ga je niet vertellen dat ik op een ochtend wakker werd met een missie.",
    highlight: "Er was geen burn-out. Geen openbaring.",
  },
  // Sectie 2 — detailfoto links, tekst rechts (geen kop).
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/OVER-MIJ-DETAIL-2.jpg"),
    body: richText([
      "Geen moment waarop alles veranderde.",
      "Dertien jaar had ik mijn eigen bedrijf in België.",
      "Ik weet dus hoe het is om je administratie en boekhouding te doen, klanten binnen te halen, bij te blijven met technologie en marketing, en ondertussen ook nog het échte werk te doen.",
      "In 2021 verkocht ik dat bedrijf. Omdat ik met de mooiste man wilde wonen -een Rotterdammert- en zijn fantastische zoon. En ook omdat ik het kotsbeu was en klaar was voor wat anders. Alleen had ik geen idee wat dat “anders” precies was.",
      "Oud-collega’s en klanten bleven me bellen. Om te sparren, om hun brandjes te blussen en crap te solven. Ik heb een fijne bullshit-filter, denk vaak anders dan anderen en kan complexe dingen snel eenvoudig maken. Ik doopte mezelf om tot chaosmanager: als alles in de shit draait, spring ik erin en help ik. Tot de modder gaat liggen. Dan ga ik weer.",
      "Ik ben nu eenmaal een curieuzeneus, een informatie-veelvraat met een bijna fysieke nood om dingen te begrijpen. Geef mij een wormhole en ik spring.",
    ]),
  },
  // Sectie 3 — donkere longform: de AI Act als wormhole.
  {
    blockType: "longformDark" as const,
    heading: "Tijdens een sparringsessie bracht een klant de AI Act ter sprake en ik was vertrokken.",
    annotations: [{ text: "*dat zegt de FOD Economie", font: "handwritten" as const }],
    bodyTop: richText([
      "Die AI Act is een wormhole. En wat voor een.",
      "“Dat vogel ik snel effe uit”, dacht ik. Dat “snel” werd maanden. Maanden waarin ik vaak dacht: “Wat een complete clusterfuck is dit eigenlijk?”",
      "Ik las de wet, sprak juristen, beleidsmakers en toezichthouders. Ik volgde opleidingen en werd zelfs Certified AI Compliance Officer (CAICO®).",
      "Maar vooral: ik probeerde te begrijpen wat dit allemaal betekende voor ondernemers zoals wij. Want niets van wat ik vond was voor ons geschreven.",
      "Alles ging over budgetallocaties, multidisciplinaire teams, governance-structuren en meerjarenplannen. Terwijl ik al blij was als ik wist wat ik volgend kwartaal zou doen.",
      "96%* van alle bedrijven in België en Nederland zijn kleine ondernemingen. En toch leek niemand voor ons geschreven. Dat maakte me razend.",
    ]),
  },
  // Sectie 4 — lichte sectie (gebroken wit): "Er zijn weinig betere motivaties dan frustratie."
  {
    blockType: "textColumns" as const,
    background: "offwhite" as const,
    heading: "Er zijn weinig betere motivaties dan frustratie.",
    columns: [
      {
        body: richText([
          "Dus bouwde ik zelf wat ik nergens kon vinden. Niet als iemand die een website over AI compliance samen hallucineert met ChatGPT of die snel een AI-tool in elkaar vibe-codet maar geen flauw idee heeft waar het allemaal over gaat. (En niet eens weet dat ie daarmee wellicht al de AI Act overtreedt.)",
          "Maar als ondernemer, voor ondernemers.",
          "Ik zocht uit wat voor ons relevant is. Wat van toepassing is. Wat belangrijk is. En vooral: wat niet.",
          "Zodat jij geen maanden hoeft te spenderen aan opzoekwerk. Zodat jij gewoon verder kunt met het werk dat er voor jou toe doet.",
          "Je bent je bedrijf tenslotte niet begonnen om dagen te verliezen aan AI compliance.",
          "Ik wel.",
          "Geen dank hoor.",
        ]),
      },
    ],
  },
  // Sectie 5 — donkere longform: het gaat niet om compliance.
  {
    blockType: "longformDark" as const,
    heading: "Maar ergens onderweg besefte ik iets: het gaat me eigenlijk niet om compliance.",
    annotations: [{ text: "Check", font: "handwritten" as const }],
    bodyTop: richText([
      "Compliance die louter vakjes afvinkt is een belediging. Niet voor de wet. Voor jou.",
      "Want AI compliance zonder te begrijpen waarom je iets doet, zonder betekenis of context, verschilt niet zo heel veel van wat we een robot zouden laten doen.",
      "Het gaat mij niet om regels, het gaat mij om autonomie. Om begrijpen wat je gebruikt. Waarom je het gebruikt. En welke gevolgen dat heeft. Want alleen dan kun je zelf kiezen.",
    ]),
  },
  // Sectie 6 — donkere longform: twee tattoos / herinneringen.
  {
    blockType: "longformDark" as const,
    heading: "Ik draag twee herinneringen op mijn huid.",
    bodyTop: richText([
      "De ene vraagt: “Wat is dit?”",
      "De andere zegt: “Denk eraan dat je doodgaat.”",
      "Samen zeggen ze eigenlijk hetzelfde: Blijf nieuwsgierig en verspil je tijd niet.",
      "Met een dochter die er in 2023 bij kwam, werd dat alleen maar duidelijker.",
      "Ik wil haar niet laten opgroeien in een wereld waar nergens nog een mens aan te pas komt. Waar we gedachteloos alles hebben uitbesteed. Waar we technologie dienen in plaats van andersom.",
      "Maar tegelijk wil ik wel zoveel mogelijk zinloos werk automatiseren. Zodat er meer tijd overblijft voor wat ons mens maakt. Voor leven. Voor verbinding. Voor aandacht. Voor elkaar.",
      "Ik wil zelf kiezen. En ik wil dat jij dat ook kunt.",
    ]),
  },
  // Sectie 7 — donkere longform: de AI Act gaat over de mens.
  {
    blockType: "longformDark" as const,
    heading: "De AI Act gaat uiteindelijk niet over AI, ze gaat over de mens.",
    annotations: [{ text: "Anti-zombie", font: "handwritten" as const }],
    bodyTop: richText([
      "Over verantwoordelijkheid. Over wie er aan het stuur zit.",
      "Daarom geloof ik dat die wet nodig is, en sta ik op de barricades.",
      "Niet voor compliance, maar voor autonomie.",
      "Niet voor regels, maar voor begrip.",
      "Niet voor technologie, maar voor de mens.",
    ]),
  },
  // Sectie 8 — lichte sectie (gebroken wit): "Dus leef. Stel vragen."
  {
    blockType: "textColumns" as const,
    background: "offwhite" as const,
    heading: "Dus leef. Stel vragen.",
    columns: [
      {
        body: richText([
          "Maak van je nieuwsgierigheid je verzet.",
          "Verdedig die Human Margin.",
          "De mens in de marge.",
          "En de winst onderaan de streep.",
          "Welkom. Sluit je aan.",
        ]),
      },
    ],
  },
  // Sectie 9 — nieuwsbrief-aanmelding "In de Marge".
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
  title: "Over mij",
  slug: "over-mij",
  layout,
  meta: {
    title: "Over mij - Human Margin",
    description: "Geen moment waarop alles veranderde.",
  },
};

export default page;
