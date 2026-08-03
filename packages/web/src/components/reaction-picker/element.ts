/**
 * <jd-reaction-picker> — 리액션 피커 (v2 composites/ReactionPicker).
 *
 * 트리거 클릭 → 이모지 바가 열리고, 단일 선택 토글(같은 값 재선택 시 해제)이다.
 * 이모지 목록은 복합 데이터라 `emojis` 프로퍼티 또는 자식
 * `<script type="application/json">` 슬롯으로 받는다(§1.3, 기본 6종).
 *
 * jd-popover를 상속하지 않는 이유: 원형의 트리거는 소비자가 넣는 슬롯인데, 이 컴포넌트의
 * 트리거 외형은 `value`에 묶여 스스로 그려야 하고(선택 이모지/＋ 전환), 팝업은
 * menuitemradio 단일 선택 시맨틱이라 dialog 패널 모델과 맞지 않는다. 대신 바깥 클릭·
 * 로빙은 behaviors(createClickOutside·createKeyHandler)를 재사용해 새로 만들지 않는다.
 *
 * v2 대비 개선:
 *  1. **로빙 탭인덱스 + 화살표 순회.** v2는 옵션 6개가 전부 탭 순서에 들어갔다. v3는
 *     탭스톱 1개 + ←/→/Home/End이며, 열리면 선택 항목(없으면 첫 항목)에 포커스가 간다.
 *  2. **ESC로 닫히고 트리거로 포커스가 복귀한다**(v2엔 없었다).
 *
 * 이벤트: `jd-change`{value:string|null} · `jd-open` / `jd-close`. 전부 cancelable=false.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createClickOutside, createKeyHandler, on } from "../../behaviors/input.js";
import reactionPickerStyles from "./reaction-picker.css.js";

const DEFAULT_EMOJIS = ["❤️", "🔥", "👍", "😂", "😮", "😢"];

export class JdReactionPicker extends JdElement {
  static override tag = "jd-reaction-picker";
  static override props = {
    /** 선택된 이모지 — 빈 문자열이면 미선택 */
    value: { type: String, reflect: true },
    /** 열림 상태 */
    open: { type: Boolean, reflect: true },
    /** top | bottom */
    placement: { type: String, default: "top", reflect: true },
    /** 트리거 보조 라벨(없으면 아이콘만) */
    triggerLabel: { type: String },
    // emojis(배열)는 property 전용(§1.3)
  };

  declare value: string;
  declare open: boolean;
  declare placement: string;
  declare triggerLabel: string;

  #emojis: string[] = DEFAULT_EMOJIS;
  #trigger!: HTMLButtonElement;
  #triggerValue!: HTMLSpanElement;
  #triggerLabelEl!: HTMLSpanElement;
  #menu!: HTMLElement;
  #options: HTMLButtonElement[] = [];
  #activeIndex = 0;
  #wasOpen = false;
  #offEsc: (() => void) | null = null;

  get emojis(): string[] {
    return this.#emojis;
  }
  set emojis(v: string[]) {
    this.#emojis = Array.isArray(v) && v.length > 0 ? v : DEFAULT_EMOJIS;
    this.requestUpdate();
  }

  /** null-안전한 현재 값 */
  get #current(): string {
    return this.value || "";
  }

  protected render(): void {
    adoptStyles(reactionPickerStyles);
    this.#readJson();
    const existing = this.querySelector<HTMLButtonElement>(":scope > .jd-reaction-picker__trigger");
    if (existing) {
      this.#trigger = existing;
      this.#triggerValue = existing.querySelector(".jd-reaction-picker__value")!;
      this.#triggerLabelEl = existing.querySelector(".jd-reaction-picker__trigger-label")!;
      this.#menu = this.querySelector(".jd-reaction-picker__menu")!;
    } else {
      this.#trigger = document.createElement("button");
      this.#trigger.type = "button";
      this.#trigger.className = "jd-reaction-picker__trigger";
      this.#trigger.setAttribute("aria-haspopup", "menu");
      this.#triggerValue = document.createElement("span");
      this.#triggerValue.className = "jd-reaction-picker__value";
      this.#triggerValue.setAttribute("aria-hidden", "true");
      this.#triggerLabelEl = document.createElement("span");
      this.#triggerLabelEl.className = "jd-reaction-picker__trigger-label";
      this.#trigger.append(this.#triggerValue, this.#triggerLabelEl);

      this.#menu = document.createElement("div");
      this.#menu.className = "jd-reaction-picker__menu";
      this.#menu.setAttribute("role", "menu");
      this.#menu.hidden = true;

      this.append(this.#trigger, this.#menu);
    }
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as string[];
      if (Array.isArray(parsed) && parsed.length > 0) this.#emojis = parsed;
    } catch {
      console.warn("[junds] <jd-reaction-picker> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.own(createClickOutside(this, this.#onOutside));
    this.own(
      createKeyHandler(this.#menu, {
        arrowright: () => this.#move(1),
        arrowleft: () => this.#move(-1),
        home: () => this.#focusIndex(0),
        end: () => this.#focusIndex(this.#options.length - 1),
      }),
    );
    this.#trigger.addEventListener("click", this.#onTriggerClick);
    this.#trigger.addEventListener("keydown", this.#onTriggerKeydown);
    this.#menu.addEventListener("click", this.#onOptionClick);
    // 재연결 복원 — render는 1회뿐이라 전이 부수효과를 여기서 되살린다(popover 선례)
    if (this.open && !this.#wasOpen) this.#applyOpen(true);
  }

  protected override disconnected(): void {
    this.#trigger?.removeEventListener("click", this.#onTriggerClick);
    this.#trigger?.removeEventListener("keydown", this.#onTriggerKeydown);
    this.#menu?.removeEventListener("click", this.#onOptionClick);
    this.#offEsc?.();
    this.#offEsc = null;
  }

  #onTriggerClick = (): void => {
    this.open = !this.open;
  };

  #onTriggerKeydown = (e: KeyboardEvent): void => {
    if (!this.open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      this.open = true;
    }
  };

  #onOptionClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".jd-reaction-picker__option");
    if (!btn) return;
    this.#choose(btn.dataset.emoji ?? "");
  };

  #onOutside = (): void => {
    if (this.open) this.open = false;
  };

  #onDocKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Escape" || !this.open) return;
    e.stopPropagation();
    this.open = false;
    this.#trigger.focus();
  };

  #choose(emoji: string): void {
    const next = this.#current === emoji ? "" : emoji;
    this.value = next;
    this.open = false;
    this.emit("jd-change", { value: next || null });
  }

  #move(delta: number): void {
    if (this.#options.length === 0) return;
    const next = Math.max(0, Math.min(this.#options.length - 1, this.#activeIndex + delta));
    this.#focusIndex(next);
  }

  #focusIndex(i: number): void {
    const btn = this.#options[i];
    if (!btn) return;
    this.#activeIndex = i;
    this.#syncRoving();
    btn.focus();
  }

  #syncRoving(): void {
    this.#options.forEach((b, i) => {
      b.tabIndex = i === this.#activeIndex ? 0 : -1;
    });
  }

  protected override update(): void {
    // 트리거
    const current = this.#current;
    this.#triggerValue.textContent = current || "+";
    this.#trigger.toggleAttribute("data-selected", Boolean(current));
    this.#trigger.setAttribute("aria-expanded", String(this.open));
    this.#trigger.setAttribute(
      "aria-label",
      current ? `현재 리액션 ${current}, 변경` : "리액션 추가",
    );
    const hasLabel = Boolean(this.triggerLabel);
    this.#triggerLabelEl.textContent = hasLabel ? this.triggerLabel : "";
    this.#triggerLabelEl.hidden = !hasLabel;

    // 옵션 목록
    if (this.#options.length !== this.#emojis.length) {
      this.#menu.textContent = "";
      this.#options = this.#emojis.map(() => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "jd-reaction-picker__option";
        b.setAttribute("role", "menuitemradio");
        b.tabIndex = -1;
        this.#menu.append(b);
        return b;
      });
      this.#activeIndex = 0;
    }
    this.#options.forEach((b, i) => {
      const emoji = this.#emojis[i]!;
      b.dataset.emoji = emoji;
      b.textContent = emoji;
      const checked = current === emoji;
      b.setAttribute("aria-checked", String(checked));
      b.toggleAttribute("data-active", checked);
    });

    // 열린 상태에선 선택 항목(없으면 첫 항목)을 로빙 탭스톱으로
    const selectedIdx = this.#emojis.indexOf(current);
    if (this.open) this.#activeIndex = selectedIdx >= 0 ? selectedIdx : 0;
    this.#syncRoving();

    this.#menu.hidden = !this.open;
    if (this.open !== this.#wasOpen) this.#applyOpen(this.open);
  }

  #applyOpen(open: boolean): void {
    this.#wasOpen = open;
    if (open) {
      this.#offEsc = on(this.ownerDocument, "keydown", this.#onDocKeydown as (e: never) => void);
      this.emit("jd-open");
      if (this.isConnected) this.#focusIndex(this.#activeIndex);
    } else {
      this.#offEsc?.();
      this.#offEsc = null;
      this.emit("jd-close");
    }
  }
}
