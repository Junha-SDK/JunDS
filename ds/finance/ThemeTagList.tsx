"use client";

import Link from "next/link";

const ACCENTS = [
  { fg: "var(--bm-cat-3)", bg: "color-mix(in srgb, var(--bm-cat-3) 12%, transparent)" },
  { fg: "var(--bm-cat-2)", bg: "color-mix(in srgb, var(--bm-cat-2) 12%, transparent)" },
  { fg: "var(--bm-cat-4)", bg: "color-mix(in srgb, var(--bm-cat-4) 12%, transparent)" },
  { fg: "var(--bm-cat-8)", bg: "color-mix(in srgb, var(--bm-cat-8) 12%, transparent)" },
  { fg: "var(--bm-cat-5)", bg: "color-mix(in srgb, var(--bm-cat-5) 12%, transparent)" },
];

export function ThemeTagList({ themes }: { themes: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {themes.map((t, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        return (
          <Link
            key={t}
            href={`/themes/daily?q=${encodeURIComponent(t)}`}
            className="bm-chip"
            style={
              {
                background: accent.bg,
                color: accent.fg,
                borderColor: "transparent",
              } as React.CSSProperties
            }
          >
            <span aria-hidden style={{ opacity: 0.7 }}>
              #
            </span>
            {t}
          </Link>
        );
      })}
    </div>
  );
}
