import { describe, expect, it } from "vitest";

import { buildTree } from "@/modules/knowledge/views/kennisbank/lib";
import type { KnowledgeDoc } from "@/payload-types";

const doc = (
  id: number,
  titel: string,
  parent: number | null,
  position = 0,
): KnowledgeDoc => ({ id, titel, parent, position }) as KnowledgeDoc;

describe("buildTree", () => {
  it("bouwt roots met children, gesorteerd op position", () => {
    const boom = buildTree([
      doc(1, "Handboek", null, 10),
      doc(2, "Snelstart", null, 5),
      doc(3, "Hoofdstuk 1", 1, 2),
      doc(4, "Hoofdstuk 0", 1, 1),
    ]);
    expect(boom.map((n) => n.doc.titel)).toEqual(["Snelstart", "Handboek"]);
    const handboek = boom[1];
    expect(handboek.children.map((n) => n.doc.titel)).toEqual([
      "Hoofdstuk 0",
      "Hoofdstuk 1",
    ]);
  });

  it("maakt een doc met verdwenen parent een root (geen dataverlies)", () => {
    const boom = buildTree([doc(1, "Wees", 999, 1)]);
    expect(boom).toHaveLength(1);
    expect(boom[0].doc.titel).toBe("Wees");
  });

  it("ondersteunt diepere nesting", () => {
    const boom = buildTree([
      doc(1, "Root", null, 1),
      doc(2, "Kind", 1, 1),
      doc(3, "Kleinkind", 2, 1),
    ]);
    expect(boom[0].children[0].children[0].doc.titel).toBe("Kleinkind");
  });
});
