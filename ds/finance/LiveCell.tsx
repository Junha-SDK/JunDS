"use client";

import { useLivePrice } from "./lib/livePrices";

interface LiveCellProps {
  name: string;
  /** SSR fallback (보통 mock seed price) — KIS 시드 들어오기 전 1초 동안 보임 */
  fallback?: number;
  decimals?: number;
}

/**
 * 종목명을 받아 시뮬레이터(KIS-seeded)에서 현재 가격을 읽어 텍스트로 렌더한다.
 * 모든 페이지의 raw `stock.price` 출력을 이 컴포넌트로 치환하면
 * 별도 페이지 리팩토링 없이 KIS 실시간 가격이 흐른다.
 */
export function LivePriceText({ name, fallback, decimals = 0 }: LiveCellProps) {
  const { price } = useLivePrice(name);
  const v = price > 0 ? price : fallback ?? 0;
  return (
    <>
      {v > 0
        ? v.toLocaleString("ko-KR", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : "—"}
    </>
  );
}

interface LivePctTextProps {
  name: string;
  fallback?: number;
  /** 부호 표시 ("+" 항상) */
  showSign?: boolean;
  decimals?: number;
  /** "%" suffix 자동 (기본 true) */
  withPercent?: boolean;
}

export function LivePctText({
  name,
  fallback,
  showSign = true,
  decimals = 2,
  withPercent = true,
}: LivePctTextProps) {
  const { change } = useLivePrice(name);
  // change=0 도 정상값이지만 시드 전이면 fallback 사용 — 둘 다 0이면 그대로 0%
  const v = change !== 0 ? change : fallback ?? 0;
  const prefix = showSign && v > 0 ? "+" : "";
  return (
    <>
      {prefix}
      {v.toFixed(decimals)}
      {withPercent ? "%" : ""}
    </>
  );
}

/** 색상까지 같이 칠해주는 가격+퍼센트 결합 셀 (가격 위, 등락률 아래) */
export function LiveStackedCell({
  name,
  priceFallback,
  pctFallback,
}: {
  name: string;
  priceFallback?: number;
  pctFallback?: number;
}) {
  const { price, change } = useLivePrice(name);
  const p = price > 0 ? price : priceFallback ?? 0;
  const c = change !== 0 ? change : pctFallback ?? 0;
  const up = c >= 0;
  const color = up ? "var(--bm-up)" : "var(--bm-down)";
  return (
    <div className="text-right bm-num leading-tight">
      <div className="font-extrabold text-[13px]" style={{ color }}>
        {p > 0 ? p.toLocaleString("ko-KR") : "—"}
      </div>
      <div className="text-[10.5px] font-semibold" style={{ color }}>
        {up ? "+" : ""}
        {c.toFixed(2)}%
      </div>
    </div>
  );
}
