import type { Media } from "@/payload-types";

/**
 * Payload upload-velden zijn `number | Media` (id of gepopuleerd object).
 * Blocks renderen alleen gepopuleerde media; helpers hieronder maken dat veilig.
 */
export function asMedia(value: number | Media | null | undefined): Media | null {
  return value && typeof value === "object" ? value : null;
}

export function mediaUrl(value: number | Media | null | undefined): string | null {
  const media = asMedia(value);
  return media?.url ?? null;
}

export function mediaAlt(value: number | Media | null | undefined): string {
  return asMedia(value)?.alt ?? "";
}
