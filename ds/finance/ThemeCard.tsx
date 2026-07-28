"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MiniChart, Tag } from "@junds/ui";
import type { ThemeBlock, ThemeStock } from "./lib/mock";
import { fmtKR억 } from "./lib/format";
import { useLivePrice, useLivePrices, useRealPrices } from "./lib/livePrices";

export function ThemeCard({
  theme,
  initialTrend,
}: {
  theme: ThemeBlock;
  /** 서버에서 미리 fetch 한 sparkline. 있으면 클라이언트 fetch 안 함. */
  initialTrend?: number[] | null;
}) {
  const top = theme.stocks[0];
  // 카드 단위로 KIS 시세 시드 — 30초 간격 (KIS rate limit 보호 + 충분한 신선도).
  // 노출되는 상위 4종목만 폴링.
  const watched = theme.stocks.slice(0, 4).map((s) => s.name);
  useRealPrices(watched, 30_000);

  // 테마 총 거래대금: 멤버 종목들의 mock amount억 합 + KIS 라이브 가격 변동 반영
  const liveMap = useLivePrices(watched);
  const liveTotal = theme.stocks.slice(0, 4).reduce((sum, s) => {
    const live = liveMap[s.name];
    // amount억은 mock이지만 가격에 비례해 스케일 (라이브 가격/mock 가격)
    const scale = live && live.price > 0 && s.price > 0 ? live.price / s.price : 1;
    return sum + s.amount억 * scale;
  }, 0);
  const total억 = liveTotal > 0 ? liveTotal : theme.total억;

  // KIS 일봉 30개로 sparkline 구성. SSR 측에서 prefetch 한 initialTrend 가 있으면
  // 그걸 우선 — 클라이언트 fetch 안 발생.
  const trend = useTrend(top?.name ?? "", initialTrend);

  return (
    <article
      // 기본 그림자를 인라인 style 로 주면 hover:shadow-* 는 절대 이기지 못한다 —
      // 호버 승격이 아예 일어나지 않고 있었다. 두 상태 모두 className 으로 옮긴다.
      className={[
        "bm-card overflow-hidden h-full flex flex-col",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow duration-200",
        "hover:shadow-[0_10px_28px_-12px_rgba(15,23,42,0.28),0_2px_6px_-2px_rgba(15,23,42,0.1)]",
      ].join(" ")}
    >
      <header className="px-4 pt-3.5 pb-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {theme.starred ? (
              <span aria-hidden style={{ color: "var(--bm-warning)", fontSize: 14 }}>
                ★
              </span>
            ) : null}
            <h3 className="font-extrabold text-[15px] tracking-tight truncate">{theme.name}</h3>
          </div>
          <p className="text-[12px] text-[color:var(--bm-muted)] mt-1 truncate leading-tight">
            {theme.headline}
          </p>
        </div>
        <Tag color="teal">{fmtKR억(total억)}</Tag>
      </header>

      {trend && trend.length > 1 ? (
        <div className="px-4 pb-1 -mb-1 opacity-90">
          <MiniChart data={trend} type="area" width={400} height={32} color="var(--bm-accent)" />
        </div>
      ) : null}

      <ul className="flex-1">
        {theme.stocks.slice(0, 4).map((s) => (
          <li key={s.name}>
            <StockRow stock={s} />
          </li>
        ))}
        {theme.stocks.length === 0 ? (
          <li className="px-4 py-6 text-center text-[12px] text-[color:var(--bm-muted)]">
            준비 중인 테마입니다
          </li>
        ) : null}
      </ul>
    </article>
  );
}

function StockRow({ stock }: { stock: ThemeStock }) {
  // 시뮬레이터에서 (KIS 시드 우선) 최신 시세 읽기 — 시드 전이면 mock 값으로 폴백
  const { price: livePrice, change: liveChange } = useLivePrice(stock.name);
  const price = livePrice > 0 ? livePrice : stock.price;
  const pct = livePrice > 0 ? liveChange : stock.pct;
  const up = pct >= 0;
  const color = up ? "var(--bm-up)" : "var(--bm-down)";

  return (
    <Link
      href={`/stock/${encodeURIComponent(stock.name)}`}
      className={[
        "flex items-center gap-2 px-3 py-2.5 transition-colors duration-150",
        "hover:bg-[color:var(--bm-soft-100)]",
        // 링크는 늘 포커스를 받는다 — 표시가 없으면 키보드로 어느 종목인지 알 수 없다.
        "focus-visible:outline-2 focus-visible:outline-[color:var(--bm-accent)] focus-visible:outline-offset-[-2px]",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1 flex items-center gap-1.5">
        {stock.king ? <span style={{ color: "var(--bm-warning)" }}>♛</span> : null}
        {stock.hot ? (
          <span
            className="inline-block size-1.5 rounded-full shrink-0"
            style={{ background: "var(--bm-up)" }}
          />
        ) : null}
        <span className="font-bold text-[13px] truncate">{stock.name}</span>
      </div>

      <div className="text-right bm-num leading-tight shrink-0">
        <div className="font-extrabold text-[13px]" style={{ color }}>
          {price.toLocaleString("ko-KR")}
        </div>
        <div className="text-[10.5px] text-[color:var(--bm-muted)] font-semibold">
          {fmtKR억(stock.amount억)}
        </div>
      </div>

      <div className="shrink-0">
        <PctTag pct={pct} hot={stock.hot} />
      </div>
    </Link>
  );
}

function PctTag({ pct, hot }: { pct: number; hot?: boolean }) {
  const up = pct >= 0;
  if (hot) {
    // 디자인 토큰 기반의 부드러운 pill — 기존 generic Tag(밝은 light-blue)는 톤이 안 맞아 폐기.
    return (
      <span
        className="bm-num inline-flex items-center gap-0.5 font-extrabold text-[12px] rounded-md"
        style={{
          padding: "2px 7px",
          background: up ? "var(--bm-up-soft)" : "var(--bm-down-soft)",
          color: up ? "var(--bm-up)" : "var(--bm-down)",
          letterSpacing: "-0.005em",
        }}
      >
        <span aria-hidden style={{ fontSize: 10, lineHeight: 1 }}>
          {up ? "▲" : "▼"}
        </span>
        {Math.abs(pct).toFixed(2)}%
      </span>
    );
  }
  return (
    <span
      className="bm-num font-extrabold text-[12.5px]"
      style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
    >
      {up ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  );
}

/**
 * 종목명을 받아 KIS 일봉 30개의 종가 배열을 반환하는 훅.
 * `initial` 이 있으면 SSR 단계에서 prefetch 된 값을 즉시 시드 — 클라이언트 fetch 생략.
 * 캐시는 서버 라우트 레벨(60초 메모리 + 60초 HTTP s-maxage)에서 되므로 클라이언트는 단순 fetch.
 */
function useTrend(name: string, initial?: number[] | null): number[] | null {
  const [data, setData] = useState<number[] | null>(initial ?? null);
  useEffect(() => {
    if (!name) return;
    if (initial && initial.length > 1) return; // SSR 시드 있으면 fetch 안 함
    let aborted = false;
    fetch(`/api/kis/chart/${encodeURIComponent(name)}?period=D`)
      .then((r) => r.json())
      .then((d) => {
        if (aborted || !d || !Array.isArray(d.candles)) return;
        const closes = d.candles.slice(-30).map((c: { close: number }) => c.close);
        if (closes.length > 1) setData(closes);
      })
      .catch(() => {
        /* 트렌드 라인 없어도 카드는 동작 */
      });
    return () => {
      aborted = true;
    };
  }, [name, initial]);
  return data;
}

export function ThemePillCard({ name, total억 }: { name: string; total억: number }) {
  return (
    <div className="bm-card px-3 py-2.5 flex items-center justify-between gap-2 transition-colors duration-150 hover:bg-[color:var(--bm-soft-100)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="min-w-0 truncate font-bold text-[13px]">{name}</span>
      <Tag color="orange">{fmtKR억(total억)}</Tag>
    </div>
  );
}
