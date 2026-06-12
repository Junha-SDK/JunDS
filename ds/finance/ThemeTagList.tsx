"use client";

import Link from "next/link";

const ACCENTS = [
  { fg: "#0d9488", bg: "rgba(20, 184, 166, 0.12)" },
  { fg: "#9333ea", bg: "rgba(147, 51, 234, 0.12)" },
  { fg: "#ea580c", bg: "rgba(234, 88, 12, 0.12)" },
  { fg: "#0284c7", bg: "rgba(2, 132, 199, 0.12)" },
  { fg: "#db2777", bg: "rgba(219, 39, 119, 0.12)" },
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
            <span aria-hidden style={{ opacity: 0.7 }}>#</span>
            {t}
          </Link>
        );
      })}
    </div>
  );
}
