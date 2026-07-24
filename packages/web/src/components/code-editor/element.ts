/**
 * <jd-code-editor> — 코드 입력면 (v2 composites/CodeEditor) = **jd-textarea 파생**(§6 R12).
 *
 * v2 CodeEditor는 Textarea가 이미 갖고 있던 것(값 미러링·placeholder·disabled·name·
 * 폼 참여·IME 안전 되쓰기·focus 위임)을 통째로 다시 구현했다. v3는 그 전부를
 * `JdTextarea` 상속으로 공짜로 받고 **코드 편집기에만 있는 것 다섯**만 더한다:
 *   1) 언어 머리띠  2) 줄 번호 여백  3) Tab 들여쓰기  4) 어두운 코드면  5) readonly.
 *
 * 골격을 **grid 3칸**으로 짠 것이 핵심이다. v2처럼 textarea를 div로 감싸면 부모의
 * 입양 셀렉터(`:scope > textarea.jd-textarea__input`)가 빗나가 업그레이드 때마다
 * textarea가 하나 더 생긴다(§3.3 위반). 머리띠·여백·textarea를 전부 호스트의 직계
 * 자식으로 두고 grid-template으로 배치하면 상속과 입양이 동시에 성립한다.
 *
 * v2 대비 실질 개선 5건:
 *  1. **Tab 감금을 풀었다.** v2는 Tab을 무조건 preventDefault해서 키보드만 쓰는 사용자가
 *     편집기에 들어가면 **빠져나올 수 없었다**(WCAG 2.1.2 위반). v3는 Esc를 누르면 다음
 *     Tab이 포커스를 넘긴다(CodeMirror·Monaco의 표준 탈출구). 그 사용법은
 *     aria-describedby로 연결된 숨은 안내문이 알려준다.
 *  2. **줄 번호가 실제로 맞는다.** v2는 textarea가 줄바꿈(soft wrap)되는데 여백은 논리
 *     줄만 세어, 긴 줄이 하나라도 있으면 그 아래 번호가 전부 밀렸다. v3는 `wrap="off"`로
 *     가로 스크롤을 택해 번호와 줄이 1:1로 고정된다.
 *  3. **여백이 같이 스크롤된다.** v2는 코드가 세로로 넘칠 때 번호가 그 자리에 멈춰 있었다
 *     → textarea의 scroll을 여백에 동기화한다.
 *  4. **블록 들여쓰기/내어쓰기.** 여러 줄을 선택한 Tab은 전 줄을 들여쓰고 Shift+Tab은
 *     내어쓴다. v2는 선택 영역을 공백 2칸으로 **덮어썼다**(선택한 코드가 사라졌다).
 *  5. **선언적 초기값.** `<jd-code-editor>const a = 1;</jd-code-editor>`처럼 children으로
 *     초기 코드를 줄 수 있다(HTML 들여쓰기는 공통 접두만큼 벗겨낸다). v2는 value 프롭 전용.
 *
 * 표면 주의: `lineNumbers`(v2 기본 true)는 attribute로 표현할 수 없어(존재=값, §1.3)
 * 반전 플래그 `hide-line-numbers`로 낸다 — jd-clock의 `hide-seconds`와 같은 판단이다.
 */
import { JdTextarea } from "../textarea/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import codeEditorStyles from "./code-editor.css.js";

const HINT_TEXT =
  "Tab 키로 들여쓰기, Shift+Tab으로 내어쓰기합니다. Esc를 누른 뒤 Tab을 누르면 편집기를 빠져나갑니다.";

/** children으로 받은 초기 코드에서 HTML 들여쓰기(공통 접두 공백)를 벗긴다 */
function dedent(raw: string): string {
  const lines = raw.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
  let indent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = /^[ \t]*/.exec(line);
    indent = Math.min(indent, m?.[0]?.length ?? 0);
  }
  if (!Number.isFinite(indent) || indent === 0) return lines.join("\n");
  return lines.map((l) => l.slice(indent)).join("\n");
}

export class JdCodeEditor extends JdTextarea {
  static override tag = "jd-code-editor";
  static override props = {
    ...JdTextarea.props,
    /** 머리띠에 표시할 언어 라벨. 비면 머리띠 자체가 없다 */
    language: { type: String, reflect: true },
    /** v2 lineNumbers=true의 반전 플래그. 켜면 줄 번호를 숨긴다 */
    hideLineNumbers: { type: Boolean, reflect: true }, // attr: hide-line-numbers
    /** 편집면 최소 높이(px). v2 기본 200 */
    minHeight: { type: Number, default: 200 },
    /** 들여쓰기 폭(공백 수). v2는 2칸 고정이었다 */
    tabSize: { type: Number, default: 2 },
    /** 네이티브 표기 계승(jd-textarea maxlength 선례) */
    readOnly: { type: Boolean, reflect: true, attribute: "readonly" },
    /** 접근 이름. 비면 언어를 섞어 자동 생성한다 */
    label: { type: String },
  };

  declare language: string;
  declare hideLineNumbers: boolean;
  declare minHeight: number;
  declare tabSize: number;
  declare readOnly: boolean;
  declare label: string;

  #header: HTMLDivElement | null = null;
  #languageEl: HTMLSpanElement | null = null;
  #gutter: HTMLDivElement | null = null;
  #hint: HTMLParagraphElement | null = null;
  #input: HTMLTextAreaElement | null = null;
  /** Esc로 Tab 감금이 풀린 상태 — 다음 Tab은 포커스를 넘긴다 */
  #released = false;
  #offScroll: (() => void) | null = null;

  protected override render(): void {
    adoptStyles(codeEditorStyles);
    const adopted = this.querySelector(":scope > textarea.jd-textarea__input") !== null;
    if (!adopted) {
      // children은 선언적 초기 코드다. value가 이기고, 없으면 children이 초기값이 된다
      const seed = dedent(this.textContent ?? "");
      this.replaceChildren();
      if (!this.value && seed) this.value = seed;
    }
    this.#ensureParts();
    // 부모가 textarea·글자수 배지를 만들거나 입양하고 update()까지 부른다.
    // 머리띠·여백을 먼저 붙여 두었으므로 grid 자동 배치 순서가 항상 같다.
    super.render();
  }

  /** 머리띠·여백·안내문은 전부 호스트의 직계 자식 — 부모의 입양 셀렉터를 가리지 않는다 */
  #ensureParts(): void {
    const doc = this.ownerDocument;
    this.#header = this.querySelector<HTMLDivElement>(":scope > .jd-code-editor__header");
    if (!this.#header) {
      this.#header = doc.createElement("div");
      this.#header.className = "jd-code-editor__header";
      this.#languageEl = doc.createElement("span");
      this.#languageEl.className = "jd-code-editor__language";
      this.#header.append(this.#languageEl);
      this.append(this.#header);
    } else {
      this.#languageEl = this.#header.querySelector<HTMLSpanElement>(".jd-code-editor__language");
    }

    this.#gutter = this.querySelector<HTMLDivElement>(":scope > .jd-code-editor__gutter");
    if (!this.#gutter) {
      this.#gutter = doc.createElement("div");
      this.#gutter.className = "jd-code-editor__gutter";
      // 번호는 장식이다 — 낭독기는 코드 본문만 읽으면 된다
      this.#gutter.setAttribute("aria-hidden", "true");
      this.append(this.#gutter);
    }

    this.#hint = this.querySelector<HTMLParagraphElement>(":scope > .jd-code-editor__hint");
    if (!this.#hint) {
      this.#hint = doc.createElement("p");
      this.#hint.className = "jd-code-editor__hint";
      this.#hint.id = jdUid("jd-code-editor-hint");
      this.#hint.textContent = HINT_TEXT;
      this.append(this.#hint);
    }
  }

  protected override connected(): void {
    super.connected();
    this.#input = this.querySelector<HTMLTextAreaElement>(":scope > textarea.jd-textarea__input");
    const input = this.#input;
    if (!input) return;
    input.addEventListener("keydown", this.#onKeyDown);
    input.addEventListener("blur", this.#onBlur);
    // 세로 스크롤 동기화 — 번호가 코드를 따라 움직인다
    const onScroll = (): void => {
      if (this.#gutter) this.#gutter.scrollTop = input.scrollTop;
    };
    input.addEventListener("scroll", onScroll, { passive: true });
    this.#offScroll = () => input.removeEventListener("scroll", onScroll);
  }

  protected override disconnected(): void {
    super.disconnected();
    this.#input?.removeEventListener("keydown", this.#onKeyDown);
    this.#input?.removeEventListener("blur", this.#onBlur);
    this.#offScroll?.();
    this.#offScroll = null;
    this.#released = false;
  }

  protected override update(): void {
    super.update(); // 값·placeholder·disabled·name·글자수까지 부모가 처리
    const input =
      this.#input ??
      this.querySelector<HTMLTextAreaElement>(":scope > textarea.jd-textarea__input");
    if (!input) return;
    this.#input = input;

    input.readOnly = this.readOnly;
    input.spellcheck = false;
    input.autocapitalize = "off";
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocomplete", "off");
    // 줄바꿈을 끄는 것이 줄 번호 정합의 전제다(§개선 2)
    input.wrap = "off";
    input.setAttribute("aria-label", this.#accessibleName());
    if (this.#hint) input.setAttribute("aria-describedby", this.#hint.id);

    const tab = this.#tab;
    this.style.setProperty("--jd-code-editor-tab-size", String(tab));
    this.style.setProperty("--jd-code-editor-min-height", `${Math.max(0, this.minHeight)}px`);

    if (this.#languageEl) this.#languageEl.textContent = this.language;
    if (this.#header) this.#header.hidden = !this.language;

    const showNumbers = !this.hideLineNumbers;
    if (this.#gutter) {
      this.#gutter.hidden = !showNumbers;
      if (showNumbers) this.#paintGutter(this.value.split("\n").length);
    }
  }

  /** 1 이상 8 이하 정수 — 0이나 음수가 들어와도 편집이 멈추지 않게 */
  get #tab(): number {
    const n = Math.trunc(this.tabSize);
    return Number.isFinite(n) ? Math.min(8, Math.max(1, n)) : 2;
  }

  #accessibleName(): string {
    if (this.label) return this.label;
    return this.language ? `${this.language} 코드 편집기` : "코드 편집기";
  }

  /** 번호 칸은 인덱스로 재사용한다 — 타이핑 한 글자에 DOM이 통째로 갈리지 않는다 */
  #paintGutter(count: number): void {
    const gutter = this.#gutter;
    if (!gutter) return;
    const kids = gutter.children;
    for (let i = 0; i < count; i++) {
      let row = kids.item(i);
      if (!row) {
        row = this.ownerDocument.createElement("span");
        row.className = "jd-code-editor__line";
        gutter.append(row);
      }
      const n = String(i + 1);
      if (row.textContent !== n) row.textContent = n;
    }
    while (kids.length > count) {
      const last = kids.item(kids.length - 1);
      if (!last) break;
      last.remove();
    }
  }

  #onBlur = (): void => {
    this.#released = false;
  };

  #onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      // 감금 해제 — preventDefault는 하지 않는다(모달 닫기 등 바깥 의미를 막지 않게)
      this.#released = true;
      return;
    }
    if (e.key !== "Tab") {
      this.#released = false;
      return;
    }
    if (this.#released) {
      this.#released = false;
      return; // 브라우저 기본 포커스 이동 — 편집기를 빠져나간다
    }
    const input = this.#input;
    if (!input || input.readOnly || input.disabled) return;
    e.preventDefault();
    if (e.shiftKey) this.#outdent(input);
    else this.#indent(input);
  };

  #indent(input: HTMLTextAreaElement): void {
    const pad = " ".repeat(this.#tab);
    const { selectionStart: start, selectionEnd: end, value } = input;
    if (start === end || !value.slice(start, end).includes("\n")) {
      this.#apply(input, value.slice(0, start) + pad + value.slice(end), start + pad.length);
      return;
    }
    const from = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(from, end);
    const next = block.replace(/^/gm, pad);
    this.#apply(
      input,
      value.slice(0, from) + next + value.slice(end),
      from + pad.length,
      from + next.length,
    );
  }

  #outdent(input: HTMLTextAreaElement): void {
    const size = this.#tab;
    const { selectionStart: start, selectionEnd: end, value } = input;
    const from = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(from, Math.max(end, start));
    let firstCut = 0;
    let cut = 0;
    const next = block.replace(/^[ \t]+/gm, (ws, offset: number) => {
      const keep = ws.startsWith("\t") ? ws.slice(1) : ws.slice(0, Math.max(0, ws.length - size));
      const removed = ws.length - keep.length;
      cut += removed;
      if (offset === 0) firstCut = removed;
      return keep;
    });
    if (cut === 0) return;
    this.#apply(
      input,
      value.slice(0, from) + next + value.slice(Math.max(end, start)),
      Math.max(from, start - firstCut),
      Math.max(from, end - cut),
    );
  }

  /**
   * 값 갱신 + 캐럿 복원 + 이벤트 발행을 한 곳에서. 네이티브 input 이벤트는 프로그램
   * 대입으로는 발생하지 않으므로 jd-input을 직접 낸다(§1.5 정규화 detail).
   */
  #apply(input: HTMLTextAreaElement, next: string, start: number, end = start): void {
    input.value = next;
    input.setSelectionRange(start, end);
    this.value = next;
    this.emit("jd-input", { value: next });
  }
}
