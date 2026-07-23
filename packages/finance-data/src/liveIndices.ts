/**
 * KIS H0UPCNT0 (업종 체결) 실시간 지수 스토어 — 프레임워크 무관 (React import 0).
 *
 * v2 원본: ds/finance/lib/liveIndices.ts 중 **스토어 계층**의 이관.
 * v2의 `useLiveIndex` 훅은 v2에 잔류하고 이 스토어를 감싸는 셤이 된다.
 * v2에서 모듈 내부(private)였던 `subscribe`는 여기서 `subscribeIndex`로 공개된다.
 *
 * 모든 구독 화면이 공유하는 단일 EventSource 를 유지하고 구독자가 늘어나면
 * URL에 새 코드를 합쳐 재오픈한다. 단순 구현 — 페이지에 지수 카드 개수가
 * 적으므로 (보통 2~3) 재오픈 비용은 무시 가능.
 */

import { getFinanceDataConfig } from "./config.js";
import { parseIndexTickEvent, type IndexTick } from "./stream.js";

export type { IndexTick };

type Listener = (t: IndexTick) => void;

const subscribers = new Map<string, Set<Listener>>();
const lastTicks = new Map<string, IndexTick>();
let es: EventSource | null = null;
let currentNames: string[] = [];

function reconnect(): void {
  const wanted = Array.from(subscribers.keys()).sort();
  const same =
    wanted.length === currentNames.length &&
    wanted.every((n, i) => n === currentNames[i]);
  if (same && es) return;

  if (es) {
    es.close();
    es = null;
  }
  currentNames = wanted;
  if (wanted.length === 0 || typeof window === "undefined") return;

  try {
    es = new EventSource(
      `${getFinanceDataConfig().streamUrl}?indices=${encodeURIComponent(wanted.join(","))}`,
      { withCredentials: true },
    );
    es.addEventListener("index", (ev) => {
      const tick = parseIndexTickEvent((ev as MessageEvent).data as string);
      if (!tick) return;
      lastTicks.set(tick.name, tick);
      const subs = subscribers.get(tick.name);
      if (subs) for (const cb of subs) cb(tick);
    });
  } catch {
    /* SSE 미지원 환경 */
  }
}

/**
 * 단일 지수의 실시간 tick 구독. 캐시된 마지막 tick 이 있으면 등록 즉시 재생.
 * 반환값은 해지 함수 — 마지막 구독자가 떠나면 SSE 재구성(축소).
 */
export function subscribeIndex(name: string, cb: Listener): () => void {
  let set = subscribers.get(name);
  const first = !set;
  if (!set) {
    set = new Set();
    subscribers.set(name, set);
  }
  set.add(cb);
  const cached = lastTicks.get(name);
  if (cached) {
    try {
      cb(cached);
    } catch {
      /* ignore */
    }
  }
  if (first) reconnect();
  return () => {
    const s = subscribers.get(name);
    if (!s) return;
    s.delete(cb);
    if (s.size === 0) {
      subscribers.delete(name);
      reconnect();
    }
  };
}

/** 마지막으로 수신한 지수 tick (없으면 null) — 첫 paint 폴백용. */
export function currentIndexTick(name: string): IndexTick | null {
  return lastTicks.get(name) ?? null;
}
