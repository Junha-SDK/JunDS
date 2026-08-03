/**
 * <jd-segmented-control> — iOS풍 세그먼트 선택기 (v2 composites/SegmentedControl).
 *
 * **네이티브 radio 위임**(§1.6-1): 세그먼트는 `<label><input type="radio">`다.
 * 화살표 순회·단일 tabstop·체크 상태 노출·폼 참여가 전부 브라우저 기본으로 따라온다
 * (jd-radio-group과 같은 논거 — roving Behavior를 새로 만들지 않는다).
 * v2는 그냥 `<button>` 나열이라 선택 상태가 AT에 전혀 보고되지 않았고 키보드
 * 순회도 없었다.
 *
 * 슬라이딩 인디케이터는 측정이 필요하다. 측정·인라인 스타일 쓰기는 **render()/update()
 * 밖**에서만 한다(§3.1-3 결정적 렌더): connected() 최초 1회 + change + 리사이즈
 * (behaviors/viewport의 createSizeObserver). 최초 render 산출 HTML에는 픽셀 값이
 * 들어가지 않아 프리렌더 스냅샷이 환경에 흔들리지 않는다.
 *
 * 옵션 입력 2경로: `options` 프로퍼티 / 자식 `<script type="application/json">`.
 * v2 SegmentOption의 `key`는 `value`로 접어 받는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import segmentedControlStyles from "./segmented-control.css.js";

export interface JdSegmentOption {
  value: string;
  label: string;
  /** 이모지·기호 등 텍스트 아이콘 (v2 ReactNode의 바닐라 축약) */
  icon?: string;
  disabled?: boolean;
}

export class JdSegmentedControl extends JdElement {
  static override tag = "jd-segmented-control";
  static override props = {
    value: { type: String, reflect: true },
    name: { type: String },
    /** 그룹 접근 이름 */
    label: { type: String, default: "세그먼트 선택" },
    /** sm | md | lg */
    size: { type: String, default: "md", reflect: true },
    fullWidth: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare name: string;
  declare label: string;
  declare size: string;
  declare fullWidth: boolean;
  declare disabled: boolean;

  protected optionList: JdSegmentOption[] = [];
  protected groupName = "";
  protected indicator!: HTMLElement;
  protected connectedOnce = false;

  get options(): JdSegmentOption[] {
    return this.optionList;
  }
  set options(v: JdSegmentOption[]) {
    this.optionList = Array.isArray(v) ? this.normalizeOptions(v) : [];
    this.rebuild();
    this.requestUpdate();
  }

  /** v2 SegmentOption은 식별자가 `key`였다 */
  protected normalizeOptions(v: JdSegmentOption[]): JdSegmentOption[] {
    return v.map((o) => {
      const raw = o as JdSegmentOption & { key?: string };
      return raw.value ? o : { ...o, value: raw.key ?? raw.label };
    });
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(segmentedControlStyles);
    this.upgradeOwn("options");
    this.readJsonSlot();
    this.setAttribute("role", "radiogroup");
    let indicator = this.querySelector<HTMLElement>(":scope > .jd-segmented-control__indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "jd-segmented-control__indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.hidden = true; // 측정 전에는 숨긴다(0px 막대 방지)
      this.prepend(indicator);
    }
    this.indicator = indicator;
    this.rebuild();
    this.update();
  }

  protected upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  protected readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdSegmentOption[];
      if (Array.isArray(parsed)) this.optionList = this.normalizeOptions(parsed);
    } catch {
      console.warn("[junds] <jd-segmented-control> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 세그먼트 행 재구축 — 개수가 같으면 기존 노드 입양(§3.3) */
  protected rebuild(): void {
    if (!this.indicator) return;
    if (!this.groupName) this.groupName = this.name || jdUid("jd-sc");
    const existing = this.querySelectorAll<HTMLLabelElement>(
      ":scope > label.jd-segmented-control__seg",
    );
    if (existing.length === this.optionList.length) return;
    for (const seg of existing) seg.remove();
    for (const opt of this.optionList) {
      const seg = document.createElement("label");
      seg.className = "jd-segmented-control__seg";
      const input = document.createElement("input");
      input.type = "radio";
      input.className = "jd-segmented-control__input";
      input.value = opt.value;
      const icon = document.createElement("span");
      icon.className = "jd-segmented-control__icon";
      icon.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "jd-segmented-control__label";
      seg.append(input, icon, text);
      this.append(seg);
    }
  }

  protected override connected(): void {
    this.addEventListener("change", this.onChange);
    this.own(createSizeObserver(this, () => this.measure()));
    this.connectedOnce = true;
    this.measure();
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.onChange);
  }

  protected onChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-segmented-control__input")) return;
    this.value = input.value;
    this.emit("jd-change", { value: input.value });
    this.measure();
  };

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    const name = this.name || this.groupName;
    const segs = this.querySelectorAll<HTMLLabelElement>(
      ":scope > label.jd-segmented-control__seg",
    );
    segs.forEach((seg, i) => {
      const opt = this.optionList[i];
      if (!opt) return;
      const input = seg.querySelector<HTMLInputElement>("input")!;
      input.name = name;
      input.value = opt.value;
      input.checked = opt.value === this.value;
      input.disabled = this.disabled || Boolean(opt.disabled);
      seg.toggleAttribute("data-disabled", input.disabled);
      seg.toggleAttribute("data-selected", input.checked);
      const icon = seg.querySelector<HTMLElement>(".jd-segmented-control__icon");
      if (icon) {
        icon.textContent = opt.icon ?? "";
        icon.hidden = !opt.icon;
      }
      const text = seg.querySelector<HTMLElement>(".jd-segmented-control__label");
      if (text) text.textContent = opt.label;
    });
    if (this.connectedOnce) this.measure();
  }

  /**
   * 선택 세그먼트 위치·너비를 인디케이터에 반영.
   * 레이아웃 읽기 + 인라인 스타일 쓰기라 render 경로에서 호출하지 않는다(§3.1-3).
   */
  protected measure(): void {
    const indicator = this.indicator;
    if (!indicator) return;
    const segs = this.querySelectorAll<HTMLLabelElement>(
      ":scope > label.jd-segmented-control__seg",
    );
    const i = this.optionList.findIndex((o) => o.value === this.value);
    const seg = i >= 0 ? segs[i] : undefined;
    if (!seg || seg.offsetWidth === 0) {
      indicator.hidden = true;
      return;
    }
    indicator.hidden = false;
    indicator.style.width = `${seg.offsetWidth}px`;
    indicator.style.transform = `translateX(${seg.offsetLeft}px)`;
  }
}
