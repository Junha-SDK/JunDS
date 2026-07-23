/**
 * css 태그 + adoptStyles (03-web-arch §4.2, WEB-08).
 * - 시트는 첫 adoptStyles() 호출 때 지연 생성 — SSR 안전(§3.1-4, Node엔 생성자 없음)
 * - 문서 단위 1회 채택 (중복 채택 방지 레지스트리)
 * - text는 정적 CSS 추출 빌드(§6)가 수집
 */

export interface JdStyles {
  readonly text: string;
  sheet(): CSSStyleSheet;
}

export function css(strings: TemplateStringsArray, ...vals: string[]): JdStyles {
  const text = String.raw(strings, ...vals);
  let sheet: CSSStyleSheet | undefined;
  return {
    text,
    sheet() {
      if (!sheet) {
        sheet = new CSSStyleSheet();
        sheet.replaceSync(text);
      }
      return sheet;
    },
  };
}

const adopted = new WeakMap<Document, Set<JdStyles>>();

export function adoptStyles(styles: JdStyles, doc: Document = document): void {
  let set = adopted.get(doc);
  if (!set) adopted.set(doc, (set = new Set()));
  if (set.has(styles)) return; // 문서당 1회
  set.add(styles);
  doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, styles.sheet()];
}
