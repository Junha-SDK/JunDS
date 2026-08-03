"use client";

import { useEffect, useState } from "react";
import { summarizeNews, type NewsSummary, type SummarizableNews } from "./lib/newsSummary";
import { AppIcon } from "./AppIcon";

interface ThemeNewsSummaryProps {
  /** Search query (e.g. theme name or stock name). */
  query: string;
  /** How many news items to fetch + summarize. */
  limit?: number;
  /** Compact variant for sidebars. */
  compact?: boolean;
}

interface ApiResp {
  items: SummarizableNews[];
}

export function ThemeNewsSummary({ query, limit = 10, compact }: ThemeNewsSummaryProps) {
  const [summary, setSummary] = useState<NewsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/news?q=${encodeURIComponent(query)}&limit=${limit}`)
      .then(async (r) => {
        const json = (await r.json()) as ApiResp;
        if (cancelled) return;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const s = summarizeNews(json.items ?? [], compact ? 2 : 3);
        setSummary(s);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, limit, compact]);

  if (loading) {
    return (
      <section className="bm-card-lg p-4">
        <div className="bm-skeleton h-4 w-32 mb-3" />
        <div className="bm-skeleton h-3 w-full mb-1.5" />
        <div className="bm-skeleton h-3 w-11/12 mb-1.5" />
        <div className="bm-skeleton h-3 w-3/4" />
      </section>
    );
  }
  if (error || !summary || summary.itemCount === 0) {
    return (
      <section className="bm-card-lg p-4">
        <div className="text-[12px]" style={{ color: "var(--bm-muted)" }}>
          관련 뉴스를 가져오지 못했습니다.
        </div>
      </section>
    );
  }

  const toneTone = summary.tone > 0.15 ? "positive" : summary.tone < -0.15 ? "negative" : "neutral";
  const toneStyle: Record<typeof toneTone, { fg: string; bg: string; label: string }> = {
    positive: { fg: "var(--bm-up)", bg: "var(--bm-up-soft)", label: "전반 호재" },
    negative: { fg: "var(--bm-down)", bg: "var(--bm-down-soft)", label: "전반 악재" },
    neutral: { fg: "var(--bm-muted)", bg: "var(--bm-soft-100)", label: "혼조" },
  };
  const t = toneStyle[toneTone];

  return (
    <section className="bm-card-lg overflow-hidden">
      <div className="bm-section-head">
        <div className="bm-section-title">
          <AppIcon name="sparkles" size={14} strokeWidth={2.4} color="var(--bm-accent-strong)" />
          뉴스 한눈에
          <span
            className="ml-2 text-[10.5px] font-bold tracking-wide uppercase"
            style={{ color: "var(--bm-muted)" }}
          >
            “{query}” · {summary.itemCount}건
          </span>
        </div>
        <span
          className="text-[11px] font-extrabold px-2 h-6 rounded-md grid place-items-center"
          style={{ background: t.bg, color: t.fg }}
        >
          {t.label} {summary.tone >= 0 ? "+" : ""}
          {summary.tone.toFixed(2)}
        </span>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {summary.sentences.map((s, i) => (
          <p key={i} className="text-[13.5px] leading-relaxed flex gap-2.5">
            <span
              className="bm-num shrink-0 size-5 rounded-md grid place-items-center text-[10.5px] font-extrabold"
              style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
            >
              {i + 1}
            </span>
            <span style={{ color: "var(--bm-text)" }}>{s}</span>
          </p>
        ))}
      </div>
      {!compact && summary.keyTerms.length > 0 ? (
        <div
          className="px-5 py-3 flex items-center gap-1.5 flex-wrap"
          style={{ borderTop: "1px solid var(--bm-border)" }}
        >
          <span
            className="text-[10.5px] font-bold tracking-wide uppercase mr-1"
            style={{ color: "var(--bm-muted)" }}
          >
            키워드
          </span>
          {summary.keyTerms.map((k) => (
            <span key={k.term} className="bm-chip">
              {k.term}
              <span className="bm-num text-[10px] font-bold ml-1" style={{ opacity: 0.6 }}>
                {k.count}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
