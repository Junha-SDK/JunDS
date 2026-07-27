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
  loadTokens, collectLeaves, cssVarName, colorToRRGGBBAA, resolveAlias, aliasToVar, swiftKey,
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

/**
 * DEC-039 — v2 시각을 물려받는 대신 v3 고유 시각 언어로 승격한 항목.
 *
 * 색 토큰(위 SANCTIONED_DEVIATIONS)과 달리 엘리베이션·모션은 **스케일 전체**가
 * 교체되므로 항목별 v2 기대값을 함께 적어 둔다. v2 동결본이 바뀌면 여기서 먼저
 * 실패한다 — 즉 "v2가 조용히 움직였다"와 "v3가 의도적으로 갈라졌다"를 구분한다.
 */
/**
 * DEC-041 — v2가 물려준 **미정의 변수 참조** 3종의 결선.
 *
 * `var(--primary-soft)`·`var(--surface)`는 v2 CSS 어디에도 선언된 적이 없다(실측).
 * CSS는 무효 var()가 섞인 선언 전체를 버리므로 세 그래디언트는 v2에서도 v3에서도
 * **아무것도 그리지 않고 있었다** — 패리티가 지켜 온 것이 동작이 아니라 결함이었다.
 * v2 기대값을 함께 고정해 "v2가 조용히 움직였다"와 구분한다.
 */
const GRADIENT_UNDEFINED_REF_FIX = {
  primarySoft: {
    v2: "linear-gradient(135deg, var(--primary-soft) 0%, var(--primary-glow) 100%)",
    v3: "linear-gradient(135deg, var(--jd-color-primary-light) 0%, var(--jd-color-primary-glow) 100%)",
  },
  surfaceTop: {
    v2: "linear-gradient(180deg, var(--surface) 0%, transparent 100%)",
    v3: "linear-gradient(180deg, var(--jd-color-surface) 0%, transparent 100%)",
  },
  surfaceBottom: {
    v2: "linear-gradient(0deg, var(--surface) 0%, transparent 100%)",
    v3: "linear-gradient(0deg, var(--jd-color-surface) 0%, transparent 100%)",
  },
};

const V3_ELEVATION_REWORK = {
  xs: "0 1px 2px rgba(0,0,0,0.04)",
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
  "2xl": "0 25px 50px -12px rgba(0,0,0,0.15)",
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
  test("shadows — 키 집합은 v2 그대로, 값은 DEC-039 승격분만 이탈", () => {
    expect(Object.keys(v2Shadows).sort()).toEqual(Object.keys(legacyShadowKeyMap).sort());
    for (const [v2Key, v3Key] of Object.entries(legacyShadowKeyMap)) {
      const leaf = tokens.shadow[v3Key];
      const light = typeof leaf === "object" ? leaf.light : leaf;
      const reworked = V3_ELEVATION_REWORK[v3Key];
      if (reworked !== undefined) {
        // v2 동결본 전제 검증 — v2가 움직였다면 DEC-039 재심의
        expect(v2Shadows[v2Key], `shadow ${v2Key} v2 동결본 전제 (DEC-039 재심의)`).toBe(reworked);
        // 승격 계약: 접지 + 주변광 2겹 (1겹으로 되돌아가면 실패)
        expect(String(light).split(/,(?![^(]*\))/), `shadow ${v2Key} 2겹 계약`).toHaveLength(2);
      } else {
        expect(aliasToV2(light), `shadow ${v2Key}`).toBe(v2Shadows[v2Key]);
      }
    }
  });
  test("motion — v2 duration/easing은 값까지 불변, v3 추가분만 허용 (DEC-039)", () => {
    // 부분집합 단언: v2 키는 전부 남아 있고 값도 그대로여야 한다.
    // v3가 새로 더한 키(press/snap/emphasis, emphasized/overshoot)만 초과 허용.
    expect(strip(tokens.motion.duration)).toMatchObject(v2Duration);
    expect(strip(tokens.motion.easing)).toMatchObject(v2Easing);
    const added = (v3, v2) => Object.keys(v3).filter((k) => !(k in v2));
    expect(added(strip(tokens.motion.duration), v2Duration)).toEqual(["press", "snap", "emphasis"]);
    expect(added(strip(tokens.motion.easing), v2Easing)).toEqual(["emphasized", "overshoot"]);
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
  test("gradients — 별칭을 v2 변수명으로 되돌리면 문자열 완전 일치 (미정의 참조 3종 제외)", () => {
    const raw = strip(tokens.gradient);
    const g = {};
    for (const [k, v] of Object.entries(raw)) {
      // 이탈 3종은 v2에 대응 변수가 없다(그게 결함이었다) — v3 변수명 그대로 단언한다
      if (k in GRADIENT_UNDEFINED_REF_FIX) continue;
      g[k] = aliasToV2(v);
    }
    for (const [key, { v2, v3 }] of Object.entries(GRADIENT_UNDEFINED_REF_FIX)) {
      expect(v2Gradients[key], `v2 gradient.${key} 가 움직였다 — 이탈 재심의 필요`).toBe(v2);
      expect(aliasToVar(tokens, raw[key]), `v3 gradient.${key}`).toBe(v3);
    }
    const expected = { ...v2Gradients };
    for (const key of Object.keys(GRADIENT_UNDEFINED_REF_FIX)) delete expected[key];
    expect(g).toEqual(expected);
  });
  test("status/priority 컬러 — 라이트는 colors.ts 리터럴 일치, 다크만 신설 (DEC-041)", () => {
    const light = (o) =>
      Object.fromEntries(Object.entries(o).map(([k, v]) => [
        k,
        Object.fromEntries(Object.entries(strip(v)).map(([p, m]) => {
          expect(Object.keys(strip(m)).sort(), `color.${k}.${p}`).toEqual(["dark", "light"]);
          return [p, m.light];
        })),
      ]));
    expect(light(strip(tokens.color.status))).toEqual(v2StatusColors);
    const p = Object.values(light(strip(tokens.color.priority)));
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
      // 이름 규칙은 generate.mjs의 swiftKey를 그대로 쓴다 — 테스트가 규칙을
      // 재구현하면 "산출물 간 불일치 구조적 차단"(§5-4) 원칙이 무너진다.
      // (숫자 시작 세그먼트: color 램프 200 → n200 → neutralN200)
      const name = leaf.path
        .map((s) => swiftKey(s, "color"))
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
