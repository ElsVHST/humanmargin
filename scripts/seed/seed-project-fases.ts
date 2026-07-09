/**
 * Seed default projectfases (idempotent): Gepland → Lopend → Review → Afgerond.
 * Draaien: npx payload run scripts/seed/seed-project-fases.ts
 */
import { getPayload } from "payload";

import config from "@payload-config";

const FASES: { naam: string; kleur: "blauw" | "geel" | "paars" | "groen" }[] = [
  { naam: "Gepland", kleur: "blauw" },
  { naam: "Lopend", kleur: "geel" },
  { naam: "Review", kleur: "paars" },
  { naam: "Afgerond", kleur: "groen" },
];

const payload = await getPayload({ config });
for (const fase of FASES) {
  const bestaand = await payload.find({
    collection: "project-fases",
    where: { naam: { equals: fase.naam } },
    limit: 1,
  });
  if (bestaand.docs[0]) {
    console.log(`= ${fase.naam} bestaat al`);
    continue;
  }
  await payload.create({ collection: "project-fases", data: fase });
  console.log(`✓ ${fase.naam} aangemaakt`);
}
process.exit(0);
