"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render error", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <p className="text-sm font-medium">Something went wrong loading your dashboard.</p>
      <p className="text-xs text-muted-foreground max-w-sm">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <Button size="sm" variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
