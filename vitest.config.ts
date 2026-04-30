import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./ds/__tests__/setup.ts"],
    include: ["ds/__tests__/**/*.test.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "ds/__tests__/a11y/**",
    ],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["ds/**/*.{ts,tsx}"],
      exclude: [
        "ds/__tests__/**",
        "ds/**/index.ts",
        // Stories are demo wrappers, not library behavior under test.
        "ds/**/*.stories.tsx",
        // Token files are pure constants — coverage is not meaningful.
        "ds/tokens/**",
        // Type-only / declaration helpers
        "ds/**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
