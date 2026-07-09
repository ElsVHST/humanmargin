/** Veldtypes voor Els's eigen CRM-velden (MKB-plan B4) — client-safe
    gedeeld tussen de collection-config en de beheer-UI. */
export const VELD_TYPES = [
  { label: "Tekst", value: "tekst" },
  { label: "Tekstvak", value: "tekstvak" },
  { label: "Getal", value: "getal" },
  { label: "Datum", value: "datum" },
  { label: "Ja/nee", value: "janee" },
  { label: "Keuzelijst", value: "select" },
  { label: "Meerkeuze", value: "multiselect" },
  { label: "Link", value: "link" },
] as const;
