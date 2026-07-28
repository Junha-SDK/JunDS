"use client";

import { CATEGORY_LABELS, TONE_TOKENS, type ClassifiedDisclosure } from "./lib/disclosureTone";

interface DisclosureToneBadgeProps {
  classification: ClassifiedDisclosure;
  /** Compact variant for table rows. */
  compact?: boolean;
}

export function DisclosureToneBadge({ classification, compact }: DisclosureToneBadgeProps) {
  const t = TONE_TOKENS[classification.tone];
  const cat = CATEGORY_LABELS[classification.category];
  const conf = Math.round(classification.confidence * 100);

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10.5px] font-extrabold"
        style={{ background: t.bg, color: t.fg }}
        title={`${t.label} · ${cat}${
          classification.matched.length ? ` · ${classification.matched.join(", ")}` : ""
        } · 신뢰도 ${conf}%`}
      >
        {t.label}
      </span>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-2.5 h-7 rounded-lg"
      style={{ background: t.bg }}
    >
      <span className="text-[11px] font-extrabold tracking-wide" style={{ color: t.fg }}>
        {t.label}
      </span>
      <span className="text-[10.5px] font-bold" style={{ color: t.fg, opacity: 0.85 }}>
        {cat}
      </span>
      {classification.confidence > 0 ? (
        <span className="bm-num text-[10px] font-bold" style={{ color: t.fg, opacity: 0.6 }}>
          {conf}%
        </span>
      ) : null}
    </div>
  );
}
