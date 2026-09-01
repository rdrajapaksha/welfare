"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ScrollToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "no-print fixed right-5 bottom-5 z-40 grid size-11 place-items-center rounded-full bg-ink-950 text-white shadow-lift transition-all duration-300 hover:bg-brand-700",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp aria-hidden className="size-5" />
    </button>
  );
}
