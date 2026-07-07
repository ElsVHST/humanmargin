#!/usr/bin/env node
/**
 * Maak side-by-side composieten (origineel | clone) per pagina + ruwe pixeldiff-score.
 * Vereist: originelen in docs/design-references/humanmargin.eu/, clone-captures in qa/clone/.
 *
 * Usage: node scripts/qa-diff.mjs [--only slug1,slug2] [--viewport desktop-1440|mobile-390]
 */
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ORIG = "docs/design-references/humanmargin.eu";
const CLONE = "qa/clone";
const OUT = "qa/diff";
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const getArg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const VIEWPORT = getArg("--viewport", "desktop-1440");
const ONLY = getArg("--only", null)?.split(",");
const WIDTH = 720;

const slugs = readdirSync(CLONE)
  .filter((f) => f.endsWith(`-${VIEWPORT}.png`))
  .map((f) => f.replace(`-${VIEWPORT}.png`, ""))
  .filter((s) => !ONLY || ONLY.includes(s));

const results = [];
for (const slug of slugs.sort()) {
  const origPath = path.join(ORIG, `${slug}-${VIEWPORT}.png`);
  const clonePath = path.join(CLONE, `${slug}-${VIEWPORT}.png`);
  if (!existsSync(origPath)) { console.warn(`geen origineel: ${slug}`); continue; }

  const [orig, clone] = await Promise.all([
    sharp(origPath).resize({ width: WIDTH }).png().toBuffer({ resolveWithObject: true }),
    sharp(clonePath).resize({ width: WIDTH }).png().toBuffer({ resolveWithObject: true }),
  ]);

  const height = Math.max(orig.info.height, clone.info.height);
  const canvas = (buf) =>
    sharp(buf).extend({ bottom: 0, background: "#ff00ff" }).resize({ width: WIDTH, height, fit: "contain", position: "top", background: "#ff00ff" }).removeAlpha().raw().toBuffer();

  const [a, b] = await Promise.all([canvas(orig.data), canvas(clone.data)]);
  let diff = 0;
  const total = WIDTH * height;
  for (let i = 0; i < a.length; i += 3) {
    const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    if (d > 90) diff++;
  }
  const pct = ((diff / total) * 100).toFixed(1);

  await sharp({
    create: { width: WIDTH * 2 + 12, height, channels: 3, background: "#222222" },
  })
    .composite([
      { input: await sharp(orig.data).resize({ width: WIDTH }).png().toBuffer(), left: 0, top: 0 },
      { input: await sharp(clone.data).resize({ width: WIDTH }).png().toBuffer(), left: WIDTH + 12, top: 0 },
    ])
    .png()
    .toFile(path.join(OUT, `${slug}-${VIEWPORT}.png`));

  results.push({ slug, pct: Number(pct), hOrig: orig.info.height, hClone: clone.info.height });
  console.log(`${slug.padEnd(32)} diff=${pct}%  h: ${orig.info.height} vs ${clone.info.height}`);
}

results.sort((x, y) => y.pct - x.pct);
console.log("\nslechtste eerst:", results.slice(0, 8).map((r) => `${r.slug}(${r.pct}%)`).join(", "));
