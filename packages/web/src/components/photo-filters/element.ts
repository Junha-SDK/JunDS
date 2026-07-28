/**
 * <jd-photo-filters> — 필터 프리셋 스트립 (v2 composites/PhotoFilters).
 * 썸네일 미리보기 + 라벨을 가로로 흘리고, 고른 프리셋의 CSS filter 식을 통지한다.
 *
 * a11y — v2 대비 상위집합: v2는 `<div role="radiogroup">` 안에 `<button role="radio">`
 * n개였다. 역할만 흉내 낸 버튼이라 **화살표 순회가 없고 n개가 전부 탭 순서에 들어갔으며**
 * 폼에도 참여하지 못했다. v3는 안쪽이 진짜 radio다(§1.6-1 · DEC-023-3 · jd-star-rating·
 * jd-filter-button-group 선례) — 시각은 그대로, 단일 탭스톱·화살표 순회·선택 상태 노출·
 * 폼 참여가 브라우저 기본으로 붙는다.
 *
 * jd-filter-button-group을 상속하지 않은 이유: 기반의 항목 골격이 라벨+카운트로 고정된
 * private 메서드(#buildItem/#rebuild)라 썸네일 `<img>`를 끼워 넣을 자리가 없다. 옵션 키
 * 이름도 다르다(key vs id). 기반을 손보려면 배정 밖 디렉터리를 고쳐야 해서 독립 구현했다
 * — 기반이 radio-group을 상속하지 않은 것과 같은 판단이다.
 *
 * 프리셋 입력 2경로(§1.3): `filters` 프로퍼티 또는 자식 `<script type="application/json">`.
 * 아무것도 주지 않으면 v2 defaultPhotoFilters 7종이 그대로 쓰인다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import photoFiltersStyles from "./photo-filters.css.js";

export interface JdPhotoFilter {
  id: string;
  label: string;
  /** CSS filter 표현식 (예: "grayscale(1)") */
  filter: string;
}

/** v2 ds/composites/PhotoFilters의 defaultPhotoFilters 그대로 */
export const DEFAULT_PHOTO_FILTERS: readonly JdPhotoFilter[] = [
  { id: "none", label: "원본", filter: "none" },
  { id: "vivid", label: "선명", filter: "saturate(1.4) contrast(1.1)" },
  { id: "warm", label: "따뜻", filter: "sepia(0.2) saturate(1.2) hue-rotate(-10deg)" },
  { id: "cool", label: "차가움", filter: "hue-rotate(15deg) saturate(0.9)" },
  { id: "noir", label: "흑백", filter: "grayscale(1) contrast(1.15)" },
  { id: "fade", label: "페이드", filter: "saturate(0.7) brightness(1.05) contrast(0.95)" },
  { id: "vintage", label: "빈티지", filter: "sepia(0.5) saturate(1.1) brightness(0.95)" },
];

export class JdPhotoFilters extends JdElement {
  static override tag = "jd-photo-filters";
  static override props = {
    /** 썸네일 원본 (v2 previewSrc) */
    previewSrc: { type: String }, // attr: preview-src
    /** 선택된 프리셋 id (v2 activeId) */
    value: { type: String, reflect: true },
    /** radio 묶음 이름 — 미지정이면 문서 유일 이름을 발급한다 */
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
    /** 그룹 접근 이름 — role=radiogroup에는 이름이 있어야 한다 */
    label: { type: String, default: "사진 필터" },
  };

  declare previewSrc: string;
  declare value: string;
  declare name: string;
  declare disabled: boolean;
  declare label: string;

  #filters: JdPhotoFilter[] = [...DEFAULT_PHOTO_FILTERS];
  #items: HTMLLabelElement[] = [];
  #groupName = "";

  get filters(): JdPhotoFilter[] {
    return this.#filters;
  }
  set filters(v: JdPhotoFilter[]) {
    this.#filters = Array.isArray(v) && v.length > 0 ? v : [...DEFAULT_PHOTO_FILTERS];
    this.#rebuild();
    this.requestUpdate();
  }

  /** 지금 고른 프리셋의 CSS filter 식 — 소비자가 원본 이미지에 그대로 바르면 된다 */
  get activeFilter(): string {
    return this.#filters.find((f) => f.id === this.value)?.filter ?? "none";
  }

  protected render(): void {
    adoptStyles(photoFiltersStyles);
    this.#readJson();
    this.setAttribute("role", "radiogroup");
    this.#rebuild();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdPhotoFilter[];
      if (Array.isArray(parsed) && parsed.length > 0) this.#filters = parsed;
    } catch {
      console.warn("[junds] <jd-photo-filters> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 입양(§3.3): 개수가 같으면 골격 재사용, 다르면 재구축 */
  #rebuild(): void {
    if (!this.#groupName) this.#groupName = this.name || jdUid("jd-pf");
    const existing = Array.from(
      this.querySelectorAll<HTMLLabelElement>(":scope > label.jd-photo-filters__item"),
    );
    if (existing.length === this.#filters.length) {
      this.#items = existing;
      return;
    }
    for (const el of existing) el.remove();
    this.#items = this.#filters.map(() => {
      const item = this.#buildItem();
      this.append(item);
      return item;
    });
  }

  #buildItem(): HTMLLabelElement {
    const item = document.createElement("label");
    item.className = "jd-photo-filters__item";
    const input = document.createElement("input");
    input.type = "radio";
    input.className = "jd-photo-filters__input";
    const thumb = document.createElement("span");
    thumb.className = "jd-photo-filters__thumb";
    const img = document.createElement("img");
    img.className = "jd-photo-filters__img";
    // 썸네일은 장식이다 — 이름은 옆 라벨 텍스트가 준다(v2 alt="" 동형)
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    thumb.append(img);
    const label = document.createElement("span");
    label.className = "jd-photo-filters__label";
    item.append(input, thumb, label);
    return item;
  }

  protected override connected(): void {
    this.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.#onChange);
  }

  #onChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-photo-filters__input")) return;
    this.value = input.value;
    const filter = this.#filters.find((f) => f.id === input.value)?.filter ?? "none";
    // detail.value가 정본, id는 v2 onChange(id) 표면과의 이름 다리
    this.emit("jd-change", { value: input.value, id: input.value, filter });
  };

  protected override update(): void {
    if (this.#items.length !== this.#filters.length) this.#rebuild();
    const name = this.name || this.#groupName;
    this.setAttribute("aria-label", this.label);

    this.#items.forEach((item, i) => {
      const preset = this.#filters[i];
      if (!preset) return;
      const input = item.querySelector<HTMLInputElement>(".jd-photo-filters__input")!;
      const img = item.querySelector<HTMLImageElement>(".jd-photo-filters__img")!;
      const label = item.querySelector<HTMLElement>(".jd-photo-filters__label")!;
      const active = preset.id === this.value;
      input.name = name;
      input.value = preset.id;
      input.checked = active;
      input.disabled = this.disabled;
      if (this.previewSrc) img.src = this.previewSrc;
      else img.removeAttribute("src");
      // 프리셋 식은 데이터라 CSS 규칙으로 낼 수 없다 — 인라인이 유일한 자리
      img.style.filter = preset.filter;
      label.textContent = preset.label;
      item.toggleAttribute("data-active", active);
      item.toggleAttribute("data-disabled", input.disabled);
    });
  }
}
