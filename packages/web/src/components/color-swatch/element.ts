/**
 * <jd-color-swatch> — 색상 팔레트에서 색을 고르는 스와치 (v2 composites/ColorSwatch).
 *
 * 색 목록 2경로(§1.3): `colors` 프로퍼티(string[]) 또는 자식
 * `<script type="application/json">["#f00", …]</script>` 슬롯 (DEC-023-3 선례).
 *
 * a11y — v2 대비 상위집합: v2는 <div role="listbox"> 안에 <button role="option">을
 * 넣었다(버튼 n개가 전부 탭 순서 + 클릭 외 키보드 선택 경로 없음). v3는
 * RadioGroup·StarRating과 같은 네이티브 radio 위임(§1.6-1)이라 단일 탭스톱·화살표
 * 순회·선택 상태 노출·폼 참여가 브라우저 기본으로 붙는다.
 *
 * 복사 부수효과는 v2와 같이 "고르면 클립보드로"지만, **포인터/Space 활성화(click)**
 * 에서만 일어난다 — 화살표로 훑는 동안 클립보드를 덮어쓰지 않는다. 실패 경로는
 * jd-copy-button 선례대로 try/catch + jd-error(§1.5)다(v2는 unhandled rejection).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createTimeout, type Timer } from "../../behaviors/timing.js";
import colorSwatchStyles from "./color-swatch.css.js";

/** v2 setTimeout(…, 1500) 동형 */
const COPIED_MS = 1500;

export class JdColorSwatch extends JdElement {
  static override tag = "jd-color-swatch";
  static override props = {
    /** 선택된 색 (v2 selected) */
    selected: { type: String, reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    /** 선택 색의 HEX 라벨 표시 (v2 showLabel) — attr: show-label */
    showLabel: { type: Boolean, reflect: true },
    /** 0이면 v2와 같은 flex wrap, 1 이상이면 N열 그리드 */
    columns: { type: Number, default: 0, reflect: true },
    /** 선택 시 클립보드 복사를 끈다 (v2엔 끄는 수단이 없었다) — attr: no-copy */
    noCopy: { type: Boolean, reflect: true },
    name: { type: String },
    /** 그룹 접근 이름. 기본 "색상 팔레트"(v2 aria-label 동형) */
    label: { type: String },
  };

  declare selected: string;
  declare size: string;
  declare showLabel: boolean;
  declare columns: number;
  declare noCopy: boolean;
  declare name: string;
  declare label: string;

  #colors: string[] = [];
  #items: HTMLLabelElement[] = [];
  #labelEl: HTMLElement | null = null;
  #groupName = "";
  #copied = "";
  #copyTimer: Timer | null = null;

  get colors(): string[] {
    return this.#colors;
  }
  set colors(v: string[]) {
    this.#colors = Array.isArray(v) ? v.filter((c): c is string => typeof c === "string") : [];
    this.#rebuild();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(colorSwatchStyles);
    this.#readJson();
    this.setAttribute("role", "radiogroup");
    this.#rebuild();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as string[];
      if (Array.isArray(parsed)) this.#colors = parsed.filter((c) => typeof c === "string");
    } catch {
      console.warn("[junds] <jd-color-swatch> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 입양(§3.3): 개수가 같으면 골격 재사용 */
  #rebuild(): void {
    if (!this.#groupName) this.#groupName = this.name || jdUid("jd-swatch");
    const existing = Array.from(
      this.querySelectorAll<HTMLLabelElement>(":scope > label.jd-color-swatch__item"),
    );
    if (existing.length === this.#colors.length) {
      this.#items = existing;
    } else {
      for (const el of existing) el.remove();
      this.#items = this.#colors.map(() => {
        const item = this.#buildItem();
        this.append(item);
        return item;
      });
    }
    if (!this.#labelEl) {
      this.#labelEl =
        this.querySelector<HTMLElement>(":scope > .jd-color-swatch__label") ??
        document.createElement("span");
      this.#labelEl.className = "jd-color-swatch__label";
    }
    this.append(this.#labelEl); // 항상 마지막 칸
  }

  #buildItem(): HTMLLabelElement {
    const item = document.createElement("label");
    item.className = "jd-color-swatch__item";
    const input = document.createElement("input");
    input.type = "radio";
    input.className = "jd-color-swatch__input";
    const chip = document.createElement("span");
    chip.className = "jd-color-swatch__chip";
    chip.setAttribute("aria-hidden", "true");
    item.append(input, chip);
    return item;
  }

  protected override connected(): void {
    this.addEventListener("change", this.#onChange);
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.#onChange);
    this.removeEventListener("click", this.#onClick);
    this.#copyTimer = null; // own()이 이미 destroy했다 — 재연결 시 새로 발급
  }

  #onChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-color-swatch__input")) return;
    this.selected = input.value;
    this.emit("jd-change", { value: input.value });
  };

  /**
   * 복사는 활성화(click)에서만 — 라벨 클릭은 내부 input에도 합성 click을 보내므로
   * input이 target인 이벤트 하나만 받아 중복 실행을 막는다.
   */
  #onClick = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("jd-color-swatch__input")) return;
    if (this.noCopy) return;
    void this.copy((target as HTMLInputElement).value);
  };

  /** 명령형 표면 — 외부에서 특정 색을 복사시킬 수 있다 */
  async copy(color: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(color);
    } catch (error) {
      this.emit("jd-error", { error });
      return false;
    }
    this.#copied = color;
    this.requestUpdate();
    this.emit("jd-copy", { text: color });
    const reset = (): void => {
      this.#copied = "";
      this.requestUpdate();
    };
    if (this.#copyTimer) this.#copyTimer.restart();
    else this.#copyTimer = this.own(createTimeout(reset, COPIED_MS));
    return true;
  }

  protected override update(): void {
    if (this.#items.length !== this.#colors.length) this.#rebuild();

    // 임의 정수 → 셀렉터 불가(§4.3 예외). columns=0은 CSS의 flex wrap이 담당
    if (this.columns > 0) {
      this.style.setProperty("grid-template-columns", `repeat(${this.columns}, max-content)`);
    } else {
      this.style.removeProperty("grid-template-columns");
    }

    const name = this.name || this.#groupName;
    this.#items.forEach((item, i) => {
      const color = this.#colors[i];
      if (color === undefined) return;
      const input = item.querySelector<HTMLInputElement>(".jd-color-swatch__input")!;
      const chip = item.querySelector<HTMLElement>(".jd-color-swatch__chip")!;
      const isCopied = this.#copied === color;
      // CSSOM 대입 — 잘못된 색 문자열은 브라우저가 무시한다(문자열 주입 경로 없음)
      chip.style.backgroundColor = color;
      input.name = name;
      input.value = color;
      input.checked = color === this.selected;
      input.setAttribute("aria-label", color);
      item.title = isCopied ? "복사됨!" : color; // v2 동형
      item.toggleAttribute("data-selected", color === this.selected);
      item.toggleAttribute("data-copied", isCopied);
    });

    if (this.#labelEl) {
      const show = this.showLabel && Boolean(this.selected);
      this.#labelEl.textContent = show ? this.selected : "";
      this.#labelEl.hidden = !show;
    }
    this.setAttribute("aria-label", this.label || "색상 팔레트");
  }
}
