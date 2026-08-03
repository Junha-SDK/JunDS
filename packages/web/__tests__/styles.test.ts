/**
 * css 태그 + adoptStyles 단위 테스트 (03-web-arch §4.2).
 */
import { describe, expect, test } from "vitest";
import { squish } from "./css-text.js";
import { css, adoptStyles } from "../src/core/styles.js";

describe("css 태그", () => {
  test("text 노출 — 정적 CSS 추출 빌드가 수집하는 표면", () => {
    const styles = css`
      .jd-x {
        color: ${"red"};
      }
    `;
    expect(squish(styles.text)).toBe(".jd-x { color: red; }");
  });

  test("sheet()는 지연 생성 + 동일 인스턴스 재사용", () => {
    const styles = css`
      .jd-y {
        display: flex;
      }
    `;
    const a = styles.sheet();
    expect(a).toBeInstanceOf(CSSStyleSheet);
    expect(styles.sheet()).toBe(a);
  });
});

describe("adoptStyles", () => {
  test("같은 스타일은 문서당 1회만 채택", () => {
    const before = document.adoptedStyleSheets.length;
    const styles = css`
      .jd-once {
        opacity: 1;
      }
    `;
    adoptStyles(styles);
    adoptStyles(styles);
    expect(document.adoptedStyleSheets.length).toBe(before + 1);
  });

  test("다른 스타일은 각각 추가 — 기존 시트 보존", () => {
    const before = document.adoptedStyleSheets.length;
    adoptStyles(
      css`
        .jd-a {
          top: 0;
        }
      `,
    );
    adoptStyles(
      css`
        .jd-b {
          top: 0;
        }
      `,
    );
    expect(document.adoptedStyleSheets.length).toBe(before + 2);
  });
});
