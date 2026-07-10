import config from "@payload-config";
import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
  type SanitizedServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "lexical";

/* =========================================================================
   wikiMarkdown — vertaallaag markdown ↔ Payload-Lexical voor de kennisbank.
   Agents (Hermes, Dottie, seeds) werken in markdown; de kennisbank slaat
   Lexical-JSON op (veld "inhoud" op knowledge-docs). Deze module converteert
   in beide richtingen met de door Payload meegeleverde converters en lost
   [[Paginatitel]]-wikilinks op naar/van de kennisbank-deep-link
   `/admin/kennisbank?doc=<id>` (PRD §2 B2/B3).

   Server-only: nooit importeren in client components (leunt op
   @payload-config en de server-only converters van richtext-lexical).
   ========================================================================= */

/** Href van de kennisbank-deep-link waarmee een [[wikilink]] wordt opgelost. */
function kennisbankHref(id: number): string {
  return `/admin/kennisbank?doc=${id}`;
}

/** Nieuwe regex-instantie per aanroep — voorkomt gedeelde `lastIndex`-state
    tussen meerdere `.replace()`/`.matchAll()`-aanroepen op dezelfde regex. */
function wikilinkRegex(): RegExp {
  return /\[\[([^\]|#]+)\]\]/g;
}

/** Herkent `[Titel](/admin/kennisbank?doc=<id>)`-links in markdown-tekst. */
function kennisbankLinkRegex(): RegExp {
  return /\[([^\]]+)\]\(\/admin\/kennisbank\?doc=(\d+)\)/g;
}

function isRecord(waarde: unknown): waarde is Record<string, unknown> {
  return typeof waarde === "object" && waarde !== null;
}

function beschrijfFout(fout: unknown): string {
  return fout instanceof Error ? fout.message : String(fout);
}

/** Editor-config van de app. Het "inhoud"-veld op knowledge-docs heeft geen
    veld-specifieke editor ingesteld, dus Payload erft daar bij het
    sanitizen de config-brede default-editor voor over (zie
    payload/dist/fields/config/sanitize.js) — exact wat `editorConfigFactory
    .default` hier opnieuw opbouwt. Eén keer berekend en hergebruikt. */
let editorConfigPromise: Promise<SanitizedServerEditorConfig> | null = null;
async function haalEditorConfig(): Promise<SanitizedServerEditorConfig> {
  if (!editorConfigPromise) {
    editorConfigPromise = (async () => {
      const sanitizedConfig = await config;
      return editorConfigFactory.default({ config: sanitizedConfig });
    })();
  }
  return editorConfigPromise;
}

/** Alle `[[Paginatitels]]` die in `markdown` voorkomen (getrimd, uniek). */
export function vindWikilinkTitels(markdown: string): string[] {
  const gevonden = new Set<string>();
  for (const match of markdown.matchAll(wikilinkRegex())) {
    gevonden.add(match[1].trim());
  }
  return [...gevonden];
}

/** Alle kennisbank-document-id's waarnaar een Lexical-state linkt (loopt de
    boom rond op zoek naar linknodes met `fields.url` in de vorm
    `/admin/kennisbank?doc=<id>`). Gebruikt door de `/md`-GET-endpoint om
    `resolveId` op te bouwen zonder alle wiki-docs te hoeven bevragen. */
export function vindKennisbankDocIds(state: unknown): number[] {
  const gevonden = new Set<number>();
  const loop = (node: unknown): void => {
    if (!isRecord(node)) return;
    const fields = node.fields;
    if (isRecord(fields) && typeof fields.url === "string") {
      const match = /^\/admin\/kennisbank\?doc=(\d+)$/.exec(fields.url);
      if (match) gevonden.add(Number(match[1]));
    }
    const children = node.children;
    if (Array.isArray(children)) children.forEach(loop);
  };
  const root = isRecord(state) ? state.root : undefined;
  loop(root);
  return [...gevonden];
}

/** Zet markdown om naar Payload-Lexical. resolveTitel lost [[Titel]] op naar een doc-id (null = onopgelost). */
export async function markdownNaarLexical(
  markdown: string,
  resolveTitel?: (titel: string) => number | null,
): Promise<SerializedEditorState> {
  const voorbewerkt = resolveTitel
    ? markdown.replace(wikilinkRegex(), (volledigeMatch, ruweTitel: string) => {
        const titel = ruweTitel.trim();
        const id = resolveTitel(titel);
        // Onopgeloste links blijven letterlijk [[Titel]] staan — marker voor "pagina moet nog komen"
        return id == null ? volledigeMatch : `[${titel}](${kennisbankHref(id)})`;
      })
    : markdown;

  try {
    const editorConfig = await haalEditorConfig();
    return convertMarkdownToLexical({
      editorConfig,
      markdown: voorbewerkt,
    }) as SerializedEditorState;
  } catch (fout) {
    throw new Error(`markdownNaarLexical: ${beschrijfFout(fout)}`);
  }
}

/** Zet Payload-Lexical om naar markdown. resolveId maakt van een doc-id weer [[Titel]] (null = laat als gewone link). */
export async function lexicalNaarMarkdown(
  state: unknown,
  resolveId?: (id: number) => string | null,
): Promise<string> {
  const root = isRecord(state) ? state.root : undefined;
  const isLeeg =
    !isRecord(root) || !Array.isArray(root.children) || root.children.length === 0;
  if (isLeeg) return "";

  try {
    const editorConfig = await haalEditorConfig();
    const markdown = convertLexicalToMarkdown({
      data: state as SerializedEditorState,
      editorConfig,
    });
    if (!resolveId) return markdown;
    return markdown.replace(
      kennisbankLinkRegex(),
      (volledigeMatch, _linktekst: string, idTekst: string) => {
        const titel = resolveId(Number(idTekst));
        return titel ? `[[${titel}]]` : volledigeMatch;
      },
    );
  } catch (fout) {
    throw new Error(`lexicalNaarMarkdown: ${beschrijfFout(fout)}`);
  }
}
