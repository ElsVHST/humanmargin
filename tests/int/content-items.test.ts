import { randomUUID } from "node:crypto";

import type { Payload } from "payload";
import { beforeAll, describe, expect, it } from "vitest";

import { getTestPayload } from "./helpers/payload";
import { createTestUser } from "./helpers/users";

let payload: Payload;
let teamlid: Awaited<ReturnType<typeof createTestUser>>;
let blogKanaal: { id: number };
let linkedinKanaal: { id: number };

beforeAll(async () => {
  payload = await getTestPayload();
  teamlid = await createTestUser(payload, { role: "teamlid" });
  blogKanaal = await payload.create({
    collection: "content-channels",
    data: { naam: `Blog ${randomUUID()}`, kleur: "groen", type: "blog" },
  });
  linkedinKanaal = await payload.create({
    collection: "content-channels",
    data: { naam: `LI ${randomUUID()}`, kleur: "paars", type: "linkedin" },
  });
});

describe("content-items + blog-hook", () => {
  it("blog-item op 'gepland' zetten maakt een conceptpagina en koppelt die (idempotent)", async () => {
    const uniek = randomUUID().slice(0, 8);
    const item = await payload.create({
      collection: "content-items",
      data: {
        titel: `Hooktest blogpost ${uniek}`,
        status: "concept",
        kanaal: blogKanaal.id,
        publishDate: new Date().toISOString(),
      },
      overrideAccess: false,
      user: teamlid,
    });
    expect(item.gekoppeldePagina ?? null).toBeNull();

    const gepland = await payload.update({
      collection: "content-items",
      id: item.id,
      data: { status: "gepland" },
      overrideAccess: false,
      user: teamlid,
    });
    const paginaId =
      typeof gepland.gekoppeldePagina === "object"
        ? gepland.gekoppeldePagina?.id
        : gepland.gekoppeldePagina;
    expect(paginaId).toBeTruthy();

    const pagina = await payload.findByID({
      collection: "pages",
      id: paginaId as number,
      draft: true,
    });
    expect(pagina.title).toBe(`Hooktest blogpost ${uniek}`);
    expect(pagina._status).toBe("draft");

    // Nogmaals opslaan: geen tweede pagina
    await payload.update({
      collection: "content-items",
      id: item.id,
      data: { status: "concept" },
      overrideAccess: false,
      user: teamlid,
    });
    await payload.update({
      collection: "content-items",
      id: item.id,
      data: { status: "gepland" },
      overrideAccess: false,
      user: teamlid,
    });
    const paginas = await payload.find({
      collection: "pages",
      where: { title: { equals: `Hooktest blogpost ${uniek}` } },
      draft: true,
    });
    expect(paginas.totalDocs).toBe(1);
  });

  it("niet-blog-kanaal krijgt géén pagina bij plannen", async () => {
    const item = await payload.create({
      collection: "content-items",
      data: {
        titel: `LinkedIn-post ${randomUUID().slice(0, 8)}`,
        status: "idee",
        kanaal: linkedinKanaal.id,
      },
      overrideAccess: false,
      user: teamlid,
    });
    const gepland = await payload.update({
      collection: "content-items",
      id: item.id,
      data: { status: "gepland" },
      overrideAccess: false,
      user: teamlid,
    });
    expect(gepland.gekoppeldePagina ?? null).toBeNull();
  });
});
