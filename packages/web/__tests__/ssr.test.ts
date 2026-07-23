// @vitest-environment node
/**
 * SSR/Node 평가 안전성 (03-web-arch §3.1, WEB-07):
 * DOM 전역이 없는 Node에서 모듈 import가 그냥 평가되고, 등록은 no-op이어야 한다.
 */
import { describe, expect, test } from "vitest";

describe("Node(비브라우저) 모듈 평가", () => {
  test("배럴 import가 throw 없이 평가된다", async () => {
    const mod = await import("../src/index.js");
    expect(mod.JdElement).toBeTypeOf("function");
    expect(mod.defineElement).toBeTypeOf("function");
    expect(mod.css).toBeTypeOf("function");
    expect(mod.adoptStyles).toBeTypeOf("function");
  });

  test("defineElement는 customElements 부재 시 no-op", async () => {
    const { defineElement, JdElement } = await import("../src/index.js");
    class X extends JdElement {
      protected render(): void {}
    }
    expect(() => defineElement("jd-ssr-noop", X)).not.toThrow();
  });

  test("css 태그는 시트를 지연 생성 — text 접근은 Node에서 안전 (§3.1-4)", async () => {
    const { css } = await import("../src/index.js");
    const styles = css`.jd-ssr { color: red; }`;
    expect(styles.text).toBe(".jd-ssr { color: red; }");
    // sheet()는 브라우저 전용 — Node에서 호출하지 않는 것이 규약
  });

  test("B1 core·B2 layout 컴포넌트 모듈이 Node에서 평가된다 (define index 포함 no-op)", async () => {
    const mod = await import("../src/define.js");
    expect(mod.defineJunds).toBeTypeOf("function");
    const barrel = await import("../src/index.js");
    for (const name of [
      "JdBox", "JdCenter", "JdDivider", "JdFlex", "JdGridLayout", "JdGroup",
      "JdHStack", "JdHeading", "JdPage", "JdPageBody", "JdPageHeader",
      "JdSection", "JdText", "JdVStack",
      "JdAppShell", "JdAspectRatioBox", "JdContainer", "JdGrid", "JdHide",
      "JdOverlay", "JdShow", "JdSimpleGrid", "JdSpacer", "JdStack", "JdWrap",
      "JdIconButton", "JdTextarea", "JdLabel", "JdCheckbox", "JdRadioGroup",
      "JdToggle", "JdSwitch", "JdSlider", "JdRangeSlider",
    ] as const) {
      expect(barrel[name], name).toBeTypeOf("function");
    }
  });

  test("style-props 유틸은 DOM 없이 평가·호출 가능 (리졸버는 순수)", async () => {
    const { resolveSpace, resolveColor } = await import("../src/index.js");
    expect(resolveSpace("4")).toBe("var(--jd-space-4)");
    expect(resolveColor("primary")).toBe("var(--jd-color-primary)");
  });
});
