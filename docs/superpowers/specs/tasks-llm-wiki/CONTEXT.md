# CONTEXT — verplichte leesstof voor élke bouw-agent (LLM-wiki + Second Brain)

Je werkt in `/Users/christianbleeker/Desktop/humanmargin` — de Next.js 16 + Payload 3-app van Human Margin (website + Els-dashboard). PRD van dit project: `docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md` (lees de secties die jouw taakblad noemt).

## Harde regels (overtreding = taak mislukt)

1. **Raak ALLEEN de bestanden aan die jouw taakblad expliciet noemt.** Andere agents werken tegelijk in dezelfde repo aan andere bestanden.
2. **NIET doen:** `git commit`/`git push`/`git checkout`, dev-server starten, seeds/scripts uitvoeren tegen de database, `npm run generate:types`, `npm run generate:importmap`, `npm install` (geen nieuwe dependencies!), bestanden verwijderen.
3. **Wel doen:** je eigen bestanden schrijven en verifiëren met `npx eslint <jouw bestanden> --max-warnings=0`. TypeScript-fouten die afhangen van werk van andere agents (bv. nog niet bestaande imports of nog niet geregenereerde `payload-types`) noteer je in je rapport in plaats van ze te "fixen" buiten je bestandslijst.
4. Alle UI-teksten, veldlabels, kopjes en commentaar in het **Nederlands**. Geen Engelse systeemteksten.
5. TypeScript strict, **geen `any`**, named exports, 2 spaties indent, camelCase-utils, PascalCase-componenten.
6. React-regels (lint staat streng): geen `Date.now()`/`Math.random()` in de render-body (bereken vóór de JSX of geef als prop door), geen `setState` in een effect om afgeleide state te maken (gebruik TanStack Query of afleiden tijdens render), interne links via `next/link`.
7. Styling met `--hm-*`-tokens (zie `src/modules/shared/styles/dashboard.scss`); nooit hardcoded hex behalve waar het taakblad het zegt. Elke view importeert `@/modules/shared/styles/dashboard.scss`.
8. Payload-JSON-gotcha: json-velden worden bij PATCH volledig VERVANGEN; richText (`inhoud`) is gewoon een veld dat je in één keer zet.

## Relevante datamodellen (bestaand — NIET wijzigen tenzij jouw taakblad het zegt)

**`knowledge-docs`** (`src/modules/knowledge/collections/KnowledgeDocs.ts`): `titel*` (text), `soort*` (select: map/document/bestand — **altijd expliciet meesturen bij create**), `inhoud` (richText/Lexical), `bestand` (upload→knowledge-files, alleen bij soort=bestand), `parent` (rel→zichzelf), `zichtbaarheid*` (intern/publiek — expliciet meesturen), `organisatie`, `project`, `tags` (array van strings via `tagsField`; formaat: `[{ tag: "wiki" }]`? → NEE: check `src/modules/shared/fields.ts` voor het echte formaat en volg dat), `auteur` (rel→users), `position` (number, sibling-volgorde).

**`activities`** (`src/modules/shared/collections/Activities.ts` of vergelijkbaar — zoek op slug "activities"): `type*` (o.a. notitie/statuswijziging/systeem/vraag/log), `samenvatting` (text), `tekst` (richText), `targets*[]` polymorf (o.a. `knowledge-docs`), `happensAt*`.

**`users`**: `name`, `email`, `role` (beheerder/teamlid), auth-collectie.

**Agent-user-patroon** (voor seeds): handel als Dottie-user voor tijdlijn-attributie:
```ts
const dottie = (await payload.find({ collection: "users", where: { email: { equals: "dottie@humanmargin.eu" } }, limit: 1 })).docs[0];
await payload.create({ collection: "...", data: {...}, overrideAccess: false, user: dottie });
```
Referentie-seeds om het patroon af te kijken: `scripts/seed/seed-routekaart.ts` (idempotent find-or-create + user-attributie) en `scripts/seed/seed-agent-loop.ts` (kennisbank-docs met Lexical).

## De canonieke wiki-structuur (EXACT deze titels gebruiken — ook in [[links]])

Rootmap: **Platform-wiki**. Submappen: **Werkbladen**, **Modules & data**, **Automatiseringen**, **API & integraties**, **Roadmap & wensen**, **Agents**.

| Map | Paginatitels (exact) |
|---|---|
| *(root)* | `_Schema — zo werkt deze wiki` · `Index` · `Overzicht — het Human Margin-platform` · `Second Brain` |
| Werkbladen | `Werkblad Home` · `Werkblad Pipeline` · `Werkblad Relaties` · `Werkblad Projecten` · `Werkblad Taken` · `Werkblad Kalender` · `Werkblad Kennisbank` |
| Modules & data | `CRM — organisaties, contacten en deals` · `Projecten & taken` · `Content & kalender` · `Kennisbank & bestanden` · `Tijdlijn & activities` · `Gebruikers, rollen & voorkeuren` · `Site & CMS` |
| Automatiseringen | `Hooks & automatische acties` · `In-the-loop OS (agent-queue)` |
| API & integraties | `REST & Local API — recepten` · `Integratie-landschap` |
| Roadmap & wensen | `Strategie — de Human Margin Method` · `Wensenkaart W1–W31` · `Fase A — content & formats` · `Fase B — Reality Check native` · `Fase C — publiek & rapporten` · `Fase D — repurposing & ochtendmail` · `Fase E — masterclass-automatisering` · `Fase F — academy, betalingen & affiliates` · `Fase G — KPI-dashboard Cijfers` · `Fase H — eigen mailmotor` · `CRM-afronding (gap-index)` · `Kaders — wat nooit automatisch mag` |
| Agents | `Hermes Agent` · `Dottie (sessie-agent)` |

## Wiki-paginaformaat (markdown, voor de content-packs)

```markdown
**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** actueel · **Bronnen:** <korte bronvermelding, bv. "skill humanmargin-dashboard; specs/2026-07-09-els-braindump-analyse.md">

<één alinea samenvatting van de pagina — wat is dit, voor wie>

## <Sectiekop>
<inhoud — feitelijk, compact, geen marketingtaal>

## Gerelateerd
- [[Exacte Paginatitel]]
- [[Nog een Paginatitel]]
```

- Wiki-links **altijd** als `[[Exacte Paginatitel]]` met een titel uit de tabel hierboven — elke typefout wordt een dode link.
- Gebouwd vs. gepland ALTIJD expliciet onderscheiden: wat nu bestaat beschrijf je als feit; toekomstige features markeer je met **(gepland — fase X)**.
- Alleen markdown-basics: koppen (##/###), vet/cursief, lijsten, links, blockquote, `code`. GEEN tabellen met complexe inhoud (simpele tabellen mogen), geen afbeeldingen, geen HTML.
- Geen persoonsgegevens van klanten/contacten in pagina's.

## Gedeeld type voor content-packs (letterlijk zo declareren in elk pack-bestand)

```ts
export type WikiPagina = {
  /** Submap-titel uit de canonieke structuur, of null voor root-niveau. */
  map: string | null;
  titel: string;
  tags: string[]; // altijd minimaal ["wiki"]
  markdown: string;
};
```

## Bestandseigendom (wie mag wat aanraken)

| Taak | Bestanden |
|---|---|
| T1 | `src/modules/knowledge/views/kennisbank/KennisbankBrowser.tsx` |
| T2 | `src/modules/knowledge/wiki/wikiMarkdown.ts` (nieuw), `src/modules/knowledge/collections/KnowledgeDocs.ts` (alleen `endpoints` toevoegen) |
| T3 | `src/collections/Users.ts` (alleen `auth`), `scripts/seed/seed-hermes.ts` (nieuw) |
| T4a | `scripts/seed/wiki-content/kern-werkbladen.ts` (nieuw) |
| T4b | `scripts/seed/wiki-content/modules-api.ts` (nieuw) |
| T4c | `scripts/seed/wiki-content/roadmap-agents.ts` (nieuw) |
| T5 | `scripts/seed/seed-wiki.ts` (nieuw) |
| T6 | `src/modules/knowledge/views/secondbrain/*` (nieuw), `src/payload.config.ts` (alleen view-registratie), `src/components/admin/shell/Rail.tsx` (alleen link toevoegen) |
| T7 | `scripts/agent/export-second-brain-corpus.ts`, `scripts/agent/build_graph.py`, `scripts/agent/build-second-brain.sh`, `scripts/agent/upload-second-brain.ts` (alle nieuw), `.gitignore` (alleen regels toevoegen) |

## Rapportage (structured output)

Rapporteer aan het eind: `status` ("klaar" of "geblokkeerd"), `bestanden` (alle aangemaakte/gewijzigde paden), `notities` (afwijkingen, aannames, bekende resterende fouten die van andere taken afhangen, en wat de orchestrator in de integratiefase moet doen).
