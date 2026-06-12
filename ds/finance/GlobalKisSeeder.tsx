"use client";

import { useMemo } from "react";
import { HEATMAP_FLAT } from "./lib/heatmapData";
import { useRealPricesSnapshot } from "./lib/livePrices";

/**
 * 앱 부팅 시 마운트되는 전역 시더.
 * `HEATMAP_FLAT` 에 등록된 모든 종목의 KIS 시세를 30초 간격으로 받아
 * 글로벌 simulator(`livePrices.ts`)에 시드한다.
 *
 * 모든 페이지의 `useLivePrice(name)`/`<LivePriceText>`/`<LivePctText>` 가
 * 이 시드를 자동으로 읽으므로, 페이지 단위 리팩토링 없이도 KIS 실데이터가 흐른다.
 *
 * Rate limit: 한 번의 호출이 17~50종목을 직렬로 가져오며 KIS 글로벌 큐가 200ms
 * 갭으로 직렬화한다. 30초마다 한 라운드 → 평균 RPS 약 1~2건으로 KIS 한도 안전.
 */
export function GlobalKisSeeder() {
  // tickerFor 매핑이 있는 종목만 (없는 종목은 KIS 호출 못함)
  const names = useMemo(
    () => Array.from(new Set(HEATMAP_FLAT.map((c) => c.name))),
    [],
  );
  // 히트맵에 등록된 수백 종목은 SSE 단일 커넥션의 등록 한도(약 40~50)를 넘기
  // 때문에 30초 REST 폴링으로 시드한다. 화면에 강조 표시되는 종목
  // (관심 종목·상세 페이지)은 별도로 SSE 기반 useRealPrices 가 즉시 갱신한다.
  useRealPricesSnapshot(names, 30_000);
  return null;
}
