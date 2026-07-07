/**
 * PageSeed: in-mensentaal — exacte content van humanmargin.eu/in-mensentaal/
 * Lichte intro (tekst links + foto rechts) + blogpost-kaarten (posts.cards).
 */
import { richText } from "../lexical";
import { media, type PageSeed } from "../media-map";

const layout = [
  {
    // Intro: tekst links, foto rechts, gebroken witte achtergrond.
    blockType: "splitPhotoText" as const,
    background: "offwhite" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/4-1.jpg"),
    heading: "In mensentaal.",
    headingLevel: "h2" as const,
    body: richText([
      "Op zoek naar betrouwbare info over de AI Act in begrijpelijke taal en zonder onnodig veel details en zijsporen. Dan zit je hier goed.",
      "De AI Act in Gewoon Mens.",
      "Niet te veel, maar ook niet te weinig zodat je weet wat relevant is voor jou. Zonder dat je er een full-time job aan hebt.",
    ]),
  },
  {
    // Blogpost-kaart (posts.cards, categorie in-mensentaal) als compacte artikel-kaart.
    blockType: "postCards" as const,
    background: "white" as const,
    cards: [
      {
        image: media("https://humanmargin.eu/wp-content/uploads/2026/06/3-1-200x300.jpg"),
        label: "in mensentaal",
        title: "AI Act voor kleine ondernemers: wat moet je écht doen?",
        excerpt:
          "– Ja, de AI Act geldt waarschijnlijk ook voor jou. – Nee, omdat je ChatGPT gebruikt hoef je niet meteen een leger consultants in te huren. – Voor de meeste kleine ondernemers draait het om drie dingen: AI-geletterdheid, weten welke AI je gebruikt, en vermijden dat je per ongeluk in verboden of hoog-risico toepassingen terechtkomt. – De meeste mensen hebben geen compliance-probleem. Ze hebben een overzichtsprobleem. – Begin simpel. Maar begin wel.",
        href: "/ai-act-zzp",
        readMore: "Lees verder »",
      },
    ],
  },
];

const page: PageSeed = {
  title: "In mensentaal",
  slug: "in-mensentaal",
  layout,
  meta: {
    title: "In mensentaal - Human Margin",
    description:
      "Op zoek naar betrouwbare info over de AI Act in begrijpelijke taal en zonder onnodig veel details en zijsporen. Dan zit je hier goed.",
  },
};

export default page;
