/**
 * B2 layout 컨테이너 — jd-stack/grid/simple-grid/container/spacer/wrap/
 * aspect-ratio-box/overlay. 별칭 파생(R12)·기본값 CSS·컴포넌트 고유 프롭.
 */
import { beforeEach, describe, expect, test } from "vitest";
import "../src/components/stack/index.js";
import "../src/components/grid/index.js";
import "../src/components/grid-layout/index.js";
import "../src/components/simple-grid/index.js";
import "../src/components/container/index.js";
import "../src/components/spacer/index.js";
import "../src/components/wrap/index.js";
import "../src/components/aspect-ratio-box/index.js";
import "../src/components/overlay/index.js";
import { JdGridLayout } from "../src/components/grid-layout/element.js";
import { JdGrid } from "../src/components/grid/element.js";
import { JdGroup } from "../src/components/group/element.js";
import { JdWrap } from "../src/components/wrap/element.js";
import { JdContainer } from "../src/components/container/element.js";
import { JdSpacer } from "../src/components/spacer/element.js";
import { JdAspectRatioBox } from "../src/components/aspect-ratio-box/element.js";
import { JdOverlay } from "../src/components/overlay/element.js";
import stackStyles from "../src/components/stack/stack.css.js";
import containerStyles from "../src/components/container/container.css.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

test("B2 전 태그 정의 + 별칭 파생 관계(R12)", () => {
  for (const tag of [
    "jd-stack", "jd-grid", "jd-simple-grid", "jd-container", "jd-spacer",
    "jd-wrap", "jd-aspect-ratio-box", "jd-overlay",
  ]) {
    expect(customElements.get(tag), tag).toBeDefined();
  }
  // 단일 구현 + 별칭: Grid/SimpleGrid는 GridLayout, Wrap은 Group의 파생
  expect(Object.getPrototypeOf(JdGrid)).toBe(JdGridLayout);
  expect(customElements.get("jd-simple-grid")!.prototype).toBeInstanceOf(JdGridLayout);
  expect(Object.getPrototypeOf(JdWrap)).toBe(JdGroup);
});

describe("jd-stack", () => {
  test("기본 column·gap md는 base CSS, direction/gap 프롭은 인라인", async () => {
    expect(stackStyles.text).toContain("flex-direction: column");
    expect(stackStyles.text).toContain("gap: var(--jd-space-4)");
    document.body.innerHTML = `<jd-stack direction="row" gap="2"></jd-stack>`;
    await tick();
    const el = document.querySelector<HTMLElement>("jd-stack")!;
    expect(el.style.getPropertyValue("flex-direction")).toBe("row");
    expect(el.style.getPropertyValue("gap")).toBe("var(--jd-space-2)");
  });
});

describe("jd-grid / jd-simple-grid — auto 컬럼 (v2 분기 동형)", () => {
  test("auto-fit → repeat(auto-fit, minmax(Npx, 1fr))", async () => {
    document.body.innerHTML = `<jd-grid auto-fit="240"></jd-grid>`;
    await tick();
    const el = document.querySelector<JdGrid>("jd-grid")!;
    expect(el.style.getPropertyValue("grid-template-columns"))
      .toBe("repeat(auto-fit, minmax(240px, 1fr))");
  });

  test("auto-fill 우선순위는 auto-fit 다음", async () => {
    document.body.innerHTML = `<jd-grid auto-fit="200" auto-fill="300"></jd-grid>`;
    await tick();
    expect(document.querySelector<HTMLElement>("jd-grid")!.style.getPropertyValue("grid-template-columns"))
      .toBe("repeat(auto-fit, minmax(200px, 1fr))");
  });

  test("min-child-width(SimpleGrid 표면) → auto-fill", async () => {
    document.body.innerHTML = `<jd-simple-grid min-child-width="180"></jd-simple-grid>`;
    await tick();
    expect(document.querySelector<HTMLElement>("jd-simple-grid")!.style.getPropertyValue("grid-template-columns"))
      .toBe("repeat(auto-fill, minmax(180px, 1fr))");
  });

  test("auto 해제 시 cols 프롭 복원·무프롭이면 제거", async () => {
    document.body.innerHTML = `<jd-grid auto-fit="240" cols="3"></jd-grid>`;
    await tick();
    const el = document.querySelector<JdGrid>("jd-grid")!;
    el.autoFit = 0;
    await tick();
    expect(el.style.getPropertyValue("grid-template-columns")).toBe("repeat(3, 1fr)");
    el.removeAttribute("cols");
    await tick();
    expect(el.style.getPropertyValue("grid-template-columns")).toBe("");
  });
});

describe("jd-container", () => {
  test("size 프리셋 반영(기본 lg 미반영) + no-center", async () => {
    expect(containerStyles.text).toContain("max-width: 1024px");
    expect(containerStyles.text).toContain("jd-container[size=\"xs\"] { max-width: 512px; }");
    document.body.innerHTML = `<jd-container no-center></jd-container>`;
    await tick();
    const el = document.querySelector<JdContainer>("jd-container")!;
    expect(el.hasAttribute("size")).toBe(false);
    expect(el.noCenter).toBe(true);
    el.size = "sm";
    await tick();
    expect(el.getAttribute("size")).toBe("sm");
  });

  test("px 프롭이 인라인으로 기본 패딩을 덮는다", async () => {
    document.body.innerHTML = `<jd-container px="0"></jd-container>`;
    await tick();
    const el = document.querySelector<HTMLElement>("jd-container")!;
    expect(el.style.getPropertyValue("padding-left")).toBe("0px");
  });
});

describe("jd-spacer", () => {
  test("aria-hidden 고정 + 축별 패딩 (v2 py/px 동형)", async () => {
    document.body.innerHTML = `<jd-spacer size="8"></jd-spacer>`;
    await tick();
    const el = document.querySelector<JdSpacer>("jd-spacer")!;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.style.getPropertyValue("padding-block")).toBe("var(--jd-space-8)");
    el.axis = "horizontal";
    await tick();
    expect(el.style.getPropertyValue("padding-inline")).toBe("var(--jd-space-8)");
    expect(el.style.getPropertyValue("padding-block")).toBe("");
    expect(el.getAttribute("axis")).toBe("horizontal");
  });
});

describe("jd-aspect-ratio-box", () => {
  test("ratio 원문 수용(수치·분수) + 해제", async () => {
    document.body.innerHTML = `<jd-aspect-ratio-box ratio="1"></jd-aspect-ratio-box>`;
    await tick();
    const el = document.querySelector<JdAspectRatioBox>("jd-aspect-ratio-box")!;
    expect(el.style.getPropertyValue("aspect-ratio")).toMatch(/^1( \/ 1)?$/); // CSSOM 정규화 허용
    el.ratio = "4/3";
    await tick();
    expect(el.style.getPropertyValue("aspect-ratio").replaceAll(" ", "")).toBe("4/3");
    el.ratio = "";
    await tick();
    expect(el.style.getPropertyValue("aspect-ratio")).toBe("");
  });
});

describe("jd-overlay", () => {
  test("no-center·blur(attr) ↔ blurred(프로퍼티 — 네이티브 blur() 보존)", async () => {
    document.body.innerHTML = `<jd-overlay blur></jd-overlay>`;
    await tick();
    const el = document.querySelector<JdOverlay>("jd-overlay")!;
    expect(el.blurred).toBe(true);
    expect(typeof el.blur).toBe("function"); // HTMLElement.blur() 그대로
    el.noCenter = true;
    await tick();
    expect(el.hasAttribute("no-center")).toBe(true);
    el.blurred = false;
    await tick();
    expect(el.hasAttribute("blur")).toBe(false);
  });
});
