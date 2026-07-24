/**
 * <jd-focus-guard> — 영역 안에 포커스를 가두는 래퍼 (v2 primitives/FocusGuard).
 *
 * - 로직은 이미 있는 createFocusTrap Behavior(§8, WEB-10)를 그대로 쓴다 — Modal이
 *   쓰는 것과 같은 구현이라 Tab 순환·복귀 규칙이 갈라지지 않는다.
 * - **기본은 비활성**이다. v2 기본값은 active=true였지만, 조건부 렌더가 없는 CE에서
 *   그러면 페이지에 놓이는 순간 포커스를 가둔다. Behavior 규약도 "create 시점에는
 *   리스너를 붙이지 않고 activate()가 시작점"이라고 못박고 있다(모달이 닫힌 채
 *   connect되는 것이 정상 상태).
 * - returnFocus 기본 참은 attribute로 표현할 수 없어 `no-return-focus` 반전 플래그
 *   (DEC-029-5 관용구).
 */
import { JdElement } from "../../core/element.js";
import { createFocusTrap } from "../../behaviors/focus-trap.js";
import type { FocusTrap } from "../../behaviors/focus-trap.js";

export class JdFocusGuard extends JdElement {
  static override tag = "jd-focus-guard";
  static override props = {
    /** 감금 활성화 */
    active: { type: Boolean, reflect: true },
    /** 활성화 시 최초 포커스를 줄 셀렉터 */
    initialFocus: { type: String },
    /** 복귀 포커스 끄기 */
    noReturnFocus: { type: Boolean, reflect: true },
  };

  declare active: boolean;
  declare initialFocus: string;
  declare noReturnFocus: boolean;

  #trap: FocusTrap | null = null;

  protected render(): void {
    this.update();
  }

  /**
   * 재연결 대비. JdElement는 disconnect에서 own()한 Behavior를 destroy하는데,
   * destroy된 트랩은 activate()가 영구 무시된다 — 조상 CE가 children을 골격으로
   * 옮기며 일으키는 disconnect→connect 한 번에 감금이 죽는다(실측으로 잡은 함정).
   * 참조를 버리고 다시 만든다.
   */
  protected override connected(): void {
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.#trap = null; // 파괴된 트랩을 붙들지 않는다
  }

  protected override update(): void {
    if (!this.#trap) {
      this.#trap = this.own(
        createFocusTrap(this, {
          initialFocus: this.initialFocus || undefined,
          returnFocus: !this.noReturnFocus,
        }),
      );
    } else {
      this.#trap.update?.({
        initialFocus: this.initialFocus || undefined,
        returnFocus: !this.noReturnFocus,
      });
    }
    if (this.active) this.#trap.activate();
    else this.#trap.deactivate();
  }
}
