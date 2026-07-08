# Els-dashboard Fase 1: Fundament — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Het fundament van het Els-dashboard: testinfrastructuur, rollen (beheerder/teamlid), de module-structuur onder `src/modules/`, en de drie door Els beheerbare kolom-collecties (pipeline-fases, taakstatussen, contentkanalen) met NL-standaardseed.

**Architecture:** Uitbreiding van de bestaande Payload 3.85.2-app (spec: `docs/superpowers/specs/2026-07-08-els-dashboard-design.md`). Alles is Payload-config: collections met `orderable: true` (kolomvolgorde) en `trash: true` (prullenbak), access-functies voor rollen, en een gedeelde collectie-factory zodat de drie kolom-collecties identiek gedragen. Integratietests draaien met Vitest + de Payload Local API tegen een **lokale** testdatabase.

**Tech Stack:** Payload 3.85.2, Next.js 16.2.10, @payloadcms/db-postgres (Neon prod, lokale postgresql@17 voor tests), Vitest 3, TypeScript strict.

## Global Constraints

- **Versies vast:** payload 3.85.2, next 16.2.10 — geen upgrades in dit plan. Enige nieuwe dependency: `vitest` (devDependency, ^3).
- **Taal:** alle labels/beschrijvingen in de admin in het Nederlands; slugs en veldnamen Engels behalve waar NL natuurlijker is voor Els (veld `naam`, `kleur` — bestaande conventie: `Pages` gebruikt NL labels met Engelse veldnamen; kolom-collecties gebruiken bewust NL veldnamen omdat Els ze in API-antwoorden van boards terugziet).
- **Na elke schema-wijziging:** `npm run generate:types` (regenereert `src/payload-types.ts` — nooit handmatig bewerken).
- **Code style:** TypeScript strict, geen `any`; named exports; 2 spaties indent.
- **Commits:** Nederlandstalige message; elke commit eindigt met de standaard footer:
  ```
  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_015BZYpXtyM8K2ezkDtAeMFj
  ```
- **VEILIGHEID TESTS:** `.env` bevat Els's **Neon-productiedatabase**. Tests mogen daar NOOIT tegenaan draaien. `tests/int/setup.ts` overschrijft `DATABASE_URI` onvoorwaardelijk naar de lokale testdatabase (zie Task 1) — dit bestand nooit "optimaliseren" naar een conditionele override.
- **Afwijking van de spec (bewust):** de `activities`-collectie staat in spec §10 onder Fundament, maar haar polymorfe `targets`-veld verwijst naar `organisations`/`contacts`/`deals` — die bestaan pas in Fase 2. Payload valideert `relationTo` tegen bestaande collections, dus `activities` verhuist naar het Fase 2-plan (CRM), waar de doelcollecties in dezelfde fase landen.

---

### Task 1: Vitest-testinfrastructuur + testdatabase

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/int/setup.ts`
- Create: `tests/int/helpers/payload.ts`
- Create: `tests/int/smoke.test.ts`
- Modify: `package.json` (scripts + devDependency)
- Modify: `src/payload.config.ts:54-57` (expliciete `push`-optie op de db-adapter)

**Interfaces:**
- Produces: `getTestPayload(): Promise<Payload>` uit `tests/int/helpers/payload.ts` — singleton Payload-client tegen de testdatabase; elke latere testfile gebruikt deze.
- Produces: npm-scripts `test` (`vitest run`) en `test:watch` (`vitest`).

- [ ] **Step 1: Maak de lokale testdatabase aan**

```bash
createdb humanmargin_test 2>/dev/null || echo "bestond al"
psql -d humanmargin_test -c "SELECT 1;"
```

Expected: `SELECT 1` geeft `1 row`. (Vereist draaiende postgresql@17: `brew services start postgresql@17`.)

- [ ] **Step 2: Installeer Vitest en voeg scripts toe**

```bash
npm install -D vitest@^3
```

In `package.json` onder `"scripts"` toevoegen (na `"check"`):

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Schrijf vitest.config.ts**

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/int/**/*.test.ts"],
    setupFiles: ["tests/int/setup.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // Eén Payload-instantie + schema-push verdraagt geen parallelle testfiles
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@payload-config": path.resolve(dirname, "src/payload.config.ts"),
      "@": path.resolve(dirname, "src"),
    },
  },
});
```

- [ ] **Step 4: Schrijf tests/int/setup.ts (de Neon-beveiliging)**

```ts
// Draait vóór elke testfile (vitest setupFiles).
// ONVOORWAARDELIJKE override: tests raken nooit de database uit .env (Neon van Els).
process.env.DATABASE_URI =
  process.env.TEST_DATABASE_URI ??
  "postgresql://localhost:5432/humanmargin_test";
process.env.PAYLOAD_SECRET = "test-secret-alleen-lokaal";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
```

- [ ] **Step 5: Schrijf tests/int/helpers/payload.ts**

```ts
import { getPayload, type Payload } from "payload";

let cached: Payload | null = null;

export async function getTestPayload(): Promise<Payload> {
  if (cached) {
    return cached;
  }
  const { default: config } = await import("@payload-config");
  cached = await getPayload({ config });
  return cached;
}
```

- [ ] **Step 6: Schrijf de falende smoke test**

`tests/int/smoke.test.ts`:

```ts
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
```

- [ ] **Step 7: Draai de test — verwacht eerst schema-synchronisatie, dan groen**

```bash
npm test
```

Expected: PASS (1 test). Payload pusht bij init het schema naar de lege testdatabase (de postgres-adapter synct automatisch buiten productie). Faalt hij met een schema-fout, voeg dan in `src/payload.config.ts` expliciet `push: process.env.NODE_ENV !== "production"` toe aan de `postgresAdapter`-opties (zie Step 8, dat we sowieso doen) en draai opnieuw.

- [ ] **Step 8: Maak push-gedrag expliciet in src/payload.config.ts**

Vervang het `db:`-blok (regels 54-57):

```ts
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    migrationDir: path.resolve(dirname, "migrations"),
    // Dev/test: schema auto-sync; productie: alleen migraties
    push: process.env.NODE_ENV !== "production",
  }),
```

- [ ] **Step 9: Draai `npm test` en `npm run check` — beide groen**

```bash
npm test && npm run check
```

Expected: test PASS; lint + typecheck + build slagen.

- [ ] **Step 10: Commit**

```bash
git add vitest.config.ts tests/ package.json package-lock.json src/payload.config.ts
git commit -m "Testinfra: Vitest + Payload Local API tegen lokale testdatabase"
```

---

### Task 2: Rollen (beheerder/teamlid) + access-helpers

**Files:**
- Create: `src/modules/shared/access.ts`
- Create: `tests/int/helpers/users.ts`
- Create: `tests/int/users-access.test.ts`
- Create: `scripts/seed/make-beheerder.ts`
- Modify: `src/collections/Users.ts`

**Interfaces:**
- Consumes: `getTestPayload()` uit Task 1.
- Produces: `isAuthenticated: Access`, `isBeheerder: Access`, `isBeheerderOrSelf: Access` uit `src/modules/shared/access.ts` — alle latere collections gebruiken deze.
- Produces: `createTestUser(payload, { role: "beheerder" | "teamlid" }): Promise<User>` uit `tests/int/helpers/users.ts`.
- Produces: `users.role` veld (`"beheerder" | "teamlid"`, default `"teamlid"`, in JWT).

- [ ] **Step 1: Schrijf de falende access-tests**

`tests/int/helpers/users.ts`:

```ts
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
```

`tests/int/users-access.test.ts`:

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
```

- [ ] **Step 2: Draai de tests — verwacht FAIL**

```bash
npm test -- tests/int/users-access.test.ts
```

Expected: FAIL — het `role`-veld bestaat nog niet (create met `role` valt op typefout of onbekend veld / access ontbreekt).

- [ ] **Step 3: Schrijf src/modules/shared/access.ts**

```ts
import type { Access, FieldAccess } from "payload";

export const isAuthenticated: Access = ({ req }) => Boolean(req.user);

export const isBeheerder: Access = ({ req }) => req.user?.role === "beheerder";

export const isBeheerderOrSelf: Access = ({ req, id }) => {
  if (!req.user) {
    return false;
  }
  if (req.user.role === "beheerder") {
    return true;
  }
  return id !== undefined && String(req.user.id) === String(id);
};

/** Veld-access: alleen beheerders mogen dit veld wijzigen. */
export const beheerderFieldOnly: FieldAccess = ({ req }) =>
  req.user?.role === "beheerder";
```

- [ ] **Step 4: Breid src/collections/Users.ts uit met rol + access**

Vervang de volledige inhoud:

```ts
import type { CollectionConfig } from "payload";

import {
  beheerderFieldOnly,
  isAuthenticated,
  isBeheerder,
  isBeheerderOrSelf,
} from "@/modules/shared/access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Gebruiker", plural: "Gebruikers" },
  auth: true,
  access: {
    read: isAuthenticated,
    create: isBeheerder,
    update: isBeheerderOrSelf,
    delete: isBeheerder,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Beheer",
  },
  fields: [
    { name: "name", label: "Naam", type: "text", required: true },
    {
      name: "role",
      label: "Rol",
      type: "select",
      required: true,
      defaultValue: "teamlid",
      saveToJWT: true,
      options: [
        { label: "Beheerder", value: "beheerder" },
        { label: "Teamlid", value: "teamlid" },
      ],
      access: { update: beheerderFieldOnly },
      admin: {
        description:
          "Beheerders beheren gebruikers, kolommen en de prullenbak; teamleden werken in alle domeinen.",
      },
    },
  ],
};
```

- [ ] **Step 5: Regenereer types**

```bash
npm run generate:types
```

Expected: `src/payload-types.ts` bevat nu `role: 'beheerder' | 'teamlid'` op `User`. (Zonder deze stap compileert `access.ts` niet — `req.user.role` bestaat pas na typegeneratie.)

- [ ] **Step 6: Draai de tests — verwacht PASS**

```bash
npm test -- tests/int/users-access.test.ts
```

Expected: PASS (5 tests). Let op: de rol-wijzigingstest verwacht dat Payload het veld **stil negeert** (veld-access geweigerd ⇒ veld niet bijgewerkt, geen error).

- [ ] **Step 7: Schrijf scripts/seed/make-beheerder.ts**

(Zelfde patroon als bestaande seeds: draaien met `npx payload run`.)

```ts
/**
 * Promoveer een bestaande gebruiker tot beheerder.
 * Draaien: npx payload run scripts/seed/make-beheerder.ts -- <email>
 */
import { getPayload } from "payload";

import config from "@payload-config";

const email = process.argv.at(-1);
if (!email || !email.includes("@")) {
  console.error(
    "Gebruik: npx payload run scripts/seed/make-beheerder.ts -- <email>",
  );
  process.exit(1);
}

const payload = await getPayload({ config });
const { docs } = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
});
const user = docs[0];
if (!user) {
  console.error(`Geen gebruiker gevonden met e-mail ${email}`);
  process.exit(1);
}
await payload.update({
  collection: "users",
  id: user.id,
  data: { role: "beheerder" },
});
console.log(`✓ ${email} is nu beheerder`);
process.exit(0);
```

- [ ] **Step 8: Promoveer het bestaande dev-adminaccount (tegen de dev-database uit .env)**

```bash
npx payload run scripts/seed/make-beheerder.ts -- chris@co-creatie.ai
```

Expected: `✓ chris@co-creatie.ai is nu beheerder`. (Bestaande gebruikers kregen bij de schema-push default `teamlid`; zonder deze stap sluit je jezelf op in teamlid-rechten.)

- [ ] **Step 9: Volledige suite + check**

```bash
npm test && npm run check
```

Expected: alle tests PASS; lint + typecheck + build groen.

- [ ] **Step 10: Commit**

```bash
git add src/modules/shared/access.ts src/collections/Users.ts src/payload-types.ts tests/int/ scripts/seed/make-beheerder.ts
git commit -m "Rollen beheerder/teamlid op Users + access-helpers in shared module"
```

---

### Task 3: Kolomcollectie-factory + Pipeline-fases (CRM-module)

**Files:**
- Create: `src/modules/shared/columnCollection.ts`
- Create: `src/modules/crm/collections/DealStages.ts`
- Create: `src/modules/crm/index.ts`
- Create: `tests/int/column-collections.test.ts`
- Modify: `src/payload.config.ts` (import + collections-array)

**Interfaces:**
- Consumes: `isAuthenticated`, `isBeheerder` uit Task 2; `getTestPayload`/`createTestUser` uit Tasks 1-2.
- Produces: `makeColumnCollection(opts: ColumnCollectionOpts): CollectionConfig` en `kleurOpties` uit `src/modules/shared/columnCollection.ts` — Task 4 hergebruikt beide.
- Produces: collectie-slug `deal-stages` (velden: `naam: string`, `kleur: string`, plus Payload's `_order: string` door `orderable: true` en `deletedAt` door `trash: true`).
- Produces: `crmCollections: CollectionConfig[]` uit `src/modules/crm/index.ts`.

- [ ] **Step 1: Schrijf de falende tests**

`tests/int/column-collections.test.ts`:

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
```

- [ ] **Step 2: Draai de tests — verwacht FAIL**

```bash
npm test -- tests/int/column-collections.test.ts
```

Expected: FAIL — collectie `deal-stages` bestaat niet.

- [ ] **Step 3: Schrijf src/modules/shared/columnCollection.ts**

```ts
import type { CollectionConfig, Field } from "payload";

import { isAuthenticated, isBeheerder } from "@/modules/shared/access";

/**
 * Kleurenpalet voor kolommen (boards renderen deze tokens naar CSS).
 * Referentie: Twenty's stage-kleuren (docs/research/dashboard/twenty.md §4).
 */
export const kleurOpties = [
  { label: "Groen", value: "groen" },
  { label: "Blauw", value: "blauw" },
  { label: "Paars", value: "paars" },
  { label: "Rood", value: "rood" },
  { label: "Oranje", value: "oranje" },
  { label: "Geel", value: "geel" },
  { label: "Turquoise", value: "turquoise" },
  { label: "Roze", value: "roze" },
  { label: "Grijs", value: "grijs" },
] as const;

export type Kleur = (typeof kleurOpties)[number]["value"];

export type ColumnCollectionOpts = {
  slug: string;
  singular: string;
  plural: string;
  group: string;
  defaultKleur?: Kleur;
  extraFields?: Field[];
};

/**
 * Factory voor door Els beheerbare kolom-collecties (pipeline-fases,
 * taakstatussen, contentkanalen). Gedrag per spec §4:
 * - orderable: kolomvolgorde via slepen (Payload fractional indexing)
 * - trash: verwijderen = prullenbak; boards vangen wees-kaarten op in
 *   een virtuele fallback-kolom
 * - alleen beheerders beheren kolommen; iedereen (ingelogd) leest ze
 */
export function makeColumnCollection(
  opts: ColumnCollectionOpts,
): CollectionConfig {
  return {
    slug: opts.slug,
    labels: { singular: opts.singular, plural: opts.plural },
    orderable: true,
    trash: true,
    access: {
      read: isAuthenticated,
      create: isBeheerder,
      update: isBeheerder,
      delete: isBeheerder,
    },
    admin: {
      useAsTitle: "naam",
      defaultColumns: ["naam", "kleur"],
      group: opts.group,
    },
    fields: [
      { name: "naam", label: "Naam", type: "text", required: true },
      {
        name: "kleur",
        label: "Kleur",
        type: "select",
        required: true,
        defaultValue: opts.defaultKleur ?? "grijs",
        options: [...kleurOpties],
      },
      ...(opts.extraFields ?? []),
    ],
  };
}
```

- [ ] **Step 4: Schrijf src/modules/crm/collections/DealStages.ts en src/modules/crm/index.ts**

`src/modules/crm/collections/DealStages.ts`:

```ts
import { makeColumnCollection } from "@/modules/shared/columnCollection";

export const DealStages = makeColumnCollection({
  slug: "deal-stages",
  singular: "Pipeline-fase",
  plural: "Pipeline-fases",
  group: "CRM",
  defaultKleur: "blauw",
});
```

`src/modules/crm/index.ts`:

```ts
import type { CollectionConfig } from "payload";

import { DealStages } from "@/modules/crm/collections/DealStages";

export const crmCollections: CollectionConfig[] = [DealStages];
```

- [ ] **Step 5: Registreer de module in src/payload.config.ts**

Bij de imports (na de bestaande `@/collections/*`-imports):

```ts
import { crmCollections } from "@/modules/crm";
```

En vervang de collections-regel:

```ts
  collections: [Pages, Media, Users, Subscribers, ...crmCollections],
```

- [ ] **Step 6: Regenereer types**

```bash
npm run generate:types
```

Expected: `src/payload-types.ts` bevat een `DealStage`-interface met `naam`, `kleur`, `_order`, `deletedAt`.

- [ ] **Step 7: Draai de tests — verwacht PASS**

```bash
npm test -- tests/int/column-collections.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 8: Volledige suite + check, dan commit**

```bash
npm test && npm run check
git add src/modules/ src/payload.config.ts src/payload-types.ts tests/int/column-collections.test.ts
git commit -m "Kolomcollectie-factory (orderable+trash+rollen) en pipeline-fases in CRM-module"
```

---

### Task 4: Taakstatussen + contentkanalen + NL-standaardseed

**Files:**
- Create: `src/modules/projects/collections/TaskStatuses.ts`
- Create: `src/modules/projects/index.ts`
- Create: `src/modules/content/collections/ContentChannels.ts`
- Create: `src/modules/content/index.ts`
- Create: `scripts/seed/seed-dashboard-columns.ts`
- Modify: `src/payload.config.ts` (twee module-imports + collections-array)
- Modify: `tests/int/column-collections.test.ts` (extra describe-blok)

**Interfaces:**
- Consumes: `makeColumnCollection`, `kleurOpties` uit Task 3.
- Produces: collectie-slugs `task-statuses` (velden als `deal-stages`) en `content-channels` (extra veld `type: "blog" | "nieuwsbrief" | "linkedin" | "instagram" | "overig"` — vaste enum waar latere hooks aan hangen, spec §3/§6).
- Produces: `projectsCollections: CollectionConfig[]`, `contentCollections: CollectionConfig[]`.
- Produces: idempotent seed-script voor de NL-standaardkolommen uit spec §9.

- [ ] **Step 1: Schrijf de falende tests (toevoegen aan tests/int/column-collections.test.ts)**

Onder het bestaande describe-blok:

```ts
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
```

- [ ] **Step 2: Draai de tests — verwacht FAIL (collecties bestaan niet)**

```bash
npm test -- tests/int/column-collections.test.ts
```

- [ ] **Step 3: Schrijf de twee collecties + module-indexes**

`src/modules/projects/collections/TaskStatuses.ts`:

```ts
import { makeColumnCollection } from "@/modules/shared/columnCollection";

export const TaskStatuses = makeColumnCollection({
  slug: "task-statuses",
  singular: "Taakstatus",
  plural: "Taakstatussen",
  group: "Projecten",
  defaultKleur: "grijs",
});
```

`src/modules/projects/index.ts`:

```ts
import type { CollectionConfig } from "payload";

import { TaskStatuses } from "@/modules/projects/collections/TaskStatuses";

export const projectsCollections: CollectionConfig[] = [TaskStatuses];
```

`src/modules/content/collections/ContentChannels.ts`:

```ts
import { makeColumnCollection } from "@/modules/shared/columnCollection";

export const ContentChannels = makeColumnCollection({
  slug: "content-channels",
  singular: "Contentkanaal",
  plural: "Contentkanalen",
  group: "Content",
  defaultKleur: "paars",
  extraFields: [
    {
      name: "type",
      label: "Kanaaltype",
      type: "select",
      required: true,
      defaultValue: "overig",
      options: [
        { label: "Blog", value: "blog" },
        { label: "Nieuwsbrief", value: "nieuwsbrief" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "Instagram", value: "instagram" },
        { label: "Overig", value: "overig" },
      ],
      admin: {
        description:
          "Vast type dat gedrag bepaalt (blog-kanaal koppelt aan sitepagina's). De naam hierboven is vrij te kiezen.",
      },
    },
  ],
});
```

`src/modules/content/index.ts`:

```ts
import type { CollectionConfig } from "payload";

import { ContentChannels } from "@/modules/content/collections/ContentChannels";

export const contentCollections: CollectionConfig[] = [ContentChannels];
```

- [ ] **Step 4: Registreer beide modules in src/payload.config.ts**

Imports aanvullen:

```ts
import { contentCollections } from "@/modules/content";
import { crmCollections } from "@/modules/crm";
import { projectsCollections } from "@/modules/projects";
```

Collections-regel:

```ts
  collections: [
    Pages,
    Media,
    Users,
    Subscribers,
    ...crmCollections,
    ...projectsCollections,
    ...contentCollections,
  ],
```

- [ ] **Step 5: Types + tests**

```bash
npm run generate:types
npm test -- tests/int/column-collections.test.ts
```

Expected: PASS (7 tests totaal in dit bestand).

- [ ] **Step 6: Schrijf scripts/seed/seed-dashboard-columns.ts**

```ts
/**
 * Seed de NL-standaardkolommen (spec §9). Idempotent: een collectie die al
 * documenten bevat wordt overgeslagen — Els's eigen kolommen blijven staan.
 * Draaien: npx payload run scripts/seed/seed-dashboard-columns.ts
 */
import { getPayload } from "payload";

import config from "@payload-config";

const payload = await getPayload({ config });

async function seedDealStages(): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "deal-stages" });
  if (totalDocs > 0) {
    console.log(`↷ deal-stages: al ${totalDocs} documenten, overslaan`);
    return;
  }
  const fases = [
    { naam: "Lead", kleur: "blauw" },
    { naam: "Gesprek", kleur: "paars" },
    { naam: "Offerte", kleur: "oranje" },
    { naam: "Klant", kleur: "groen" },
  ] as const;
  for (const fase of fases) {
    await payload.create({ collection: "deal-stages", data: fase });
  }
  console.log(`✓ deal-stages: ${fases.length} standaardfases geseed`);
}

async function seedTaskStatuses(): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "task-statuses" });
  if (totalDocs > 0) {
    console.log(`↷ task-statuses: al ${totalDocs} documenten, overslaan`);
    return;
  }
  const statussen = [
    { naam: "To-do", kleur: "grijs" },
    { naam: "Bezig", kleur: "blauw" },
    { naam: "Review", kleur: "oranje" },
    { naam: "Klaar", kleur: "groen" },
  ] as const;
  for (const status of statussen) {
    await payload.create({ collection: "task-statuses", data: status });
  }
  console.log(`✓ task-statuses: ${statussen.length} standaardstatussen geseed`);
}

async function seedContentChannels(): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "content-channels" });
  if (totalDocs > 0) {
    console.log(`↷ content-channels: al ${totalDocs} documenten, overslaan`);
    return;
  }
  const kanalen = [
    { naam: "Blog", kleur: "groen", type: "blog" },
    { naam: "Nieuwsbrief", kleur: "blauw", type: "nieuwsbrief" },
    { naam: "LinkedIn", kleur: "paars", type: "linkedin" },
  ] as const;
  for (const kanaal of kanalen) {
    await payload.create({ collection: "content-channels", data: kanaal });
  }
  console.log(`✓ content-channels: ${kanalen.length} standaardkanalen geseed`);
}

await seedDealStages();
await seedTaskStatuses();
await seedContentChannels();
process.exit(0);
```

- [ ] **Step 7: Draai de seed tegen de dev-database en verifieer idempotentie**

```bash
npx payload run scripts/seed/seed-dashboard-columns.ts
npx payload run scripts/seed/seed-dashboard-columns.ts
```

Expected run 1: drie `✓`-regels. Expected run 2: drie `↷ … overslaan`-regels.

- [ ] **Step 8: Volledige suite + check, dan commit**

```bash
npm test && npm run check
git add src/modules/ src/payload.config.ts src/payload-types.ts tests/int/column-collections.test.ts scripts/seed/seed-dashboard-columns.ts
git commit -m "Taakstatussen + contentkanalen (vast kanaaltype) + NL-standaardseed"
```

---

### Task 5: Admin-verificatie + levende documentatie

**Files:**
- Modify: `.claude/skills/humanmargin-payload-cms/SKILL.md` (nieuwe sectie)
- Geen productiecode.

**Interfaces:**
- Consumes: alles uit Tasks 1-4.
- Produces: bijgewerkte skill-documentatie (onderhoudsplicht uit CLAUDE.md).

- [ ] **Step 1: Handmatige admin-verificatie**

```bash
npm run dev
```

Open `http://localhost:3000/admin`, log in als chris@co-creatie.ai en controleer:
1. Navigatie toont de nieuwe groepen **CRM** (Pipeline-fases), **Projecten** (Taakstatussen), **Content** (Contentkanalen) naast de bestaande groepen.
2. Pipeline-fases-lijst toont de 4 geseede fases en ondersteunt slepen-om-te-herordenen (orderable).
3. Een fase verwijderen toont Payload's prullenbak-flow (document belandt in de prullenbak, niet definitief weg).
4. Onder Gebruikers heeft chris@co-creatie.ai rol "Beheerder"; het rolveld toont de NL-beschrijving.

Expected: alle vier de punten kloppen. Stop de dev-server daarna.

- [ ] **Step 2: Werk .claude/skills/humanmargin-payload-cms/SKILL.md bij**

Voeg deze sectie toe aan het einde van het bestand:

```markdown
## Dashboard-modules (Fase 1: fundament)

- **Module-structuur:** dashboard-collections leven in `src/modules/<domein>/collections/` met een `index.ts` per module die `<domein>Collections: CollectionConfig[]` exporteert; `src/payload.config.ts` spreidt die arrays in `collections`. Gedeelde bouwstenen (access-helpers, kolomcollectie-factory) in `src/modules/shared/`.
- **Rollen:** `users.role` = `beheerder` | `teamlid` (select, `saveToJWT`). Access-helpers: `isAuthenticated`, `isBeheerder`, `isBeheerderOrSelf`, `beheerderFieldOnly` uit `src/modules/shared/access.ts`. Promoveren: `npx payload run scripts/seed/make-beheerder.ts -- <email>`.
- **Kolom-collecties** (door Els beheerd): `deal-stages`, `task-statuses`, `content-channels` via `makeColumnCollection()` — `orderable: true` (fractional `_order`), `trash: true` (prullenbak), alleen beheerders muteren. `content-channels.type` is een vaste enum (blog/nieuwsbrief/linkedin/instagram/overig) waar hooks aan hangen. Standaardseed: `npx payload run scripts/seed/seed-dashboard-columns.ts` (idempotent).
- **Tests:** `npm test` (Vitest + Local API). Tests draaien ALTIJD tegen de lokale `humanmargin_test`-database — `tests/int/setup.ts` overschrijft `DATABASE_URI` onvoorwaardelijk (bescherming van Els's Neon). Testdatabase aanmaken: `createdb humanmargin_test`.
- **Spec & onderzoek:** `docs/superpowers/specs/2026-07-08-els-dashboard-design.md`, `docs/research/dashboard/`.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/humanmargin-payload-cms/SKILL.md
git commit -m "Skill-docs: dashboard-fundament (modules, rollen, kolom-collecties, tests)"
```

- [ ] **Step 4: Push naar GitHub**

```bash
git push origin master
```

Expected: push slaagt (collaborator-toegang is geverifieerd op 2026-07-08).
