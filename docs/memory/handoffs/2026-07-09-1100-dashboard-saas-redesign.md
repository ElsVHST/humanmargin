# Handoff — Dashboard SaaS-redesign gebouwd (⚠️ vereist extra aandacht/review)

**Datum:** 2026-07-09 ~11:00 · **Sessie:** UI-redesign van het volledige Els-dashboard naar SaaS-niveau (Asana/Pipedrive-gevoel) · **Repo:** master, gepusht naar `ElsVHST/humanmargin` (commits `33c2982`→`2a49a16`)

## ⚠️ LET OP — alles uit deze sessie vereist extra aandacht

Chris heeft expliciet gevraagd dit te markeren: **álle designs en features die in deze redesign-sessie zijn gemaakt, moeten nog kritisch nagelopen worden** voordat ze naar Els/productie gaan. Ze zijn functioneel, getest (49 tests groen) en visueel geQA'd in light-mode, maar:

- **Nog niet door Els gezien of goedgekeurd** — alleen Chris keurde de richting (het analyse-artifact) goed.
- **Alleen in light-mode geverifieerd.** De admin staat vast op `theme: "light"`; dark-tokens zijn geschreven maar nooit visueel getest (toggle staat uit).
- **Radius-keuze is bewust en omkeerbaar.** Het merk is scherp (radius 0); ik gaf de werk-oppervlakken een zachte 8px via één token `--hm-r` (in `src/modules/shared/styles/dashboard.scss`). Chris moet nog beslissen: zacht laten of `--hm-r: 0` voor merkpuur.
- **Nog niet responsive/mobiel getest** — de boards/kennisbank/kalender zijn op desktopbreedte bekeken; grids hebben media-queries maar zijn niet op 390px geverifieerd.
- **A11y/keyboard, lege staten, foutstaten** niet uitputtend nagelopen.
- **Demo-data** in de dev-DB (Neon) kleurt het beeld; met echte content kan densiteit/lengte anders vallen.
- Kortom: behandel deze UI als **eerste oplevering die revisie kan vragen**, niet als af.

## Wat er is gebouwd (5 commits, gepusht)

Volledig SaaS-redesign van alle vijf werk-oppervlakken, gegrond in het échte merk (electric yellow `#edff00`, Archivo, brand-blauw `#002ccf`), herbouwd op de eigen stack (géén Mongo/Go/Recoil uit de referentierepo's).

- **Designsysteem:** `src/modules/shared/styles/dashboard.scss` (`--hm-*` tokens, erven van Payload's `--theme-elevation-*`; kit: `.hm-card/--hover`, `.hm-pill`, `.hm-kleur(+--<token>)`, `.hm-av`, `.hm-meter`, `.hm-btn`, `.hm-slideover`, `.hm-view__*`) + `src/modules/shared/ui.ts` (`initialen`, `avatarKleur`).
- **Pipeline & Taken** (asana-clone-referentie): kaarten met avatars, bedrag, kans-meter, kleur-kolommen, hover-lift; taak-pills (prioriteit/deadline). `board.scss` herschreven.
- **Kennisbank** (myDrive-referentie): `KennisbankBrowser.tsx` + `kennisbank.scss` volledig herschreven — breadcrumb, kaartgrid mappen/documenten, quick-access, detailrail, hover-acties (ⓘ / +). Boomlogica + Lexical onveranderd eronder.
- **Home:** stat-tegels (open pipeline + waarde met **echte** fase-verdelingsbalk, mijn taken, content deze week) boven de detailkaarten. `home.scss` herschreven.
- **Kalender:** merk-knoppen, kleur-statuspills, vandaag-cirkel. `kalender.scss` herschreven.

## Referenties & docs

- **Analyse-artifact (goedgekeurd):** https://claude.ai/code/artifact/887ec60e-6b5e-47f2-886c-03a960ee1658
- **Referentierepo's** (via opensrc bestudeerd, niet geïntegreerd): `manakuro/asana-clone-app` (boards), `subnub/myDrive` (kennisbank).
- **Designsysteem gedocumenteerd** in skill `humanmargin-dashboard` (sectie "Designsysteem (SaaS-redesign)").
- **Voor/na-screenshots:** `scratchpad/ui-audit/` (oud: `01-05`, nieuw: `new-01…05`) — scratchpad is sessie-tijdelijk, niet in repo.

## Openstaande punten (volgorde van waarschijnlijkheid)

1. **Review-ronde met Chris/Els** op de nieuwe UI — densiteit, kleur, radius, mobiel. Verwacht revisies. Dit is punt 1 omdat Chris het expliciet markeerde.
2. **Radius-beslissing** (`--hm-r`: 8px zacht vs 0 scherp/merkpuur).
3. **Mobiel/responsive-QA** (390px) + dark-mode-QA als de toggle ooit aangaat.
4. **Vercel-deploy** (al langer open): env vars `DATABASE_URI`/`PAYLOAD_SECRET`/`NEXT_PUBLIC_SITE_URL`, media → `@payloadcms/storage-vercel-blob`, dev-push → migraties.
5. **Later-lijst (spec §1):** e-mailsync, support-inbox, social auto-publish, Cal.com, klant-deellinks, publieke kennisbank-rendering, kolom-slepen óp het board.

## Gotchas deze sessie

- **Dev-server als achtergrondproces wordt door de omgeving telkens gereapt.** Voor QA: Chris start `! npm run dev` onder zijn eigen terminal.
- **Admin-login-form is React-controlled** → programmatisch `.value` zetten werkt niet. Betrouwbaar inloggen voor browser-QA: `fetch('/api/users/login', {POST, credentials:'include', body:{email,password}})` in de paginacontext, dan navigeren. (Dev: chris@co-creatie.ai / humanmargin-dev-2026.)
- Admin staat op `theme:"light"` in `payload.config.ts` → dark niet zichtbaar voor gebruikers.

## Snelstart nieuwe sessie

```bash
npm run dev        # site :3000, dashboard-home op /admin
npm test           # 49 tests, lokale humanmargin_test-DB
npm run check      # lint + typecheck + build (SCSS compileert hierin)
```

Bij dashboardwerk: lees eerst skill `humanmargin-dashboard` (systeemindex + designsysteem).

— Dottie
