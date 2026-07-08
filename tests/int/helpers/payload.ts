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
