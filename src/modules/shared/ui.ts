/**
 * Gedeelde UI-helpers voor de dashboard-views (avatars, initialen).
 * Kleurtokens komen overeen met de semantische laag in dashboard.scss.
 */

const AVATAR_PALET = [
  "#2f6fed",
  "#7c5cf0",
  "#e08a12",
  "#12a566",
  "#e2465f",
  "#0d9aa8",
  "#d4438a",
  "#5b6472",
] as const;

/** Initialen uit een naam (max 2 letters). */
export function initialen(naam?: string | null): string {
  if (!naam) return "?";
  const letters = naam
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return letters || "?";
}

/** Bedrag als euro zonder decimalen (nl-NL), null-veilig. */
export function euro(bedrag?: number | null): string | null {
  if (bedrag == null) return null;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(bedrag);
}

/** Deterministische avatarkleur op basis van een stabiele seed (id of naam). */
export function avatarKleur(seed?: string | number | null): string {
  const s = String(seed ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALET[h % AVATAR_PALET.length];
}

/** Naam van een gepopuleerde relatie (sector/functie/kolom-docs); null bij
    depth-0 id's of lege relaties — caller toont dan "—" of lost zelf op. */
export function naamVan(rel: unknown): string | null {
  if (rel && typeof rel === "object" && "naam" in rel) {
    return (rel as { naam: string }).naam;
  }
  return null;
}
