/**
 * 금칙처리(禁則処理) — 줄 첫머리에 오면 안 되는 문장부호를 앞 글자에 묶는다.
 *
 * 한국어·일본어 본문에서 마침표나 닫는 괄호가 줄 맨 앞으로 떨어지면 눈에 확
 * 띄게 어색하다. 이를 막기 위해 그런 부호 바로 앞에 word joiner(U+2060)를
 * 끼워 넣어 그 자리에서의 줄바꿈을 막는다.
 *
 * word joiner 는 폭이 0 이고 보이지 않으며, 없애는 것은 "줄바꿈 기회"뿐이라
 * 레이아웃·선택·검색에 영향이 없다. 다만 이 문자열을 그대로 복사하면
 * 보이지 않는 문자가 함께 복사되므로, 복사 대상이 되는 텍스트(코드 블록 등)에는
 * 적용하지 않는 것이 좋다.
 */

/** 폭 0 의 줄바꿈 금지 문자 (U+2060 WORD JOINER) */
export const WORD_JOINER = "⁠";

/** 행두에 오면 안 되는 문장부호들 */
const LINE_HEAD_FORBIDDEN = /([^\s⁠])([.,!?:;)\]}…」』）》〉、。·])/g;

/**
 * 문자열에 금칙처리를 적용한다. 이미 적용된 자리는 건드리지 않으므로
 * 여러 번 호출해도 word joiner 가 중복되지 않는다.
 *
 * @example
 * applyKinsoku('그는 말했다. "괜찮아."')
 */
export function applyKinsoku(text: string): string {
  return text.replace(LINE_HEAD_FORBIDDEN, `$1${WORD_JOINER}$2`);
}

/**
 * 금칙처리를 되돌린다 — word joiner 를 전부 제거한다.
 * 처리된 본문을 클립보드나 검색 인덱스에 넣기 전에 쓴다.
 */
export function stripKinsoku(text: string): string {
  return text.replaceAll(WORD_JOINER, "");
}

/**
 * 이미 HTML 로 만들어진 문자열에 금칙처리를 적용한다.
 *
 * 태그 안쪽(`<a href="…">`)과 `<code>` 내용은 건드리지 않는다 — URL 한가운데
 * word joiner 가 끼면 링크가 깨지고, 코드에 끼면 복사한 코드가 실행되지 않는다.
 * mdast/hast 를 다룰 수 있는 상황이라면 `remarkKinsoku` 쪽이 더 정확하다.
 */
export function applyKinsokuToHtml(html: string): string {
  // 토큰: <code>…</code> 통째 / 태그 하나 / 그 사이의 텍스트
  return html.replace(
    /(<code\b[^>]*>[\s\S]*?<\/code>)|(<[^>]*>)|([^<]+)/g,
    (_m, codeBlock: string | undefined, tag: string | undefined, text: string | undefined) => {
      if (codeBlock) return codeBlock;
      if (tag) return tag;
      return applyKinsoku(text ?? "");
    },
  );
}

/**
 * react-markdown 등 unified 파이프라인에 꽂는 remark 플러그인.
 * 텍스트 노드에만 적용되므로 코드 블록·URL 은 그대로 둔다.
 *
 * @example
 * <ReactMarkdown remarkPlugins={[remarkGfm, remarkKinsoku]}>{md}</ReactMarkdown>
 */
export function remarkKinsoku() {
  interface MdNode {
    type?: string;
    value?: string;
    children?: MdNode[];
  }
  const walk = (node: MdNode) => {
    if (node.type === "text" && typeof node.value === "string") {
      node.value = applyKinsoku(node.value);
    }
    node.children?.forEach(walk);
  };
  return (tree: unknown) => walk(tree as MdNode);
}
