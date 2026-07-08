import type { ContentItem } from "@/payload-types";

/** Lokale dag-sleutel (YYYY-MM-DD) voor groeperen op kalenderdagen. */
export function dagSleutel(datum: Date): string {
  const j = datum.getFullYear();
  const m = String(datum.getMonth() + 1).padStart(2, "0");
  const d = String(datum.getDate()).padStart(2, "0");
  return `${j}-${m}-${d}`;
}

/** 42 dagen (6 weken) voor de maandweergave, startend op maandag. */
export function maandGrid(jaar: number, maand: number): Date[] {
  const eerste = new Date(jaar, maand, 1);
  // getDay(): zo=0 … za=6; wij starten op maandag
  const offset = (eerste.getDay() + 6) % 7;
  const start = new Date(jaar, maand, 1 - offset);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

/** 7 dagen (ma t/m zo) van de week waarin de datum valt. */
export function weekDagen(datum: Date): Date[] {
  const offset = (datum.getDay() + 6) % 7;
  const maandag = new Date(
    datum.getFullYear(),
    datum.getMonth(),
    datum.getDate() - offset,
  );
  return Array.from(
    { length: 7 },
    (_, i) =>
      new Date(maandag.getFullYear(), maandag.getMonth(), maandag.getDate() + i),
  );
}

/** Groepeert items op lokale dag (items zonder publishDate vallen buiten de map). */
export function itemsPerDag(items: ContentItem[]): Map<string, ContentItem[]> {
  const map = new Map<string, ContentItem[]>();
  for (const item of items) {
    if (!item.publishDate) continue;
    const sleutel = dagSleutel(new Date(item.publishDate));
    map.set(sleutel, [...(map.get(sleutel) ?? []), item]);
  }
  for (const [sleutel, lijst] of map) {
    map.set(
      sleutel,
      lijst.sort(
        (a, b) =>
          new Date(a.publishDate ?? 0).getTime() -
          new Date(b.publishDate ?? 0).getTime(),
      ),
    );
  }
  return map;
}
