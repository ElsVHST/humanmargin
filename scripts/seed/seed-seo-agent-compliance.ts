/**
 * SEO — AI-agent-compliance (positionering): referentiedocs in de kennisbank
 * + project met taken op het bord, Dottie eindverantwoordelijk.
 * Ontstaan: meeting Chris + Els, 2026-07-10. Idempotent (zoekt op titel/naam).
 * Draaien: npx payload run scripts/seed/seed-seo-agent-compliance.ts
 */
import { getPayload } from "payload";

import config from "@payload-config";
import { markdownNaarLexical } from "@/modules/knowledge/wiki/wikiMarkdown";

const payload = await getPayload({ config });

const dottie = (
  await payload.find({
    collection: "users",
    where: { email: { equals: "dottie@humanmargin.eu" } },
    limit: 1,
  })
).docs[0];
if (!dottie) {
  console.error("Dottie-user niet gevonden — draai eerst seed-agent-loop.ts");
  process.exit(1);
}

/* ── 1. Kennisbank: map + referentiedocumenten ─────────────────────── */

const MAP_TITEL = "SEO — AI-agent-compliance";

const DOCS: { titel: string; markdown: string }[] = [
  {
    titel: "Plan — AI-agent-compliance-positionering (SEO/GEO)",
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** vastgesteld in meeting Chris + Els · **Bronnen:** braindump-analyse §1/§5, meeting 2026-07-10

Human Margin positioneert zich de komende 12 maanden als dé Nederlandse autoriteit voor **AI-agent-compliance in het MKB**: als jouw agent straks inkoopt, onderhandelt en mailt, blijft de mens in de marge eindverantwoordelijk — en wij leren je hoe dat compliant kan.

## Waarom nu

- Over een jaar hebben MKB-ondernemers agents die zelfstandig taken uitvoeren en aankopen doen; die inzet moet compliant zijn (AI Act, AVG, consumentenrecht, aansprakelijkheid).
- De Nederlandse zoekruimte "AI-agents + compliance + MKB" is nu vrijwel leeg — wie er dit jaar autoriteit opbouwt, bezit hem straks.
- De AI Act-kalender rolt gefaseerd uit: elke deadline is een nieuwsmoment waarop wij al klaarstaan.
- Het past naadloos op het merk: de menselijke marge = regie over je agents. De MKB'er wordt juridisch "deployer" — exact de as van Els's kwadrant (aanbieder/gebruiker × zzp/mkb).

## De vier bouwstenen

1. **Fundament (maand 1-2):** site live (Vercel-deploy = ook de SEO-poort) + publieke kennisbank-rendering (fase C naar voren) + dubbele vindbaarheid: klassieke SEO (schema.org, interne links, sitemap) én LLM-vindbaarheid/GEO (definities, FAQ-blokken, citeerbare bronpagina's, llms.txt).
2. **Contentmachine (doorlopend):** pillar + clusters (zie de pillar-cluster-kaart in deze map). Productie via de bestaande machine: Els spreekt in → transcript→concept-flow (W1) → concept op de site; **Els publiceert — niets gaat automatisch live** (kader). Repurposing (W2) maakt van elke masterclass 2-3 artikelen + posts. Tempo: 2-4 stukken per maand.
3. **Linkbare assets:** de Reality Check uitgebreid met het agent-perspectief ("hoe compliant is jouw (toekomstige) agent-inzet?") als gratis tool = linkmagneet. Afhankelijk van Els's 8 vragen (fase B).
4. **Meten:** nulmeting + zoektermenlijst nu; daarna maandelijks ritme (posities, organisch verkeer, check-invullingen per artikel) — v1 handmatig, later in de Cijfers-view (fase G, W26). De ochtendmail (W18) is tegelijk de actualiteits-radar: relevant nieuws = artikel binnen 48 uur.

## Tijdlijn

- **Maand 1-2:** deploy + publieke kennisbank + pijlerpagina + nulmeting
- **Maand 2-4:** eerste clusterlaag (8-10 artikelen) + check live
- **Maand 4-8:** sector-verdieping (fotografen, recruiters, VA's, finance, makelaars) + repurposing op volle toeren
- **Maand 8-12:** autoriteit verzilveren: gastbijdragen, sprekersklussen als linkbron, EN-varianten overwegen

## Kaders

Niets publiceert automatisch; Els reviewt en publiceert elk stuk. Content is feitelijk en bronvast (het merk moet voorbeeldig zijn, ook AVG-gewijs). Geen valse beloftes over rankings — maandelijks meten en bijsturen.`,
  },
  {
    titel: "Pillar-cluster-kaart + zoektermen (agent-compliance)",
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** eerste opzet — nulmeting moet de lijst valideren · **Bronnen:** plan-document in deze map

Eén pijlerpagina met daaromheen clusterartikelen die er intern naar linken. Nederlands eerst (doelgroep + lage concurrentie); EN pas vanaf maand 8+.

## Pijler

**"AI-agents en compliance voor het MKB — de complete gids"** — definitie van agents, wat er verandert voor de MKB'er (van gebruiker naar deployer), de wettelijke kaders in mensentaal, en de Human Margin Method als aanpak.

## Clusters (eerste laag, elk 1 artikel)

1. Jouw AI-agent doet een aankoop — wie is er aansprakelijk?
2. De AI Act voor deployers: wat moet je geregeld hebben als je agents inzet?
3. Transparantieplicht: moet je klant weten dat hij met een agent praat?
4. Agents en de AVG: klantdata in handen van een autonome assistent
5. Agent-washing: hoe herken je leveranciers die "agent" roepen zonder compliance?
6. De agent-compliance-checklist voor MKB'ers (linkbare asset)
7. Wat betekent agentic commerce voor jouw webshop/dienstverlening?
8. Menselijk toezicht op agents: hoe houd je de marge in de praktijk?

## Sector-verdieping (tweede laag, maand 4-8)

Per sector pack: fotografen · recruiters · virtual assistants · finance · makelaars — "AI-agents in [sector]: wat mag wel en niet?"

## Zoektermen-hypothesen (valideren in de nulmeting)

- ai agent compliance / ai agents inzetten mkb / ai act agents
- ai agent aansprakelijkheid / ai agent aankopen doen
- ai act deployer verplichtingen / ai act mkb checklist
- agentic commerce nederland / autonome ai agents bedrijf
- (GEO/LLM-varianten: vraagvormen — "mag mijn ai agent…", "is een ai agent aansprakelijk…")

## GEO-principes per artikel

Heldere definitie bovenaan · FAQ-blok met vraagvormen · bronvermeldingen naar primaire bronnen (EUR-Lex, toezichthouders) · schema.org Article+FAQ · citeerbare one-liners.`,
  },
  {
    titel: "Artikelkalender Q1 (agent-compliance)",
    markdown: `**Laatst bijgewerkt:** 2026-07-10 door Dottie · **Status:** skelet — vullen zodra de nulmeting klaar is · **Bronnen:** pillar-cluster-kaart in deze map

Ritme: 2-4 stukken per maand, geproduceerd via inspreken → transcript→concept-flow; Els publiceert. Elk stuk wordt een content-item in de kalender (kanaal blog, status idee → concept → gepland).

## Maand 1

1. Pijlerpagina — AI-agents en compliance voor het MKB (fundament, alles linkt hierheen)
2. Cluster 1 — aansprakelijkheid bij agent-aankopen (nieuwswaardig, deelbaar)

## Maand 2

3. Cluster 2 — AI Act voor deployers
4. Cluster 6 — de agent-compliance-checklist (linkbare asset, promoten via LinkedIn + In de Marge)

## Maand 3

5. Cluster 3 — transparantieplicht
6. Cluster 4 — agents en de AVG
7. (actualiteit) — eerste ochtendmail-signaal uitwerken tot artikel

## Werkafspraken

- Elk artikel: GEO-principes uit de pillar-kaart toepassen; interne links naar pijler + verwante clusters; CTA naar de (agent-)check zodra die live is.
- Publicatiedata in de contentkalender zetten zodra Els's reviewritme bekend is.`,
  },
];

let map = (
  await payload.find({
    collection: "knowledge-docs",
    where: { and: [{ titel: { equals: MAP_TITEL } }, { soort: { equals: "map" } }] },
    limit: 1,
  })
).docs[0];
if (!map) {
  map = await payload.create({
    collection: "knowledge-docs",
    data: {
      titel: MAP_TITEL,
      soort: "map",
      zichtbaarheid: "intern",
      tags: ["seo", "strategie"],
    },
    overrideAccess: false,
    user: dottie,
  });
  console.log(`✓ kennisbank-map '${MAP_TITEL}'`);
} else {
  console.log(`↷ kennisbank-map '${MAP_TITEL}' bestaat al`);
}

const docIds: number[] = [];
for (const docDef of DOCS) {
  const bestaand = (
    await payload.find({
      collection: "knowledge-docs",
      where: {
        and: [{ titel: { equals: docDef.titel } }, { parent: { equals: map.id } }],
      },
      limit: 1,
    })
  ).docs[0];
  const inhoud = (await markdownNaarLexical(docDef.markdown)) as unknown as Record<
    string,
    unknown
  >;
  if (bestaand) {
    await payload.update({
      collection: "knowledge-docs",
      id: bestaand.id,
      data: { inhoud: inhoud as never },
      overrideAccess: false,
      user: dottie,
    });
    docIds.push(bestaand.id);
    console.log(`↷ document '${docDef.titel}' bestond al — inhoud ververst`);
  } else {
    const nieuw = await payload.create({
      collection: "knowledge-docs",
      data: {
        titel: docDef.titel,
        soort: "document",
        zichtbaarheid: "intern",
        parent: map.id,
        tags: ["seo", "strategie"],
        inhoud: inhoud as never,
      },
      overrideAccess: false,
      user: dottie,
    });
    docIds.push(nieuw.id);
    console.log(`✓ document '${docDef.titel}'`);
  }
}
const [planId, kaartId, kalenderId] = docIds;

/* ── 2. Project + taken ────────────────────────────────────────────── */

const PROJECT_NAAM = "SEO — AI-agent-compliance (positionering)";

const gepland = (
  await payload.find({
    collection: "project-fases",
    where: { naam: { equals: "Gepland" } },
    limit: 1,
  })
).docs[0]?.id ?? null;
const todo = (
  await payload.find({
    collection: "task-statuses",
    where: { naam: { equals: "To-do" } },
    limit: 1,
  })
).docs[0]?.id ?? null;

let project = (
  await payload.find({
    collection: "projects",
    where: { naam: { equals: PROJECT_NAAM } },
    limit: 1,
  })
).docs[0];
if (!project) {
  project = await payload.create({
    collection: "projects",
    data: {
      naam: PROJECT_NAAM,
      status: "actief",
      fase: gepland,
      position: 50_000,
      teamleden: [dottie.id],
      omschrijving:
        "Human Margin over 12 maanden bovenaan (Google én LLM-zoek) op AI-agent-compliance voor het MKB. Vastgesteld in de meeting Chris + Els van 2026-07-10. Eindverantwoordelijk: Dottie. Volledige referentiedocumentatie: kennisbank-map 'SEO — AI-agent-compliance' (plan, pillar-cluster-kaart, artikelkalender Q1).",
      referenties: docIds,
    },
    overrideAccess: false,
    user: dottie,
  });
  console.log(`✓ project '${PROJECT_NAAM}'`);
} else {
  console.log(`↷ project '${PROJECT_NAAM}' bestaat al`);
}

type TaakDef = {
  titel: string;
  omschrijving: string;
  prioriteit: "laag" | "normaal" | "hoog";
  contextVooraf?: string;
  definitionOfDone?: string;
  referenties: number[];
  checklist?: string[];
};

const TAKEN: TaakDef[] = [
  {
    titel: "Nulmeting + zoektermenlijst valideren (SEO/GEO)",
    omschrijving:
      "Huidige posities vastleggen en de zoektermen-hypothesen uit de pillar-cluster-kaart valideren (volumes, concurrentie, vraagvormen voor LLM-zoek). Resultaat terugschrijven in de kaart.",
    prioriteit: "hoog",
    contextVooraf: "Lees eerst het plan en de pillar-cluster-kaart (referenties).",
    definitionOfDone:
      "Pillar-cluster-kaart bijgewerkt met gevalideerde termen + nulmeting-sectie; meetritme (maandelijks) afgesproken.",
    referenties: [planId, kaartId],
  },
  {
    titel: "SEO/GEO-fundament op de site (schema.org, sitemap, llms.txt)",
    omschrijving:
      "Technische vindbaarheid voor mens én machine: schema.org Article+FAQ op blogpagina's, sitemap, meta-structuur, llms.txt. Hangt samen met de Vercel-deploy en de publieke kennisbank-rendering (project 'Fase C — Publiek + rapporten' — niet dubbel bouwen).",
    prioriteit: "hoog",
    contextVooraf:
      "Afhankelijkheid: site moet live (deploy). Rendering zelf zit in fase C; deze taak is de SEO-laag erbovenop.",
    definitionOfDone:
      "Blogartikelen renderen met correcte structured data; llms.txt en sitemap live; gecheckt met een validator.",
    referenties: [planId],
  },
  {
    titel: "Pijlerpagina 'AI-agents en compliance voor het MKB' — concept",
    omschrijving:
      "De complete gids als pijlerpagina, geschreven volgens de GEO-principes uit de kaart. Als concept klaargezet — Els reviewt en publiceert (kader!).",
    prioriteit: "hoog",
    contextVooraf: "Pillar-cluster-kaart is leidend voor structuur en interne links.",
    definitionOfDone:
      "Concept-content-item (kanaal blog) + conceptpagina staan klaar voor Els's review; interne linkstructuur naar toekomstige clusters voorbereid.",
    referenties: [planId, kaartId],
  },
  {
    titel: "Eerste clusterlaag als content-items in de kalender (8 stuks)",
    omschrijving:
      "De 8 clusterartikelen uit de kaart als content-items (status idee) in de contentkalender zetten, verdeeld volgens de artikelkalender Q1, met per item een korte brief.",
    prioriteit: "normaal",
    definitionOfDone:
      "8 content-items met kanaal blog, status idee, brief + koppeling aan dit project; kalender Q1 gevuld.",
    referenties: [kaartId, kalenderId],
  },
  {
    titel: "Agent-perspectief in de Reality Check definiëren",
    omschrijving:
      "De check (fase B) conceptueel uitbreiden met agent-inzet ('hoe compliant is jouw (toekomstige) agent-inzet?') zodat hij dé linkbare asset van deze positionering wordt. Wacht op Els's 8 vragen (project 'Input van Els').",
    prioriteit: "normaal",
    contextVooraf: "Geblokkeerd tot de 8 vragen (braindump §6) beantwoord zijn.",
    definitionOfDone:
      "Voorstel voor agent-vragen + uitkomst-aanpassingen ligt bij Els/Chris ter review.",
    referenties: [planId],
  },
  {
    titel: "Maandelijks meetritme inrichten (posities/verkeer/check-invullingen)",
    omschrijving:
      "V1 handmatig (maandelijkse notitie op dit project), later tegels in de Cijfers-view (fase G, W26).",
    prioriteit: "normaal",
    definitionOfDone:
      "Eerste maandmeting staat als notitie op de tijdlijn van dit project; ritme herhaalt maandelijks.",
    referenties: [planId],
  },
  {
    titel: "EN-varianten overwegen (maand 8+)",
    omschrijving:
      "Pas na bewezen NL-tractie: pijler + top-clusters vertalen/lokaliseren voor de EU-markt.",
    prioriteit: "laag",
    referenties: [planId, kaartId],
  },
];

let positie = 1000;
for (const taak of TAKEN) {
  const bestaand = await payload.find({
    collection: "tasks",
    where: {
      and: [{ titel: { equals: taak.titel } }, { project: { equals: project.id } }],
    },
    limit: 1,
  });
  if (bestaand.docs[0]) {
    console.log(`  ↷ taak '${taak.titel}' bestaat al`);
    positie += 1000;
    continue;
  }
  await payload.create({
    collection: "tasks",
    data: {
      titel: taak.titel,
      omschrijving: taak.omschrijving,
      prioriteit: taak.prioriteit,
      status: todo,
      project: project.id,
      position: positie,
      toegewezen: dottie.id,
      contextVooraf: taak.contextVooraf,
      definitionOfDone: taak.definitionOfDone,
      referenties: taak.referenties,
      checklist: (taak.checklist ?? []).map((tekst) => ({ tekst, klaar: false })),
    },
    overrideAccess: false,
    user: dottie,
  });
  console.log(`  ✓ taak '${taak.titel}'`);
  positie += 1000;
}

/* ── 3. Log op de tijdlijn van het project ─────────────────────────── */

const logBestaat = await payload.find({
  collection: "activities",
  where: {
    and: [
      { type: { equals: "log" } },
      { "targets.value": { equals: project.id } },
      { samenvatting: { contains: "[ingest] SEO-project aangemaakt" } },
    ],
  },
  limit: 1,
});
if (!logBestaat.docs[0]) {
  await payload.create({
    collection: "activities",
    data: {
      type: "log",
      samenvatting:
        "[ingest] SEO-project aangemaakt n.a.v. meeting Chris + Els (2026-07-10): positionering op AI-agent-compliance voor MKB; plan + pillar-kaart + kalender in de kennisbank; 7 taken; Dottie eindverantwoordelijk.",
      targets: [{ relationTo: "projects", value: project.id }],
      happensAt: new Date().toISOString(),
    },
    overrideAccess: false,
    user: dottie,
  });
  console.log("✓ log-activity op het project");
} else {
  console.log("↷ log-activity bestaat al");
}

console.log("✓ SEO — AI-agent-compliance staat op het bord");
process.exit(0);
