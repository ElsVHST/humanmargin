import type { CollectionConfig, Field } from "payload";

import { isAuthenticated, isBeheerder } from "@/modules/shared/access";

/**
 * Kleurenpalet voor kolommen (boards renderen deze tokens naar CSS).
 * Referentie: Twenty's stage-kleuren (docs/research/dashboard/twenty.md §4).
 */
export const kleurOpties = [
  { label: "Groen", value: "groen" },
  { label: "Blauw", value: "blauw" },
  { label: "Paars", value: "paars" },
  { label: "Rood", value: "rood" },
  { label: "Oranje", value: "oranje" },
  { label: "Geel", value: "geel" },
  { label: "Turquoise", value: "turquoise" },
  { label: "Roze", value: "roze" },
  { label: "Grijs", value: "grijs" },
] as const;

export type Kleur = (typeof kleurOpties)[number]["value"];

export type ColumnCollectionOpts = {
  slug: string;
  singular: string;
  plural: string;
  group: string;
  defaultKleur?: Kleur;
  extraFields?: Field[];
  /** "teamlid" = elk ingelogd teamlid mag aanmaken (create-on-type in
      comboboxen, bv. sectoren/functies); beheren blijft beheerder-only. */
  createRol?: "beheerder" | "teamlid";
};

/**
 * Factory voor door Els beheerbare kolom-collecties (pipeline-fases,
 * taakstatussen, contentkanalen). Gedrag per spec §4:
 * - orderable: kolomvolgorde via slepen (Payload fractional indexing)
 * - trash: verwijderen = prullenbak; boards vangen wees-kaarten op in
 *   een virtuele fallback-kolom
 * - alleen beheerders beheren kolommen; iedereen (ingelogd) leest ze
 */
export function makeColumnCollection(
  opts: ColumnCollectionOpts,
): CollectionConfig {
  return {
    slug: opts.slug,
    labels: { singular: opts.singular, plural: opts.plural },
    orderable: true,
    trash: true,
    access: {
      read: isAuthenticated,
      create: opts.createRol === "teamlid" ? isAuthenticated : isBeheerder,
      update: isBeheerder,
      delete: isBeheerder,
    },
    admin: {
      useAsTitle: "naam",
      defaultColumns: ["naam", "kleur"],
      group: opts.group,
    },
    fields: [
      { name: "naam", label: "Naam", type: "text", required: true },
      {
        name: "kleur",
        label: "Kleur",
        type: "select",
        required: true,
        defaultValue: opts.defaultKleur ?? "grijs",
        options: [...kleurOpties],
      },
      ...(opts.extraFields ?? []),
    ],
  };
}
