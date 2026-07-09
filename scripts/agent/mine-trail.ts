/**
 * In-the-loop OS, OP 5 — "Mine the trail": exporteert de paper trail
 * (taken + comments/vragen/LOG's) van de afgelopen periode als markdown,
 * zodat een agent er patronen uit kan halen (wat herhaalt zich, welke
 * vragen komen terug, waar stokt werk op de mens).
 *
 * Draaien: npx payload run scripts/agent/mine-trail.ts        (90 dagen)
 *          DAGEN=30 npx payload run scripts/agent/mine-trail.ts
 */
import { getPayload } from "payload";

import config from "@payload-config";

const payload = await getPayload({ config });

const dagen = Number(process.env.DAGEN ?? 90);
const cutoff = new Date(Date.now() - dagen * 86_400_000).toISOString();

const [taken, activiteiten] = await Promise.all([
  payload.find({
    collection: "tasks",
    where: { updatedAt: { greater_than: cutoff } },
    sort: "-updatedAt",
    limit: 1000,
    depth: 1,
    trash: true,
  }),
  payload.find({
    collection: "activities",
    where: { happensAt: { greater_than: cutoff } },
    sort: "happensAt",
    limit: 2000,
    depth: 1,
  }),
]);

function naam(rel: unknown): string {
  if (rel && typeof rel === "object") {
    const o = rel as { naam?: string; name?: string; titel?: string };
    return o.naam ?? o.name ?? o.titel ?? "?";
  }
  return "—";
}

const perTaak = new Map<number, typeof activiteiten.docs>();
for (const a of activiteiten.docs) {
  for (const t of a.targets ?? []) {
    if (t.relationTo === "tasks") {
      const id = typeof t.value === "object" ? t.value.id : t.value;
      perTaak.set(Number(id), [...(perTaak.get(Number(id)) ?? []), a]);
    }
  }
}

const regels: string[] = [
  `# Paper trail — laatste ${dagen} dagen`,
  "",
  `Taken: ${taken.totalDocs} · activiteiten: ${activiteiten.totalDocs}`,
  "",
];

for (const taak of taken.docs) {
  regels.push(`## ${taak.titel}${taak.deletedAt ? " (gearchiveerd)" : ""}`);
  regels.push(
    [
      `status: ${naam(taak.status)}`,
      `project: ${naam(taak.project)}`,
      `organisatie: ${naam(taak.organisatie)}`,
      `prioriteit: ${taak.prioriteit}`,
      `toegewezen: ${naam(taak.toegewezen)}`,
    ].join(" · "),
  );
  if (taak.contextVooraf) regels.push(`Context vooraf: ${taak.contextVooraf}`);
  if (taak.definitionOfDone) {
    regels.push(`Definition of done: ${taak.definitionOfDone}`);
  }
  const trail = perTaak.get(Number(taak.id)) ?? [];
  for (const a of trail) {
    regels.push(
      `- [${a.type}] ${a.samenvatting ?? ""} (${naam(a.auteur)}, ${a.happensAt?.slice(0, 10)})`,
    );
  }
  regels.push("");
}

const vragen = activiteiten.docs.filter((a) => a.type === "vraag");
const logs = activiteiten.docs.filter((a) => a.type === "log");
regels.push("## Alle agent-vragen (terugkerende vragen = skill-kandidaat)");
for (const v of vragen) regels.push(`- ${v.samenvatting ?? ""}`);
regels.push("", "## Alle LOG-beslissingen");
for (const l of logs) regels.push(`- ${l.samenvatting ?? ""}`);

console.log(regels.join("\n"));
process.exit(0);
