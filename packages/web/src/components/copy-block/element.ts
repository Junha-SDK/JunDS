/**
 * <jd-copy-block> — 복사 버튼이 달린 코드 블록 (v2 composites/CopyBlock).
 *
 * 코드 입력 2경로: `code` 프로퍼티/attribute, 또는 children 텍스트(선언적 사용 —
 * `<jd-copy-block language="bash">npm i @junds/web</jd-copy-block>`). children은
 * 최초 render에서 1회 흡수하며 HTML 들여쓰기를 공통 제거(dedent)한다.
 * 복사는 behaviors/document의 `copyText`를 쓴다 — 클립보드 접근을 재구현하지 않는다.
 *
 * v2 대비 교정 5건:
 *  1. **복사 버튼이 키보드 사용자에게 보이지 않았다.** `opacity-0 group-hover:opacity-100`
 *     뿐이라 포커스는 가는데 화면에는 없었다(hover 없는 터치기기에서도 마찬가지).
 *     v3는 `:focus-within`과 `@media (hover: none)`을 함께 건다.
 *  2. **복사 결과가 AT에 전달되지 않았다.** 아이콘만 바뀌었다. v3는 role=status
 *     라이브 리전으로 "복사됨"을 알린다.
 *  3. **줄 번호가 DOM 텍스트였다.** 스크린리더가 매 줄 번호를 읽고, 드래그 복사에도
 *     섞여 들어갔다. v3는 CSS 카운터 — 접근성 트리에도 클립보드에도 없다.
 *  4. **가로 스크롤 영역에 키보드로 갈 수 없었다.** WCAG 2.1.1 위반이다 —
 *     v3는 `<pre>`에 tabindex=0 + 접근 이름을 준다.
 *  5. **`navigator.clipboard` 거부가 unhandled rejection이었다.** v3는 실패 시
 *     `jd-error`를 발행한다(CopyButton과 같은 규약).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { copyText } from "../../behaviors/document.js";
import copyBlockStyles from "./copy-block.css.js";

const COPY_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" stroke-width="1.5"/></svg>`;
const DONE_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3 7l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** HTML 안에 들여쓴 채로 쓴 코드에서 공통 선행 공백을 제거한다 (결정적 — §3.1-3) */
function dedent(raw: string): string {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length && !lines[0]!.trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1]!.trim()) lines.pop();
  let indent = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    indent = Math.min(indent, /^[ \t]*/.exec(line)![0].length);
  }
  if (!Number.isFinite(indent) || indent === 0) return lines.join("\n");
  return lines.map((l) => l.slice(indent)).join("\n");
}

export class JdCopyBlock extends JdElement {
  static override tag = "jd-copy-block";
  static override props = {
    /** 표시·복사할 코드. 비면 최초 children 텍스트를 쓴다 */
    code: { type: String },
    /** 언어 라벨 — 있으면 머리글 줄이 생긴다 */
    language: { type: String, reflect: true },
    /** 줄 번호 표시 (attr: show-line-numbers) */
    showLineNumbers: { type: Boolean, reflect: true },
    /** 복사 버튼 접근 이름 */
    copyLabel: { type: String, default: "코드 복사" },
    copiedLabel: { type: String, default: "복사됨" },
    /** 복사 완료 표시 상태 — 2초 후 자동 해제 */
    copied: { type: Boolean, reflect: true },
  };

  declare code: string;
  declare language: string;
  declare showLineNumbers: boolean;
  declare copyLabel: string;
  declare copiedLabel: string;
  declare copied: boolean;

  #head!: HTMLElement;
  #lang!: HTMLElement;
  #pre!: HTMLPreElement;
  #code!: HTMLElement;
  #btn!: HTMLButtonElement;
  #icon!: HTMLElement;
  #status!: HTMLElement;
  #fallback = "";
  #painted: string | null = null;
  #timer = 0;

  protected render(): void {
    adoptStyles(copyBlockStyles);
    // 입양(§3.3)
    const found = this.querySelector<HTMLPreElement>(":scope > pre.jd-copy-block__pre");
    if (found) {
      this.#pre = found;
      this.#head = this.querySelector(".jd-copy-block__head")!;
      this.#lang = this.querySelector(".jd-copy-block__lang")!;
      this.#code = this.querySelector(".jd-copy-block__code")!;
      this.#btn = this.querySelector(".jd-copy-block__copy")!;
      this.#icon = this.querySelector(".jd-copy-block__icon")!;
      this.#status = this.querySelector(".jd-copy-block__status")!;
      // 줄이 span으로 쪼개져 있어 textContent는 개행을 잃는다 — 줄 단위로 되짚는다
      const painted = Array.from(
        this.#code.querySelectorAll<HTMLElement>(":scope > .jd-copy-block__line"),
      ).map((el) => el.textContent ?? "");
      this.#fallback = painted.length ? painted.join("\n") : (this.#code.textContent ?? "");
      this.#painted = this.#fallback;
      this.update();
      return;
    }

    // 선언적 사용: children 텍스트를 코드 원본으로 1회 흡수
    this.#fallback = dedent(this.textContent ?? "");
    this.textContent = "";

    this.#lang = document.createElement("span");
    this.#lang.className = "jd-copy-block__lang";
    this.#head = document.createElement("div");
    this.#head.className = "jd-copy-block__head";
    this.#head.append(this.#lang);

    this.#code = document.createElement("code");
    this.#code.className = "jd-copy-block__code";
    this.#pre = document.createElement("pre");
    this.#pre.className = "jd-copy-block__pre";
    // 가로 스크롤 영역은 키보드로 도달 가능해야 한다 (WCAG 2.1.1)
    this.#pre.tabIndex = 0;
    this.#pre.append(this.#code);

    this.#icon = document.createElement("span");
    this.#icon.className = "jd-copy-block__icon";
    this.#btn = document.createElement("button");
    this.#btn.type = "button";
    this.#btn.className = "jd-copy-block__copy";
    this.#btn.append(this.#icon);

    this.#status = document.createElement("span");
    this.#status.className = "jd-copy-block__status";
    this.#status.setAttribute("role", "status");
    this.#status.setAttribute("aria-live", "polite");

    this.append(this.#head, this.#pre, this.#btn, this.#status);
    this.update();
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = 0;
  }

  #onClick = (): void => {
    void this.copy();
  };

  /** 현재 코드 원본 — `code` 프롭이 비면 흡수한 children 텍스트 */
  get source(): string {
    return this.code || this.#fallback;
  }

  /** 명령형 API — 외부에서 직접 복사시킬 수 있다 */
  async copy(): Promise<boolean> {
    const ok = await copyText(this.source);
    if (!ok) {
      this.emit("jd-error", { text: this.source });
      return false;
    }
    this.copied = true;
    this.emit("jd-copy", { text: this.source });
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.#timer = 0;
      this.copied = false; // 떼어낸 노드는 건드리지 않는다 — disconnected가 타이머를 회수
    }, 2000) as unknown as number;
    return true;
  }

  protected override update(): void {
    this.#lang.textContent = this.language;
    this.#head.hidden = !this.language;

    const src = this.source;
    if (this.#painted !== src) {
      this.#painted = src;
      this.#code.textContent = "";
      for (const line of src.split("\n")) {
        const el = document.createElement("span");
        el.className = "jd-copy-block__line";
        el.textContent = line;
        this.#code.append(el);
      }
    }
    this.#pre.setAttribute("aria-label", this.language ? `${this.language} 코드` : "코드");

    this.#icon.innerHTML = this.copied ? DONE_SVG : COPY_SVG;
    // 접근 이름은 고정한다 — 결과는 라이브 리전이 알린다. 이름까지 "복사됨"으로
    // 바꾸면 같은 말이 두 번 읽히고, 버튼이 무엇을 하는 버튼인지도 흐려진다.
    this.#btn.setAttribute("aria-label", this.copyLabel);
    this.#btn.title = this.copyLabel;
    this.#status.textContent = this.copied ? this.copiedLabel : "";
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
