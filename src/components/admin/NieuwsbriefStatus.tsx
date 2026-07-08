"use client";

import { useFormFields } from "@payloadcms/ui";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import React, { useState } from "react";

export function NieuwsbriefStatusField() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <NieuwsbriefStatusInner />
    </QueryClientProvider>
  );
}

function NieuwsbriefStatusInner() {
  const email = useFormFields(
    ([fields]) => fields.email?.value as string | undefined,
  );

  const status = useQuery({
    queryKey: ["nieuwsbriefstatus", email],
    enabled: Boolean(email && email.includes("@")),
    queryFn: async () => {
      const qs = new URLSearchParams({
        "where[email][equals]": String(email),
        limit: "1",
      });
      const res = await fetch(`/api/subscribers?${qs.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`GET subscribers → ${res.status}`);
      const data = (await res.json()) as { totalDocs: number };
      return data.totalDocs > 0;
    },
  });

  if (!email || !email.includes("@")) return null;

  return (
    <div className="field-type">
      <p
        style={{
          color: status.data
            ? "var(--theme-success-750)"
            : "var(--theme-elevation-500)",
          fontSize: "0.8125rem",
          margin: "-0.5rem 0 1rem",
        }}
      >
        {status.isLoading
          ? "Nieuwsbriefstatus controleren…"
          : status.data
            ? "✓ Aangemeld voor de nieuwsbrief"
            : "Niet aangemeld voor de nieuwsbrief"}
      </p>
    </div>
  );
}
