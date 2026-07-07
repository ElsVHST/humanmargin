"use client";

import { useActionState } from "react";

import { subscribe, type SubscribeState } from "@/app/(frontend)/actions/subscribe";
import { cn } from "@/lib/utils";

const initialState: SubscribeState = { status: "idle" };

// Nieuwsbrief-formulier onder de Marge-notitie. Naam + E-mail naast elkaar (desktop),
// gestapeld op mobiel. Knop blauw (#002CCF) met gele tekst, exact naar het origineel.
// Server action `subscribe` schrijft naar de subscribers-collectie via useActionState.
export function SignupForm({ buttonLabel, source }: { buttonLabel: string; source: string }) {
  const [state, formAction, pending] = useActionState(subscribe, initialState);

  const inputClass =
    "min-h-[47px] w-full border border-[#69727d] bg-hm-white px-4 py-2 font-sans text-[18px] leading-[25.2px] text-hm-black outline-none transition-colors duration-300 focus:border-hm-blue";

  return (
    <form action={formAction} className="w-full" noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-[15px] sm:flex-row sm:flex-wrap">
        <input
          type="text"
          name="name"
          placeholder="Naam"
          aria-label="Naam"
          className={cn(inputClass, "sm:w-[182px]")}
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          aria-label="E-mail"
          required
          className={cn(inputClass, "sm:w-[379px] sm:flex-1")}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "min-h-[47px] rounded-none px-[30px] py-[15px] text-center font-sans text-[15px] font-bold uppercase leading-[15px]",
            "bg-hm-blue text-hm-yellow shadow-[0px_0px_3px_0px_rgba(0,0,0,0.43)] transition-all duration-300",
            "hover:bg-hm-yellow hover:text-hm-black disabled:opacity-60 sm:w-[182px]",
          )}
        >
          {buttonLabel}
        </button>
      </div>
      {state.status !== "idle" && state.message && (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "mt-3 font-sans text-[16px]",
            state.status === "success" ? "text-hm-yellow" : "text-hm-orange",
          )}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
