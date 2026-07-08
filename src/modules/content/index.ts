import type { CollectionConfig } from "payload";

import { ContentChannels } from "@/modules/content/collections/ContentChannels";
import { ContentItems } from "@/modules/content/collections/ContentItems";

export const contentCollections: CollectionConfig[] = [
  ContentItems,
  ContentChannels,
];
