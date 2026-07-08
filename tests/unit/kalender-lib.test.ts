import { describe, expect, it } from "vitest";

import {
  itemsPerDag,
  maandGrid,
  weekDagen,
} from "@/modules/content/views/kalender/lib";
import type { ContentItem } from "@/payload-types";

const item = (id: number, publishDate: string | null): ContentItem =>
  ({ id, titel: `Item ${id}`, status: "idee", publishDate }) as ContentItem;

describe("maandGrid", () => {
  it("levert 42 dagen, start op maandag", () => {
    const dagen = maandGrid(2026, 6); // juli 2026 (0-based maand)
    expect(dagen).toHaveLength(42);
    expect(dagen[0].getDay()).toBe(1); // maandag
    // 1 juli 2026 is een woensdag → grid start op maandag 29 juni
    expect(dagen[0].getDate()).toBe(29);
    expect(dagen[0].getMonth()).toBe(5);
  });

  it("bevat alle dagen van de maand zelf", () => {
    const dagen = maandGrid(2026, 6);
    const juliDagen = dagen.filter((d) => d.getMonth() === 6);
    expect(juliDagen).toHaveLength(31);
  });
});

describe("weekDagen", () => {
  it("levert 7 dagen vanaf maandag rond de gegeven datum", () => {
    const dagen = weekDagen(new Date(2026, 6, 8)); // woensdag 8 juli
    expect(dagen).toHaveLength(7);
    expect(dagen[0].getDate()).toBe(6); // maandag 6 juli
    expect(dagen[6].getDate()).toBe(12); // zondag 12 juli
  });
});

describe("itemsPerDag", () => {
  it("groepeert op lokale dag en sorteert op tijd", () => {
    const items = [
      item(1, "2026-07-08T14:00:00.000Z"),
      item(2, "2026-07-08T08:00:00.000Z"),
      item(3, "2026-07-09T09:00:00.000Z"),
      item(4, null),
    ];
    const map = itemsPerDag(items);
    const dag8 = map.get("2026-07-08") ?? [];
    expect(dag8.map((i) => i.id)).toEqual([2, 1]);
    expect(map.get("2026-07-09")?.map((i) => i.id)).toEqual([3]);
    // Zonder publishDate: niet in de map
    expect([...map.values()].flat().some((i) => i.id === 4)).toBe(false);
  });
});
