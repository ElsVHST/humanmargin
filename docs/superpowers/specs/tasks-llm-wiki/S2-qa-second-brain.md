# S2 — browser-simulatie: Second Brain-werkblad

**Rol:** QA-agent. Echte browser tegen de dev-server; geen code wijzigen; bevindingen rapporteren. Zelfde omgeving/login/tools/dataregels als S1 (lees `S1-qa-kennisbank-wiki.md` §Omgeving).

**Designreferentie:** PRD §6.3 in `docs/superpowers/specs/2026-07-10-llm-wiki-hermes-prd.md` — de bindende designtaal (marge met rode kantlijn, kanttekeningen in serif-cursief, geel exclusief voor selectie/zoek, statusbalk met Hermes-attributie).

## Testscenario's

1. **Rail-link:** in de linker-rail staat een Second Brain-item (Brain-icoon); klik → `/admin/second-brain` laadt; actieve staat zichtbaar op de rail.
2. **Graph rendert:** canvas toont nodes met clusterkleuren; de marge (links) toont kanttekening, "Meest verbonden", legenda met clusters + aantallen; statusbalk onderaan toont documenten/verbindingen/clusters + verversingsinfo. Screenshot op 1440px.
3. **Hover-focus:** beweeg over een node → buurt licht op, rest dimt, cursor wordt pointer.
4. **Klik + inspector:** klik een node → gele selectiering + inspector rechts met titel, pillen, buren-lijst. Klik een buur in de lijst → camera vliegt, selectie wisselt.
5. **Doorklik naar kennisbank:** knop "Openen in kennisbank" (of dubbelklik op de node) → navigeert naar `/admin/kennisbank?doc=<id>` en het JUISTE document opent (vergelijk titels!). Dit is de kernintegratie — test het met minstens 3 verschillende nodes uit verschillende clusters.
6. **Zoeken:** ⌘K (of klik zoekveld), typ "Hermes" → dropdown met resultaat; Enter/klik → camera vliegt naar de node, selectie actief.
7. **Legenda-toggle:** klik een cluster in de legenda → nodes van dat cluster dimmen/verdwijnen; nogmaals → terug.
8. **Toggles:** "Afgeleide verbanden" uit → gestippelde edges verdwijnen; "Alle labels" aan → labels overal.
9. **Performance:** de pagina blijft vloeiend bij pannen/zoomen (geen zichtbare bevriezing); rapporteer subjectief + eventuele long-task-warnings in de console.
10. **Leeg-state (alleen visueel controleerbaar als er geen graph is — sla over als er data is; noteer dat).**
11. **Console-hygiëne:** zoals S1-scenario 8.

## Rapportage

Zelfde structured-output-vorm als S1. Vergelijk expliciet met de designtaal uit PRD §6.3: elke afwijking (kleuren, marge ontbreekt, geel te breed gebruikt, Engelse teksten) is een bevinding met ernst "hoog".
