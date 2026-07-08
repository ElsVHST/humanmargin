# Human Margin — website & dashboard

De website en het bedrijfsdashboard van [Human Margin](https://humanmargin.eu) (Els — AI-compliance, -training en -advies). Eén Next.js-app met embedded Payload CMS: de publieke site draait volledig op CMS-content die Els zelf bewerkt in een Nederlandstalige, Human Margin-gebrande admin.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript strict)
- **Payload CMS 3** — embedded, admin op `/admin`, content in blocks
- **Postgres** — Neon (productie), lokaal postgresql@17 als fallback
- **Tailwind CSS v4 + shadcn/ui**
- **Vercel** — deploy (gepland)

## Wat erin zit

- **Publieke site** — alle pagina's en blogposts als block-gebaseerde Payload-documenten; header/footer als globals; nieuwsbriefinschrijvingen in een eigen collectie.
- **Admin voor Els** — volledig Nederlands, in huisstijl (licht + donker), met live draft-preview.
- **Els-dashboard** — CRM (pipeline-kanban met drag & drop), projecten & taken (board met filters), contentkalender (maand/week/lijst, blog→conceptpagina-automatisering), kennisbank (documentboom) en een home-overzicht — als modules in dezelfde admin, met rollen, prullenbak overal en een gedeelde activiteiten-timeline. Handleiding: `docs/handleiding-els-dashboard.md` · spec: `docs/superpowers/specs/2026-07-08-els-dashboard-design.md` · onderzoek: `docs/research/dashboard/`.

## Ontwikkelen

```bash
# Vereisten: Node 24+ (.nvmrc), een Postgres (of de Neon-string in .env)
cp .env.example .env   # DATABASE_URI, PAYLOAD_SECRET invullen
npm install
npm run dev            # site op :3000, admin op :3000/admin
```

Handige scripts:

```bash
npm run check                 # lint + typecheck + build (= CI)
npm run generate:types        # na elke schema-wijziging
npm run generate:importmap    # na nieuwe admin-componenten
npx tsx scripts/seed/seed-pages.ts        # pagina's seeden (PAGES=subset)
node scripts/qa-diff.mjs --only home      # visuele pixel-diff tegen humanmargin.eu
```

Docker: `docker compose up app --build` (productie-build) of `docker compose up dev --build` (dev op poort 3001).

## Projectdocumentatie

- `CLAUDE.md` — werkinstructies en architectuurregels (CMS-regels, conventies)
- `.claude/skills/` — levende documentatie per domein (frontend, CMS)
- `docs/memory/handoffs/` — sessie-handoffs
- `docs/research/` — extracties en sectie-specs van humanmargin.eu + dashboard-onderzoek
