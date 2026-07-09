import type { CollectionConfig } from "payload";

import { Contacts } from "@/modules/crm/collections/Contacts";
import { CrmVelden } from "@/modules/crm/collections/CrmVelden";
import { Deals } from "@/modules/crm/collections/Deals";
import { DealStages } from "@/modules/crm/collections/DealStages";
import { Functies } from "@/modules/crm/collections/Functies";
import { Organisations } from "@/modules/crm/collections/Organisations";
import { Sectoren } from "@/modules/crm/collections/Sectoren";

export const crmCollections: CollectionConfig[] = [
  Organisations,
  Contacts,
  Deals,
  DealStages,
  Sectoren,
  Functies,
  CrmVelden,
];
