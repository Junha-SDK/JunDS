/**
 * 실시간 시세 틱 스토어 — 프레임워크 무관 (React import 0).
 *
 * v2 원본: ds/finance/lib/livePrices.ts 중 **스토어 계층**의 이관.
 * v2의 React 훅(useLivePrice/useLivePrices/useRealPrices/useRealPricesSnapshot)은
 * v2에 잔류하고, 전환기에 이 스토어를 감싸는 얇은 셤이 된다. v3 바닐라 웹
 * 컴포넌트와 react 어댑터는 이 스토어를 직접 구독한다.
 *
 * v2 대비 의도적 차이 2건 (동작 등가):
 *   1. 데모 시드 `findStock`(mock) 하드코딩 → `configureFinanceData({ seedLookup })`
 *      주입으로 대체. 미설정 시 시드 0 — 실데이터 도착 시 채워진다.
 *   2. v2에 무동작 상태로 남아 있던 random-walk 시뮬레이터 잔해(step/tickAll/
 *      start/stop — 전부 비활성)는 이관하지 않는다. v2에서도 호출 결과가 없던
 *      코드라 관측 가능한 동작 차이는 없다.
 *
 * 공개 시그니처 보존: subscribe / currentTick / seedTick (v2 동일).
 * 풀 계층(v2 훅 내부였던 것)은 registerPoolCodes / subscribePoolStatus /
 * getPoolStatus / seedSnapshotOnce 로 공개된다.
 */

import { getFinanceDataConfig } from "./config.js";
import { parseStreamTickEvent, type TickVenue } from "./stream.js";

export type { TickVenue };

/**
 * 스토어가 보관·방송하는 종목 1건의 현재 상태.
 *
 * JSON 스키마:
 * ```json
 * {
 *   "price": 71200,     // number — 현재가 (원). 시드 전이면 0
 *   "change": 1.71,     // number — 전일대비 (%)
 *   "trend": "up",      // "up" | "down" | "flat" — 직전 tick 대비 방향 (플래시 연출용)
 *   "venue": "KRX"      // "KRX" | "NXT" | "UN" | 없음 — venue 뱃지용
 * }
 * ```
 */
export interface Tick {
  price: number;
  change: number;
  /** Direction of the LAST tick (used for flash animation) */
  trend: "up" | "down" | "flat";
  /** 이 tick 이 어느 거래소에서 왔는지 — UI venue 뱃지(NXT 등)에 활용. */
  venue?: TickVenue;
}

/** 현재 시세의 공급원 상태. pending → (kis | yahoo | error) */
export type RealPriceSource = "kis" | "yahoo" | "pending" | "error";

const subscribers = new Map<string, Set<(t: Tick) => void>>();
const ticks = new Map<string, Tick>();
/**
 * 실데이터(SSE/REST)로 시드된 종목 → 마지막 시드 timestamp.
 * "데이터 살아있음" 신호 — 동일값 dedup 시에도 갱신한다.
 */
const realSeededAt = new Map<string, number>();

// 디버깅용: 브라우저 콘솔에서 window.__bmTicks() / __bmSubs() 로 내부 상태 점검
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__bmTicks = () => Array.from(ticks.entries());
  (window as unknown as Record<string, unknown>).__bmSubs = () =>
    Array.from(subscribers.entries()).map(([k, v]) => [k, v.size]);
}

function ensureSeeded(name: string): Tick {
  let t = ticks.get(name);
  if (!t) {
    const s = getFinanceDataConfig().seedLookup(name);
    t = {
      price: s?.price ?? 0,
      change: s?.change ?? 0,
      trend: "flat",
    };
    ticks.set(name, t);
  }
  return t;
}

/** 종목 tick 구독. 등록 즉시 현재값(시드 포함)으로 1회 콜백. 반환값은 해지 함수. */
export function subscribe(name: string, cb: (t: Tick) => void): () => void {
  let subs = subscribers.get(name);
  if (!subs) {
    subs = new Set();
    subscribers.set(name, subs);
  }
  subs.add(cb);
  cb(ensureSeeded(name));
  return () => {
    const s = subscribers.get(name);
    if (!s) return;
    s.delete(cb);
    if (s.size === 0) subscribers.delete(name);
  };
}

/** 현재 tick 스냅샷 (없으면 시드 생성). */
export function currentTick(name: string): Tick {
  return ensureSeeded(name);
}

interface KisQuoteItem {
  symbol: string;
  price?: number;
  changePct?: number;
}

interface BatchQuoteItem {
  symbol: string;
  price?: number;
  changePct?: number;
  source: "yahoo" | "missing";
}

/**
 * 외부에서 단일 종목 tick을 pub/sub에 시드한다. SSE/REST 폴백 등에서 사용.
 * trend는 직전 가격과 비교해 자동 계산.
 */
export function seedTick(
  name: string,
  price: number,
  changePct: number,
  venue?: TickVenue,
): void {
  if (!Number.isFinite(price) || price <= 0) return;
  const prev = ticks.get(name);
  // 동일 tick dedup — 가격/등락률/venue 모두 동일하면 subscriber 호출 skip.
  // 한국 정규장 한산할 때, 또는 REST 폴백과 WS tick 이 같은 값을 중복 전송할 때
  // 다수 구독자가 불필요하게 갱신되는 비용을 차단. 시간 갱신만 필요한
  // realSeededAt 은 갱신해 줘서 "데이터 살아있음" 신호는 유지.
  if (
    prev &&
    prev.price === price &&
    prev.change === changePct &&
    (venue === undefined || prev.venue === venue)
  ) {
    realSeededAt.set(name, Date.now());
    return;
  }
  const next: Tick = {
    price,
    change: changePct,
    trend: prev
      ? price > prev.price
        ? "up"
        : price < prev.price
          ? "down"
          : "flat"
      : "flat",
    venue: venue ?? prev?.venue,
  };
  ticks.set(name, next);
  realSeededAt.set(name, Date.now());
  const subs = subscribers.get(name);
  if (subs) for (const cb of subs) cb(next);
}

/**
 * 다종목 REST 스냅샷 1회 — KIS 프록시 우선, Yahoo 배치 폴백.
 * v2 `useRealPricesSnapshot`의 페치 본체. 성공 시 각 종목을 `seedTick` 하고
 * 실제 공급원을 반환한다 ("error" = 양쪽 모두 실패/빈 응답).
 */
export async function seedSnapshotOnce(names: string[]): Promise<RealPriceSource> {
  if (names.length === 0) return "error";
  const cfg = getFinanceDataConfig();
  try {
    const res = await fetch(
      `${cfg.kisQuotesUrl}?codes=${encodeURIComponent(names.join(","))}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { items?: KisQuoteItem[] };
      let any = false;
      for (const it of data.items ?? []) {
        if (it.price == null) continue;
        seedTick(it.symbol, it.price, it.changePct ?? 0);
        any = true;
      }
      if (any) return "kis";
    }
  } catch {
    /* fallback to Yahoo */
  }

  try {
    const res = await fetch(
      `${cfg.batchQuotesUrl}?symbols=${encodeURIComponent(names.join(","))}`,
    );
    if (!res.ok) throw new Error(`status-${res.status}`);
    const data = (await res.json()) as { items?: BatchQuoteItem[] };
    let any = false;
    for (const it of data.items ?? []) {
      if (it.source !== "yahoo" || it.price == null) continue;
      seedTick(it.symbol, it.price, it.changePct ?? 0);
      any = true;
    }
    return any ? "yahoo" : "error";
  } catch {
    return "error";
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * 공유 SSE 풀 — 모든 실시간 구독 화면이 하나의 (또는 소수의) EventSource 를
 * 공유한다.
 *
 * Why: 화면에 위젯 여러 개가 각각 EventSource 를 열면 브라우저 origin 당
 * 6개 한도를 침범해 일부 stream 이 영원히 stall 한다. tick 이 안 들어와
 * 가격이 멈춤.
 *
 * How: 모든 실시간 화면은 종목을 풀에 ref-count 로 등록(registerPoolCodes).
 *   - 풀은 등록된 모든 종목을 50개씩 chunk 로 묶어 EventSource 를 1~2개만 유지.
 *   - 종목 set 이 바뀌면 60ms debounce 후 SSE 재오픈.
 *   - 풀 상태 listener 는 source 변경/1초 스로틀로만 알림 (tick 별 알림 X — 갱신 폭주 방지).
 *   - REST 스냅샷도 풀이 종목당 한 번씩만 발사 (snapshotted 기억).
 * ────────────────────────────────────────────────────────────────────────── */
const POOL_CODES_PER_SSE = 50;
const POOL_DEBOUNCE_MS = 60;
const poolCodes = new Map<string, number>();
const poolSnapshotted = new Set<string>();
let poolStreams: EventSource[] = [];
let poolReopenTimer: ReturnType<typeof setTimeout> | null = null;
let poolLastKey = "";
let poolCurrentSource: RealPriceSource = "pending";
let poolLastSyncAt: number | null = null;
let poolLastNotifyAt = 0;

/** 풀의 현재 공급원/동기화 상태 — v2 useRealPrices 반환 모양과 동일. */
export interface PoolStatus {
  lastSyncAt: number | null;
  source: RealPriceSource;
}
type PoolSubscriber = (info: PoolStatus) => void;
const poolSubscribers = new Set<PoolSubscriber>();

function poolNotify(source: RealPriceSource): void {
  const now = Date.now();
  poolLastSyncAt = now;
  const sourceChanged = source !== poolCurrentSource;
  poolCurrentSource = source;
  // tick 별 알림은 1초당 1번만 — 다중 구독자 갱신 폭주 방지.
  // source 변경(예: "pending" → "kis")은 즉시 통지.
  if (!sourceChanged && now - poolLastNotifyAt < 1000) return;
  poolLastNotifyAt = now;
  const info: PoolStatus = { lastSyncAt: now, source };
  for (const cb of poolSubscribers) cb(info);
}

function poolApplyConnections(): void {
  if (typeof window === "undefined") return;
  const cfg = getFinanceDataConfig();
  const codes = Array.from(poolCodes.keys());
  const key = codes.slice().sort().join(",");
  if (key === poolLastKey) return;
  poolLastKey = key;
  // close existing streams
  for (const es of poolStreams) {
    try { es.close(); } catch { /* ignore */ }
  }
  poolStreams = [];
  if (codes.length === 0) return;
  // chunk into <=50 per SSE
  for (let i = 0; i < codes.length; i += POOL_CODES_PER_SSE) {
    const chunk = codes.slice(i, i + POOL_CODES_PER_SSE);
    try {
      const es = new EventSource(
        `${cfg.streamUrl}?codes=${encodeURIComponent(chunk.join(","))}`,
        { withCredentials: true },
      );
      es.addEventListener("tick", (ev) => {
        const t = parseStreamTickEvent((ev as MessageEvent).data as string);
        if (t) {
          seedTick(t.symbol, t.price, t.changePct ?? 0, t.venue);
          poolNotify("kis");
        }
      });
      es.addEventListener("error", () => {
        // EventSource 자체적으로 자동 재연결 — source 만 기록.
        if (poolCurrentSource !== "kis") poolNotify("error");
      });
      poolStreams.push(es);
    } catch {
      poolNotify("error");
    }
  }
}

function poolScheduleApply(): void {
  if (poolReopenTimer) return;
  poolReopenTimer = setTimeout(() => {
    poolReopenTimer = null;
    poolApplyConnections();
  }, POOL_DEBOUNCE_MS);
}

function poolSnapshot(codes: string[]): void {
  if (typeof window === "undefined") return;
  const cfg = getFinanceDataConfig();
  const fresh = codes.filter((c) => !poolSnapshotted.has(c));
  if (fresh.length === 0) return;
  for (const c of fresh) poolSnapshotted.add(c);
  void (async () => {
    try {
      const res = await fetch(`${cfg.kisQuotesUrl}?codes=${encodeURIComponent(fresh.join(","))}`);
      if (res.ok) {
        const data = (await res.json()) as { items?: KisQuoteItem[] };
        let any = false;
        for (const it of data.items ?? []) {
          if (it.price == null) continue;
          seedTick(it.symbol, it.price, it.changePct ?? 0);
          any = true;
        }
        if (any) poolNotify("kis");
      }
    } catch { /* SSE 가 곧 채움 */ }
    // Yahoo 폴백 — KIS 시드 안 된 종목만.
    try {
      const res = await fetch(`${cfg.batchQuotesUrl}?symbols=${encodeURIComponent(fresh.join(","))}`);
      if (!res.ok) return;
      const data = (await res.json()) as { items?: BatchQuoteItem[] };
      let any = false;
      for (const it of data.items ?? []) {
        if (it.source !== "yahoo" || it.price == null) continue;
        if (ticks.has(it.symbol)) continue;
        seedTick(it.symbol, it.price, it.changePct ?? 0);
        any = true;
      }
      if (any) poolNotify(poolCurrentSource === "kis" ? "kis" : "yahoo");
    } catch { /* ignore */ }
  })();
}

/**
 * 종목 묶음을 SSE 풀에 ref-count 등록. 첫 등록 종목은 REST 스냅샷 1회 +
 * (debounce 후) SSE 재구성. 반환값은 등록 해지 함수 — v2 훅의 cleanup 과 동일.
 * SSR(window 부재)에서는 no-op.
 */
export function registerPoolCodes(codes: string[]): () => void {
  if (typeof window === "undefined" || codes.length === 0) return () => {};
  const added: string[] = [];
  for (const c of codes) {
    const n = poolCodes.get(c) ?? 0;
    if (n === 0) added.push(c);
    poolCodes.set(c, n + 1);
  }
  if (added.length > 0) {
    poolScheduleApply();
    poolSnapshot(added);
  }
  return () => {
    for (const c of codes) {
      const n = poolCodes.get(c) ?? 0;
      if (n <= 1) poolCodes.delete(c);
      else poolCodes.set(c, n - 1);
    }
    poolScheduleApply();
  };
}

/** 풀 상태 구독 (source 변경 즉시 + tick 1초 스로틀). 반환값은 해지 함수. */
export function subscribePoolStatus(cb: PoolSubscriber): () => void {
  poolSubscribers.add(cb);
  return () => {
    poolSubscribers.delete(cb);
  };
}

/** 풀 상태 스냅샷. */
export function getPoolStatus(): PoolStatus {
  return { lastSyncAt: poolLastSyncAt, source: poolCurrentSource };
}

// 디버그: 풀 상태 확인용. 콘솔에서 window.__bmPool() 로 점검.
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__bmPool = () => ({
    codes: Array.from(poolCodes.entries()),
    streams: poolStreams.length,
    source: poolCurrentSource,
    lastSyncAt: poolLastSyncAt,
  });
}
