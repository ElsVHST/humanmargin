# S3 — browser-simulatie: mobiel (390px) + donker thema

**Rol:** QA-agent. Echte browser tegen de dev-server; geen code wijzigen; bevindingen rapporteren. Zelfde omgeving/login/tools/dataregels als S1 (lees `S1-qa-kennisbank-wiki.md` §Omgeving). QA-viewports van dit project: 390 (mobiel) en 1440 (desktop).

## Testscenario's

**Mobiel (viewport 390×844, via browser_resize/emulatie):**
1. `/admin/kennisbank`: rail is een bottom-tab-bar; de verkenner is bruikbaar (geen horizontale body-scroll); open de Platform-wiki-map en een wiki-pagina via dubbelklik (of tap-equivalent) → DocPanel bruikbaar op mobiel.
2. Deep-link mobiel: `/admin/kennisbank?doc=<id van een wiki-pagina>` → document opent, geen kapotte layout.
3. `/admin/second-brain`: canvas vult het scherm; marge is bereikbaar via de "In de marge"-knop of gelijkwaardig patroon; inspector verschijnt als bottom-sheet/paneel dat sluitbaar is; statusbalk overlapt de bottom-tab-bar niet.
4. Pinch/scroll: pannen werkt met touch-drag (of muis-drag equivalent); de pagina zelf scrollt NIET mee (geen rubber-banding van de body).

**Donker thema (viewport 1440):**
5. Zet het thema om: OS-emulatie (`emulate` met prefers-color-scheme dark, of via het Payload-accountmenu als dat een schakelaar heeft). Controleer `/admin/kennisbank` + een open wiki-document: leesbaar contrast, geen wit-op-wit of zwart-op-zwart.
6. `/admin/second-brain` donker: canvas-achtergrond off-black; nodekleuren en labels leesbaar; marge/kantlijn zichtbaar; inspector-panel donker gestyled; het gele accent is zichtbaar op selectie.
7. Wissel LIVE van thema terwijl de graph openstaat → canvas-kleuren volgen zonder herlaad (MutationObserver-gedrag); rapporteer als een herlaad nodig is.

**Toegankelijkheid (snel):**
8. Tab-navigatie op /admin/second-brain: zoekveld, toggles, legenda en inspector-knoppen zijn focusbaar met zichtbare focus-ring.

## Rapportage

Zelfde structured-output-vorm als S1, met screenshot-bewijs per scenario (mobiel + dark apart).
