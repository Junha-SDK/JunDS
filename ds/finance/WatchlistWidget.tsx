"use client";

import Link from "next/link";
import { Badge } from "@junds/ui";
import { useWatchlist } from "./lib/watchlist";
import { StarButton } from "./StarButton";
import { LivePrice, LivePctBadge, LiveStatusDot } from "./LivePrice";
import { useRealPrices } from "./lib/livePrices";

export function WatchlistWidget() {
  const { items, entries, hydrated } = useWatchlist();
  // 관심종목을 KIS 실데이터로 5초마다 시드 (장 외에는 시뮬레이터 자동 정지)
  const { source } = useRealPrices(hydrated ? items : []);
  const colorByName = new Map(entries.map((e) => [e.name, e.color]));

  if (!hydrated) {
    return null;
  }

  const sourceLabel: Record<typeof source, { text: string; color: string } | null> = {
    kis: { text: "KIS 실시간", color: "var(--bm-success)" },
    yahoo: { text: "Yahoo (15분 지연)", color: "var(--bm-warning)" },
    pending: { text: "연결 중", color: "#94a3b8" },
    error: { text: "데이터 없음", color: "#94a3b8" },
  };
  const srcMeta = sourceLabel[source];

  return (
    <section className="bm-card overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3" style={{ borderBottom: items.length > 0 ? "1px solid var(--bm-border)" : "none" }}>
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--bm-warning)", fontSize: 15 }}>★</span>
          <h2 className="font-extrabold text-[14px]">관심종목</h2>
          <Badge variant="info" size="sm">
            {items.length}
          </Badge>
          {items.length > 0 ? <LiveStatusDot /> : null}
          {items.length > 0 && srcMeta ? (
            <span
              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded"
              style={{ background: "var(--bm-soft-100)", color: srcMeta.color }}
              title="가격 데이터 출처"
            >
              {srcMeta.text}
            </span>
          ) : null}
        </div>
        <Link
          href="/search"
          className="text-[12px] text-[color:var(--bm-muted)] font-semibold"
        >
          추가 ›
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="px-4 py-5 text-[12.5px] text-[color:var(--bm-muted)] leading-relaxed">
          종목 상세에서 ☆ 을 눌러 관심종목으로 등록할 수 있습니다.
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--bm-border)" }}>
          {items.map((name) => {
            const color = colorByName.get(name);
            return (
              <li key={name} className="flex items-center px-3 py-2.5 gap-2">
                <StarButton name={name} size={16} />
                {color ? (
                  <span
                    aria-hidden
                    className="size-2 rounded-full shrink-0"
                    style={{ background: color }}
                    title="색 태그"
                  />
                ) : null}
                <Link
                  href={`/stock/${encodeURIComponent(name)}`}
                  className="flex-1 flex items-center justify-between min-w-0"
                >
                  <span className="font-bold text-[13.5px] truncate">{name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <LivePrice name={name} size="md" />
                    <LivePctBadge name={name} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
