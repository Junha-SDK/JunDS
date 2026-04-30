// ─── junDS Design System ─────────────────────
// 전체 barrel export

// Auth (License)
export {
  JunDSProvider,
  useJunDS,
  useLicenseStatus,
  withLicense,
} from "./auth";
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
