/**
 * Second Brain — corpus-export (T7, PRD §6.2 stap 1, beslissing B8).
 *
 * Exporteert alle niet-getrashte kennisdocumenten (kennisbank + Platform-wiki
 * leven in dezelfde collectie `knowledge-docs`) als markdown naar
 * `graphify-corpus/`, zodat graphify er een structurele graph van kan bouwen.
 *
 * - De mappenboom volgt de `parent`-relatie; padnaam per map = slugify(titel).
 * - Documenten (`soort: "document"`) worden `<id>--<slug>.md` met
 *   YAML-frontmatter + de Lexical-inhoud omgezet naar markdown.
 * - Interne links (`/admin/kennisbank?doc=<id>`) worden herschreven naar
 *   relatieve md-links naar het corpusbestand van het doeldocument, zodat
 *   graphify's markdown-extractor ze als `references`-edge oppikt.
 * - Bestanden (`soort: "bestand"`) krijgen een korte stub met metadata.
 *
 * Draaien: npx payload run scripts/agent/export-second-brain-corpus.ts
 * (raakt de database niet aan — alleen lezen; schrijft alleen naar schijf.)
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

import { lexicalNaarMarkdown } from "@/modules/knowledge/wiki/wikiMarkdown";
import type { KnowledgeDoc, KnowledgeFile } from "@/payload-types";

const CORPUS_ROOT = path.resolve(process.cwd(), "graphify-corpus");

/** Zelfde slug-conventie als de wiki: lowercase, spaties/rest → koppelteken. */
function slugify(titel: string): string {
  const geslugd = titel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diakrieten weg (na NFD-normalisatie)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return geslugd || "zonder-titel";
}

/** Haalt een relatie-veld (kan id of gepopuleerd object zijn) terug naar een id. */
function relId(
  waarde: number | KnowledgeDoc | KnowledgeFile | null | undefined,
): number | null {
  if (waarde == null) return null;
  return typeof waarde === "object" ? waarde.id : waarde;
}

/** Eén regel YAML-waarde, veilig gequote (voorkomt breuk op ':' of '"'). */
function yamlString(waarde: string): string {
  return `"${waarde.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlFrontmatter(doc: {
  titel: string;
  tags: string[];
  zichtbaarheid: string;
  soort: string;
}): string {
  const regels = [
    "---",
    `titel: ${yamlString(doc.titel)}`,
    doc.tags.length > 0
      ? `tags: [${doc.tags.map(yamlString).join(", ")}]`
      : "tags: []",
    `zichtbaarheid: ${doc.zichtbaarheid}`,
    `soort: ${doc.soort}`,
    "---",
    "",
  ];
  return regels.join("\n");
}

/** Pad (mapsegmenten, root eerst) van álle voorouders van doc, via parent-keten. */
function voorouderPad(
  doc: KnowledgeDoc,
  byId: Map<number, KnowledgeDoc>,
): string[] {
  const segmenten: string[] = [];
  const gezien = new Set<number>();
  let huidigeId = relId(doc.parent);
  while (huidigeId != null) {
    if (gezien.has(huidigeId)) break; // cyclus-vangrail
    gezien.add(huidigeId);
    const ouder = byId.get(huidigeId);
    if (!ouder) break;
    segmenten.push(slugify(ouder.titel));
    huidigeId = relId(ouder.parent);
  }
  return segmenten.reverse();
}

/** Interne kennisbank-links (`/admin/kennisbank?doc=<id>`) → relatieve md-link
 * naar het corpusbestand van het doeldocument. Onvindbaar → label als platte
 * tekst (link vervalt). Telt het aantal onopgeloste links. */
function herschrijfInterneLinks(
  markdown: string,
  huidigRelPad: string,
  padPerId: Map<number, string>,
): { tekst: string; onopgelost: number } {
  let onopgelost = 0;
  const tekst = markdown.replace(
    /\[([^\]]*)\]\(([^)]+)\)/g,
    (heleMatch, label: string, url: string) => {
      const doelMatch = /\/admin\/kennisbank\?doc=(\d+)/.exec(url);
      if (!doelMatch) return heleMatch;
      const doelId = Number(doelMatch[1]);
      const doelPad = padPerId.get(doelId);
      if (!doelPad) {
        onopgelost += 1;
        return label;
      }
      const relatief = path
        .relative(path.dirname(huidigRelPad), doelPad)
        .split(path.sep)
        .join("/");
      return `[${label}](${relatief})`;
    },
  );
  return { tekst, onopgelost };
}

const payload = await getPayload({ config });

// Alle niet-getrashte kennisdocumenten (kennisbank + Platform-wiki delen deze
// collectie — depth: 0 zodat parent/bestand als kale id's terugkomen).
const alle = await payload.find({
  collection: "knowledge-docs",
  limit: 0,
  depth: 0,
});
const docs = alle.docs;
const byId = new Map<number, KnowledgeDoc>(docs.map((d) => [d.id, d]));

// Bestandsmetadata (filename/mimeType) voor soort=bestand — apart opgehaald
// zodat we depth:0 kunnen houden op de hoofdquery.
const bestandIds = [
  ...new Set(
    docs
      .filter((d) => d.soort === "bestand")
      .map((d) => relId(d.bestand))
      .filter((id): id is number => id != null),
  ),
];
const bestandInfo = new Map<number, { filename: string; mimeType: string }>();
if (bestandIds.length > 0) {
  const bestanden = await payload.find({
    collection: "knowledge-files",
    where: { id: { in: bestandIds } },
    limit: 0,
    depth: 0,
  });
  for (const f of bestanden.docs) {
    bestandInfo.set(f.id, {
      filename: f.filename ?? "onbekend",
      mimeType: f.mimeType ?? "onbekend",
    });
  }
}

// Corpus-map leegmaken (ALLEEN deze map) zodat verwijderde docs verdwijnen.
rmSync(CORPUS_ROOT, { recursive: true, force: true });
mkdirSync(CORPUS_ROOT, { recursive: true });

// Pass 1 — padnaam per exporteerbaar document bepalen (document + bestand;
// "map"-docs krijgen geen eigen bestand, alleen een padsegment voor kinderen).
const padPerId = new Map<number, string>();
for (const doc of docs) {
  if (doc.soort !== "document" && doc.soort !== "bestand") continue;
  const mapSegmenten = voorouderPad(doc, byId);
  const bestandsnaam = `${doc.id}--${slugify(doc.titel)}.md`;
  padPerId.set(doc.id, path.posix.join(...mapSegmenten, bestandsnaam));
}

// Pass 2 — schrijven (document: lexical→markdown + link-herschrijving;
// bestand: korte stub met metadata).
const aantalPerMap = new Map<string, number>();
let onopgelosteLinksTotaal = 0;

for (const doc of docs) {
  const relPad = padPerId.get(doc.id);
  if (!relPad) continue; // "map" of onbekend soort — geen bestand

  const frontmatter = yamlFrontmatter({
    titel: doc.titel,
    tags: doc.tags ?? [],
    zichtbaarheid: doc.zichtbaarheid,
    soort: doc.soort,
  });

  let inhoud: string;
  if (doc.soort === "document") {
    // resolveId geeft hier bewust null terug: we willen échte relatieve
    // md-links, geen [[titel]]-syntax (die maakt graphify's extractor niet
    // van betekenis zonder onze eigen link-herschrijving hieronder).
    const ruweMarkdown = await lexicalNaarMarkdown(doc.inhoud, () => null);
    const { tekst, onopgelost } = herschrijfInterneLinks(
      ruweMarkdown,
      relPad,
      padPerId,
    );
    onopgelosteLinksTotaal += onopgelost;
    inhoud = tekst;
  } else {
    const info = relId(doc.bestand) != null
      ? bestandInfo.get(relId(doc.bestand)!)
      : undefined;
    inhoud = `Bestand: ${info?.filename ?? "onbekend"} (${info?.mimeType ?? "onbekend"})\n`;
  }

  const volledigPad = path.join(CORPUS_ROOT, relPad);
  mkdirSync(path.dirname(volledigPad), { recursive: true });
  writeFileSync(volledigPad, frontmatter + "\n" + inhoud, "utf8");

  const mapNaam = path.dirname(relPad);
  aantalPerMap.set(mapNaam, (aantalPerMap.get(mapNaam) ?? 0) + 1);
}

console.log("Second Brain-corpus geschreven naar graphify-corpus/:");
for (const [map, aantal] of [...aantalPerMap.entries()].sort()) {
  console.log(`  ${map === "." ? "(root)" : map}: ${aantal} bestand(en)`);
}
console.log(
  `Totaal: ${padPerId.size} bestand(en), ${onopgelosteLinksTotaal} onopgeloste interne link(s) (label behouden, link vervallen).`,
);
process.exit(0);
