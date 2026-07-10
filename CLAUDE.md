# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Identiteit

In dit project heet de assistent **Dottie**. Stel je zo voor en onderteken handoffs/rapportages met die naam.

## Wat dit repo is

De website én het bedrijfsdashboard van **Human Margin** (klant: Els, AI-compliance/training, humanmargin.eu). Eén Next.js-app met Payload CMS erin: de publieke site draait op Payload-content die Els zelf bewerkt in een Nederlandstalige, Human Margin-gebrande admin op `/admin`. Het Els-dashboard (CRM, projecten, contentkalender, kennisbank) wordt in dezelfde app gebouwd — spec: `docs/superpowers/specs/2026-07-08-els-dashboard-design.md`, onderzoeksrapporten: `docs/research/dashboard/`.

## Let op: Next.js 16

Deze Next.js-versie heeft breaking changes — API's, conventies en bestandsstructuur kunnen afwijken van je trainingsdata. Lees de relevante guide in `node_modules/next/dist/docs/` voordat je code schrijft en respecteer deprecation-notices.

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **CMS:** Payload 3 (embedded; Postgres via `@payloadcms/db-postgres`; admin op `/admin`)
- **UI:** shadcn/ui (Radix, Tailwind CSS v4, `cn()`), Lucide-icons + geëxtraheerde SVG's in `src/components/icons.tsx`
- **Database:** Neon Postgres (Els's account, `DATABASE_URI` in gitignored `.env`); lokaal Homebrew postgresql@17 als fallback
- **Deploy:** Vercel (gepland; env vars: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`)

## Commands & CI

- `npm run dev` — dev-server (site + admin)
- `npm run build` / `npm run lint` / `npm run typecheck`
- `npm run check` — lint + typecheck + build (reproduceert CI lokaal)
- `npm run generate:types` — na élke schema-wijziging (regenereert `src/payload-types.ts`, nooit met de hand bewerken)
- `npm run generate:importmap` — na nieuwe admin-componenten
- Er is geen testsuite (integratietests komen met het dashboard, zie de spec). CI (`.github/workflows/ci.yml`) draait lint + typecheck + build op pushes/PRs naar `master`.
- Node.js 24+ vereist (`.nvmrc`). Docker: `docker compose up app --build` (productie), `docker compose up dev --build` (dev op poort 3001).

## Code style

- TypeScript strict, geen `any`; named exports, PascalCase-componenten, camelCase-utils
- Tailwind utility classes, geen inline styles; 2 spaties indent; mobile-first responsive (390/1440 zijn de QA-viewports)
- Echte content uit Payload — nooit placeholder-teksten hardcoden

## Architectuur: Payload CMS

- `src/app/(frontend)/` is de publieke site; `src/app/(payload)/` is Payload's eigen laag (admin, REST op `/api/*`, GraphQL) — niet handmatig aanpassen, regenereren vanuit het Payload blank template als het moet.
- `src/payload.config.ts` is het CMS-entrypoint: collections (`Pages`, `Media`, `Users`, `Subscribers`), globals (`Header`, `Footer`), Postgres-adapter, SEO-plugin, Nederlandse admin-i18n.
- **Page-rendering:** `(frontend)/page.tsx` en `(frontend)/[slug]/page.tsx` halen documenten uit de `pages`-collectie via de Local API; `RenderBlocks` mapt elk item van het `layout`-blocksveld naar zijn React-component via de registry in `src/blocks/index.ts`.
- **Draft preview:** admin live-preview wijst naar `/next/preview?path=…` (authenticatie + Next draft mode + redirect); draft-pagina's renderen `RefreshRouteOnSave`. Exit via `/next/exit-preview`.
- `tsconfig.json` mapt `@payload-config` → `src/payload.config.ts` (server-only; nooit in client components importeren). `next.config.ts` is gewrapt met `withPayload`.
- Frontend-routes zijn voorlopig `force-dynamic` zodat `next build` geen live database nodig heeft; heroverwegen (ISR + revalidate-hooks in `Pages.ts`) nu content geseed is.
- Lokale dev vereist draaiende Postgres of de Neon-string in `.env`: `brew services start postgresql@17`, database `humanmargin`. Productie = Neon — alleen `DATABASE_URI` wisselt.

## CMS-regels

Els bewerkt alles zelf in de admin. Daarom:

- **Elke paginasectie is een Payload-block**: schema in `src/blocks/<Naam>/config.ts` + renderer in `src/blocks/<Naam>/Component.tsx`, beide geregistreerd in `src/blocks/index.ts`. Nooit pagina-content hardcoden in JSX-routes.
- **Blockvelden dragen de content** (tekst, `upload`-velden naar `media`, links, arrays); styling blijft in de component. Alle veldlabels in het Nederlands.
- **Pagina's zijn documenten** in de `pages`-collectie (drafts + autosave). Content seeden via de Local API (`payload.create`) — seeds staan in `scripts/seed/`.
- **Media in CMS-content** hoort in de `media`-collectie zodat Els het kan vervangen; `public/images` is alleen voor hardcoded chrome (favicons e.d.).
- Payload synct het schema automatisch in dev; richting productie nette migraties gebruiken.
- Admin-branding: `src/app/(payload)/custom.scss` + `src/components/admin/{Logo,Icon}.tsx`.

## Projectstructuur (kern)

```
src/
  app/(frontend)/   # Publieke site (RenderBlocks over Payload-content)
  app/(payload)/    # Payload admin + API (niet aanpassen)
  payload.config.ts # CMS-config
  payload-types.ts  # GEGENEREERD — nooit handmatig bewerken
  collections/      # Pages, Media, Users, Subscribers
  globals/          # Header, Footer
  blocks/           # <Naam>/config.ts + <Naam>/Component.tsx + index.ts (registry)
  modules/          # Els-dashboard-modules (crm, projects, content, knowledge, shared) — in aanbouw
  components/       # RenderBlocks, RichText, admin/, ui/ (shadcn), icons.tsx
public/media/       # Payload-uploads
scripts/seed/       # Local-API-seeds (1 module per pagina; PAGES=subset)
scripts/*.mjs       # QA-tooling: capture-pages, extract-all-pages, qa-diff (--viewport/--only)
docs/research/      # humanmargin.eu-extracties, sectie-specs, dashboard-onderzoek
docs/superpowers/specs/  # Designspecs
docs/memory/handoffs/    # Sessie-handoffs
```

## Project-skills: index & onderhoud

Skills van dit project staan in `.claude/skills/`. **Raadpleeg de juiste skill vóór je aan het betreffende domein werkt:**

| Skill | Wanneer gebruiken |
|---|---|
| `humanmargin-website` | Frontend: secties/blocks bouwen of stylen, responsive (390/1440), merkwaarden opzoeken, visuele QA/pixel-diff tegen humanmargin.eu |
| `humanmargin-payload-cms` | CMS: schema/collections/velden/blocks wijzigen, seeds draaien, admin-branding, generate:types/importmap, database-issues, deploy-voorbereiding |
| `humanmargin-dashboard` | Els-dashboard: data-vragen en acties voor Els (deals/taken/content/kennisbank via Local API), boards/views/hooks uitbreiden of debuggen — Dottie's systeemindex als AI-partner |

**Onderhoudsplicht (Dottie):** deze skills zijn levende documentatie. Wijzig je blocks, schema, tooling of conventies — werk dan in dezelfde sessie de betreffende SKILL.md bij én deze index als er skills bijkomen of verdwijnen. Nieuwe herbruikbare kennisdomeinen (bv. deploy-runbook, dashboard) krijgen een eigen skill in `.claude/skills/` en een regel in deze tabel.

**Wiki-plicht (Dottie):** de kennisbank bevat de Platform-wiki (map "Platform-wiki"; conventies staan in de wiki-pagina `_Schema — zo werkt deze wiki`). Lever je een feature op of verandert het platform wezenlijk — werk dan in dezelfde sessie de betreffende wiki-pagina('s) én de Index bij (contentbron: `scripts/seed/wiki-content/`, daarna `npx payload run scripts/seed/seed-wiki.ts`; of direct via de `/api/knowledge-docs/:id/md`-endpoints) en schrijf een log-activity op de wiki-root (samenvatting-prefix `[ingest]`). Hermes Agent onderhoudt de runtime-kant dagelijks; code-feiten zijn van Dottie. Na een wiki-wijziging: `scripts/agent/build-second-brain.sh` om de graph te verversen.

## Sessie-handoffs

Bij sessiestart: lees de **nieuwste** handoff in `docs/memory/handoffs/` (naamconventie `YYYY-MM-DD-HHMM-<slug>.md`, lexicografisch laatste = actueel; zie de README aldaar). Nieuwe handoff maken kan met `/handoff` — sla die voor dit project in dezelfde map op.

## Werkwijze

Chris werkt het liefst samen met Dottie in één sessie: onderzoek, analyse en bouwen zelf doen in de hoofdsessie; geen subagent-teams inzetten tenzij Chris er expliciet om vraagt.
