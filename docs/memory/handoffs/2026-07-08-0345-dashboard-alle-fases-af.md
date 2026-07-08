# Handoff — Els-dashboard volledig gebouwd (alle 6 fases), getest en gepusht

**Datum:** 2026-07-08 ~03:45 · **Sessie:** dashboard-bouw in auto-modus (Dottie) · **Repo:** master, gepusht naar `ElsVHST/humanmargin`

## Context in één alinea

In één nachtsessie is het complete Els-dashboard gebouwd volgens de spec (`docs/superpowers/specs/2026-07-08-els-dashboard-design.md`): CRM met pipeline-kanban, projecten & taken met board en filters, contentkalender met blog-automatisering, kennisbank met documentboom, en een home-overzicht — alles in de bestaande Payload-admin, in het Nederlands en Human Margin-branding. 49 integratie/unit-tests groen, elke view in de echte browser geQA'd (incl. echte muis-drags via CDP), alle fases apart gecommit en gepusht. Eerder in dezelfde sessie: verse git-start (template-historie volledig verwijderd, ook op GitHub — Els maakte het repo leeg opnieuw aan) en de eerste push ooit van dit project.

## Waar alles staat

- **Systeemindex voor Dottie:** `.claude/skills/humanmargin-dashboard/SKILL.md` — kaart van collecties/velden/hooks/views + recepten om als Els's AI-partner te werken (LEES DIT EERST bij dashboardwerk)
- **Alle fase-details:** `.claude/skills/humanmargin-payload-cms/SKILL.md` (secties Fase 1 t/m 6)
- **Handleiding voor Els:** `docs/handleiding-els-dashboard.md` + geseed in haar kennisbank ("Handleiding dashboard", 6 hoofdstukken)
- **Plannen & onderzoek:** `docs/superpowers/plans/` (6 fase-plannen), `docs/research/dashboard/` (Twenty/Postiz/AppFlowy/payload-capabilities)
- **Tests:** `npm test` — 49 groen; tests raken ALLEEN de lokale `humanmargin_test`-DB (onvoorwaardelijke override in `tests/int/setup.ts`)

## Openstaande punten

1. **Vercel-deploy** (site + dashboard samen): env vars `DATABASE_URI`/`PAYLOAD_SECRET`/`NEXT_PUBLIC_SITE_URL`; media → `@payloadcms/storage-vercel-blob`; dev-push vervangen door migraties (`payload migrate:create`). Zie payload-skill.
2. **Demo-data in de dev-DB** (Neon): Demo Consultancy BV, 4 deals, 4 taken, 5 content-items, testdocs in kennisbank — bewust laten staan zodat Chris/Els het dashboard gevuld zien; opruimen kan via de prullenbakken of een scriptje.
3. **Later-lijst (spec §1):** e-mailsync, support-inbox, social auto-publish, Cal.com, klant-deellinks, publieke kennisbank-rendering, kolom-slepen op het board zelf.
4. **Accounts:** chris@co-creatie.ai én info@aicompliancekit.eu zijn beheerder (dev-DB).

## Gevoelige gegevens

Redacted. Neon-string in `.env` (gitignored); dev-login in `clone-qa-status.md` (projectgeheugen).

## Suggested skills

- `humanmargin-dashboard` — bij ALLE dashboardwerk (index + recepten)
- `humanmargin-payload-cms` — schema/CMS/deploy-details
- `/payload` — generieke Payload-referentie (sub-skills storage-vercel-blob, db-postgres voor de deploy)

## Snelstart nieuwe sessie

```bash
npm run dev            # site :3000, admin /admin, dashboard-home na inloggen
npm test               # 49 tests tegen lokale humanmargin_test
```

— Dottie
