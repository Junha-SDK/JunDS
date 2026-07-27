import { defineConfig } from "vitest/config";

// 03-web-arch §9.1: 단위층 = vitest + happy-dom (CE v1·attachInternals 지원, jsdom보다 빠름)
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["./__tests__/setup.ts"],
    // 389종 배럴 import·전 컴포넌트 스모크는 기본 5초를 넘긴다(라이브러리 규모 증가) —
    // 컴포넌트 결함이 아니라 로드 시간이므로 여유를 준다.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.css.ts",
        "src/cdn.ts",
        "src/define.ts",
        "src/index.ts",
        "src/components.generated.ts",
      ],
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "../../coverage/web",
      // 2026-07-27 실측(lines 54.0 / branches 29.3 / functions 48.0)을
      // 바로 100%로 가장하지 않고, 현재 수준의 하락부터 막는 초기 회귀선이다.
      thresholds: {
        lines: 53,
        statements: 50,
        functions: 46,
        branches: 28,
      },
    },
  },
});
