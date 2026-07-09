/**
 * In-the-loop OS (Angus Sewell field guide, vertaald naar dit platform):
 * het board als single source of truth waar mens én agent samenwerken.
 *
 * Seedt idempotent:
 *  1. Agent-user "Dottie" (teamlid) — taken toewijzen aan Dottie = agent-queue.
 *  2. Board-stages "Ready (agent)" en "Heeft mij nodig" naast Els's kolommen.
 *  3. Kennisbank: map "Agent-skills (SOP's)" met de werkwijze + SOP-template.
 *
 * Draaien: npx payload run scripts/seed/seed-agent-loop.ts
 */
import { randomBytes } from "node:crypto";

import { getPayload } from "payload";

import config from "@payload-config";

const payload = await getPayload({ config });

function lexical(regels: string[]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: regels.map((regel) => {
        if (regel.startsWith("## ")) {
          return {
            type: "heading",
            tag: "h2",
            format: "" as const,
            indent: 0,
            version: 1,
            direction: "ltr" as const,
            children: [
              {
                type: "text",
                text: regel.slice(3),
                format: 0,
                style: "",
                mode: "normal",
                detail: 0,
                version: 1,
              },
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
            {
              type: "text",
              text: regel,
              format: 0,
              style: "",
              mode: "normal",
              detail: 0,
              version: 1,
            },
          ],
        };
      }),
    },
  };
}

const AGENT_EMAIL = "dottie@humanmargin.eu";

async function seedAgentUser(): Promise<void> {
  const bestaand = await payload.find({
    collection: "users",
    where: { email: { equals: AGENT_EMAIL } },
    limit: 1,
  });
  if (bestaand.totalDocs > 0) {
    console.log("↷ agent-user Dottie bestaat al");
    return;
  }
  await payload.create({
    collection: "users",
    data: {
      name: "Dottie (AI-agent)",
      email: AGENT_EMAIL,
      // Dottie logt nooit via de UI in; Local API handelt met user-attributie
      password: randomBytes(24).toString("hex"),
      role: "teamlid",
    },
  });
  console.log("✓ agent-user Dottie aangemaakt (teamlid)");
}

async function seedAgentStages(): Promise<void> {
  const gewenst = [
    { naam: "Ready (agent)", kleur: "turquoise" },
    { naam: "Heeft mij nodig", kleur: "roze" },
  ] as const;
  for (const status of gewenst) {
    const bestaand = await payload.find({
      collection: "task-statuses",
      where: { naam: { equals: status.naam } },
      limit: 1,
    });
    if (bestaand.totalDocs > 0) {
      console.log(`↷ status '${status.naam}' bestaat al`);
      continue;
    }
    await payload.create({ collection: "task-statuses", data: status });
    console.log(`✓ status '${status.naam}' aangemaakt`);
  }
}

async function seedSkillsBibliotheek(): Promise<void> {
  const MAP = "Agent-skills (SOP's)";
  let map = (
    await payload.find({
      collection: "knowledge-docs",
      where: { titel: { equals: MAP } },
      limit: 1,
    })
  ).docs[0];

  if (!map) {
    map = await payload.create({
      collection: "knowledge-docs",
      data: {
        titel: MAP,
        soort: "map",
        zichtbaarheid: "intern",
        tags: ["agent", "sop"],
      },
    });
    console.log(`✓ kennisbank-map '${MAP}' aangemaakt`);
  } else {
    console.log(`↷ kennisbank-map '${MAP}' bestaat al`);
  }

  const docs: { titel: string; regels: string[] }[] = [
    {
      titel: "In-the-loop werkwijze (lees mij eerst)",
      regels: [
        "Het board is de single source of truth: elke opdracht is een taak met een titel (objective), 'Context die ik al weet', een 'Definition of done' en een organisatie/project/referenties waar relevant.",
        "## De loop",
        "1. Taken voor de agent staan in de kolom 'Ready (agent)' en zijn toegewezen aan Dottie (AI-agent).",
        "2. De agent leest de kaart én alle comments op de tijdlijn. Compleet? Dan doet hij het werk, post het resultaat als comment en verplaatst de kaart naar 'Review'.",
        "3. Is er iets onduidelijk, dan gokt de agent NOOIT: hij zet elke aanname om in een genummerde vraag (comment-type 'Vraag'), verplaatst de kaart naar 'Heeft mij nodig' en stopt.",
        "4. Jij antwoordt gewoon als comment op de kaart — dat ís de loop. Daarna gaat de kaart terug naar 'Ready (agent)'.",
        "5. Bij afronden schrijft de agent een LOG-comment: wat er gevraagd is, wat er verhelderd is, welke beslissing er viel en waarom.",
        "## Waarom loggen",
        "De LOG-comments zijn het geheugen van het bedrijf. Na verloop van tijd worden ze gemined op patronen (scripts/agent/mine-trail.ts) en omgezet in SOP's in deze map — zo leert de AI werken zoals jíj werkt.",
        "## Spelregels",
        "Niets wordt automatisch gepubliceerd of verstuurd; de agent bereidt voor, jij keurt goed. Archiveer afgeronde taken in plaats van ze te verwijderen — de prullenbak is het archief niet, de LOG wel.",
      ],
    },
    {
      titel: "SOP-template",
      regels: [
        "Kopieer dit document voor elke nieuwe skill/SOP die uit de mine-analyse komt.",
        "## Naam en trigger",
        "Welk terugkerend werk automatiseert dit, en waaraan herkent de agent zo'n taak (tags, titelwoorden, kolom)?",
        "## Context vooraf verzamelen",
        "Welke informatie haalt de agent éérst op (kennisbank-referenties, CRM-record, eerdere LOG's) voordat hij begint?",
        "## Vragen die altijd eerst gesteld worden",
        "De vaste vragen aan de opdrachtgever vóór uitvoering — geleerd uit eerdere vraag-comments.",
        "## Stappen",
        "De uitvoering, stap voor stap, met echte voorbeelden uit eerdere taken.",
        "## Definition of done",
        "Wanneer is het af, en hoe ziet het resultaat-comment eruit?",
      ],
    },
  ];

  for (const doc of docs) {
    const bestaand = await payload.find({
      collection: "knowledge-docs",
      where: { titel: { equals: doc.titel } },
      limit: 1,
    });
    if (bestaand.totalDocs > 0) {
      console.log(`↷ document '${doc.titel}' bestaat al`);
      continue;
    }
    await payload.create({
      collection: "knowledge-docs",
      data: {
        titel: doc.titel,
        soort: "document",
        zichtbaarheid: "intern",
        parent: map.id,
        tags: ["agent", "sop"],
        inhoud: lexical(doc.regels),
      },
    });
    console.log(`✓ document '${doc.titel}' aangemaakt`);
  }
}

await seedAgentUser();
await seedAgentStages();
await seedSkillsBibliotheek();
console.log("Klaar — in-the-loop OS staat.");
process.exit(0);
