/**
 * Zet de volledige Platform-wiki (rootmap + 6 submappen + de pagina's uit de
 * drie content-packs) als knowledge-docs in de database, met opgeloste
 * [[wikilinks]], als Dottie-user, gevolgd door één log-activity op de
 * wiki-root (PRD §3, fase 1.3/1.5).
 *
 * Idempotent: pass 1 (records) find-or-create't op titel+parent, pass 2
 * (inhoud) ververst bij élke run — een tweede run levert alleen ↷-regels en
 * een verse pass-2 op (geen duplicaten).
 *
 * Draaien: npx payload run scripts/seed/seed-wiki.ts
 * (niet door de bouw-agent zelf — dat gebeurt in de integratiefase)
 */
import { getPayload } from "payload";

import config from "@payload-config";
import {
  markdownNaarLexical,
  vindWikilinkTitels,
} from "@/modules/knowledge/wiki/wikiMarkdown";
import type { KnowledgeDoc } from "@/payload-types";

import { PAGINAS as KERN_WERKBLADEN } from "./wiki-content/kern-werkbladen";
import type { WikiPagina } from "./wiki-content/kern-werkbladen";
import { PAGINAS as MODULES_API } from "./wiki-content/modules-api";
import { PAGINAS as ROADMAP_AGENTS } from "./wiki-content/roadmap-agents";

const ROOTMAP_TITEL = "Platform-wiki";

/** Canonieke submappen, exact in deze volgorde (CONTEXT.md — canonieke wiki-structuur). */
const CANONIEKE_SUBMAPPEN: string[] = [
  "Werkbladen",
  "Modules & data",
  "Automatiseringen",
  "API & integraties",
  "Roadmap & wensen",
  "Agents",
];

/**
 * Canonieke paginatitels per map — uitsluitend voor de dekkingscheck aan het
 * eind (acceptatie-eis "alle canonieke titels gedekt"). Overgetypt uit
 * CONTEXT.md; kwam neer op 36 pagina's + 6 mappen. Het T5-taakblad noemt
 * "37 pagina's", maar de brontabel in CONTEXT.md (en de drie content-packs
 * die er exact op aansluiten) telden op tot 36 — deze check volgt de
 * brontabel, niet het losse getal in de taaktekst. Sinds 2026-07-13 is
 * "Hostinger VPS (Hermes-host)" (map Agents) toegevoegd → 37 pagina's.
 */
const CANONIEKE_TITELS: Record<string, string[]> = {
  "(root)": [
    "_Schema — zo werkt deze wiki",
    "Index",
    "Overzicht — het Human Margin-platform",
    "Second Brain",
  ],
  Werkbladen: [
    "Werkblad Home",
    "Werkblad Pipeline",
    "Werkblad Relaties",
    "Werkblad Projecten",
    "Werkblad Taken",
    "Werkblad Kalender",
    "Werkblad Kennisbank",
  ],
  "Modules & data": [
    "CRM — organisaties, contacten en deals",
    "Projecten & taken",
    "Content & kalender",
    "Kennisbank & bestanden",
    "Tijdlijn & activities",
    "Gebruikers, rollen & voorkeuren",
    "Site & CMS",
  ],
  Automatiseringen: [
    "Hooks & automatische acties",
    "In-the-loop OS (agent-queue)",
  ],
  "API & integraties": ["REST & Local API — recepten", "Integratie-landschap"],
  "Roadmap & wensen": [
    "Strategie — de Human Margin Method",
    "Wensenkaart W1–W31",
    "Fase A — content & formats",
    "Fase B — Reality Check native",
    "Fase C — publiek & rapporten",
    "Fase D — repurposing & ochtendmail",
    "Fase E — masterclass-automatisering",
    "Fase F — academy, betalingen & affiliates",
    "Fase G — KPI-dashboard Cijfers",
    "Fase H — eigen mailmotor",
    "CRM-afronding (gap-index)",
    "Kaders — wat nooit automatisch mag",
  ],
  Agents: [
    "Hermes Agent",
    "Dottie (sessie-agent)",
    "Hostinger VPS (Hermes-host)",
  ],
};

const PAGINAS: WikiPagina[] = [
  ...KERN_WERKBLADEN,
  ...MODULES_API,
  ...ROADMAP_AGENTS,
];

// --- Validatie (stap 1: mapnamen + dubbele titels) ---------------------
for (const pagina of PAGINAS) {
  if (pagina.map !== null && !CANONIEKE_SUBMAPPEN.includes(pagina.map)) {
    console.error(
      `Onbekende map '${pagina.map}' bij pagina '${pagina.titel}' — geen canonieke submap.`,
    );
    process.exit(1);
  }
}
const titelsGezien = new Set<string>();
for (const pagina of PAGINAS) {
  if (titelsGezien.has(pagina.titel)) {
    console.error(`Dubbele paginatitel gevonden: '${pagina.titel}'.`);
    process.exit(1);
  }
  titelsGezien.add(pagina.titel);
}

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

// --- Stap 2: rootmap "Platform-wiki" ------------------------------------
let rootmap = (
  await payload.find({
    collection: "knowledge-docs",
    where: {
      and: [
        { titel: { equals: ROOTMAP_TITEL } },
        { parent: { exists: false } },
      ],
    },
    limit: 1,
  })
).docs[0];

if (!rootmap) {
  rootmap = await payload.create({
    collection: "knowledge-docs",
    data: {
      titel: ROOTMAP_TITEL,
      soort: "map",
      zichtbaarheid: "intern",
      tags: ["wiki"],
      position: 1000,
    },
    overrideAccess: false,
    user: dottie,
  });
  console.log(`✓ rootmap '${ROOTMAP_TITEL}' aangemaakt`);
} else {
  console.log(`↷ rootmap '${ROOTMAP_TITEL}' bestaat al`);
}

// --- Stap 3: zes submappen onder de root --------------------------------
const submapIdByNaam = new Map<string, number>();
let submapPositie = 1000;
for (const naam of CANONIEKE_SUBMAPPEN) {
  let submap = (
    await payload.find({
      collection: "knowledge-docs",
      where: {
        and: [{ titel: { equals: naam } }, { parent: { equals: rootmap.id } }],
      },
      limit: 1,
    })
  ).docs[0];

  if (!submap) {
    submap = await payload.create({
      collection: "knowledge-docs",
      data: {
        titel: naam,
        soort: "map",
        zichtbaarheid: "intern",
        tags: ["wiki"],
        parent: rootmap.id,
        position: submapPositie,
      },
      overrideAccess: false,
      user: dottie,
    });
    console.log(`✓ map '${naam}' aangemaakt`);
  } else {
    console.log(`↷ map '${naam}' bestaat al`);
  }
  submapIdByNaam.set(naam, submap.id);
  submapPositie += 1000;
}

// --- Pass 1: records (find-or-create per pagina, inhoud nog leeg) -------
const titelNaarId = new Map<string, number>();
let paginasNieuw = 0;
let paginasBestaand = 0;

for (const [index, pagina] of PAGINAS.entries()) {
  const parentId =
    pagina.map === null ? rootmap.id : submapIdByNaam.get(pagina.map);
  if (parentId == null) {
    // Kan na de validatie hierboven niet gebeuren; TS wil het zeker weten.
    console.error(
      `Geen map-id gevonden voor pagina '${pagina.titel}' (map '${pagina.map}').`,
    );
    process.exit(1);
  }

  let doc = (
    await payload.find({
      collection: "knowledge-docs",
      where: {
        and: [
          { titel: { equals: pagina.titel } },
          { parent: { equals: parentId } },
        ],
      },
      limit: 1,
    })
  ).docs[0];

  if (!doc) {
    doc = await payload.create({
      collection: "knowledge-docs",
      data: {
        titel: pagina.titel,
        soort: "document",
        zichtbaarheid: "intern",
        parent: parentId,
        tags: pagina.tags,
        position: (index + 1) * 1000,
      },
      overrideAccess: false,
      user: dottie,
    });
    paginasNieuw += 1;
    console.log(`✓ pagina '${pagina.titel}' aangemaakt`);
  } else {
    paginasBestaand += 1;
    console.log(`↷ pagina '${pagina.titel}' bestaat al`);
  }

  titelNaarId.set(pagina.titel, doc.id);
}

// --- Pass 2: inhoud (altijd bijwerken, ook bij bestaande docs) ----------
let onopgelosteLinksTotaal = 0;
for (const pagina of PAGINAS) {
  const docId = titelNaarId.get(pagina.titel);
  if (docId == null) {
    console.error(
      `Geen doc-id voor pagina '${pagina.titel}' — pass 1 is niet goed gelopen.`,
    );
    process.exit(1);
  }

  const linksInMarkdown = vindWikilinkTitels(pagina.markdown);
  const onopgelost = linksInMarkdown.filter((titel) => !titelNaarId.has(titel));
  if (onopgelost.length > 0) {
    onopgelosteLinksTotaal += onopgelost.length;
    console.log(
      `⚠ pagina '${pagina.titel}': ${onopgelost.length} onopgeloste link(en) — ${onopgelost
        .map((titel) => `[[${titel}]]`)
        .join(", ")}`,
    );
  }

  const lexical = await markdownNaarLexical(pagina.markdown, (titel) =>
    titelNaarId.get(titel) ?? null,
  );
  await payload.update({
    collection: "knowledge-docs",
    id: docId,
    data: { inhoud: lexical as unknown as KnowledgeDoc["inhoud"] },
    overrideAccess: false,
    user: dottie,
  });
  console.log(`✓ inhoud gezet: '${pagina.titel}'`);
}

// --- Log-activity op de wiki-root ---------------------------------------
const totaalMappen = 1 + CANONIEKE_SUBMAPPEN.length;
await payload.create({
  collection: "activities",
  data: {
    type: "log",
    samenvatting: `[ingest] Platform-wiki geseed: ${PAGINAS.length} pagina's, ${totaalMappen} mappen (${onopgelosteLinksTotaal} onopgeloste links)`,
    targets: [{ relationTo: "knowledge-docs", value: rootmap.id }],
    happensAt: new Date().toISOString(),
  },
  overrideAccess: false,
  user: dottie,
});
console.log("✓ log-activity geschreven op de wiki-root");

// --- Dekkingscheck (acceptatie-eis: alle canonieke titels gedekt) -------
const canoniekeTitelsAlle = Object.values(CANONIEKE_TITELS).flat();
const ontbrekend = canoniekeTitelsAlle.filter((titel) => !titelNaarId.has(titel));
const onverwacht = PAGINAS.map((pagina) => pagina.titel).filter(
  (titel) => !canoniekeTitelsAlle.includes(titel),
);
if (ontbrekend.length > 0) {
  console.warn(`⚠ ontbrekende canonieke pagina('s): ${ontbrekend.join(", ")}`);
}
if (onverwacht.length > 0) {
  console.warn(
    `⚠ pagina('s) buiten de canonieke structuur: ${onverwacht.join(", ")}`,
  );
}
if (PAGINAS.length !== canoniekeTitelsAlle.length) {
  console.warn(
    `⚠ aantal pagina's (${PAGINAS.length}) wijkt af van de canonieke telling (${canoniekeTitelsAlle.length}).`,
  );
}

console.log(
  `\n✓ Platform-wiki geseed — ${paginasNieuw} nieuwe pagina's, ${paginasBestaand} bestaande, ${totaalMappen} mappen, ${onopgelosteLinksTotaal} onopgeloste link(en).`,
);
process.exit(0);
