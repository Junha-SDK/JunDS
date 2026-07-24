/**
 * <jd-highlight> — 검색어 강조 (v2 primitives/Highlight).
 *
 * - text/query가 attribute라 SearchBar·CommandPalette 결과에 선언적으로 쓸 수 있다.
 *   text 미지정 시 최초 children의 텍스트를 본문으로 삼는다(마크업 안에 문장을 두는 쪽).
 * - v2는 split 결과마다 `re.test()`(g 플래그의 lastIndex 상태)를 섞어 판정이 흔들렸다 —
 *   실효 판정은 뒤따르는 소문자 비교였다. v3는 캡처 그룹 split의 홀수 인덱스가 곧
 *   일치 조각이라는 사실만 쓴다(정규식 상태 의존 없음).
 * - 텍스트 노드만 만든다 — query는 사용자 입력일 수 있어 innerHTML 경로를 두지 않는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import highlightStyles from "./highlight.css.js";

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class JdHighlight extends JdElement {
  static override tag = "jd-highlight";
  static override props = {
    text: { type: String },
    /** 강조할 검색어 (대소문자 무시) */
    query: { type: String },
    variant: { type: String, default: "yellow", reflect: true }, // yellow | primary | underline
  };

  declare text: string;
  declare query: string;
  declare variant: string;

  #source = "";

  protected render(): void {
    adoptStyles(highlightStyles);
    // text 미지정이면 초기 children을 본문으로 흡수 (한 번만 — 이후 재구축의 원본)
    this.#source = this.text || this.textContent?.trim() || "";
    this.update();
  }

  protected override update(): void {
    const source = this.text || this.#source;
    const query = this.query;
    if (!query) {
      if (this.textContent !== source) this.textContent = source;
      return;
    }
    const parts = source.split(new RegExp(`(${escapeRe(query)})`, "ig"));
    const frag = document.createDocumentFragment();
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (!part) continue;
      if (i % 2 === 1) {
        // 캡처 조각 = 일치 구간
        const mark = document.createElement("mark");
        mark.className = "jd-highlight__mark";
        mark.textContent = part;
        frag.append(mark);
      } else {
        frag.append(document.createTextNode(part));
      }
    }
    this.textContent = "";
    this.append(frag);
  }
}
