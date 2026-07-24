/**
 * <jd-portal> — children을 다른 컨테이너로 옮기는 이동자 (v2 primitives/Portal).
 *
 * - React의 createPortal은 "트리는 여기, DOM은 저기"지만 light DOM CE엔 가상 트리가
 *   없다 — 실제 노드를 옮긴다. 옮긴 노드는 원래 자리로 되돌릴 수 있게 앵커(주석 노드)를
 *   남기지 않고, disconnected에서 호스트로 회수한다(중복 삽입·유령 노드 방지).
 * - 대상은 attribute에 요소를 실을 수 없어 **셀렉터**(`to`)로 받는다. 직접 Element를
 *   주려면 `container` 프로퍼티(§1.3 property 전용 표면).
 * - v2는 mounted 전 null을 반환해 SSR을 피했다. CE의 render는 이미 지연 실행이라
 *   같은 효과이며, 서버 산출물엔 children이 호스트 안에 그대로 남는다(점진적 향상).
 */
import { JdElement } from "../../core/element.js";

export class JdPortal extends JdElement {
  static override tag = "jd-portal";
  static override props = {
    /** 이동 대상 셀렉터. 미지정이면 document.body */
    to: { type: String },
    /** 이동 보류 — 켜면 children이 제자리에 남는다 */
    disabled: { type: Boolean, reflect: true },
  };

  declare to: string;
  declare disabled: boolean;

  #container: Element | null = null;
  #moved: ChildNode[] = [];

  /** 대상 컨테이너를 직접 지정(셀렉터로 표현할 수 없는 경우) */
  set container(v: Element | null) {
    this.#container = v;
    this.requestUpdate();
  }
  get container(): Element | null {
    return this.#container;
  }

  /** 실효 대상 */
  get target(): Element {
    return this.#container ?? (this.to ? document.querySelector(this.to) : null) ?? document.body;
  }

  protected render(): void {
    this.update();
  }

  protected override update(): void {
    if (this.disabled) {
      this.#recall();
      return;
    }
    const target = this.target;
    // 이미 옮겨둔 노드가 같은 대상에 있으면 재이동 불필요(멱등)
    if (this.#moved.length > 0 && this.#moved[0]!.parentNode === target) return;
    const nodes = this.#moved.length > 0 ? this.#moved : Array.from(this.childNodes);
    if (nodes.length === 0) return;
    target.append(...nodes);
    this.#moved = nodes;
    this.emit("jd-open", { target });
  }

  /** 옮긴 노드를 호스트로 회수 */
  #recall(): void {
    if (this.#moved.length === 0) return;
    this.append(...this.#moved);
    this.#moved = [];
  }

  /**
   * 재연결 시 이동을 다시 적용한다. 조상 CE(jd-section 등)가 자기 children을 골격
   * 안으로 옮기면 이 호스트는 disconnect→connect를 겪는데, JdElement는 재연결에서
   * update()를 부르지 않는다(render 1회 계약) — 그대로 두면 회수된 노드가 영영
   * 호스트 안에 남는다. 실측으로 잡은 함정.
   */
  protected override connected(): void {
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.#recall(); // 호스트가 사라질 때 고아 노드를 남기지 않는다
  }
}
