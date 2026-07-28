/**
 * 스타일 프롭 어휘 ↔ tokens/*.json 패리티 (DEC-045).
 *
 * v2는 `ds/tokens/*`(정본)와 `ds/core/styleProps.ts`(별개 리터럴) 두 벌의 어휘를 들고
 * 있었고, 그래서 같은 이름이 플랫폼마다·엘리먼트마다 다른 값을 가리켰다
 * (`<jd-image radius="md">`=6px vs `<jd-box radius="md">`=8px). iOS는 생성기를 통해
 * tokens/*.json만 읽으므로 웹 스타일 프롭만 홀로 어긋나 있었다.
 *
 * 이 파일이 지키는 계약은 하나다 — **이름 하나 = 값 하나**:
 *   (A) 스타일 프롭이 내놓는 토큰 값은 전부 `var(--jd-*)`다. 리터럴이 다시 들어오면
 *       그 순간 두 번째 어휘가 생긴 것이므로 실패한다.
 *   (B) 이름 N은 반드시 **같은 이름의** 토큰 변수를 가리킨다. off-by-one으로 밀리면
 *       (v2의 md→lg 밀림이 정확히 그거였다) 실패한다.
 *   (C) 토큰에 없는 이름은 조용히 다른 값으로 대체되지 않고 경고 후 버려진다.
 *
 * 소스를 읽지 않고 실제 엘리먼트를 마운트해 확인한다 — 표에 무엇이 적혀 있느냐가
 * 아니라 소비자가 무엇을 보느냐가 계약이다.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import { collectLeaves, cssVarName, loadTokens } from "../../../tokens/build/generate.mjs";
import "../src/components/box/index.js";
import type { JdBox } from "../src/components/box/element.js";

const tokens = loadTokens();
const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

async function resolve(attr: string, value: string, cssProp: string): Promise<string> {
  document.body.innerHTML = `<jd-box ${attr}="${value}"></jd-box>`;
  const el = document.body.firstElementChild as JdBox;
  await tick();
  return el.style.getPropertyValue(cssProp);
}

/** 토큰 트리의 잎 이름 → 기대 CSS 변수명 (생성기와 **같은 함수**로 만든다) */
function leafNames(category: string, tree: unknown): Map<string, string> {
  const out = new Map<string, string>();
  for (const leaf of collectLeaves(category, tree)) {
    // 스타일 프롭은 한 단계 이름만 받는다 (color.status.* 같은 중첩은 대상 아님)
    if (leaf.path.length !== 1) continue;
    out.set(String(leaf.path[0]), `var(${cssVarName(category, leaf.path)})`);
  }
  return out;
}

const AXES = [
  {
    axis: "radius",
    attr: "radius",
    cssProp: "border-radius",
    names: leafNames("radius", tokens.radius),
  },
  {
    axis: "shadow",
    attr: "shadow",
    cssProp: "box-shadow",
    names: leafNames("shadow", tokens.shadow),
  },
  {
    axis: "zIndex",
    attr: "z-index",
    cssProp: "z-index",
    names: leafNames("zindex", tokens.zindex),
  },
  {
    axis: "fontSize",
    attr: "font-size",
    cssProp: "font-size",
    // type은 서브그룹이 한 겹 더 있다 — path를 ["fontSize", key]로 맞춰 준다
    names: new Map(
      Object.keys(tokens.type.fontSize)
        .filter((k) => !k.startsWith("$"))
        .map((k) => [k, `var(${cssVarName("type", ["fontSize", k])})`]),
    ),
  },
] as const;

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("스타일 프롭 어휘는 tokens/*.json 하나다 (DEC-045)", () => {
  for (const { axis, attr, cssProp, names } of AXES) {
    test(`${axis} — 토큰 이름 전량이 같은 이름의 변수를 가리킨다 (예외 없음)`, async () => {
      expect(names.size, `${axis} 축에 토큰 잎이 없다`).toBeGreaterThan(0);
      for (const [name, expectedVar] of names) {
        // (A) 리터럴 금지 + (B) 이름 동일성 + 전량 노출 — 한 줄로 셋 다 잡힌다.
        // 예외를 허용하면 "어떤 이름이 되는지"를 표에서 찾아봐야 하므로 예외를 두지 않는다.
        expect(await resolve(attr, name, cssProp), `${attr}="${name}"`).toBe(expectedVar);
      }
    });

    test(`${axis} — 토큰에 없는 이름은 토큰 변수를 가리키지 않는다`, async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      for (const bogus of ["nope", "xxl", "9xl"]) {
        const got = await resolve(attr, bogus, cssProp);
        expect(got, `${attr}="${bogus}"가 토큰 변수로 해석됐다`).not.toMatch(/^var\(--jd-/);
      }
      warn.mockRestore();
    });
  }
});

describe("제거된 v2 어휘 (DEC-045)", () => {
  // v2 styleProps에만 있던 이름 — 전 저장소 호출부 0건이라 값 폴백 없이 버린다.
  // 조용히 이웃 값으로 바꿔주면 "왜 두께가 달라졌지"를 아무도 못 찾는다.
  const REMOVED: [attr: string, value: string, cssProp: string, label: string][] = [
    ["radius", "xs", "border-radius", 'radius="xs"'],
    ["radius", "3xl", "border-radius", 'radius="3xl"'],
    // 2xs는 여기 있었다 — v2 styleProps 전용 이름이라는 전제가 틀렸다(typography.ts의
    // 스텝이고 DocPager·NowPlayingBar가 실사용). DEC-051에서 토큰으로 승격돼
    // 위 AXES fontSize 단언이 대신 지킨다.
    ["font-size", "6xl", "font-size", 'fontSize="6xl"'],
    ["z-index", "docked", "z-index", 'zIndex="docked"'],
    ["z-index", "banner", "z-index", 'zIndex="banner"'],
    ["shadow", "inner", "box-shadow", 'shadow="inner"'],
  ];

  for (const [attr, value, cssProp, label] of REMOVED) {
    test(`${label} — 경고하고 버린다`, async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const got = await resolve(attr, value, cssProp);
      expect(got, `${label}이 아직 값을 내놓는다`).not.toMatch(/^var\(--jd-/);
      expect(warn, `${label} 경고 없음`).toHaveBeenCalledWith(expect.stringContaining(label));
      warn.mockRestore();
    });
  }
});
