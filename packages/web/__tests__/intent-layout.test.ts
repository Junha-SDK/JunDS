/**
 * 의도 기반 레이아웃 프리미티브 — jd-split / jd-switcher / jd-sidebar-layout (DEC-052).
 *
 * 이 셋의 값어치는 "브레이크포인트를 고르지 않아도 반응형이 된다"에 있다. happy-dom은
 * 실제 배치를 하지 않으므로 꺾이는 순간 자체는 여기서 검증할 수 없다 — 대신 그 성질을
 * 만들어 내는 **구조**(컨테이너 기준 calc, flex-basis 역할 분담)와 어휘 일치를 지킨다.
 * 실제 꺾임은 e2e(`e2e/intent-layout.spec.ts`)에서 폭을 바꿔 가며 본다.
 *
 * CSS 텍스트 단언은 전부 `squish`를 거친다 — 공백은 계약이 아니라 포매터의 몫이다.
 */
import { beforeEach, describe, expect, test } from "vitest";
import { squish } from "./css-text.js";
import { BREAKPOINTS } from "../src/core/tokens.generated.js";
import "../src/components/split/index.js";
import "../src/components/switcher/index.js";
import "../src/components/sidebar-layout/index.js";
import splitStyles from "../src/components/split/split.css.js";
import switcherStyles from "../src/components/switcher/switcher.css.js";
import sidebarStyles from "../src/components/sidebar-layout/sidebar-layout.css.js";
import { JdSidebarLayout } from "../src/components/sidebar-layout/element.js";
import { JdSwitcher } from "../src/components/switcher/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

const splitCss = squish(splitStyles.text);
const switcherCss = squish(switcherStyles.text);
const sidebarCss = squish(sidebarStyles.text);

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("등록", () => {
  test("세 태그 모두 정의된다", () => {
    for (const tag of ["jd-split", "jd-switcher", "jd-sidebar-layout"]) {
      expect(customElements.get(tag), tag).toBeTypeOf("function");
    }
  });
});

describe("jd-split", () => {
  test("양끝 배치 + 좁아지면 줄바꿈이 기본", () => {
    expect(splitCss).toContain("justify-content: space-between");
    expect(splitCss).toContain("flex-wrap: wrap");
  });

  test("no-wrap으로 한 줄 고정", async () => {
    document.body.innerHTML = `<jd-split no-wrap><span>a</span><span>b</span></jd-split>`;
    await tick();
    expect(document.querySelector("jd-split")!.hasAttribute("no-wrap")).toBe(true);
    expect(splitCss).toContain(squish("jd-split[no-wrap] { flex-wrap: nowrap; }"));
  });

  test("align은 전용 규칙이 아니라 공용 스타일 프롭이 처리한다 (어휘 단일)", async () => {
    document.body.innerHTML = `<jd-split align="start"></jd-split>`;
    await tick();
    const el = document.querySelector<HTMLElement>("jd-split")!;
    expect(el.style.getPropertyValue("align-items")).toBe("flex-start");
    expect(splitCss).not.toContain("jd-split[align=");
  });
});

describe("jd-switcher", () => {
  // 이 calc이 이 컴포넌트의 전부다. 100%가 컨테이너 폭이라서 뷰포트가 아니라
  // "자기가 놓인 자리"를 기준으로 꺾인다.
  test("컨테이너 폭 기준 calc — 미디어 쿼리를 쓰지 않는다", () => {
    expect(switcherCss).toContain(
      squish("flex-basis: calc((var(--jd-switcher-threshold) - 100%) * 999)"),
    );
    expect(switcherCss).not.toContain("@media");
  });

  test("임계값 어휘 = 브레이크포인트 토큰 전량 (이름이 갈라지지 않는다)", () => {
    for (const name of Object.keys(BREAKPOINTS)) {
      expect(switcherCss, `threshold=${name}`).toContain(
        squish(
          `jd-switcher[threshold="${name}"] { --jd-switcher-threshold: var(--jd-breakpoint-${name}); }`,
        ),
      );
    }
  });

  test("threshold는 반영되는 attribute", async () => {
    document.body.innerHTML = `<jd-switcher></jd-switcher>`;
    await tick();
    const el = document.querySelector<JdSwitcher>("jd-switcher")!;
    el.threshold = "lg";
    await tick();
    expect(el.getAttribute("threshold")).toBe("lg");
  });
});

describe("jd-sidebar-layout", () => {
  test("첫 children이 사이드바(고유 폭), 마지막이 본문(남는 공간 전부)", () => {
    expect(sidebarCss).toContain(squish("flex-basis: var(--jd-sidebar-width)"));
    expect(sidebarCss).toContain(squish("flex-grow: 999"));
    expect(sidebarCss).toContain(squish("min-inline-size: var(--jd-sidebar-content-min)"));
  });

  test("꺾이는 폭을 어디에도 적지 않는다 — 본문 최소 폭에서 따라 나온다", () => {
    expect(sidebarCss).not.toContain("@media");
  });

  test("side-width / content-min → 커스텀 프로퍼티", async () => {
    document.body.innerHTML = `<jd-sidebar-layout side-width="240px" content-min="50%"></jd-sidebar-layout>`;
    await tick();
    const el = document.querySelector<HTMLElement>("jd-sidebar-layout")!;
    expect(el.style.getPropertyValue("--jd-sidebar-width")).toBe("240px");
    expect(el.style.getPropertyValue("--jd-sidebar-content-min")).toBe("50%");
  });

  // 빈 문자열로 덮으면 var()가 폴백 없이 무효가 되어 배치가 통째로 무너진다.
  // 값을 지우면 base CSS의 기본값이 다시 이겨야 한다.
  test("값을 지우면 커스텀 프로퍼티를 제거해 기본값으로 되돌린다", async () => {
    document.body.innerHTML = `<jd-sidebar-layout side-width="240px"></jd-sidebar-layout>`;
    await tick();
    const el = document.querySelector<JdSidebarLayout>("jd-sidebar-layout")!;
    el.sideWidth = "";
    await tick();
    expect(el.style.getPropertyValue("--jd-sidebar-width")).toBe("");
  });

  test("side=end는 DOM 순서를 그대로 두고 order만 뒤집는다 (탭 순서 보존)", () => {
    expect(sidebarCss).toContain(
      squish('jd-sidebar-layout[side="end"] > :first-child { order: 1; }'),
    );
  });
});
