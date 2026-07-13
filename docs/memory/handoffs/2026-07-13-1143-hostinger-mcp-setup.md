# Handoff — Hostinger MCP geïnstalleerd; volgende sessie: verifiëren, VPS in kaart brengen, Hostinger-skill bouwen

**Datum:** 2026-07-13 11:43 · **Repo:** master, clean (deze handoff is de enige wijziging) · **Vorige handoff:** `2026-07-10-0132-projectenlaag-en-routekaart.md` (routekaart/projectenboard — blijft geldig, dit is een infra-zijspoor)

## Context: waarom Hostinger

Els heeft een **VPS bij Hostinger** gekocht waarop **Hermes Agent** is geïnstalleerd (Hermes = de runtime-agent die de wiki dagelijks onderhoudt, zie CLAUDE.md wiki-plicht). Chris wil dat Dottie via de Hostinger API met die VPS (en de rest van het Hostinger-account) kan werken.

## Wat er in deze sessie is gedaan (2026-07-13)

1. **Vijf Hostinger MCP-servers geregistreerd** via `claude mcp add`, allemaal met **local scope** (dus opgeslagen in `~/.claude.json` onder project `/Users/christianbleeker/Desktop/humanmargin` — bewust NIET als `.mcp.json` in de repo, want de API-token is een secret en deze repo wordt gepusht):
   - `hostinger-hosting` · `hostinger-domains` · `hostinger-dns` · `hostinger-billing` · `hostinger-vps`
   - Elk: `npx --package=hostinger-api-mcp@latest <naam>-mcp` met `HOSTINGER_API_TOKEN` als env var.
   - **De token staat dus in `~/.claude.json`** (zoek op `HOSTINGER_API_TOKEN`). Nooit in repo-bestanden zetten, ook niet in handoffs of de wiki.
2. **Health-check**: `claude mcp list` → alle vijf ✔ Connected.
3. **Token live geverifieerd** met een read-only curl-call naar `https://developers.hostinger.com/api/vps/v1/virtual-machines` (Bearer-auth) → HTTP 200.
4. **Geheugen**: memory-bestand `hostinger-vps.md` aangemaakt (+ regel in MEMORY.md-index).

## De VPS (uit de API, 2026-07-13)

| Veld | Waarde |
|---|---|
| VPS-id | `1819178` |
| Plan | KVM 2 — 2 vCPU, 8 GB RAM, 100 GB disk |
| Hostname | `srv1819178.hstgr.cloud` |
| IPv4 | `187.124.188.147` |
| IPv6 | `2a02:4780:79:f36d::1` |
| Template | Ubuntu 24.04 with Docker and Traefik |
| Status | running · aangemaakt 2026-07-10 |
| Subscription | `AzqN7tVOxtL4MnuR` · firewall_group: geen |

## ⚡ Directe opdracht voor de volgende sessie (Chris hoeft dit niet opnieuw te vragen)

Werk dit zelfstandig af, in deze volgorde:

### 1. Verifiëren dat de MCP-koppeling echt werkt
- De tools heten `mcp__hostinger-<server>__*` en zijn er pas ná sessieherstart — deze handoff wordt per definitie in een nieuwe sessie gelezen, dus ze horen er nu te zijn. Laad ze via ToolSearch (bv. `+hostinger vps`) en doe een echte call (VPS-lijst) om te bevestigen.
- Werkt het niet: `claude mcp list` draaien, en als fallback werkt de REST API altijd direct via curl met de Bearer-token uit `~/.claude.json` (base-URL `https://developers.hostinger.com`).

### 2. Alle info van Hostinger ophalen en vastleggen
Loop alle vijf servers af en inventariseer (read-only; niets muteren):
- **vps**: VM-details, beschikbare acties/tools (snapshots, firewall, recovery, metrics, PTR, …), huidige firewall-stand (er is nu géén firewall group — aandachtspunt, benoem dit aan Chris).
- **domains**: welke domeinen in het account zitten (staat humanmargin.eu bij Hostinger of elders?).
- **dns**: records van de gevonden domeinen — relevant voor waar Hermes Agent straks bereikbaar op wordt (Traefik draait al op de VPS).
- **billing**: abonnement(en) en verloopdata van de VPS — Els moet weten wanneer wat verlengt.
- **hosting**: of er naast de VPS nog webhosting-pakketten zijn.
- Let op: de Hostinger API beheert de VPS van buitenaf; hij kan **niet ín de VPS kijken** (geen docker ps, geen logs van Hermes). Wat er ín de VPS draait vereist SSH — vraag Chris naar SSH-toegang als dat nodig blijkt, niet zelf proberen te raden.

### 3. Skill(s) bouwen zodat Hostinger-kennis blijvend is
- Maak projectskill **`.claude/skills/humanmargin-hostinger/SKILL.md`** (zelfde stijl als de drie bestaande skills). Inhoud minimaal:
  - Wat het account bevat (VPS-feiten, domeinen, abonnementen — uit stap 2).
  - Hoe verbinden: de vijf MCP-servers + toolnamen, de curl-fallback met token-locatie (`~/.claude.json`, local scope dit project), base-URL.
  - Werkregels: read-only vrij; mutaties (reboot, snapshot restore, DNS-wijziging, firewall) altijd eerst aan Chris voorleggen — dit is Els's productie-VPS met Hermes erop.
  - Gotchas van hieronder overnemen.
- **Onderhoudsplicht CLAUDE.md**: nieuwe rij in de skills-indextabel.
- **Wiki-plicht**: Platform-wiki-pagina over de VPS/Hermes-infra aanmaken of bijwerken + Index + `[ingest]`-log-activity op de wiki-root, daarna `scripts/agent/build-second-brain.sh`.
- Memory `hostinger-vps.md` bijwerken met wat stap 2 oplevert (kort houden, details horen in de skill/wiki).

## Gotchas

- **Health-check ≠ token-check**: `claude mcp list` test alleen of de npx-server start; alleen een echte API-call bewijst dat de token geldig is (deze sessie: HTTP 200 gezien).
- **MCP-tools laden pas na sessieherstart** — in de sessie waarin je `claude mcp add` draait kun je alleen via curl bij de API.
- **Token-hygiëne**: de token staat uitsluitend in `~/.claude.json`. Niet naar repo, wiki, handoffs of memory kopiëren. (In de kennisbank zit ook een aparte Hermes-user met eigen API-key — dat is een ándere key, voor de Payload-API.)
- Hostinger's npm-pakket is `hostinger-api-mcp` met één package en vijf binaries (`hostinger-<domein>-mcp`).

## Openstaand (ongewijzigd uit vorige handoff)

- ⬜ Pushen wacht op akkoord Chris; werkvoorraad staat op het projectenboard `/admin/projecten`; Els's 8 vragen blokkeren fase B/D/F; Vercel-deploy open.

— Dottie
