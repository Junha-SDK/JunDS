/**
 * style-props 리졸버·적용기 단위 테스트 (B1 선행 과제).
 * v2 styleProps 어휘 패리티 + 반응형 마이크로문법 + diff 적용(소비자 스타일 보존).
 */
import { beforeEach, describe, expect, test } from "vitest";
import "../src/components/box/index.js";
import type { JdBox } from "../src/components/box/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

async function mount(html: string): Promise<JdBox> {
  document.body.innerHTML = html;
  await tick();
  return document.querySelector<JdBox>("jd-box")!;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("spacing 어휘 (v2 SPACING 패리티)", () => {
  test("값 일치 키는 --jd-space-* var 참조", async () => {
    const el = await mount(`<jd-box p="4"></jd-box>`);
    expect(el.style.getPropertyValue("padding")).toBe("var(--jd-space-4)");
  });

  test("named 스텝은 값 일치 var 별칭 (md=16px=--jd-space-4)", async () => {
    const el = await mount(`<jd-box gap="md"></jd-box>`);
    expect(el.style.getPropertyValue("gap")).toBe("var(--jd-space-4)");
  });

  test("토큰에 없는 v2 스텝(7=28px)은 px 리터럴", async () => {
    const el = await mount(`<jd-box p="7"></jd-box>`);
    expect(el.style.getPropertyValue("padding")).toBe("28px");
  });

  test("수치 폴백 n×4px + 음수는 v2 px 리터럴 반전", async () => {
    const el = await mount(`<jd-box p="11" mt="-2"></jd-box>`);
    expect(el.style.getPropertyValue("padding")).toBe("44px");
    expect(el.style.getPropertyValue("margin-top")).toBe("-8px");
  });

  test("mx=auto 허용 (v2 실측 버그 보정)", async () => {
    const el = await mount(`<jd-box mx="auto"></jd-box>`);
    expect(el.style.getPropertyValue("margin-left")).toBe("auto");
    expect(el.style.getPropertyValue("margin-right")).toBe("auto");
  });

  test("px/py는 좌우/상하 분해 (v2 동형)", async () => {
    const el = await mount(`<jd-box px="2" py="1"></jd-box>`);
    expect(el.style.getPropertyValue("padding-left")).toBe("var(--jd-space-2)");
    expect(el.style.getPropertyValue("padding-top")).toBe("var(--jd-space-1)");
  });
});

describe("색·박스 어휘", () => {
  test("색 토큰은 --jd-color-* var로 번역", async () => {
    const el = await mount(`<jd-box bg="primary" color="muted" border-color="border"></jd-box>`);
    expect(el.style.getPropertyValue("background-color")).toBe("var(--jd-color-primary)");
    expect(el.style.getPropertyValue("color")).toBe("var(--jd-color-muted)");
    expect(el.style.getPropertyValue("border-color")).toBe("var(--jd-color-border)");
  });

  test("semantic 글자색은 채움색과 분리된 ink 역할을 쓴다", async () => {
    const el = await mount(
      `<jd-box color="primary" bg="primary-light"></jd-box>`,
    );
    expect(el.style.getPropertyValue("color")).toBe(
      "var(--jd-color-primary-ink)",
    );
    expect(el.style.getPropertyValue("background-color")).toBe(
      "var(--jd-color-primary-light)",
    );
  });

  test("미지 색은 원문 통과 (v2 동형)", async () => {
    const el = await mount(`<jd-box bg="#ff0000"></jd-box>`);
    expect(el.style.getPropertyValue("background-color")).toBe("#ff0000");
  });

  test("radius는 v2 리터럴 어휘 (md=8px — 토큰 radius와 별개 축)", async () => {
    const el = await mount(`<jd-box radius="md"></jd-box>`);
    expect(el.style.getPropertyValue("border-radius")).toBe("8px");
  });

  test("shadow는 v2 리터럴 어휘", async () => {
    const el = await mount(`<jd-box shadow="sm"></jd-box>`);
    expect(el.style.getPropertyValue("box-shadow")).toBe(
      "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    );
  });

  test("border 불리언 attribute → 기본 보더 롱핸드, 문자열 → shorthand 원문", async () => {
    const a = await mount(`<jd-box border></jd-box>`);
    expect(a.style.getPropertyValue("border-width")).toBe("1px");
    expect(a.style.getPropertyValue("border-style")).toBe("solid");
    expect(a.style.getPropertyValue("border-color")).toBe("var(--jd-color-border)");
    const b = await mount(`<jd-box border="2px dashed red"></jd-box>`);
    expect(b.style.getPropertyValue("border-style")).toBe("dashed");
  });

  test("border + borderColor 병용 시 색 오버라이드 성립 (적용 순서 계약)", async () => {
    const el = await mount(`<jd-box border border-color="danger"></jd-box>`);
    expect(el.style.getPropertyValue("border-color")).toBe("var(--jd-color-danger)");
  });
});

describe("레이아웃·타이포 어휘", () => {
  test("align/justify 축약 매핑 (v2 동형)", async () => {
    const el = await mount(`<jd-box display="flex" align="start" justify="between"></jd-box>`);
    expect(el.style.getPropertyValue("display")).toBe("flex");
    expect(el.style.getPropertyValue("align-items")).toBe("flex-start");
    expect(el.style.getPropertyValue("justify-content")).toBe("space-between");
  });

  test("cols 수치 → repeat, 문자열 → 원문", async () => {
    const a = await mount(`<jd-box cols="3"></jd-box>`);
    expect(a.style.getPropertyValue("grid-template-columns")).toBe("repeat(3, 1fr)");
    const b = await mount(`<jd-box cols="240px 1fr"></jd-box>`);
    expect(b.style.getPropertyValue("grid-template-columns")).toBe("240px 1fr");
  });

  test("colSpan → span n", async () => {
    const el = await mount(`<jd-box col-span="2"></jd-box>`);
    expect(el.style.getPropertyValue("grid-column")).toBe("span 2");
  });

  test("zIndex named/수치 (v2 styleProps 어휘 1000~1700)", async () => {
    const a = await mount(`<jd-box z-index="modal"></jd-box>`);
    expect(a.style.getPropertyValue("z-index")).toBe("1400");
    const b = await mount(`<jd-box z-index="7"></jd-box>`);
    expect(b.style.getPropertyValue("z-index")).toBe("7");
  });

  test("fontSize는 v2 어휘 리터럴 (md=1rem — --jd-text-md와 별개 축)", async () => {
    const el = await mount(`<jd-box font-size="md"></jd-box>`);
    expect(el.style.getPropertyValue("font-size")).toBe("1rem");
  });

  test("w/h — full/screen/수치 px (v2 resolveSize 동형)", async () => {
    const el = await mount(`<jd-box w="full" h="300"></jd-box>`);
    expect(el.style.getPropertyValue("width")).toBe("100%");
    expect(el.style.getPropertyValue("height")).toBe("300px");
  });

  test("transition 불리언/named", async () => {
    const el = await mount(`<jd-box transition></jd-box>`);
    expect(el.style.getPropertyValue("transition")).toContain("all 200ms");
    el.transition = "fast";
    await tick();
    expect(el.style.getPropertyValue("transition")).toContain("100ms");
  });
});

describe("diff 적용 — 소비자 스타일 보존", () => {
  test("프롭 제거 시 우리가 쓴 프로퍼티만 제거", async () => {
    const el = await mount(`<jd-box p="4" style="outline: 1px solid red"></jd-box>`);
    expect(el.style.getPropertyValue("padding")).toBe("var(--jd-space-4)");
    el.removeAttribute("p");
    await tick();
    expect(el.style.getPropertyValue("padding")).toBe("");
    expect(el.style.getPropertyValue("outline")).toContain("red"); // 소비자 인라인 보존
  });

  test("프로퍼티 대입 → 인라인 반영 (숫자 허용)", async () => {
    const el = await mount(`<jd-box></jd-box>`);
    el.p = 4;
    await tick();
    expect(el.style.getPropertyValue("padding")).toBe("var(--jd-space-4)");
  });
});

describe("반응형 마이크로문법 (WEB-03 — JSON 금지)", () => {
  test("반응형이면 인라인 대신 결정적 해시 클래스", async () => {
    const el = await mount(`<jd-box p="4 md:6"></jd-box>`);
    expect(el.style.getPropertyValue("padding")).toBe(""); // base도 클래스로 (v2 인라인 버그 보정)
    const cls = [...el.classList].find((c) => c.startsWith("jd-r-"));
    expect(cls).toBeDefined();
  });

  test("같은 내용 → 같은 클래스 (중복 규칙 없음·프리렌더 안정)", async () => {
    document.body.innerHTML = `<jd-box id="a" p="4 md:6"></jd-box><jd-box id="b" p="4 md:6"></jd-box>`;
    await tick();
    const a = [...document.querySelector("#a")!.classList].find((c) => c.startsWith("jd-r-"));
    const b = [...document.querySelector("#b")!.classList].find((c) => c.startsWith("jd-r-"));
    expect(a).toBe(b);
  });

  test("값 변경 → 클래스 교체, 소비자 클래스는 보존", async () => {
    const el = await mount(`<jd-box class="mine" p="4 md:6"></jd-box>`);
    const first = [...el.classList].find((c) => c.startsWith("jd-r-"))!;
    el.p = "2 lg:8";
    await tick();
    const second = [...el.classList].find((c) => c.startsWith("jd-r-"))!;
    expect(second).not.toBe(first);
    expect(el.classList.contains("mine")).toBe(true);
    expect([...el.classList].filter((c) => c.startsWith("jd-r-")).length).toBe(1);
  });

  test("반응형 → 비반응형 복귀 시 클래스 제거 + 인라인 복원", async () => {
    const el = await mount(`<jd-box p="4 md:6"></jd-box>`);
    el.p = "4";
    await tick();
    expect([...el.classList].some((c) => c.startsWith("jd-r-"))).toBe(false);
    expect(el.style.getPropertyValue("padding")).toBe("var(--jd-space-4)");
  });

  test("공백 있는 원시값은 반응형으로 오해하지 않는다", async () => {
    const el = await mount(`<jd-box w="calc(100% - 8px)"></jd-box>`);
    expect(el.style.getPropertyValue("width")).toBe("calc(100% - 8px)");
  });
});
