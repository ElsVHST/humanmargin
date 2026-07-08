# Els-dashboard Fase 2b: Pipeline-board & timeline-UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Het eerste echte werk-oppervlak voor Els: een pipeline-kanban op `/admin/pipeline` met drag & drop, kolommenbeheer op het board zelf en een "Geen fase"-fallbackkolom — plus de activiteiten-timeline op detailschermen en de nieuwsbriefstatus op de contactkaart.

**Architecture:** Custom admin-view (server component haalt initiële data via de Local API, client-board muteert via Payload REST met de admin-sessiecookie). Board-logica (kolommen bouwen, posities berekenen) is puur en unit-getest. Styling via een eigen SCSS-bestand op Payload-theme-variabelen (consistent met `custom.scss`-branding). Referenties: Twenty (board/UX, `docs/research/dashboard/twenty.md` §5), AppFlowy (kolommenbeheer-UX, `appflowy.md` §4).

**Tech Stack:** @hello-pangea/dnd (drag & drop — Twenty's productie-board), @tanstack/react-query (server-state + optimistic updates), @payloadcms/ui-componenten, SCSS met Payload-theme-vars.

## Global Constraints

- Zie fase-1/2a-plannen: NL-labels, `generate:types` na schemawijziging, **`generate:importmap` na elke nieuwe admin-component**, TS strict, commit-footer, tests nooit tegen Neon.
- **Nieuwe dependencies (alleen deze):** `@hello-pangea/dnd`, `@tanstack/react-query`.
- Kolom-**volgorde** wijzigen blijft in deze fase via de Pipeline-fases-lijst (Payload's ingebouwde orderable-drag, werkt al). Het board beheert kolommen (toevoegen/hernoemen/verwijderen) en kaarten (verslepen). Kolom-slepen óp het board is een latere polish — `_order` is intern fractional-indexed en heeft geen publiek reorder-API.
- Board toont alleen **open** deals (uitkomst=open); gewonnen/verloren verdwijnen van het board maar blijven in de lijstweergave.
- **Schema-aanvulling in deze fase:** `activities.samenvatting` (text) voor korte notities vanaf de timeline (richText blijft voor de volledige editor); de deal-hook slaat voortaan ook **fase-namen** op naast id's zodat de timeline leesbaar is.

---

### Task 1: Dependencies + pure board-logica (kolommen, posities)

**Files:**
- Create: `src/modules/crm/views/pipeline/lib.ts`
- Test: `tests/unit/pipeline-lib.test.ts` (nieuw pad; puur, geen Payload)
- Modify: `vitest.config.ts` (include-patroon uitbreiden)

**Interfaces:**
- Produces: `GEEN_FASE = "geen-fase"`, `type BoardColumn = { id: string; naam: string; kleur: string; isFallback: boolean; deals: Deal[] }`, `buildColumns(stages: DealStage[], deals: Deal[]): BoardColumn[]` (fallback-kolom vooraan zodra er wees-deals zijn), `positionBetween(prev?: number|null, next?: number|null): number`, `relationId(value: Deal["fase"]): string | null`.

- [ ] **Step 1:** `npm install @hello-pangea/dnd @tanstack/react-query`
- [ ] **Step 2:** In `vitest.config.ts` het include-patroon verbreden naar `["tests/int/**/*.test.ts", "tests/unit/**/*.test.ts"]`.
- [ ] **Step 3: Falende unit-test** — `tests/unit/pipeline-lib.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import type { Deal, DealStage } from "@/payload-types";
import {
  buildColumns,
  GEEN_FASE,
  positionBetween,
} from "@/modules/crm/views/pipeline/lib";

const stage = (id: number, naam: string): DealStage =>
  ({ id, naam, kleur: "blauw" }) as DealStage;
const deal = (id: number, fase: number | null, position: number): Deal =>
  ({ id, titel: `Deal ${id}`, uitkomst: "open", fase, position }) as Deal;

describe("buildColumns", () => {
  it("groepeert deals per fase, gesorteerd op position", () => {
    const cols = buildColumns(
      [stage(1, "Lead"), stage(2, "Klant")],
      [deal(10, 1, 200), deal(11, 1, 100), deal(12, 2, 50)],
    );
    expect(cols.map((c) => c.naam)).toEqual(["Lead", "Klant"]);
    expect(cols[0].deals.map((d) => d.id)).toEqual([11, 10]);
  });

  it("zet wees-deals (geen of verwijderde fase) in de fallback-kolom vooraan", () => {
    const cols = buildColumns(
      [stage(1, "Lead")],
      [deal(10, 1, 1), deal(11, null, 1), deal(12, 999, 1)],
    );
    expect(cols[0].id).toBe(GEEN_FASE);
    expect(cols[0].isFallback).toBe(true);
    expect(cols[0].deals.map((d) => d.id)).toEqual([11, 12]);
  });

  it("toont geen fallback-kolom zonder wees-deals", () => {
    const cols = buildColumns([stage(1, "Lead")], [deal(10, 1, 1)]);
    expect(cols.some((c) => c.isFallback)).toBe(false);
  });
});

describe("positionBetween", () => {
  it("kiest het midden tussen buren", () => {
    expect(positionBetween(100, 200)).toBe(150);
  });
  it("plakt achteraan met vaste stap", () => {
    expect(positionBetween(100, null)).toBe(1124);
  });
  it("plaatst vóór de eerste kaart", () => {
    expect(positionBetween(null, 100)).toBe(50);
  });
  it("geeft een positieve waarde op een leeg bord", () => {
    expect(positionBetween(null, null)).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4:** Run → FAIL. **Step 5: Implementatie** `src/modules/crm/views/pipeline/lib.ts`:

```ts
import type { Deal, DealStage } from "@/payload-types";

export const GEEN_FASE = "geen-fase" as const;

export type BoardColumn = {
  id: string;
  naam: string;
  kleur: string;
  isFallback: boolean;
  deals: Deal[];
};

export function relationId(value: Deal["fase"]): string | null {
  if (value == null) return null;
  return String(typeof value === "object" ? value.id : value);
}

/** Kolommen voor het board: fases in volgorde + fallback vooraan bij wezen (AppFlowy-patroon). */
export function buildColumns(
  stages: DealStage[],
  deals: Deal[],
): BoardColumn[] {
  const stageIds = new Set(stages.map((s) => String(s.id)));
  const perFase = new Map<string, Deal[]>();
  const wezen: Deal[] = [];
  for (const d of deals) {
    const faseId = relationId(d.fase);
    if (faseId && stageIds.has(faseId)) {
      perFase.set(faseId, [...(perFase.get(faseId) ?? []), d]);
    } else {
      wezen.push(d);
    }
  }
  const opPositie = (a: Deal, b: Deal) => (a.position ?? 0) - (b.position ?? 0);
  const kolommen: BoardColumn[] = stages.map((s) => ({
    id: String(s.id),
    naam: s.naam,
    kleur: s.kleur,
    isFallback: false,
    deals: (perFase.get(String(s.id)) ?? []).sort(opPositie),
  }));
  if (wezen.length > 0) {
    kolommen.unshift({
      id: GEEN_FASE,
      naam: "Geen fase",
      kleur: "grijs",
      isFallback: true,
      deals: wezen.sort(opPositie),
    });
  }
  return kolommen;
}

/** Nieuwe kaartpositie tussen buren (Twenty-patroon: fractional, geen hernummering). */
export function positionBetween(
  prev?: number | null,
  next?: number | null,
): number {
  if (prev != null && next != null) return (prev + next) / 2;
  if (prev != null) return prev + 1024;
  if (next != null) return next / 2;
  return Date.now();
}
```

- [ ] **Step 6:** Run → PASS (7 tests). Volledige suite + check + commit: `Pipeline-board: pure kolom- en positielogica (fallback 'Geen fase')`.

---

### Task 2: Pipeline-view + client-board met drag & drop

**Files:**
- Create: `src/modules/crm/views/pipeline/PipelineView.tsx` (server)
- Create: `src/modules/crm/views/pipeline/PipelineBoard.tsx` (client)
- Create: `src/modules/crm/views/pipeline/pipeline.scss`
- Create: `src/modules/crm/api.ts` (dunne REST-laag)
- Modify: `src/payload.config.ts` (view + navlink registreren)
- Create: `src/components/admin/PipelineNavLink.tsx`

**Interfaces:**
- Consumes: `buildColumns`/`positionBetween`/`GEEN_FASE` (Task 1); REST `/api/deals`, `/api/deal-stages` met admin-cookie.
- Produces: view op `/admin/pipeline`; `crmApi = { updateDeal(id, data), createStage(data), updateStage(id, data), trashStage(id) }` in `src/modules/crm/api.ts` — Task 3 gebruikt de stage-functies.

- [ ] **Step 1: REST-laag** `src/modules/crm/api.ts`:

```ts
import type { Deal, DealStage } from "@/payload-types";

async function req<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const tekst = await res.text().catch(() => "");
    throw new Error(`${method} ${url} → ${res.status}: ${tekst.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export const crmApi = {
  updateDeal: (id: Deal["id"], data: Partial<Deal>) =>
    req<{ doc: Deal }>(`/api/deals/${id}`, "PATCH", data),
  createStage: (data: Pick<DealStage, "naam" | "kleur">) =>
    req<{ doc: DealStage }>(`/api/deal-stages`, "POST", data),
  updateStage: (id: DealStage["id"], data: Partial<DealStage>) =>
    req<{ doc: DealStage }>(`/api/deal-stages/${id}`, "PATCH", data),
  trashStage: (id: DealStage["id"]) =>
    req<{ doc: DealStage }>(`/api/deal-stages/${id}`, "PATCH", {
      deletedAt: new Date().toISOString(),
    }),
};
```

- [ ] **Step 2: Server-view** `PipelineView.tsx` — haalt fases (sort `_order`) en open deals (limit 500, depth 1) op, rendert binnen `DefaultTemplate` uit `@payloadcms/next/templates` + `Gutter` uit `@payloadcms/ui`, geeft `isBeheerder` door. (Exacte props van `DefaultTemplate` bij implementatie verifiëren in `node_modules/@payloadcms/next/dist/templates`.)

- [ ] **Step 3: Client-board** `PipelineBoard.tsx` — `"use client"`; eigen `QueryClientProvider`; queries `["pipeline","stages"]` en `["pipeline","deals"]` met initialData; `buildColumns` voor rendering; `<DragDropContext onDragEnd>` → `crmApi.updateDeal(id, { fase, position })` met optimistic update (cache muteren, rollback bij error); kaart toont titel, organisatienaam, bedrag (€), eigenaar-initialen; klik op kaart → `/admin/collections/deals/{id}`; "+ kaart" onderaan elke kolom → `/admin/collections/deals/create`. Fallback-kolom (`GEEN_FASE`) accepteert drops → `fase: null`.

- [ ] **Step 4: Styling** `pipeline.scss` op Payload-vars (`--theme-elevation-*`, `--theme-text`), kolombreedte 280px, horizontaal scrollend board, kleurtokens (groen→`#22c55e` e.d.) als CSS-classes `.hm-kleur-<token>` voor kolomstippen.

- [ ] **Step 5: Registreren** in `payload.config.ts`:

```ts
  admin: {
    components: {
      views: {
        pipeline: {
          Component: "/modules/crm/views/pipeline/PipelineView#PipelineView",
          path: "/pipeline",
        },
      },
      afterNavLinks: ["/components/admin/PipelineNavLink#PipelineNavLink"],
      // ...bestaande graphics
    },
  },
```

`PipelineNavLink.tsx`: link "Pipeline" naar `/admin/pipeline` in admin-stijl.

- [ ] **Step 6:** `npm run generate:importmap && npm run check` → groen; browser-check `/admin/pipeline` (kolommen, kaart slepen werkt, fallback verschijnt bij deal zonder fase). Commit: `Pipeline-board: kanban-view met drag & drop en Geen fase-fallback`.

---

### Task 3: Kolommenbeheer op het board

**Files:**
- Modify: `src/modules/crm/views/pipeline/PipelineBoard.tsx` (+ subcomponent `ColumnHeader`)

Gedrag (alleen zichtbaar voor beheerder, AppFlowy-UX):
- **"+ Fase"**-knop rechts naast de laatste kolom → `crmApi.createStage({ naam: "Nieuwe fase", kleur: "grijs" })`, titel direct in edit-modus.
- **Inline hernoemen**: klik op kolomtitel → tekstveld, Enter/blur → `crmApi.updateStage(id, { naam })`.
- **Verwijderen**: prullenbak-icoon in kolomkop → bevestiging met kaart-aantal ("3 kaarten vallen terug naar 'Geen fase'. Fase verwijderen?") → `crmApi.trashStage(id)` → stages-query invalideren (kaarten verschijnen vanzelf in de fallback-kolom, geen dataverlies; herstellen kan via de Prullenbak van Pipeline-fases).
- Fallback-kolom heeft geen beheer-knoppen.

- [ ] **Step 1:** ColumnHeader-component met de drie acties + bevestiging. **Step 2:** browser-check (toevoegen, hernoemen, verwijderen → kaarten vallen terug). **Step 3:** `npm run check` + commit: `Pipeline-board: kolommen toevoegen/hernoemen/verwijderen op het board (beheerder)`.

---

### Task 4: Activiteiten-timeline op detailschermen

**Files:**
- Modify: `src/modules/shared/collections/Activities.ts` (+ `samenvatting` text-veld)
- Modify: `src/modules/crm/hooks/logDealStatusChange.ts` (fase-namen opslaan)
- Create: `src/components/admin/Timeline.tsx` (client ui-veld)
- Modify: `Deals.ts`, `Organisations.ts`, `Contacts.ts` (ui-veld toevoegen)
- Test: uitbreiding `tests/int/crm-activities.test.ts`

Gedrag: ui-veld onderaan het bewerkscherm; haalt via REST de activiteiten voor dít document op (polymorf where op `targets`), nieuwste eerst; toont per regel type-icoon, tekst (samenvatting of leesbare statuswijziging "Fase: Lead → Klant"), auteur en datum; invoerveldje "Notitie toevoegen…" → POST `/api/activities` (type notitie, samenvatting, target = dit document) → lijst ververst.

- [ ] **Step 1: Falende test** — hook slaat nu ook namen op:

```ts
  it("statuswijziging bevat leesbare fase-namen", async () => {
    const faseA = await payload.create({ collection: "deal-stages", data: { naam: "Naam A", kleur: "blauw" } });
    const faseB = await payload.create({ collection: "deal-stages", data: { naam: "Naam B", kleur: "groen" } });
    const deal = await payload.create({
      collection: "deals",
      data: { titel: "Labeltest", uitkomst: "open", fase: faseA.id },
      overrideAccess: false, user: teamlid,
    });
    await payload.update({
      collection: "deals", id: deal.id, data: { fase: faseB.id },
      overrideAccess: false, user: teamlid,
    });
    const log = await activitiesVoorDeal(deal.id);
    const props = log.docs[0].properties as { fase?: { vanNaam?: string; naarNaam?: string } };
    expect(props.fase?.vanNaam).toBe("Naam A");
    expect(props.fase?.naarNaam).toBe("Naam B");
  });
```

- [ ] **Step 2:** Hook uitbreiden (fase-namen via `req.payload.findByID` op deal-stages, `trash: true` zodat ook verwijderde fases een naam houden); `samenvatting`-veld toevoegen; hook zet samenvatting "Fase: A → B" / "Uitkomst: open → gewonnen". **Step 3:** types + tests PASS. **Step 4:** Timeline-component + ui-velden + `generate:importmap`. **Step 5:** browser-check op een deal. **Step 6:** volledige suite + check + commit: `Timeline op detailschermen + leesbare statuswijzigingen en notities`.

---

### Task 5: Nieuwsbriefstatus op de contactkaart

**Files:**
- Create: `src/components/admin/NieuwsbriefStatus.tsx`
- Modify: `src/modules/crm/collections/Contacts.ts` (ui-veld naast e-mail)

Gedrag: client-component leest het e-mailveld (`useFormFields`), zoekt via REST in `subscribers` (exacte match) en toont "Aangemeld voor nieuwsbrief ✓" / "Niet aangemeld". Subscribers-read-access verifiëren; zo nodig read voor ingelogden toestaan (was publiek-create, read admin-only is prima → authenticated read toevoegen).

- [ ] **Step 1:** Component + veld + importmap. **Step 2:** browser-check met bestaand subscriber-adres. **Step 3:** check + commit: `Contactkaart: nieuwsbriefstatus-lookup op e-mailadres`.

---

### Task 6: QA-ronde + docs + push

- [ ] **Step 1:** Browser-QA volledige flow: org aanmaken → deal → board verslepen → timeline toont statuswijziging → notitie toevoegen → kolom hernoemen/toevoegen/verwijderen → fallback. **Step 2:** SKILL.md-sectie fase 2b (board, timeline, api-laag, importmap-flow). **Step 3:** `npm test && npm run check`, commit, `git push origin master`.
