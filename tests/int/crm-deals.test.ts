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

describe("crm: deals", () => {
  it("maakt een deal met fase, bedrag en automatische position", async () => {
    const fase = await payload.create({
      collection: "deal-stages",
      data: { naam: `Fase ${randomUUID()}`, kleur: "blauw" },
    });
    const deal = await payload.create({
      collection: "deals",
      data: {
        titel: "AICK Sprint traject",
        bedrag: 4500,
        valuta: "EUR",
        fase: fase.id,
        kans: 60,
        uitkomst: "open",
      },
      overrideAccess: false,
      user: teamlid,
    });
    expect(deal.uitkomst).toBe("open");
    expect(typeof deal.position).toBe("number");
    expect(deal.position).toBeGreaterThan(0);
  });

  it("een deal zonder fase mag bestaan (fallback-kolom 'Geen fase' in het board)", async () => {
    const deal = await payload.create({
      collection: "deals",
      data: { titel: "Nog geen fase", uitkomst: "open" },
      overrideAccess: false,
      user: teamlid,
    });
    expect(deal.fase ?? null).toBeNull();
  });

  it("deals zijn via joins zichtbaar op organisatie én contactpersoon", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: `DealJoin BV ${randomUUID()}` },
      overrideAccess: false,
      user: teamlid,
    });
    const contact = await payload.create({
      collection: "contacts",
      data: {
        voornaam: "Deal",
        achternaam: "Houder",
        email: `deal-${randomUUID()}@test.local`,
        organisatie: org.id,
      },
      overrideAccess: false,
      user: teamlid,
    });
    const deal = await payload.create({
      collection: "deals",
      data: {
        titel: "Jointest-deal",
        uitkomst: "open",
        organisatie: org.id,
        contactpersoon: contact.id,
      },
      overrideAccess: false,
      user: teamlid,
    });

    const orgMetJoin = await payload.findByID({
      collection: "organisations",
      id: org.id,
      joins: { deals: { limit: 10 } },
    });
    const orgDealIds = (orgMetJoin.deals?.docs ?? []).map((d) =>
      String(typeof d === "object" ? d.id : d),
    );
    expect(orgDealIds).toContain(String(deal.id));

    const contactMetJoin = await payload.findByID({
      collection: "contacts",
      id: contact.id,
      joins: { deals: { limit: 10 } },
    });
    const contactDealIds = (contactMetJoin.deals?.docs ?? []).map((d) =>
      String(typeof d === "object" ? d.id : d),
    );
    expect(contactDealIds).toContain(String(deal.id));
  });
});
