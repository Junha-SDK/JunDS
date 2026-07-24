/**
 * <jd-action-bar> — 벌크 선택 플로팅 액션 바 (v2 patterns/ActionBar).
 *
 * v2는 Portal + position:fixed로 띄웠다. v3 오버레이 관용(snackbar·modal)은 Portal
 * 없이 호스트 자체를 position:fixed로 둔다(쌓임은 --jd-z-* 토큰) — 동일 채택.
 * 액션 버튼은 ReactNode였으므로 attribute가 아니라 기본 슬롯(children)으로 받는다(§1.3).
 *
 * v2 대비 개선: role="toolbar" + 선택 수 aria-live="polite"로 선택 변화가 스크린리더에
 * 통지된다(v2엔 없음). "선택 해제"는 기본 노출하되 `no-clear`로 끌 수 있다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import actionBarStyles from "./action-bar.css.js";

export class JdActionBar extends JdElement {
  static override tag = "jd-action-bar";
  static override props = {
    open: { type: Boolean, reflect: true },
    /** 선택된 항목 수 */
    count: { type: Number },
    /** count 뒤 접미 라벨 (i18n) */
    countLabel: { type: String, default: "개 선택" },
    /** 선택 해제 버튼 숨김 (v2: onClear 미제공에 대응) */
    noClear: { type: Boolean, reflect: true },
    clearLabel: { type: String, default: "선택 해제" },
  };

  declare open: boolean;
  declare count: number;
  declare countLabel: string;
  declare noClear: boolean;
  declare clearLabel: string;

  #count!: HTMLElement;
  #clear!: HTMLButtonElement;
  #clearDivider!: HTMLElement;

  protected render(): void {
    adoptStyles(actionBarStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-action-bar__count");
    if (existing) {
      this.#count = existing;
      this.#clear = this.querySelector(":scope > .jd-action-bar__clear")!;
      this.#clearDivider = this.querySelector(":scope > .jd-action-bar__divider[data-clear]")!;
    } else {
      this.#build();
    }
    this.setAttribute("role", "toolbar");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "선택 항목 작업");
    this.update();
  }

  #build(): void {
    // 사용자 액션 버튼(children)을 actions 컨테이너로 입양
    const actionNodes = [...this.childNodes];

    this.#count = document.createElement("span");
    this.#count.className = "jd-action-bar__count";
    this.#count.setAttribute("aria-live", "polite");

    const divider = document.createElement("span");
    divider.className = "jd-action-bar__divider";
    divider.setAttribute("aria-hidden", "true");

    const actions = document.createElement("div");
    actions.className = "jd-action-bar__actions";
    actions.append(...actionNodes);

    this.#clearDivider = document.createElement("span");
    this.#clearDivider.className = "jd-action-bar__divider";
    this.#clearDivider.setAttribute("data-clear", "");
    this.#clearDivider.setAttribute("aria-hidden", "true");

    this.#clear = document.createElement("button");
    this.#clear.type = "button";
    this.#clear.className = "jd-action-bar__clear";

    this.append(this.#count, divider, actions, this.#clearDivider, this.#clear);
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    if ((e.target as Element).closest(".jd-action-bar__clear")) this.emit("jd-clear");
  };

  protected override update(): void {
    this.#count.textContent = `${this.count}${this.countLabel}`;
    this.#clear.textContent = this.clearLabel;
    this.#clear.hidden = this.noClear;
    this.#clearDivider.hidden = this.noClear;
  }
}
