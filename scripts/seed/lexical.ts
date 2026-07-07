/**
 * Helpers om Lexical richText-JSON te bouwen voor Payload-seeds.
 * Ondersteunt paragrafen met plain tekst, bold/italic en links.
 */

type TextNode = {
  type: "text";
  text: string;
  detail: number;
  format: number;
  mode: "normal";
  style: string;
  version: number;
};

type LinkNode = {
  type: "link";
  children: TextNode[];
  direction: "ltr";
  format: "";
  indent: 0;
  version: number;
  fields: { linkType: "custom"; newTab: boolean; url: string };
};

type ParagraphNode = {
  type: "paragraph";
  children: (TextNode | LinkNode)[];
  direction: "ltr";
  format: "";
  indent: 0;
  version: number;
  textFormat: number;
  textStyle: "";
};

type QuoteNode = {
  type: "quote";
  children: (TextNode | LinkNode)[];
  direction: "ltr";
  format: "";
  indent: 0;
  version: number;
};

type BlockNode = ParagraphNode | QuoteNode;

export type LexicalState = {
  root: {
    type: "root";
    children: BlockNode[];
    direction: "ltr";
    format: "";
    indent: 0;
    version: number;
  };
};

export const FORMAT_BOLD = 1;
export const FORMAT_ITALIC = 2;

export function text(t: string, format = 0): TextNode {
  return { type: "text", text: t, detail: 0, format, mode: "normal", style: "", version: 1 };
}

export function link(t: string, url: string, newTab = false): LinkNode {
  return {
    type: "link",
    children: [text(t)],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 2,
    fields: { linkType: "custom", newTab, url },
  };
}

export function paragraph(children: (TextNode | LinkNode)[] | string): ParagraphNode {
  return {
    type: "paragraph",
    children: typeof children === "string" ? [text(children)] : children,
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: "",
  };
}

/** Lexical "quote"-node (rendert als <blockquote>: ingesprongen, niet cursief). */
export function quote(children: (TextNode | LinkNode)[] | string): QuoteNode {
  return {
    type: "quote",
    children: typeof children === "string" ? [text(children)] : children,
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
  };
}

export function richText(paragraphs: (BlockNode | string)[]): LexicalState {
  return {
    root: {
      type: "root",
      children: paragraphs.map((p) => (typeof p === "string" ? paragraph(p) : p)),
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
}

/**
 * Zet eenvoudige HTML (zoals WP content.rendered paragrafen) om naar Lexical.
 * Ondersteunt <p>, <br>, <strong>/<b>, <em>/<i>, <a>. Overige tags worden gestript.
 */
export function htmlToLexical(html: string): LexicalState {
  const paras = html
    .split(/<\/p>/i)
    .map((chunk) => chunk.replace(/^[\s\S]*?<p[^>]*>/i, "").trim())
    .filter(Boolean);

  const nodes: ParagraphNode[] = [];
  for (const p of paras) {
    const parts: (TextNode | LinkNode)[] = [];
    // tokenize op <a>, <strong>, <em>
    const tokens = p.split(/(<a [^>]*>[\s\S]*?<\/a>|<strong>[\s\S]*?<\/strong>|<b>[\s\S]*?<\/b>|<em>[\s\S]*?<\/em>|<i>[\s\S]*?<\/i>)/gi);
    for (const tok of tokens) {
      if (!tok) continue;
      const aMatch = tok.match(/^<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>$/i);
      const strongMatch = tok.match(/^<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>$/i);
      const emMatch = tok.match(/^<(?:em|i)>([\s\S]*?)<\/(?:em|i)>$/i);
      if (aMatch) {
        parts.push(link(strip(aMatch[2]), aMatch[1]));
      } else if (strongMatch) {
        parts.push(text(strip(strongMatch[1]), FORMAT_BOLD));
      } else if (emMatch) {
        parts.push(text(strip(emMatch[1]), FORMAT_ITALIC));
      } else {
        const plain = strip(tok);
        if (plain) parts.push(text(plain));
      }
    }
    if (parts.length) nodes.push(paragraph(parts));
  }
  return richText(nodes);
}

function strip(html: string): string {
  return html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&hellip;/g, "…")
    .trim();
}
