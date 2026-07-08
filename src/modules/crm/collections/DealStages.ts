import { makeColumnCollection } from "@/modules/shared/columnCollection";

export const DealStages = makeColumnCollection({
  slug: "deal-stages",
  singular: "Pipeline-fase",
  plural: "Pipeline-fases",
  group: "CRM",
  defaultKleur: "blauw",
});
