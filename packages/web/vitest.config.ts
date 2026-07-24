import { defineConfig } from "vitest/config";

// 03-web-arch §9.1: 단위층 = vitest + happy-dom (CE v1·attachInternals 지원, jsdom보다 빠름)
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["__tests__/**/*.test.ts"],
    // 389종 배럴 import·전 컴포넌트 스모크는 기본 5초를 넘긴다(라이브러리 규모 증가) —
    // 컴포넌트 결함이 아니라 로드 시간이므로 여유를 준다.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
