/**
 * B1 순수 컨테이너 6종 — jd-box/center/flex/grid-layout/group/hstack/vstack.
 * 골격 없음(호스트=박스, children 보존) + 기본값은 base CSS(디폴트 미반영 DEC-012-2) +
 * 컴포넌트 고유 불리언 반영.
 */
import { beforeEach, describe, expect, test } from "vitest";
import "../src/components/box/index.js";
import "../src/components/center/index.js";
import "../src/components/flex/index.js";
import "../src/components/grid-layout/index.js";
import "../src/components/group/index.js";
import "../src/components/hstack/index.js";
import "../src/components/vstack/index.js";
import type { JdFlex } from "../src/components/flex/element.js";
import type { JdGroup } from "../src/components/group/element.js";
import centerStyles from "../src/components/center/center.css.js";
import gridLayoutStyles from "../src/components/grid-layout/grid-layout.css.js";
import groupStyles from "../src/components/group/group.css.js";
import hstackStyles from "../src/components/hstack/hstack.css.js";
import vstackStyles from "../src/components/vstack/vstack.css.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

test("컨테이너는 골격을 만들지 않는다 — children 그대로 (호스트=박스)", async () => {
  document.body.innerHTML = `<jd-box><span id="c">x</span></jd-box>`;
  await tick();
  const el = document.querySelector("jd-box")!;
  expect(el.childElementCount).toBe(1);
  expect(el.firstElementChild!.id).toBe("c");
});

test("전 컨테이너가 정의된다 (jd- 접두 태그)", () => {
  for (const tag of [
    "jd-box",
    "jd-center",
    "jd-flex",
    "jd-grid-layout",
    "jd-group",
    "jd-hstack",
    "jd-vstack",
  ]) {
    expect(customElements.get(tag), tag).toBeDefined();
  }
});

test("기본값은 base CSS가 담당 — v2 기본 gap·정렬이 시트에 존재", () => {
  // 디폴트는 attribute로 나타나지 않으므로(DEC-012-2) 기본 스타일은 CSS 텍스트로 검증
  expect(hstackStyles.text).toContain("gap: var(--jd-space-2)"); // sm=8px
  expect(hstackStyles.text).toContain("align-items: center");
  expect(vstackStyles.text).toContain("gap: var(--jd-space-4)"); // md=16px
  expect(vstackStyles.text).toContain("flex-direction: column");
  expect(groupStyles.text).toContain("flex-wrap: wrap");
  expect(gridLayoutStyles.text).toContain("repeat(1, 1fr)");
  expect(gridLayoutStyles.text).toContain("gap: var(--jd-space-4)");
  expect(centerStyles.text).toContain("justify-content: center");
});

test("gap attribute가 인라인으로 base 기본을 덮는다", async () => {
  document.body.innerHTML = `<jd-hstack gap="lg"></jd-hstack>`;
  await tick();
  const el = document.querySelector<HTMLElement>("jd-hstack")!;
  expect(el.style.getPropertyValue("gap")).toBe("var(--jd-space-6)");
});

test("jd-flex inline 반영 (attr 셀렉터 훅)", async () => {
  document.body.innerHTML = `<jd-flex></jd-flex>`;
  await tick();
  const el = document.querySelector<JdFlex>("jd-flex")!;
  expect(el.hasAttribute("inline")).toBe(false); // 디폴트 미반영
  el.inline = true;
  await tick();
  expect(el.hasAttribute("inline")).toBe(true);
});

test("jd-group noWrap ↔ no-wrap kebab 반영", async () => {
  document.body.innerHTML = `<jd-group no-wrap></jd-group>`;
  await tick();
  const el = document.querySelector<JdGroup>("jd-group")!;
  expect(el.noWrap).toBe(true);
  el.noWrap = false;
  await tick();
  expect(el.hasAttribute("no-wrap")).toBe(false);
});

test("파생 컨테이너도 스타일 프롭 상속 — center에 p 적용", async () => {
  document.body.innerHTML = `<jd-center p="8"></jd-center>`;
  await tick();
  const el = document.querySelector<HTMLElement>("jd-center")!;
  expect(el.style.getPropertyValue("padding")).toBe("var(--jd-space-8)");
});
