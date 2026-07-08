import type { KnowledgeDoc } from "@/payload-types";

export type TreeNode = {
  doc: KnowledgeDoc;
  children: TreeNode[];
};

function parentId(docItem: KnowledgeDoc): string | null {
  if (docItem.parent == null) return null;
  return String(
    typeof docItem.parent === "object" ? docItem.parent.id : docItem.parent,
  );
}

/**
 * Bouwt de documentboom: roots + children gesorteerd op position.
 * Docs met een verdwenen parent worden root (geen dataverlies — AppFlowy-les).
 */
export function buildTree(docs: KnowledgeDoc[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>();
  for (const d of docs) {
    nodes.set(String(d.id), { doc: d, children: [] });
  }
  const roots: TreeNode[] = [];
  for (const node of nodes.values()) {
    const pid = parentId(node.doc);
    const ouder = pid ? nodes.get(pid) : undefined;
    if (ouder && ouder !== node) {
      ouder.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sorteer = (lijst: TreeNode[]) => {
    lijst.sort(
      (a, b) => (a.doc.position ?? 0) - (b.doc.position ?? 0),
    );
    for (const n of lijst) sorteer(n.children);
  };
  sorteer(roots);
  return roots;
}

/** Filtert de boom op titel; takken met een match blijven inclusief hun pad zichtbaar. */
export function filterTree(boom: TreeNode[], zoekterm: string): TreeNode[] {
  const term = zoekterm.trim().toLowerCase();
  if (!term) return boom;
  const filter = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .map((n) => {
        const kinderen = filter(n.children);
        const zelf = n.doc.titel.toLowerCase().includes(term);
        if (zelf || kinderen.length > 0) {
          return { doc: n.doc, children: zelf ? n.children : kinderen };
        }
        return null;
      })
      .filter((n): n is TreeNode => n !== null);
  return filter(boom);
}
