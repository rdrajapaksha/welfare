import type { ReactNode } from "react";

/**
 * Pass-through root layout. `<html>` / `<body>` live in the `[locale]` layout
 * so every URL is language-prefixed and hreflang-canonical.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
