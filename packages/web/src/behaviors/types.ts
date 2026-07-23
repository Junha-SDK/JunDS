/**
 * Behavior 공통 시그니처 (03-web-arch §5.1, DEC-006 D2 확정).
 */
export interface Behavior<Opts = void> {
  /** 옵션 변경 반영 (재생성 없이) */
  update?(next: Partial<Opts>): void;
  /** 멱등 — 2회 호출 무해 */
  destroy(): void;
}

export type BehaviorFactory<E extends Element, Opts, Extra = object> = (
  el: E,
  opts?: Opts,
) => Behavior<Opts> & Extra;
