import type { ContentItem } from "@/payload-types";

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

/** Dunne, getypeerde REST-laag voor de content-views. */
export const contentApi = {
  updateItem: (id: ContentItem["id"], data: Partial<ContentItem>) =>
    req<{ doc: ContentItem }>(`/api/content-items/${id}`, "PATCH", data),
};
