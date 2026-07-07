import { getPayload } from "payload";
import config from "@payload-config";
const payload = await getPayload({ config });
const existing = await payload.find({ collection: "users", where: { email: { equals: "chris@co-creatie.ai" } }, limit: 1 });
if (!existing.docs[0]) {
  await payload.create({ collection: "users", data: { name: "Chris", email: "chris@co-creatie.ai", password: "humanmargin-dev-2026" } });
  console.log("admin aangemaakt");
} else {
  console.log("admin bestond al");
}
process.exit(0);
