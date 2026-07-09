"use client";

import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  HEADING,
  ORDERED_LIST,
  QUOTE,
  TEXT_FORMAT_TRANSFORMERS,
  UNORDERED_LIST,
} from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  $createLinkNode,
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
} from "@payloadcms/richtext-lexical/client";
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type ElementNode,
  type LexicalNode,
  type SerializedEditorState,
  type TextFormatType,
} from "lexical";
import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import "./editor.scss";

/* =========================================================================
   HmEditor — herbruikbare rijketekst-editor (Google Docs-gevoel) op Lexical.
   Slaat exact hetzelfde JSON op als Payload's richText-velden (zelfde nodes,
   incl. Payload's LinkNode), dus inhoud blijft uitwisselbaar met de
   Payload-admin en de site-rendering (<RichText />).
   ========================================================================= */

export type HmEditorWaarde = SerializedEditorState;

type Props = {
  autoFocus?: boolean;
  onWijzig: (state: HmEditorWaarde) => void;
  placeholder?: string;
  /** Payload richText JSON ({ root: … }) of null/undefined voor leeg. */
  waarde?: unknown;
};

/** Nodetypes die deze editor kent; alles daarbuiten = Payload-specifiek. */
const BEKENDE_TYPES = new Set([
  "root",
  "paragraph",
  "text",
  "linebreak",
  "tab",
  "heading",
  "quote",
  "list",
  "listitem",
  "link",
  "autolink",
  "horizontalrule",
]);

/** Vind nodetypes in richText-JSON die deze editor niet ondersteunt
    (bv. upload/relationship uit de Payload-admin) — dan tonen we een
    veilige leesweergave in plaats van stille dataverlies-bewerking. */
export function onbekendeNodeTypes(waarde: unknown): string[] {
  const gevonden = new Set<string>();
  const loop = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; children?: unknown[] };
    if (n.type && !BEKENDE_TYPES.has(n.type)) gevonden.add(n.type);
    if (Array.isArray(n.children)) n.children.forEach(loop);
  };
  const root = (waarde as { root?: unknown } | null | undefined)?.root;
  loop(root);
  return [...gevonden];
}

function heeftInhoud(waarde: unknown): boolean {
  const root = (waarde as { root?: { children?: unknown[] } } | null)?.root;
  return Array.isArray(root?.children) && root.children.length > 0;
}

type LinkVelden = { linkType: "custom"; newTab: boolean; url: string };

function $linkVoorouder(node: LexicalNode): LinkNode | null {
  let parent = node.getParent();
  while (parent !== null && !$isLinkNode(parent)) {
    parent = parent.getParent();
  }
  return parent;
}

/** Link zetten/weghalen op de selectie — port van Payload's $toggleLink
    (MIT) zodat we hún LinkNode-vorm schrijven ({ fields: { url, … } }). */
function $zetLink(velden: LinkVelden | null) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;
  const nodes = selection.extract();

  if (velden === null) {
    nodes.forEach((node) => {
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        parent.getChildren().forEach((kind) => parent.insertBefore(kind));
        parent.remove();
      }
    });
    return;
  }

  if (nodes.length === 1) {
    const eerste = nodes[0];
    const bestaand = $isLinkNode(eerste) ? eerste : $linkVoorouder(eerste);
    if (bestaand !== null) {
      bestaand.setFields(velden);
      return;
    }
  }

  let vorigeParent: ElementNode | LinkNode | null = null;
  let linkNode: LinkNode | null = null;
  nodes.forEach((node) => {
    const parent = node.getParent();
    if (
      parent === linkNode ||
      parent === null ||
      ($isElementNode(node) && !node.isInline())
    ) {
      return;
    }
    if ($isLinkNode(parent)) {
      linkNode = parent;
      parent.setFields(velden);
      return;
    }
    if (!parent.is(vorigeParent)) {
      vorigeParent = parent;
      linkNode = $createLinkNode({ fields: velden });
      node.insertBefore(linkNode);
    }
    if ($isLinkNode(node)) {
      if (node.is(linkNode)) return;
      if (linkNode !== null) {
        linkNode.append(...node.getChildren());
      }
      node.remove();
      return;
    }
    if (linkNode !== null) {
      linkNode.append(node);
    }
  });
}

/* ── Werkbalk ────────────────────────────────────────────────────────── */

type BlokType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "bullet"
  | "number";

const BLOK_LABELS: Record<BlokType, string> = {
  paragraph: "Tekst",
  h1: "Kop 1",
  h2: "Kop 2",
  h3: "Kop 3",
  quote: "Citaat",
  bullet: "Lijst",
  number: "Genummerd",
};

function Werkbalk() {
  const [editor] = useLexicalComposerContext();
  const [kanOngedaan, setKanOngedaan] = useState(false);
  const [kanOpnieuw, setKanOpnieuw] = useState(false);
  const [blokType, setBlokType] = useState<BlokType>("paragraph");
  const [formats, setFormats] = useState<Set<string>>(new Set());
  const [inLink, setInLink] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    const leesSelectie = () => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const actief = new Set<string>();
      for (const f of ["bold", "italic", "underline", "strikethrough", "code"]) {
        if (selection.hasFormat(f as TextFormatType)) actief.add(f);
      }
      setFormats(actief);

      const anchor = selection.anchor.getNode();
      setInLink($linkVoorouder(anchor) !== null || $isLinkNode(anchor));

      const top =
        anchor.getKey() === "root"
          ? anchor
          : ($findMatchingParent(anchor, (n) => {
              const p = n.getParent();
              return p !== null && p.getKey() === "root";
            }) ?? anchor.getTopLevelElementOrThrow());

      if ($isListNode(top)) {
        const lijst = $getNearestNodeOfType(anchor, ListNode);
        setBlokType(
          (lijst ?? (top as ListNode)).getListType() === "number"
            ? "number"
            : "bullet",
        );
      } else if ($isHeadingNode(top)) {
        setBlokType(top.getTag() as BlokType);
      } else if ($isQuoteNode(top)) {
        setBlokType("quote");
      } else {
        setBlokType("paragraph");
      }
    };

    const losUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(leesSelectie);
    });
    const losSelectie = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        leesSelectie();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const losUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (kan) => {
        setKanOngedaan(kan);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const losRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (kan) => {
        setKanOpnieuw(kan);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    return () => {
      losUpdate();
      losSelectie();
      losUndo();
      losRedo();
    };
  }, [editor]);

  const zetBlok = (doel: BlokType) => {
    if (doel === "bullet") {
      editor.dispatchCommand(
        blokType === "bullet" ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
        undefined,
      );
      return;
    }
    if (doel === "number") {
      editor.dispatchCommand(
        blokType === "number" ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (doel === "paragraph") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else if (doel === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(doel));
      }
    });
  };

  const openLink = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor.getNode();
        const link = $isLinkNode(anchor) ? anchor : $linkVoorouder(anchor);
        setLinkUrl(link?.getFields()?.url ?? "");
      }
    });
    setLinkOpen(true);
  };

  const pasLinkToe = (url: string) => {
    setLinkOpen(false);
    editor.update(() => {
      if (!url.trim()) {
        $zetLink(null);
      } else {
        const schoon = /^(https?:|mailto:|tel:)/.test(url.trim())
          ? url.trim()
          : `https://${url.trim()}`;
        $zetLink({ linkType: "custom", newTab: true, url: schoon });
      }
    });
  };

  const formatKnop = (
    format: TextFormatType,
    Icoon: typeof Bold,
    titel: string,
  ) => (
    <button
      aria-label={titel}
      className={`hm-ed__knop${formats.has(format) ? " is-actief" : ""}`}
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
      onMouseDown={(e) => e.preventDefault()}
      title={titel}
      type="button"
    >
      <Icoon size={15} strokeWidth={2.25} />
    </button>
  );

  return (
    <div className="hm-ed__balk">
      <button
        aria-label="Ongedaan maken"
        className="hm-ed__knop"
        disabled={!kanOngedaan}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        onMouseDown={(e) => e.preventDefault()}
        title="Ongedaan maken (⌘Z)"
        type="button"
      >
        <Undo2 size={15} strokeWidth={2.25} />
      </button>
      <button
        aria-label="Opnieuw"
        className="hm-ed__knop"
        disabled={!kanOpnieuw}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        onMouseDown={(e) => e.preventDefault()}
        title="Opnieuw (⇧⌘Z)"
        type="button"
      >
        <Redo2 size={15} strokeWidth={2.25} />
      </button>

      <span className="hm-ed__scheider" />

      <select
        aria-label="Bloktype"
        className="hm-ed__blok"
        onChange={(e) => zetBlok(e.target.value as BlokType)}
        value={blokType}
      >
        {Object.entries(BLOK_LABELS).map(([waarde, label]) => (
          <option key={waarde} value={waarde}>
            {label}
          </option>
        ))}
      </select>

      <span className="hm-ed__scheider" />

      {formatKnop("bold", Bold, "Vet (⌘B)")}
      {formatKnop("italic", Italic, "Cursief (⌘I)")}
      {formatKnop("underline", Underline, "Onderstrepen (⌘U)")}
      {formatKnop("strikethrough", Strikethrough, "Doorhalen")}
      {formatKnop("code", Code, "Code")}

      <span className="hm-ed__scheider" />

      <button
        aria-label="Opsomming"
        className={`hm-ed__knop${blokType === "bullet" ? " is-actief" : ""}`}
        onClick={() => zetBlok("bullet")}
        onMouseDown={(e) => e.preventDefault()}
        title="Opsomming"
        type="button"
      >
        <List size={15} strokeWidth={2.25} />
      </button>
      <button
        aria-label="Genummerde lijst"
        className={`hm-ed__knop${blokType === "number" ? " is-actief" : ""}`}
        onClick={() => zetBlok("number")}
        onMouseDown={(e) => e.preventDefault()}
        title="Genummerde lijst"
        type="button"
      >
        <ListOrdered size={15} strokeWidth={2.25} />
      </button>
      <button
        aria-label="Citaat"
        className={`hm-ed__knop${blokType === "quote" ? " is-actief" : ""}`}
        onClick={() => zetBlok(blokType === "quote" ? "paragraph" : "quote")}
        onMouseDown={(e) => e.preventDefault()}
        title="Citaat"
        type="button"
      >
        <Quote size={15} strokeWidth={2.25} />
      </button>
      <button
        aria-label="Scheidingslijn"
        className="hm-ed__knop"
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
        }
        onMouseDown={(e) => e.preventDefault()}
        title="Scheidingslijn"
        type="button"
      >
        <Minus size={15} strokeWidth={2.25} />
      </button>

      <span className="hm-ed__scheider" />

      <span className="hm-ed__linkwrap">
        <button
          aria-label="Link"
          className={`hm-ed__knop${inLink ? " is-actief" : ""}`}
          onClick={openLink}
          onMouseDown={(e) => e.preventDefault()}
          title="Link invoegen of bewerken"
          type="button"
        >
          <Link2 size={15} strokeWidth={2.25} />
        </button>
        {linkOpen && (
          <>
            <div
              aria-hidden
              className="hm-menu__backdrop"
              onClick={() => setLinkOpen(false)}
              role="presentation"
            />
            <form
              className="hm-ed__linkpop"
              onSubmit={(e) => {
                e.preventDefault();
                pasLinkToe(linkUrl);
              }}
            >
              <input
                autoFocus
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…  (leeg = link weghalen)"
                value={linkUrl}
              />
              <button className="hm-btn hm-btn--primary" type="submit">
                Ok
              </button>
            </form>
          </>
        )}
      </span>
    </div>
  );
}

/* ── Editor ──────────────────────────────────────────────────────────── */

export function HmEditor({ autoFocus, onWijzig, placeholder, waarde }: Props) {
  const laatste = useRef<HmEditorWaarde | null>(null);

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "hm-editor",
        editable: true,
        editorState: heeftInhoud(waarde) ? JSON.stringify(waarde) : undefined,
        nodes: [
          HeadingNode,
          QuoteNode,
          ListNode,
          ListItemNode,
          LinkNode,
          AutoLinkNode,
          HorizontalRuleNode,
        ],
        onError: (fout) => {
          // Editorfouten mogen de app nooit meenemen
          console.error("HmEditor:", fout);
        },
        theme: {
          heading: { h1: "hm-ed__h1", h2: "hm-ed__h2", h3: "hm-ed__h3" },
          link: "hm-ed__link",
          list: {
            listitem: "hm-ed__li",
            nested: { listitem: "hm-ed__li--nest" },
            ol: "hm-ed__ol",
            ul: "hm-ed__ul",
          },
          paragraph: "hm-ed__p",
          quote: "hm-ed__quote",
          text: {
            bold: "hm-ed__vet",
            code: "hm-ed__code",
            italic: "hm-ed__cursief",
            strikethrough: "hm-ed__doorgehaald",
            underline: "hm-ed__onderstreept",
          },
        },
      }}
    >
      <div className="hm-ed">
        <Werkbalk />
        <div className="hm-ed__vlak">
          <RichTextPlugin
            contentEditable={<ContentEditable className="hm-ed__inhoud" />}
            ErrorBoundary={LexicalErrorBoundary}
            placeholder={
              <p className="hm-ed__placeholder">
                {placeholder ?? "Begin met schrijven…"}
              </p>
            }
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <HorizontalRulePlugin />
        {autoFocus && <AutoFocusPlugin />}
        <MarkdownShortcutPlugin
          transformers={[
            HEADING,
            QUOTE,
            UNORDERED_LIST,
            ORDERED_LIST,
            ...TEXT_FORMAT_TRANSFORMERS,
          ]}
        />
        <OnChangePlugin
          ignoreSelectionChange
          onChange={(editorState) => {
            const json = editorState.toJSON();
            laatste.current = json;
            onWijzig(json);
          }}
        />
      </div>
    </LexicalComposer>
  );
}
