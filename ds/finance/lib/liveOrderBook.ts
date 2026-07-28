"use client";

import { useEffect, useState } from "react";

/**
 * KIS H0STASP0 (호가) 실시간 시드.
 *
 * 한 페이지에 호가창은 보통 1개라 EventSource를 호가창 컴포넌트가 직접 들고
 * 정리한다. (지수처럼 공유 풀은 불필요)
 */

export interface OrderBookLevel {
  price: number;
  qty: number;
}

export interface OrderBookTick {
  symbol: string;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  totalAskQty: number;
  totalBidQty: number;
  receivedAt: number;
}

/**
 * 단일 종목 호가창 실시간 tick. 첫 tick 전에는 `null` 반환.
 */
export function useLiveOrderBook(symbol: string): OrderBookTick | null {
  const [tick, setTick] = useState<OrderBookTick | null>(null);

  useEffect(() => {
    if (!symbol || typeof window === "undefined") return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/kis/stream?orderbook=${encodeURIComponent(symbol)}`, {
        withCredentials: true,
      });
      es.addEventListener("orderbook", (ev) => {
        try {
          const raw = JSON.parse((ev as MessageEvent).data) as OrderBookTick;
          if (!raw.symbol) return;
          setTick(raw);
        } catch {
          /* skip malformed */
        }
      });
    } catch {
      /* SSE 미지원 */
    }
    return () => {
      if (es) es.close();
      setTick(null);
    };
  }, [symbol]);

  return tick;
}
