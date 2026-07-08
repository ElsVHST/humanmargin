import type { CollectionConfig } from "payload";

import { Contacts } from "@/modules/crm/collections/Contacts";
import { DealStages } from "@/modules/crm/collections/DealStages";
import { Organisations } from "@/modules/crm/collections/Organisations";

export const crmCollections: CollectionConfig[] = [
  Organisations,
  Contacts,
  DealStages,
];
