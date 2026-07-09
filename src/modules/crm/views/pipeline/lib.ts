import type { Deal, Task, TaskStatus, DealStage } from "@/payload-types";

export const GEEN_FASE = "geen-fase" as const;

type KolomBron = { id: number | string; naam: string; kleur: string };
type MetPositie = { position?: number | null };

export type GenericColumn<T> = {
  id: string;
  naam: string;
  kleur: string;
  isFallback: boolean;
  deals: T[];
};

export type BoardColumn = GenericColumn<Deal>;
export type TaskColumn = GenericColumn<Task>;

export function relationId(
  value: number | { id: number | string } | null | undefined,
): string | null {
  if (value == null) return null;
  return String(typeof value === "object" ? value.id : value);
}

/**
 * Generieke kolom-bouwer voor kanban-boards: bronnen (fases/statussen) in
 * volgorde + fallback-kolom vooraan zodra er wees-items zijn (AppFlowy-patroon).
 */
export function buildGenericColumns<T extends MetPositie>(
  bronnen: KolomBron[],
  items: T[],
  refVan: (item: T) => string | null,
  fallbackNaam: string,
): GenericColumn<T>[] {
  const bronIds = new Set(bronnen.map((b) => String(b.id)));
  const perKolom = new Map<string, T[]>();
  const wezen: T[] = [];
  for (const item of items) {
    const ref = refVan(item);
    if (ref && bronIds.has(ref)) {
      perKolom.set(ref, [...(perKolom.get(ref) ?? []), item]);
    } else {
      wezen.push(item);
    }
  }
  const opPositie = (a: T, b: T) => (a.position ?? 0) - (b.position ?? 0);
  const kolommen: GenericColumn<T>[] = bronnen.map((b) => ({
    id: String(b.id),
    naam: b.naam,
    kleur: b.kleur,
    isFallback: false,
    deals: (perKolom.get(String(b.id)) ?? []).sort(opPositie),
  }));
  if (wezen.length > 0) {
    kolommen.unshift({
      id: GEEN_FASE,
      naam: fallbackNaam,
      kleur: "grijs",
      isFallback: true,
      deals: wezen.sort(opPositie),
    });
  }
  return kolommen;
}

/** Kolommen voor het pipeline-board (deals per fase). */
export function buildColumns(
  stages: DealStage[],
  deals: Deal[],
): BoardColumn[] {
  return buildGenericColumns(
    stages,
    deals,
    (d) => relationId(d.fase),
    "Geen fase",
  );
}

/** Kolommen voor het taken-board (taken per status). */
export function buildTaskColumns(
  statussen: TaskStatus[],
  taken: Task[],
): TaskColumn[] {
  return buildGenericColumns(
    statussen,
    taken,
    (t) => relationId(t.status),
    "Geen status",
  );
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
