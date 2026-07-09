"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

type Bron = {
  slug: string;
  label: string;
  veld: string;
  href: (id: string | number) => string;
};

const BRONNEN: Bron[] = [
  {
    slug: "deals",
    label: "Deals",
    veld: "titel",
    href: (id) => `/admin/pipeline?deal=${id}`,
  },
  {
    slug: "organisations",
    label: "Organisaties",
    veld: "naam",
    href: (id) => `/admin/collections/organisations/${id}`,
  },
  {
    slug: "contacts",
    label: "Contactpersonen",
    veld: "naam",
    href: (id) => `/admin/collections/contacts/${id}`,
  },
  {
    slug: "projects",
    label: "Projecten",
    veld: "naam",
    href: (id) => `/admin/collections/projects/${id}`,
  },
  {
    slug: "tasks",
    label: "Taken",
    veld: "titel",
    href: (id) => `/admin/collections/tasks/${id}`,
  },
  {
    slug: "content-items",
    label: "Content",
    veld: "titel",
    href: (id) => `/admin/collections/content-items/${id}`,
  },
  {
    slug: "knowledge-docs",
    label: "Kennisbank",
    veld: "titel",
    href: (id) => `/admin/collections/knowledge-docs/${id}`,
  },
];

type Treffer = {
  groep: string;
  titel: string;
  href: string;
};

async function zoek(q: string, signal: AbortSignal): Promise<Treffer[]> {
  const per = await Promise.all(
    BRONNEN.map(async (bron) => {
      const url = `/api/${bron.slug}?where[${bron.veld}][like]=${encodeURIComponent(q)}&limit=5&depth=0`;
      try {
        const res = await fetch(url, { credentials: "include", signal });
        if (!res.ok) return [];
        const data = (await res.json()) as {
          docs: ({ id: string | number } & Record<string, unknown>)[];
        };
        return data.docs.map((doc) => ({
          groep: bron.label,
          titel: String(doc[bron.veld] ?? "Zonder titel"),
          href: bron.href(doc.id),
        }));
      } catch {
        return [];
      }
    }),
  );
  return per.flat();
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [resultaat, setResultaat] = useState<{
    voor: string;
    treffers: Treffer[];
  } | null>(null);
  const [actief, setActief] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      zoek(term, controller.signal)
        .then((res) => {
          setResultaat({ voor: term, treffers: res });
          setActief(0);
        })
        .catch(() => {});
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [q]);

  const term = q.trim();
  const treffers =
    term.length >= 2 && resultaat?.voor === term ? resultaat.treffers : [];
  const bezig = term.length >= 2 && resultaat?.voor !== term;

  const openTreffer = (treffer: Treffer) => {
    onClose();
    router.push(treffer.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActief((i) => Math.min(i + 1, treffers.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActief((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && treffers[actief]) {
      e.preventDefault();
      openTreffer(treffers[actief]);
    }
  };

  return (
    <>
      <div
        aria-hidden
        className="hm-zoek__backdrop"
        onClick={onClose}
        role="presentation"
      />
      <div aria-label="Zoeken" className="hm-zoek" role="dialog">
        <div className="hm-zoek__input">
          <Search size={17} strokeWidth={2} />
          <input
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Zoek deals, organisaties, taken, content…"
            ref={inputRef}
            value={q}
          />
          {bezig && <small>zoeken…</small>}
        </div>
        {term.length >= 2 && (
          <div className="hm-zoek__lijst">
            {treffers.length === 0 && !bezig && (
              <p className="hm-zoek__leeg">
                Niets gevonden voor &lsquo;{term}&rsquo;.
              </p>
            )}
            {treffers.map((treffer, i) => {
              const toonGroep =
                i === 0 || treffers[i - 1].groep !== treffer.groep;
              return (
                <React.Fragment key={`${treffer.href}-${i}`}>
                  {toonGroep && (
                    <p className="hm-zoek__groep">{treffer.groep}</p>
                  )}
                  <button
                    className={`hm-zoek__item${i === actief ? " is-actief" : ""}`}
                    onClick={() => openTreffer(treffer)}
                    onMouseEnter={() => setActief(i)}
                    type="button"
                  >
                    {treffer.titel}
                    <small>{treffer.groep}</small>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
