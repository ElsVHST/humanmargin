# T4b — wiki-content: modules & data + automatiseringen + API (11 pagina's)

**Bestand (nieuw):** `scripts/seed/wiki-content/modules-api.ts`
**PRD:** §3 + §3.2; voor In-the-loop en API ook §4-§5.

## Doel

Content-module met `export const PAGINAS: WikiPagina[]` (type letterlijk uit CONTEXT.md) voor de mappen **Modules & data**, **Automatiseringen** en **API & integraties**.

## Bronnen (echt lezen)

- `.claude/skills/humanmargin-dashboard/SKILL.md` — kernvelden per collectie, hooks, recepten, in-the-loop OS
- `src/modules/*/collections/*.ts` — de échte schema's (velden, verplichte selects, relaties); neem veldnamen letterlijk over
- `.claude/skills/humanmargin-payload-cms/SKILL.md` + `CLAUDE.md` — site/CMS-laag
- `docs/superpowers/specs/2026-07-09-els-braindump-analyse.md` §3 — de huidige toolstack van Els (voor Integratie-landschap)
- PRD §2 B6/B7 + §4.5 — REST-toegang en Hermes' draaiboek (voor de API-pagina)

## Te schrijven pagina's

**Map "Modules & data"** (7): `CRM — organisaties, contacten en deals` · `Projecten & taken` · `Content & kalender` · `Kennisbank & bestanden` · `Tijdlijn & activities` · `Gebruikers, rollen & voorkeuren` · `Site & CMS`.
Per pagina (350-600 woorden): welke collecties (slugs!), de belangrijkste velden met betekenis (incl. verplichte selects met defaults die je bij creates expliciet meestuurt — noem ze), relaties/joins, beheerbare lijsten (sectoren/functies/fases/statussen/kanalen), en de werkblad-pagina('s) waar dit oppervlak heeft (`[[Werkblad …]]`). Voor CRM ook: eigen velden (`crm-velden` + `extraVelden`-json + de VERVANGEN-bij-PATCH-gotcha), relatietype/doelgroep/risicoklasse, opvolgenOp. Voor Kennisbank & bestanden ook: de wiki zelf (map "Platform-wiki") en de `/md`-endpoints **(gebouwd in deze release)**. Voor Site & CMS: pages/blocks/media, RenderBlocks, draft-preview — de publieke site die Els in de admin bewerkt.

**Map "Automatiseringen"** (2):
- `Hooks & automatische acties` — de drie hooks (deal-fasewijziging → tijdlijn-activity; deal gewonnen → project; blog-content gepland → conceptpagina), dat ze idempotent zijn en ook vuren bij API-calls, en het kader: niets publiceert automatisch.
- `In-the-loop OS (agent-queue)` — het board als single source of truth: kolommen "Ready (agent)"/"Heeft mij nodig", de loop (lezen → doen of vragen → Review → LOG), de vraag/log-comment-typen, mine-trail → SOP's. Bron: skill + seed-agent-loop.ts.

**Map "API & integraties"** (2):
- `REST & Local API — recepten` — hoe agents met het systeem praten: REST-basis (`/api/<slug>`), auth (sessie of `Authorization: users API-Key <key>` **(gebouwd in deze release)**), de `/md`-endpoints voor wiki-pagina's, de belangrijkste recepten uit de skill (als-user handelen, tijdlijn van record X, notitie plaatsen, trash vs. permanent), en de gotcha's (json-velden vervangen; verplichte selects expliciet; trash-query's).
- `Integratie-landschap` — Els's huidige tools (uit braindump §3: WordPress→vervangen, Tally, ActiveCampaign, Plug&Pay, Huddle, Calendly, Google Workspace, TLDV, Canva, Canbox) met per tool het advies (behouden/koppelen/vervangen) en de geplande integraties per fase **(gepland — fase X)** markeren.

## Vorm & acceptatie

Zoals CONTEXT.md: kopblok, samenvatting, secties, `## Gerelateerd` met geldige `[[links]]`. Tags per pagina: `["wiki","module"]`, `["wiki","automatisering"]` of `["wiki","api"]`. eslint schoon op jouw bestand; alle `[[…]]` uit de canonieke lijst.
