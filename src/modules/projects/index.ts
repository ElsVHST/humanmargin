import type { CollectionConfig } from "payload";

import { ProjectFases } from "@/modules/projects/collections/ProjectFases";
import { Projects } from "@/modules/projects/collections/Projects";
import { Tasks } from "@/modules/projects/collections/Tasks";
import { TaskStatuses } from "@/modules/projects/collections/TaskStatuses";

export const projectsCollections: CollectionConfig[] = [
  Projects,
  Tasks,
  TaskStatuses,
  ProjectFases,
];
