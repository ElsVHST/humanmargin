/**
 * PageSeed: aick-aanbieder — exacte content van humanmargin.eu/aick-aanbieder/
 */
import { FORMAT_BOLD, FORMAT_ITALIC, link, paragraph, richText, text } from "../lexical";
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
    heading: "Verkoop jij AI onder je eigen naam?",
    subheading: "Dan kijkt de AI Act naar jou. Niet naar OpenAI of Anthropic.",
    headingLevel: "h1" as const,
    body: richText([
      "Een custom GPT, een tool, een dienst met AI eronder. Zodra het jouw naam draagt, ben jij mogelijk de aanbieder. En een aanbieder draagt meer dan een gebruiker.",
      "Geen paniek. Voor AI die niet hoog-risico is, valt dat meestal goed mee.",
      "Maar het is wel iets dat je beter geregeld hebt voor iemand ernaar vraagt.",
      "Daarom bestaat het Aanbiederstraject.",
      "In ongeveer een maand zetten we samen een dossier op dat duidelijk maakt wat jouw tool doet, waarvoor die bedoeld is en waar de grenzen liggen.",
    ]),
    cta: {
      label: "Start het Aanbiederstraject (€799 incl. AICK)",
      href: KIT_CHECKOUT,
      variant: "yellow" as const,
    },
  },
  // Sectie 0 (vervolg) — secundair aanbod + reality-check-link, zwarte achtergrond.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    compact: true,
    columns: [
      {
        body: richText([
          "Heb je de AICK al?",
          "Dan kost het traject los €499.",
          paragraph([text("Start aanbiederstraject zonder AICK", FORMAT_BOLD)]),
          "Niet zeker of je gebruiker of aanbieder bent? En welk risico jouw gebruik vormt?",
          paragraph([link("Doe eerst de AI Reality Check.", "/ai-reality-check")]),
        ]),
      },
    ],
  },
  // Sectie 1 — gele penseelstreek links, quote + naam.
  {
    blockType: "brushNote" as const,
    body: richText([
      paragraph([
        text(
          "“Ik had geen flauw benul dat zoveel tools die ik gebruikte AI waren. En dat ik met mijn aanbod ook nog eens ‘aanbieder’ was in plaats van simpel ‘gebruiker’, had ik nooit bij stilgestaan.”",
          FORMAT_ITALIC,
        ),
      ]),
    ]),
    attribution: "— Emma Ritzen",
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
    heading: "Jij zette je naam eronder.",
    headingLevel: "h2" as const,
    body: richText([
      "Het model komt misschien van iemand anders. Maar de toepassing die jij ermee bouwt en verkoopt, draagt jouw naam.",
      paragraph([text("En dat verandert alles.", FORMAT_BOLD)]),
      "Want zodra jij iets met AI op de markt zet, word jij het adres.",
      "Werkt het fout? Gebruikt een klant het op een manier die jij nooit bedoeld had? Vraagt iemand hoe jouw toepassing zich verhoudt tot de AI Act?",
      "Dan komen ze niet bij de maker van het model terecht. Dan komen ze bij jou.",
      "Een gebruiker kan nog wijzen naar de tool die hij koos. Een aanbieder niet. Jij maakte hem, jij verkocht hem, jij staat ervoor garant.",
    ]),
  },
  // Sectie 3 — donkere longform: kop + gele subkop + tekst + lijst + blauwe annotatie + gele knop.
  {
    blockType: "longformDark" as const,
    heading: "Wat moet, en wat slim is",
    highlight:
      "Heel eerlijk? Voor een tool die niet hoog-risico is, vraagt de AI Act vaak minder dan mensen denken.",
    bodyTop: richText([
      "Geen veertig pagina’s documentatie, CE-trajecten of zware conformiteitsbeoordelingen.",
      "Maar low-risk is niet hetzelfde als geen risico.",
      "Andere wetgeving blijft bestaan.",
      "Aansprakelijkheid blijft bestaan.",
      "En gezond verstand blijft bestaan.",
      "Neem bijvoorbeeld een AI-tool die je bouwt als sparringspartner voor ondernemers.",
      "Een jaar later gebruiken klanten hem plots voor kredietbeoordelingen of personeelsbeslissingen.",
      "Dan doet jouw tool ineens iets heel anders dan jij ooit bedoeld had.",
      "Als je nergens hebt vastgelegd waarvoor die tool wel en niet bedoeld is, wordt dat een lastig gesprek wanneer er iets misloopt.",
      "Daarom leggen we samen zwart op wit vast:",
      "waarvoor je tool bedoeld is;",
      "waarvoor hij uitdrukkelijk niet bedoeld is;",
      "welke risico’s je redelijkerwijs kunt verwachten;",
      "welke voorzorgen je genomen hebt.",
      "Better safe than sorry.",
    ]),
    annotations: [{ text: "Denk na!", font: "handwritten" as const }],
    cta: {
      label: "Start het Aanbiederstraject (€799 incl. AICK)",
      href: KIT_CHECKOUT,
      variant: "yellow" as const,
    },
  },
  // Sectie 4 — grijs: foto links, "Zo pakken we het aan" + tekst rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "gray" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
    heading: "Zo pakken we het aan",
    headingLevel: "h2" as const,
    body: richText([
      "Dit is geen cursus die je alleen doorloopt, maar een traject dat we samen afleggen.",
      "Je vult een korte vragenlijst in, zodat ik weet wat je aanbiedt en aan wie.",
      "Je vult eerst een korte vragenlijst in, zodat ik begrijp wat je aanbiedt, voor wie en hoe het werkt.",
      "Daarna hebben we een eerste gesprek waarin we alle open eindjes bespreken.",
      "Op basis daarvan werk ik je dossier uit.",
    ]),
  },
  // Sectie 5 — grijs: vinkjeslijst "We leggen vast:".
  {
    blockType: "iconList" as const,
    background: "gray" as const,
    heading: "We leggen vast:",
    items: [
      { text: "wat je tool doet;" },
      { text: "waarvoor die bedoeld is;" },
      { text: "welke toepassingen je uitsluit;" },
      { text: "welke transparantie je voorziet;" },
      { text: "welke veiligheidsmaatregelen relevant zijn." },
    ],
  },
  // Sectie 5 (vervolg) — tekst na de lijst, grijze achtergrond.
  {
    blockType: "textColumns" as const,
    background: "gray" as const,
    compact: true,
    columns: [
      {
        body: richText([
          "Daarna lopen we alles nog een laatste keer samen door, zodat je de documenten hebt én begrijpt wat erin staat.",
          "En ik laat je daarna niet zomaar los, na zes maanden spreken we opnieuw even af om te bekijken of alles nog klopt.",
          "Misschien zijn er nieuwe functies bijgekomen, gebruik je de tool anders, of is de wet aangepast. Zo ja, sturen we bij waar nodig.",
        ]),
      },
    ],
  },
  // Sectie 6 — donkere vinkjeslijst "Wat krijg je concreet?".
  {
    blockType: "iconList" as const,
    background: "black" as const,
    heading: "Wat krijg je concreet?",
    items: [
      { text: "Eén helder dossier voor je AI-tool. Daarin leggen we vast:" },
      { text: "het beoogde doel van je tool" },
      { text: "welke vormen van misbruik je redelijkerwijs kunt verwachten" },
      { text: "welke toepassingen uitgesloten zijn" },
      { text: "welke veiligheidsmaatregelen je genomen hebt" },
      { text: "welke menselijke controle nodig is" },
      { text: "welke transparantie je naar klanten voorziet" },
      { text: "duidelijke gebruiksinstructies in gewone mensentaal." },
    ],
  },
  // Sectie 7 — grijs: foto links, "Daarnaast krijg je:" + lijst rechts.
  {
    blockType: "splitPhotoText" as const,
    background: "gray" as const,
    imagePosition: "left" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/10-1-682x1024.jpg"),
    heading: "Daarnaast krijg je:",
    headingLevel: "h2" as const,
    body: richText([
      "een AI-beleid afgestemd op jouw rol als aanbieder",
      "de volledige AICK (€349 waarde)",
      "een certificaat en badge",
      "een check-in na zes maanden",
      "één jaar updates over relevante wijzigingen in de AI Act.",
    ]),
  },
  // Sectie 8 — grijs: "Wat hou je eraan over?" + tekst met blauwe annotatie.
  {
    blockType: "textColumns" as const,
    background: "gray" as const,
    heading: "Wat hou je eraan over?",
    columns: [
      {
        body: richText([
          "Je staat sterker als er vragen komen. Gebruikt een klant je tool verkeerd, of loopt er iets mis, dan kun je zwart op wit laten zien waar je tool wél en niet voor was, en welke voorzorgen je nam.",
          "Better safe than sorry.",
          paragraph([text("Maar er is nog iets anders.", FORMAT_BOLD)]),
          "Het onderscheid je van de massa. Veel mensen bouwen vandaag AI-oplossingen, maar maar weinigen kunnen aantonen dat ze hebben nagedacht over de risico’s.",
          "Dat jij dat wel kan, wekt vertrouwen, en vertrouwen verkoopt.",
          "Jouw compliancewerk wordt dan geen last maar een concurrentievoordeel.",
          "En misschien nog belangijker: je begrijpt zelf wat je gebouwd hebt.",
        ]),
      },
    ],
  },
  // Sectie 9 — sectiekop boven twee donkere kaarten.
  {
    blockType: "textColumns" as const,
    background: "offwhite" as const,
    compact: true,
    heading: "Dit is niet voor iedereen",
    columns: [],
  },
  {
    blockType: "cardColumns" as const,
    background: "black" as const,
    cards: [
      {
        subheading: "wel voor zelfstandig ondernemers die..",
        body: richText([
          paragraph([text("AI verkopen onder hun eigen naam:", FORMAT_BOLD)]),
          "een custom GPT",
          "een AI-agent",
          "een AI-tool",
          "een dienst waarin AI een wezenlijk onderdeel vormt",
          "AI-functionaliteit die je toevoegt aan bestaande diensten.",
        ]),
        cta: {
          label: "→ Start het Aanbiederstraject (€799 incl. AICK)",
          href: KIT_CHECKOUT,
          variant: "yellow" as const,
        },
      },
      {
        subheading: "Maar niet voor...",
        body: richText([
          paragraph([
            text(
              "Niet, als je AI alleen zelf gebruikt en niks op de markt zet. Dan ben je gebruiker, en ",
            ),
            link("de AICK", "/aick-de-kit"),
            text(" is jouw pad."),
          ]),
          paragraph([
            text("Ook niet als je iets hoog-risico bouwt. Dan heb je maatwerk nodig: dat doen we via "),
            link("hoog risico op maat", "/hoog-risico-op-maat"),
            text("."),
          ]),
          paragraph([
            text("Werk je met een team? Dan is er mogelijk ook maatwerk nodig: "),
            link("op maat – teams", "/team-op-maat"),
            text("."),
          ]),
        ]),
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
      "En omdat ik daar zo belachelijk veel uren in gestoken heb dat ik het niemand anders wil aandoen.",
      "Omdat ik andere ondernemers net als jij al hielp met hun compliance.",
      "Omdat ik in Gewoon Mens zeg wat anderen ingewikkeld houden.",
      "Daarom.",
      "You’re welcome.",
    ]),
    cta: {
      label: "Weten wie ik ben en waarom ik dit doe?",
      href: "/over-mij",
      variant: "blue" as const,
    },
  },
  // Sectie 11 — donkere recensie-sectie (quote hergebruikt uit sectie 1).
  {
    blockType: "testimonials" as const,
    heading: "En geloof je mij niet, hier heb je Emma Ritzen:",
    items: [
      {
        quote:
          "“Ik had geen flauw benul dat zoveel tools die ik gebruikte AI waren. En dat ik met mijn aanbod ook nog eens ‘aanbieder’ was in plaats van simpel ‘gebruiker’, had ik nooit bij stilgestaan.”",
        name: "Emma Ritzen",
      },
    ],
  },
  // Sectie 12 — gebroken wit: prijssectie met knop.
  {
    blockType: "textCta" as const,
    background: "offwhite" as const,
    heading: "Wat het kost",
    body: richText([
      paragraph([text("€799 excl. btw voor het volledige pakket:", FORMAT_BOLD)]),
      "de volledige AICK (€349 waarde)",
      "het Aanbiederstraject;",
      "de check-in na zes maanden;",
      "één jaar updates.",
    ]),
    cta: {
      label: "→ Start AICK + Aanbiederstraject",
      href: KIT_CHECKOUT,
      variant: "yellow" as const,
    },
  },
  // Sectie 12 (vervolg) — tekst na de knop, gebroken wit.
  {
    blockType: "textColumns" as const,
    background: "offwhite" as const,
    compact: true,
    columns: [
      {
        body: richText([
          "Heb je de AICK al?",
          "Dan kost het traject los €499 excl. btw.",
          "Een advocaat die dit voor je uitzoekt, rekent dat bedrag voor de eerste paar uur. Hier heb je het gedaan, en je begrijpt het ook nog.",
          "En wat je begrijpt blijft van jou.",
        ]),
      },
    ],
  },
  // Sectie 13 — FAQ-accordeon.
  {
    blockType: "faq" as const,
    background: "offwhite" as const,
    heading: "Veelgestelde vragen",
    items: [
      {
        question: "“Ik bouw maar een klein GPT'tje, geldt dit echt voor mij?”",
        answer: richText([
          paragraph([
            text(
              "Misschien wel, misschien niet, en dat is net het punt. Of je aanbieder bent hangt niet af van hoe klein het is, wel van wat je ermee doet. ",
            ),
            link("De AI Reality Check", "/ai-reality-check"),
            text(" zegt je in vijf minuten of je aanbieder bent en welk risico jouw tol vormt."),
          ]),
        ]),
      },
      {
        question: "“Ik heb de AICK al gedaan.”",
        answer: richText([
          "Mooi, dan betaal je niet dubbel. Het traject los is €499, zonder de Kit erbij. Je kan het Aanbiederstraject hier los bijbestellen. Naar aanbiederstraject",
        ]),
      },
      {
        question: "“Hoe lang duurt dit?”",
        answer: richText([
          "Ongeveer een maand. En laat ons even duidelijk zijn: dat is hoe lang je moet wachten, niet hoeveel tijd je erin steekt. Concreet vraag ik je voor het aanbiederstraject 30 minuten om een vragenlijst in te vullen, 30 minuten kick-off call, mogelijk wat verduidelijkingsvragen via mail en een afsluitende call van 30 minuten.",
          "Voor jou maximum 2 uur werk. Voor mij een veelvoud daarvan.",
        ]),
      },
      {
        question: "“Ik weet niet of ik gebruiker of aanbieder ben.”",
        answer: richText([
          paragraph([
            text("Herkenbaar, daar lopen meerdere ondernemers klem. Doe de "),
            link("AI Reality Check", "/ai-reality-check"),
            text(", dan weet je meteen welk pad het jouwe is."),
          ]),
        ]),
      },
    ],
  },
  // Sectie 14 — donkere slot-CTA met blauwe annotatie.
  {
    blockType: "longformDark" as const,
    heading: "Klaar?",
    annotations: [{ text: "checkerdecheck", font: "handwritten" as const }],
    cta: {
      label: "Start het Aanbiederstraject, €799 met Kit",
      href: KIT_CHECKOUT,
      variant: "yellow" as const,
    },
  },
  // Sectie 14 (vervolg) — secundaire links + juridische disclaimer, zwarte achtergrond.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    compact: true,
    columns: [
      {
        body: richText([
          "Heb je de AICK al? Dan kost het los €499.",
          "Twijfel je of je gebruiker of aanbieder bent?",
          paragraph([link("Doe eerst de AI Reality Check.", "/ai-reality-check")]),
          paragraph([
            text("Toch nog vragen? Schrijf me op "),
            link("els@humanmargin.eu", "mailto:els@humanmargin.eu"),
            text(" of plan een snelle call in: "),
            link(
              "https://calendly.com/human-margin-info/30min",
              "https://calendly.com/human-margin-info/30min",
            ),
          ]),
          paragraph([
            text(
              "Human Margin biedt geen juridisch advies. Het Aanbiederstraject helpt je de stappen zetten die de AI Act van aanbieders vraagt en je werk te documenteren. Of je uiteindelijk aan alle wettelijke vereisten voldoet, wordt bepaald door de bevoegde toezichthouder.",
              FORMAT_ITALIC,
            ),
          ]),
        ]),
      },
    ],
  },
];

const page: PageSeed = {
  title: "AICK Aanbieder",
  slug: "aick-aanbieder",
  layout,
  meta: {
    title: "AICK Aanbieder - Human Margin",
    description:
      "Een custom GPT, een tool, een dienst met AI eronder. Zodra het jouw naam draagt, ben jij mogelijk de aanbieder. En een aanbieder draagt meer dan een gebruiker.",
  },
};

export default page;
