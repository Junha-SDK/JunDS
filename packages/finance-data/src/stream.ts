/**
 * KIS WebSocket → SSE 브리지의 와이어 계약.
 *
 * 앱 서버(v2에서는 Next `/api/kis/stream`)가 KIS WebSocket 시세를 받아
 * SSE(EventSource)로 재방송한다. 이 모듈은 그 이벤트 페이로드의 **정본 타입과
 * 안전 파서**다 — 웹(livePrices/liveIndices)과 iOS(URLSession SSE)가 같은
 * 모양을 소비한다.
 *
 * SSE 이벤트 종류 (event: 필드):
 *   "tick"      — 종목 체결 (StreamTickEvent)
 *   "index"     — 지수 체결 (IndexTick)          [KIS H0UPCNT0]
 *   "orderbook" — 호가 갱신 (OrderBookTick)      [KIS H0STASP0]
 *
 * v2 원본: ds/finance/lib/livePrices.ts(StreamTickEvent, 내부 타입),
 *          liveIndices.ts(IndexTick), liveOrderBook.ts(OrderBookTick) 산재
 *          → 와이어 계약만 이 모듈로 승격. 파서는 v2 인라인 try/catch와 동일 판정.
 */

/** 시세 발생 거래소.
 *   - "KRX": 정규장 (기본값, 미상 포함)
 *   - "NXT": 넥스트레이드
 *   - "UN":  KIS 통합 채널 (KRX+NXT 자동 라우팅)
 */
export type TickVenue = "KRX" | "NXT" | "UN";

/**
 * SSE `event: tick` 페이로드 — 종목 1건 체결.
 *
 * JSON 스키마 (iOS Codable 패리티용):
 * ```json
 * {
 *   "symbol": "삼성전자",   // string — 종목명 (스토어 키)
 *   "code": "005930",      // string — 6자리 종목코드
 *   "price": 71200,        // number — 체결가 (원)
 *   "change": 1200,        // number — 전일대비 (원)
 *   "changePct": 1.71,     // number — 전일대비 (%)
 *   "venue": "KRX"         // "KRX" | "NXT" | "UN" | 없음(옵셔널)
 * }
 * ```
 */
export interface StreamTickEvent {
  symbol: string;
  code: string;
  price: number;
  change: number;
  changePct: number;
  venue?: TickVenue;
}

/**
 * SSE `event: index` 페이로드 — 지수 1건 체결 (KIS H0UPCNT0).
 *
 * JSON 스키마:
 * ```json
 * {
 *   "name": "KOSPI",          // string — 지수명 (스토어 키)
 *   "value": 7402.77,         // number — 현재 지수
 *   "change": -12.3,          // number — 전일대비 (pt)
 *   "changePct": -0.17,       // number — 전일대비 (%)
 *   "receivedAt": 1784000000  // number — epoch ms (없으면 수신 시각으로 보충)
 * }
 * ```
 */
export interface IndexTick {
  name: string;
  value: number;
  change: number;
  changePct: number;
  receivedAt: number;
}

export interface OrderBookLevel {
  price: number;
  qty: number;
}

/**
 * SSE `event: orderbook` 페이로드 — 호가 갱신 (KIS H0STASP0).
 *
 * JSON 스키마:
 * ```json
 * {
 *   "symbol": "삼성전자",                        // string
 *   "asks": [{ "price": 71300, "qty": 1200 }],  // 최우선부터
 *   "bids": [{ "price": 71200, "qty": 800 }],
 *   "totalAskQty": 45000, "totalBidQty": 39000, // number (주)
 *   "receivedAt": 1784000000                    // number — epoch ms
 * }
 * ```
 */
export interface OrderBookTick {
  symbol: string;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  totalAskQty: number;
  totalBidQty: number;
  receivedAt: number;
}

/* ──────────────────────────── 안전 파서 ──────────────────────────── */
/* v2 인라인 판정과 동일: 필수 키 존재 + price/name 유효성만 검사하고
 * 나머지 필드는 관대하게 통과시킨다 (malformed → null). */

/** `event: tick` data 파싱. 실패/무효 시 null. */
export function parseStreamTickEvent(data: string): StreamTickEvent | null {
  try {
    const t = JSON.parse(data) as StreamTickEvent;
    if (!t || typeof t !== "object") return null;
    if (!t.symbol || !Number.isFinite(t.price)) return null;
    return t;
  } catch {
    return null;
  }
}

/** `event: index` data 파싱. receivedAt 누락 시 현재 시각 보충. 실패/무효 시 null. */
export function parseIndexTickEvent(data: string): IndexTick | null {
  try {
    const raw = JSON.parse(data) as IndexTick;
    if (!raw || typeof raw !== "object" || !raw.name) return null;
    return {
      name: raw.name,
      value: raw.value,
      change: raw.change,
      changePct: raw.changePct,
      receivedAt: raw.receivedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
}

/** `event: orderbook` data 파싱. 실패/무효 시 null. */
export function parseOrderBookTickEvent(data: string): OrderBookTick | null {
  try {
    const raw = JSON.parse(data) as OrderBookTick;
    if (!raw || typeof raw !== "object" || !raw.symbol) return null;
    return raw;
  } catch {
    return null;
  }
}
