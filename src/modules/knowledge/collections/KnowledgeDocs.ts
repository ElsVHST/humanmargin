import type { CollectionConfig } from "payload";

import { dashboardCollectionAccess } from "@/modules/shared/access";
import { tagsField } from "@/modules/shared/fields";
import {
  lexicalNaarMarkdown,
  markdownNaarLexical,
  vindKennisbankDocIds,
  vindWikilinkTitels,
} from "@/modules/knowledge/wiki/wikiMarkdown";
import type { KnowledgeDoc } from "@/payload-types";

export const KnowledgeDocs: CollectionConfig = {
  slug: "knowledge-docs",
  labels: { singular: "Kennisdocument", plural: "Kennisdocumenten" },
  trash: true,
  access: dashboardCollectionAccess,
  hooks: {
    // Definitief verwijderd bestand-doc → ruim het fysieke bestand mee op
    afterDelete: [
      async ({ doc, req }) => {
        const bestand = doc?.bestand;
        const id =
          bestand && typeof bestand === "object" ? bestand.id : bestand;
        if (!id) return;
        try {
          await req.payload.delete({ collection: "knowledge-files", id, req });
        } catch (fout) {
          req.payload.logger.error(
            `Wees-bestand ${id} opruimen mislukt: ${String(fout)}`,
          );
        }
      },
    ],
  },
  admin: {
    useAsTitle: "titel",
    defaultColumns: ["titel", "parent", "zichtbaarheid", "updatedAt"],
    group: "Kennisbank",
  },
  endpoints: [
    {
      // GET /api/knowledge-docs/:id/md — kennisdocument als markdown lezen
      // (agents/Hermes/seeds werken in markdown; opslag blijft Lexical).
      path: "/:id/md",
      method: "get",
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ fout: "Niet ingelogd" }, { status: 401 });
        }

        const id = Number(req.routeParams?.id);
        if (!Number.isFinite(id)) {
          return Response.json(
            { fout: "Ongeldig document-id" },
            { status: 400 },
          );
        }

        const doc = await req.payload.findByID({
          collection: "knowledge-docs",
          id,
          overrideAccess: false,
          user: req.user,
          disableErrors: true,
          req,
        });
        if (!doc) {
          return Response.json(
            { fout: "Kennisdocument niet gevonden" },
            { status: 404 },
          );
        }

        // resolveId zonder alle wiki-docs te bevragen: alleen de doc-ids
        // ophalen die daadwerkelijk als link in deze state voorkomen.
        const docIds = vindKennisbankDocIds(doc.inhoud);
        const titelPerId = new Map<number, string>();
        if (docIds.length > 0) {
          const gekoppeld = await req.payload.find({
            collection: "knowledge-docs",
            where: { id: { in: docIds } },
            limit: docIds.length,
            overrideAccess: false,
            user: req.user,
            req,
          });
          for (const gevonden of gekoppeld.docs) {
            titelPerId.set(gevonden.id, gevonden.titel);
          }
        }

        const markdown = await lexicalNaarMarkdown(doc.inhoud, (docId) =>
          titelPerId.get(docId) ?? null,
        );

        return Response.json({
          id: doc.id,
          titel: doc.titel,
          soort: doc.soort,
          markdown,
        });
      },
    },
    {
      // PATCH /api/knowledge-docs/:id/md — kennisdocument bijwerken vanuit markdown
      path: "/:id/md",
      method: "patch",
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ fout: "Niet ingelogd" }, { status: 401 });
        }

        const id = Number(req.routeParams?.id);
        if (!Number.isFinite(id)) {
          return Response.json(
            { fout: "Ongeldig document-id" },
            { status: 400 },
          );
        }

        let body: unknown;
        try {
          body = await req.json?.();
        } catch {
          return Response.json(
            { fout: "Ongeldige JSON-body" },
            { status: 400 },
          );
        }
        const markdown =
          body && typeof body === "object" && "markdown" in body
            ? (body as { markdown: unknown }).markdown
            : undefined;
        if (typeof markdown !== "string") {
          return Response.json(
            { fout: "Body moet { markdown: string } bevatten" },
            { status: 400 },
          );
        }

        const bestaat = await req.payload.findByID({
          collection: "knowledge-docs",
          id,
          overrideAccess: false,
          user: req.user,
          disableErrors: true,
          req,
        });
        if (!bestaat) {
          return Response.json(
            { fout: "Kennisdocument niet gevonden" },
            { status: 404 },
          );
        }

        // resolveTitel: één find op alle [[titels]] die in de markdown voorkomen.
        const titels = vindWikilinkTitels(markdown);
        const idPerTitel = new Map<string, number>();
        if (titels.length > 0) {
          const gekoppeld = await req.payload.find({
            collection: "knowledge-docs",
            where: { titel: { in: titels } },
            limit: titels.length,
            overrideAccess: false,
            user: req.user,
            req,
          });
          for (const gevonden of gekoppeld.docs) {
            idPerTitel.set(gevonden.titel, gevonden.id);
          }
        }

        let inhoud: KnowledgeDoc["inhoud"];
        try {
          inhoud = (await markdownNaarLexical(markdown, (titel) =>
            idPerTitel.get(titel) ?? null,
          )) as unknown as KnowledgeDoc["inhoud"];
        } catch (fout) {
          return Response.json(
            {
              fout: `Kon markdown niet omzetten: ${fout instanceof Error ? fout.message : String(fout)}`,
            },
            { status: 400 },
          );
        }

        await req.payload.update({
          collection: "knowledge-docs",
          id,
          data: { inhoud },
          overrideAccess: false,
          user: req.user,
          req,
        });

        return Response.json({ id, bijgewerkt: true });
      },
    },
  ],
  fields: [
    { name: "titel", label: "Titel", type: "text", required: true },
    {
      // Expliciet itemtype (myDrive-patroon); bestaande docs = "document"
      name: "soort",
      label: "Soort",
      type: "select",
      required: true,
      defaultValue: "document",
      options: [
        { label: "Map", value: "map" },
        { label: "Document", value: "document" },
        { label: "Bestand", value: "bestand" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "inhoud", label: "Inhoud", type: "richText" },
    {
      name: "bestand",
      label: "Bestand",
      type: "upload",
      relationTo: "knowledge-files",
      admin: {
        condition: (data) => data?.soort === "bestand",
        description: "Het geüploade bestand (alleen bij soort 'Bestand').",
      },
    },
    {
      name: "parent",
      label: "Hoort onder",
      type: "relationship",
      relationTo: "knowledge-docs",
      admin: {
        position: "sidebar",
        description: "Leeg = hoofdstuk op het hoogste niveau.",
      },
    },
    {
      name: "zichtbaarheid",
      label: "Zichtbaarheid",
      type: "select",
      required: true,
      defaultValue: "intern",
      options: [
        { label: "Intern (alleen team)", value: "intern" },
        { label: "Publiek (later op de site)", value: "publiek" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "organisatie",
      label: "Organisatie",
      type: "relationship",
      relationTo: "organisations",
      admin: { position: "sidebar" },
    },
    {
      name: "project",
      label: "Project",
      type: "relationship",
      relationTo: "projects",
      admin: { position: "sidebar" },
    },
    tagsField,
    {
      name: "auteur",
      label: "Auteur",
      type: "relationship",
      relationTo: "users",
      defaultValue: ({ user }) => user?.id,
      admin: { position: "sidebar" },
    },
    {
      // Sibling-volgorde in de boom (zelfde patroon als kaart-position)
      name: "position",
      label: "Positie",
      type: "number",
      index: true,
      admin: { hidden: true },
      hooks: {
        beforeChange: [({ value }) => (value == null ? Date.now() : value)],
      },
    },
  ],
};
