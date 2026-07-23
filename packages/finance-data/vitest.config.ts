import { defineConfig } from "vitest/config";

// 01-repo-structure §9 finance-data-test: vitest, 모킹 기반 — 실 API 호출 금지.
// 네트워크(fetch)·EventSource·node:fs 는 각 테스트에서 스텁한다.
export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
});
