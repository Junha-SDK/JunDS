"use client";

import { useEffect, useState } from "react";

/**
 * KST(한국표준시) 정확한 시각을 반환하는 훅.
 *
 *   1) 마운트 시 `/api/time` 한 번 호출해 서버 epoch 과 클라 epoch 의 offset 을 측정.
 *      네트워크 RTT 의 절반만큼 보정해 한쪽 방향 지연 최소화.
 *   2) 그 다음 1초마다 `Date.now() + offset` 으로 시간 진행.
 *   3) 1분마다 백그라운드로 재동기화 (장시간 켜둘 때 클라 시계가 drift 해도 보정).
 *
 * 반환값은 *서버 epoch ms* 기준의 `Date` 객체. KST 표시는 `formatKorea*` 헬퍼를 통해.
 *
 * 사용:
 *   const { now, synced } = useKoreaTime();
 *   <span>{formatKoreaClock(now)}</span>
 */
export interface KoreaTime {
  /** 현재 시각 — 서버와 동기화된 epoch 기준 */
  now: Date;
  /** 최초 동기화 성공 여부. false 면 client clock 기반(부정확 가능) */
  synced: boolean;
  /** 서버-클라 offset (ms). synced=true 일 때만 유효 */
  offsetMs: number;
}

interface TimeResponse {
  epoch: number;
}

const RESYNC_INTERVAL_MS = 60_000;

export function useKoreaTime(): KoreaTime {
  const [offsetMs, setOffsetMs] = useState<number>(0);
  const [synced, setSynced] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(() => new Date());

  // 서버 시간 동기화
  useEffect(() => {
    let cancelled = false;
    async function sync() {
      const t0 = Date.now();
      try {
        const res = await fetch("/api/time", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as TimeResponse;
        const t1 = Date.now();
        // RTT 절반만큼 서버 epoch 에 더해 한쪽 방향 지연 보정.
        const rttHalf = Math.round((t1 - t0) / 2);
        const adjustedServer = data.epoch + rttHalf;
        const off = adjustedServer - t1;
        if (!cancelled) {
          setOffsetMs(off);
          setSynced(true);
        }
      } catch {
        /* 실패 — 다음 주기에 재시도. client clock 으로 잠시 운영 */
      }
    }
    void sync();
    const id = window.setInterval(sync, RESYNC_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // 매 초 갱신
  useEffect(() => {
    // 다음 초가 시작되는 시점에 맞춰 tick 정렬 (보기에 깔끔)
    const adjusted = Date.now() + offsetMs;
    const ms = 1000 - (adjusted % 1000);
    let firstId: number | undefined;
    let id: number | undefined;
    firstId = window.setTimeout(() => {
      setNow(new Date(Date.now() + offsetMs));
      id = window.setInterval(() => setNow(new Date(Date.now() + offsetMs)), 1000);
    }, ms);
    return () => {
      if (firstId != null) window.clearTimeout(firstId);
      if (id != null) window.clearInterval(id);
    };
  }, [offsetMs]);

  return { now, synced, offsetMs };
}

/* ─────────────────────── 포맷 헬퍼 ─────────────────────── */

const KST = "Asia/Seoul";

interface KoreaTimeParts {
  ampm: "오전" | "오후";
  hour12: number; // 1~12
  hour24: number; // 0~23
  minute: number; // 0~59
  second: number; // 0~59
  year: number;
  month: number; // 1~12
  day: number; // 1~31
  /** 0=일, 1=월, ..., 6=토 */
  weekday: number;
  weekdayKor: "일" | "월" | "화" | "수" | "목" | "금" | "토";
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * Date → KST 기준 시각 components 로 분해.
 * Intl.DateTimeFormat 의 `formatToParts` 를 사용해 사용자 OS 시간대와 무관하게 KST 추출.
 */
export function toKoreaParts(d: Date): KoreaTimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KST,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === t)?.value ?? "0";
  const hour24 = Number(get("hour")) % 24; // Intl 가 가끔 "24" 를 반환하는 케이스 보정
  const ampm: "오전" | "오후" = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const weekdayShort = get("weekday"); // "Wed", "Sun" 등
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = map[weekdayShort] ?? 0;
  return {
    ampm,
    hour12,
    hour24,
    minute: Number(get("minute")),
    second: Number(get("second")),
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday,
    weekdayKor: WEEKDAYS[weekday],
  };
}

/** "오후 3:31:21" */
export function formatKoreaClock(d: Date, withSeconds = true): string {
  const p = toKoreaParts(d);
  const mm = String(p.minute).padStart(2, "0");
  const ss = String(p.second).padStart(2, "0");
  return withSeconds ? `${p.ampm} ${p.hour12}:${mm}:${ss}` : `${p.ampm} ${p.hour12}:${mm}`;
}

/** "15:31:21" — 24h 표기 */
export function formatKoreaClock24(d: Date, withSeconds = true): string {
  const p = toKoreaParts(d);
  const hh = String(p.hour24).padStart(2, "0");
  const mm = String(p.minute).padStart(2, "0");
  const ss = String(p.second).padStart(2, "0");
  return withSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

/** "2026년 5월 27일 수요일" */
export function formatKoreaDate(d: Date): string {
  const p = toKoreaParts(d);
  return `${p.year}년 ${p.month}월 ${p.day}일 ${p.weekdayKor}요일`;
}

/** "05-27(수)" — TopBar 짧은 표기 */
export function formatKoreaDateShort(d: Date): string {
  const p = toKoreaParts(d);
  const mm = String(p.month).padStart(2, "0");
  const dd = String(p.day).padStart(2, "0");
  return `${mm}-${dd}(${p.weekdayKor})`;
}
