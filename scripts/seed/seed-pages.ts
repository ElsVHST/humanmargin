/**
 * Seed alle pagina's uit scripts/seed/pages/*.ts (elk exporteert een PageSeed).
 * Idempotent: bestaande slug wordt geüpdatet.
 *
 * Draaien: npx payload run scripts/seed/seed-pages.ts            → alle pagina's
 *          PAGES=team-op-maat,contact npx payload run ...        → subset
 */
import { readdirSync } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

import type { PageSeed } from "./media-map";

const payload = await getPayload({ config });

const pagesDir = path.join(process.cwd(), "scripts/seed/pages");
const only = process.env.PAGES?.split(",").map((s) => s.trim());

const files = readdirSync(pagesDir)
  .filter((f) => f.endsWith(".ts"))
  .filter((f) => !only || only.includes(f.replace(/\.ts$/, "")));

let ok = 0;
let failed = 0;
for (const file of files.sort()) {
  try {
    const mod = (await import(path.join(pagesDir, file))) as { default: PageSeed };
    const seed = mod.default;
    const data = {
      title: seed.title,
      slug: seed.slug,
      layout: seed.layout,
      meta: seed.meta,
      _status: "published" as const,
    };
    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: seed.slug } },
      limit: 1,
    });
    if (existing.docs[0]) {
      await payload.update({
        collection: "pages",
        id: existing.docs[0].id,
        data,
        context: { skipRevalidate: true },
      });
      console.log(`upd  ${seed.slug}`);
    } else {
      await payload.create({ collection: "pages", data, context: { skipRevalidate: true } });
      console.log(`new  ${seed.slug}`);
    }
    ok++;
  } catch (err) {
    failed++;
    console.error(`FAIL ${file}: ${err instanceof Error ? err.message.slice(0, 200) : err}`);
  }
}
console.log(`klaar: ${ok} ok, ${failed} fouten`);
process.exit(failed > 0 ? 1 : 0);
