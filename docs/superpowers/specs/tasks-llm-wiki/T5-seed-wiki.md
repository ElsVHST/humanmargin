# T5 — `seed-wiki.ts`: de wiki in de kennisbank zetten

**Bestand (nieuw):** `scripts/seed/seed-wiki.ts`
**Afhankelijk van:** T2 (`src/modules/knowledge/wiki/wikiMarkdown.ts`) en T4a/b/c (`scripts/seed/wiki-content/*.ts`) — die bestaan als jij begint. Lees ze eerst.
**PRD:** §3 (structuur), fase 1.3/1.5.

## Doel

Idempotent seed-script dat de volledige Platform-wiki (6 mappen + 37 pagina's uit de drie content-packs) als `knowledge-docs` in de database zet, met opgeloste `[[wikilinks]]`, als Dottie-user, met een log-activity. Draaien met `npx payload run scripts/seed/seed-wiki.ts` — maar **jij draait het NIET** (integratiefase).

## Patroon

Volg `scripts/seed/seed-routekaart.ts` (find-or-create op naam, `overrideAccess: false, user: dottie`) en `scripts/seed/seed-agent-loop.ts` (kennisbank-creates). Dottie-user ophalen; ontbreekt hij → foutmelding "draai eerst seed-agent-loop.ts" en exit 1.

## Stappen

1. **Import** de drie packs: `import { PAGINAS as KERN } from "./wiki-content/kern-werkbladen"` enz.; concatenate in deze volgorde: kern-werkbladen, modules-api, roadmap-agents. Valideer: elke `pagina.map` is `null` of één van de zes canonieke mapnamen (anders: fout + exit 1); dubbele titels → fout + exit 1.
2. **Rootmap** "Platform-wiki": find-or-create (`soort: "map"`, `zichtbaarheid: "intern"`, tags `["wiki"]`, position 1000).
3. **Zes submappen** (volgorde: Werkbladen, Modules & data, Automatiseringen, API & integraties, Roadmap & wensen, Agents) find-or-create onder de root, position oplopend per 1000. Zoek altijd op `titel` + `parent` samen (titels kunnen elders in de kennisbank bestaan).
4. **Pass 1 — records:** voor elke pagina find-or-create op titel+parent (`soort: "document"`, `zichtbaarheid: "intern"`, tags uit het pack, position = array-volgorde × 1000, `inhoud` nog weglaten bij create). Bouw `titelNaarId: Map<string, number>` over ALLE pagina's (ook al bestaande).
5. **Pass 2 — inhoud:** voor elke pagina: `const lexical = await markdownNaarLexical(pagina.markdown, (titel) => titelNaarId.get(titel) ?? null)` en dan `payload.update({ collection: "knowledge-docs", id, data: { inhoud: lexical }, overrideAccess: false, user: dottie })`. **Altijd updaten** (ook bij bestaande docs) — zo ververst een re-run de content. Tel onopgeloste `[[links]]` (regex op de markdown vóór conversie, titels die niet in de map zitten) en log ze als waarschuwing per pagina.
6. **Log-activity:** create `activities` met `type: "log"`, `samenvatting: "[ingest] Platform-wiki geseed: <N> pagina's, <M> mappen (<X> onopgeloste links)"`, `targets: [{ relationTo: "knowledge-docs", value: <rootmap-id> }]`, `happensAt: new Date().toISOString()`, als Dottie. Check eerst het echte veldformaat van `targets` en `type`-opties in de activities-collectie (`src/modules/**/Activities*.ts` — zoek hem op) — het type "log" bestaat al (in-the-loop OS).
7. Console-output per stap (`✓` / `↷` zoals de andere seeds), eindregel met totalen, `process.exit(0)`.

## Let op

- `soort` en `zichtbaarheid` ALTIJD expliciet meesturen (verplichte selects).
- Tags-formaat: kijk hoe `tagsField` in `src/modules/shared/fields.ts` het opslaat en lever exact dat aan.
- `markdownNaarLexical` is async en server-only — prima in een payload-run-script.
- Het script moet een tweede run zonder wijzigingen doorstaan met alleen `↷`-regels en een verse pass-2 (geen duplicaten!).

## Acceptatie

eslint schoon op `scripts/seed/seed-wiki.ts`; droge logica-review: geen enkele create zonder find ervoor; alle canonieke titels gedekt (assert: 37 pagina's + 6 mappen, anders warning in output).
