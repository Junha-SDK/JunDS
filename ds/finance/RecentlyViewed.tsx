"use client";

import Link from "next/link";
import { useRecentlyViewed, clearRecent } from "./lib/recentlyViewed";
import { useLivePrice } from "./lib/livePrices";
import { findStock } from "./lib/stocks";

export function RecentlyViewed() {
  const { items, hydrated } = useRecentlyViewed();
  if (!hydrated || items.length === 0) return null;
  return (
    <div className="px-3 pb-4">
      <div className="flex items-center justify-between px-3 mb-1.5">
        <span
          className="text-[10.5px] font-extrabold tracking-[0.08em]"
          style={{ color: "var(--bm-muted)" }}
        >
          최근 본 종목
        </span>
        <button
          onClick={() => clearRecent()}
          className="text-[10px] font-semibold"
          style={{ color: "var(--bm-muted)" }}
        >
          지우기
        </button>
      </div>
      <ul className="space-y-0.5">
        {items.slice(0, 6).map((name) => (
          <li key={name}>
            <RecentRow name={name} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentRow({ name }: { name: string }) {
  // 과거에 코드/티커("018260.KS")로 저장된 항목도 한글명으로 표시하도록 폴백.
  // 정적 stocks 에 한해 가능 — KRX 전체 데이터셋 매핑은 호출부(앱)가 책임.
  const resolved = findStock(name)?.name ?? name;
  const { price, change } = useLivePrice(resolved);
  const up = change >= 0;
  return (
    <Link
      href={`/stock/${encodeURIComponent(resolved)}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] hover:bg-[color:var(--bm-soft-100)]"
    >
      <span className="flex-1 truncate font-bold">{resolved}</span>
      <span className="bm-num text-[11px]">
        {price ? price.toLocaleString("ko-KR") : "—"}
      </span>
      <span
        className="bm-num text-[10.5px] font-bold min-w-[38px] text-right"
        style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
      >
        {up ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    </Link>
  );
}
