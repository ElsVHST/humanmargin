# T1 — `?doc=` deep-link op het kennisbank-werkblad

**Bestand (alleen dit):** `src/modules/knowledge/views/kennisbank/KennisbankBrowser.tsx`
**PRD:** §2 B3 en fase 1.1.

## Doel

Een kennisdocument moet via URL deelbaar en openbaar zijn: `/admin/kennisbank?doc=<id>` opent het document direct in het juiste paneel. Dit is hetzelfde patroon als `?deal=`/`?taak=`/`?project=` op de andere werkbladen. Wiki-links en het Second Brain-werkblad gaan hierheen linken.

## Huidig gedrag (lees de component eerst volledig)

`KennisbankBrowser.tsx` is een grote client-component ("use client") die documenten via REST laadt en panelen opent via **lokale state**: dubbelklik op een document zet state die `DocPanel` (bewerken, soort=document) of `LeesPanel`/detail (soort=bestand) rendert. Er is nu géén koppeling met de URL.

## Te bouwen

1. Lees de query-param met `useSearchParams()` uit `next/navigation` en gebruik `useRouter()` + `usePathname()` voor updates.
2. **Bij laden / param-wijziging:** als `?doc=<id>` aanwezig is en het document is geladen (of haal het los op via `GET /api/knowledge-docs/<id>?depth=1` met `credentials: "include"` als het niet in de huidige lijst zit — het kan in een andere map staan):
   - `soort === "document"` → open het DocPanel voor dat doc (dezelfde state-setter als dubbelklik);
   - `soort === "bestand"` → open de leesweergave/detail zoals dubbelklik dat doet;
   - `soort === "map"` → navigeer de verkenner naar die map (breadcrumb-state).
   - Niet gevonden/verwijderd → param stil negeren en verwijderen uit de URL (geen crash, geen lege panel).
3. **Synchronisatie andersom:** wanneer de gebruiker een document opent (dubbelklik of contextmenu → openen), zet dan `?doc=<id>` in de URL via `router.replace(pathname + "?doc=" + id, { scroll: false })` met behoud van eventuele andere params. Bij het sluiten van het paneel verwijder je alléén de `doc`-param (andere params blijven staan).
4. Gebruik `URLSearchParams` op de bestaande searchParams om andere params te behouden — kijk voor het patroon naar `useMetParams()` in `src/modules/crm/views/relaties/RelatiePanelen.tsx` (die is geëxporteerd; kopieer het patroon, importeer alleen als dat zonder circulaire import kan — anders lokaal nabouwen).
5. Let op de React-lintregels: geen `setState` in een effect dat afgeleide state spiegelt. Voor het openen-op-param is een effect dat op `searchParams` reageert wél legitiem (het is externe input), maar guard tegen loops: alleen handelen als de param afwijkt van wat al open is.

## Acceptatie

- `/admin/kennisbank?doc=<id-van-document>` opent het DocPanel met dat document; sluiten haalt de param weg.
- Dubbelklik op een document zet de param; kopieerbare URL heropent exact dezelfde staat.
- Onbekende id: geen crash, param wordt opgeruimd.
- `npx eslint src/modules/knowledge/views/kennisbank/KennisbankBrowser.tsx --max-warnings=0` is schoon.
