#!/usr/bin/env node
/**
 * Download alle assets van humanmargin.eu:
 *  - WP-mediabibliotheek (127 items) → .seed-assets/media/ + manifest (voor Payload-seed)
 *  - Custom fonts (Atomic Marker, Feisty) → src/fonts/
 *  - Favicons/logo → public/seo/
 */
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const BASE = "https://humanmargin.eu";
const MEDIA_DIR = ".seed-assets/media";
const FONT_DIR = "src/fonts";
const SEO_DIR = "public/seo";

for (const d of [MEDIA_DIR, FONT_DIR, SEO_DIR, "docs/research/humanmargin.eu"]) {
  mkdirSync(d, { recursive: true });
}

async function download(url, dest) {
  if (existsSync(dest)) return "skip";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  mkdirSync(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return "ok";
}

async function pool(items, worker, size = 4) {
  const queue = [...items];
  const results = [];
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) {
        const item = queue.shift();
        try {
          results.push(await worker(item));
        } catch (err) {
          console.error(`FAIL ${err.message}`);
        }
      }
    }),
  );
  return results;
}

// 1. Mediabibliotheek + manifest
const media = [];
for (let page = 1; page <= 10; page++) {
  const res = await fetch(`${BASE}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=id,slug,alt_text,caption,source_url,mime_type,media_details`);
  if (!res.ok) break;
  const batch = await res.json();
  media.push(...batch);
  if (batch.length < 100) break;
}
console.log(`media items: ${media.length}`);

const manifest = media.map((m) => ({
  wpId: m.id,
  slug: m.slug,
  alt: m.alt_text || "",
  mime: m.mime_type,
  url: m.source_url,
  file: m.source_url.split("/wp-content/uploads/")[1]?.replace(/\//g, "_") ?? `${m.id}`,
  width: m.media_details?.width,
  height: m.media_details?.height,
}));
writeFileSync("docs/research/humanmargin.eu/media-manifest.json", JSON.stringify(manifest, null, 2));

await pool(manifest, async (m) => {
  const r = await download(m.url, join(MEDIA_DIR, m.file));
  if (r === "ok") console.log(`ok  ${m.file}`);
});

// 2. Custom fonts
const fonts = [
  `${BASE}/wp-content/uploads/2026/06/atomic-marker-regular.woff2`,
  `${BASE}/wp-content/uploads/2026/06/feisty.woff2`,
];
for (const f of fonts) {
  await download(f, join(FONT_DIR, f.split("/").pop()));
  console.log(`font ${f.split("/").pop()}`);
}

// 3. Favicons + logo's
const seo = [
  `${BASE}/wp-content/uploads/2026/06/human-margin-favicon-full-color-rgb-900px-w-72ppi-150x150.png`,
  `${BASE}/wp-content/uploads/2026/06/human-margin-favicon-full-color-rgb-900px-w-72ppi-300x300.png`,
  `${BASE}/wp-content/uploads/2026/06/human-margin-logo-inverted-rgb-900px-w-72ppi.png`,
];
for (const f of seo) {
  await download(f, join(SEO_DIR, f.split("/").pop()));
  console.log(`seo ${f.split("/").pop()}`);
}

console.log("done");
