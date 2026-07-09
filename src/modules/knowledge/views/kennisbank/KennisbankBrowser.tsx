"use client";

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowDownUp,
  Clock,
  Download,
  EllipsisVertical,
  FolderInput,
  House,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RotateCcw,
  SquareCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  bestandGrootte,
  bestandVan,
  itemType,
  thumbnailUrl,
} from "@/modules/knowledge/views/kennisbank/bestandstype";
import { LeesPanel } from "@/modules/knowledge/views/kennisbank/LeesPanel";
import { VerplaatsDialoog } from "@/modules/knowledge/views/kennisbank/VerplaatsDialoog";
import type { KnowledgeDoc } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "./kennisbank.scss";

type Props = { initialDocs: KnowledgeDoc[]; isBeheerder: boolean };

export function KennisbankBrowser(props: Props) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Browser {...props} />
    </QueryClientProvider>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function parentIdOf(doc: KnowledgeDoc): number | null {
  const p = doc.parent;
  if (p == null) return null;
  return typeof p === "object" ? p.id : p;
}

function auteurNaam(doc: KnowledgeDoc): string | null {
  const a = doc.auteur;
  if (a && typeof a === "object" && a.name) return a.name;
  return null;
}

function datumKort(iso?: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

async function rest<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function uploadEen(file: File, parent: number | null): Promise<void> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/knowledge-files", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload ${file.name} → ${res.status}`);
  const { doc: fileDoc } = (await res.json()) as { doc: { id: number } };
  await rest("/api/knowledge-docs", "POST", {
    titel: file.name,
    soort: "bestand",
    bestand: fileDoc.id,
    zichtbaarheid: "intern",
    ...(parent ? { parent } : {}),
  });
}

type ToastMelding = { tekst: string; soort: "ok" | "fout" };
type ContextStand = { x: number; y: number; id: number };

/* ── Hoofdcomponent ──────────────────────────────────────────────────── */

function Browser({ initialDocs, isBeheerder }: Props) {
  const qc = useQueryClient();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [parentId, setParentId] = useState<number | null>(null);
  const [prullenbak, setPrullenbak] = useState(false);
  const [zoek, setZoek] = useState("");
  const [weergave, setWeergave] = useState<"grid" | "lijst">("grid");
  const [sortering, setSortering] = useState<"gewijzigd" | "naam">("gewijzigd");
  const [selectie, setSelectie] = useState<number[]>([]);
  const [context, setContext] = useState<ContextStand | null>(null);
  const [hernoemDoc, setHernoemDoc] = useState<KnowledgeDoc | null>(null);
  const [hernoemNaam, setHernoemNaam] = useState("");
  const [verplaatsIds, setVerplaatsIds] = useState<number[] | null>(null);
  const [leesDoc, setLeesDoc] = useState<KnowledgeDoc | null>(null);
  const [viewerDoc, setViewerDoc] = useState<KnowledgeDoc | null>(null);
  const [nieuwOpen, setNieuwOpen] = useState(false);
  const [dropDoel, setDropDoel] = useState<number | "root" | null>(null);
  const [uploadBezig, setUploadBezig] = useState(0);
  const [toast, setToast] = useState<ToastMelding | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Contextmenu sluit bij klik elders of Escape
  useEffect(() => {
    if (!context) return;
    const sluit = () => setContext(null);
    const toets = (e: KeyboardEvent) => {
      if (e.key === "Escape") sluit();
    };
    window.addEventListener("click", sluit);
    window.addEventListener("keydown", toets);
    return () => {
      window.removeEventListener("click", sluit);
      window.removeEventListener("keydown", toets);
    };
  }, [context]);

  /* ── Data ── */

  const docsQuery = useQuery({
    queryKey: ["kennisbank", "docs"],
    queryFn: () =>
      rest<{ docs: KnowledgeDoc[] }>(
        "/api/knowledge-docs?sort=position&limit=500&depth=1",
        "GET",
      ).then((r) => r.docs),
    initialData: initialDocs,
  });

  const trashQuery = useQuery({
    queryKey: ["kennisbank", "trash"],
    enabled: prullenbak,
    queryFn: () =>
      rest<{ docs: KnowledgeDoc[] }>(
        "/api/knowledge-docs?trash=true&where[deletedAt][exists]=true&sort=-updatedAt&limit=500&depth=1",
        "GET",
      ).then((r) => r.docs),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["kennisbank", "docs"] });
    qc.invalidateQueries({ queryKey: ["kennisbank", "trash"] });
  };

  /* ── Mutaties ── */

  const actie = useMutation({
    mutationFn: async (input: {
      werk: () => Promise<unknown>;
      melding?: string;
    }) => {
      await input.werk();
      return input.melding;
    },
    onSuccess: (melding) => {
      invalidate();
      if (melding) setToast({ tekst: melding, soort: "ok" });
    },
    onError: () =>
      setToast({ tekst: "Actie mislukt — probeer het opnieuw.", soort: "fout" }),
  });

  const docs = docsQuery.data ?? [];
  const trashDocs = trashQuery.data ?? [];
  const bron = prullenbak ? trashDocs : docs;
  const byId = new Map(bron.map((d) => [d.id, d]));

  const heeftKinderen = (id: number) => docs.some((d) => parentIdOf(d) === id);
  const isMap = (d: KnowledgeDoc) => d.soort === "map" || heeftKinderen(d.id);
  const aantalKinderen = (id: number) =>
    docs.filter((d) => parentIdOf(d) === id).length;

  const hernoem = (doc: KnowledgeDoc, titel: string) =>
    actie.mutate({
      werk: () =>
        rest(`/api/knowledge-docs/${doc.id}`, "PATCH", { titel }),
    });

  const verplaats = (ids: number[], naar: number | null) =>
    actie.mutate({
      werk: () =>
        Promise.all(
          ids.map((id) =>
            rest(`/api/knowledge-docs/${id}`, "PATCH", { parent: naar }),
          ),
        ),
      melding: `${ids.length} item${ids.length === 1 ? "" : "s"} verplaatst.`,
    });

  const naarPrullenbak = (ids: number[]) =>
    actie.mutate({
      werk: () =>
        Promise.all(
          ids.map((id) =>
            rest(`/api/knowledge-docs/${id}`, "PATCH", {
              deletedAt: new Date().toISOString(),
            }),
          ),
        ),
      melding: `${ids.length} item${ids.length === 1 ? "" : "s"} naar de prullenbak.`,
    });

  const herstel = (ids: number[]) =>
    actie.mutate({
      werk: () =>
        Promise.all(
          ids.map((id) =>
            rest(`/api/knowledge-docs/${id}?trash=true`, "PATCH", {
              deletedAt: null,
            }),
          ),
        ),
      melding: `${ids.length} item${ids.length === 1 ? "" : "s"} hersteld.`,
    });

  const verwijderDefinitief = (ids: number[]) =>
    actie.mutate({
      werk: () =>
        Promise.all(
          ids.map((id) =>
            rest(`/api/knowledge-docs/${id}?trash=true`, "DELETE"),
          ),
        ),
      melding: "Definitief verwijderd.",
    });

  const nieuweMap = () =>
    actie.mutate({
      werk: async () => {
        const res = await rest<{ doc: KnowledgeDoc }>(
          "/api/knowledge-docs",
          "POST",
          {
            titel: "Nieuwe map",
            soort: "map",
            zichtbaarheid: "intern",
            ...(parentId ? { parent: parentId } : {}),
          },
        );
        setHernoemDoc(res.doc);
        setHernoemNaam(res.doc.titel);
      },
    });

  const nieuwDocument = () =>
    actie.mutate({
      werk: async () => {
        const res = await rest<{ doc: KnowledgeDoc }>(
          "/api/knowledge-docs",
          "POST",
          {
            titel: "Nieuw document",
            soort: "document",
            zichtbaarheid: "intern",
            ...(parentId ? { parent: parentId } : {}),
          },
        );
        router.push(`/admin/collections/knowledge-docs/${res.doc.id}`);
      },
    });

  const uploadBestanden = async (lijst: FileList | File[]) => {
    const files = [...lijst];
    if (files.length === 0) return;
    setUploadBezig((n) => n + files.length);
    const resultaten = await Promise.allSettled(
      files.map((f) => uploadEen(f, parentId)),
    );
    setUploadBezig((n) => n - files.length);
    invalidate();
    const gelukt = resultaten.filter((r) => r.status === "fulfilled").length;
    const mislukt = files.length - gelukt;
    setToast(
      mislukt === 0
        ? {
            tekst: `${gelukt} bestand${gelukt === 1 ? "" : "en"} geüpload.`,
            soort: "ok",
          }
        : {
            tekst: `${gelukt} geüpload, ${mislukt} mislukt.`,
            soort: "fout",
          },
    );
  };

  /* ── Afleidingen ── */

  const zoekterm = zoek.trim().toLowerCase();
  const zichtbaar = prullenbak
    ? trashDocs.filter((d) =>
        zoekterm ? d.titel.toLowerCase().includes(zoekterm) : true,
      )
    : zoekterm
      ? docs.filter((d) => d.titel.toLowerCase().includes(zoekterm))
      : docs.filter((d) => parentIdOf(d) === parentId);

  const sorteer = (lijst: KnowledgeDoc[]) =>
    [...lijst].sort((a, b) =>
      sortering === "naam"
        ? a.titel.localeCompare(b.titel, "nl")
        : new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime(),
    );

  const mappen = sorteer(zichtbaar.filter((d) => !prullenbak && isMap(d)));
  const bestanden = sorteer(
    zichtbaar.filter((d) => prullenbak || !isMap(d)),
  );

  const recent = [...docs]
    .filter((d) => !isMap(d))
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() -
        new Date(a.updatedAt ?? 0).getTime(),
    )
    .slice(0, 6);

  // Breadcrumb-pad
  const pad: KnowledgeDoc[] = [];
  {
    let cur: number | null = parentId;
    const gezien = new Set<number>();
    while (cur != null && !gezien.has(cur)) {
      gezien.add(cur);
      const d = docs.find((x) => x.id === cur);
      if (!d) break;
      pad.unshift(d);
      cur = parentIdOf(d);
    }
  }

  const geselecteerdDoc =
    selectie.length > 0 ? (byId.get(selectie[selectie.length - 1]) ?? null) : null;

  const openMap = (id: number | null) => {
    setParentId(id);
    setSelectie([]);
    setZoek("");
  };

  const openItem = (doc: KnowledgeDoc) => {
    if (prullenbak) return;
    if (isMap(doc)) {
      openMap(doc.id);
      return;
    }
    if (doc.soort === "bestand") {
      const file = bestandVan(doc);
      if (!file?.url) return;
      if (file.mimeType?.startsWith("image/")) setViewerDoc(doc);
      else window.open(file.url, "_blank", "noopener");
      return;
    }
    setLeesDoc(doc);
  };

  const selecteer = (doc: KnowledgeDoc, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      setSelectie((s) =>
        s.includes(doc.id) ? s.filter((x) => x !== doc.id) : [...s, doc.id],
      );
    } else {
      setSelectie([doc.id]);
    }
  };

  /* ── Slepen: item → map (native HTML5, geen lib nodig) ── */

  const sleepIds = (e: React.DragEvent): number[] => {
    try {
      const data = e.dataTransfer.getData("application/x-hm-docs");
      return data ? (JSON.parse(data) as number[]) : [];
    } catch {
      return [];
    }
  };

  const kaartDragProps = (doc: KnowledgeDoc) =>
    prullenbak
      ? {}
      : {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            const ids = selectie.includes(doc.id) ? selectie : [doc.id];
            e.dataTransfer.setData("application/x-hm-docs", JSON.stringify(ids));
            e.dataTransfer.effectAllowed = "move";
          },
        };

  const dropProps = (doelId: number | "root") => ({
    onDragOver: (e: React.DragEvent) => {
      if (e.dataTransfer.types.includes("application/x-hm-docs")) {
        e.preventDefault();
        e.stopPropagation();
        setDropDoel(doelId);
      }
    },
    onDragLeave: () => setDropDoel(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropDoel(null);
      const ids = sleepIds(e).filter((id) => id !== doelId);
      if (ids.length === 0) return;
      // Niet in eigen nakomeling droppen
      if (doelId !== "root") {
        const verboden = new Set(ids);
        let groeide = true;
        while (groeide) {
          groeide = false;
          for (const d of docs) {
            const pid = parentIdOf(d);
            if (pid != null && verboden.has(pid) && !verboden.has(d.id)) {
              verboden.add(d.id);
              groeide = true;
            }
          }
        }
        if (verboden.has(doelId)) {
          setToast({
            tekst: "Een map kan niet in zichzelf worden verplaatst.",
            soort: "fout",
          });
          return;
        }
      }
      verplaats(ids, doelId === "root" ? null : doelId);
      setSelectie([]);
    },
  });

  /* ── Upload via slepen van bestanden ── */

  const [uploadDrop, setUploadDrop] = useState(false);
  const uploadDropProps = prullenbak
    ? {}
    : {
        onDragOver: (e: React.DragEvent) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setUploadDrop(true);
          }
        },
        onDragLeave: (e: React.DragEvent) => {
          if (e.currentTarget === e.target) setUploadDrop(false);
        },
        onDrop: (e: React.DragEvent) => {
          if (e.dataTransfer.files.length > 0) {
            e.preventDefault();
            setUploadDrop(false);
            void uploadBestanden(e.dataTransfer.files);
          }
        },
      };

  /* ── Contextmenu-acties ── */

  const contextDoc = context ? (byId.get(context.id) ?? null) : null;

  const contextActies = (doc: KnowledgeDoc) => {
    const file = bestandVan(doc);
    if (prullenbak) {
      return (
        <>
          <button onClick={() => herstel([doc.id])} type="button">
            <RotateCcw size={14} /> Herstellen
          </button>
          {isBeheerder && (
            <button
              className="is-gevaar"
              onClick={() => verwijderDefinitief([doc.id])}
              type="button"
            >
              <Trash2 size={14} /> Definitief verwijderen
            </button>
          )}
        </>
      );
    }
    return (
      <>
        <button onClick={() => openItem(doc)} type="button">
          <House size={14} /> Openen
        </button>
        <button
          onClick={() =>
            setSelectie((s) =>
              s.includes(doc.id) ? s : [...s, doc.id],
            )
          }
          type="button"
        >
          <SquareCheck size={14} /> Selecteren
        </button>
        <button
          onClick={() => {
            setHernoemDoc(doc);
            setHernoemNaam(doc.titel);
          }}
          type="button"
        >
          <Pencil size={14} /> Hernoemen
        </button>
        <button
          onClick={() =>
            setVerplaatsIds(selectie.includes(doc.id) ? selectie : [doc.id])
          }
          type="button"
        >
          <FolderInput size={14} /> Verplaatsen
        </button>
        {file?.url && (
          <a download={file.filename ?? true} href={file.url}>
            <Download size={14} /> Downloaden
          </a>
        )}
        <button
          className="is-gevaar"
          onClick={() =>
            naarPrullenbak(selectie.includes(doc.id) ? selectie : [doc.id])
          }
          type="button"
        >
          <Trash2 size={14} /> Naar prullenbak
        </button>
      </>
    );
  };

  /* ── Kaart & rij ── */

  const kaart = (doc: KnowledgeDoc) => {
    const map = !prullenbak && isMap(doc);
    const type = itemType(doc, doc.soort === "map" || heeftKinderen(doc.id));
    const thumb = thumbnailUrl(doc);
    const geselecteerd = selectie.includes(doc.id);
    return (
      <div
        className={`hm-card hm-kb__kaart${geselecteerd ? " is-geselecteerd" : ""}${dropDoel === doc.id ? " is-dropdoel" : ""}`}
        key={doc.id}
        onClick={(e) => selecteer(doc, e)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContext({ x: e.clientX, y: e.clientY, id: doc.id });
        }}
        onDoubleClick={() => openItem(doc)}
        role="button"
        tabIndex={0}
        {...kaartDragProps(doc)}
        {...(map ? dropProps(doc.id) : {})}
      >
        <span className="hm-kb__vlak">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" loading="lazy" src={thumb} />
          ) : (
            <type.Icoon
              size={map ? 34 : 30}
              strokeWidth={1.5}
              style={{ color: type.kleur }}
              {...(map ? { fill: type.kleur, fillOpacity: 0.25 } : {})}
            />
          )}
        </span>
        <span className="hm-kb__kaartnaam">{doc.titel}</span>
        <span className="hm-kb__kaartmeta">
          <Clock size={11} strokeWidth={2} />
          {map
            ? `${aantalKinderen(doc.id)} item${aantalKinderen(doc.id) === 1 ? "" : "s"}`
            : datumKort(doc.updatedAt)}
        </span>
        <button
          aria-label="Acties"
          className="hm-kb__meer"
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setSelectie([doc.id]);
            setContext({ x: rect.left, y: rect.bottom + 4, id: doc.id });
          }}
          type="button"
        >
          <EllipsisVertical size={15} />
        </button>
      </div>
    );
  };

  const rij = (doc: KnowledgeDoc) => {
    const map = !prullenbak && isMap(doc);
    const type = itemType(doc, doc.soort === "map" || heeftKinderen(doc.id));
    const file = bestandVan(doc);
    const geselecteerd = selectie.includes(doc.id);
    return (
      <tr
        className={`${geselecteerd ? "is-geselecteerd" : ""}${dropDoel === doc.id ? " is-dropdoel" : ""}`}
        key={doc.id}
        onClick={(e) => selecteer(doc, e)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContext({ x: e.clientX, y: e.clientY, id: doc.id });
        }}
        onDoubleClick={() => openItem(doc)}
        {...kaartDragProps(doc)}
        {...(map ? dropProps(doc.id) : {})}
      >
        <td>
          <span className="hm-kb__rijnaam">
            <type.Icoon
              size={16}
              strokeWidth={1.75}
              style={{ color: type.kleur }}
            />
            {doc.titel}
          </span>
        </td>
        <td>{auteurNaam(doc) ?? "—"}</td>
        <td>{datumKort(doc.updatedAt)}</td>
        <td>{map ? `${aantalKinderen(doc.id)} items` : (bestandGrootte(file?.filesize) ?? "—")}</td>
        <td>
          <span
            className={`hm-pill ${doc.zichtbaarheid === "publiek" ? "hm-pill--emerald" : "hm-pill--slate"}`}
          >
            {doc.zichtbaarheid === "publiek" ? "Publiek" : "Intern"}
          </span>
        </td>
      </tr>
    );
  };

  /* ── Render ── */

  const totMappen = docs.filter((d) => isMap(d)).length;
  const totDocs = docs.filter((d) => !isMap(d) && d.soort !== "bestand").length;
  const totBestanden = docs.filter((d) => d.soort === "bestand").length;

  return (
    <div className="hm-view hm-kb">
      <input
        hidden
        multiple
        onChange={(e) => {
          if (e.target.files) void uploadBestanden(e.target.files);
          e.target.value = "";
        }}
        ref={fileInput}
        type="file"
      />

      {/* ── Linker zijbalk ── */}
      <aside className="hm-kb__side">
        <div className="hm-menu__wrap">
          <button
            className="hm-btn hm-btn--primary hm-kb__nieuw"
            onClick={() => setNieuwOpen((v) => !v)}
            type="button"
          >
            <Plus size={15} strokeWidth={2.5} /> Nieuw
          </button>
          {nieuwOpen && (
            <>
              <div
                aria-hidden
                className="hm-menu__backdrop"
                onClick={() => setNieuwOpen(false)}
                role="presentation"
              />
              <div className="hm-menu hm-kb__nieuwmenu" role="menu">
                <button
                  onClick={() => {
                    setNieuwOpen(false);
                    nieuweMap();
                  }}
                  type="button"
                >
                  Nieuwe map
                </button>
                <button
                  onClick={() => {
                    setNieuwOpen(false);
                    nieuwDocument();
                  }}
                  type="button"
                >
                  Nieuw document
                </button>
                <button
                  onClick={() => {
                    setNieuwOpen(false);
                    fileInput.current?.click();
                  }}
                  type="button"
                >
                  Bestanden uploaden
                </button>
              </div>
            </>
          )}
        </div>

        <nav className="hm-kb__nav">
          <button
            className={!prullenbak ? "is-actief" : ""}
            onClick={() => {
              setPrullenbak(false);
              setSelectie([]);
            }}
            type="button"
            {...dropProps("root")}
          >
            <House size={16} strokeWidth={1.75} /> Kennisbank
          </button>
          <button
            className={`hm-kb__navtrash${prullenbak ? " is-actief" : ""}`}
            onClick={() => {
              setPrullenbak(true);
              setSelectie([]);
              setZoek("");
            }}
            type="button"
          >
            <Trash2 size={16} strokeWidth={1.75} /> Prullenbak
          </button>
        </nav>

        <p className="hm-kb__totalen">
          {totMappen} mappen · {totDocs} documenten · {totBestanden} bestanden
        </p>
      </aside>

      {/* ── Hoofdvlak ── */}
      <main className="hm-kb__main" {...uploadDropProps}>
        {uploadDrop && (
          <div className="hm-kb__dropoverlay">
            <Upload size={28} strokeWidth={1.5} />
            Laat los om te uploaden in{" "}
            {pad.length > 0 ? `'${pad[pad.length - 1].titel}'` : "de kennisbank"}
          </div>
        )}

        {prullenbak ? (
          <div className="hm-kb__banner">
            Items in de prullenbak kun je herstellen
            {isBeheerder ? " of definitief verwijderen" : ""} via rechtsklik of
            het detailpaneel.
          </div>
        ) : (
          <nav aria-label="Pad" className="hm-kb__crumbs">
            <button
              className={`hm-kb__crumb${dropDoel === "root" ? " is-dropdoel" : ""}`}
              onClick={() => openMap(null)}
              type="button"
              {...dropProps("root")}
            >
              Kennisbank
            </button>
            {pad.map((d, i) => (
              <React.Fragment key={d.id}>
                <span className="hm-kb__sep">›</span>
                {i === pad.length - 1 ? (
                  <span className="hm-kb__crumb is-current">{d.titel}</span>
                ) : (
                  <button
                    className={`hm-kb__crumb${dropDoel === d.id ? " is-dropdoel" : ""}`}
                    onClick={() => openMap(d.id)}
                    type="button"
                    {...dropProps(d.id)}
                  >
                    {d.titel}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="hm-kb__balk">
          <h2>{prullenbak ? "Prullenbak" : (pad[pad.length - 1]?.titel ?? "Kennisbank")}</h2>
          <div className="hm-kb__balkacties">
            <input
              className="hm-board__zoek"
              onChange={(e) => setZoek(e.target.value)}
              placeholder={prullenbak ? "Zoeken in prullenbak…" : "Zoeken in de kennisbank…"}
              type="search"
              value={zoek}
            />
            <button
              className="hm-board__icoonknop"
              onClick={() =>
                setSortering((s) => (s === "gewijzigd" ? "naam" : "gewijzigd"))
              }
              title={`Sorteren op ${sortering === "gewijzigd" ? "naam" : "laatst gewijzigd"}`}
              type="button"
            >
              <ArrowDownUp size={14} strokeWidth={2} />
            </button>
            <span className="hm-kb__sortlabel">
              {sortering === "gewijzigd" ? "Gewijzigd" : "Naam"}
            </span>
            <div className="hm-seg">
              <button
                className={weergave === "grid" ? "is-actief" : ""}
                onClick={() => setWeergave("grid")}
                title="Grid"
                type="button"
              >
                <LayoutGrid size={14} strokeWidth={2} />
              </button>
              <button
                className={weergave === "lijst" ? "is-actief" : ""}
                onClick={() => setWeergave("lijst")}
                title="Lijst"
                type="button"
              >
                <List size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {!prullenbak && !zoekterm && parentId === null && recent.length > 0 && (
          <>
            <div className="hm-kb__sectlabel">Snelle toegang</div>
            <div className="hm-kb__qa">
              {recent.map((d) => {
                const type = itemType(d, false);
                const thumb = thumbnailUrl(d);
                return (
                  <button
                    className="hm-card hm-card--hover hm-kb__qitem"
                    key={d.id}
                    onClick={() => openItem(d)}
                    type="button"
                  >
                    <span className="hm-kb__qvlak">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" loading="lazy" src={thumb} />
                      ) : (
                        <type.Icoon
                          size={22}
                          strokeWidth={1.5}
                          style={{ color: type.kleur }}
                        />
                      )}
                    </span>
                    <span className="hm-kb__qnaam">{d.titel}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {zichtbaar.length === 0 && (
          <div className="hm-kb__leeg">
            {prullenbak ? (
              <>
                <Trash2 size={30} strokeWidth={1.25} />
                <p>De prullenbak is leeg.</p>
              </>
            ) : zoekterm ? (
              <p>Niets gevonden voor &lsquo;{zoek.trim()}&rsquo;.</p>
            ) : (
              <>
                <Upload size={30} strokeWidth={1.25} />
                <p>
                  Deze map is leeg — sleep bestanden hierheen of gebruik{" "}
                  <b>+ Nieuw</b>.
                </p>
              </>
            )}
          </div>
        )}

        {weergave === "grid" ? (
          <>
            {mappen.length > 0 && (
              <>
                <div className="hm-kb__sectlabel">Mappen</div>
                <div className="hm-kb__grid">{mappen.map(kaart)}</div>
              </>
            )}
            {bestanden.length > 0 && (
              <>
                <div className="hm-kb__sectlabel">
                  {prullenbak ? "Items" : "Documenten & bestanden"}
                </div>
                <div className="hm-kb__grid">{bestanden.map(kaart)}</div>
              </>
            )}
          </>
        ) : (
          zichtbaar.length > 0 && (
            <table className="hm-kb__tabel">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Auteur</th>
                  <th>Gewijzigd</th>
                  <th>Grootte</th>
                  <th>Zichtbaar</th>
                </tr>
              </thead>
              <tbody>
                {mappen.map(rij)}
                {bestanden.map(rij)}
              </tbody>
            </table>
          )
        )}
      </main>

      {/* ── Detailrail rechts ── */}
      <aside className="hm-kb__rail">
        {geselecteerdDoc ? (
          <DetailRail
            aantalKinderen={aantalKinderen}
            doc={geselecteerdDoc}
            heeftKinderen={heeftKinderen}
            isBeheerder={isBeheerder}
            onHernoem={() => {
              setHernoemDoc(geselecteerdDoc);
              setHernoemNaam(geselecteerdDoc.titel);
            }}
            onHerstel={() => herstel([geselecteerdDoc.id])}
            onOpen={() => openItem(geselecteerdDoc)}
            onPrullenbak={() => naarPrullenbak([geselecteerdDoc.id])}
            onVerplaats={() => setVerplaatsIds([geselecteerdDoc.id])}
            onVerwijderDefinitief={() =>
              verwijderDefinitief([geselecteerdDoc.id])
            }
            prullenbak={prullenbak}
          />
        ) : (
          <div className="hm-kb__raillleeg">
            <LayoutGrid size={26} strokeWidth={1.25} />
            <p>Selecteer een item om de details te zien.</p>
          </div>
        )}
      </aside>

      {/* ── Zwevende multi-select-balk ── */}
      {selectie.length > 1 && (
        <div className="hm-kb__multibalk">
          <button
            aria-label="Selectie wissen"
            onClick={() => setSelectie([])}
            type="button"
          >
            <X size={15} />
          </button>
          <span>{selectie.length} geselecteerd</span>
          {prullenbak ? (
            <>
              <button onClick={() => herstel(selectie)} type="button">
                <RotateCcw size={15} /> Herstellen
              </button>
              {isBeheerder && (
                <button
                  className="is-gevaar"
                  onClick={() => verwijderDefinitief(selectie)}
                  type="button"
                >
                  <Trash2 size={15} /> Definitief
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setVerplaatsIds(selectie)} type="button">
                <FolderInput size={15} /> Verplaatsen
              </button>
              <button
                className="is-gevaar"
                onClick={() => {
                  naarPrullenbak(selectie);
                  setSelectie([]);
                }}
                type="button"
              >
                <Trash2 size={15} /> Prullenbak
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Contextmenu ── */}
      {context && contextDoc && (
        <div
          className="hm-menu hm-kb__context"
          role="menu"
          style={{ left: context.x, top: context.y }}
        >
          {contextActies(contextDoc)}
        </div>
      )}

      {/* ── Dialogen & panelen ── */}
      {hernoemDoc && (
        <>
          <div
            aria-hidden
            className="hm-dialoog__backdrop"
            onClick={() => setHernoemDoc(null)}
            role="presentation"
          />
          <div aria-label="Hernoemen" className="hm-dialoog" role="dialog">
            <h3>Hernoemen</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const naam = hernoemNaam.trim();
                if (naam && naam !== hernoemDoc.titel) {
                  hernoem(hernoemDoc, naam);
                }
                setHernoemDoc(null);
              }}
            >
              <input
                autoFocus
                className="hm-kb__hernoeminput"
                onChange={(e) => setHernoemNaam(e.target.value)}
                onFocus={(e) => e.target.select()}
                value={hernoemNaam}
              />
              <div className="hm-dialoog__acties">
                <button
                  className="hm-btn hm-btn--ghost"
                  onClick={() => setHernoemDoc(null)}
                  type="button"
                >
                  Annuleren
                </button>
                <button className="hm-btn hm-btn--primary" type="submit">
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {verplaatsIds && (
        <VerplaatsDialoog
          docs={docs}
          onKies={(naar) => {
            verplaats(verplaatsIds, naar);
            setVerplaatsIds(null);
            setSelectie([]);
          }}
          onSluit={() => setVerplaatsIds(null)}
          teVerplaatsen={verplaatsIds}
        />
      )}

      {leesDoc && <LeesPanel doc={leesDoc} onSluit={() => setLeesDoc(null)} />}

      {viewerDoc && (
        <div
          className="hm-kb__viewer"
          onClick={() => setViewerDoc(null)}
          role="presentation"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={viewerDoc.titel} src={bestandVan(viewerDoc)?.url ?? ""} />
          <p>{viewerDoc.titel} — klik om te sluiten</p>
        </div>
      )}

      {uploadBezig > 0 && (
        <div className="hm-toast" role="status">
          Bezig met uploaden… ({uploadBezig})
        </div>
      )}
      {toast && uploadBezig === 0 && (
        <div
          className={`hm-toast${toast.soort === "fout" ? " hm-toast--fout" : ""}`}
          role="status"
        >
          {toast.tekst}
        </div>
      )}
    </div>
  );
}

/* ── Detailrail ──────────────────────────────────────────────────────── */

function DetailRail({
  aantalKinderen,
  doc,
  heeftKinderen,
  isBeheerder,
  onHernoem,
  onHerstel,
  onOpen,
  onPrullenbak,
  onVerplaats,
  onVerwijderDefinitief,
  prullenbak,
}: {
  aantalKinderen: (id: number) => number;
  doc: KnowledgeDoc;
  heeftKinderen: (id: number) => boolean;
  isBeheerder: boolean;
  onHernoem: () => void;
  onHerstel: () => void;
  onOpen: () => void;
  onPrullenbak: () => void;
  onVerplaats: () => void;
  onVerwijderDefinitief: () => void;
  prullenbak: boolean;
}) {
  const map = doc.soort === "map" || heeftKinderen(doc.id);
  const type = itemType(doc, map);
  const file = bestandVan(doc);
  const thumb = thumbnailUrl(doc);
  const org =
    doc.organisatie && typeof doc.organisatie === "object"
      ? doc.organisatie.naam
      : null;
  const project =
    doc.project && typeof doc.project === "object" ? doc.project.naam : null;

  return (
    <>
      <div className="hm-kb__railbanner" style={{ background: `${type.kleur}22`, color: type.kleur }}>
        <type.Icoon size={16} strokeWidth={2} />
        {type.label}
      </div>
      {thumb && (
        <div className="hm-kb__railthumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={thumb} />
        </div>
      )}
      <div className="hm-kb__railtitle">{doc.titel}</div>

      <div className="hm-kb__railkop">Informatie</div>
      <div className="hm-kb__kv">
        <span>Type</span>
        <span>{map ? `Map · ${aantalKinderen(doc.id)} items` : type.label}</span>
      </div>
      {file?.filesize != null && (
        <div className="hm-kb__kv">
          <span>Grootte</span>
          <span>{bestandGrootte(file.filesize)}</span>
        </div>
      )}
      <div className="hm-kb__kv">
        <span>Auteur</span>
        <span>{auteurNaam(doc) ?? "—"}</span>
      </div>
      <div className="hm-kb__kv">
        <span>Gemaakt</span>
        <span>{datumKort(doc.createdAt)}</span>
      </div>
      <div className="hm-kb__kv">
        <span>Gewijzigd</span>
        <span>{datumKort(doc.updatedAt)}</span>
      </div>
      <div className="hm-kb__kv">
        <span>Zichtbaar</span>
        <span
          className={`hm-pill ${doc.zichtbaarheid === "publiek" ? "hm-pill--emerald" : "hm-pill--slate"}`}
        >
          {doc.zichtbaarheid === "publiek" ? "Publiek" : "Intern"}
        </span>
      </div>
      {org && (
        <div className="hm-kb__kv">
          <span>Organisatie</span>
          <span>{org}</span>
        </div>
      )}
      {project && (
        <div className="hm-kb__kv">
          <span>Project</span>
          <span>{project}</span>
        </div>
      )}
      {(doc.tags ?? []).length > 0 && (
        <div className="hm-kb__railtags">
          {(doc.tags ?? []).map((tag) => (
            <span className="hm-pill hm-pill--slate" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="hm-kb__railacties">
        {prullenbak ? (
          <>
            <button className="hm-btn hm-btn--ghost" onClick={onHerstel} type="button">
              <RotateCcw size={13} /> Herstellen
            </button>
            {isBeheerder && (
              <button
                className="hm-btn hm-btn--gevaar"
                onClick={onVerwijderDefinitief}
                type="button"
              >
                <Trash2 size={13} /> Definitief verwijderen
              </button>
            )}
          </>
        ) : (
          <>
            <button className="hm-btn hm-btn--primary" onClick={onOpen} type="button">
              {map ? "Openen" : doc.soort === "bestand" ? "Bekijken" : "Lezen"}
            </button>
            {file?.url && (
              <a
                className="hm-btn hm-btn--ghost"
                download={file.filename ?? true}
                href={file.url}
              >
                <Download size={13} /> Downloaden
              </a>
            )}
            <button className="hm-btn hm-btn--ghost" onClick={onHernoem} type="button">
              <Pencil size={13} /> Hernoemen
            </button>
            <button className="hm-btn hm-btn--ghost" onClick={onVerplaats} type="button">
              <FolderInput size={13} /> Verplaatsen
            </button>
            <button
              className="hm-btn hm-btn--gevaar"
              onClick={onPrullenbak}
              type="button"
            >
              <Trash2 size={13} /> Prullenbak
            </button>
          </>
        )}
      </div>
    </>
  );
}
