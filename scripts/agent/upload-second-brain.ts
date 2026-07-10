/**
 * Second Brain — publicatie (T7, PRD §6.2 stap 3, beslissing B8).
 *
 * Zet `graphify-out/graph.json` + `graphify-out/rapport.md` (geschreven door
 * build_graph.py) als bestanden in de Platform-wiki-map: idempotent
 * find-or-create op vaste bestandsnamen, met een log-activity op de rootmap.
 *
 * Draaien: npx payload run scripts/agent/upload-second-brain.ts
 * (vereist dat export-second-brain-corpus.ts + build_graph.py al liepen.)
 */
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

type GraphNode = { community?: number | null };
type GraphJson = { nodes?: GraphNode[]; links?: unknown[] };

const GRAPHIFY_OUT = path.resolve(process.cwd(), "graphify-out");
const GRAPH_JSON_PAD = path.join(GRAPHIFY_OUT, "graph.json");
const RAPPORT_PAD = path.join(GRAPHIFY_OUT, "rapport.md");

if (!existsSync(GRAPH_JSON_PAD) || !existsSync(RAPPORT_PAD)) {
  console.error(
    "graphify-out/graph.json of graphify-out/rapport.md ontbreekt — draai eerst " +
      "scripts/agent/build_graph.py (of het volledige build-second-brain.sh).",
  );
  process.exit(1);
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

const rootmap = (
  await payload.find({
    collection: "knowledge-docs",
    where: {
      and: [{ titel: { equals: "Platform-wiki" } }, { soort: { equals: "map" } }],
    },
    limit: 1,
  })
).docs[0];
if (!rootmap) {
  console.error("Platform-wiki-rootmap niet gevonden — draai eerst seed-wiki.ts");
  process.exit(1);
}

/**
 * Payload's Local-API-upload leidt de opgeslagen bestandsnaam altijd af van
 * `path.basename(filePath)` (zie payload/dist/uploads/getFileByPath.js) — een
 * `data.filename` meegeven heeft geen effect. Daarom kopiëren we eerst naar
 * een bestand met exact de gewenste, vaste naam en uploaden we die kopie.
 */
const GRAPH_JSON_UPLOAD_PAD = path.join(GRAPHIFY_OUT, "second-brain-graph.json");
const RAPPORT_UPLOAD_PAD = path.join(GRAPHIFY_OUT, "second-brain-rapport.md");
copyFileSync(GRAPH_JSON_PAD, GRAPH_JSON_UPLOAD_PAD);
copyFileSync(RAPPORT_PAD, RAPPORT_UPLOAD_PAD);

/** Find-or-create/overwrite een knowledge-files-upload op een vaste bestandsnaam. */
async function zetBestand(
  filename: string,
  filePath: string,
): Promise<number> {
  const bestaand = (
    await payload.find({
      collection: "knowledge-files",
      where: { filename: { equals: filename } },
      limit: 1,
    })
  ).docs[0];
  if (bestaand) {
    const bijgewerkt = await payload.update({
      collection: "knowledge-files",
      id: bestaand.id,
      data: {},
      filePath,
      overwriteExistingFiles: true,
    });
    console.log(`↷ bestand '${filename}' vervangen (id ${bijgewerkt.id})`);
    return bijgewerkt.id;
  }
  const aangemaakt = await payload.create({
    collection: "knowledge-files",
    data: {},
    filePath,
    overwriteExistingFiles: true,
  });
  console.log(`✓ bestand '${filename}' aangemaakt (id ${aangemaakt.id})`);
  return aangemaakt.id;
}

/** Find-or-create een kennisdocument van soort 'bestand' onder de rootmap. */
async function zetKennisdoc(titel: string, bestandId: number): Promise<void> {
  const data = {
    titel,
    soort: "bestand" as const,
    bestand: bestandId,
    parent: rootmap.id,
    zichtbaarheid: "intern" as const,
    tags: ["wiki", "second-brain"],
  };
  const bestaand = (
    await payload.find({
      collection: "knowledge-docs",
      where: { titel: { equals: titel } },
      limit: 1,
    })
  ).docs[0];
  if (bestaand) {
    await payload.update({
      collection: "knowledge-docs",
      id: bestaand.id,
      data,
      overrideAccess: false,
      user: dottie,
    });
    console.log(`↷ kennisdocument '${titel}' bijgewerkt`);
  } else {
    await payload.create({
      collection: "knowledge-docs",
      data,
      overrideAccess: false,
      user: dottie,
    });
    console.log(`✓ kennisdocument '${titel}' aangemaakt`);
  }
}

const graphFileId = await zetBestand(
  "second-brain-graph.json",
  GRAPH_JSON_UPLOAD_PAD,
);
const rapportFileId = await zetBestand(
  "second-brain-rapport.md",
  RAPPORT_UPLOAD_PAD,
);

await zetKennisdoc("Second Brain — graph.json", graphFileId);
await zetKennisdoc("Second Brain — rapport", rapportFileId);

// Totalen voor de log-activity uit graph.json zelf halen (niet uit rapport.md
// parsen — het JSON is de bron van waarheid voor nodes/links/clusters).
const graphJson: GraphJson = JSON.parse(readFileSync(GRAPH_JSON_PAD, "utf8"));
const nodeCount = graphJson.nodes?.length ?? 0;
const edgeCount = graphJson.links?.length ?? 0;
const clusterCount = new Set(
  (graphJson.nodes ?? [])
    .map((node) => node.community)
    .filter((community): community is number => community != null),
).size;

await payload.create({
  collection: "activities",
  data: {
    type: "log",
    samenvatting: `[ingest] Second Brain herbouwd: ${nodeCount} nodes, ${edgeCount} edges, ${clusterCount} clusters`,
    targets: [{ relationTo: "knowledge-docs", value: rootmap.id }],
    happensAt: new Date().toISOString(),
  },
  overrideAccess: false,
  user: dottie,
});

console.log(
  `✓ Second Brain gepubliceerd: ${nodeCount} nodes, ${edgeCount} edges, ${clusterCount} clusters`,
);
process.exit(0);
