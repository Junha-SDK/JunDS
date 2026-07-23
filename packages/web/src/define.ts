/**
 * "@junds/web/define" — 전량 정의 진입점 (03-web-arch §2, §6.2 부작용 모듈).
 * defineJunds(): 전량/부분 등록 + prefix 탈출구(멀티 버전 공존).
 * SSR 안전: defineElement가 Node에서 no-op(§2).
 *
 * 전 컴포넌트 목록은 scripts/gen-exports.mjs 산출물(components.generated.ts)이
 * 단일 소스 — 수기 배열 금지(§6.2, 검수 P1-1). 배치 추가 시 생성기만 재실행한다.
 */
import { defineElement } from "./core/define.js";
import { ALL_COMPONENTS } from "./components.generated.js";

type JdCtor = CustomElementConstructor & { tag: string };

export function defineJunds(
  list: readonly JdCtor[] = ALL_COMPONENTS,
  opts?: { prefix?: string },
): void {
  for (const ctor of list) {
    const tag = opts?.prefix ? ctor.tag.replace(/^jd-/, `${opts.prefix}-`) : ctor.tag;
    defineElement(tag, ctor);
  }
}

defineJunds(); // import 부작용 — "@junds/web/define" 한 줄로 전량 등록
