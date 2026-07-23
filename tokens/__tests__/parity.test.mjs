/**
 * v2 패리티 테스트 (02-tokens §6) — "임의 변경 금지" 원칙의 기계적 집행자.
 *
 * 1. ds/styles/tokens.css(동결본, 정본)의 라이트 27 + 다크 17 변수 값이
 *    legacy-map을 통해 생성된 v3 CSS와 전 항목 일치하는지 단언.
 * 2. TS 리터럴 토큰(ds/tokens/*.ts)은 동적 import로 동일 비교.
 * 3. Swift 산출물의 0xRRGGBBAA 리터럴을 재파싱해 JSON과 대조.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  REPO_ROOT, OUT_CSS, OUT_SWIFT,
  loadTokens, collectLeaves, cssVarName, colorToRRGGBBAA, resolveAlias, aliasToVar,
} from "../build/generate.mjs";
import { legacyLightColorMap, legacyDarkColorMap, legacyShadowKeyMap } from "../build/legacy-map.mjs";

// v2 소스 (동결 — 읽기 전용)
import { spacing as v2Spacing } from "../../ds/tokens/spacing.ts";
import { radius as v2Radius } from "../../ds/tokens/radius.ts";
import { fontSize as v2FontSize, fontWeight as v2FontWeight, lineHeight as v2LineHeight, letterSpacing as v2LetterSpacing } from "../../ds/tokens/typography.ts";
import { shadows as v2Shadows } from "../../ds/tokens/shadows.ts";
import { duration as v2Duration, easing as v2Easing } from "../../ds/tokens/animation.ts";
import { zIndex as v2ZIndex } from "../../ds/tokens/zindex.ts";
import { opacity as v2Opacity } from "../../ds/tokens/opacity.ts";
import { borderWidth as v2BorderWidth } from "../../ds/tokens/borderWidth.ts";
import { breakpoints as v2Breakpoints, mediaQueries as v2MediaQueries } from "../../ds/tokens/breakpoints.ts";
import { gradients as v2Gradients } from "../../ds/tokens/gradients.ts";
import { colors as v2Colors, priorityColors as v2PriorityColors, statusColors as v2StatusColors } from "../../ds/tokens/colors.ts";

const tokens = loadTokens();
const v2Css = readFileSync(join(REPO_ROOT, "ds/styles/tokens.css"), "utf8");
const v3Css = readFileSync(OUT_CSS, "utf8");

function extractVars(blockText) {
  const map = {};
  for (const m of blockText.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map[m[1]] = m[2].trim();
  return map;
}
function blocks(css, selectorRe) {
  const out = [];
  for (const m of css.matchAll(selectorRe)) out.push(m[1]);
  return out;
}

// v2: 모든 :root 블록 병합 후 프레임워크 노브(--jds-*)는 제외 (DEC-008-(4) 폐기 대상)
const v2Light = Object.fromEntries(
  Object.entries(
    blocks(v2Css, /:root\s*\{([^}]*)\}/g).map(extractVars).reduce((a, b) => ({ ...a, ...b }), {}),
  ).filter(([k]) => !k.startsWith("--jds-")),
);
const v2Dark = extractVars(blocks(v2Css, /\[data-theme="dark"\]\s*\{([^}]*)\}/g)[0] ?? "");

const v3Root = extractVars(blocks(v3Css, /:root\s*\{([^}]*)\}/g)[0] ?? "");
const v3Dark = extractVars(
  blocks(v3Css, /\[data-jd-theme="dark"\],\s*\[data-theme="dark"\]\s*\{([^}]*)\}/g)[0] ?? "",
);

/** {color.x} 별칭 → v2 변수명 var()로 번역 (역-legacy-map) */
const v3ToV2Var = Object.fromEntries(Object.entries(legacyLightColorMap).map(([a, b]) => [b, a]));
const aliasToV2 = (value) =>
  aliasToVar(tokens, value).replace(/var\((--jd-[\w-]+)\)/g, (_, name) => {
    const v2Name = v3ToV2Var[name];
    if (!v2Name) throw new Error(`역매핑 없음: ${name}`);
    return `var(${v2Name})`;
  });

/**
 * 승인된 패리티 이탈 — "값 임의 변경 금지" 원칙의 유일한 합법 통로 (DECISIONS 기록 의무).
 * 각 항목: v3 변수 → { v2: 동결본 기대값(전제 검증 — v2가 바뀌면 재심의), v3: 승인값, dec: 근거 }.
 * 여기 없는 이탈은 여전히 테스트 실패다.
 */
const SANCTIONED_DEVIATIONS = {
  // web-a11y 게이트 실측: 흰 글자 on #dc3f3f 4.35:1 등 WCAG AA 미달 → 라이트만 보정
  "--jd-color-danger": { v2: "#dc3f3f", v3: "#c93636", dec: "DEC-027" },
};

describe("v2 CSS ↔ 생성 CSS 패리티 (legacy-map 전량)", () => {
  test("라이트 27변수 — 값 전 항목 일치 (승인 이탈은 승인값으로 고정)", () => {
    expect(Object.keys(v2Light).sort()).toEqual(Object.keys(legacyLightColorMap).sort());
    expect(Object.keys(v2Light)).toHaveLength(27);
    for (const [v2Name, v3Name] of Object.entries(legacyLightColorMap)) {
      const dev = SANCTIONED_DEVIATIONS[v3Name];
      if (dev) {
        expect(v2Light[v2Name], `${v2Name} 동결본 전제 (${dev.dec} 재심의 필요)`).toBe(dev.v2);
        expect(v3Root[v3Name], `${v2Name} → ${v3Name} 승인값 (${dev.dec})`).toBe(dev.v3);
      } else {
        expect(v3Root[v3Name], `${v2Name} → ${v3Name}`).toBe(v2Light[v2Name]);
      }
    }
  });

  test("다크 17변수(--dm-* 3종 포함) — 캐스케이드 유효값 일치", () => {
    expect(Object.keys(v2Dark).sort()).toEqual(Object.keys(legacyDarkColorMap).sort());
    expect(Object.keys(v2Dark)).toHaveLength(17);
    for (const [v2Name, v3Name] of Object.entries(legacyDarkColorMap)) {
      const effective = v3Dark[v3Name] ?? v3Root[v3Name]; // 오버라이드 모델: dark 미방출 = root 상속
      expect(effective, `${v2Name} → ${v3Name}`).toBe(v2Dark[v2Name]);
    }
  });

  test("다크 블록은 color-scheme: dark를 유지", () => {
    expect(v3Css).toMatch(/\[data-jd-theme="dark"\],\s*\[data-theme="dark"\]\s*\{[^}]*color-scheme:\s*dark;/);
  });
});

describe("v2 TS 리터럴 토큰 ↔ tokens/*.json 패리티", () => {
  const strip = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("$")));

  test("spacing", () => expect(strip(tokens.space)).toEqual(v2Spacing));
  test("radius (DEC-008-(4): radius.ts 4/6/8/12 정본)", () => expect(strip(tokens.radius)).toEqual(v2Radius));
  test("typography", () => {
    expect(strip(tokens.type.fontSize)).toEqual(v2FontSize);
    expect(strip(tokens.type.fontWeight)).toEqual(v2FontWeight);
    expect(strip(tokens.type.lineHeight)).toEqual(v2LineHeight);
    expect(strip(tokens.type.letterSpacing)).toEqual(v2LetterSpacing);
  });
  test("shadows — 라이트 값 + 개명 2건(glow→focusRing, danger→focusRingDanger)", () => {
    expect(Object.keys(v2Shadows).sort()).toEqual(Object.keys(legacyShadowKeyMap).sort());
    for (const [v2Key, v3Key] of Object.entries(legacyShadowKeyMap)) {
      const leaf = tokens.shadow[v3Key];
      const light = typeof leaf === "object" ? leaf.light : leaf;
      expect(aliasToV2(light), `shadow ${v2Key}`).toBe(v2Shadows[v2Key]);
    }
  });
  test("motion (duration/easing — animationClass는 설계상 제외 §4.4)", () => {
    expect(strip(tokens.motion.duration)).toEqual(v2Duration);
    expect(strip(tokens.motion.easing)).toEqual(v2Easing);
  });
  test("zIndex — zindex.ts 정본 (export-tokens.mjs 부패본 아님)", () =>
    expect(strip(tokens.zindex)).toEqual(v2ZIndex));
  test("opacity / borderWidth / breakpoints / mediaQueries", () => {
    expect(strip(tokens.opacity)).toEqual(v2Opacity);
    expect(strip(tokens.border)).toEqual(v2BorderWidth);
    expect(strip(tokens.breakpoint)).toEqual(v2Breakpoints);
    const mq = Object.fromEntries(
      Object.entries(strip(tokens.breakpoint)).map(([k, v]) => [k, `(min-width: ${v}px)`]),
    );
    expect(mq).toEqual(v2MediaQueries);
  });
  test("gradients — 별칭을 v2 변수명으로 되돌리면 문자열 완전 일치", () => {
    const g = Object.fromEntries(Object.entries(strip(tokens.gradient)).map(([k, v]) => [k, aliasToV2(v)]));
    expect(g).toEqual(v2Gradients);
  });
  test("status/priority 컬러 — colors.ts 리터럴 일치", () => {
    expect(strip(tokens.color.status)).toEqual(v2StatusColors);
    const p = Object.values(strip(tokens.color.priority));
    Object.entries(v2PriorityColors).forEach(([k, v]) => {
      const { label, ...rest } = v;
      expect(p[Number(k)]).toEqual(rest);
    });
  });
  test("colors.ts var() 그룹 표면 — 모든 참조 변수가 legacy-map 라이트 27에 존재", () => {
    const walk = (o) => Object.values(o).flatMap((v) => (typeof v === "string" ? [v] : walk(v)));
    for (const ref of walk(v2Colors)) {
      const name = ref.match(/^var\((--[\w-]+)\)$/)?.[1];
      expect(name && legacyLightColorMap[name], ref).toBeTruthy();
    }
  });
});

describe("Swift 산출물 값 검증 (0xRRGGBBAA 재파싱)", () => {
  const swift = readFileSync(OUT_SWIFT, "utf8");
  const parsed = {};
  for (const m of swift.matchAll(
    /public static let `?(\w+)`? = JdDynamicColor\(light: 0x([0-9A-F]{8}), dark: 0x([0-9A-F]{8})\)/g,
  )) parsed[m[1]] = { light: m[2], dark: m[3] };

  test("모든 color 리프가 방출되고 hex가 원본 JSON과 일치", () => {
    const leaves = collectLeaves("color", tokens.color);
    expect(Object.keys(parsed)).toHaveLength(leaves.length);
    for (const leaf of leaves) {
      const name = leaf.path
        .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
        .join("");
      expect(parsed[name], name).toBeTruthy();
      expect(parsed[name].light).toBe(colorToRRGGBBAA(resolveAlias(tokens, leaf.light, "light")));
      expect(parsed[name].dark).toBe(colorToRRGGBBAA(resolveAlias(tokens, leaf.dark, "dark")));
    }
  });

  test("rgba 알파 환산 예시 고정값 (02-tokens §4.2: 0.18 → 2E)", () => {
    expect(colorToRRGGBBAA("rgba(91, 76, 199, 0.18)")).toBe("5B4CC72E");
    expect(colorToRRGGBBAA("#5b4cc7")).toBe("5B4CC7FF");
  });
});
