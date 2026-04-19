"use client";

import { useEffect } from "react";

export default function PublicPageError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("[c/slug] render error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-800">Unable to load this creator profile.</p>
        <p className="text-xs text-gray-500">Please try again later.</p>
      </div>
    </div>
  );
}
