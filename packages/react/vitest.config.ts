import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// @junds/web은 소스로 별칭 — 테스트가 dist 빌드 신선도에 의존하지 않게 한다.
// 배럴(src/index.ts)이 아니라 컴포넌트 딥 경로만 별칭: 병행 트랙이 수정 중인
// 웹 루트 파일에 테스트가 얽히지 않도록 파일럿 3종 경로로 한정한다.
const w = (s: string) => fileURLToPath(new URL(`../web/src/${s}`, import.meta.url));

export default defineConfig({
  test: {
    environment: "happy-dom", // adoptedStyleSheets 지원(§9.1) — jsdom은 constructable sheet 미지원
    globals: true, // @testing-library/react 자동 cleanup 활성 조건
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/generated/index.ts",
        "src/index.ts",
        "src/jsx.ts",
        "src/tokens.generated.ts",
      ],
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "../../coverage/react",
      // 2026-07-27 실측(lines 98.3 / branches 85.1 / functions 93.9)의
      // 작은 흔들림은 허용하되 생성·손작성 어댑터의 큰 회귀는 즉시 막는다.
      thresholds: {
        lines: 97,
        statements: 96,
        functions: 92,
        branches: 82,
      },
    },
  },
  resolve: {
    // 접두 매칭 오염 방지: element 딥 경로를 먼저(더 긴 키 우선) 둔다
    alias: [
      { find: "@junds/web/button/element", replacement: w("components/button/element.ts") },
      { find: "@junds/web/button", replacement: w("components/button/index.ts") },
      { find: "@junds/web/text-field/element", replacement: w("components/text-field/element.ts") },
      { find: "@junds/web/text-field", replacement: w("components/text-field/index.ts") },
      { find: "@junds/web/modal/element", replacement: w("components/modal/element.ts") },
      { find: "@junds/web/modal", replacement: w("components/modal/index.ts") },
    ],
  },
});
