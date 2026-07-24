/**
 * <jd-rich-text-editor> — contentEditable 기반 리치 텍스트 편집기
 * (v2 patterns/RichTextEditor). text-field와 같은 "네이티브 위임" 계열이다 —
 * 편집 표면은 브라우저 contentEditable이 갖고, 요소는 툴바·값 미러링·상태만 얹는다.
 *
 * `value`는 HTML 문자열이다. attribute로도 초기값을 받되(선언적 초기화), 타이핑 중에는
 * innerHTML을 되쓰지 않는다 — 현재 편집 내용과 다를 때만 반영해 캐럿이 튀지 않게 한다.
 *
 * v2 대비 교정(구조·접근성):
 *  1. **툴바에 role이 없었다.** 버튼 나열뿐이라 "서식 도구 모음"이 AT에 없었다.
 *     v3는 role=toolbar + 각 버튼 aria-pressed(선택 서식 상태를 selectionchange로 동기화).
 *  2. **편집 영역에 이름이 없었다.** v3는 role=textbox·aria-multiline·aria-label·
 *     aria-placeholder.
 *  3. `document.execCommand`는 표준에서 폐지 예정이지만 크로스브라우저 contentEditable
 *     서식의 유일한 현실 경로다(v2와 동일 채택). 미지원 환경(SSR·happy-dom)에서 터지지
 *     않도록 전부 존재 검사로 감싼다.
 *
 * 이벤트(§1.5): `jd-change` {html} — 내용 변경(v2 onChange).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import richTextEditorStyles from "./rich-text-editor.css.js";

interface ToolDef {
  cmd: string;
  arg?: string;
  icon: string;
  label: string;
  /** 버튼 글리프에 입힐 서식(굵게 버튼은 굵게 등) */
  style?: string;
}

/** v2 tools 배열 — 아이콘 글리프·명령·라벨 동일 */
const TOOLS: readonly ToolDef[] = [
  { cmd: "bold", icon: "B", label: "굵게", style: "bold" },
  { cmd: "italic", icon: "I", label: "기울임", style: "italic" },
  { cmd: "underline", icon: "U", label: "밑줄", style: "underline" },
  { cmd: "strikeThrough", icon: "S", label: "취소선", style: "strike" },
  { cmd: "insertUnorderedList", icon: "•", label: "목록" },
  { cmd: "insertOrderedList", icon: "1.", label: "번호 목록" },
  { cmd: "formatBlock", arg: "h2", icon: "H", label: "제목" },
];

/** 빈 값 판정 — v2와 동일(빈 문자열·`<br>`·`<div><br></div>`) */
function isEmptyHtml(v: string): boolean {
  return !v || v === "<br>" || v === "<div><br></div>";
}

export class JdRichTextEditor extends JdElement {
  static override tag = "jd-rich-text-editor";
  static override props = {
    value: { type: String },
    placeholder: { type: String, default: "내용을 입력하세요..." },
    minHeight: { type: Number, default: 150 }, // attr: min-height
    disabled: { type: Boolean, reflect: true },
    /** 편집 영역 접근 이름 */
    label: { type: String, default: "리치 텍스트 편집기" },
  };

  declare value: string;
  declare placeholder: string;
  declare minHeight: number;
  declare disabled: boolean;
  declare label: string;

  #toolbar!: HTMLElement;
  #editor!: HTMLElement;
  #offSelection: (() => void) | null = null;

  protected render(): void {
    adoptStyles(richTextEditorStyles);

    let toolbar = this.querySelector<HTMLElement>(":scope > .jd-rte__toolbar");
    let editor = this.querySelector<HTMLElement>(":scope > .jd-rte__editor");
    if (toolbar && editor) {
      this.#toolbar = toolbar;
      this.#editor = editor;
    } else {
      toolbar = document.createElement("div");
      toolbar.className = "jd-rte__toolbar";
      toolbar.setAttribute("role", "toolbar");
      toolbar.setAttribute("aria-label", "서식 도구 모음");
      for (const t of TOOLS) toolbar.append(this.#buildTool(t));

      editor = document.createElement("div");
      editor.className = "jd-rte__editor";
      editor.setAttribute("role", "textbox");
      editor.setAttribute("aria-multiline", "true");

      this.#toolbar = toolbar;
      this.#editor = editor;
      this.append(toolbar, editor);
    }
    this.update();
  }

  #buildTool(t: ToolDef): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-rte__tool";
    if (t.style) b.dataset.style = t.style;
    b.dataset.cmd = t.cmd;
    if (t.arg) b.dataset.arg = t.arg;
    b.title = t.label;
    b.setAttribute("aria-label", t.label);
    b.setAttribute("aria-pressed", "false");
    b.textContent = t.icon;
    // mousedown에서 실행 — 클릭 전에 편집 영역의 선택이 날아가지 않게(v2 동형)
    b.addEventListener("mousedown", this.#onToolDown);
    return b;
  }

  protected override connected(): void {
    this.#editor.addEventListener("input", this.#onInput);
    this.#editor.addEventListener("focus", this.#onFocus);
    this.#editor.addEventListener("blur", this.#onBlur);
  }

  protected override disconnected(): void {
    this.#editor?.removeEventListener("input", this.#onInput);
    this.#editor?.removeEventListener("focus", this.#onFocus);
    this.#editor?.removeEventListener("blur", this.#onBlur);
    this.#offSelection?.();
    this.#offSelection = null;
  }

  protected override update(): void {
    const disabled = this.disabled;
    this.#editor.contentEditable = disabled ? "false" : "true";
    this.#editor.setAttribute("aria-label", this.label);
    this.#editor.setAttribute("aria-placeholder", this.placeholder);
    this.#editor.dataset.placeholder = this.placeholder;
    this.#editor.style.minHeight = `${Math.max(0, this.minHeight)}px`;
    this.toggleAttribute("data-disabled", disabled);
    for (const b of this.#toolbar.querySelectorAll("button")) b.disabled = disabled;

    // 값 반영 — 편집 중 캐럿 튐 방지로 실제로 다를 때만 되쓴다
    const next = this.value || "";
    if (this.#editor.innerHTML !== next) this.#editor.innerHTML = next;
    this.toggleAttribute("data-empty", isEmptyHtml(this.#editor.innerHTML));
  }

  /* ── 편집 ─────────────────────────────────────────────────────────── */

  #onInput = (): void => {
    const html = this.#editor.innerHTML;
    // 프로퍼티는 갱신하되 update()의 되쓰기를 유발하지 않는다(값이 이미 같다)
    this.value = html;
    this.toggleAttribute("data-empty", isEmptyHtml(html));
    this.emit("jd-change", { html });
  };

  #onFocus = (): void => {
    this.toggleAttribute("data-focused", true);
    // 선택 서식 상태는 포커스 동안만 추적한다
    this.#offSelection?.();
    this.#offSelection = on(this.ownerDocument, "selectionchange", this.#syncToolStates);
    this.#syncToolStates();
  };

  #onBlur = (): void => {
    this.toggleAttribute("data-focused", false);
    this.#offSelection?.();
    this.#offSelection = null;
  };

  #onToolDown = (e: MouseEvent): void => {
    e.preventDefault(); // 편집 영역 선택 유지
    if (this.disabled) return;
    const b = e.currentTarget as HTMLButtonElement;
    this.#exec(b.dataset.cmd!, b.dataset.arg);
  };

  #exec(cmd: string, arg?: string): void {
    const doc = this.ownerDocument as Document & {
      execCommand?: (c: string, ui: boolean, v?: string) => boolean;
    };
    this.#editor.focus();
    try {
      doc.execCommand?.(cmd, false, arg ? `<${arg}>` : undefined);
    } catch {
      /* 미지원 환경 — 무동작 */
    }
    const html = this.#editor.innerHTML;
    this.value = html;
    this.toggleAttribute("data-empty", isEmptyHtml(html));
    this.#syncToolStates();
    this.emit("jd-change", { html });
  }

  /** 커서 위치의 서식 상태 → 버튼 aria-pressed. 미지원 환경은 조용히 건너뛴다 */
  #syncToolStates = (): void => {
    const doc = this.ownerDocument as Document & {
      queryCommandState?: (c: string) => boolean;
      queryCommandValue?: (c: string) => string;
    };
    if (!doc.queryCommandState) return;
    for (const b of this.#toolbar.querySelectorAll<HTMLButtonElement>("button")) {
      const cmd = b.dataset.cmd!;
      let active = false;
      try {
        if (cmd === "formatBlock") {
          const v = (doc.queryCommandValue?.("formatBlock") || "").toLowerCase();
          active = v === (b.dataset.arg || "");
        } else {
          active = doc.queryCommandState(cmd);
        }
      } catch {
        active = false;
      }
      b.setAttribute("aria-pressed", String(active));
    }
  };
}
