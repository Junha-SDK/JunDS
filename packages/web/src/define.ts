/**
 * "@junds/web/define" — 전량 정의 진입점 (03-web-arch §2, §6.2 부작용 모듈).
 * defineJunds(): 전량/부분 등록 + prefix 탈출구(멀티 버전 공존).
 * SSR 안전: defineElement가 Node에서 no-op(§2).
 */
import { defineElement } from "./core/define.js";
import { JdButton } from "./components/button/element.js";
import { JdTextField } from "./components/text-field/element.js";
import { JdModal } from "./components/modal/element.js";

type JdCtor = CustomElementConstructor & { tag: string };

/** G1 파일럿 3종 — 배치가 늘 때마다 여기(와 exports 생성기)에 추가된다 */
const ALL: JdCtor[] = [JdButton, JdTextField, JdModal];

export function defineJunds(
  list: readonly JdCtor[] = ALL,
  opts?: { prefix?: string },
): void {
  for (const ctor of list) {
    const tag = opts?.prefix ? ctor.tag.replace(/^jd-/, `${opts.prefix}-`) : ctor.tag;
    defineElement(tag, ctor);
  }
}

defineJunds(); // import 부작용 — "@junds/web/define" 한 줄로 전량 등록
