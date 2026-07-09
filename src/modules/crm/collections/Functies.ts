import { makeColumnCollection } from "@/modules/shared/columnCollection";

/** Door Els beheerbare functielijst voor contactpersonen (MKB-plan B3). */
export const Functies = {
  ...makeColumnCollection({
    slug: "functies",
    singular: "Functie",
    plural: "Functies",
    group: "CRM",
    defaultKleur: "grijs",
    createRol: "teamlid",
  }),
  typescript: { interface: "Functie" },
};
