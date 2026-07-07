/**
 * PageSeed: op-de-leestafel — exacte content van humanmargin.eu/op-de-leestafel/
 * Lichte intro + "Externe artikels"-blok met blogpost-kaarten + nieuwsbrief.
 */
import { FORMAT_BOLD, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    // Intro: tekst links, foto rechts, gebroken witte achtergrond.
    blockType: "splitPhotoText" as const,
    background: "offwhite" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/MARGESCHRIJVER-3.jpg"),
    heading: "Op de leestafel.",
    headingLevel: "h2" as const,
    body: richText([
      "Niet alles wat ik lees, schrijf ik zelf. Sommige mensen hebben de moeite al gedaan en schreven wat beters dan ik kan.",
      "Hier verzamel ik artikels, onderzoeken, bronnen en naslagwerk die me iets geleerd hebben.",
      "Soms omdat ik het ermee eens ben. Soms omdat ik het er grondig mee oneens ben. Maar altijd omdat het me deed nadenken.",
      "En lezen is alleen interessant als je er iets bij denkt.",
      paragraph([text("Nog niet veel te zien?", FORMAT_BOLD)]),
      "Klopt.",
      "Veel ligt voorlopig nog op mijn fysieke leestafel. Met potloodstrepen in de marge en post-its ertussen.",
      "En een hoop dingen waar ik nog iets van moet vinden.",
      "Maar kom gerust terug. Er ligt regelmatig iets nieuws.",
    ]),
  },
  {
    // Kop + intro van het "Externe artikels"-blok (in origineel gecentreerd).
    blockType: "textColumns" as const,
    background: "white" as const,
    heading: "Externe artikels",
    align: "center" as const,
    columns: [
      {
        body: richText([
          "Wat ik gelezen heb en de moeite waard vond om door te geven, zonder algoritmische aanbevelingen.",
          "Hier geen platte hooks, maar stukken die helpen begrijpen wat er verandert, waarom dat belangrijk is en wat je ermee kan. Met af en toe een gedachte erbij.",
          "En natuurlijk de volledige AI Act. Want soms wil je niet weten wat iemand ervan vindt maar wil je gewoon zelf lezen.",
        ]),
      },
    ],
  },
  {
    // Blogpost-kaart (posts.cards, categorie op-de-leestafel) als compacte artikel-kaart.
    blockType: "postCards" as const,
    background: "white" as const,
    cards: [
      {
        image: media("https://humanmargin.eu/wp-content/uploads/2026/06/20-1-200x300.jpg"),
        label: "Op de leestafel",
        title: "When Using AI Leads to “Brain Fry”",
        excerpt:
          "Een BCG-onderzoek onder bijna 1.500 werknemers naar wat intensief AI-gebruik met je hoofd doet. De uitkomst is genuanceerder dan de kop doet vermoeden. AI dat saai, repetitief werk overneemt, verlaagt de burn-out. Maar AI dat je voortdurend moet aansturen en controleren, meerdere tools tegelijk, alles dubbelchecken, doet het tegenovergestelde. Dat maalt je hoofd fijn. De onderzoekers noemen het “brain fry”: mentale mist, tragere beslissingen, meerfouten. Marketeers rapporteren het het vaakst. En eerlijk gezegd klonk het mij ook bekend in de oren.",
        href: "/when-using-ai-leads-to-brain-fry",
        readMore: "Lees verder »",
      },
    ],
  },
  {
    // Nieuwsbrief-aanmelding (donker, gele penseelstreek + "In de Marge"-marker).
    blockType: "brushNote" as const,
    markerHeading: "In de Marge",
    body: richText([
      paragraph([text("Lezen is trager dan scrollen.", FORMAT_BOLD)]),
      "Dat is precies het punt.",
      "Lees mee wat ik In de Marge schrijf",
    ]),
    showForm: true,
    formButtonLabel: "Schrijf me in",
  },
];

const page: PageSeed = {
  title: "Op de leestafel",
  slug: "op-de-leestafel",
  layout,
  meta: {
    title: "Op de leestafel - Human Margin",
    description:
      "Niet alles wat ik lees, schrijf ik zelf. Sommige mensen hebben de moeite al gedaan en schreven wat beters dan ik kan.",
  },
};

export default page;
