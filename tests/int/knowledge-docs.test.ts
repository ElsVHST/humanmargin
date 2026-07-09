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

describe("kennisbank", () => {
  it("maakt een document met subdocument (parent-boom); zichtbaarheid default intern", async () => {
    const root = await payload.create({
      collection: "knowledge-docs",
      data: { titel: `Handboek ${randomUUID().slice(0, 6)}`, zichtbaarheid: "intern", soort: "document" },
      overrideAccess: false,
      user: teamlid,
    });
    expect(root.zichtbaarheid).toBe("intern");
    expect(typeof root.position).toBe("number");

    const kind = await payload.create({
      collection: "knowledge-docs",
      data: { titel: "Hoofdstuk 1", parent: root.id, zichtbaarheid: "intern", soort: "document" },
      overrideAccess: false,
      user: teamlid,
    });
    const parentId =
      typeof kind.parent === "object" ? kind.parent?.id : kind.parent;
    expect(String(parentId)).toBe(String(root.id));

    const kinderen = await payload.find({
      collection: "knowledge-docs",
      where: { parent: { equals: root.id } },
    });
    expect(kinderen.totalDocs).toBe(1);
  });

  it("auteur wordt automatisch gezet op de ingelogde gebruiker", async () => {
    const docItem = await payload.create({
      collection: "knowledge-docs",
      data: { titel: `Auteurtest ${randomUUID().slice(0, 6)}`, zichtbaarheid: "intern", soort: "document" },
      overrideAccess: false,
      user: teamlid,
    });
    const auteurId =
      typeof docItem.auteur === "object" ? docItem.auteur?.id : docItem.auteur;
    expect(String(auteurId)).toBe(String(teamlid.id));
  });
});
