/**
 * Importeer de WordPress-mediabibliotheek in Payload.
 * Bron: .seed-assets/media/ (gedownload) + docs/research/humanmargin.eu/media-manifest.json
 * Output: docs/research/humanmargin.eu/media-map.json (WP-URL → Payload media-id)
 *
 * Draaien: npx payload run scripts/seed/seed-media.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

type ManifestItem = {
  wpId: number;
  slug: string;
  alt: string;
  mime: string;
  url: string;
  file: string;
  width?: number;
  height?: number;
};

const ROOT = process.cwd();
const manifest: ManifestItem[] = JSON.parse(
  readFileSync(path.join(ROOT, "docs/research/humanmargin.eu/media-manifest.json"), "utf8"),
);

const payload = await getPayload({ config });
const map: Record<string, number> = {};

let created = 0;
let skipped = 0;
for (const item of manifest) {
  const filePath = path.join(ROOT, ".seed-assets/media", item.file);
  if (!existsSync(filePath)) {
    console.warn(`ontbreekt: ${item.file}`);
    continue;
  }
  // idempotent: bestaat er al een media-doc met deze bestandsnaam?
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: item.file } },
    limit: 1,
  });
  if (existing.docs[0]) {
    map[item.url] = existing.docs[0].id;
    skipped++;
    continue;
  }
  const doc = await payload.create({
    collection: "media",
    data: { alt: item.alt || item.slug.replace(/-/g, " ") },
    filePath,
  });
  map[item.url] = doc.id;
  created++;
  if (created % 20 === 0) console.log(`  ${created} geüpload...`);
}

writeFileSync(
  path.join(ROOT, "docs/research/humanmargin.eu/media-map.json"),
  JSON.stringify(map, null, 2),
);
console.log(`klaar: ${created} nieuw, ${skipped} bestond al, map: ${Object.keys(map).length} entries`);
process.exit(0);
