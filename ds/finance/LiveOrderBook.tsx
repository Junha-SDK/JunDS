"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveOrderBook } from "./lib/liveOrderBook";
import { useLivePrice } from "./lib/livePrices";
import { useMarketStatus } from "./lib/useMarketStatus";

interface AskBidLevel {
  price: number;
  qty: number;
}

interface OrderBook {
  symbol: string;
  code: string;
  current: number;
  asks: AskBidLevel[];
  bids: AskBidLevel[];
  totalAskQty: number;
  totalBidQty: number;
  asOf: string;
}

/**
 * 호가창 1~10단계.
 *
 *   1) 마운트 직후 REST `/api/kis/orderbook/[code]` 로 첫 스냅샷 — 빈 표 깜빡임 방지.
 *   2) 그 다음부터는 `/api/kis/stream?orderbook=...` SSE (KIS H0STASP0) 가 매 변경 즉시 갱신.
 *
 * 기존 1.5초 폴링 대비 실제 호가 변경 → 화면 갱신 지연이 0.1초 미만으로 떨어짐.
 */
export function LiveOrderBook({ symbol }: { symbol: string }) {
  const status = useMarketStatus();
  const isOpen = status === "장중";
  const [ob, setOb] = useState<OrderBook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  // SSE 호가 tick
  const liveTick = useLiveOrderBook(symbol);
  // 호가 응답에는 current가 없으므로 별도 live price를 함께 본다.
  const livePrice = useLivePrice(symbol);

  // 초기 REST 스냅샷 — 한 번만
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/kis/orderbook/${encodeURIComponent(symbol)}`);
        if (!res.ok) throw new Error("status-" + res.status);
        const d = (await res.json()) as OrderBook;
        if (!aborted) {
          setOb(d);
          setError(null);
        }
      } catch (e) {
        if (!aborted) setError((e as Error).message);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [symbol]);

  // SSE tick이 도착하면 호가를 즉시 덮어쓴다.
  useEffect(() => {
    if (!liveTick) return;
    setLive(true);
    setOb((prev) => ({
      symbol,
      code: prev?.code ?? "",
      current: livePrice.price > 0 ? livePrice.price : prev?.current ?? 0,
      asks: liveTick.asks,
      bids: liveTick.bids,
      totalAskQty: liveTick.totalAskQty,
      totalBidQty: liveTick.totalBidQty,
      asOf: new Date(liveTick.receivedAt).toISOString(),
    }));
  }, [liveTick, livePrice.price, symbol]);

  // SSE만 켜진 후 live price 가 갱신되어도 current를 따라가도록.
  useEffect(() => {
    if (!live || livePrice.price <= 0) return;
    setOb((prev) => (prev ? { ...prev, current: livePrice.price } : prev));
  }, [live, livePrice.price]);

  // 빈 useMemo — eslint deps 안정성
  useMemo(() => undefined, []);

  if (!ob && error) {
    return (
      <div
        className="rounded-xl px-4 py-6 text-center text-[12px]"
        style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
      >
        호가창을 불러오지 못했습니다 ({error})
      </div>
    );
  }
  if (!ob) {
    return (
      <div
        className="rounded-xl px-4 py-6 text-center text-[12px]"
        style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
      >
        호가창 연결 중…
      </div>
    );
  }

  // 잔량 시각화: 매도 합 + 매수 합 기준 비율
  const maxAskQty = Math.max(...ob.asks.map((a) => a.qty), 1);
  const maxBidQty = Math.max(...ob.bids.map((b) => b.qty), 1);

  return (
    <article className="bm-card overflow-hidden">
      <header
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{
                background: isOpen ? "#ef4444" : "var(--bm-muted)",
                animation: isOpen ? "bm-pulse 1.4s ease-out infinite" : "none",
              }}
            />
            <span
              className="relative inline-flex rounded-full size-2.5"
              style={{ background: isOpen ? "#ef4444" : "var(--bm-muted)" }}
            />
          </span>
          <span
            className="text-[11px] font-extrabold tracking-[0.06em]"
            style={{ color: isOpen ? "#ef4444" : "var(--bm-muted)" }}
          >
            {isOpen ? "LIVE" : status === "휴장" ? "휴장" : "장마감"}
          </span>
          <span className="text-[12.5px] font-extrabold">10호가 · KIS</span>
        </div>
        <span className="bm-num text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
          {live ? "KIS 소켓" : isOpen ? "REST 스냅샷" : "마지막 스냅샷"}
        </span>
      </header>

      <table className="w-full text-[12px]">
        <thead>
          <tr style={{ background: "var(--bm-soft-100)" }}>
            <th className="text-right px-3 py-1.5 font-bold w-1/3" style={{ color: "var(--bm-muted)" }}>
              매도 잔량
            </th>
            <th className="text-center px-2 py-1.5 font-bold w-1/3" style={{ color: "var(--bm-muted)" }}>
              호가
            </th>
            <th className="text-left px-3 py-1.5 font-bold w-1/3" style={{ color: "var(--bm-muted)" }}>
              매수 잔량
            </th>
          </tr>
        </thead>
        <tbody>
          {/* 매도 호가 (10 → 1, 위에서 아래로 내려옴) */}
          {ob.asks
            .slice()
            .reverse()
            .map((a, i) => {
              const pct = a.qty / maxAskQty;
              return (
                <tr
                  key={`ask-${i}-${a.price}`}
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--bm-border)" }}
                >
                  <td className="px-3 py-1 text-right relative bm-num">
                    <div
                      aria-hidden
                      className="absolute right-0 top-0 h-full"
                      style={{
                        width: `${pct * 100}%`,
                        background: "rgba(37, 99, 235, 0.08)",
                      }}
                    />
                    <span className="relative font-bold" style={{ color: "var(--bm-muted)" }}>
                      {a.qty.toLocaleString("ko-KR")}
                    </span>
                  </td>
                  <td
                    className="px-2 py-1 text-center bm-num font-extrabold"
                    style={{
                      background: "rgba(37, 99, 235, 0.04)",
                      color: "var(--bm-down)",
                    }}
                  >
                    {a.price > 0 ? a.price.toLocaleString("ko-KR") : "—"}
                  </td>
                  <td className="px-3 py-1" />
                </tr>
              );
            })}
          {/* 현재가 */}
          <tr style={{ background: "rgba(13, 148, 136, 0.08)" }}>
            <td colSpan={3} className="px-3 py-1.5 text-center bm-num font-extrabold text-[13px]">
              현재가 {ob.current.toLocaleString("ko-KR")}
            </td>
          </tr>
          {/* 매수 호가 (1 → 10, 위에서 아래로) */}
          {ob.bids.map((b, i) => {
            const pct = b.qty / maxBidQty;
            return (
              <tr
                key={`bid-${i}-${b.price}`}
                style={{ borderTop: "1px solid var(--bm-border)" }}
              >
                <td className="px-3 py-1" />
                <td
                  className="px-2 py-1 text-center bm-num font-extrabold"
                  style={{
                    background: "rgba(239, 68, 68, 0.04)",
                    color: "var(--bm-up)",
                  }}
                >
                  {b.price > 0 ? b.price.toLocaleString("ko-KR") : "—"}
                </td>
                <td className="px-3 py-1 text-left relative bm-num">
                  <div
                    aria-hidden
                    className="absolute left-0 top-0 h-full"
                    style={{
                      width: `${pct * 100}%`,
                      background: "rgba(239, 68, 68, 0.08)",
                    }}
                  />
                  <span className="relative font-bold" style={{ color: "var(--bm-muted)" }}>
                    {b.qty.toLocaleString("ko-KR")}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: "var(--bm-soft-100)", borderTop: "1px solid var(--bm-border)" }}>
            <td className="px-3 py-1.5 text-right bm-num font-extrabold" style={{ color: "var(--bm-down)" }}>
              {ob.totalAskQty.toLocaleString("ko-KR")}
            </td>
            <td className="px-2 py-1.5 text-center text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
              총 잔량
            </td>
            <td className="px-3 py-1.5 text-left bm-num font-extrabold" style={{ color: "var(--bm-up)" }}>
              {ob.totalBidQty.toLocaleString("ko-KR")}
            </td>
          </tr>
        </tfoot>
      </table>
    </article>
  );
}
