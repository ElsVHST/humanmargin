"use server";

import config from "@payload-config";
import { getPayload } from "payload";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!email || !/.+@.+\..+/.test(email)) {
    return { status: "error", message: "Vul een geldig e-mailadres in." };
  }

  const payload = await getPayload({ config });
  try {
    await payload.create({
      collection: "subscribers",
      data: { name, email, source },
    });
  } catch (err) {
    // uniek e-mailadres: al aangemeld is ook prima
    const message = err instanceof Error ? err.message : "";
    if (!message.toLowerCase().includes("unique") && !message.toLowerCase().includes("duplicate")) {
      return { status: "error", message: "Er ging iets mis. Probeer het later opnieuw." };
    }
  }
  return { status: "success", message: "Gelukt! Je staat op de lijst." };
}
