/**
 * Hermes Agent-user (VPS, dagelijkse cron): werkt via de REST API met een
 * API-key in plaats van sessie-cookies, als eigen user met attributie
 * (PRD §2 B6, fase 1.4).
 *
 * Idempotent: bestaat de user al, dan wordt de key NIET geroteerd — dit
 * script draait dan alleen een lees-check en stopt.
 *
 * Draaien: npx payload run scripts/seed/seed-hermes.ts
 */
import { randomBytes, randomUUID } from "node:crypto";

import { getPayload } from "payload";

import config from "@payload-config";

import type { User } from "@/payload-types";

const HERMES_EMAIL = "hermes@humanmargin.eu";

const payload = await getPayload({ config });

const bestaand = await payload.find({
  collection: "users",
  where: { email: { equals: HERMES_EMAIL } },
  limit: 1,
});

if (bestaand.totalDocs > 0) {
  console.log("↷ hermes bestaat al");
  process.exit(0);
}

const apiKey = randomUUID();

await payload.create({
  collection: "users",
  data: {
    name: "Hermes (AI-agent)",
    email: HERMES_EMAIL,
    role: "teamlid",
    // Hermes logt nooit via de UI in; hij werkt uitsluitend met de API-key
    // hieronder (Authorization: users API-Key <key>), dus een willekeurig
    // wachtwoord dat verder nergens voor gebruikt wordt.
    password: randomBytes(24).toString("hex"),
    // enableAPIKey/apiKey bestaan pas op het gegenereerde User-type na
    // `npm run generate:types` (T3 zet net `auth: { useAPIKey: true }` in
    // Users.ts). Gerichte cast op alleen deze twee velden tot die regeneratie
    // draait; orchestrator kan de cast daarna laten vervallen.
    ...({ enableAPIKey: true, apiKey } as Partial<User>),
  },
});

console.log("✓ Hermes-user aangemaakt.");
console.log(
  "API-key (eenmalig getoond — bewaar in de VPS-env, NOOIT in het repo):",
);
console.log(apiKey);
console.log(`Gebruik: Authorization: users API-Key ${apiKey}`);

process.exit(0);
