import { makeColumnCollection } from "@/modules/shared/columnCollection";

/** Door Els beheerbare sectorenlijst (MKB-plan B3) — create-on-type
    door elk teamlid; hernoemen/verwijderen alleen beheerder. */
export const Sectoren = {
  ...makeColumnCollection({
    slug: "sectoren",
    singular: "Sector",
    plural: "Sectoren",
    group: "CRM",
    defaultKleur: "grijs",
    createRol: "teamlid",
  }),
  typescript: { interface: "Sector" },
};
