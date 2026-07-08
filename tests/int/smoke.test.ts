import { describe, expect, it } from "vitest";

import { getTestPayload } from "./helpers/payload";

describe("payload-testinfra", () => {
  it("initialiseert Payload tegen de testdatabase", async () => {
    const payload = await getTestPayload();
    expect(payload.collections.users).toBeDefined();
    const result = await payload.find({ collection: "users", limit: 1 });
    expect(result).toHaveProperty("docs");
  });
});
