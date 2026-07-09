import type { CollectionConfig } from "payload";

import { KnowledgeDocs } from "@/modules/knowledge/collections/KnowledgeDocs";
import { KnowledgeFiles } from "@/modules/knowledge/collections/KnowledgeFiles";

export const knowledgeCollections: CollectionConfig[] = [
  KnowledgeDocs,
  KnowledgeFiles,
];
