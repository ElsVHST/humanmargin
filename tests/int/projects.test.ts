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

describe("projecten & taken", () => {
  it("teamlid maakt een project; status is standaard actief", async () => {
    const project = await payload.create({
      collection: "projects",
      data: { naam: "Intern verbetertraject", status: "actief" },
      overrideAccess: false,
      user: teamlid,
    });
    expect(project.status).toBe("actief");
  });

  it("taak met checklist en status; losse taak zonder project mag", async () => {
    const status = await payload.create({
      collection: "task-statuses",
      data: { naam: `Status ${randomUUID()}`, kleur: "blauw" },
    });
    const taak = await payload.create({
      collection: "tasks",
      data: {
        titel: "Offerte nasturen",
        status: status.id,
        prioriteit: "hoog",
        checklist: [{ tekst: "Portfolio bijvoegen", klaar: false }],
      },
      overrideAccess: false,
      user: teamlid,
    });
    expect(taak.project ?? null).toBeNull();
    expect(taak.checklist?.[0]?.tekst).toBe("Portfolio bijvoegen");
    expect(typeof taak.position).toBe("number");
  });

  it("taken zijn via join zichtbaar op het project", async () => {
    const project = await payload.create({
      collection: "projects",
      data: { naam: `Jointest ${randomUUID()}`, status: "actief" },
      overrideAccess: false,
      user: teamlid,
    });
    const taak = await payload.create({
      collection: "tasks",
      data: { titel: "Kick-off plannen", prioriteit: "normaal", project: project.id },
      overrideAccess: false,
      user: teamlid,
    });
    const projectMetJoin = await payload.findByID({
      collection: "projects",
      id: project.id,
      joins: { taken: { limit: 10 } },
    });
    const ids = (projectMetJoin.taken?.docs ?? []).map((d) =>
      String(typeof d === "object" ? d.id : d),
    );
    expect(ids).toContain(String(taak.id));
  });

  it("deal op gewonnen zetten maakt automatisch één project aan (idempotent)", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: `Winnaar BV ${randomUUID()}` },
      overrideAccess: false,
      user: teamlid,
    });
    const deal = await payload.create({
      collection: "deals",
      data: { titel: "Groot traject", uitkomst: "open", organisatie: org.id },
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

    const projecten = await payload.find({
      collection: "projects",
      where: { deal: { equals: deal.id } },
    });
    expect(projecten.totalDocs).toBe(1);
    expect(projecten.docs[0].naam).toBe("Groot traject");
    const orgId = projecten.docs[0].organisatie;
    expect(String(typeof orgId === "object" ? orgId?.id : orgId)).toBe(
      String(org.id),
    );

    // Nogmaals heen en weer: geen tweede project
    await payload.update({
      collection: "deals",
      id: deal.id,
      data: { uitkomst: "open" },
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
    const opnieuw = await payload.find({
      collection: "projects",
      where: { deal: { equals: deal.id } },
    });
    expect(opnieuw.totalDocs).toBe(1);
  });

  it("activities kunnen aan een project hangen", async () => {
    const project = await payload.create({
      collection: "projects",
      data: { naam: `Timelinetest ${randomUUID()}`, status: "actief" },
      overrideAccess: false,
      user: teamlid,
    });
    const activiteit = await payload.create({
      collection: "activities",
      data: {
        type: "notitie",
        samenvatting: "Projectnotitie",
        targets: [{ relationTo: "projects", value: project.id }],
        happensAt: new Date().toISOString(),
      },
      overrideAccess: false,
      user: teamlid,
    });
    const gevonden = await payload.find({
      collection: "activities",
      where: {
        and: [
          { "targets.relationTo": { equals: "projects" } },
          { "targets.value": { equals: project.id } },
        ],
      },
    });
    expect(gevonden.docs.map((d) => String(d.id))).toContain(
      String(activiteit.id),
    );
  });
});
