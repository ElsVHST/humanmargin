import type { Activity, Deal, DealStage } from "@/payload-types";

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
  getDeal: (id: Deal["id"] | string) =>
    // depth=2: contactpersoon.functie gepopuleerd voor het Gekoppeld-blok
    req<Deal>(`/api/deals/${id}?depth=2`, "GET"),
  createDeal: (data: Partial<Deal> & { titel: string }) =>
    req<{ doc: Deal }>(`/api/deals`, "POST", data),
  updateDeal: (id: Deal["id"], data: Partial<Deal>) =>
    req<{ doc: Deal }>(`/api/deals/${id}`, "PATCH", data),
  trashDeal: (id: Deal["id"]) =>
    req<{ doc: Deal }>(`/api/deals/${id}`, "PATCH", {
      deletedAt: new Date().toISOString(),
    }),
  listDealActiviteiten: (dealId: Deal["id"] | string) =>
    req<{ docs: Activity[] }>(
      `/api/activities?where[targets.relationTo][equals]=deals&where[targets.value][equals]=${dealId}&sort=-happensAt&limit=60&depth=1`,
      "GET",
    ),
  createDealNotitie: (dealId: Deal["id"], samenvatting: string) =>
    req<{ doc: Activity }>(`/api/activities`, "POST", {
      type: "notitie",
      samenvatting,
      targets: [{ relationTo: "deals", value: dealId }],
      happensAt: new Date().toISOString(),
    }),
  createStage: (data: Pick<DealStage, "naam" | "kleur">) =>
    req<{ doc: DealStage }>(`/api/deal-stages`, "POST", data),
  updateStage: (id: DealStage["id"], data: Partial<DealStage>) =>
    req<{ doc: DealStage }>(`/api/deal-stages/${id}`, "PATCH", data),
  trashStage: (id: DealStage["id"]) =>
    req<{ doc: DealStage }>(`/api/deal-stages/${id}`, "PATCH", {
      deletedAt: new Date().toISOString(),
    }),
};
