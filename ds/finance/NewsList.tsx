"use client";

import { useEffect, useState } from "react";

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  source?: string;
  publishedAt: string;
  origin: "naver" | "mock";
}

interface NewsListProps {
  query: string;
  limit?: number;
  /** Show source pill ("실시간 네이버 뉴스") regardless of origin */
  showOriginBadge?: boolean;
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function NewsList({ query, limit = 6, showOriginBadge = true }: NewsListProps) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [origin, setOrigin] = useState<"naver" | "mock" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    const url = `/api/news?q=${encodeURIComponent(query)}&limit=${limit}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: { items: NewsItem[]; origin: "naver" | "mock" }) => {
        if (cancelled) return;
        setItems(data.items);
        setOrigin(data.origin);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [query, limit]);

  if (error) {
    return (
      <div className="bm-card px-3 py-3 text-[13px] text-[color:var(--bm-muted)]">
        뉴스를 불러오지 못했습니다.
      </div>
    );
  }
  if (items === null) {
    return (
      <div className="bm-card px-3 py-3 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 rounded bg-slate-100 w-3/4 bm-shine" />
            <div className="h-3 rounded bg-slate-100 w-full bm-shine" />
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="bm-card px-3 py-3 text-[13px] text-[color:var(--bm-muted)]">
        관련 뉴스가 없습니다.
      </div>
    );
  }

  return (
    <div className="bm-card overflow-hidden">
      {showOriginBadge ? (
        <div className="px-3 pt-2 pb-1 flex items-center gap-2">
          <span
            className="bm-pill"
            style={{
              background: origin === "naver" ? "#03C75A" : "rgba(15,23,42,0.08)",
              color: origin === "naver" ? "white" : "var(--bm-muted)",
              fontSize: 11,
              padding: "2px 8px",
            }}
          >
            {origin === "naver" ? "실시간 네이버 뉴스" : "샘플 뉴스"}
          </span>
          <span className="text-[11px] text-[color:var(--bm-muted)]">
            검색어: <span className="font-bold">{query}</span>
          </span>
        </div>
      ) : null}
      <ul className="divide-y divide-slate-100">
        {items.map((item, i) => (
          <li key={`${item.link}-${i}`}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2.5 active:bg-slate-50"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[13.5px] leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-[color:var(--bm-muted)] line-clamp-2 mt-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[color:var(--bm-muted)]">
                    {item.source ? (
                      <span className="font-semibold">{item.source}</span>
                    ) : null}
                    <span>·</span>
                    <span>{timeAgo(item.publishedAt)}</span>
                  </div>
                </div>
                <span className="text-[color:var(--bm-muted)] mt-1">›</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
