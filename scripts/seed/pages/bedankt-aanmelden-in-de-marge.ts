/**
 * PageSeed: bedankt-aanmelden-in-de-marge — content van
 * humanmargin.eu/bedankt-aanmelden-in-de-marge/
 * Donkere bedank-sectie na nieuwsbrief-aanmelding: kop + longform tekst met
 * gele links naar de Leeszaal en de AI Reality Check.
 */
import { link, paragraph, richText, text } from "../lexical";
import { type PageSeed } from "../media-map";

const layout = [
  {
    blockType: "textCta" as const,
    background: "black" as const,
    heading: "Welkom in de marge.",
    body: richText([
      "Je leest mee. Dat is geen pose, dat is een houding. Bedankt dat je je erbij voegt.",
      "Wat nu:",
      "• Check je mailbox. De welkomstmail zit er hopelijk al, of komt binnen enkele minuten. Klik op de bevestigingslink, want zonder die klik kom je officieel niet in mijn lijst.",
      "• Niet aangekomen? Kijk in je spam-map. Voeg meteen het adres toe aan je contacten zodat de volgende mails wel doorkomen.",
      "• Daarna: niets. Geen welkomssequence, geen vijf mails in een week, geen verkoop-flow. Af en toe stuur ik iets als ik echt iets te zeggen heb.",
      paragraph([
        text("Tussendoor toch al wat lezen? "),
        link("Ga naar de Leeszaal.", "/leeszaal"),
      ]),
      paragraph([
        text("Of liever even kijken waar je staat? "),
        link("De AI Reality Check", "/ai-reality-check"),
      ]),
      "Tot binnenkort.",
      "Els",
    ]),
  },
];

const page: PageSeed = {
  title: "Bedankt aanmelden in de marge",
  slug: "bedankt-aanmelden-in-de-marge",
  layout,
  meta: {
    title: "Bedankt aanmelden in de marge - Human Margin",
    description:
      "Je leest mee. Dat is geen pose, dat is een houding. Bedankt dat je je erbij voegt. Wat nu:",
  },
};

export default page;
