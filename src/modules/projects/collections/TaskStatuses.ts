import { makeColumnCollection } from "@/modules/shared/columnCollection";

export const TaskStatuses = makeColumnCollection({
  slug: "task-statuses",
  singular: "Taakstatus",
  plural: "Taakstatussen",
  group: "Projecten",
  defaultKleur: "grijs",
});
