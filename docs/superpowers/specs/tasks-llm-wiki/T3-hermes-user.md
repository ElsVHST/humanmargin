# T3 — Hermes-user + API-key-auth

**Bestanden:** `src/collections/Users.ts` (ALLEEN de `auth`-property) en `scripts/seed/seed-hermes.ts` (nieuw).
**PRD:** §2 B6, fase 1.4.

## Doel

Hermes Agent (VPS) moet via de REST API kunnen werken met een API-key in plaats van sessie-cookies, als eigen user met attributie.

## Deel 1 — Users.ts

Wijzig `auth: true` in:

```ts
auth: { useAPIKey: true },
```

Verder NIETS wijzigen. (Payload voegt hiermee `enableAPIKey`/`apiKey`-velden toe aan users; normale login blijft werken. De orchestrator draait `generate:types` in de integratiefase.)

## Deel 2 — `scripts/seed/seed-hermes.ts`

Idempotent seed-script naar het patroon van `scripts/seed/seed-agent-loop.ts` (lees dat eerst):

1. Vind user `hermes@humanmargin.eu`. Bestaat hij al → log `↷ hermes bestaat al` en stop (exit 0) ZONDER de key te roteren.
2. Anders: maak aan met `name: "Hermes (AI-agent)"`, `email: "hermes@humanmargin.eu"`, `role: "teamlid"`, willekeurig wachtwoord (`randomBytes(24).toString("hex")` — Hermes logt nooit in via de UI), `enableAPIKey: true`, `apiKey: randomUUID()` (uit `node:crypto`).
3. Print na aanmaken éénmalig duidelijk naar de console:
   ```
   ✓ Hermes-user aangemaakt.
   API-key (eenmalig getoond — bewaar in de VPS-env, NOOIT in het repo):
   <de key>
   Gebruik: Authorization: users API-Key <de key>
   ```
4. Afsluiten met `process.exit(0)`.

Let op: de TypeScript-types voor `enableAPIKey`/`apiKey` bestaan pas na `generate:types`; als de compiler er nu over klaagt, gebruik dan een gerichte cast op alleen die twee velden (bv. `data: { ...basis, ...( { enableAPIKey: true, apiKey } as Partial<User>) }` of een nette `@ts-expect-error` met één regel uitleg) en meld dit in je notities zodat de orchestrator het na `generate:types` opschoont.

## Acceptatie

- `Users.ts`-diff is exact één regel (de auth-property).
- Script volgt het idempotente patroon, draait NIET in deze taak (niet uitvoeren!).
- eslint schoon op beide bestanden.
