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

describe("kolom-collecties: deal-stages", () => {
  it("beheerder kan een fase aanmaken; volgorde (_order) wordt bijgehouden", async () => {
    const fase = await payload.create({
      collection: "deal-stages",
      data: { naam: "Testfase", kleur: "blauw" },
      overrideAccess: false,
      user: beheerder,
    });
    expect(fase.naam).toBe("Testfase");
    expect(typeof fase._order).toBe("string");
    expect(String(fase._order).length).toBeGreaterThan(0);
  });

  it("teamlid kan fases lezen maar niet aanmaken", async () => {
    const list = await payload.find({
      collection: "deal-stages",
      overrideAccess: false,
      user: teamlid,
    });
    expect(list).toHaveProperty("docs");

    await expect(
      payload.create({
        collection: "deal-stages",
        data: { naam: "Verboden", kleur: "rood" },
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });

  it("teamlid kan fases niet bijwerken of verwijderen", async () => {
    const fase = await payload.create({
      collection: "deal-stages",
      data: { naam: "Alleen-lezen", kleur: "grijs" },
      overrideAccess: false,
      user: beheerder,
    });
    await expect(
      payload.update({
        collection: "deal-stages",
        id: fase.id,
        data: { naam: "Aangepast" },
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
    await expect(
      payload.delete({
        collection: "deal-stages",
        id: fase.id,
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });

  it("soft delete (prullenbak) verbergt de fase, maar het document blijft bestaan", async () => {
    const fase = await payload.create({
      collection: "deal-stages",
      data: { naam: "Tijdelijk", kleur: "oranje" },
      overrideAccess: false,
      user: beheerder,
    });
    await payload.update({
      collection: "deal-stages",
      id: fase.id,
      data: { deletedAt: new Date().toISOString() },
      overrideAccess: false,
      user: beheerder,
    });

    const zichtbaar = await payload.find({
      collection: "deal-stages",
      where: { id: { equals: fase.id } },
    });
    expect(zichtbaar.docs).toHaveLength(0);

    const inPrullenbak = await payload.find({
      collection: "deal-stages",
      trash: true,
      where: { id: { equals: fase.id } },
    });
    expect(inPrullenbak.docs).toHaveLength(1);
  });
});

describe("kolom-collecties: task-statuses en content-channels", () => {
  it("task-statuses gedraagt zich als kolom-collectie", async () => {
    const status = await payload.create({
      collection: "task-statuses",
      data: { naam: "Teststatus", kleur: "groen" },
      overrideAccess: false,
      user: beheerder,
    });
    expect(typeof status._order).toBe("string");
  });

  it("content-channels vereist een vast kanaaltype", async () => {
    const kanaal = await payload.create({
      collection: "content-channels",
      data: { naam: "Blog", kleur: "groen", type: "blog" },
      overrideAccess: false,
      user: beheerder,
    });
    expect(kanaal.type).toBe("blog");

    await expect(
      payload.create({
        collection: "content-channels",
        // @ts-expect-error bewust ongeldig kanaaltype
        data: { naam: "Fout", kleur: "rood", type: "podcast" },
        overrideAccess: false,
        user: beheerder,
      }),
    ).rejects.toThrow();
  });

  it("teamlid kan geen kanalen beheren", async () => {
    await expect(
      payload.create({
        collection: "content-channels",
        data: { naam: "Verboden", kleur: "grijs", type: "overig" },
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });
});
