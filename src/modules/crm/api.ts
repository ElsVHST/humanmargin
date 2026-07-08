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

/**
 * Dunne, getypeerde REST-laag voor de CRM-views (spec §2: views praten nooit
 * rechtstreeks met endpoints). Authenticatie loopt via de admin-sessiecookie.
 */
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
