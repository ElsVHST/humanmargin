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

async function activitiesVoorDeal(dealId: string | number) {
  return payload.find({
    collection: "activities",
    where: {
      and: [
        { "targets.relationTo": { equals: "deals" } },
        { "targets.value": { equals: dealId } },
      ],
    },
    sort: "-happensAt",
  });
}

describe("crm: activities + statuswijziging-hook", () => {
  it("notitie koppelen aan meerdere targets en terugvinden per target", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: `Notitie BV ${randomUUID()}` },
      overrideAccess: false,
      user: teamlid,
    });
    const activiteit = await payload.create({
      collection: "activities",
      data: {
        type: "notitie",
        targets: [{ relationTo: "organisations", value: org.id }],
        happensAt: new Date().toISOString(),
      },
      overrideAccess: false,
      user: teamlid,
    });
    expect(activiteit.type).toBe("notitie");

    const gevonden = await payload.find({
      collection: "activities",
      where: {
        and: [
          { "targets.relationTo": { equals: "organisations" } },
          { "targets.value": { equals: org.id } },
        ],
      },
    });
    expect(gevonden.docs.map((d) => String(d.id))).toContain(
      String(activiteit.id),
    );
  });

  it("faseverandering van een deal wordt automatisch gelogd met voor/na", async () => {
    const faseA = await payload.create({
      collection: "deal-stages",
      data: { naam: `A ${randomUUID()}`, kleur: "blauw" },
    });
    const faseB = await payload.create({
      collection: "deal-stages",
      data: { naam: `B ${randomUUID()}`, kleur: "groen" },
    });
    const deal = await payload.create({
      collection: "deals",
      data: { titel: "Hooktest", uitkomst: "open", fase: faseA.id },
      overrideAccess: false,
      user: teamlid,
    });

    await payload.update({
      collection: "deals",
      id: deal.id,
      data: { fase: faseB.id },
      overrideAccess: false,
      user: teamlid,
    });

    const log = await activitiesVoorDeal(deal.id);
    const statuswijzigingen = log.docs.filter(
      (a) => a.type === "statuswijziging",
    );
    expect(statuswijzigingen.length).toBe(1);
    const props = statuswijzigingen[0].properties as {
      fase?: { van: unknown; naar: unknown };
    };
    expect(String(props.fase?.van)).toBe(String(faseA.id));
    expect(String(props.fase?.naar)).toBe(String(faseB.id));
  });

  it("uitkomst-wijziging wordt gelogd; update zonder wijziging logt niets", async () => {
    const deal = await payload.create({
      collection: "deals",
      data: { titel: "Uitkomsttest", uitkomst: "open" },
      overrideAccess: false,
      user: teamlid,
    });

    await payload.update({
      collection: "deals",
      id: deal.id,
      data: { uitkomst: "gewonnen" },
      overrideAccess: false,
      user: teamlid,
    });
    let log = await activitiesVoorDeal(deal.id);
    expect(log.docs.filter((a) => a.type === "statuswijziging").length).toBe(1);

    await payload.update({
      collection: "deals",
      id: deal.id,
      data: { titel: "Uitkomsttest (hernoemd)" },
      overrideAccess: false,
      user: teamlid,
    });
    log = await activitiesVoorDeal(deal.id);
    expect(log.docs.filter((a) => a.type === "statuswijziging").length).toBe(1);
  });
});
