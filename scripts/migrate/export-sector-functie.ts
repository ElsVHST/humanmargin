/**
 * Migratie sectoren/functies — stap 1: exporteer de huidige vrije-tekstwaarden
 * VOORDAT het schema wijzigt (sector/functie worden relaties).
 * Draaien: npx payload run scripts/migrate/export-sector-functie.ts
 * Schrijft: scripts/migrate/sector-functie-data.json (gitignored)
 */
import fs from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

const payload = await getPayload({ config });

const orgs = await payload.find({
  collection: "organisations",
  limit: 1000,
  depth: 0,
});
const contacts = await payload.find({
  collection: "contacts",
  limit: 1000,
  depth: 0,
});

const data = {
  organisaties: orgs.docs
    .map((o) => ({ id: o.id, sector: (o as { sector?: unknown }).sector }))
    .filter((o) => typeof o.sector === "string" && o.sector),
  contacten: contacts.docs
    .map((c) => ({ id: c.id, functie: (c as { functie?: unknown }).functie }))
    .filter((c) => typeof c.functie === "string" && c.functie),
};

const doel = path.resolve("scripts/migrate/sector-functie-data.json");
fs.writeFileSync(doel, JSON.stringify(data, null, 2));
console.log(
  `✓ Geëxporteerd: ${data.organisaties.length} organisatie-sectoren, ${data.contacten.length} contact-functies → ${doel}`,
);
process.exit(0);
