import type { CollectionConfig } from "payload";

import { DealStages } from "@/modules/crm/collections/DealStages";
import { Organisations } from "@/modules/crm/collections/Organisations";

export const crmCollections: CollectionConfig[] = [Organisations, DealStages];
