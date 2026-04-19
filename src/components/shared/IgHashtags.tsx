"use client";

import { useMemo, useState } from "react";

interface IgHashtagsProps {
  captions: string[];
  dark?: boolean;
}

function extractHashtags(captions: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const caption of captions) {
    const tags = caption.match(/#[a-zA-Z]\w*/g) ?? [];
    for (const tag of tags) {
      const lower = tag.toLowerCase();
      counts.set(lower, (counts.get(lower) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function IgHashtags({ captions, dark = true }: IgHashtagsProps) {
  const [showAll, setShowAll] = useState(false);
  const tags = useMemo(() => extractHashtags(captions), [captions]);

  if (tags.length === 0) return null;

  const displayed = showAll ? tags : tags.slice(0, 10);
  const textClass = dark ? "text-muted-foreground" : "text-gray-500";

  return (
    <div className="space-y-3 pt-2">
      <p className={`text-xs uppercase tracking-wider ${textClass}`}>Top hashtags</p>
      <div className="flex flex-wrap gap-2">
        {displayed.map(([tag, count]) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
            style={{
              borderColor: dark ? "oklch(0.3 0 0)" : "#e5e7eb",
              background: dark ? "oklch(0.14 0 0)" : "#f9fafb",
              color: dark ? "oklch(0.8 0 0)" : "#374151",
            }}
          >
            {tag}
            {count > 1 && (
              <span style={{ color: "var(--emerald)", fontSize: "0.65rem" }}>×{count}</span>
            )}
          </span>
        ))}
        {!showAll && tags.length > 10 && (
          <button
            onClick={() => setShowAll(true)}
            className={`text-xs px-2 py-0.5 rounded-full border border-dashed ${textClass} hover:opacity-80`}
            style={{ borderColor: dark ? "oklch(0.3 0 0)" : "#e5e7eb" }}
          >
            +{tags.length - 10} more
          </button>
        )}
      </div>
    </div>
  );
}
