/** junDS 타이포그래피 토큰 */
export const fontSize = {
  xs: "0.75rem",    // 12px
  sm: "0.8125rem",  // 13px
  md: "0.875rem",   // 14px
  lg: "1rem",       // 16px
  xl: "1.125rem",   // 18px
  "2xl": "1.25rem", // 20px
  "3xl": "1.5rem",  // 24px
  "4xl": "1.875rem",// 30px
  "5xl": "2.25rem", // 36px
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
} as const;
