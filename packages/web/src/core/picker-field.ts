/**
 * JdPickerField — "값 트리거 + 앵커드 패널" 필드형 오버레이의 공용 베이스 (§6 R12).
 *
 * v2에서 DateRangePicker·TimePicker는 **각자** open 상태·Portal·좌표 계산·
 * useClickOutside를 다시 구현했고, 그래서 둘 다 같은 결함을 공유했다:
 * 트리거가 `<div onClick>`(키보드로 열 수 없음), aria-expanded/haspopup 없음,
 * ESC 없음, 열 때 패널로 포커스가 가지 않고 닫을 때 트리거로 돌아오지도 않음,
 * 좌표를 열 때 1회만 계산해 스크롤하면 패널이 남는다.
 * v3는 그 전부를 이 베이스가 갖고 파생은 **패널 내용과 표시 문자열만** 재정의한다.
 *
 * Portal 미사용 결정: v2는 fixed + getBoundingClientRect 1회 계산이라 스크롤·리사이즈에
 * 패널이 떨어져 나갔다. light DOM에서는 호스트를 position:relative로 두고 패널을
 * absolute로 붙이면 좌표 동기화가 브라우저 몫이 된다 — 계산도 재계산도 필요 없다.
 * 뷰포트 아래로 넘칠 때의 상하 뒤집기만 열림 전이에서 1회 판정한다.
 *
 * 이벤트(§1.5): 상태 변화 후 jd-open / jd-close (사후 통지, cancelable 아님).
 */
import { JdElement } from "./element.js";
import { createClickOutside } from "../behaviors/input.js";

export abstract class JdPickerField extends JdElement {
  static override props = {
    open: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    placeholder: { type: String },
  };

  declare open: boolean;
  declare disabled: boolean;
  declare placeholder: string;

  protected trigger!: HTMLButtonElement;
  protected panel!: HTMLDivElement;
  protected valueEl!: HTMLSpanElement;

  #wasOpen = false;
  /** 사용자 조작으로 열렸을 때만 패널로 포커스를 옮긴다 (선언적 open= 로 포커스 강탈 금지) */
  #userOpened = false;
  /** 닫힐 때 트리거로 포커스를 되돌릴지 (ESC·선택 완료 경로) */
  #restoreFocus = false;

  /** 파생: 트리거 왼쪽 아이콘 SVG 문자열 */
  protected abstract triggerIcon(): string;
  /**
   * 파생: 패널 내용 골격. render()에서 **정확히 1회** 호출되지만, 골격이 이미 있는
   * 경우(SSR·프리렌더 스냅샷 재수화)에도 호출되므로 **멱등해야 한다** — 먼저 찾고
   * 없을 때만 만들고, 내부 노드 참조와 리스너는 두 경로 모두에서 다시 맺는다(§3.3).
   */
  protected abstract buildPanel(panel: HTMLElement): void;
  /** 파생: 트리거에 보일 값 문자열. 빈 문자열이면 placeholder */
  protected abstract displayText(): string;
  /** 파생: 패널의 접근 이름 */
  protected abstract panelLabel(): string;

  /** 파생 훅 — 패널이 열린 직후(측정·스크롤 동기화 자리) */
  protected onPanelOpen(): void {}

  protected override render(): void {
    // 입양 규칙(§3.3) — SSR/어댑터가 그린 골격이 있으면 재사용
    const existing = this.querySelector<HTMLButtonElement>(":scope > .jd-picker-field__trigger");
    if (existing) {
      this.trigger = existing;
      this.panel = this.querySelector<HTMLDivElement>(":scope > .jd-picker-field__panel")!;
      this.valueEl = this.trigger.querySelector<HTMLSpanElement>(".jd-picker-field__value")!;
    } else {
      this.#build();
    }
    // 두 경로 공통 — 입양 시에도 파생이 자기 노드를 다시 붙잡아야 한다(§3.3)
    this.buildPanel(this.panel);
    this.setAttribute("data-jd-picker-field", "");
    this.trigger.addEventListener("click", this.#onTriggerClick);
    this.trigger.addEventListener("keydown", this.#onTriggerKeydown);
    this.addEventListener("keydown", this.#onKeydown);
    this.addEventListener("focusout", this.#onFocusOut);
  }

  #build(): void {
    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "jd-picker-field__trigger";
    this.trigger.setAttribute("aria-haspopup", "dialog");
    this.trigger.setAttribute("aria-expanded", "false");
    const icon = document.createElement("span");
    icon.className = "jd-picker-field__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = this.triggerIcon();
    this.valueEl = document.createElement("span");
    this.valueEl.className = "jd-picker-field__value";
    this.trigger.append(icon, this.valueEl);

    this.panel = document.createElement("div");
    this.panel.className = "jd-picker-field__panel";
    this.panel.setAttribute("role", "dialog");
    this.panel.hidden = true;

    this.append(this.trigger, this.panel);
  }

  protected override connected(): void {
    // 열려 있을 때만 반응 — 리스너는 항상 붙여두고 분기는 콜백에서(재부착 비용 회피)
    this.own(
      createClickOutside(this, () => {
        if (this.open) this.open = false;
      }),
    );
    if (this.open !== this.#wasOpen) this.applyOpenChange(this.open);
  }

  protected override disconnected(): void {
    if (this.#wasOpen) {
      this.#wasOpen = false;
      this.panel.hidden = true; // 재연결 시 update()가 다시 전이를 적용한다
    }
  }

  protected override update(): void {
    this.trigger.disabled = this.disabled;
    const text = this.displayText();
    this.valueEl.textContent = text || this.placeholder;
    this.valueEl.toggleAttribute("data-placeholder", !text);
    this.panel.setAttribute("aria-label", this.panelLabel());
    if (this.open !== this.#wasOpen) this.applyOpenChange(this.open);
  }

  /** open 전이의 부수효과 1곳 — 파생이 super 호출로 확장한다 */
  protected applyOpenChange(open: boolean): void {
    this.#wasOpen = open;
    this.panel.hidden = !open;
    this.trigger.setAttribute("aria-expanded", String(open));
    if (open) {
      this.onPanelOpen();
      this.#place();
      this.emit("jd-open");
      if (this.#userOpened) this.focusPanel();
    } else {
      this.removeAttribute("data-placement");
      this.emit("jd-close");
      if (this.#restoreFocus) this.trigger.focus();
    }
    this.#userOpened = false;
    this.#restoreFocus = false;
  }

  /** 선택 완료·ESC 등 "사용자가 끝낸" 닫기 — 포커스를 트리거로 되돌린다 */
  protected closeAndRestore(): void {
    if (!this.open) return;
    this.#restoreFocus = true;
    this.open = false;
  }

  /** 패널 진입 포커스 — data-autofocus 우선, 없으면 첫 활성 버튼 */
  protected focusPanel(): void {
    const target =
      this.panel.querySelector<HTMLElement>("[data-autofocus]") ??
      this.panel.querySelector<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
    target?.focus();
  }

  /**
   * 뷰포트 아래로 넘치면 위로 뒤집는다. 패널이 이미 보이는 상태에서 1회 측정 —
   * 좌표 자체는 CSS(absolute)가 유지하므로 스크롤·리사이즈 재계산이 필요 없다.
   */
  #place(): void {
    const view = this.ownerDocument.defaultView;
    if (!view) return;
    const rect = this.trigger.getBoundingClientRect();
    const panelHeight = this.panel.offsetHeight;
    if (!panelHeight) return; // 레이아웃 전(프리렌더 등) — 기본 배치 유지
    const overflowsBelow = rect.bottom + panelHeight + 8 > view.innerHeight;
    const fitsAbove = rect.top - panelHeight - 8 > 0;
    if (overflowsBelow && fitsAbove) this.setAttribute("data-placement", "top");
    else this.removeAttribute("data-placement");
  }

  #onTriggerClick = (): void => {
    if (this.disabled) return;
    this.#userOpened = !this.open;
    this.#restoreFocus = this.open;
    this.open = !this.open;
  };

  #onTriggerKeydown = (e: KeyboardEvent): void => {
    if (this.open || this.disabled) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    this.#userOpened = true;
    this.open = true;
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape" || !this.open) return;
    e.preventDefault();
    e.stopPropagation(); // 조상 오버레이까지 함께 닫히지 않도록
    this.closeAndRestore();
  };

  /**
   * 포커스가 호스트 밖으로 나가면 닫는다(드롭다운은 감금 대상이 아니다 — Tab으로
   * 빠져나갈 수 있어야 한다). relatedTarget이 없으면 포커스 이동이 아니라 단순
   * 블러이므로 판정하지 않는다 — 패널 여백 클릭까지 닫히는 것을 막는다.
   */
  #onFocusOut = (e: FocusEvent): void => {
    if (!this.open) return;
    const next = e.relatedTarget as Node | null;
    if (!next || this.contains(next)) return;
    this.open = false;
  };

  /** 필드 표면 — 포커스는 트리거가 받는다 */
  override focus(options?: FocusOptions): void {
    this.trigger?.focus(options);
  }
}
