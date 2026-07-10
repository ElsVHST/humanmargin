"use client";

import { useAuth } from "@payloadcms/ui";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Brain,
  CalendarDays,
  Contact,
  FileText,
  FolderKanban,
  House,
  Image as ImageIcon,
  LogOut,
  Mail,
  PanelBottom,
  PanelTop,
  SquareCheck,
  SquareKanban,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import type { User } from "@/payload-types";

import "@/modules/shared/styles/dashboard.scss";
import "./shell.scss";

type RailLink = {
  href: string;
  label: string;
  Icoon: LucideIcon;
  exact?: boolean;
};

const WERKEN: RailLink[] = [
  { href: "/admin", label: "Home", Icoon: House, exact: true },
  { href: "/admin/pipeline", label: "Pipeline", Icoon: SquareKanban },
  { href: "/admin/relaties", label: "Relaties", Icoon: Contact },
  { href: "/admin/projecten", label: "Projecten", Icoon: FolderKanban },
  { href: "/admin/taken", label: "Taken", Icoon: SquareCheck },
  { href: "/admin/kalender", label: "Kalender", Icoon: CalendarDays },
  { href: "/admin/kennisbank", label: "Kennisbank", Icoon: BookOpen },
  { href: "/admin/second-brain", label: "Second Brain", Icoon: Brain },
];

const BEHEER: RailLink[] = [
  { href: "/admin/collections/pages", label: "Pagina's", Icoon: FileText },
  { href: "/admin/collections/media", label: "Media", Icoon: ImageIcon },
  { href: "/admin/globals/header", label: "Header / navigatie", Icoon: PanelTop },
  { href: "/admin/globals/footer", label: "Footer", Icoon: PanelBottom },
  { href: "/admin/collections/users", label: "Gebruikers", Icoon: UsersRound },
  { href: "/admin/collections/subscribers", label: "Abonnees", Icoon: Mail },
];

function RailItem({ link, pathname }: { link: RailLink; pathname: string }) {
  const actief = link.exact
    ? pathname === link.href
    : pathname.startsWith(link.href);
  return (
    <Link
      className={`hm-rail__item${actief ? " is-actief" : ""}`}
      href={link.href}
    >
      <link.Icoon size={20} strokeWidth={1.75} />
      <span className="hm-rail__tip">{link.label}</span>
    </Link>
  );
}

export function Rail() {
  const pathname = usePathname() ?? "";
  const { user } = useAuth<User>();
  const isBeheerder = user?.role === "beheerder";

  return (
    <nav aria-label="Hoofdnavigatie" className="hm-rail">
      <Link aria-label="Naar home" className="hm-rail__logo" href="/admin">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src="/seo/human-margin-favicon-full-color-rgb-900px-w-72ppi-150x150.png"
        />
      </Link>
      <div className="hm-rail__group">
        {WERKEN.map((link) => (
          <RailItem key={link.href} link={link} pathname={pathname} />
        ))}
      </div>
      {isBeheerder && (
        <>
          <div className="hm-rail__sep" />
          <div className="hm-rail__group">
            {BEHEER.map((link) => (
              <RailItem key={link.href} link={link} pathname={pathname} />
            ))}
          </div>
        </>
      )}
      <div className="hm-rail__foot">
        <Link className="hm-rail__item" href="/admin/logout">
          <LogOut size={20} strokeWidth={1.75} />
          <span className="hm-rail__tip">Uitloggen</span>
        </Link>
      </div>
    </nav>
  );
}
