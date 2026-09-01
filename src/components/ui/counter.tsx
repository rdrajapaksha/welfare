"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** Counts up to `value` once the element scrolls into view. */
export function Counter({
  value,
  locale,
  format = "number",
  suffix,
  duration = 1500,
  className,
}: {
  value: number;
  locale: Locale;
  format?: "number" | "currency";
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        // easeOutExpo keeps the final digits from crawling.
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setDisplay(Math.round(value * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted =
    format === "currency"
      ? formatCurrency(display, locale, true)
      : formatNumber(display, locale, value >= 10000);

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
