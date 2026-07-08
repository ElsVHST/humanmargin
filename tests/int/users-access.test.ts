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

describe("users: rollen en access", () => {
  it("beheerder mag gebruikers aanmaken", async () => {
    const user = await payload.create({
      collection: "users",
      data: {
        name: "Nieuw teamlid",
        email: `nieuw-${Date.now()}@test.local`,
        password: "wachtwoord-123",
        role: "teamlid",
      },
      overrideAccess: false,
      user: beheerder,
    });
    expect(user.role).toBe("teamlid");
  });

  it("teamlid mag geen gebruikers aanmaken", async () => {
    await expect(
      payload.create({
        collection: "users",
        data: {
          name: "Indringer",
          email: `hack-${Date.now()}@test.local`,
          password: "wachtwoord-123",
          role: "beheerder",
        },
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });

  it("teamlid kan de eigen rol niet wijzigen (veld-access)", async () => {
    const updated = await payload.update({
      collection: "users",
      id: teamlid.id,
      data: { role: "beheerder" },
      overrideAccess: false,
      user: teamlid,
    });
    expect(updated.role).toBe("teamlid");
  });

  it("teamlid mag het eigen profiel (naam) wél bijwerken", async () => {
    const updated = await payload.update({
      collection: "users",
      id: teamlid.id,
      data: { name: "Nieuwe naam" },
      overrideAccess: false,
      user: teamlid,
    });
    expect(updated.name).toBe("Nieuwe naam");
  });

  it("teamlid mag andermans account niet bijwerken", async () => {
    await expect(
      payload.update({
        collection: "users",
        id: beheerder.id,
        data: { name: "Gekaapt" },
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });
});
