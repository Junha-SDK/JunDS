/**
 * codemod-token-vocabulary 계약 (DEC-045).
 *
 * ## 왜 테스트가 필요한가
 * 처음 구현은 이름을 하나씩 순차 치환해서 **연쇄됐다** — `md`를 `lg`로 바꾼 값이 다음
 * 규칙(`lg`→`xl`)에 다시 걸려 척도 끝까지 밀렸다(`radius="md"`가 `"2xl"`이 됐다).
 * codemod가 조용히 틀리면 그게 전 코드베이스에 한 번에 퍼지므로, 가장 위험한 도구다.
 *
 * 지키는 성질은 둘:
 *  1. **값 보존** — 옮긴 이름이 v2와 같은 픽셀을 가리킨다. 마이그레이션은 구조 정리이지
 *     디자인 변경이 아니다.
 *  2. **한 패스 안에서 한 칸만 이동** — 순차 치환의 연쇄를 막는다.
 *
 * ⚠️ **멱등이 아니다, 그리고 될 수 없다.** 이동 후의 이름(`lg`)은 그 자체로 유효한 v2
 * 이름이라, 두 번째 실행은 그것을 또 옮긴다. 값만 보고 "이미 옮겼는지"를 알 방법이 없다.
 * 이건 이름 이동형 codemod의 성질이지 결함이 아니므로, **고치려 들지 말고** 한 번만
 * 돌리도록 도구가 경고한다. 아래 테스트가 그 비멱등성을 의도된 것으로 못 박는다 —
 * 누군가 "멱등하게 만들자"며 상태를 끼워 넣으면 그때 더 나빠진다.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { RENAMES, transform } from "../../scripts/codemod-token-vocabulary.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const tokens = {
  radius: JSON.parse(readFileSync(join(HERE, "..", "radius.json"), "utf8")),
  type: JSON.parse(readFileSync(join(HERE, "..", "type.json"), "utf8")),
};

/** v2 styleProps 척도 (동결본) — codemod의 출발점 */
const V2_RADIUS = {
  none: "0px",
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  full: "9999px",
};
const V2_FONT_SIZE = {
  "2xs": "0.625rem",
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
};

/** "0.375rem" · "6px" → px 수치 (rem은 16px 기준 — tokens 생성기와 같은 전제) */
function px(value) {
  const v = String(value);
  if (v.endsWith("rem")) return parseFloat(v) * 16;
  return parseFloat(v);
}

describe("값 보존 — 옮긴 이름이 v2와 같은 픽셀이다", () => {
  test("radius", () => {
    for (const [from, to] of Object.entries(RENAMES.radius)) {
      if (to === null) {
        // 대체가 없다고 선언했으면 실제로 토큰 척도에 그 값이 **없어야** 한다.
        // 있는데 null이면 자동화할 수 있는 것을 사람에게 미룬 것이다.
        const v2 = px(V2_RADIUS[from]);
        const exists = Object.values(tokens.radius).some((t) => px(t) === v2);
        expect(exists, `radius ${from}(${v2}px)는 토큰에 같은 값이 있다 — 대체를 적어라`).toBe(
          false,
        );
        continue;
      }
      expect(px(tokens.radius[to]), `radius ${from}→${to}`).toBe(px(V2_RADIUS[from]));
    }
  });

  test("fontSize", () => {
    for (const [from, to] of Object.entries(RENAMES.fontSize)) {
      if (to === null) {
        const v2 = px(V2_FONT_SIZE[from]);
        const exists = Object.entries(tokens.type.fontSize)
          .filter(([k]) => !k.startsWith("$"))
          .some(([, t]) => px(t) === v2);
        expect(exists, `fontSize ${from}(${v2}px)는 토큰에 같은 값이 있다 — 대체를 적어라`).toBe(
          false,
        );
        continue;
      }
      expect(px(tokens.type.fontSize[to]), `fontSize ${from}→${to}`).toBe(px(V2_FONT_SIZE[from]));
    }
  });
});

describe("한 패스 안에서 한 칸만 이동한다", () => {
  const source = `
    <jd-box radius="xs" font-size="sm"></jd-box>
    <jd-box radius="sm" font-size="md"></jd-box>
    <jd-box radius="md" font-size="lg"></jd-box>
    <jd-box radius="lg" font-size="xl"></jd-box>
    <jd-box radius="xl" font-size="4xl" z-index="banner"></jd-box>
    <Box radius="md" fontSize="md" />
  `;

  // 두 번 돌리면 또 옮겨진다 — 의도된 성질이다(위 파일 주석). 여기서 고정해 두어
  // 누군가 "멱등하게 만들자"며 상태 파일이나 마커를 끼워 넣지 않게 한다.
  // 도구 쪽 방어는 CLI 경고이고, 그 경고가 이 사실의 유일한 안전장치다.
  test("두 번 돌리면 또 옮겨진다 (비멱등 — 알려진 성질)", () => {
    const once = transform(source).output;
    const twice = transform(once).output;
    expect(twice).not.toBe(once);
  });

  test("각 이름이 정확히 한 칸만 이동한다", () => {
    const { output } = transform(source);
    // radius: xs→sm sm→md md→lg lg→xl xl→2xl
    expect(output).toContain('radius="sm"');
    expect(output).toContain('radius="md"');
    expect(output).toContain('radius="lg"');
    expect(output).toContain('radius="xl"');
    expect(output).toContain('radius="2xl"');
    // 연쇄가 있었다면 전부 2xl로 몰렸을 것이다
    expect(output.match(/radius="2xl"/g)).toHaveLength(1);
  });

  test("kebab attribute와 camel 프로퍼티를 모두 옮긴다", () => {
    const { output } = transform(`<Box fontSize="md" /><jd-box font-size="md">`);
    expect(output).toContain('fontSize="lg"');
    expect(output).toContain('font-size="lg"');
  });
});

describe("사람이 정해야 하는 자리는 건드리지 않는다", () => {
  test("토큰 척도에 없는 값은 그대로 두고 보고한다", () => {
    const { output, manual } = transform(`<jd-box radius="3xl" font-size="2xs">`);
    expect(output).toContain('radius="3xl"');
    expect(output).toContain('font-size="2xs"');
    expect(manual.map((m) => m.from).sort()).toEqual(["2xs", "3xl"]);
  });

  test("동적 값은 바꾸지 않고 보고한다", () => {
    const { output, manual } = transform(`<Box radius={size} />`);
    expect(output).toContain("radius={size}");
    expect(manual.some((m) => m.from === "(동적 값)")).toBe(true);
  });
});
