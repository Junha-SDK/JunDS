import { defineConfig } from "vitest/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// 토큰 패리티 테스트 전용 config — 루트 vitest.config.ts(ds/__tests__ jsdom)와 분리.
// 실행: npm run tokens:test  (nvm node 22)
export default defineConfig({
  test: {
    environment: "node",
    include: [join(here, "__tests__/**/*.test.mjs")],
  },
});
