"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export function PipelineNavLink() {
  const pathname = usePathname();
  const actief = pathname === "/admin/pipeline";
  return (
    <Link
      className={`nav__link${actief ? " active" : ""}`}
      href="/admin/pipeline"
      style={{ display: "block", padding: "4px 0", textDecoration: "none" }}
    >
      Pipeline
    </Link>
  );
}
