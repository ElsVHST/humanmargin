/**
 * Gedeelde helpers voor pagina-seeds: WP-URL → Payload media-id,
 * en het PageSeed-type dat elke pagina-module exporteert.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import type { Page } from "@/payload-types";

const mediaMap: Record<string, number> = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "docs/research/humanmargin.eu/media-map.json"),
    "utf8",
  ),
);

/** Vind media-id op WP-URL; probeert ook de originele (niet-geresizede) variant. */
export function media(url: string): number {
  if (mediaMap[url] !== undefined) return mediaMap[url];
  const original = url.replace(/-\d+x\d+(\.\w+)$/, "$1");
  if (mediaMap[original] !== undefined) return mediaMap[original];
  // scaled/e-varianten (WP voegt soms -scaled of -e<timestamp> toe)
  const base = url.replace(/-(scaled|e\d+)(\.\w+)$/, "$2");
  if (mediaMap[base] !== undefined) return mediaMap[base];
  throw new Error(`media niet gevonden in map: ${url}`);
}

export type PageSeed = {
  title: string;
  slug: string;
  layout: Page["layout"];
  meta?: { title?: string; description?: string };
};
