/**
 * Routekaart uit Els's braindump (specs/2026-07-09-els-braindump-analyse.md)
 * als projecten + taken op het dashboard. Idempotent (zoekt op naam/titel).
 * Draaien: npx payload run scripts/seed/seed-routekaart.ts
 */
import { getPayload } from "payload";

import config from "@payload-config";

type TaakDef = {
  titel: string;
  omschrijving: string;
  prioriteit: "laag" | "normaal" | "hoog";
  toegewezenEmail?: string;
  checklist?: string[];
};

type ProjectDef = {
  naam: string;
  omschrijving: string;
  taken: TaakDef[];
};

const SPEC = "Spec: docs/superpowers/specs/2026-07-09-els-braindump-analyse.md";

const PROJECTEN: ProjectDef[] = [
  {
    naam: "Input van Els (blokkeert fase B/D/F)",
    omschrijving: `De 8 openstaande vragen uit de braindump-analyse (§6). ${SPEC}`,
    taken: [
      {
        titel: "8 vragen beantwoorden (braindump §6)",
        omschrijving:
          "Antwoorden nodig voordat fase B (Reality Check), D (ochtendmail) en F (academy) kunnen starten.",
        prioriteit: "hoog",
        toegewezenEmail: "info@aicompliancekit.eu",
        checklist: [
          "Nieuwe naam voor de AI Reality Check",
          "Vragen + 10 uitkomstteksten van de check",
          "Vaste bronnenlijst voor de ochtendmail",
          "ActiveCampaign: eerst koppelen of meteen migreren?",
          "Licentiemodel: voor wie (partners/multi-seat)?",
          "Betaalprovider: akkoord op Mollie?",
          "Tijd-KPI's: uren bijhouden of wekelijkse schatting?",
          "Toegang tot bestaande Tally/AC-flows (export 7 reeksen + tags)",
        ],
      },
    ],
  },
  {
    naam: "Fase A-rest — Content & formats",
    omschrijving: `W1/W5/W17: vaste formats, beeldbank-AI-tags, kennisbank-mappen. ${SPEC}`,
    taken: [
      {
        titel: "Leestafel + Mensentaal-formats + transcript→concept-flow",
        omschrijving:
          "W1: format-sjablonen in de kennisbank + 'Transcript → concept'-actie in de contentkalender; Els spreekt in, concept staat klaar.",
        prioriteit: "hoog",
      },
      {
        titel: "Beeldbank: AI-tagging bij upload",
        omschrijving:
          "W5: vision-model tagt kennisbank-beelden bij upload zodat zoeken op 'workshop', 'portret' enz. werkt.",
        prioriteit: "normaal",
      },
      {
        titel: "Testimonials-, bronnen- en brand-kit-mappen seeden",
        omschrijving:
          "W17: vaste mappenstructuur + conventie in de kennisbank zodat Dottie altijd uit de juiste bronnen put.",
        prioriteit: "normaal",
      },
    ],
  },
  {
    naam: "Fase B — Reality Check native",
    omschrijving: `W8/W9/W10: eigen check op de site, CRM-tags, rapport op naam, AC-sync. Wacht op input van Els. ${SPEC}`,
    taken: [
      {
        titel: "Vragenflow + scoringslogica (kwadrant × risico, 10 uitkomsten)",
        omschrijving:
          "W8: check als block/route in Payload; segmentatie aanbieder/gebruiker × zzp/mkb + risiconiveau.",
        prioriteit: "hoog",
      },
      {
        titel: "Automatische contact-creatie + CRM-tags vanuit de check",
        omschrijving:
          "W8: elke uitkomst zet doelgroep/risicoklasse/tags op het (nieuwe) contact — landt op de velden van CRM sprint 1.",
        prioriteit: "hoog",
      },
      {
        titel: "Gepersonaliseerd rapport op naam (rapport-motor)",
        omschrijving:
          "W9: HM-huisstijl-template + PDF; zelfde motor is herbruikbaar voor W12 (GPT-rapporten).",
        prioriteit: "hoog",
      },
      {
        titel: "ActiveCampaign-tag-sync (7 bestaande reeksen blijven lopen)",
        omschrijving:
          "W10 fase 1: check pusht tags via de AC-API; migreren kan later (fase H).",
        prioriteit: "normaal",
      },
    ],
  },
  {
    naam: "Fase C — Publiek + rapporten",
    omschrijving: `Publieke kennisbank + GPT-rapport-generator (W12). Deelt de rapport-motor met fase B. ${SPEC}`,
    taken: [
      {
        titel: "Publieke kennisbank-rendering (AI Act in Mensentaal op de site)",
        omschrijving:
          "zichtbaarheid=publiek bestaat al in het schema; rendering + navigatie op de site bouwen.",
        prioriteit: "normaal",
      },
      {
        titel: "GPT-rapport-generator in huisstijl + PDF-export",
        omschrijving:
          "W12: Els plakt GPT-output, motor zet het in de juiste rapportlayout, gekoppeld aan de organisatie in het CRM.",
        prioriteit: "normaal",
      },
    ],
  },
  {
    naam: "Fase D — Repurposing & ochtendmail",
    omschrijving: `W2/W7/W18: opnames hergebruiken + dagelijkse AI Act-nieuwsmail. Alleen de bronnenlijst wacht op Els. ${SPEC}`,
    taken: [
      {
        titel: "TLDV-koppeling: transcript + shownotes automatisch",
        omschrijving:
          "W7: opname → transcript (TLDV-API) → shownotes-document in de kennisbank + mail-concept naar aanwezigen.",
        prioriteit: "hoog",
      },
      {
        titel: "Repurposing-pipeline: opname → snippets/posts/blog/nieuwsbrief",
        omschrijving:
          "W2: Dottie genereert content-items in status idee/concept uit transcripten; videoknippen blijft extern (wij leveren tijdcodes + teksten).",
        prioriteit: "hoog",
      },
      {
        titel: "Dagelijkse ochtendmail: bronnen-scan + samenvatting",
        omschrijving:
          "W18: cron-agent scant vaste bronnen (regelgeving, handhaving, nieuws, papers) → mail in Els's format + archief in de kennisbank. Wacht op bronnenlijst.",
        prioriteit: "normaal",
      },
    ],
  },
  {
    naam: "Fase E — Masterclass-automatisering",
    omschrijving: `W19: van inschrijving tot opname-mail "volledig zonder dat ik het aanraak". Bouwt op fase D. ${SPEC}`,
    taken: [
      {
        titel: "Registratie + betaling → Meet-link + herinnerings-mails",
        omschrijving:
          "W19: registraties-collectie, eerste Mollie-betaalstap, automatische Meet-link en herinnerings-crons.",
        prioriteit: "normaal",
      },
      {
        titel: "Opname-mail + shownotes naar aanwezigen na afloop",
        omschrijving: "W19: TLDV-transcript → opname-mail met shownotes.",
        prioriteit: "normaal",
      },
    ],
  },
  {
    naam: "Fase F — Academy, betalingen & affiliates",
    omschrijving: `W20/W21/W22: eigen cursusplatform, Mollie, affiliates, licenties. Vervangt Huddle + Plug&Pay (±€2.000/jr besparing). ${SPEC}`,
    taken: [
      {
        titel: "Productenmodel + video-hosting (AICK Core, sector packs, AVG)",
        omschrijving:
          "W20: producten-collectie, video's (Bunny/Mux), documenten via publieke kennisbank.",
        prioriteit: "normaal",
      },
      {
        titel: "Mollie-betalingen → automatische account + toegang",
        omschrijving:
          "W20: wie op de salespagina betaalt krijgt automatisch login (de huidige kracht van Plug&Pay↔Huddle).",
        prioriteit: "normaal",
      },
      {
        titel: "Affiliates: persoonlijke links, kortingen, attributie, uitbetaling",
        omschrijving: "W21: dé reden voor de dure Plug&Pay-licentie.",
        prioriteit: "normaal",
      },
      {
        titel: "Licentiemodel-architectuur (toegang los van gebruiker)",
        omschrijving:
          "W22: vorm nog open (vraag 5 aan Els) — architectuur modelleert 'toegang' alvast los van 'gebruiker'.",
        prioriteit: "laag",
      },
    ],
  },
  {
    naam: "Fase G — KPI-dashboard Cijfers",
    omschrijving: `W23-W31: Cijfers-view met tegels per ritme (maand/kwartaal/jaar). v1 kan parallel starten. ${SPEC}`,
    taken: [
      {
        titel: "Cijfers-view v1: eigen data + handinvoer-tegels",
        omschrijving:
          "W23/W27/W30: pipeline/deals als omzetprognose, funnel-events, content-aantallen + wekelijkse handinvoer voor social/tijd.",
        prioriteit: "normaal",
      },
      {
        titel: "Cijfers v2: API-koppelingen (betalingen, mail-stats, analytics)",
        omschrijving:
          "W24-W29: Mollie/Plug&Pay, AC of eigen mail-stats, Plausible/PostHog. LinkedIn/Instagram-API's zijn beperkt — handinvoer daar.",
        prioriteit: "laag",
      },
    ],
  },
  {
    naam: "Fase H — Eigen mailmotor (optioneel)",
    omschrijving: `W10/W25 volledig in eigen beheer; daarna ActiveCampaign opzeggen. Pas als fase B stabiel draait. ${SPEC}`,
    taken: [
      {
        titel: "Reeks-editor + nieuwsbrief + eigen mail-stats (Resend)",
        omschrijving:
          "Automation-module met wachtrij/cron; transactionele flows blijven volautomatisch (kader).",
        prioriteit: "laag",
      },
    ],
  },
  {
    naam: "CRM-afronding (gap-index sprints 2-3)",
    omschrijving: `Rest van docs/superpowers/specs/2026-07-09-crm-gap-index.md na het MKB-plan van 2026-07-09.`,
    taken: [
      {
        titel: "CSV/Excel-import met kolom-mapping + dubbel-detectie/merge",
        omschrijving:
          "Gap-punten 3+11 — vóór de outreach-campagnes; datamodel (custom velden) is er klaar voor.",
        prioriteit: "hoog",
      },
      {
        titel: "Bulk-acties op de relatielijst",
        omschrijving:
          "Gap-punt 6: selectie → type/doelgroep/eigenaar wijzigen, taggen, verwijderen (multi-select-patroon uit de kennisbank).",
        prioriteit: "normaal",
      },
      {
        titel: "Opgeslagen lijsten/views (filtersets bewaren)",
        omschrijving:
          "Gap-punt 7: bv. 'Fotografen MKB — nog benaderen'; lost ook filteren op eigen velden op.",
        prioriteit: "normaal",
      },
      {
        titel: "Deals-lijstweergave + forecast naast het kanban",
        omschrijving: "Gap-punt 9: segmented control staat al in het ontwerp.",
        prioriteit: "normaal",
      },
      {
        titel: "LinkedIn DM quick-capture (W15 v1)",
        omschrijving:
          "Snel iemand + notitie + opvolgdatum vastleggen (ook via ⌘K); daarna Canbox opzeggen.",
        prioriteit: "normaal",
      },
    ],
  },
];

const payload = await getPayload({ config });

const dottie = (
  await payload.find({
    collection: "users",
    where: { email: { equals: "dottie@humanmargin.eu" } },
    limit: 1,
  })
).docs[0];
if (!dottie) {
  console.error("Dottie-user niet gevonden — draai eerst seed-agent-loop.ts");
  process.exit(1);
}

const fases = await payload.find({
  collection: "project-fases",
  where: { naam: { equals: "Gepland" } },
  limit: 1,
});
const gepland = fases.docs[0]?.id ?? null;

const statussen = await payload.find({
  collection: "task-statuses",
  where: { naam: { equals: "To-do" } },
  limit: 1,
});
const todo = statussen.docs[0]?.id ?? null;

let positie = 1000;
for (const def of PROJECTEN) {
  let project = (
    await payload.find({
      collection: "projects",
      where: { naam: { equals: def.naam } },
      limit: 1,
    })
  ).docs[0];

  if (!project) {
    project = await payload.create({
      collection: "projects",
      data: {
        naam: def.naam,
        status: "actief",
        fase: gepland,
        position: positie,
        omschrijving: def.omschrijving,
      },
      overrideAccess: false,
      user: dottie,
    });
    console.log(`✓ project '${def.naam}'`);
  } else {
    console.log(`= project '${def.naam}' bestaat al`);
  }
  positie += 1000;

  let taakPositie = 1000;
  for (const taak of def.taken) {
    const bestaand = await payload.find({
      collection: "tasks",
      where: {
        and: [
          { titel: { equals: taak.titel } },
          { project: { equals: project.id } },
        ],
      },
      limit: 1,
    });
    if (bestaand.docs[0]) {
      console.log(`  = taak '${taak.titel}' bestaat al`);
      taakPositie += 1000;
      continue;
    }
    let toegewezen: number | null = null;
    if (taak.toegewezenEmail) {
      const u = await payload.find({
        collection: "users",
        where: { email: { equals: taak.toegewezenEmail } },
        limit: 1,
      });
      toegewezen = u.docs[0]?.id ?? null;
    }
    await payload.create({
      collection: "tasks",
      data: {
        titel: taak.titel,
        omschrijving: taak.omschrijving,
        prioriteit: taak.prioriteit,
        status: todo,
        project: project.id,
        position: taakPositie,
        toegewezen,
        checklist: (taak.checklist ?? []).map((tekst) => ({
          tekst,
          klaar: false,
        })),
      },
      overrideAccess: false,
      user: dottie,
    });
    console.log(`  ✓ taak '${taak.titel}'`);
    taakPositie += 1000;
  }
}

console.log("✓ Routekaart staat op het bord");
process.exit(0);
