# Handoff — Human Margin clone compleet, wacht op GitHub-push & Vercel-deploy

**Datum:** 2026-07-07 ~22:35 · **Sessie:** Payload-integratie + volledige clone van humanmargin.eu · **Repo:** `/Users/christianbleeker/Desktop/humanmargin` (master, ~50 lokale commits, niet gepusht)

## Context in één alinea

Voor klant **Els** (Human Margin, humanmargin.eu — WordPress/Elementor) is de site herbouwd als Next.js 16 + Payload CMS 3.85.2, zodat zij alles zelf kan bewerken in een Nederlandstalige, volledig Human Margin-gebrande admin. Alle 27 pagina's + 2 blogposts zijn geseed als block-gebaseerde Payload-documenten (18 blocktypes), pixel-diff-geQA'd op desktop én mobiel (2 fixrondes, nul regressies). Dev draait op localhost:3000 (site) en /admin (CMS), database = Els's Neon Postgres.

## Waar alles staat (niet dupliceren — lezen bij behoefte)

- **Projectgeheugen:** `~/.claude/projects/-Users-christianbleeker-Desktop-humanmargin/memory/` → `humanmargin-project.md` (setup, gotchas) en `clone-qa-status.md` (eindstand QA, dev-logingegevens, open punten)
- **Architectuurregels:** `CLAUDE.md` + `AGENTS.md` in de repo (CMS-regels: elke sectie = block; sync-scripts)
- **Blocks:** `src/blocks/` (registratie in `index.ts`); globals `src/globals/`; collecties `src/collections/`
- **Seeds:** `scripts/seed/pages/*.ts` (1 module per pagina) + `seed-pages.ts` (PAGES=subset), `seed-media.ts`, `seed-globals.ts`, `create-admin.ts`
- **QA-tooling:** `scripts/capture-pages.mjs`, `scripts/extract-all-pages.mjs` (ONLY/VIEWPORT_W/OUT_DIR), `scripts/qa-diff.mjs` (--viewport, composieten in `qa/diff/`)
- **Onderzoeksdata origineel:** `docs/research/humanmargin.eu/` (extracties, summaries, media-manifest), screenshots `docs/design-references/humanmargin.eu/`
- **Admin-branding:** `src/app/(payload)/custom.scss` + `src/components/admin/{Logo,Icon}.tsx`

## Openstaande punten (volgorde van waarschijnlijkheid)

1. **GitHub-push** — origin staat op `ElsVHST/humanmargin`; alle accounts hebben `push=false`. Zodra Els `chris-co-creators-ai` als collaborator uitnodigt en Chris accepteert: `git push -u origin master`. Check: `gh api repos/ElsVHST/humanmargin --jq '.permissions.push'`.
2. **Vercel-deploy** — env vars: `DATABASE_URI` (staat in `.env`, Neon van Els), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`. Media staat op lokale disk (`public/media`) — voor Vercel is `@payloadcms/storage-vercel-blob` de logische stap (zie payload-skill sub-skill `storage-vercel-blob`).
3. **Geaccepteerde afwijkingen** (alleen oppakken als gevraagd): single-post-chrome (inhoudsopgave/deelknoppen/sidebar) niet gecloond; salespage blauwe secties; weggever-placeholderafbeeldingen; resterende pixel-diff op lange pagina's = font-wrapping-artefact.
4. **Eventueel:** cookie-consent (Complianz bewust niet gecloond), Payload-search, echte posts-collectie i.p.v. pages voor blog.

## Gevoelige gegevens

Redacted. Neon-connectionstring: zie `.env` (gitignored). Dev-admin-login: zie `clone-qa-status.md` in projectgeheugen. Beide NIET in commits of documenten zetten.

## Suggested skills

- `/payload` — bij alle CMS-schemawerk (collections/fields/plugins); sub-skills `storage-vercel-blob` en `db-postgres` voor de deploy
- `vercel:deploy` / `vercel:env` — voor de Vercel-deploy (stap 2)
- `/verify` — na wijzigingen de flow end-to-end draaien (dev server + capture-scripts)
- `/handoff` — aan het einde van de sessie een nieuwe handoff in deze map schrijven (naamconventie: zie README.md hiernaast)

## Snelstart nieuwe sessie

```bash
brew services start postgresql@17   # alleen nodig als lokale fallback-DB gewenst
npm run dev                          # site + admin (Neon-DB uit .env)
node scripts/qa-diff.mjs --only home # sanity-check
```
