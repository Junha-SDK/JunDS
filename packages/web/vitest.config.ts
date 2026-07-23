import { defineConfig } from "vitest/config";

// 03-web-arch §9.1: 단위층 = vitest + happy-dom (CE v1·attachInternals 지원, jsdom보다 빠름)
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["__tests__/**/*.test.ts"],
  },
});
