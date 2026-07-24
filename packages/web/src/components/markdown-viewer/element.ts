/**
 * <jd-markdown-viewer> — 최소 마크다운 렌더러 (v2 composites/MarkdownViewer).
 *
 * 원문 2경로: `content` 프로퍼티/attribute, 또는 children 텍스트(선언적 사용 —
 * HTML 들여쓰기는 공통 제거한다). 파싱은 순수 함수라 render가 결정적이다(§3.1-3).
 *
 * v2 대비 교정 5건 — 앞의 둘은 보안 결함이다:
 *  1. **XSS.** v2는 원문을 이스케이프 없이 `dangerouslySetInnerHTML`에 넣었다.
 *     사용자·API가 만든 마크다운에 `<img onerror=…>`가 있으면 그대로 실행된다.
 *     v3는 **먼저 전량 이스케이프**하고, 우리가 만든 태그만 다시 심는다.
 *  2. **`javascript:` 링크.** `[클릭](javascript:…)`이 href에 그대로 실렸다.
 *     v3는 스킴 허용목록(http·https·mailto·tel·상대경로·#앵커)을 통과한 것만 링크로
 *     만들고, 나머지는 링크로 만들지 않고 원문을 남긴다.
 *  3. **부모 없는 `<li>`.** v2는 `<li>`를 목록 요소 밖에 흩뿌려 AT가 목록으로
 *     읽지 못했다(HTML 규격 위반). v3는 연속 항목을 `<ul>`/`<ol>`로 묶는다.
 *  4. **문단이 `<br/><br/>`이었다.** 빈 줄을 줄바꿈 두 개로 바꿔 문단 구조가 없었다 —
 *     v3는 진짜 `<p>`이고, 연속 인용줄도 `<blockquote>` 하나로 묶는다.
 *  5. **코드 스팬 안의 `**`가 볼드가 됐다.** 치환 순서만으로 막을 수 없어 v3는
 *     코드 스팬을 자리표시자로 빼 두고 인라인 치환 후 되돌린다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import markdownViewerStyles from "./markdown-viewer.css.js";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ESCAPES[c]!);

/** 자리표시자 경계 — 이스케이프 결과에는 등장할 수 없는 제어문자 */
const MARK = "\u0000";

/**
 * 스킴 허용목록. 상대경로·#앵커는 스킴이 없으므로 통과하고,
 * javascript:/data:/vbscript: 등 실행 가능한 스킴은 막는다.
 * 공백·제어문자를 끼워 넣는 우회(`java\nscript:`)를 막기 위해 판정 전에 제거한다.
 */
function safeUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  const probe = url.replace(/[\s\u0000-\u001f]/g, "");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(probe);
  if (scheme && !/^(?:https?|mailto|tel)$/i.test(scheme[1]!)) return null;
  return url;
}

/** 인라인 치환 — 입력은 **이스케이프 전** 원문, 출력은 안전한 HTML 조각 */
function inline(src: string): string {
  const codes: string[] = [];
  let out = escapeHtml(src);
  // 코드 스팬을 먼저 빼낸다 — 안쪽의 *·[]는 마크다운으로 해석되지 않아야 한다
  out = out.replace(/`([^`]+)`/g, (_m, body: string) => {
    codes.push(body);
    return `${MARK}${codes.length - 1}${MARK}`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, text: string, href: string) => {
    const safe = safeUrl(href);
    if (!safe) return whole; // 위험한 스킴은 링크로 만들지 않는다 (원문 노출)
    return (
      `<a class="jd-markdown-viewer__link" href="${safe}" ` +
      `target="_blank" rel="noopener noreferrer">${text}</a>`
    );
  });
  return out.replace(
    new RegExp(`${MARK}(\\d+)${MARK}`, "g"),
    (_m, i: string) => `<code class="jd-markdown-viewer__code">${codes[Number(i)] ?? ""}</code>`,
  );
}

const RE_HEADING = /^(#{1,3})\s+(.*)$/;
const RE_RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const RE_UL = /^\s*[-*+]\s+(.*)$/;
const RE_OL = /^\s*\d+[.)]\s+(.*)$/;
const RE_QUOTE = /^\s*>\s?(.*)$/;

const startsBlock = (line: string): boolean =>
  RE_HEADING.test(line) ||
  RE_RULE.test(line) ||
  RE_UL.test(line) ||
  RE_OL.test(line) ||
  RE_QUOTE.test(line);

/** HTML 안에 들여쓴 채로 쓴 원문에서 공통 선행 공백을 제거한다 */
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

/** 블록 파서 — 결과는 DocumentFragment. 텍스트는 inline()이 이미 안전화했다 */
function parse(md: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const lines = md.replace(/\r\n?/g, "\n").replace(/\u0000/g, "").split("\n");
  let i = 0;

  const el = (tag: string, cls: string, html?: string): HTMLElement => {
    const node = document.createElement(tag);
    node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };

  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = RE_HEADING.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      frag.append(el(`h${level}`, `jd-markdown-viewer__h${level}`, inline(heading[2]!)));
      i += 1;
      continue;
    }

    if (RE_RULE.test(line)) {
      frag.append(el("hr", "jd-markdown-viewer__rule"));
      i += 1;
      continue;
    }

    const listTag = RE_UL.test(line) ? "ul" : RE_OL.test(line) ? "ol" : null;
    if (listTag) {
      const re = listTag === "ul" ? RE_UL : RE_OL;
      const list = el(listTag, "jd-markdown-viewer__list");
      let m: RegExpExecArray | null;
      while (i < lines.length && (m = re.exec(lines[i]!))) {
        list.append(el("li", "jd-markdown-viewer__item", inline(m[1]!)));
        i += 1;
      }
      frag.append(list);
      continue;
    }

    if (RE_QUOTE.test(line)) {
      // 연속 인용줄은 인용 하나로 묶는다 (v2는 줄마다 blockquote를 만들었다)
      const quote = el("blockquote", "jd-markdown-viewer__quote");
      let m: RegExpExecArray | null;
      while (i < lines.length && (m = RE_QUOTE.exec(lines[i]!))) {
        quote.append(el("p", "jd-markdown-viewer__p", inline(m[1]!)));
        i += 1;
      }
      frag.append(quote);
      continue;
    }

    const buf: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !startsBlock(lines[i]!)) {
      buf.push(lines[i]!.trim());
      i += 1;
    }
    frag.append(el("p", "jd-markdown-viewer__p", inline(buf.join(" "))));
  }
  return frag;
}

export class JdMarkdownViewer extends JdElement {
  static override tag = "jd-markdown-viewer";
  static override props = {
    /** 마크다운 원문. 비면 최초 children 텍스트를 쓴다 */
    content: { type: String },
  };

  declare content: string;

  #body!: HTMLElement;
  #fallback = "";
  #painted: string | null = null;

  protected render(): void {
    adoptStyles(markdownViewerStyles);
    // 입양(§3.3): 이미 그려진 본문이 있으면 재사용하고 다시 파싱하지 않는다
    const found = this.querySelector<HTMLElement>(":scope > .jd-markdown-viewer__body");
    if (found) {
      // 이미 그려진 본문은 현재 원문의 결과로 신뢰한다 — 다시 파싱하면 프리렌더
      // 스냅샷을 지우고 같은 것을 새로 만드는 낭비가 된다(§3.3)
      this.#body = found;
      this.#painted = this.source;
      this.update();
      return;
    }
    this.#fallback = dedent(this.textContent ?? "");
    this.textContent = "";
    this.#body = document.createElement("div");
    this.#body.className = "jd-markdown-viewer__body";
    this.append(this.#body);
    this.update();
  }

  /** 현재 원문 — `content`가 비면 흡수한 children 텍스트 */
  get source(): string {
    return this.content || this.#fallback;
  }

  protected override update(): void {
    const src = this.source;
    if (this.#painted === src) return;
    this.#painted = src;
    this.#body.textContent = "";
    this.#body.append(parse(src));
  }
}
