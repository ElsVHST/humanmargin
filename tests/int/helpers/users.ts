import { randomUUID } from "node:crypto";

import type { Payload } from "payload";

export async function createTestUser(
  payload: Payload,
  opts: { role: "beheerder" | "teamlid" },
) {
  return payload.create({
    collection: "users",
    data: {
      name: `Test ${opts.role}`,
      email: `${opts.role}-${randomUUID()}@test.local`,
      password: "test-wachtwoord-123",
      role: opts.role,
    },
  });
}
