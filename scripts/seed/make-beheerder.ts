/**
 * Promoveer een bestaande gebruiker tot beheerder.
 * Draaien: npx payload run scripts/seed/make-beheerder.ts -- <email>
 */
import { getPayload } from "payload";

import config from "@payload-config";

const email = process.argv.at(-1);
if (!email || !email.includes("@")) {
  console.error(
    "Gebruik: npx payload run scripts/seed/make-beheerder.ts -- <email>",
  );
  process.exit(1);
}

const payload = await getPayload({ config });
const { docs } = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
});
const user = docs[0];
if (!user) {
  console.error(`Geen gebruiker gevonden met e-mail ${email}`);
  process.exit(1);
}
await payload.update({
  collection: "users",
  id: user.id,
  data: { role: "beheerder" },
});
console.log(`✓ ${email} is nu beheerder`);
process.exit(0);
