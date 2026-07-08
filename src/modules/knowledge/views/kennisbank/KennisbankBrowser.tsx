"use client";

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import {
  buildTree,
  filterTree,
  type TreeNode,
} from "@/modules/knowledge/views/kennisbank/lib";
import type { KnowledgeDoc } from "@/payload-types";

import "./kennisbank.scss";

type Props = { initialDocs: KnowledgeDoc[] };

export function KennisbankBrowser({ initialDocs }: Props) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Browser initialDocs={initialDocs} />
    </QueryClientProvider>
  );
}

function Browser({ initialDocs }: Props) {
  const router = useRouter();
  const [zoekterm, setZoekterm] = useState("");

  const docsQuery = useQuery({
    queryKey: ["kennisbank", "docs"],
    queryFn: async () => {
      const res = await fetch(
        "/api/knowledge-docs?sort=position&limit=500&depth=0",
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`GET knowledge-docs → ${res.status}`);
      return ((await res.json()) as { docs: KnowledgeDoc[] }).docs;
    },
    initialData: initialDocs,
  });

  const nieuwDoc = useMutation({
    mutationFn: async (parent: number | null) => {
      const res = await fetch("/api/knowledge-docs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: "Nieuw document",
          zichtbaarheid: "intern",
          ...(parent ? { parent } : {}),
        }),
      });
      if (!res.ok) throw new Error(`POST knowledge-docs → ${res.status}`);
      return ((await res.json()) as { doc: KnowledgeDoc }).doc;
    },
    onSuccess: (docItem) => {
      router.push(`/admin/collections/knowledge-docs/${docItem.id}`);
    },
  });

  const boom = filterTree(buildTree(docsQuery.data ?? []), zoekterm);

  return (
    <div className="hm-kennisbank">
      <div className="hm-kennisbank__balk">
        <input
          className="hm-kennisbank__zoek"
          onChange={(e) => setZoekterm(e.target.value)}
          placeholder="Zoeken in de kennisbank…"
          type="search"
          value={zoekterm}
        />
        <button
          className="hm-kennisbank__nieuw"
          disabled={nieuwDoc.isPending}
          onClick={() => nieuwDoc.mutate(null)}
          type="button"
        >
          + Nieuw document
        </button>
      </div>
      {boom.length === 0 ? (
        <p className="hm-kennisbank__leeg">
          {zoekterm
            ? "Niets gevonden. Probeer een andere zoekterm."
            : "Nog geen documenten. Maak het eerste document aan!"}
        </p>
      ) : (
        <ul className="hm-kennisbank__boom">
          {boom.map((node) => (
            <TakNode
              key={node.doc.id}
              node={node}
              onNieuwSubdoc={(id) => nieuwDoc.mutate(id)}
              openStandaard={Boolean(zoekterm)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TakNode({
  node,
  onNieuwSubdoc,
  openStandaard,
}: {
  node: TreeNode;
  onNieuwSubdoc: (parentId: number) => void;
  openStandaard: boolean;
}) {
  const [open, setOpen] = useState(openStandaard);
  const heeftKinderen = node.children.length > 0;

  return (
    <li className="hm-kennisbank__tak">
      <div className="hm-kennisbank__regel">
        <button
          aria-label={open ? "Inklappen" : "Uitklappen"}
          className={`hm-kennisbank__pijl${heeftKinderen ? "" : " is-leeg"}`}
          onClick={() => setOpen(!open)}
          type="button"
        >
          {heeftKinderen ? (open ? "▾" : "▸") : "·"}
        </button>
        <Link
          className="hm-kennisbank__titel"
          href={`/admin/collections/knowledge-docs/${node.doc.id}`}
        >
          {node.doc.titel}
        </Link>
        {node.doc.zichtbaarheid === "publiek" && (
          <span className="hm-kennisbank__publiek">Publiek</span>
        )}
        <button
          aria-label={`Subdocument onder ${node.doc.titel}`}
          className="hm-kennisbank__subdoc"
          onClick={() => onNieuwSubdoc(node.doc.id)}
          title="Subdocument toevoegen"
          type="button"
        >
          +
        </button>
      </div>
      {open && heeftKinderen && (
        <ul className="hm-kennisbank__kinderen">
          {node.children.map((kind) => (
            <TakNode
              key={kind.doc.id}
              node={kind}
              onNieuwSubdoc={onNieuwSubdoc}
              openStandaard={openStandaard}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
