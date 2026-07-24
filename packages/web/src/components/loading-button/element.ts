/**
 * <jd-loading-button> — 로딩 라벨이 교체되는 버튼 (v2 composites/LoadingButton) = jd-button 파생.
 *
 * v2 LoadingButton은 Button의 `loading`(스피너 + 자동 비활성 + aria-busy)을 **통째로
 * 다시 구현**하고 `loadingText` 하나를 더했다. v3는 그 전부를 jd-button이 이미 갖고
 * 있으므로(§6 R12) 파생은 **라벨 교체 한 축만** 얹는다 — 스피너·disabled·aria-busy·
 * variant/size/full-width는 상속으로 공짜다.
 *
 * 라벨 2종을 **둘 다 DOM에 두고 CSS가 고른다**(jd-follow-button 선례). display:none이
 * 접근성 트리에서도 지우므로 접근 이름은 항상 "지금 보이는 라벨" 하나다.
 * 로딩 라벨은 aria-live 영역이다 — v2는 `disabled`가 켜지는 순간 포커스가 body로
 * 떨어져(네이티브 disabled의 알려진 부작용) 상태 변화가 AT에 전혀 전달되지 않았다.
 *
 * v2 `leftIcon`은 jd-button과 같은 이유로 이식하지 않는다 — children에 직접 쓴다.
 * variant는 v2 LoadingButton의 4종(primary/secondary/ghost/danger)이 지원 범위다.
 */
import { JdButton } from "../button/element.js";
import { adoptStyles } from "../../core/styles.js";
import loadingButtonStyles from "./loading-button.css.js";

export class JdLoadingButton extends JdButton {
  static override tag = "jd-loading-button";
  static override props = {
    ...JdButton.props,
    /** 로딩 중 표시할 텍스트. 비우면 v2처럼 기존 children을 그대로 둔다 */
    loadingText: { type: String }, // attr: loading-text
  };

  declare loadingText: string;

  #label: HTMLSpanElement | null = null;
  #busy: HTMLSpanElement | null = null;

  protected override render(): void {
    super.render(); // <button class="jd-button"> 구축 + children 이동 (+ 첫 update)
    adoptStyles(loadingButtonStyles);
    this.#mountLabels();
    this.update();
  }

  /** 입양(§3.3): 라벨 두 칸이 이미 있으면 재사용, 없을 때만 children을 감싼다 */
  #mountLabels(): void {
    const btn = this.querySelector<HTMLButtonElement>(":scope > button.jd-button");
    if (!btn) return;
    const label = btn.querySelector<HTMLSpanElement>(":scope > .jd-loading-button__label");
    const busy = btn.querySelector<HTMLSpanElement>(":scope > .jd-loading-button__busy");
    if (label && busy) {
      this.#label = label;
      this.#busy = busy;
      return;
    }
    this.#label = document.createElement("span");
    this.#label.className = "jd-loading-button__label";
    // 스피너는 부모 클래스 소유 노드다 — 건드리지 않고 나머지 children만 라벨로 옮긴다
    for (const node of Array.from(btn.childNodes)) {
      if ((node as Element).classList?.contains("jd-button__spinner")) continue;
      this.#label.append(node);
    }
    this.#busy = document.createElement("span");
    this.#busy.className = "jd-loading-button__busy";
    // 로딩 라벨 등장을 AT에 알린다 — disabled로 포커스를 잃어도 상태가 전달된다
    this.#busy.setAttribute("aria-live", "polite");
    btn.append(this.#label, this.#busy);
  }

  protected override update(): void {
    super.update(); // disabled·aria-busy·스피너 삽입/제거
    if (!this.#busy) return; // super.render() 안의 첫 update — 골격이 아직 없다
    // 교체는 "로딩 중 + 로딩 텍스트 있음"일 때만 — CSS가 어느 칸을 보일지 고른다.
    // 속성을 먼저 켜서 live 영역을 보이게 한 **뒤** 텍스트를 넣는다: 이미 텍스트가 든
    // 영역이 display:none→표시로 바뀌는 것만으로는 발화하지 않는 AT가 있다.
    this.toggleAttribute("data-swap", Boolean(this.loadingText));
    const shown = this.loading && this.loadingText ? this.loadingText : "";
    if (this.#busy.textContent !== shown) this.#busy.textContent = shown;
  }
}
