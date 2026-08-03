/**
 * <jd-tag-input> — 태그 입력 (v2 composites/TagInput).
 *
 * 호스트 자체가 컨트롤 박스다(v2 루트 div = flex-wrap 테두리 상자와 동형).
 * 칩 → 입력창 → hidden 필드 순으로 light DOM에 직접 산다.
 *
 * 태그 입력 2경로: `tags` 프로퍼티(string[]) / 자식 `<script type="application/json">`.
 *
 * v2 대비 교정 3건:
 *  1. **폼 참여**: `name`을 주면 태그 수만큼 hidden input을 유지한다 —
 *     FormData에 같은 이름의 반복 항목으로 실린다(§1.6-1 네이티브 위임).
 *     ElementInternals가 필요 없다: light DOM이라 진짜 input이 조상 form에 그냥 낀다.
 *  2. **접근 이름**: 호스트가 role="group"이고 입력창에 aria-label이 붙는다.
 *     v2는 라벨이 아예 없어 스크린리더에 "편집란"으로만 읽혔다.
 *  3. **Backspace 안전**: 조합(IME) 중에는 마지막 태그를 지우지 않는다 —
 *     한글 조합 중 Backspace는 자모 삭제이기 때문(v2는 구분이 없었다).
 *
 * 이벤트: `jd-change`{tags} · `jd-add`{tag} · `jd-remove`{tag} · `jd-input`{value}.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import tagInputStyles from "./tag-input.css.js";

const REMOVE_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdTagInput extends JdElement {
  static override tag = "jd-tag-input";
  static override props = {
    placeholder: { type: String, default: "태그 입력 후 Enter" },
    /** 그룹·입력창 접근 이름 */
    label: { type: String, default: "태그 입력" },
    /** 지정하면 태그마다 hidden input으로 조상 form에 참여 */
    name: { type: String },
    /** 0이면 무제한 (v2 maxTags 미지정과 동형) */
    maxTags: { type: Number, default: 0 },
    /** sm | md | lg */
    size: { type: String, default: "md", reflect: true },
    disabled: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
  };

  declare placeholder: string;
  declare label: string;
  declare name: string;
  declare maxTags: number;
  declare size: string;
  declare disabled: boolean;
  declare error: boolean;

  protected tagList: string[] = [];
  protected renderedKey: string | null = null;
  protected inputEl!: HTMLInputElement;
  protected composing = false;

  get tags(): string[] {
    return this.tagList;
  }
  set tags(v: string[]) {
    this.tagList = Array.isArray(v) ? v.slice() : [];
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(tagInputStyles);
    this.upgradeOwn("tags");
    this.readJsonSlot();
    const existing = this.querySelector<HTMLInputElement>(":scope > input.jd-tag-input__input");
    if (existing) {
      this.inputEl = existing;
    } else {
      this.inputEl = document.createElement("input");
      this.inputEl.type = "text";
      this.inputEl.className = "jd-tag-input__input";
      this.inputEl.autocomplete = "off";
      this.append(this.inputEl);
    }
    this.setAttribute("role", "group");
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
      const parsed = JSON.parse(script.textContent) as string[];
      if (Array.isArray(parsed)) this.tagList = parsed.map(String);
    } catch {
      console.warn("[junds] <jd-tag-input> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.own(
      createKeyHandler(
        this,
        { enter: this.onEnter, backspace: this.onBackspace },
        { enableOnFormTags: true, preventDefault: false },
      ),
    );
    this.addEventListener("click", this.onClick);
    this.inputEl.addEventListener("input", this.onInput);
    this.inputEl.addEventListener("compositionstart", this.onCompositionStart);
    this.inputEl.addEventListener("compositionend", this.onCompositionEnd);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.onClick);
    this.inputEl?.removeEventListener("input", this.onInput);
    this.inputEl?.removeEventListener("compositionstart", this.onCompositionStart);
    this.inputEl?.removeEventListener("compositionend", this.onCompositionEnd);
  }

  /* ── 상태 변경 ─────────────────────────────────────────────────────── */

  get full(): boolean {
    return this.maxTags > 0 && this.tagList.length >= this.maxTags;
  }

  addTag(raw: string): boolean {
    const tag = raw.trim();
    if (!tag || this.disabled) return false;
    if (this.tagList.includes(tag)) return false; // v2 동형 — 중복 무시
    if (this.full) return false;
    this.tagList = [...this.tagList, tag];
    this.inputEl.value = "";
    this.emit("jd-add", { tag });
    this.emit("jd-change", { tags: this.tagList.slice() });
    this.requestUpdate();
    return true;
  }

  removeTag(index: number): void {
    const tag = this.tagList[index];
    if (tag === undefined || this.disabled) return;
    this.tagList = this.tagList.filter((_, i) => i !== index);
    this.emit("jd-remove", { tag });
    this.emit("jd-change", { tags: this.tagList.slice() });
    this.requestUpdate();
  }

  /* ── 이벤트 ────────────────────────────────────────────────────────── */

  protected onClick = (e: MouseEvent): void => {
    const remove = (e.target as Element | null)?.closest<HTMLElement>(".jd-tag-input__remove");
    if (remove) {
      e.stopPropagation();
      const chip = remove.closest<HTMLElement>(".jd-tag-input__tag");
      const chips = Array.from(this.querySelectorAll<HTMLElement>(":scope > .jd-tag-input__tag"));
      const i = chip ? chips.indexOf(chip) : -1;
      if (i >= 0) this.removeTag(i);
      return;
    }
    if (!this.disabled) this.inputEl.focus();
  };

  protected onInput = (): void => {
    this.emit("jd-input", { value: this.inputEl.value });
  };

  protected onCompositionStart = (): void => {
    this.composing = true;
  };

  protected onCompositionEnd = (): void => {
    this.composing = false;
  };

  protected onEnter = (e: KeyboardEvent): void => {
    if (e.target !== this.inputEl || this.composing) return;
    if (!this.inputEl.value) return;
    e.preventDefault(); // form 제출 방지
    this.addTag(this.inputEl.value);
  };

  protected onBackspace = (e: KeyboardEvent): void => {
    if (e.target !== this.inputEl || this.composing) return; // 조합 중엔 자모 삭제
    if (this.inputEl.value) return;
    if (this.tagList.length === 0) return;
    e.preventDefault();
    this.removeTag(this.tagList.length - 1);
  };

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.syncChips();
    this.syncFormFields();
    this.setAttribute("aria-label", this.label);
    this.inputEl.setAttribute("aria-label", this.label);
    this.inputEl.placeholder = this.tagList.length === 0 ? this.placeholder : "";
    this.inputEl.disabled = this.disabled || this.full;
  }

  protected syncChips(): void {
    const key = JSON.stringify(this.tagList);
    if (key !== this.renderedKey) {
      for (const chip of this.querySelectorAll(":scope > .jd-tag-input__tag")) chip.remove();
      for (const tag of this.tagList) this.insertBefore(this.buildChip(tag), this.inputEl);
      this.renderedKey = key;
    }
    const chips = this.querySelectorAll<HTMLElement>(":scope > .jd-tag-input__tag");
    chips.forEach((chip) => {
      const btn = chip.querySelector<HTMLButtonElement>(".jd-tag-input__remove");
      if (btn) btn.hidden = this.disabled; // v2: disabled면 닫기 버튼을 숨긴다
    });
  }

  protected buildChip(tag: string): HTMLElement {
    const chip = document.createElement("span");
    chip.className = "jd-tag-input__tag";
    const label = document.createElement("span");
    label.className = "jd-tag-input__tag-label";
    label.textContent = tag;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-tag-input__remove";
    btn.setAttribute("aria-label", `${tag} 제거`);
    btn.innerHTML = REMOVE_SVG;
    chip.append(label, btn);
    return chip;
  }

  /** 태그 1개 = hidden input 1개 (같은 name의 반복 항목) */
  protected syncFormFields(): void {
    const wanted = this.name ? this.tagList : [];
    const fields = Array.from(
      this.querySelectorAll<HTMLInputElement>(":scope > input.jd-tag-input__field"),
    );
    while (fields.length > wanted.length) fields.pop()!.remove();
    while (fields.length < wanted.length) {
      const f = document.createElement("input");
      f.type = "hidden";
      f.className = "jd-tag-input__field";
      this.append(f);
      fields.push(f);
    }
    fields.forEach((f, i) => {
      f.name = this.name;
      f.value = wanted[i]!;
      f.disabled = this.disabled;
    });
  }

  override focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
  }
}
