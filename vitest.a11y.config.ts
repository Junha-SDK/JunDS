/**
 * Vitest config for the on-demand accessibility audit.
 *
 * The audit lives at `ds/__tests__/a11y/**` and is excluded from the regular
 * `npm test` run by `vitest.config.ts`. This sibling config only runs the
 * audit suite, used by `npm run audit:a11y`.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./ds/__tests__/setup.ts"],
    include: ["ds/__tests__/a11y/**/*.test.{ts,tsx}"],
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
