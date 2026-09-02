"use client";

import { Button } from "@/components/ui/button";

export function PrintReportButton({ label }: { label: string }) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
