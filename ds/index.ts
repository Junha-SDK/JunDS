// ─── junDS Design System ─────────────────────
// 전체 barrel export
//
// CSS 토큰을 import 해두면 rollup-plugin-postcss(extract)가
// dist/styles.css 로 추출한다. 소비자는 globals.css 등에서
// `@import "@junds/ui/styles.css";` 한 줄로 모든 디자인 토큰을 받는다.
import "./styles/tokens.css";

// Auth (License)
export { JunDSProvider, useJunDS, useLicenseStatus, withLicense } from "./auth";
export type { JunDSProviderProps } from "./auth";

// Core
export * from "./core";

// Primitives
export * from "./primitives";

// Composites
export * from "./composites";

// Patterns
export * from "./patterns";

// Layout
export * from "./layout";
// runtime 은 이름 충돌(Node·Breakpoint 등)을 피해 네임스페이스로 노출한다.
// 개별 심볼은 `@junds/ui/runtime` subpath 로 가져오는 것을 권장.
export * as runtime from "./runtime";

// Hooks
export * from "./hooks";

// Tokens
export * from "./tokens";

// Providers
export * from "./providers";

// Utils
export { cn } from "./utils/cn";
export { Slot, Slottable, createCompound } from "./utils";
export type { SlotProps } from "./utils";
export {
  applyKinsoku,
  applyKinsokuToHtml,
  stripKinsoku,
  remarkKinsoku,
  WORD_JOINER,
} from "./utils";
