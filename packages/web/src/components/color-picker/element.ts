/**
 * <jd-color-picker> — 트리거 + 프리셋 팝업 + HEX 입력 (v2 composites/ColorPicker).
 *
 * 프리셋 2경로(§1.3): `presets` 프로퍼티(string[]) 또는 자식
 * `<script type="application/json">` 슬롯 (DEC-023-3 선례). 미지정 시 v2 DEFAULT_PRESETS.
 *
 * 팝업 배치 — top layer(popover/dialog) 미사용: jd-modal이 같은 이유로 <dialog>를
 * 버렸다(DECISIONS "G1 구현 중 발견"). 쌓임은 --jd-z-popover 토큰이, 오버라이드는
 * @layer 계약이 담당한다. position: fixed + 뷰포트 클램프로 잘림을 피한다.
 *
 * v2 대비 개선:
 *  - v2는 팝업 크기를 220×200으로 **하드코딩**해 클램프했다 → v3는 실측(offsetWidth/
 *    Height)하고, 아래 공간이 모자라면 트리거 위로 뒤집는다.
 *  - v2는 열고 난 뒤 스크롤·리사이즈에 반응하지 않아 팝업이 트리거를 떠났다 →
 *    behaviors의 on()으로 열려 있는 동안만 재배치를 건다.
 *  - v2 프리셋은 <button> 24개가 전부 탭 순서에 들어갔고 선택 상태를 노출하지 않았다
 *    → 네이티브 radio 위임(§1.6-1)으로 단일 탭스톱·화살표 순회·상태 노출.
 *  - ESC·바깥 클릭 닫기와 포커스 복귀가 없었다 → createClickOutside/createKeyHandler.
 *
 * <jd-color-swatch>를 상속하지 않은 이유: 스와치는 "호스트가 곧 목록"이지만 여기서는
 * 목록이 팝업 안에 있고, 선택 시 클립보드 복사·HEX 라벨 열도 없다. 기반을 컨테이너
 * 주입형으로 일반화하면 훅이 4개 늘고 정작 스와치 쪽이 복잡해져 독립 구현했다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createClickOutside, createKeyHandler, on } from "../../behaviors/input.js";
import colorPickerStyles from "./color-picker.css.js";

/** v2 DEFAULT_PRESETS 그대로 */
const DEFAULT_PRESETS: string[] = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#78716C",
  "#0EA5E9",
  "#10B981",
];

const HEX6 = /^#[0-9A-Fa-f]{6}$/;
/** v2 clamp(rect.left, 8, …) 동형 여백 */
const EDGE = 8;
const GAP = 4;

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

export class JdColorPicker extends JdElement {
  static override tag = "jd-color-picker";
  static override props = {
    value: { type: String, default: "#000000", reflect: true },
    open: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    /**
     * HEX 입력줄을 감춘다. v2 showInput의 기본값이 true라 CE에서는 부정형이
     * 정확하다(불리언 attribute는 "없음=false"라 기본 true를 표현할 수 없다).
     * attr: no-input
     */
    noInput: { type: Boolean, reflect: true },
    /** 트리거 접근 이름. 기본 "색상 선택" */
    label: { type: String },
  };

  declare value: string;
  declare open: boolean;
  declare disabled: boolean;
  declare noInput: boolean;
  declare label: string;

  #presets: string[] = DEFAULT_PRESETS;
  #trigger!: HTMLButtonElement;
  #triggerChip!: HTMLElement;
  #triggerText!: HTMLElement;
  #popup!: HTMLElement;
  #grid!: HTMLElement;
  #inputRow!: HTMLElement;
  #inputChip!: HTMLElement;
  #hex!: HTMLInputElement;
  #items: HTMLLabelElement[] = [];
  #groupName = "";
  #wasOpen = false;
  #unbind: Array<() => void> = [];

  get presets(): string[] {
    return this.#presets;
  }
  set presets(v: string[]) {
    this.#presets = Array.isArray(v) ? v.filter((c) => typeof c === "string") : [];
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(colorPickerStyles);
    this.#readJson();
    const existing = this.querySelector<HTMLButtonElement>(":scope > .jd-color-picker__trigger");
    if (existing) this.#adopt(existing);
    else this.#build();
    // 초기 상태는 여기서 결정적으로 확정한다(#applyOpenChange는 "전이"만 다룬다).
    // #wasOpen을 현재 값으로 맞춰 두면 update()가 최초 렌더에서 전이로 오인하지
    // 않는다 — 열린 채로 시작해도 배치 측정(getBoundingClientRect)은 connected()로
    // 미뤄진다(§6-3 프리렌더 결정성: render는 레이아웃을 읽지 않는다).
    this.#wasOpen = this.open;
    this.#popup.hidden = !this.open;
    this.#trigger.setAttribute("aria-expanded", this.open ? "true" : "false");
    this.#rebuildPresets();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as string[];
      if (Array.isArray(parsed)) this.#presets = parsed.filter((c) => typeof c === "string");
    } catch {
      console.warn("[junds] <jd-color-picker> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 입양(§3.3): SSR/어댑터가 그린 골격 재사용 */
  #adopt(trigger: HTMLButtonElement): void {
    this.#trigger = trigger;
    this.#triggerChip = trigger.querySelector(".jd-color-picker__preview")!;
    this.#triggerText = trigger.querySelector(".jd-color-picker__value")!;
    this.#popup = this.querySelector(":scope > .jd-color-picker__popup")!;
    this.#grid = this.#popup.querySelector(".jd-color-picker__presets")!;
    this.#inputRow = this.#popup.querySelector(".jd-color-picker__input-row")!;
    this.#inputChip = this.#inputRow.querySelector(".jd-color-picker__preview")!;
    this.#hex = this.#inputRow.querySelector(".jd-color-picker__hex")!;
  }

  #build(): void {
    const id = jdUid("jd-cp");

    this.#trigger = document.createElement("button");
    this.#trigger.type = "button";
    this.#trigger.className = "jd-color-picker__trigger";
    this.#trigger.setAttribute("aria-haspopup", "dialog");
    this.#trigger.setAttribute("aria-controls", `${id}-popup`);
    this.#triggerChip = document.createElement("span");
    this.#triggerChip.className = "jd-color-picker__preview";
    this.#triggerChip.setAttribute("aria-hidden", "true");
    this.#triggerText = document.createElement("span");
    this.#triggerText.className = "jd-color-picker__value";
    this.#trigger.append(this.#triggerChip, this.#triggerText);

    this.#popup = document.createElement("div");
    this.#popup.className = "jd-color-picker__popup";
    this.#popup.id = `${id}-popup`;
    this.#popup.setAttribute("role", "dialog");
    this.#popup.setAttribute("aria-label", "색상 선택");
    this.#popup.hidden = true;

    this.#grid = document.createElement("div");
    this.#grid.className = "jd-color-picker__presets";
    this.#grid.setAttribute("role", "radiogroup");
    this.#grid.setAttribute("aria-label", "프리셋 색상");

    this.#inputRow = document.createElement("div");
    this.#inputRow.className = "jd-color-picker__input-row";
    this.#inputChip = document.createElement("span");
    this.#inputChip.className = "jd-color-picker__preview";
    this.#inputChip.setAttribute("aria-hidden", "true");
    this.#hex = document.createElement("input");
    this.#hex.type = "text";
    this.#hex.className = "jd-color-picker__hex";
    this.#hex.placeholder = "#000000";
    this.#hex.maxLength = 7;
    this.#hex.spellcheck = false;
    this.#hex.autocomplete = "off";
    this.#hex.setAttribute("aria-label", "HEX 색상 코드");
    this.#inputRow.append(this.#inputChip, this.#hex);

    this.#popup.append(this.#grid, this.#inputRow);
    this.append(this.#trigger, this.#popup);
  }

  /** 프리셋 라디오 재구축 — 개수가 같으면 골격 재사용 */
  #rebuildPresets(): void {
    if (!this.#groupName) this.#groupName = jdUid("jd-cp-preset");
    const existing = Array.from(
      this.#grid.querySelectorAll<HTMLLabelElement>(":scope > label.jd-color-picker__swatch"),
    );
    if (existing.length === this.#presets.length) {
      this.#items = existing;
      return;
    }
    for (const el of existing) el.remove();
    this.#items = this.#presets.map(() => {
      const item = document.createElement("label");
      item.className = "jd-color-picker__swatch";
      const input = document.createElement("input");
      input.type = "radio";
      input.className = "jd-color-picker__swatch-input";
      const chip = document.createElement("span");
      chip.className = "jd-color-picker__swatch-chip";
      chip.setAttribute("aria-hidden", "true");
      item.append(input, chip);
      this.#grid.append(item);
      return item;
    });
  }

  /* ── 수명 ─────────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.#trigger.addEventListener("click", this.#onTriggerClick);
    this.#hex.addEventListener("input", this.#onHexInput);
    this.#hex.addEventListener("blur", this.#onHexBlur);
    this.#grid.addEventListener("change", this.#onPresetChange);
    // 바깥 클릭·ESC는 공용 Behavior로 — own()이 수명 관리(§1.2, WEB-10)
    this.own(createClickOutside(this, () => this.close()));
    this.own(
      createKeyHandler(
        this,
        { escape: () => this.close() },
        // HEX 입력에 포커스가 있어도 ESC는 닫혀야 한다 → 폼 태그 허용
        { enableOnFormTags: true, preventDefault: false },
      ),
    );
    // 열린 상태의 활성화(측정·재배치 바인딩·포커스)는 최초 렌더든 재연결이든
    // 전부 여기서 — render()는 레이아웃을 읽지 않는다(§6-3)
    if (this.open) this.#applyOpenChange(true);
  }

  protected override disconnected(): void {
    this.#trigger?.removeEventListener("click", this.#onTriggerClick);
    this.#hex?.removeEventListener("input", this.#onHexInput);
    this.#hex?.removeEventListener("blur", this.#onHexBlur);
    this.#grid?.removeEventListener("change", this.#onPresetChange);
    this.#unbindWhileOpen();
    this.#wasOpen = false;
  }

  /* ── 상호작용 ─────────────────────────────────────────────────────── */

  #onTriggerClick = (): void => {
    if (this.disabled) return;
    this.open = !this.open;
  };

  #onPresetChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-color-picker__swatch-input")) return;
    this.#commit(input.value);
  };

  /** v2 handleInputChange: 유효한 HEX일 때만 상위로 반영 — 입력 자체는 막지 않는다 */
  #onHexInput = (): void => {
    const v = this.#hex.value;
    if (HEX6.test(v)) this.#commit(v);
  };

  /** v2 handleInputBlur: 유효하면 확정, 아니면 마지막 값으로 되돌린다 */
  #onHexBlur = (): void => {
    if (HEX6.test(this.#hex.value)) this.#commit(this.#hex.value);
    else this.#hex.value = this.value;
  };

  #commit(v: string): void {
    if (v === this.value) return;
    this.value = v;
    this.emit("jd-change", { value: v });
  }

  /** 열기 */
  showPicker(): void {
    if (this.disabled) return;
    this.open = true;
  }

  /** 닫기 */
  close(): void {
    if (!this.open) return;
    this.open = false;
  }

  /* ── open 전이 ────────────────────────────────────────────────────── */

  #applyOpenChange(open: boolean): void {
    // 포커스 위치는 **감추기 전에** 봐야 한다 — hidden이 걸리는 순간 브라우저가
    // 안쪽 요소의 포커스를 body로 날려 "안에 있었는지"를 더는 알 수 없다
    const hadFocusInside = !open && this.contains(this.ownerDocument.activeElement);
    this.#wasOpen = open;
    this.#popup.hidden = !open;
    this.#trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      this.#hex.value = this.value; // v2: 열 때 입력값을 현재 값으로 되돌린다
      this.#reposition();
      this.#bindWhileOpen();
      // 선택된 프리셋(없으면 첫 칸)으로 포커스를 옮긴다 — 화살표 순회 시작점
      const focusTarget =
        this.#grid.querySelector<HTMLInputElement>(".jd-color-picker__swatch-input:checked") ??
        this.#grid.querySelector<HTMLInputElement>(".jd-color-picker__swatch-input");
      focusTarget?.focus();
      this.emit("jd-open");
    } else {
      this.#unbindWhileOpen();
      if (hadFocusInside) this.#trigger.focus(); // 초점 유실 방지
      this.emit("jd-close");
    }
  }

  #bindWhileOpen(): void {
    if (this.#unbind.length) return;
    this.#unbind.push(
      on(window, "resize", this.#reposition),
      // 조상 스크롤러까지 잡으려면 캡처 단계여야 한다
      on(window, "scroll", this.#reposition, true),
    );
  }

  #unbindWhileOpen(): void {
    for (const off of this.#unbind) off();
    this.#unbind = [];
  }

  /** 트리거 기준 배치 + 뷰포트 클램프. 아래가 좁으면 위로 뒤집는다 */
  #reposition = (): void => {
    if (!this.open) return;
    const rect = this.#trigger.getBoundingClientRect();
    const pw = this.#popup.offsetWidth || 220;
    const ph = this.#popup.offsetHeight || 200;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = rect.bottom + GAP;
    if (top + ph > vh - EDGE && rect.top - GAP - ph >= EDGE) top = rect.top - GAP - ph;
    top = clamp(top, EDGE, Math.max(EDGE, vh - ph - EDGE));
    const left = clamp(rect.left, EDGE, Math.max(EDGE, vw - pw - EDGE));
    this.#popup.style.top = `${Math.round(top)}px`;
    this.#popup.style.left = `${Math.round(left)}px`;
  };

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    if (this.#items.length !== this.#presets.length) this.#rebuildPresets();

    this.#trigger.disabled = this.disabled;
    this.#trigger.setAttribute("aria-label", this.label || "색상 선택");
    this.#triggerChip.style.backgroundColor = this.value;
    this.#triggerText.textContent = this.value;
    this.#inputChip.style.backgroundColor = this.value;
    this.#inputRow.hidden = this.noInput;

    // 입력 중인 값을 덮어쓰지 않는다(text-field 관용구)
    if (this.#hex !== this.ownerDocument.activeElement && this.#hex.value !== this.value) {
      this.#hex.value = this.value;
    }

    this.#items.forEach((item, i) => {
      const color = this.#presets[i];
      if (color === undefined) return;
      const input = item.querySelector<HTMLInputElement>(".jd-color-picker__swatch-input")!;
      const chip = item.querySelector<HTMLElement>(".jd-color-picker__swatch-chip")!;
      chip.style.backgroundColor = color;
      input.name = this.#groupName;
      input.value = color;
      input.checked = color === this.value;
      input.setAttribute("aria-label", color);
      item.title = color; // v2 title={color}
      item.toggleAttribute("data-selected", color === this.value);
    });

    if (this.open !== this.#wasOpen) this.#applyOpenChange(this.open);
  }

  override focus(options?: FocusOptions): void {
    this.#trigger?.focus(options);
  }
}
