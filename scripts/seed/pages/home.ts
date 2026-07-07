/**
 * PageSeed: homepage — exacte content van humanmargin.eu/
 * Voorbeeldbestand voor alle pagina-seeds (zie seed-pages.ts).
 */
import { link, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    blockType: "heroPhoto" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/CECI-NEST-PAS-UNE-LANCERING-4.jpg"),
    minHeight: 810,
    contentPaddingTop: 300,
    mobileMinHeight: 363,
    mobileContentPaddingTop: 100,
    cta: { label: "doe de AI reality check", href: "/ai-reality-check", variant: "blue" as const },
  },
  {
    blockType: "statement" as const,
    heading: "AI hoef je niet te vrezen,\nniet blind te vertrouwen.",
    accent: "Wel te begrijpen.",
  },
  {
    blockType: "splitPhotoText" as const,
    background: "gray" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/20-1.jpg"),
    heading: "Gebruik je ChatGPT, Claude of Copilot voor je werk?",
    headingLevel: "h1" as const,
    annotation: "Dan gaat de AI Act ook over jou.",
    annotationFont: "handwritten" as const,
    body: richText([
      "Ja, ook als je ‘m alleen gebruikt om teksten te schrijven. Nee, niet alleen voor grote bedrijven met een juridische afdeling. Ook voor zelfstandigen, freelancers en kleine bedrijven.",
      "Geen paniek. Het betekent niet dat je morgen een advocaat nodig hebt. Het betekent dat je moet weten wat je gebruikt, en waarom.",
      "Want autonomie begint bij begrip.",
    ]),
    cta: { label: "Doe de AI Reality Check", href: "/ai-reality-check", variant: "yellow" as const },
  },
  {
    blockType: "longformDark" as const,
    heading: "Voor zij die lezen, maar niet zomaar aannemen",
    highlight:
      "Voor zij die willen verstaan. Omdat ze begrijpen dat vrijheid en autonomie samengaan met begrip.",
    bodyTop: richText([
      "Voor zij die dingen in twijfel trekken. Niet omdat het kan, maar omdat het moet.",
      "Voor zij die doorhebben wat er op het spel staat. Die te hard gewerkt hebben aan hun vrijheid om die nu uit handen te geven.",
      "Aan anderen, of aan AI.",
      "Zij zijn wij.",
      "Wij zijn niet tegen AI. Wij zijn anti-zombie en pro-mens. We zijn tegen zij die ons willen overtuigen dat AI een trein is die je moet halen, in plaats van een krachtig gereedschap dat je bewust moet inzetten.",
      "Tegen gedachteloos AI-gebruik. Tegen het uitbesteden van ons denken.",
      "Tegen het idee dat sneller altijd beter is, en productiviteit het hoogste goed is.",
      "De mens is geen fabriek. AI is geen religie. En autonomie is geen detail.",
      "Wij geloven dat AI een gereedschap is. Krachtig, nuttig, soms briljant. Maar alleen als je begrijpt wat je gebruikt, waarom, en welke gevolgen dat heeft.",
      "Want de grootste risico’s ontstaan niet doordat mensen AI gebruiken. Ze ontstaan doordat mensen AI gebruiken zonder te begrijpen wat ze gebruiken.",
      "Begrip is autonomie. Nieuwsgierigheid is verzet.",
      "Daarom bestaat Human Margin.",
      paragraph([text("Lees het "), link("manifest", "/manifest")]),
      paragraph([text("Of begin "), link("hier", "/ai-reality-check"), text(".")]),
    ]),
    annotations: [
      { text: "Anti-zombie", font: "handwritten" as const },
      { text: "Be curious!", font: "handwritten" as const },
    ],
    framedImage: media(
      "https://humanmargin.eu/wp-content/uploads/2026/06/AI-compliance-woordenboek-1-1024x439.jpg",
    ),
    bodyBottom: richText([
      "Dat is de definitie. Maar wat wil dat in godsnaam zeggen in de praktijk?",
      "Dat iedereen die AI gebruikt voor zijn werk aan een aantal vereisten moet voldoen.",
      "Denk je nu: dit is niets voor mij want ik werk enkel met mijn lievelingsmannen Chat en Claude.",
      "Dan heb je even een AI Reality Check nodig. Want helaas pindakaas geldt het dan ook voor jou.",
      "In vier minuten weet je:",
    ]),
    arrowList: [
      { text: "of de AI Act voor jou geldt" },
      { text: "welke rol je hebt onder de wet" },
      { text: "welke verplichtingen daarbij horen" },
      { text: "en wat je slimste volgende stap is" },
    ],
    cta: { label: "Doe de AI Reality Check", href: "/ai-reality-check", variant: "blue" as const },
  },
  {
    blockType: "textColumns" as const,
    background: "offwhite" as const,
    heading: "De Human Margin Methode",
    columns: [
      {
        body: richText([
          "Geen juristenkantoor of standaard AI-compliancebureau. Onleesbaarheid is een verdienmodel. Dat breken we door.",
          "Want om je autonomie te bewaren moet je eerst begrijpen.",
          "We werken volgens de Human Margin Methode, en die vertrekt van drie simpele vragen:",
          "Wat gebruik je? Wat betekent dat? En welke verantwoordelijkheid hoort daarbij?",
          "Het is geen checklist, maar een manier van denken. AI gaat over verantwoordelijkheid. En die begint bij begrijpen.",
        ]),
      },
    ],
  },
  {
    blockType: "splitPhotoText" as const,
    background: "offwhite" as const,
    imagePosition: "left" as const,
    imageTreatment: "inset" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MARGESCHRIJVER-3-1024x750.jpg"),
    heading: "Je hoeft geen AI-expert te worden.",
    headingLevel: "h2" as const,
    body: richText([
      "Je hoeft de AI Act niet vanbuiten te kennen. Je moet gewoon weten wat je gebruikt, en wat dat betekent.",
      "Allemaal goed en wel die AI Compliance. Rest één vraag: hoe dan?",
      "De ene begint met de AI Reality Check. Dat is aan jou de keuze.",
      "Ga je liever meteen en alleen aan de slag of hou je net van wat peer-pressure? Er is een AI Compliance Kit voor beiden.",
      "Zit je kniediep in de AI-chaos of werk je samen met anderen? Dan is een op maat traject eerder wat voor jou.",
      "Hoe dan ook. Je bent op de juiste plaats. Of toch bijna.",
    ]),
    cta: { label: "Neem actie", href: "/neem-actie", variant: "yellow" as const },
  },
  {
    blockType: "testimonials" as const,
    heading: "Recensies zijn leuk.",
    intro:
      "Voor mijn ego, maar mogelijk ook voor jou. En waarom hier wat typen als anderen 't al beter zeiden?",
    items: [
      {
        quote:
          "Zelfs als de wet er niet zou zijn, wil ik weten wat ik inzet, waarom, en wat daar de consequenties van zijn. Niet vanuit angst of verplichting, maar vanuit bewustzijn.",
        name: "Miriam Dix",
      },
      {
        quote:
          "Het geeft mij veel rust in mijn hoofd dat ik nu mijn AI gebruik in kaart heb gebracht én voldoe aan de gestelde eisen vanuit de AI Act.",
        name: "Edith Heslenga",
      },
    ],
  },
  {
    blockType: "textCta" as const,
    background: "white" as const,
    heading: "En wie ben ik überhaupt om dit te zeggen?",
    body: richText([
      "Fair enough.",
      "Ik vind ook niet dat je iemand moet vertrouwen omdat die zichzelf expert noemt. Zeker niet van LinkedIn. Zeker niet over iets met AI.",
      "Dus voor je mij gelooft: lees wie ik ben, waarom ik dit doe, en zo koppig blijf hameren op begrip boven blind vertrouwen.",
    ]),
    cta: { label: "Meer over mij", href: "/over-mij", variant: "blue" as const },
  },
];

const page: PageSeed = {
  title: "Home",
  slug: "home",
  layout,
  meta: {
    title: "Home - Human Margin",
    description:
      "Ja, ook als je 'm alleen gebruikt om teksten te schrijven. Nee, niet alleen voor grote bedrijven met een juridische afdeling. Ook voor zelfstandigen,",
  },
};

export default page;
