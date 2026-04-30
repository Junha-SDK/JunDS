import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

// eslint-config-next already registers the jsx-a11y plugin under the
// "jsx-a11y/" namespace, so we cannot include `jsxA11y.flatConfigs.recommended`
// directly (it would re-register the plugin and ESLint rejects that). Instead
// we apply the *rules* from the plugin's recommended preset to the same set of
// JSX/TSX files. This gives us the same rule coverage without the plugin
// collision.
const jsxA11yRecommendedRules = jsxA11y.flatConfigs.recommended.rules;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: jsxA11yRecommendedRules,
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build output / generated bundles — not source.
    "dist/**",
    "storybook-static/**",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
  // React 19 / Next 16 ships strict compiler-flavored rules that flag
  // idiomatic patterns (SSR mount flag, ref reads in render for layout
  // measurement, intentional reassignment of memoized values). They are
  // useful as guidance, but for a design-system library with 170+
  // components we treat them as warnings rather than blockers.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Utility types in a design-system library legitimately use `any`
      // (Table<T = any>, useForm<T extends Record<string, any>>, …) where
      // forcing `unknown` would push casts onto every consumer.
      "@typescript-eslint/no-explicit-any": "warn",

      // jsx-a11y rule overrides — design-system specific.
      //
      // Modal/Drawer/Sheet/BottomSheet etc. all render a backdrop <div> that
      // dismisses the overlay on click. This is the canonical pattern (the
      // ESC key + dialog focus trap supply keyboard equivalence at the root
      // dialog level), but lint flags every backdrop. Likewise drag handles
      // (CompareSlider, SplitPane, Resizable) are inherently mouse/touch
      // gestures with no keyboard equivalent. Downgrade to warn so authors
      // still see the reminder but builds don't fail on legitimate UI.
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      // AudioPlayer / VideoPlayer are generic primitives — consumers supply
      // their own <track> via children when captions exist. Enforcing it on
      // the primitive itself isn't actionable.
      "jsx-a11y/media-has-caption": "warn",
    },
  },
]);

export default eslintConfig;
