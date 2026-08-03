"use client";

import { useEffect, useState } from "react";
import { findStock, type StockInfo } from "./stocks";
import { isMarketOpenNow } from "./marketHolidays";

interface BatchQuoteItem {
  symbol: string;
  price?: number;
  changePct?: number;
  source: "yahoo" | "missing";
}

/** 시세 발생 거래소.
 *   - "KRX": 정규장 (기본값, 미상 포함)
 *   - "NXT": 넥스트레이드
 *   - "UN":  KIS 통합 채널 (KRX+NXT 자동 라우팅)
 */
export type TickVenue = "KRX" | "NXT" | "UN";

interface Tick {
  price: number;
  change: number;
  /** Direction of the LAST tick (used for flash animation) */
  trend: "up" | "down" | "flat";
  /** 이 tick 이 어느 거래소에서 왔는지 — UI venue 뱃지(NXT 등)에 활용. */
  venue?: TickVenue;
}

const subscribers = new Map<string, Set<(t: Tick) => void>>();
const ticks = new Map<string, Tick>();
/**
 * 실데이터(SSE/REST)로 시드된 종목 → 마지막 시드 timestamp.
 *
 * 시뮬레이터(`tickAll` random walk)는 데모용으로 만들어졌으나, 실데이터가
 * 도착한 종목까지 함께 흔들면 KIS tick을 덮어쓰면서 "와이제이링크 → 1원" 같은
 * 망가진 값으로 고정되는 버그가 났다 (시뮬은 `Math.max(1, ...)` 클램프 때문에
 * 시드 0인 종목을 영원히 1에 묶어둔다).
 *
 * 60초 안에 실데이터가 들어온 종목은 시뮬을 건너뛴다. 그 외 데모 데이터로
 * 채워둔 종목은 종전대로 random walk가 살아있는 효과를 만든다.
 */
const realSeededAt = new Map<string, number>();
const REAL_SEED_FRESH_MS = 60_000;
let timer: ReturnType<typeof setInterval> | null = null;
let started = false;

// 디버깅용: 브라우저 콘솔에서 window.__bmTicks() / __bmSubs() 로 내부 상태 점검
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__bmTicks = () => Array.from(ticks.entries());
  (window as unknown as Record<string, unknown>).__bmSubs = () =>
    Array.from(subscribers.entries()).map(([k, v]) => [k, v.size]);
}

function ensureSeeded(name: string): Tick {
  let t = ticks.get(name);
  if (!t) {
    const s: StockInfo | undefined = findStock(name);
    t = {
      price: s?.price ?? 0,
      change: s?.change ?? 0,
      trend: "flat",
    };
    ticks.set(name, t);
  }
  return t;
}

function step(name: string): Tick {
  const t = ensureSeeded(name);
  // 시드 가격이 너무 작으면 random walk가 의미 없는 가격을 만든다 (예: price=0이면
  // Math.max(1, ...) 클램프 때문에 영원히 1원에 박힘). 시드 무결성 확보 전까지는
  // 시뮬을 돌리지 말고 현재값 그대로 emit.
  if (t.price <= 0) return t;
  const direction = Math.random() < 0.5 ? -1 : 1;
  const magnitude = Math.random() * 0.0035; // up to ~0.35% per tick
  const delta = t.price * direction * magnitude;
  const nextPrice = Math.max(1, Math.round(t.price + delta));
  const nextChange = t.change + (delta / Math.max(1, t.price)) * 100;
  const next: Tick = {
    price: nextPrice,
    change: nextChange,
    trend: nextPrice > t.price ? "up" : nextPrice < t.price ? "down" : "flat",
  };
  ticks.set(name, next);
  return next;
}

function tickAll() {
  // 시뮬레이터 비활성화.
  //
  // 이 모듈은 본래 데모 모드에서 random walk로 가격이 살아있는 듯한 효과를
  // 내려고 만들었다. 그런데 실제 KIS WebSocket 시세를 연결하면서 시뮬과 실데이터가
  // 동시에 같은 종목에 쓰이게 됐고, 다음 두 가지 사고가 반복됐다:
  //
  //   1) 시드가 0인 종목(JunDS 정적 stocks에 없는 종목, 예: 와이제이링크)에서
  //      `Math.max(1, ...)` 클램프로 가격이 1원에 영구 고정.
  //   2) KIS tick이 뜸한 저거래 종목에서 시뮬이 random walk로 244,750 → 249,614
  //      같은 누적 드리프트(수 %)를 만들어 토스/실제 가격과 어긋남.
  //
  // KIS가 잠시 조용한 동안은 마지막 진짜 체결가를 그대로 유지하는 게 올바른 동작.
  // 데모 데이터가 필요해지면 별도 모듈로 분리하는 게 맞다.
  void subscribers;
}

// 과거 시뮬용 보일러플레이트는 호환을 위해 시그니처만 유지하되 무동작으로 둔다.
function start() {
  /* 시뮬 비활성화 — KIS WebSocket이 진짜 시세를 공급한다. */
  void timer;
  void started;
  void isMarketOpenNow;
}
function stop() {
  /* 시뮬 비활성화 — 호출되더라도 아무것도 하지 않는다. */
}

export function subscribe(name: string, cb: (t: Tick) => void): () => void {
  let subs = subscribers.get(name);
  if (!subs) {
    subs = new Set();
    subscribers.set(name, subs);
  }
  subs.add(cb);
  start();
  cb(ensureSeeded(name));
  return () => {
    const s = subscribers.get(name);
    if (!s) return;
    s.delete(cb);
    if (s.size === 0) subscribers.delete(name);
    if (subscribers.size === 0) stop();
  };
}

export function currentTick(name: string): Tick {
  return ensureSeeded(name);
}

export function useLivePrice(name: string) {
  const [tick, setTick] = useState<Tick>(() => ensureSeeded(name));
  useEffect(() => {
    const off = subscribe(name, setTick);
    return off;
  }, [name]);
  return tick;
}

interface KisQuoteItem {
  symbol: string;
  price?: number;
  changePct?: number;
}

export type RealPriceSource = "kis" | "yahoo" | "pending" | "error";

interface StreamTickEvent {
  symbol: string;
  code: string;
  price: number;
  change: number;
  changePct: number;
}

/**
 * 외부에서 단일 종목 tick을 pub/sub에 시드한다. SSE/REST 폴백 등에서 사용.
 * trend는 직전 가격과 비교해 자동 계산.
 */
export function seedTick(name: string, price: number, changePct: number, venue?: TickVenue): void {
  if (!Number.isFinite(price) || price <= 0) return;
  const prev = ticks.get(name);
  // 동일 tick dedup — 가격/등락률/venue 모두 동일하면 subscriber 호출 skip.
  // 한국 정규장 한산할 때, 또는 REST 폴백과 WS tick 이 같은 값을 중복 전송할 때
  // 30+ 컴포넌트가 불필요하게 re-render 되는 비용을 차단. 시간 갱신만 필요한
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
    trend: prev ? (price > prev.price ? "up" : price < prev.price ? "down" : "flat") : "flat",
    venue: venue ?? prev?.venue,
  };
  ticks.set(name, next);
  realSeededAt.set(name, Date.now());
  const subs = subscribers.get(name);
  if (subs) for (const cb of subs) cb(next);
}

/**
 * KIS 실시간 시세를 WebSocket SSE 스트림으로 받아 pub/sub에 시드한다.
 *
 * 기존 5초 REST 폴링(`useRealPrices`)은 KIS 단일 종목 API를 직렬 fan-out 하느라
 * 종목당 평균 0.2~1초씩 지연이 누적됐고, 사용자에게 "소켓인데 왜 느리냐"는
 * 체감 버그로 나타났다. 이 훅은 단일 EventSource로 다중 종목 tick을 즉시 받아
 * 그대로 `seedTick` → `subscribers` 콜백 체인을 거치므로 새 거래 발생 시점에서
 * UI까지 보통 50~150ms 이내에 도달한다.
 *
 *   - 첫 paint 직후 한 번만 REST 스냅샷을 가져와 0원 표시를 방지한다.
 *   - 장 마감 시간에는 KIS WS가 tick을 보내지 않으므로 REST 스냅샷만 표시된다.
 *   - 네트워크 단절 시 EventSource가 자동 재연결.
 */
/**
 * 다종목 REST 스냅샷 시더 — 백그라운드 데이터 (heatmap·테마 위젯 등).
 * KIS WebSocket은 커넥션당 등록 가능한 종목 수 제한(약 40~50개)이 있어, 화면에
 * 보이지 않는 수백 종목까지 SSE로 끌어오기엔 부적합하다. 이 경우는 종전대로
 * /api/kis/quotes 를 일정 간격(기본 30초)으로 폴링해 시드한다.
 */
export function useRealPricesSnapshot(
  names: string[],
  intervalMs = 30_000,
): { lastSyncAt: number | null; source: RealPriceSource } {
  const key = names.join("|");
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [source, setSource] = useState<RealPriceSource>("pending");

  useEffect(() => {
    if (names.length === 0 || typeof window === "undefined") return;
    let aborted = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      try {
        const res = await fetch(`/api/kis/quotes?codes=${encodeURIComponent(names.join(","))}`);
        if (res.ok) {
          const data = (await res.json()) as { items?: KisQuoteItem[] };
          if (aborted) return;
          let any = false;
          for (const it of data.items ?? []) {
            if (it.price == null) continue;
            seedTick(it.symbol, it.price, it.changePct ?? 0);
            any = true;
          }
          if (any) {
            setSource("kis");
            setLastSyncAt(Date.now());
            return;
          }
        }
      } catch {
        /* fallback to Yahoo */
      }
      if (aborted) return;

      try {
        const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(names.join(","))}`);
        if (!res.ok) throw new Error(`status-${res.status}`);
        const data = (await res.json()) as { items?: BatchQuoteItem[] };
        if (aborted) return;
        let any = false;
        for (const it of data.items ?? []) {
          if (it.source !== "yahoo" || it.price == null) continue;
          seedTick(it.symbol, it.price, it.changePct ?? 0);
          any = true;
        }
        if (any) {
          setSource((s) => (s === "kis" ? s : "yahoo"));
          setLastSyncAt(Date.now());
        } else {
          setSource((s) => (s === "kis" || s === "yahoo" ? s : "error"));
        }
      } catch {
        if (!aborted) setSource((s) => (s === "kis" || s === "yahoo" ? s : "error"));
      }
    };

    const loop = async () => {
      await run();
      if (!aborted) timer = setTimeout(loop, intervalMs);
    };
    loop();
    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, intervalMs]);

  return { lastSyncAt, source };
}

/* ──────────────────────────────────────────────────────────────────────────
 * 공유 SSE 풀 — `useRealPrices` 모든 호출이 하나의 (또는 소수의) EventSource
 * 를 공유한다.
 *
 * Why: 홈 페이지에서 ThemeCard 8개 + HeatmapLivePricesSeeder + WatchlistWidget
 * + AlertManager 등이 각각 EventSource 를 열면 브라우저 origin 당 6개 한도를
 * 침범해 일부 stream 이 영원히 stall 했다. tick 이 안 들어와 가격이 멈춤.
 *
 * How: 모든 useRealPrices() 호출은 종목을 풀에 ref-count 로 등록.
 *   - 풀은 등록된 모든 종목을 50개씩 chunk 로 묶어 EventSource 를 1~2개만 유지.
 *   - 종목 set 이 바뀌면 60ms debounce 후 SSE 재오픈.
 *   - listener 들은 풀 단위 source 변경에 대해서만 알림 (tick 별 알림 X — render storm 방지).
 *   - REST 스냅샷도 풀이 한 번씩만 발사 (snapshotted 기억).
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
type PoolSubscriber = (info: { lastSyncAt: number | null; source: RealPriceSource }) => void;
const poolSubscribers = new Set<PoolSubscriber>();

function poolNotify(source: RealPriceSource): void {
  const now = Date.now();
  poolLastSyncAt = now;
  const sourceChanged = source !== poolCurrentSource;
  poolCurrentSource = source;
  // tick 별 알림은 1초당 1번만 — 다중 구독자 render storm 방지.
  // source 변경(예: "pending" → "kis")은 즉시 통지.
  if (!sourceChanged && now - poolLastNotifyAt < 1000) return;
  poolLastNotifyAt = now;
  const info = { lastSyncAt: now, source };
  for (const cb of poolSubscribers) cb(info);
}

function poolApplyConnections(): void {
  if (typeof window === "undefined") return;
  const codes = Array.from(poolCodes.keys());
  const key = codes.slice().sort().join(",");
  if (key === poolLastKey) return;
  poolLastKey = key;
  // close existing streams
  for (const es of poolStreams) {
    try {
      es.close();
    } catch {
      /* ignore */
    }
  }
  poolStreams = [];
  if (codes.length === 0) return;
  // chunk into <=50 per SSE
  for (let i = 0; i < codes.length; i += POOL_CODES_PER_SSE) {
    const chunk = codes.slice(i, i + POOL_CODES_PER_SSE);
    try {
      const es = new EventSource(`/api/kis/stream?codes=${encodeURIComponent(chunk.join(","))}`, {
        withCredentials: true,
      });
      es.addEventListener("tick", (ev) => {
        try {
          const t = JSON.parse((ev as MessageEvent).data) as StreamTickEvent & {
            venue?: TickVenue;
          };
          if (t.symbol && Number.isFinite(t.price)) {
            seedTick(t.symbol, t.price, t.changePct ?? 0, t.venue);
            poolNotify("kis");
          }
        } catch {
          /* skip malformed */
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
  const fresh = codes.filter((c) => !poolSnapshotted.has(c));
  if (fresh.length === 0) return;
  for (const c of fresh) poolSnapshotted.add(c);
  void (async () => {
    try {
      const res = await fetch(`/api/kis/quotes?codes=${encodeURIComponent(fresh.join(","))}`);
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
    } catch {
      /* SSE 가 곧 채움 */
    }
    // Yahoo 폴백 — KIS 시드 안 된 종목만.
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(fresh.join(","))}`);
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
    } catch {
      /* ignore */
    }
  })();
}

function poolRegister(codes: string[]): () => void {
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

// 디버그: 풀 상태 확인용. 콘솔에서 window.__bmPool() 로 점검.
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__bmPool = () => ({
    codes: Array.from(poolCodes.entries()),
    streams: poolStreams.length,
    source: poolCurrentSource,
    lastSyncAt: poolLastSyncAt,
  });
}

export function useRealPrices(
  names: string[],
  /** @deprecated SSE 도입으로 무시됨 — 호출부 호환을 위해 시그니처만 유지. */
  _intervalMs?: number,
): { lastSyncAt: number | null; source: RealPriceSource } {
  void _intervalMs;
  const key = names.join("|");
  const [state, setState] = useState<{ lastSyncAt: number | null; source: RealPriceSource }>(
    () => ({ lastSyncAt: poolLastSyncAt, source: poolCurrentSource }),
  );

  useEffect(() => {
    if (names.length === 0 || typeof window === "undefined") return;
    const sub: PoolSubscriber = (info) => setState(info);
    poolSubscribers.add(sub);
    // 즉시 현재 상태 시드
    setState({ lastSyncAt: poolLastSyncAt, source: poolCurrentSource });
    const unregister = poolRegister(names);
    return () => {
      poolSubscribers.delete(sub);
      unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

export function useLivePrices(names: string[]): Record<string, Tick> {
  const key = names.join("|");
  const [map, setMap] = useState<Record<string, Tick>>(() => {
    const obj: Record<string, Tick> = {};
    for (const n of names) obj[n] = ensureSeeded(n);
    return obj;
  });
  useEffect(() => {
    setMap(() => {
      const obj: Record<string, Tick> = {};
      for (const n of names) obj[n] = ensureSeeded(n);
      return obj;
    });
    const unsubs = names.map((n) => subscribe(n, (t) => setMap((prev) => ({ ...prev, [n]: t }))));
    return () => {
      for (const off of unsubs) off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return map;
}
