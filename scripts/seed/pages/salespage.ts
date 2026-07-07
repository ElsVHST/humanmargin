/**
 * PageSeed: salespage — humanmargin.eu/salespage/
 *
 * Placeholder-/demo-salespagina, nog volledig met lorem-ipsum. Getrouw geseed met
 * best passende blocks. Algemene afwijkingen:
 *  - Blauwe secties (rgb(0,44,207)) worden op zwart gerenderd; geen enkel content-block
 *    ondersteunt een blauwe achtergrond.
 *  - Placeholder-afbeeldingen (placeholder-image-2.jpg, placeholder-1-1.png) staan niet
 *    in de media-map en zijn daarom weggelaten.
 *  - Bullet-/checklists zonder passend block worden als tekstregels weergegeven.
 * Per-sectie afwijkingen staan in commentaar hieronder.
 */
import { richText } from "../lexical";
import type { PageSeed } from "../media-map";

const lorem = () =>
  richText([
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.",
  ]);

const layout: PageSeed["layout"] = [
  // Sectie 0 — intro (grijs). AFWIJKING: originele kop is h1.
  {
    blockType: "textCta" as const,
    background: "gray" as const,
    heading: "Het High Potentials traject",
    body: richText([
      "Dit is de aller kortste samenvatting van dit geweldige traject. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum efficitur quam vel scelerisque consectetur.",
    ]),
    cta: { label: "Say no more, i'm in!", href: "#prijs", variant: "yellow" as const },
  },
  // Sectie 1 — quote. AFWIJKING: origineel blauwe balk → statement rendert zwart en
  // maakt de tekst hoofdletters.
  {
    blockType: "statement" as const,
    heading: "The future belongs to those who believe in the beauty of their dreams.",
    accent: "- Eleanor Roosevelt",
  },
  // Sectie 2 — tekst + opsomming (grijs). AFWIJKING: bullets als losse alinea's.
  {
    blockType: "textColumns" as const,
    background: "gray" as const,
    heading: "Ben jij klaar om je dromen waar te maken?",
    columns: [
      {
        body: richText([
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam pulvinar, nunc nec commodo dapibus, arcu felis feugiat neque, non tempus lacus nisi vitae dui. Duis vel ex ut nibh faucibus lacinia non eget lectus. Suspendisse sit amet nulla ac dui semper condimentum.",
          "Ut vulputate velit vitae est porttitor, nec pulvinar velit ullamcorper. Dan herken je vast dit:",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          "Nam pulvinar, nunc nec commodo dapibus, arcu felis feugiat neque, non tempus lacus nisi vitae dui.",
          "Duis vel ex ut nibh faucibus lacinia non eget lectus. Suspendisse sit amet nulla ac dui semper condimentum.",
        ]),
      },
    ],
  },
  // Sectie 3 — donkere quote + CTA.
  {
    blockType: "textCta" as const,
    background: "black" as const,
    heading: "Geen uitdaging is te groot als je de ambitie hebt om je dromen te verwezenlijken!",
    cta: { label: "Waar kan ik me inschrijven?", href: "#prijs", variant: "yellow" as const },
  },
  // Sectie 4 — checklist "Ben jij klaar om:" (grijs).
  // AFWIJKING: afsluitende lorem-alinea vervalt (iconList heeft geen body).
  {
    blockType: "iconList" as const,
    background: "gray" as const,
    heading: "Ben jij klaar om:",
    items: [
      { text: "Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula." },
      { text: "Fusce pharetra convallis urna." },
      { text: "Quisque ut nisi." },
      { text: "Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi." },
      { text: "Suspendisse non nisl sit amet velit hendrerit rutrum." },
      { text: "Ut leo." },
    ],
  },
  // Sectie 5 — "Dit mag je verwachten" (foto links + checklist + CTA).
  // AFWIJKING: linker afbeelding niet in media-map → weggelaten; splitPhotoText valt af
  // (foto verplicht). Checklist als tekstregels, CTA behouden via textCta.
  {
    blockType: "textCta" as const,
    background: "offwhite" as const,
    heading: "Dit mag je verwachten",
    body: richText([
      "Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula.",
      "Fusce pharetra convallis urna.",
      "Quisque ut nisi.",
      "Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi.",
      "Suspendisse non nisl sit amet velit hendrerit rutrum.",
      "Ut leo.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.",
    ]),
    cta: { label: "I'm Innnnnnnn!", href: "#prijs", variant: "yellow" as const },
  },
  // Sectie 6 — recensies. AFWIJKING: originele carousel had lege quotes ("Jane Doe /
  // Bedrijfsnaam"); placeholder-quote toegevoegd omdat het block een quote vereist.
  {
    blockType: "testimonials" as const,
    heading: "Zij gingen je voor:",
    items: [
      {
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        name: "Jane Doe",
      },
      {
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        name: "Jane Doe",
      },
      {
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        name: "Jane Doe",
      },
    ],
  },
  // Sectie 7 — checklist "Dit is wat je krijgt:" (grijs).
  // AFWIJKING: per-woord bold-accenten en de afsluitende "En nog veel meer!"-alinea vervallen.
  {
    blockType: "iconList" as const,
    background: "gray" as const,
    heading: "Dit is wat je krijgt:",
    items: [
      { text: "Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula." },
      { text: "Fusce pharetra convallis urna." },
      { text: "Quisque ut nisi." },
      { text: "Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi." },
      { text: "Suspendisse non nisl sit amet velit hendrerit rutrum." },
      { text: "Ut leo." },
    ],
  },
  // Sectie 8 — Bonus nummer 1 (blauw). AFWIJKING: blauw → zwart; placeholder-afbeelding
  // weggelaten; "Ter waarde van..."-kop opgenomen in de tekst.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    heading: "Bonus nummer 1",
    columns: [
      {
        body: richText([
          "Korte omschrijving van de bonus hier.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum efficitur quam vel scelerisque consectetur.",
          "Ter waarde van €129,-",
        ]),
      },
    ],
  },
  // Sectie 9 — Bonus nummer 2 (zwart). AFWIJKING: placeholder-afbeelding weggelaten.
  {
    blockType: "textColumns" as const,
    background: "black" as const,
    heading: "Bonus nummer 2",
    columns: [
      {
        body: richText([
          "Korte omschrijving van de bonus hier.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum efficitur quam vel scelerisque consectetur.",
          "Ter waarde van €129,-",
        ]),
      },
    ],
  },
  // Sectie 10 (deel a) — sectiekop boven de prijskaarten (cardColumns heeft geen kop-veld).
  {
    blockType: "statement" as const,
    heading: "Schrijf je nu in en maak je dromen waar!",
  },
  // Sectie 10 (deel b) — twee prijspakketten. AFWIJKING: blauw → zwart; checklist +
  // prijs in de kaarttekst; per-kaart accent-subkop = pakketnaam.
  {
    blockType: "cardColumns" as const,
    background: "black" as const,
    cards: [
      {
        heading: "Silver package",
        subheading: "Groepstraject",
        body: richText([
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.",
          "Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula.",
          "Fusce pharetra convallis urna.",
          "Quisque ut nisi.",
          "Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi.",
          "Suspendisse non nisl sit amet velit hendrerit rutrum.",
          "Ut leo.",
          "€999 per maand",
        ]),
        cta: {
          label: "I'm Innnnnnnn!",
          href: "https://checkout.plugandpay.nl/r?id=6ZsYTRLF",
          variant: "blue" as const,
        },
      },
      {
        heading: "Gold package",
        subheading: "Groepstraject + 1 op 1 coaching",
        body: richText([
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.",
          "Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula.",
          "Fusce pharetra convallis urna.",
          "Quisque ut nisi.",
          "Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi.",
          "Suspendisse non nisl sit amet velit hendrerit rutrum.",
          "Ut leo.",
          "€999 per maand",
        ]),
        cta: {
          label: "I want it all!",
          href: "https://checkout.plugandpay.nl/r?id=6ZsYTRLF",
          variant: "yellow" as const,
        },
      },
    ],
  },
  // Sectie 11 — module-accordeon. Gemapt op faq (module = vraag, lorem = antwoord).
  {
    blockType: "faq" as const,
    background: "gray" as const,
    heading: "De inhoud van de modules:",
    items: [
      { question: "Module #1", answer: lorem() },
      { question: "Module #2", answer: lorem() },
      { question: "Module #3", answer: lorem() },
      { question: "Module #4", answer: lorem() },
      { question: "Module #5", answer: lorem() },
      { question: "Module #6", answer: lorem() },
      { question: "Module #7", answer: lorem() },
    ],
  },
  // Sectie 12 — FAQ-accordeon.
  {
    blockType: "faq" as const,
    background: "gray" as const,
    heading: "FAQ",
    items: [
      { question: "Vraag #1", answer: lorem() },
      { question: "Vraag #2", answer: lorem() },
      { question: "Vraag #3", answer: lorem() },
      { question: "Vraag #4", answer: lorem() },
      { question: "Vraag #5", answer: lorem() },
      { question: "Vraag #6", answer: lorem() },
    ],
  },
];

const page: PageSeed = {
  title: "Salespage",
  slug: "salespage",
  layout,
  meta: {
    title: "Salespage - Human Margin",
    description:
      "Dit is de aller kortste samenvatting van dit geweldige traject. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum efficitur quam vel",
  },
};

export default page;
