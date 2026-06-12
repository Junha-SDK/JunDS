"use client";

import { useEffect, useState } from "react";

/**
 * KIS H0UPCNT0 (업종 체결) 실시간 지수 시드.
 *
 * 모든 LiveIndexCard 인스턴스가 공유하는 단일 EventSource 를 유지하고
 * 구독자가 늘어나면 URL에 새 코드를 합쳐 재오픈한다. 단순 구현 — 페이지에
 * 카드 개수가 적으므로 (보통 2~3) 재오픈 비용은 무시 가능.
 */

export interface IndexTick {
  name: string;
  value: number;
  change: number;
  changePct: number;
  receivedAt: number;
}

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
      `/api/kis/stream?indices=${encodeURIComponent(wanted.join(","))}`,
      { withCredentials: true },
    );
    es.addEventListener("index", (ev) => {
      try {
        const raw = JSON.parse((ev as MessageEvent).data) as IndexTick;
        if (!raw.name) return;
        const tick: IndexTick = {
          name: raw.name,
          value: raw.value,
          change: raw.change,
          changePct: raw.changePct,
          receivedAt: raw.receivedAt ?? Date.now(),
        };
        lastTicks.set(tick.name, tick);
        const subs = subscribers.get(tick.name);
        if (subs) for (const cb of subs) cb(tick);
      } catch {
        /* ignore malformed */
      }
    });
  } catch {
    /* SSE 미지원 환경 */
  }
}

function subscribe(name: string, cb: Listener): () => void {
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

/**
 * 단일 지수의 실시간 tick. KIS WebSocket이 H0UPCNT0 을 보내는 즉시 갱신.
 * 첫 tick 전에는 `null` 을 반환한다 — 호출부가 fallback을 표시할 수 있게.
 */
export function useLiveIndex(name: string): IndexTick | null {
  const [tick, setTick] = useState<IndexTick | null>(
    () => lastTicks.get(name) ?? null,
  );
  useEffect(() => {
    const off = subscribe(name, setTick);
    return off;
  }, [name]);
  return tick;
}
