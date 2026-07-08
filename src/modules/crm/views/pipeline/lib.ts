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
