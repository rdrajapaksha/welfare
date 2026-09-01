"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type AccordionItem = { id: string; question: string; answer: string };

export function Accordion({
  items,
  className,
  defaultOpenId,
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className={cn("divide-y divide-ink-200/70 dark:divide-white/10", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`panel-${item.id}`}
                id={`trigger-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex w-full items-start justify-between gap-4 py-5 text-left"
              >
                <span
                  className={cn(
                    "text-base font-semibold transition-colors sm:text-lg",
                    open
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300",
                  )}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    open
                      ? "rotate-45 border-brand-600 bg-brand-600 text-white"
                      : "border-ink-300 text-ink-500 group-hover:border-brand-400 group-hover:text-brand-600 dark:border-white/20 dark:text-ink-300",
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={`panel-${item.id}`}
              role="region"
              aria-labelledby={`trigger-${item.id}`}
              hidden={!open}
              className="pb-6 pr-10"
            >
              <p className="text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink-600 dark:text-ink-300">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
