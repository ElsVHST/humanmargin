# S1 — browser-simulatie: kennisbank + wiki (deep-link, panelen, bewerken)

**Rol:** QA-agent. Je test in een échte browser tegen de draaiende dev-server. Je wijzigt GEEN code. Je rapporteert bevindingen; fixen doet de orchestrator.

## Omgeving

- Dev-server: `http://localhost:3000` (draait al — NIET herstarten).
- Login: `chris@co-creatie.ai` / `humanmargin-dev-2026` via het formulier op `/admin` (of, als de sessie stil verloopt en je 403's ziet in de console: in paginacontext `await fetch('/api/users/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'chris@co-creatie.ai', password:'humanmargin-dev-2026'})})` en herlaad).
- Browser-tools: laad de Playwright-MCP-tools via ToolSearch (bv. `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_take_screenshot`). **Gebruik echte interacties** (click/fill), geen synthetische dispatchEvent — React-handlers missen die soms.
- Dataregels: dit is een echte database. Alleen lezen + hooguit testdocumenten aanmaken met prefix `QA-` in de titel, en die aan het eind weer naar de prullenbak verplaatsen. NIETS anders wijzigen of verwijderen; wiki-pagina's alleen LEZEN (autosave in het DocPanel schrijft bij typen — typ dus NIET in bestaande wiki-pagina's; maak voor de bewerk-test een eigen QA-document).

## Testscenario's (allemaal uitvoeren, per stuk screenshot als bewijs)

1. **Wiki aanwezig:** `/admin/kennisbank` → map "Platform-wiki" bestaat; open hem; submappen (Werkbladen, Modules & data, Automatiseringen, API & integraties, Roadmap & wensen, Agents) + 4 root-pagina's zichtbaar.
2. **Pagina lezen:** dubbelklik `Overzicht — het Human Margin-platform` → DocPanel opent met nette content (kopblok, koppen, geen rauwe markdown-syntax, geen `[[...]]`-restanten). Controleer dat de URL nu `?doc=<id>` bevat.
3. **Deep-link:** kopieer die URL, navigeer naar een andere pagina (`/admin`), plak de URL → zelfde document opent direct. Sluit het paneel → `doc`-param verdwijnt, verkenner blijft werken.
4. **Wiki-links:** open `Hermes Agent` (map Agents). Klik in de inhoud op een interne link (bv. naar Kaders of Index) → verwacht: het gelinkte document opent (zelfde tab, `?doc=` wisselt). Rapporteer wat er écht gebeurt (dit is de kern van B3!).
5. **Ongeldige deep-link:** `/admin/kennisbank?doc=999999` → geen crash; param wordt opgeruimd of stil genegeerd.
6. **Bewerken:** maak via "+ Nieuw" een document `QA-test-<tijd>` aan, typ een paar regels, wacht op "Opgeslagen", sluit, heropen → inhoud staat er nog. Verplaats daarna naar prullenbak.
7. **Zoeken:** zoek in de kennisbank op "Hermes" → de Hermes Agent-pagina verschijnt in de resultaten.
8. **Console-hygiëne:** verzamel gedurende alles de browser-console (`list_console_messages`/equivalent) — rapporteer elke error/warning die met onze features samenhangt (403's na sessieverloop mag je negeren als login ze oplost).

## Rapportage (structured output)

`status`: "groen" | "bevindingen". `bevindingen`: array van `{ernst: "blocker"|"hoog"|"laag", titel, scenario, stappen, verwacht, werkelijk}`. `notities`: overige observaties (traagheid, visuele rariteiten, tekstfouten). Wees precies: een bevinding zonder reproduceerbare stappen is niets waard.
