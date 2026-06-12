"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDsToast } from "@junds/ui";
import { getAlerts, markTriggered, useAlerts } from "./lib/alerts";
import { subscribe, useRealPrices } from "./lib/livePrices";

/**
 * Mounts once at the layout level; subscribes to live ticks for every active
 * alert and fires a toast when the target price is crossed.
 *
 * SSE seeding — 활성 알림이 걸린 종목은 사용자가 해당 페이지를 보지 않더라도
 * KIS WebSocket으로 즉시 갱신돼야 한다. 이 컴포넌트가 직접 `useRealPrices` 를
 * 호출해 알림 대상 종목의 SSE 스트림을 열어둔다 (관심 페이지와는 별도 트래커).
 */
export function AlertManager() {
  const toast = useDsToast();
  const cleanupsRef = useRef<Map<string, () => void>>(new Map());
  const { items: alertItems, hydrated } = useAlerts();
  // 활성 알림이 걸린 종목 이름만 추출 — 비활성/이미 트리거된 것은 시드 불필요.
  const liveNames = useMemo(
    () =>
      hydrated
        ? Array.from(
            new Set(alertItems.filter((a) => a.active).map((a) => a.name)),
          )
        : [],
    [alertItems, hydrated],
  );
  useRealPrices(liveNames);

  // localStorage 의 alerts 가 변경되면 (다른 탭 추가/삭제 포함) sync.
  const [, forceSync] = useState(0);

  useEffect(() => {
    function syncSubscriptions() {
      const alerts = getAlerts().filter((a) => a.active);
      const wantedNames = new Set(alerts.map((a) => a.name));

      for (const [name, off] of cleanupsRef.current.entries()) {
        if (!wantedNames.has(name)) {
          off();
          cleanupsRef.current.delete(name);
        }
      }

      for (const name of wantedNames) {
        if (cleanupsRef.current.has(name)) continue;
        const off = subscribe(name, ({ price }) => {
          for (const a of getAlerts().filter(
            (x) => x.active && x.name === name,
          )) {
            const crossed =
              a.direction === "above"
                ? a.basePrice < a.target && price >= a.target
                : a.basePrice > a.target && price <= a.target;
            if (crossed) {
              markTriggered(a.id);
              toast.warning(
                `${a.name} 알림 — 목표가 ${a.target.toLocaleString("ko-KR")}원 ${a.direction === "above" ? "돌파 ↑" : "이탈 ↓"}`,
                {
                  duration: 6000,
                  action: { label: "확인", onClick: () => undefined },
                },
              );
            }
          }
        });
        cleanupsRef.current.set(name, off);
      }
    }

    syncSubscriptions();
    const handler = () => {
      syncSubscriptions();
      forceSync((n) => n + 1);
    };
    window.addEventListener("alerts:change", handler);
    return () => {
      window.removeEventListener("alerts:change", handler);
      for (const off of cleanupsRef.current.values()) off();
      cleanupsRef.current.clear();
    };
  }, [toast]);

  return null;
}
