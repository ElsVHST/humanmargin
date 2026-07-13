import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BasePayload } from "payload";
import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";

import {
  lexicalNaarMarkdown,
  markdownNaarLexical,
  vindKennisbankDocIds,
  vindWikilinkTitels,
} from "@/modules/knowledge/wiki/wikiMarkdown";
import type { KnowledgeDoc, User } from "@/payload-types";

const WIKI_ROOT_TITEL = "Platform-wiki";

/** Haalt de geauthenticeerde gebruiker uit de MCP-auth-context (of faalt hard). */
function huidigeGebruiker(authInfo: AuthInfo | undefined): User {
  const user = authInfo?.extra?.user as User | undefined;
  if (!user) throw new Error("Niet geauthenticeerd");
  return user;
}

/** Payload-Lexical → markdown, met [[wikilinks]] opgelost naar titels. */
async function docNaarMarkdown(
  payload: BasePayload,
  doc: KnowledgeDoc,
  user: User,
): Promise<string> {
  const docIds = vindKennisbankDocIds(doc.inhoud);
  const titelPerId = new Map<number, string>();
  if (docIds.length > 0) {
    const gekoppeld = await payload.find({
      collection: "knowledge-docs",
      where: { id: { in: docIds } },
      limit: docIds.length,
      overrideAccess: false,
      user,
    });
    for (const gevonden of gekoppeld.docs) titelPerId.set(gevonden.id, gevonden.titel);
  }
  return lexicalNaarMarkdown(doc.inhoud, (docId) => titelPerId.get(docId) ?? null);
}

/** Markdown → Payload-Lexical, met [[Titels]] opgelost naar doc-ids. */
async function markdownNaarInhoud(
  payload: BasePayload,
  markdown: string,
  user: User,
): Promise<KnowledgeDoc["inhoud"]> {
  const titels = vindWikilinkTitels(markdown);
  const idPerTitel = new Map<string, number>();
  if (titels.length > 0) {
    const gekoppeld = await payload.find({
      collection: "knowledge-docs",
      where: { titel: { in: titels } },
      limit: titels.length,
      overrideAccess: false,
      user,
    });
    for (const gevonden of gekoppeld.docs) idPerTitel.set(gevonden.titel, gevonden.id);
  }
  return (await markdownNaarLexical(markdown, (titel) =>
    idPerTitel.get(titel) ?? null,
  )) as unknown as KnowledgeDoc["inhoud"];
}

/** Zoekt een kennisdocument op id of exacte titel. */
async function vindDoc(
  payload: BasePayload,
  user: User,
  args: { id?: number; titel?: string },
): Promise<KnowledgeDoc | null> {
  if (args.id != null) {
    return payload.findByID({
      collection: "knowledge-docs",
      id: args.id,
      overrideAccess: false,
      user,
      disableErrors: true,
    });
  }
  if (args.titel) {
    const r = await payload.find({
      collection: "knowledge-docs",
      where: { titel: { equals: args.titel } },
      limit: 1,
      overrideAccess: false,
      user,
    });
    return r.docs[0] ?? null;
  }
  return null;
}

function tekst(payload: unknown) {
  return {
    content: [
      { type: "text" as const, text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2) },
    ],
  };
}

/**
 * Registreert de wiki-toolset op de MCP-server. Elke tool handelt als de
 * geauthenticeerde gebruiker (Hermes/Lottie), dus access-regels en tijdlijn-
 * attributie gelden net als in de UI.
 */
export function registerWikiTools(server: McpServer): void {
  server.registerTool(
    "wiki_index",
    {
      title: "Wiki-index",
      description:
        "Geeft de catalogus van de Platform-wiki (de Index-pagina) als markdown terug. Begin hier om te zien welke pagina's er zijn.",
      inputSchema: {},
    },
    async (_args, { authInfo }) => {
      const user = huidigeGebruiker(authInfo);
      const payload = await getPayload({ config });
      const doc = await vindDoc(payload, user, { titel: "Index" });
      if (!doc) return tekst("Geen Index-pagina gevonden.");
      return tekst(await docNaarMarkdown(payload, doc, user));
    },
  );

  server.registerTool(
    "wiki_search",
    {
      title: "Wiki doorzoeken",
      description:
        "Zoekt kennisdocumenten op titel (deelmatch). Geeft een lijst van {id, titel, soort} terug.",
      inputSchema: {
        query: z.string().describe("Zoekterm die in de titel voorkomt"),
        limit: z.number().int().min(1).max(50).default(20).describe("Max. aantal resultaten"),
      },
    },
    async ({ query, limit }, { authInfo }) => {
      const user = huidigeGebruiker(authInfo);
      const payload = await getPayload({ config });
      const r = await payload.find({
        collection: "knowledge-docs",
        where: { titel: { like: query } },
        limit,
        overrideAccess: false,
        user,
      });
      return tekst(
        r.docs.map((d) => ({ id: d.id, titel: d.titel, soort: d.soort })),
      );
    },
  );

  server.registerTool(
    "wiki_read",
    {
      title: "Wiki-pagina lezen",
      description:
        "Leest een kennisdocument als markdown. Geef een id of een exacte titel op.",
      inputSchema: {
        id: z.number().int().optional().describe("Document-id"),
        titel: z.string().optional().describe("Exacte titel (alternatief voor id)"),
      },
    },
    async ({ id, titel }, { authInfo }) => {
      const user = huidigeGebruiker(authInfo);
      const payload = await getPayload({ config });
      const doc = await vindDoc(payload, user, { id, titel });
      if (!doc) return tekst("Document niet gevonden.");
      const markdown = await docNaarMarkdown(payload, doc, user);
      return tekst({ id: doc.id, titel: doc.titel, soort: doc.soort, markdown });
    },
  );

  server.registerTool(
    "wiki_write",
    {
      title: "Wiki-pagina schrijven",
      description:
        "Werkt de inhoud van een bestaand kennisdocument bij vanuit markdown ([[Titel]]-links worden opgelost). Vereist het document-id.",
      inputSchema: {
        id: z.number().int().describe("Document-id om bij te werken"),
        markdown: z.string().describe("Nieuwe inhoud als markdown"),
      },
    },
    async ({ id, markdown }, { authInfo }) => {
      const user = huidigeGebruiker(authInfo);
      const payload = await getPayload({ config });
      const bestaat = await vindDoc(payload, user, { id });
      if (!bestaat) return tekst("Document niet gevonden.");
      const inhoud = await markdownNaarInhoud(payload, markdown, user);
      await payload.update({
        collection: "knowledge-docs",
        id,
        data: { inhoud },
        overrideAccess: false,
        user,
      });
      return tekst({ id, bijgewerkt: true });
    },
  );

  server.registerTool(
    "wiki_new",
    {
      title: "Wiki-pagina aanmaken",
      description:
        "Maakt een nieuw kennisdocument (soort 'document', zichtbaarheid 'intern') met markdown-inhoud. Optioneel onder een oudermap (parentId of parentTitel).",
      inputSchema: {
        titel: z.string().describe("Titel van de nieuwe pagina"),
        markdown: z.string().describe("Inhoud als markdown"),
        parentId: z.number().int().optional().describe("Id van de oudermap"),
        parentTitel: z.string().optional().describe("Exacte titel van de oudermap (alternatief voor parentId)"),
      },
    },
    async ({ titel, markdown, parentId, parentTitel }, { authInfo }) => {
      const user = huidigeGebruiker(authInfo);
      const payload = await getPayload({ config });

      let parent: number | undefined = parentId;
      if (parent == null && parentTitel) {
        const map = await vindDoc(payload, user, { titel: parentTitel });
        if (!map) return tekst(`Oudermap '${parentTitel}' niet gevonden.`);
        parent = map.id;
      }

      const inhoud = await markdownNaarInhoud(payload, markdown, user);
      const doc = await payload.create({
        collection: "knowledge-docs",
        data: {
          titel,
          soort: "document",
          zichtbaarheid: "intern",
          tags: ["wiki"],
          ...(parent != null ? { parent } : {}),
          inhoud,
        },
        overrideAccess: false,
        user,
      });
      return tekst({ id: doc.id, titel: doc.titel, aangemaakt: true });
    },
  );

  server.registerTool(
    "wiki_log",
    {
      title: "Wiki-logregel schrijven",
      description:
        "Schrijft een log-activity op de wiki-root (de tijdlijn). Gebruik een prefix ingest/lint/query zodat het logboek filterbaar blijft.",
      inputSchema: {
        samenvatting: z.string().describe("Korte samenvatting van wat er is gebeurd"),
        prefix: z.enum(["ingest", "lint", "query"]).optional().describe("Logboek-prefix"),
      },
    },
    async ({ samenvatting, prefix }, { authInfo }) => {
      const user = huidigeGebruiker(authInfo);
      const payload = await getPayload({ config });
      const root = await payload.find({
        collection: "knowledge-docs",
        where: {
          and: [{ titel: { equals: WIKI_ROOT_TITEL } }, { parent: { exists: false } }],
        },
        limit: 1,
        overrideAccess: false,
        user,
      });
      const rootDoc = root.docs[0];
      if (!rootDoc) return tekst("Wiki-root 'Platform-wiki' niet gevonden.");

      await payload.create({
        collection: "activities",
        data: {
          type: "log",
          samenvatting: prefix ? `[${prefix}] ${samenvatting}` : samenvatting,
          targets: [{ relationTo: "knowledge-docs", value: rootDoc.id }],
          happensAt: new Date().toISOString(),
        },
        overrideAccess: false,
        user,
      });
      return tekst({ gelogd: true });
    },
  );
}
