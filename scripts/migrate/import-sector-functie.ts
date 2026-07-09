/**
 * Migratie sectoren/functies — stap 2: maak lookup-docs van de geëxporteerde
 * waarden en koppel ze terug (NA de schemawijziging draaien).
 * Draaien: npx payload run scripts/migrate/import-sector-functie.ts
 */
import fs from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";

const bron = path.resolve("scripts/migrate/sector-functie-data.json");
if (!fs.existsSync(bron)) {
  console.error(`Geen exportbestand op ${bron} — draai eerst export-sector-functie.ts`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(bron, "utf8")) as {
  organisaties: { id: number; sector: string }[];
  contacten: { id: number; functie: string }[];
};

const payload = await getPayload({ config });

async function zoekOfMaak(collection: "sectoren" | "functies", naam: string) {
  const bestaand = await payload.find({
    collection,
    where: { naam: { equals: naam } },
    limit: 1,
  });
  if (bestaand.docs[0]) return bestaand.docs[0].id;
  const doc = await payload.create({
    collection,
    data: { naam, kleur: "grijs" },
  });
  return doc.id;
}

for (const { id, sector } of data.organisaties) {
  const sectorId = await zoekOfMaak("sectoren", sector);
  await payload.update({ collection: "organisations", id, data: { sector: sectorId } });
  console.log(`✓ organisatie ${id} → sector '${sector}' (${sectorId})`);
}
for (const { id, functie } of data.contacten) {
  const functieId = await zoekOfMaak("functies", functie);
  await payload.update({ collection: "contacts", id, data: { functie: functieId } });
  console.log(`✓ contact ${id} → functie '${functie}' (${functieId})`);
}
console.log("✓ Migratie compleet");
process.exit(0);
