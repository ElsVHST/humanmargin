import type { LucideIcon } from "lucide-react";
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
} from "lucide-react";

import type { KnowledgeDoc, KnowledgeFile } from "@/payload-types";

/** Visuele identiteit per itemtype (myDrive-patroon: kleur + label + icoon). */
export type ItemType = {
  label: string;
  kleur: string;
  Icoon: LucideIcon;
};

export function bestandVan(doc: KnowledgeDoc): KnowledgeFile | null {
  const b = doc.bestand;
  if (b && typeof b === "object") return b;
  return null;
}

export function extensie(naam?: string | null): string | null {
  if (!naam) return null;
  const punt = naam.lastIndexOf(".");
  if (punt <= 0 || punt === naam.length - 1) return null;
  return naam.slice(punt + 1).toUpperCase();
}

const TYPE_MAP: ItemType = { label: "MAP", kleur: "#3b82f6", Icoon: Folder };
const TYPE_DOC: ItemType = { label: "DOC", kleur: "#2f6fed", Icoon: FileText };

/** Bepaal label/kleur/icoon van een item; mimeType eerst, extensie als vangnet. */
export function itemType(doc: KnowledgeDoc, isMap: boolean): ItemType {
  if (isMap) return TYPE_MAP;
  if (doc.soort !== "bestand") return TYPE_DOC;

  const file = bestandVan(doc);
  const mime = file?.mimeType ?? "";
  const ext = extensie(file?.filename ?? doc.titel) ?? "BESTAND";

  if (mime.startsWith("image/")) {
    return { label: ext, kleur: "#12a566", Icoon: FileImage };
  }
  if (mime.startsWith("video/")) {
    return { label: ext, kleur: "#7c5cf0", Icoon: FileVideo };
  }
  if (mime.startsWith("audio/")) {
    return { label: ext, kleur: "#0d9aa8", Icoon: FileAudio };
  }
  if (mime === "application/pdf" || ext === "PDF") {
    return { label: "PDF", kleur: "#d6336c", Icoon: FileText };
  }
  if (
    /zip|rar|7z|tar|gzip/.test(mime) ||
    ["ZIP", "RAR", "7Z", "TAR", "GZ"].includes(ext)
  ) {
    return { label: ext, kleur: "#e08a12", Icoon: FileArchive };
  }
  if (
    /word|document|text|rtf/.test(mime) ||
    ["DOC", "DOCX", "TXT", "MD", "RTF"].includes(ext)
  ) {
    return { label: ext, kleur: "#2f6fed", Icoon: FileText };
  }
  return { label: ext, kleur: "#5b6472", Icoon: File };
}

/** Thumbnail-URL voor afbeeldingsbestanden (Payload-imageSize), anders null. */
export function thumbnailUrl(doc: KnowledgeDoc): string | null {
  const file = bestandVan(doc);
  if (!file || !file.mimeType?.startsWith("image/")) return null;
  return file.sizes?.thumbnail?.url ?? file.url ?? null;
}

/** Bestandsgrootte leesbaar (nl): 163,9 kB / 1,2 MB. */
export function bestandGrootte(bytes?: number | null): string | null {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toLocaleString("nl-NL", { maximumFractionDigits: 1 })} kB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toLocaleString("nl-NL", { maximumFractionDigits: 1 })} MB`;
  const gb = mb / 1024;
  return `${gb.toLocaleString("nl-NL", { maximumFractionDigits: 1 })} GB`;
}
