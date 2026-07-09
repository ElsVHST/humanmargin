import { makeColumnCollection } from "@/modules/shared/columnCollection";

/** Fases voor het projecten-kanban (projecten-ERP-plan P1) — door Els
    beheerbaar via het kolommenbeheer, zoals deal-stages. */
export const ProjectFases = {
  ...makeColumnCollection({
    slug: "project-fases",
    singular: "Projectfase",
    plural: "Projectfases",
    group: "Projecten",
    defaultKleur: "blauw",
  }),
  typescript: { interface: "ProjectFase" },
};
