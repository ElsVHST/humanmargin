# Els-dashboard Fase 2a: CRM-datamodel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De CRM-kern van het Els-dashboard: `organisations`, `contacts`, `deals` en de polymorfe `activities`-timeline, inclusief de statuswijziging-hook en join-velden — volledig getest via de fase-1-testinfra.

**Architecture:** Pure Payload-config in de bestaande module-structuur (`src/modules/crm/` + `src/modules/shared/`), per spec §3 en de Twenty-referentie (`docs/research/dashboard/twenty.md`). Geen UI in dit plan — het pipeline-board en de timeline-component komen in Fase 2b, bovenop de hier gegenereerde types.

**Tech Stack:** Payload 3.85.2 (trash, joins, polymorfe relationships), Vitest-integratietests tegen lokale `humanmargin_test`-database.

## Global Constraints

- Zie fase-1-plan: versies vast (payload 3.85.2 / next 16.2.10), NL-labels, `npm run generate:types` na élke schema-wijziging, TS strict zonder `any`, commit-footer, tests nooit tegen Neon.
- **Geen nieuwe dependencies** in dit plan.
- **Access-model (spec §7):** teamlid mag lezen/aanmaken/bewerken (en dus naar prullenbak via `deletedAt`-update); permanent verwijderen alleen beheerder. Preset: `dashboardCollectionAccess`.
- **Afwijking van de spec (bewust):** spec §3 zegt "e-mails (array, eerste = primair)". Implementatie: één verplicht `email`-veld met **native `unique`-index** (de matchsleutel voor latere mailsync) + `extraEmails` (text hasMany). Functioneel gelijk, maar de uniciteit is database-afgedwongen i.p.v. hook-logica.
- **Afwijking van de spec (bewust):** "deal gewonnen → project aanmaken"-hook (spec §6) kan pas in Fase 3 — de `projects`-collectie bestaat nog niet. De statuswijziging-lóg-hook (deze fase) legt de gewonnen-overgang al wel vast in de timeline.
- `activities.targets` verwijst in deze fase naar `['organisations','contacts','deals']`; Fase 3 voegt `'projects'` toe aan die array (één regel + types regenereren).
- **Naar Fase 2b (UI-plan):** de nieuwsbriefstatus-lookup op de contactkaart (spec §3, UI-veld met subscribers-lookup), het pipeline-board en de timeline-component. Dit plan levert uitsluitend het datamodel + hooks.

---

### Task 1: Gedeelde veld-presets + Organisaties

**Files:**
- Create: `src/modules/shared/fields.ts`
- Create: `src/modules/crm/collections/Organisations.ts`
- Modify: `src/modules/shared/access.ts` (preset toevoegen)
- Modify: `src/modules/crm/index.ts`
- Test: `tests/int/crm-organisations.test.ts`

**Interfaces:**
- Consumes: `isAuthenticated`, `isBeheerder` uit fase 1; `getTestPayload`/`createTestUser` testhelpers.
- Produces: `dashboardCollectionAccess: CollectionConfig["access"]` (access.ts), `eigenaarField: Field` en `tagsField: Field` (fields.ts) — alle latere CRM/PM/content-collecties gebruiken deze.
- Produces: collectie-slug `organisations` (velden: `naam`, `website`, `linkedin`, `sector`, `logo`→media, `notities`, `tags: string[]`, `eigenaar`→users; plus `deletedAt` via trash).

- [ ] **Step 1: Schrijf de falende test** — `tests/int/crm-organisations.test.ts`:

```ts
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
```

- [ ] **Step 2: Run — verwacht FAIL** (`organisations` bestaat niet): `npm test -- tests/int/crm-organisations.test.ts`

- [ ] **Step 3: Voeg de access-preset toe** aan `src/modules/shared/access.ts` (onderaan):

```ts
import type { CollectionConfig } from "payload";

/**
 * Standaard-access voor dashboard-collecties (spec §7): ingelogd = lezen,
 * aanmaken en bewerken (incl. naar prullenbak via deletedAt); permanent
 * verwijderen alleen beheerder.
 */
export const dashboardCollectionAccess: CollectionConfig["access"] = {
  read: isAuthenticated,
  create: isAuthenticated,
  update: isAuthenticated,
  delete: isBeheerder,
};
```

(De `import type { CollectionConfig }` komt bovenaan het bestand bij de bestaande imports.)

- [ ] **Step 4: Schrijf `src/modules/shared/fields.ts`**:

```ts
import type { Field } from "payload";

/** Eigenaar-relatie met automatische default naar de ingelogde gebruiker. */
export const eigenaarField: Field = {
  name: "eigenaar",
  label: "Eigenaar",
  type: "relationship",
  relationTo: "users",
  defaultValue: ({ user }) => user?.id,
  admin: { position: "sidebar" },
};

/** Vrije tekst-tags (spec §3). */
export const tagsField: Field = {
  name: "tags",
  label: "Tags",
  type: "text",
  hasMany: true,
};
```

- [ ] **Step 5: Schrijf `src/modules/crm/collections/Organisations.ts`**:

```ts
import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { eigenaarField, tagsField } from "@/modules/shared/fields";

export const Organisations: CollectionConfig = {
  slug: "organisations",
  labels: { singular: "Organisatie", plural: "Organisaties" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "naam",
    defaultColumns: ["naam", "sector", "eigenaar"],
    group: "CRM",
  },
  fields: [
    { name: "naam", label: "Naam", type: "text", required: true },
    { name: "website", label: "Website", type: "text" },
    { name: "linkedin", label: "LinkedIn", type: "text" },
    { name: "sector", label: "Sector", type: "text" },
    { name: "logo", label: "Logo", type: "upload", relationTo: "media" },
    { name: "notities", label: "Notities", type: "textarea" },
    tagsField,
    eigenaarField,
  ],
};
```

- [ ] **Step 6: Registreer in `src/modules/crm/index.ts`**:

```ts
import type { CollectionConfig } from "payload";

import { DealStages } from "@/modules/crm/collections/DealStages";
import { Organisations } from "@/modules/crm/collections/Organisations";

export const crmCollections: CollectionConfig[] = [Organisations, DealStages];
```

- [ ] **Step 7: Types + test PASS**: `npm run generate:types && npm test -- tests/int/crm-organisations.test.ts` → 3 PASS

- [ ] **Step 8: Volledige suite + check + commit**:

```bash
npm test && npm run check
git add src/modules/ src/payload-types.ts tests/int/crm-organisations.test.ts
git commit -m "CRM: organisaties + gedeelde veld-presets (eigenaar, tags) en access-preset"
```

---

### Task 2: Contacten (met uniek e-mailadres en naam-hook)

**Files:**
- Create: `src/modules/crm/collections/Contacts.ts`
- Modify: `src/modules/crm/collections/Organisations.ts` (join-veld `contacten`)
- Modify: `src/modules/crm/index.ts`
- Test: `tests/int/crm-contacts.test.ts`

**Interfaces:**
- Consumes: `dashboardCollectionAccess`, `eigenaarField`, `tagsField` uit Task 1.
- Produces: collectie-slug `contacts` (velden: `voornaam`, `achternaam`, `naam` (auto, hidden), `email` **uniek**, `extraEmails: string[]`, `telefoons: string[]`, `functie`, `linkedin`, `avatar`→media, `organisatie`→organisations, `bron`, `tags`, `eigenaar`).
- Produces: join-veld `organisations.contacten` (alle contactpersonen op het organisatiescherm).

- [ ] **Step 1: Schrijf de falende test** — `tests/int/crm-contacts.test.ts`:

```ts
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

describe("crm: contacts", () => {
  it("stelt de volledige naam automatisch samen (useAsTitle)", async () => {
    const contact = await payload.create({
      collection: "contacts",
      data: {
        voornaam: "Els",
        achternaam: "van Human Margin",
        email: `els-${randomUUID()}@test.local`,
      },
      overrideAccess: false,
      user: teamlid,
    });
    expect(contact.naam).toBe("Els van Human Margin");
  });

  it("weigert een tweede contact met hetzelfde e-mailadres (unieke matchsleutel)", async () => {
    const email = `dubbel-${randomUUID()}@test.local`;
    await payload.create({
      collection: "contacts",
      data: { voornaam: "Eerste", email },
      overrideAccess: false,
      user: teamlid,
    });
    await expect(
      payload.create({
        collection: "contacts",
        data: { voornaam: "Tweede", email },
        overrideAccess: false,
        user: teamlid,
      }),
    ).rejects.toThrow();
  });

  it("koppelt aan een organisatie en is terug te vinden via het join-veld", async () => {
    const org = await payload.create({
      collection: "organisations",
      data: { naam: `JoinTest BV ${randomUUID()}` },
      overrideAccess: false,
      user: teamlid,
    });
    const contact = await payload.create({
      collection: "contacts",
      data: {
        voornaam: "Join",
        achternaam: "Tester",
        email: `join-${randomUUID()}@test.local`,
        organisatie: org.id,
      },
      overrideAccess: false,
      user: teamlid,
    });
    const orgMetJoin = await payload.findByID({
      collection: "organisations",
      id: org.id,
      joins: { contacten: { limit: 10 } },
    });
    const joinDocs = orgMetJoin.contacten?.docs ?? [];
    const ids = joinDocs.map((d) => (typeof d === "object" ? d.id : d));
    expect(ids.map(String)).toContain(String(contact.id));
  });
});
```

- [ ] **Step 2: Run — verwacht FAIL**: `npm test -- tests/int/crm-contacts.test.ts`

- [ ] **Step 3: Schrijf `src/modules/crm/collections/Contacts.ts`**:

```ts
import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { eigenaarField, tagsField } from "@/modules/shared/fields";

export const Contacts: CollectionConfig = {
  slug: "contacts",
  labels: { singular: "Contactpersoon", plural: "Contactpersonen" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "naam",
    defaultColumns: ["naam", "email", "organisatie", "eigenaar"],
    group: "CRM",
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "voornaam", label: "Voornaam", type: "text", required: true },
        { name: "achternaam", label: "Achternaam", type: "text" },
      ],
    },
    {
      // Samengesteld weergaveveld voor useAsTitle en relaties
      name: "naam",
      label: "Volledige naam",
      type: "text",
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) =>
            [siblingData.voornaam, siblingData.achternaam]
              .filter(Boolean)
              .join(" "),
        ],
      },
    },
    {
      name: "email",
      label: "E-mailadres",
      type: "email",
      required: true,
      unique: true,
      admin: {
        description:
          "Uniek — dit is de matchsleutel voor nieuwsbriefstatus en latere e-mailkoppeling.",
      },
    },
    { name: "extraEmails", label: "Extra e-mailadressen", type: "text", hasMany: true },
    { name: "telefoons", label: "Telefoonnummers", type: "text", hasMany: true },
    { name: "functie", label: "Functie", type: "text" },
    { name: "linkedin", label: "LinkedIn", type: "text" },
    { name: "avatar", label: "Foto", type: "upload", relationTo: "media" },
    {
      name: "organisatie",
      label: "Organisatie",
      type: "relationship",
      relationTo: "organisations",
    },
    { name: "bron", label: "Bron", type: "text" },
    tagsField,
    eigenaarField,
  ],
};
```

- [ ] **Step 4: Voeg het join-veld toe** aan `src/modules/crm/collections/Organisations.ts` (in `fields`, na `notities`):

```ts
    {
      name: "contacten",
      label: "Contactpersonen",
      type: "join",
      collection: "contacts",
      on: "organisatie",
    },
```

- [ ] **Step 5: Registreer** in `src/modules/crm/index.ts`:

```ts
import type { CollectionConfig } from "payload";

import { Contacts } from "@/modules/crm/collections/Contacts";
import { DealStages } from "@/modules/crm/collections/DealStages";
import { Organisations } from "@/modules/crm/collections/Organisations";

export const crmCollections: CollectionConfig[] = [
  Organisations,
  Contacts,
  DealStages,
];
```

- [ ] **Step 6: Types + test PASS**: `npm run generate:types && npm test -- tests/int/crm-contacts.test.ts` → 3 PASS

- [ ] **Step 7: Volledige suite + check + commit**:

```bash
npm test && npm run check
git add src/modules/ src/payload-types.ts tests/int/crm-contacts.test.ts
git commit -m "CRM: contactpersonen (uniek e-mailadres, auto-naam) + join op organisaties"
```

---

### Task 3: Deals (pipeline-kaarten) + joins

**Files:**
- Create: `src/modules/crm/collections/Deals.ts`
- Modify: `src/modules/crm/collections/Organisations.ts` (join `deals`)
- Modify: `src/modules/crm/collections/Contacts.ts` (join `deals`)
- Modify: `src/modules/crm/index.ts`
- Test: `tests/int/crm-deals.test.ts`

**Interfaces:**
- Consumes: Task 1-2 presets en collecties; `deal-stages` uit fase 1.
- Produces: collectie-slug `deals` (velden: `titel`, `bedrag: number`, `valuta: "EUR"|"USD"`, `fase`→deal-stages (optioneel — leeg/verwijderd = fallback-kolom in 2b), `uitkomst: "open"|"gewonnen"|"verloren"` (vast, default open), `verlorenReden`, `verwachteSluitdatum`, `kans: 0-100`, `organisatie`, `contactpersoon`, `eigenaar`, `position: number` (kaartvolgorde, auto)).
- Produces: joins `organisations.deals` en `contacts.deals`.

- [ ] **Step 1: Schrijf de falende test** — `tests/int/crm-deals.test.ts`:

```ts
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
      data: { titel: "Nog geen fase" },
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
```

- [ ] **Step 2: Run — verwacht FAIL**: `npm test -- tests/int/crm-deals.test.ts`

- [ ] **Step 3: Schrijf `src/modules/crm/collections/Deals.ts`**:

```ts
import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { eigenaarField } from "@/modules/shared/fields";

export const Deals: CollectionConfig = {
  slug: "deals",
  labels: { singular: "Deal", plural: "Deals" },
  trash: true,
  access: dashboardCollectionAccess,
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "organisatie", "fase", "uitkomst", "bedrag"],
    group: "CRM",
  },
  fields: [
    { name: "titel", label: "Titel", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "bedrag", label: "Bedrag", type: "number", min: 0 },
        {
          name: "valuta",
          label: "Valuta",
          type: "select",
          defaultValue: "EUR",
          options: [
            { label: "€ EUR", value: "EUR" },
            { label: "$ USD", value: "USD" },
          ],
        },
      ],
    },
    {
      name: "fase",
      label: "Fase",
      type: "relationship",
      relationTo: "deal-stages",
      admin: {
        description:
          "Kolom op het pipeline-board. Leeg of verwijderde fase = kolom 'Geen fase'.",
      },
    },
    {
      name: "uitkomst",
      label: "Uitkomst",
      type: "select",
      required: true,
      defaultValue: "open",
      options: [
        { label: "Open", value: "open" },
        { label: "Gewonnen", value: "gewonnen" },
        { label: "Verloren", value: "verloren" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "verlorenReden",
      label: "Reden verloren",
      type: "text",
      admin: {
        position: "sidebar",
        condition: (data) => data?.uitkomst === "verloren",
      },
    },
    {
      name: "verwachteSluitdatum",
      label: "Verwachte sluitdatum",
      type: "date",
      admin: { position: "sidebar" },
    },
    {
      name: "kans",
      label: "Kans (%)",
      type: "number",
      min: 0,
      max: 100,
      admin: { position: "sidebar" },
    },
    {
      name: "organisatie",
      label: "Organisatie",
      type: "relationship",
      relationTo: "organisations",
    },
    {
      name: "contactpersoon",
      label: "Contactpersoon",
      type: "relationship",
      relationTo: "contacts",
    },
    eigenaarField,
    {
      // Kaartvolgorde binnen een kolom (Twenty-patroon: numeriek, drop = fase+position in één update)
      name: "position",
      label: "Positie",
      type: "number",
      index: true,
      admin: { hidden: true },
      hooks: {
        beforeChange: [({ value }) => (value == null ? Date.now() : value)],
      },
    },
  ],
};
```

- [ ] **Step 4: Joins toevoegen.** In `Organisations.ts` (na het `contacten`-join-veld):

```ts
    {
      name: "deals",
      label: "Deals",
      type: "join",
      collection: "deals",
      on: "organisatie",
    },
```

In `Contacts.ts` (na `organisatie`):

```ts
    {
      name: "deals",
      label: "Deals",
      type: "join",
      collection: "deals",
      on: "contactpersoon",
    },
```

- [ ] **Step 5: Registreer** in `src/modules/crm/index.ts` (Deals vóór DealStages):

```ts
import type { CollectionConfig } from "payload";

import { Contacts } from "@/modules/crm/collections/Contacts";
import { Deals } from "@/modules/crm/collections/Deals";
import { DealStages } from "@/modules/crm/collections/DealStages";
import { Organisations } from "@/modules/crm/collections/Organisations";

export const crmCollections: CollectionConfig[] = [
  Organisations,
  Contacts,
  Deals,
  DealStages,
];
```

- [ ] **Step 6: Types + test PASS**: `npm run generate:types && npm test -- tests/int/crm-deals.test.ts` → 3 PASS

- [ ] **Step 7: Volledige suite + check + commit**:

```bash
npm test && npm run check
git add src/modules/ src/payload-types.ts tests/int/crm-deals.test.ts
git commit -m "CRM: deals (fase, uitkomst, position) + joins op organisaties en contacten"
```

---

### Task 4: Activities (polymorfe timeline) + statuswijziging-hook

**Files:**
- Create: `src/modules/shared/collections/Activities.ts`
- Create: `src/modules/crm/hooks/logDealStatusChange.ts`
- Modify: `src/modules/crm/collections/Deals.ts` (hook registreren)
- Modify: `src/payload.config.ts` (Activities registreren via shared)
- Create: `src/modules/shared/index.ts`
- Test: `tests/int/crm-activities.test.ts`

**Interfaces:**
- Consumes: alle CRM-collecties uit Task 1-3.
- Produces: collectie-slug `activities` (velden: `type: "notitie"|"statuswijziging"|"systeem"|"email"|"boeking"`, `tekst` richText, `targets` polymorf hasMany →organisations/contacts/deals, `auteur`→users, `happensAt` date, `properties` json).
- Produces: `sharedCollections: CollectionConfig[]` uit `src/modules/shared/index.ts`.
- Produces: `logDealStatusChange: CollectionAfterChangeHook<Deal>` — logt fase/uitkomst-wijzigingen; faalt stil (opslag blijft intact).

- [ ] **Step 1: Schrijf de falende test** — `tests/int/crm-activities.test.ts`:

```ts
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
      data: { titel: "Hooktest", fase: faseA.id },
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
      data: { titel: "Uitkomsttest" },
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
```

- [ ] **Step 2: Run — verwacht FAIL**: `npm test -- tests/int/crm-activities.test.ts`

- [ ] **Step 3: Schrijf `src/modules/shared/collections/Activities.ts`**:

```ts
import type { CollectionConfig } from "payload";

import { isAuthenticated, isBeheerder } from "@/modules/shared/access";

/**
 * Polymorfe timeline (spec §3, Twenty-referentie §2): één activiteit kan aan
 * meerdere CRM-entiteiten hangen. Fase 3 voegt 'projects' toe aan relationTo.
 * Types 'email' en 'boeking' zijn gereserveerd voor latere fases (spec §1).
 */
export const Activities: CollectionConfig = {
  slug: "activities",
  labels: { singular: "Activiteit", plural: "Activiteiten" },
  trash: true,
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isBeheerder,
    delete: isBeheerder,
  },
  admin: {
    useAsTitle: "type",
    defaultColumns: ["type", "happensAt", "auteur"],
    group: "CRM",
  },
  fields: [
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      defaultValue: "notitie",
      options: [
        { label: "Notitie", value: "notitie" },
        { label: "Statuswijziging", value: "statuswijziging" },
        { label: "Systeem", value: "systeem" },
        { label: "E-mail", value: "email" },
        { label: "Boeking", value: "boeking" },
      ],
    },
    { name: "tekst", label: "Tekst", type: "richText" },
    {
      name: "targets",
      label: "Gekoppeld aan",
      type: "relationship",
      relationTo: ["organisations", "contacts", "deals"],
      hasMany: true,
      required: true,
    },
    {
      name: "auteur",
      label: "Auteur",
      type: "relationship",
      relationTo: "users",
      defaultValue: ({ user }) => user?.id,
      admin: { position: "sidebar" },
    },
    {
      name: "happensAt",
      label: "Datum",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "properties",
      label: "Details",
      type: "json",
      admin: { readOnly: true },
    },
  ],
};
```

- [ ] **Step 4: Schrijf `src/modules/shared/index.ts`** en registreer in `src/payload.config.ts`:

```ts
import type { CollectionConfig } from "payload";

import { Activities } from "@/modules/shared/collections/Activities";

export const sharedCollections: CollectionConfig[] = [Activities];
```

In `src/payload.config.ts`: import toevoegen `import { sharedCollections } from "@/modules/shared";` en in de collections-array `...sharedCollections,` toevoegen ná `...contentCollections`.

- [ ] **Step 5: Schrijf `src/modules/crm/hooks/logDealStatusChange.ts`**:

```ts
import type { CollectionAfterChangeHook } from "payload";

import type { Deal } from "@/payload-types";

function relId(value: Deal["fase"]): string | number | null {
  if (value == null) return null;
  return typeof value === "object" ? value.id : value;
}

/**
 * Logt fase- en uitkomst-wijzigingen als 'statuswijziging'-activiteit met
 * voor/na in properties (spec §6, Twenty-patroon: timeline i.p.v. historietabel).
 * Faalt stil: een logfout mag de opslag nooit blokkeren (spec §8).
 */
export const logDealStatusChange: CollectionAfterChangeHook<Deal> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update" || !previousDoc) return doc;

  const wijzigingen: Record<string, { van: unknown; naar: unknown }> = {};
  const faseVan = relId(previousDoc.fase);
  const faseNaar = relId(doc.fase);
  if (String(faseVan) !== String(faseNaar)) {
    wijzigingen.fase = { van: faseVan, naar: faseNaar };
  }
  if (previousDoc.uitkomst !== doc.uitkomst) {
    wijzigingen.uitkomst = { van: previousDoc.uitkomst, naar: doc.uitkomst };
  }
  if (Object.keys(wijzigingen).length === 0) return doc;

  try {
    await req.payload.create({
      collection: "activities",
      data: {
        type: "statuswijziging",
        targets: [{ relationTo: "deals", value: doc.id }],
        auteur: req.user?.id ?? null,
        happensAt: new Date().toISOString(),
        properties: wijzigingen,
      },
      req,
    });
  } catch (error) {
    req.payload.logger.error(
      { err: error },
      `Statuswijziging van deal ${doc.id} kon niet worden gelogd`,
    );
  }
  return doc;
};
```

- [ ] **Step 6: Registreer de hook** in `src/modules/crm/collections/Deals.ts`: import toevoegen en boven `fields`:

```ts
import { logDealStatusChange } from "@/modules/crm/hooks/logDealStatusChange";
// ...in de config:
  hooks: { afterChange: [logDealStatusChange] },
```

- [ ] **Step 7: Types + test PASS**: `npm run generate:types && npm test -- tests/int/crm-activities.test.ts` → 3 PASS

- [ ] **Step 8: Volledige suite + check + commit**:

```bash
npm test && npm run check
git add src/modules/ src/payload.config.ts src/payload-types.ts tests/int/crm-activities.test.ts
git commit -m "Activities: polymorfe timeline + automatische logging van deal-statuswijzigingen"
```

---

### Task 5: Verificatie + levende documentatie + push

**Files:**
- Modify: `.claude/skills/humanmargin-payload-cms/SKILL.md`

- [ ] **Step 1: Admin-verificatie** (dev-server draait al of `npm run dev`): open `/admin`, controleer onder **CRM**: Organisaties, Contactpersonen, Deals, Activiteiten, Pipeline-fases. Maak via de admin een testorganisatie + deal; wijzig de fase; controleer dat er onder Activiteiten een "Statuswijziging" verschijnt. Verwijder de testdata daarna (prullenbak).

- [ ] **Step 2: SKILL.md aanvullen** — voeg onder de fase-1-sectie toe:

```markdown
## Dashboard-modules (Fase 2a: CRM-datamodel)

- **CRM-collecties:** `organisations`, `contacts` (uniek `email` = matchsleutel; `naam` auto uit voor+achternaam), `deals` (`fase`→deal-stages optioneel, `uitkomst` vast open/gewonnen/verloren, `position` auto voor kaartvolgorde). Joins: `organisations.contacten`, `organisations.deals`, `contacts.deals`.
- **Timeline:** `activities` in `src/modules/shared/collections/` — polymorf `targets` (hasMany → organisations/contacts/deals; fase 3 voegt projects toe), types notitie/statuswijziging/systeem/email/boeking. Deal-hook `logDealStatusChange` logt fase/uitkomst-wijzigingen met voor/na in `properties`; faalt stil.
- **Presets:** `dashboardCollectionAccess` (teamlid: CRUD + prullenbak; permanent verwijderen alleen beheerder), `eigenaarField`, `tagsField` in `src/modules/shared/`.
```

- [ ] **Step 3: Commit + push**:

```bash
git add .claude/skills/humanmargin-payload-cms/SKILL.md
git commit -m "Skill-docs: CRM-datamodel (fase 2a)"
git push origin master
```
