/**
 * Seed de gebruikershandleiding in de kennisbank (spec: documentatie voor Els
 * leeft in haar eigen dashboard). Idempotent: bestaat het hoofddocument al,
 * dan wordt de hele seed overgeslagen.
 * Draaien: npx payload run scripts/seed/seed-handleiding.ts
 */
import { getPayload } from "payload";

import config from "@payload-config";

const payload = await getPayload({ config });

const HOOFDTITEL = "Handleiding dashboard";

const bestaand = await payload.find({
  collection: "knowledge-docs",
  where: { titel: { equals: HOOFDTITEL } },
  limit: 1,
});
if (bestaand.totalDocs > 0) {
  console.log("↷ handleiding bestaat al, overslaan");
  process.exit(0);
}

/** Eenvoudige regels → Lexical-editorState (koppen en paragrafen). */
function lexical(regels: string[]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: regels.map((regel) => {
        const isKop = regel.startsWith("## ");
        const tekst = isKop ? regel.slice(3) : regel;
        if (isKop) {
          return {
            type: "heading",
            tag: "h2",
            format: "" as const,
            indent: 0,
            version: 1,
            direction: "ltr" as const,
            children: [
              { type: "text", text: tekst, format: 0, style: "", mode: "normal", detail: 0, version: 1 },
            ],
          };
        }
        return {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          textStyle: "",
          children: [
            { type: "text", text: tekst, format: 0, style: "", mode: "normal", detail: 0, version: 1 },
          ],
        };
      }),
    },
  };
}

const root = await payload.create({
  collection: "knowledge-docs",
  data: {
    titel: HOOFDTITEL,
    zichtbaarheid: "intern",
    tags: ["handleiding"],
    inhoud: lexical([
      "Welkom bij je dashboard! Hieronder vind je per onderdeel een hoofdstuk met uitleg. Deze handleiding is van jou — pas hem gerust aan of vul hem aan.",
      "Log in op /admin en je start op Home: je open deals, jouw taken, de content van deze week en de laatste activiteit van het team, met snelknoppen om direct iets aan te maken.",
      "Belangrijk om te onthouden: verwijderen is nooit definitief (alles heeft een prullenbak) en jij bepaalt zelf hoe je pipeline-fases, taakstatussen en contentkanalen heten.",
    ]),
  },
});

const hoofdstukken: { titel: string; regels: string[] }[] = [
  {
    titel: "1. Klanten & verkoop (CRM)",
    regels: [
      "Organisaties zijn het middelpunt: open een organisatie en je ziet haar contactpersonen, deals én projecten in één scherm, plus de tijdlijn onderaan.",
      "Contactpersonen hebben een uniek e-mailadres; het dashboard toont automatisch of iemand op je nieuwsbrief geabonneerd is.",
      "## Het pipeline-board",
      "Deals volg je op het Pipeline-board (menu links). Sleep een kaart naar een andere fase — dat wordt automatisch gelogd in de tijdlijn van de deal.",
      "Zet je de uitkomst van een deal op Gewonnen, dan maakt het dashboard vanzelf een project voor je aan.",
      "## Fases aanpassen",
      "Klik op een kolomnaam om te hernoemen, gebruik + Fase voor een nieuwe kolom en × om er één te verwijderen — kaarten vallen dan veilig terug in 'Geen fase'. De volgorde van fases versleep je in de lijst Pipeline-fases.",
      "## Notities",
      "Op elke deal, organisatie of contactpersoon staat onderaan een tijdlijn. Typ een notitie en druk op Enter — het hele team ziet de historie.",
    ],
  },
  {
    titel: "2. Projecten & taken",
    regels: [
      "Projecten koppel je aan een klant, of je laat de organisatie leeg voor intern werk. Gewonnen deals worden automatisch een project.",
      "Het Taken-board werkt net als de pipeline: sleep taken door de statussen, filter op project of persoon. Rood = deadline verstreken, 'Hoog' = hoge prioriteit.",
      "Een taak kan een checklist hebben — handig voor terugkerende stappen. Taakstatussen beheer je op het board zelf.",
    ],
  },
  {
    titel: "3. Contentkalender",
    regels: [
      "Plan je blogs, nieuwsbrieven en LinkedIn-posts op de Kalender (maand-, week- of lijstweergave). Sleep een item naar een andere dag om het te verplaatsen.",
      "Elke content krijgt een status: Idee → Concept → Gepland → Gepubliceerd.",
      "## Magie voor blogs",
      "Zet een blog-item op Gepland en het dashboard maakt automatisch een conceptpagina op je website aan, klaar om te schrijven. Je vindt hem via 'Gekoppelde pagina' op het item.",
      "Kanalen (Blog, Nieuwsbrief, LinkedIn, …) beheer je zelf onder Contentkanalen.",
    ],
  },
  {
    titel: "4. Kennisbank",
    regels: [
      "Je interne wiki: documenten met hoofdstukken en subhoofdstukken, geschreven in dezelfde editor als je websitepagina's.",
      "Zoek bovenaan, klap takken open, en maak met + direct een subdocument. Documenten kunnen later ook 'Publiek' worden voor op de site.",
    ],
  },
  {
    titel: "5. Prullenbak, rollen & veiligheid",
    regels: [
      "Verwijderen is nooit definitief: alles gaat eerst naar de prullenbak (tab rechtsboven in elke lijst). Herstellen kan altijd; definitief legen kan alleen een beheerder.",
      "Beheerders mogen alles: kolommen beheren, gebruikers aanmaken, prullenbakken legen. Teamleden kunnen overal in werken, maar niets definitief weggooien of instellingen veranderen.",
      "Nieuwe teamleden maak je aan onder Beheer → Gebruikers.",
    ],
  },
  {
    titel: "6. Werken met Dottie (je AI-partner)",
    regels: [
      "Dottie kent dit hele systeem en kan alles voor je doen wat jij ook kunt — en meer. Een paar voorbeelden van wat je kunt vragen:",
      "• Zet de deal met Bedrijf X op gewonnen en maak alvast drie taken aan voor de kick-off.",
      "• Voeg een fase 'Nazorg' toe aan mijn pipeline.",
      "• Welke deals staan al meer dan een maand in Offerte?",
      "• Plan voor volgende maand elke dinsdag een LinkedIn-post in.",
      "• Schrijf een kennisbank-document over onze offerte-werkwijze.",
      "Alles wat Dottie doet verschijnt gewoon in jouw dashboard, met dezelfde regels: tijdlijn-logging, prullenbak en rollen.",
    ],
  },
];

let positie = 1;
for (const hoofdstuk of hoofdstukken) {
  await payload.create({
    collection: "knowledge-docs",
    data: {
      titel: hoofdstuk.titel,
      zichtbaarheid: "intern",
      parent: root.id,
      position: positie++,
      inhoud: lexical(hoofdstuk.regels),
    },
  });
}
console.log(`✓ handleiding geseed: 1 hoofddocument + ${hoofdstukken.length} hoofdstukken`);
process.exit(0);
