"use client";

import { useEffect, useState } from "react";
import { isLiveSession, marketStatusLabel, type MarketSessionLabel } from "./marketHolidays";

/** 시장 세션 상태 — KRX 정규장 + NXT 프리/애프터장까지 포함. */
export type MarketStatus = MarketSessionLabel;

/**
 * 1분마다 시장 세션 상태를 갱신한다.
 *   - "장중":     KRX 정규장 (09:00~15:30)
 *   - "프리장":   NXT 단독 (08:00~08:50)
 *   - "애프터장": NXT 단독 (15:30~20:00)
 *   - "장마감":   평일이지만 위 세션 모두 종료
 *   - "휴장":     주말·공휴일
 *
 * 실시간 폴링 게이트로 쓸 때는 `marketStatus !== "장중"` 대신
 * `!isLiveSession(marketStatus)` 사용 — NXT 세션도 라이브로 인정.
 */
export function useMarketStatus(): MarketStatus {
  const [status, setStatus] = useState<MarketStatus>(() => marketStatusLabel());
  useEffect(() => {
    const update = () => setStatus(marketStatusLabel());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

// 헬퍼 re-export — 소비자가 marketHolidays 까지 안 알아도 되게.
export { isLiveSession };
