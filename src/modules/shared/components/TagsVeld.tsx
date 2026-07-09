"use client";

import { X } from "lucide-react";
import React, { useState } from "react";

/** Vrije-tekst-waarden als chips: Enter/komma voegt toe, × verwijdert.
    Gebruikt voor tags, telefoonnummers, extra e-mails en veld-opties. */
export function TagsVeld({
  onWijzig,
  placeholder,
  tags,
}: {
  onWijzig: (tags: string[]) => void;
  placeholder?: string;
  tags: string[];
}) {
  const [invoer, setInvoer] = useState("");

  const voegToe = () => {
    const tag = invoer.trim();
    setInvoer("");
    if (!tag || tags.includes(tag)) return;
    onWijzig([...tags, tag]);
  };

  return (
    <div className="hm-tagsveld">
      {tags.map((tag) => (
        <span className="hm-pill" key={tag}>
          {tag}
          <button
            aria-label={`'${tag}' verwijderen`}
            onClick={() => onWijzig(tags.filter((t) => t !== tag))}
            type="button"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        aria-label="Nieuwe waarde"
        onBlur={voegToe}
        onChange={(e) => setInvoer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            voegToe();
          }
        }}
        placeholder={tags.length === 0 ? (placeholder ?? "Waarde + Enter…") : ""}
        value={invoer}
      />
    </div>
  );
}

export function lijstVan(arr?: (string | null)[] | null): string[] {
  return (arr ?? []).filter((t): t is string => Boolean(t));
}
