import { describe, expect, it } from "vitest";

import {
  buildColumns,
  GEEN_FASE,
  positionBetween,
} from "@/modules/crm/views/pipeline/lib";
import type { Deal, DealStage } from "@/payload-types";

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
