/**
 * 소비자 제공 콘텐츠의 단일 렌더 경계.
 *
 * 문자열은 항상 평문으로 취급한다. HTML 파싱은 호출부가 `unsafeHtml()`로 신뢰 경계를
 * 명시한 값에만 허용한다. DOM 노드는 복제하지 않고 대상 안으로 이동한다.
 */
const unsafeHtmlBrand = Symbol("@junds/web/unsafe-html");

export interface UnsafeHtml {
  readonly value: string;
  readonly [unsafeHtmlBrand]: true;
}

export type JdContent = string | Node | UnsafeHtml;

/** 이미 검증·정제된 HTML임을 호출부가 명시한다. 사용자 입력에는 사용하지 않는다. */
export function unsafeHtml(value: string): UnsafeHtml {
  return Object.freeze({
    value: String(value),
    [unsafeHtmlBrand]: true as const,
  });
}

export function isUnsafeHtml(value: unknown): value is UnsafeHtml {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Partial<UnsafeHtml>)[unsafeHtmlBrand] === true
  );
}

export function isContentEmpty(
  value: JdContent | null | undefined,
): value is null | undefined | "" {
  return value === undefined || value === null || value === "";
}

/**
 * 대상의 기존 자식을 교체한다.
 *
 * - `string`: `textContent`로 렌더(HTML처럼 보여도 파싱하지 않음)
 * - `Node`: 노드 자체를 append
 * - `unsafeHtml(markup)`: 명시적으로 HTML 파싱
 */
export function setContent(
  target: Element,
  value: JdContent | null | undefined,
): void {
  if (isContentEmpty(value)) {
    target.replaceChildren();
    return;
  }
  if (typeof value === "string") {
    target.textContent = value;
    return;
  }
  if (isUnsafeHtml(value)) {
    target.innerHTML = value.value;
    return;
  }
  target.replaceChildren(value);
}

/** 검색 색인·접근 이름처럼 렌더 값에서 평문만 필요할 때 사용한다. */
export function contentText(value: JdContent | null | undefined): string {
  if (isContentEmpty(value)) return "";
  if (typeof value === "string") return value;
  if (!isUnsafeHtml(value)) return value.textContent ?? "";
  const template = document.createElement("template");
  template.innerHTML = value.value;
  return template.content.textContent ?? "";
}
