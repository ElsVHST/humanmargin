import { randomUUID } from "node:crypto";

import type { Payload } from "payload";
import { beforeAll, describe, expect, it } from "vitest";

import { getTestPayload } from "./helpers/payload";
import { createTestUser } from "./helpers/users";

let payload: Payload;
let teamlid: Awaited<ReturnType<typeof createTestUser>>;

beforeAll(async () => {
  payload = await getTestPayload();
  teamlid = await createTestUser(payload, { role: "teamlid" });
});

describe("crm: contacts", () => {
  it("stelt de volledige naam automatisch samen (useAsTitle)", async () => {
    const contact = await payload.create({
      collection: "contacts",
      data: {
        voornaam: "Els",
        achternaam: "van Human Margin",
        email: `els-${randomUUID()}@test.local`,
      },
      overrideAccess: false,
      user: teamlid,
    });
    expect(contact.naam).toBe("Els van Human Margin");
  });

  it("weigert een tweede contact met hetzelfde e-mailadres (unieke matchsleutel)", async () => {
    const email = `dubbel-${randomUUID()}@test.local`;
    await payload.create({
      collection: "contacts",
      data: { voornaam: "Eerste", email },
      overrideAccess: false,
      user: teamlid,
    });
    await expect(
      payload.create({
        collection: "contacts",
        data: { voornaam: "Tweede", email },
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });

  it("koppelt aan een organisatie en is terug te vinden via het join-veld", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: `JoinTest BV ${randomUUID()}` },
      overrideAccess: false,
      user: teamlid,
    });
    const contact = await payload.create({
      collection: "contacts",
      data: {
        voornaam: "Join",
        achternaam: "Tester",
        email: `join-${randomUUID()}@test.local`,
        organisatie: org.id,
      },
      overrideAccess: false,
      user: teamlid,
    });
    const orgMetJoin = await payload.findByID({
      collection: "organisations",
      id: org.id,
      joins: { contacten: { limit: 10 } },
    });
    const joinDocs = orgMetJoin.contacten?.docs ?? [];
    const ids = joinDocs.map((d) => (typeof d === "object" ? d.id : d));
    expect(ids.map(String)).toContain(String(contact.id));
  });
});
