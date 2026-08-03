import { useEffect, useLayoutEffect } from "react";

/**
 * SSR 안전 useLayoutEffect. 어댑터의 host 프로퍼티 대입·CE 이벤트 구독은
 * 반드시 layout 시점이어야 한다 — JdElement의 최초 render는 connectedCallback의
 * microtask로 지연되는데(DEC-012-1), passive effect(매크로태스크)는 그보다 늦어
 * 첫 render가 낡은 상태로 그려지고 jd-open 같은 최초 이벤트를 놓친다.
 * layout effect는 커밋과 같은 태스크라 microtask보다 항상 앞선다.
 */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
