# T2 — markdown↔Lexical-helper + `/md`-endpoints

**Bestanden:** `src/modules/knowledge/wiki/wikiMarkdown.ts` (nieuw) en `src/modules/knowledge/collections/KnowledgeDocs.ts` (ALLEEN een `endpoints`-array toevoegen aan de collectie-config — verander niets aan velden/hooks/access).
**PRD:** §2 B2/B3, fase 1.2.

## Doel

Agents (Hermes, Dottie, seeds) werken in markdown; de kennisbank slaat Lexical-JSON op. Deze taak levert de vertaallaag: server-side conversie in beide richtingen, met `[[wikilink]]`-ondersteuning, plus REST-endpoints om een kennisdocument als markdown te lezen en te schrijven.

## Deel 1 — `wikiMarkdown.ts`

De geïnstalleerde `@payloadcms/richtext-lexical` levert officiële converters — geverifieerd aanwezig in `node_modules/@payloadcms/richtext-lexical/dist/features/converters/markdownToLexical/` en `.../lexicalToMarkdown/`. Onderzoek de exacte export-namen en signaturen via de `.d.ts`-bestanden in `dist/exports/` en `dist/index.d.ts` (zoek naar `convertMarkdownToLexical` en `convertLexicalToMarkdown`) en de Payload-docs in `node_modules/@payloadcms/richtext-lexical/README.md` als die er is. De converters hebben een editor-config nodig — gebruik `editorConfigFactory` (zelfde package) met de app-config uit `@payload-config`, of de default-config-variant; kies wat de types toestaan. **Dit is server-only code** (import nooit in client components).

Exporteer:

```ts
/** Zet markdown om naar Payload-Lexical. resolveTitel lost [[Titel]] op naar een doc-id (null = onopgelost). */
export async function markdownNaarLexical(
  markdown: string,
  resolveTitel?: (titel: string) => number | null,
): Promise<SerializedEditorState>  // gebruik het juiste type uit @payloadcms/richtext-lexical of payload

/** Zet Payload-Lexical om naar markdown. resolveId maakt van een doc-id weer [[Titel]] (null = laat als gewone link). */
export async function lexicalNaarMarkdown(
  state: unknown,
  resolveId?: (id: number) => string | null,
): Promise<string>
```

**Wikilink-verwerking (pre/post-processing rond de officiële converter):**
- Vóór md→lexical: vervang elke `[[Titel]]` (regex: `/\[\[([^\]|#]+)\]\]/g`, titel getrimd) waarvoor `resolveTitel` een id geeft door `[Titel](/admin/kennisbank?doc=<id>)`. Onopgeloste links blijven letterlijk `[[Titel]]` als tekst staan (marker voor "pagina moet nog komen").
- Na lexical→md: vervang links met href `/admin/kennisbank?doc=<id>` terug door `[[Titel]]` als `resolveId(id)` een titel geeft; anders laat je de gewone markdown-link staan.

**Robuustheid:** lege/ontbrekende state → lege string; converter-fouten niet stil wegslikken maar met context her-throwen (`Error("markdownNaarLexical: " + oorzaak)`).

## Deel 2 — endpoints op de collectie

Voeg in `KnowledgeDocs.ts` toe (Payload 3 custom endpoints op collectie-niveau; handler krijgt `PayloadRequest`, retourneert een `Response`):

```ts
endpoints: [
  { path: "/:id/md", method: "get", handler: ... },
  { path: "/:id/md", method: "patch", handler: ... },
]
```

- **Auth:** geen `req.user` → `Response.json({ fout: "Niet ingelogd" }, { status: 401 })`. Werk daarna via `req.payload.findByID`/`update` met `overrideAccess: false, user: req.user` zodat access-regels en tijdlijn-attributie gewoon gelden.
- **GET** `/api/knowledge-docs/:id/md` → `{ id, titel, soort, markdown }`. Voor `resolveId`: query alle wiki-docs is te duur per call — los alleen op wat nodig is: verzamel eerst de doc-ids uit de links in de state (parse de JSON), haal die docs in één `find` op (`where: { id: { in: [...] } }`), bouw de map.
- **PATCH** body `{ markdown: string }` → converteer met `markdownNaarLexical` (resolveTitel: één `find` op `titel in [alle [[titels]] uit de markdown]`), update `inhoud` via `req.payload.update`. Antwoord: `{ id, bijgewerkt: true }`. Ongeldige body → 400 met duidelijke `fout`-tekst.
- Id-parsing: `Number(req.routeParams?.id)` — onderzoek hoe Payload 3 route-params aanlevert (check de types van `PayloadRequest`; mogelijk `req.routeParams`). NaN → 400. Niet-bestaand doc → 404.

## Acceptatie

- `wikiMarkdown.ts` compileert standalone: `npx tsc --noEmit -p tsconfig.json` mag op JOUW bestanden geen fouten geven (fouten in andermans werk noteer je).
- Round-trip-gedachte: `lexicalNaarMarkdown(await markdownNaarLexical(md))` levert semantisch dezelfde markdown (koppen/lijsten/links/bold blijven staan) — schrijf dit NIET als testbestand, maar verifieer het met een klein inline `npx tsx`-experiment als de omgeving het toelaat en meld het resultaat; zo niet, meld dat de round-trip in de integratiefase getest moet worden.
- Endpoints geregistreerd; eslint schoon op beide bestanden.
