/**
 * <jd-heading> / <jd-text> — 시맨틱 내부 요소·레벨/as 교체·truncate/dimmed/lineClamp.
 */
import { beforeEach, describe, expect, test } from "vitest";
import "../src/components/heading/index.js";
import "../src/components/text/index.js";
import { JdHeading } from "../src/components/heading/element.js";
import { JdText } from "../src/components/text/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-heading", () => {
  test("기본 level 2 — 내부 <h2>에 children 이동", async () => {
    document.body.innerHTML = `<jd-heading>제목</jd-heading>`;
    await tick();
    const el = document.querySelector<JdHeading>("jd-heading")!;
    const h = el.querySelector(":scope > .jd-heading")!;
    expect(h.tagName).toBe("H2");
    expect(h.textContent).toBe("제목");
    expect(el.hasAttribute("level")).toBe(false); // 디폴트 미반영(DEC-012-2)
  });

  test("level attribute → 해당 h 태그 + 반영", async () => {
    document.body.innerHTML = `<jd-heading level="1">타이틀</jd-heading>`;
    await tick();
    const el = document.querySelector<JdHeading>("jd-heading")!;
    expect(el.level).toBe(1);
    expect(el.querySelector(":scope > .jd-heading")!.tagName).toBe("H1");
  });

  test("level 변경 시 내부 태그 교체 — children·클래스 보존", async () => {
    document.body.innerHTML = `<jd-heading><em id="k">유지</em></jd-heading>`;
    await tick();
    const el = document.querySelector<JdHeading>("jd-heading")!;
    el.level = 4;
    await tick();
    const h = el.querySelector(":scope > .jd-heading")!;
    expect(h.tagName).toBe("H4");
    expect(h.querySelector("#k")).not.toBeNull();
    expect(el.getAttribute("level")).toBe("4");
    expect(el.querySelectorAll(".jd-heading").length).toBe(1);
  });

  test("범위 밖 level은 1~6로 클램프", async () => {
    document.body.innerHTML = `<jd-heading level="9">x</jd-heading>`;
    await tick();
    expect(document.querySelector("jd-heading .jd-heading")!.tagName).toBe("H6");
  });

  test("mb·color 스타일 프롭이 인라인으로 레벨 기본을 덮는다", async () => {
    document.body.innerHTML = `<jd-heading mb="0" color="muted">x</jd-heading>`;
    await tick();
    const el = document.querySelector<HTMLElement>("jd-heading")!;
    expect(el.style.getPropertyValue("margin-bottom")).toBe("0px");
    expect(el.style.getPropertyValue("color")).toBe("var(--jd-color-muted)");
  });

  test("truncate 반영", async () => {
    document.body.innerHTML = `<jd-heading truncate>x</jd-heading>`;
    await tick();
    const el = document.querySelector<JdHeading>("jd-heading")!;
    expect(el.truncate).toBe(true);
  });

  test("SSR 골격 입양 — 재구축 없음 (§3.3)", async () => {
    document.body.innerHTML = `<jd-heading level="3"><h3 class="jd-heading">SSR</h3></jd-heading>`;
    await tick();
    const el = document.querySelector<JdHeading>("jd-heading")!;
    expect(el.querySelectorAll(".jd-heading").length).toBe(1);
    expect(el.querySelector(".jd-heading")!.textContent).toBe("SSR");
  });
});

describe("jd-text", () => {
  test("기본 as p — 내부 <p class=jd-text>", async () => {
    document.body.innerHTML = `<jd-text>본문</jd-text>`;
    await tick();
    const el = document.querySelector<JdText>("jd-text")!;
    const p = el.querySelector(":scope > .jd-text")!;
    expect(p.tagName).toBe("P");
    expect(p.textContent).toBe("본문");
  });

  test("as=span → 내부 span, as 변경 시 교체", async () => {
    document.body.innerHTML = `<jd-text as="span">x</jd-text>`;
    await tick();
    const el = document.querySelector<JdText>("jd-text")!;
    expect(el.querySelector(".jd-text")!.tagName).toBe("SPAN");
    el.as = "strong";
    await tick();
    expect(el.querySelector(".jd-text")!.tagName).toBe("STRONG");
  });

  test("미지 as는 p로 폴백", async () => {
    document.body.innerHTML = `<jd-text as="script">x</jd-text>`;
    await tick();
    expect(document.querySelector("jd-text .jd-text")!.tagName).toBe("P");
  });

  test("dimmed가 color 프롭을 이긴다 (v2 조건 분기 동형)", async () => {
    document.body.innerHTML = `<jd-text dimmed color="primary">x</jd-text>`;
    await tick();
    const el = document.querySelector<HTMLElement>("jd-text")!;
    expect(el.style.getPropertyValue("color")).toBe("var(--jd-color-muted)");
  });

  test("dimmed 해제 시 color 프롭 복원", async () => {
    document.body.innerHTML = `<jd-text dimmed color="primary">x</jd-text>`;
    await tick();
    const el = document.querySelector<JdText>("jd-text")!;
    el.dimmed = false;
    await tick();
    expect(el.style.getPropertyValue("color")).toBe(
      "var(--jd-color-primary-ink)",
    );
  });

  test("lineClamp → 내부 요소에 -webkit-box 3종, 해제 시 제거", async () => {
    document.body.innerHTML = `<jd-text line-clamp="3">x</jd-text>`;
    await tick();
    const el = document.querySelector<JdText>("jd-text")!;
    const inner = el.querySelector<HTMLElement>(".jd-text")!;
    expect(inner.style.getPropertyValue("-webkit-line-clamp")).toBe("3");
    expect(inner.style.getPropertyValue("overflow")).toBe("hidden");
    el.lineClamp = 0;
    await tick();
    expect(inner.style.getPropertyValue("-webkit-line-clamp")).toBe("");
    expect(inner.style.getPropertyValue("overflow")).toBe("");
  });

  test("mono·truncate 반영", async () => {
    document.body.innerHTML = `<jd-text mono truncate>x</jd-text>`;
    await tick();
    const el = document.querySelector<JdText>("jd-text")!;
    expect(el.mono).toBe(true);
    expect(el.hasAttribute("truncate")).toBe(true);
  });
});
