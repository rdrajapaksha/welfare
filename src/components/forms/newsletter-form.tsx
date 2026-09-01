"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

export function NewsletterForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    placeholder: string;
    cta: string;
    success: string;
    exists: string;
    error: string;
    email: string;
  };
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "exists" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = (await response.json()) as { ok?: boolean; duplicate?: boolean };
      if (data.duplicate) setState("exists");
      else if (data.ok) {
        setState("done");
        setEmail("");
      } else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-teal-200">
        <Check aria-hidden className="size-4 shrink-0" />
        {labels.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          {labels.email}
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          placeholder={labels.placeholder}
          className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-ink-300 focus:border-brand-300 focus:ring-4 focus:ring-brand-400/25 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          aria-label={labels.cta}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {state === "loading" ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <ArrowRight aria-hidden className="size-4" />
          )}
        </button>
      </div>
      {state === "exists" && <p className="text-xs text-gold-300">{labels.exists}</p>}
      {state === "error" && <p className="text-xs text-brand-300">{labels.error}</p>}
    </form>
  );
}
