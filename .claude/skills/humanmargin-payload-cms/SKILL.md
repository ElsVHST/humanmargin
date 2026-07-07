---
name: humanmargin-payload-cms
description: Use when working on this project's Payload CMS — changing collections/fields/blocks schema, seeding content, admin panel styling or components, generate:types/importmap errors, database or migration issues, or preparing the Vercel/Neon deploy.
---

# Human Margin — Payload CMS

## Overview

Payload 3.85.2 embedded in de Next-app. Entry: `src/payload.config.ts`. Collections: `pages` (blocks-layout, drafts+autosave+live preview), `media` (uploads → `public/media`), `users`, `subscribers` (nieuwsbrief). Globals: `header`, `footer`. Admin op `/admin`, Nederlands, volledig gebrand. **Kernregel: Els moet alles kunnen bewerken** — content in velden (NL-labels), styling in components. Voor frontend-conventies: zie skill `humanmargin-website`. Voor generieke Payload-API-vragen: de globale `/payload`-skill.

## Workflows

**Nieuw block:** `src/blocks/<Naam>/config.ts` (slug, interfaceName, NL-labels) + `Component.tsx` → registreren in `src/blocks/index.ts` (beide lijsten) → `npm run generate:types` → tsc. Content via seed, niet hardcoded.

**Schema gewijzigd:** altijd `npm run generate:types` (schrijft `src/payload-types.ts` — NOOIT hand-editen). Admin-componenten toegevoegd: ook `npm run generate:importmap`.

**Seeden:** `PAGES=<slug,slug> npx payload run scripts/seed/seed-pages.ts` (idempotent; alle pagina-modules in `scripts/seed/pages/*.ts`, type `PageSeed`). Helpers: `scripts/seed/lexical.ts` (richText/htmlToLexical), `media-map.ts` (WP-URL → media-id). Media/globals: `seed-media.ts`, `seed-globals.ts`. Seeds geven `context: { skipRevalidate: true }` mee — verplicht buiten een Next-request.

**Admin-branding:** alles in `src/app/(payload)/custom.scss` (thema-vars licht+donker, merk-knoppen, zwarte nav, login) + `src/components/admin/{Logo,Icon}.tsx`. Nieuwe admin-schermen stylen: eerst class inspecteren (Playwright), dan gericht in custom.scss — geen inline styles in Payload-templates.

## Gotchas (allemaal al eens misgegaan)

| Symptoom | Oorzaak → fix |
|---|---|
| `ERR_REQUIRE_ASYNC_MODULE` bij payload CLI | `"type": "module"` ontbreekt in package.json (staat er nu — niet weghalen) |
| `payload run`-script hangt stil | Drizzle-push wacht op interactieve bevestiging bij destructieve schemawijziging. Dev-DB is wegwerpbaar: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` op Neon, dan seed-media → seed-globals → seed-pages |
| `Invariant: static generation store missing in revalidatePath` | Hook draait buiten request-context → seed zonder `skipRevalidate`-context |
| Types-fout op nieuw block in andere worktree/agent | payload-types nog niet geregenereerd — race; `npm run generate:types` op master |
| `media niet gevonden in map` bij seed | WP-URL met size-suffix; `media()` probeert origineel — anders ontbreekt het bestand in `.seed-assets/media` + `media-manifest.json` |
| Admin toont Engelse UI | Taal volgt browser; `i18n.fallbackLanguage: "nl"` staat in config |

## Omgeving & deploy

`.env` (gitignored): `DATABASE_URI` (Neon van Els), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`. Lokale fallback-DB: `brew services start postgresql@17`, db `humanmargin`. Dev-login: zie `clone-qa-status.md` in projectgeheugen. **Voor Vercel-deploy:** media staat nu op disk — `@payloadcms/storage-vercel-blob` toevoegen (zie `/payload` sub-skill storage-vercel-blob) en dev-push vervangen door echte migraties (`payload migrate:create`).
