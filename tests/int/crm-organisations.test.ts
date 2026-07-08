import type { Payload } from "payload";
import { beforeAll, describe, expect, it } from "vitest";

import { getTestPayload } from "./helpers/payload";
import { createTestUser } from "./helpers/users";

let payload: Payload;
let beheerder: Awaited<ReturnType<typeof createTestUser>>;
let teamlid: Awaited<ReturnType<typeof createTestUser>>;

beforeAll(async () => {
  payload = await getTestPayload();
  beheerder = await createTestUser(payload, { role: "beheerder" });
  teamlid = await createTestUser(payload, { role: "teamlid" });
});

describe("crm: organisations", () => {
  it("teamlid kan een organisatie aanmaken; eigenaar wordt automatisch gezet", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: "Testbedrijf BV", sector: "AI-compliance", tags: ["klant"] },
      overrideAccess: false,
      user: teamlid,
    });
    expect(org.naam).toBe("Testbedrijf BV");
    const eigenaarId = typeof org.eigenaar === "object" ? org.eigenaar?.id : org.eigenaar;
    expect(String(eigenaarId)).toBe(String(teamlid.id));
  });

  it("teamlid kan naar de prullenbak verwijderen (deletedAt), maar niet permanent", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: "Weggooi BV" },
      overrideAccess: false,
      user: teamlid,
    });
    const getrasht = await payload.update({
      collection: "organisations",
      id: org.id,
      data: { deletedAt: new Date().toISOString() },
      overrideAccess: false,
      user: teamlid,
    });
    expect(getrasht.deletedAt).toBeTruthy();

    await expect(
      payload.delete({
        collection: "organisations",
        id: org.id,
        trash: true,
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });

  it("beheerder mag wél permanent verwijderen", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: "Definitief weg BV" },
      overrideAccess: false,
      user: beheerder,
    });
    await payload.delete({
      collection: "organisations",
      id: org.id,
      trash: true,
      overrideAccess: false,
      user: beheerder,
    });
    const weg = await payload.find({
      collection: "organisations",
      trash: true,
      where: { id: { equals: org.id } },
    });
    expect(weg.docs).toHaveLength(0);
  });
});
