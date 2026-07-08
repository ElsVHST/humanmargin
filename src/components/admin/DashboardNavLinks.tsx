"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const LINKS: { href: string; label: string }[] = [
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/taken", label: "Taken" },
];

export function DashboardNavLinks() {
  const pathname = usePathname();
  return (
    <div style={{ marginTop: "0.5rem" }}>
      {LINKS.map((link) => (
        <Link
          className={`nav__link${pathname === link.href ? " active" : ""}`}
          href={link.href}
          key={link.href}
          style={{ display: "block", padding: "4px 0", textDecoration: "none" }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
