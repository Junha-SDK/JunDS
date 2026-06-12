"use client";

import { useEffect, useState } from "react";
import { Tag } from "@junds/ui";
import { useMarketStatus } from "./lib/useMarketStatus";

interface IndexSnapshot {
  code: string;
  value: number;
  change: number;
  changePct: number;
  asOf: string;
}

/**
 * 코스피 실시간 지수 배지 — KIS Open API `/api/kis/index?code=KOSPI` 호출.
 * 장중 5초 간격, 장 외에는 마지막 스냅샷 유지.
 */
export function MarketHeaderBadge() {
  const status = useMarketStatus();
  const isOpen = status === "장중";
  const [snap, setSnap] = useState<IndexSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const fetchOnce = async () => {
      try {
        const res = await fetch("/api/kis/index?code=KOSPI");
        if (!res.ok) throw new Error(`status-${res.status}`);
        const d = (await res.json()) as IndexSnapshot;
        if (!aborted) {
          setSnap(d);
          setError(null);
        }
      } catch (e) {
        if (!aborted) setError((e as Error).message);
      }
    };

    const loop = async () => {
      await fetchOnce();
      // 장중에만 5초 폴링. 장 외에는 1회 호출 후 정지.
      if (!aborted && isOpen) timer = setTimeout(loop, 5_000);
    };
    loop();
    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  if (!snap && !error) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bm-num text-[12.5px]"
        style={{ background: "var(--bm-soft-100)" }}
      >
        <span className="font-extrabold" style={{ color: "var(--bm-muted)" }}>
          코스피 로딩…
        </span>
      </div>
    );
  }

  if (!snap) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bm-num text-[12.5px]"
        style={{ background: "var(--bm-soft-100)" }}
        title={error ?? ""}
      >
        <span className="font-extrabold" style={{ color: "var(--bm-muted)" }}>
          코스피 데이터 없음
        </span>
      </div>
    );
  }

  const up = snap.change >= 0;
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bm-num text-[12.5px]"
      style={{ background: "rgba(20,184,166,0.10)" }}
      title={`출처: 한국투자증권 KIS · ${new Date(snap.asOf).toLocaleTimeString("ko-KR")}`}
    >
      <span className="font-extrabold" style={{ color: "var(--bm-accent-strong)" }}>
        코스피
      </span>
      <span className="font-extrabold">
        {snap.value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
      </span>
      <Tag color={up ? "red" : "blue"}>
        {up ? "+" : ""}
        {snap.change.toFixed(2)} ({up ? "+" : ""}
        {snap.changePct.toFixed(2)}%)
      </Tag>
      {!isOpen ? (
        <span className="text-[10px] font-bold" style={{ color: "var(--bm-muted)" }}>
          {status === "휴장" ? "휴장" : "장마감"}
        </span>
      ) : null}
    </div>
  );
}
