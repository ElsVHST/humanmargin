/**
 * Seed de NL-standaardkolommen (spec §9). Idempotent: een collectie die al
 * documenten bevat wordt overgeslagen — Els's eigen kolommen blijven staan.
 * Draaien: npx payload run scripts/seed/seed-dashboard-columns.ts
 */
import { getPayload } from "payload";

import config from "@payload-config";

const payload = await getPayload({ config });

async function seedDealStages(): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "deal-stages" });
  if (totalDocs > 0) {
    console.log(`↷ deal-stages: al ${totalDocs} documenten, overslaan`);
    return;
  }
  const fases = [
    { naam: "Lead", kleur: "blauw" },
    { naam: "Gesprek", kleur: "paars" },
    { naam: "Offerte", kleur: "oranje" },
    { naam: "Klant", kleur: "groen" },
  ] as const;
  for (const fase of fases) {
    await payload.create({ collection: "deal-stages", data: fase });
  }
  console.log(`✓ deal-stages: ${fases.length} standaardfases geseed`);
}

async function seedTaskStatuses(): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "task-statuses" });
  if (totalDocs > 0) {
    console.log(`↷ task-statuses: al ${totalDocs} documenten, overslaan`);
    return;
  }
  const statussen = [
    { naam: "To-do", kleur: "grijs" },
    { naam: "Bezig", kleur: "blauw" },
    { naam: "Review", kleur: "oranje" },
    { naam: "Klaar", kleur: "groen" },
  ] as const;
  for (const status of statussen) {
    await payload.create({ collection: "task-statuses", data: status });
  }
  console.log(`✓ task-statuses: ${statussen.length} standaardstatussen geseed`);
}

async function seedContentChannels(): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "content-channels" });
  if (totalDocs > 0) {
    console.log(`↷ content-channels: al ${totalDocs} documenten, overslaan`);
    return;
  }
  const kanalen = [
    { naam: "Blog", kleur: "groen", type: "blog" },
    { naam: "Nieuwsbrief", kleur: "blauw", type: "nieuwsbrief" },
    { naam: "LinkedIn", kleur: "paars", type: "linkedin" },
  ] as const;
  for (const kanaal of kanalen) {
    await payload.create({ collection: "content-channels", data: kanaal });
  }
  console.log(`✓ content-channels: ${kanalen.length} standaardkanalen geseed`);
}

await seedDealStages();
await seedTaskStatuses();
await seedContentChannels();
process.exit(0);
