---
name: humanmargin-hostinger
description: Use when working with Els's Hostinger account or VPS (Hermes Agent-host srv1819178) — inspecting or managing the VPS, Docker projects, firewall, backups, domains, DNS or billing via the five hostinger MCP servers or the REST API, or answering questions about where Hermes runs and what it costs.
---

# Human Margin — Hostinger (VPS & account)

Els's Hostinger-account host de VPS waarop **Hermes Agent** draait — de geplande runtime-agent van het platform (zie wiki-pagina "Hermes Agent"). Dottie beheert dit van buitenaf via de Hostinger API. **Dit is productie-infra van Els: read-only calls zijn vrij; elke mutatie (reboot, snapshot/backup-restore, firewall, DNS, recreate, billing) eerst aan Chris voorleggen.**

## Wat het account bevat (inventaris 2026-07-13)

| Onderdeel | Stand |
|---|---|
| VPS | id `1819178`, plan KVM 2 (2 vCPU, 8 GB RAM, 100 GB disk, 8 TB bandbreedte), datacenter **Frankfurt** (id 19), template "Ubuntu 24.04 with Docker and Traefik", running sinds 2026-07-10 |
| Netwerk | hostname + PTR `srv1819178.hstgr.cloud`, IPv4 `187.124.188.147` (ip-id 1558384), IPv6 `2a02:4780:79:f36d::1` (ip-id 1865861), NS 153.92.2.6 / 1.1.1.1 |
| Docker-projecten | `hermes-agent-7zmf` (image `ghcr.io/hostinger/hvps-hermes-agent:latest`, containerpoort 4860, óók direct gepubliceerd op hostpoort 32768) en `traefik` (host-network, 80/443, HTTP→HTTPS, Let's Encrypt via http-challenge) |
| Hermes-URL | `https://hermes-agent-7zmf.srv1819178.hstgr.cloud` (Traefik-route met TLS); login staat in de `.env` op de VPS — **nooit ergens vastleggen** |
| Firewall | **géén** — er bestaat geen enkele firewall in het account en de VPS heeft geen firewall group (aandachtspunt, zie hieronder) |
| Beveiliging | Monarx niet geïnstalleerd; geen SSH-keys via de API geregistreerd; root-wachtwoord op 2026-07-13 via hPanel gezet (`ct_set_rootpasswd`); SSH met root-wachtwoord geverifieerd (2026-07-13) — het wachtwoord heeft alleen Chris, per sessie aan hem vragen en **nooit vastleggen** |
| Backups | automatische backups aanwezig (dagelijks-achtig ritme, restore ±30 min, locatie `node764-lt-bnk-2-pbs`); geen snapshot (`VPS_getSnapshotV1` → id 0) |
| Abonnement | subscription `AzqN7tVOxtL4MnuR` (KVM 2): **$275,88/jaar (USD)**, auto-renew AAN, volgende afschrijving **2027-06-26**; betaalmethode: kaart (default) |
| Domeinen | **humanmargin.eu staat NIET bij Hostinger** (NS `ns1/ns2.wpprovider.nl`, A `116.202.73.220` — WPProvider). In het account alleen een ongebruikt gratis-domein-tegoed (`pending_setup`) |
| Webhosting | geen — geen hosting-orders of -websites, geen DNS-zones |

Open aandachtspunten voor Chris/Els: firewall ontbreekt (SSH 22 én de onversleutelde Hermes-poort 32768 staan open voor de hele wereld), Monarx uit, en de verlenging is in USD met auto-renew aan.

## Hoe verbinden

**MCP (voorkeur):** vijf servers met local scope in `~/.claude.json` onder dit project — `hostinger-vps`, `hostinger-domains`, `hostinger-dns`, `hostinger-billing`, `hostinger-hosting` (npm-pakket `hostinger-api-mcp`, één pakket met vijf binaries). Toolnamen: `mcp__hostinger-<server>__<Domein>_<actie>V1` (bv. `mcp__hostinger-vps__VPS_getVirtualMachinesV1`). De tools zijn deferred: eerst laden via ToolSearch (`+hostinger` of `select:mcp__hostinger-vps__VPS_getVirtualMachinesV1,…`).

**curl-fallback** (werkt altijd, ook in de sessie waarin `claude mcp add` net gedraaid is):

```bash
TOKEN=$(python3 -c "import json;c=json.load(open('$HOME/.claude.json'));print(c['projects']['/Users/christianbleeker/Desktop/humanmargin']['mcpServers']['hostinger-vps']['env']['HOSTINGER_API_TOKEN'])")
curl -s -H "Authorization: Bearer $TOKEN" https://developers.hostinger.com/api/vps/v1/virtual-machines
```

Token-hygiëne: de `HOSTINGER_API_TOKEN` staat uitsluitend in `~/.claude.json` — nooit naar repo, wiki, handoffs of memory kopiëren. (De Payload-API-key van de Hermes-user in de kennisbank is een ándere key.)

## Werkregels

- **Read-only vrij**: lijsten, details, metrics, logs, compose-inhoud bekijken mag altijd.
- **Mutaties = eerst Chris**: start/stop/restart, recreate (wist alles!), snapshot maken (overschrijft de bestaande!), restore, firewall-wijzigingen, PTR/DNS/nameservers, domein-aankopen, auto-renewal aan/uit, Docker-projecten starten/stoppen/updaten.
- De API beheert de VPS van buitenaf én ziet de Docker-laag (projecten, containers, logs, compose+env via `VPS_getProjectListV1`/`VPS_getProjectContainersV1`/`VPS_getProjectLogsV1`/`VPS_getProjectContentsV1`). Voor alles daarbuiten (bestanden, processen buiten Docker) is SSH nodig — vraag Chris, niet raden.

## Gotchas (field-tested 2026-07-13)

- **`VPS_getProjectContentsV1` retourneert ook de `.env`** van het compose-project — inclusief het Hermes-adminwachtwoord. Die output nooit doorplakken naar wiki/handoff/memory/commits.
- **Docker-inzicht via de API werkt wél** — de oude aanname "de API kan niet ín de VPS kijken" (handoff 2026-07-13) is achterhaald; alleen non-Docker-zaken vereisen SSH.
- **Health-check ≠ token-check**: `claude mcp list` test alleen of de npx-server start; alleen een echte API-call bewijst dat de token geldig is.
- **MCP-tools verschijnen pas na sessieherstart** na `claude mcp add` — tot die tijd curl.
- `VPS_getAttachedPublicKeysV1` geeft `[VPS:2002] Route is not found` (endpoint-drift in het MCP-pakket); gebruik `VPS_getPublicKeysV1` (accountniveau).
- DNS-calls op een domein dat niet in het account zit geven een lege lijst `[]`, geen foutmelding — een leeg antwoord bewijst dus niet "geen records", alleen "niet hier beheerd".
- `VPS_getMetricsV1` vereist `date_from`/`date_to` (ISO) en keert per metriek een map `{unix-epoch-seconde: waarde}` terug; RAM/disk in bytes.
- Billing-catalogusprijzen zijn integers in centen (`27588` = $275,88).
- `VPS_getSnapshotV1` zonder snapshot geeft `id: 0` met nep-timestamps — dat is "geen snapshot", geen echte.
- Hostinger's API is camelCase op de wire; paginated lijsten volgen `{data, meta}`.
