"use client";

/**
 * createJdElement — <jd-*> 커스텀 엘리먼트를 감싸는 얇은 React 어댑터 공장 (DEC-044).
 *
 * 손으로 짠 어댑터 3종(Button·TextField·Modal)은 v2 API 표면을 보존하려고 골격까지
 * React가 소유한다(DEC-008-(1)). 나머지 379종은 그런 사연이 없다 — 필요한 것은
 * "React 사람이 <jd-*>를 자연스럽게 쓰게" 하는 얇은 층이고, 그건 기계로 만들 수 있다.
 * 그래서 이 공장은 골격을 만들지 않는다: 호스트 태그만 렌더하고 값 전달만 맡는다.
 *
 * ── 값이 들어가는 세 경로 ────────────────────────────────────────────────
 * ① 스칼라 프롭(String/Number/Boolean) → JSX 로 **타입 그대로** 넘긴다.
 *    React 19 는 정의된 커스텀 엘리먼트에서 이름이 인스턴스에 있으면 **프로퍼티**로,
 *    없으면(kebab 이름 등) attribute 로 싣는다. React 18 과 SSR 은 언제나 attribute 다.
 *    그래서 세 경로가 동시에 옳으려면 값이 원래 타입이어야 한다:
 *      프로퍼티 경로 — `el.dismissible = true`      → 그대로 참
 *      attribute 경로 — `dismissible="true"`        → 존재가 곧 참(§1.3)
 *    빈 문자열("")로 넘기면 attribute 경로에서는 참이지만 프로퍼티 경로에서는
 *    거짓 같은 값이 저장돼 **조용히 반대로 동작한다**(실측: React 19 + 한 낱말 프롭).
 *    Boolean 거짓은 두 경로 모두에서 **아예 넘기지 않는다** — attribute 로 나가면
 *    `dismissible="false"` 가 되어 "존재 = 참" 규칙에 걸린다.
 *    SSR 이 중요한 이유는 서버가 그린 HTML 만으로 이미 옳은 화면이어야 하기 때문(§11-4).
 * ② 복합 데이터(배열·객체) → **프로퍼티 대입**. 원래 property 전용 표면이라(§1.3)
 *    속성으로 표현할 수 없다. 레이아웃 이펙트에서 넣어 첫 페인트 전에 반영한다.
 * ③ 이벤트 → addEventListener. `jd-change` → `onJdChange` 로 기계 변환한다.
 *    React의 onChange/onSelect 등과 겹치지 않게 `Jd`를 남긴다 — 겹치면 React 합성
 *    이벤트와 CE 커스텀 이벤트가 같은 이름으로 섞여 디버깅이 불가능해진다.
 *
 * 나머지 프롭(className·style·id·data-*·aria-*·onClick…)은 손대지 않고 그대로
 * 넘긴다 — React가 이미 아는 것들이라 우리가 다시 해석하면 규칙만 갈라진다.
 */
import {
  createElement,
  forwardRef,
  useRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from "react";
import { composeRefs } from "./composeRefs.js";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect.js";

/** 선언 프롭의 값 종류 — 생성기가 런타임 `static props`에서 그대로 옮긴다 */
export type JdPropKind = "string" | "number" | "boolean" | "data";

export interface JdElementSpec {
  /** "jd-button" */
  tag: string;
  /** camelCase 프롭 이름 → 값 종류 */
  props: Readonly<Record<string, JdPropKind>>;
  /** "onJdChange" → "jd-change" */
  events: Readonly<Record<string, string>>;
}

/** camelCase → kebab-case (JdElement의 attribute 이름 규칙과 동일) */
const toAttr = (name: string): string =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

export interface JdBaseProps {
  children?: ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export function createJdElement<P extends JdBaseProps>(
  spec: JdElementSpec,
  displayName: string,
): ForwardRefExoticComponent<P & RefAttributes<HTMLElement>> {
  const Component = forwardRef<HTMLElement, P>(function JdAdapter(props, ref) {
    const hostRef = useRef<HTMLElement | null>(null);

    /* 세 갈래로 나눈다. 매 렌더 새로 만드는 평범한 객체 — 프롭 수가 최대 62개(card)라
       메모이제이션이 되레 비싸다. */
    const attrs: Record<string, unknown> = {};
    const data: Record<string, unknown> = {};
    const listeners: Record<string, unknown> = {};

    for (const key of Object.keys(props)) {
      if (key === "children") continue;
      const value = (props as Record<string, unknown>)[key];

      const eventName = spec.events[key];
      if (eventName !== undefined) {
        if (typeof value === "function") listeners[eventName] = value;
        continue;
      }

      const kind = spec.props[key];
      if (kind === undefined) {
        attrs[key] = value; // React가 아는 프롭 — 그대로 넘긴다
        continue;
      }
      if (value === undefined || value === null) continue;
      if (kind === "data") {
        data[key] = value;
        continue;
      }
      if (kind === "boolean") {
        if (value !== false) attrs[toAttr(key)] = true;
        continue;
      }
      attrs[toAttr(key)] = value;
    }

    // ② 복합 데이터 — 첫 페인트 전에
    useIsoLayoutEffect(() => {
      const host = hostRef.current as (HTMLElement & Record<string, unknown>) | null;
      if (!host) return;
      for (const key of Object.keys(data)) host[key] = data[key];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(Object.keys(data).sort()), ...Object.values(data)]);

    /* ③ 이벤트 — 핸들러가 매 렌더 새 화살표여도 재구독하지 않는다. ref 한 겹을 두고
       구독은 이벤트 이름 집합이 바뀔 때만 갈아 끼운다(손저작 어댑터와 같은 규율). */
    const listenersRef = useRef(listeners);
    listenersRef.current = listeners;
    const names = Object.keys(listeners).sort().join(",");
    useIsoLayoutEffect(() => {
      const host = hostRef.current;
      if (!host || !names) return;
      const bound = names.split(",").map((name) => {
        const handler = (e: Event): void => {
          (listenersRef.current[name] as ((e: Event) => void) | undefined)?.(e);
        };
        host.addEventListener(name, handler);
        return [name, handler] as const;
      });
      return () => {
        for (const [name, handler] of bound) host.removeEventListener(name, handler);
      };
    }, [names]);

    return createElement(
      spec.tag,
      { ...attrs, ref: composeRefs(hostRef as Ref<HTMLElement>, ref) },
      props.children,
    );
  });
  Component.displayName = displayName;
  return Component as ForwardRefExoticComponent<P & RefAttributes<HTMLElement>>;
}
