"use client";

import { useAuth } from "@payloadcms/ui";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import type { User } from "@/payload-types";

import { avatarKleur, initialen } from "@/modules/shared/ui";
import { GlobalSearch } from "./GlobalSearch";

import "@/modules/shared/styles/dashboard.scss";
import "./shell.scss";

const QUICK_ADD: { label: string; href: string }[] = [
  { label: "Deal", href: "/admin/collections/deals/create" },
  { label: "Taak", href: "/admin/collections/tasks/create" },
  { label: "Content", href: "/admin/collections/content-items/create" },
  { label: "Organisatie", href: "/admin/collections/organisations/create" },
  { label: "Contactpersoon", href: "/admin/collections/contacts/create" },
  { label: "Kennisdocument", href: "/admin/collections/knowledge-docs/create" },
];

function QuickAdd() {
  const [open, setOpen] = useState(false);
  return (
    <div className="hm-menu__wrap">
      <button
        aria-label="Toevoegen"
        className="hm-topbar__plus"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Plus size={17} strokeWidth={2.25} />
      </button>
      {open && (
        <>
          <div
            aria-hidden
            className="hm-menu__backdrop"
            onClick={() => setOpen(false)}
            role="presentation"
          />
          <div className="hm-menu" role="menu">
            <p className="hm-menu__kop">Nieuw</p>
            {QUICK_ADD.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserChip() {
  const { user } = useAuth<User>();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const naam = user.name ?? user.email;
  return (
    <div className="hm-menu__wrap">
      <button
        className="hm-topbar__user"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="hm-av" style={{ background: avatarKleur(user.id) }}>
          {initialen(naam)}
        </span>
        <span className="hm-topbar__usernaam">
          <b>{naam}</b>
          <i>Human Margin</i>
        </span>
      </button>
      {open && (
        <>
          <div
            aria-hidden
            className="hm-menu__backdrop"
            onClick={() => setOpen(false)}
            role="presentation"
          />
          <div className="hm-menu" role="menu">
            <Link href="/admin/account" onClick={() => setOpen(false)}>
              Profiel
            </Link>
            <Link href="/admin/logout" onClick={() => setOpen(false)}>
              Uitloggen
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function Topbar({
  acties,
  titel,
}: {
  acties?: React.ReactNode;
  titel: string;
}) {
  const [zoekOpen, setZoekOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setZoekOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="hm-topbar">
      <h1 className="hm-topbar__titel">{titel}</h1>
      <button
        className="hm-topbar__search"
        onClick={() => setZoekOpen(true)}
        type="button"
      >
        <Search size={15} strokeWidth={2} />
        <span>Zoeken…</span>
        <kbd>⌘K</kbd>
      </button>
      <div className="hm-topbar__rechts">
        {acties}
        <QuickAdd />
        <UserChip />
      </div>
      {zoekOpen && <GlobalSearch onClose={() => setZoekOpen(false)} />}
    </header>
  );
}
