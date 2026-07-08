import type { CollectionConfig } from "payload";

import { Contacts } from "@/modules/crm/collections/Contacts";
import { Deals } from "@/modules/crm/collections/Deals";
import { DealStages } from "@/modules/crm/collections/DealStages";
import { Organisations } from "@/modules/crm/collections/Organisations";

export const crmCollections: CollectionConfig[] = [
  Organisations,
  Contacts,
  Deals,
  DealStages,
];
