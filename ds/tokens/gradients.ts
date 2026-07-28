/** junDS 그라디언트 토큰 — 자주 쓰는 프리셋 */
export const gradients = {
  // Brand
  primary: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
  primarySoft: "linear-gradient(135deg, var(--primary-soft) 0%, var(--primary-glow) 100%)",

  // Semantic
  success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  danger: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
  info: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",

  // Neutral elevation
  surfaceTop: "linear-gradient(180deg, var(--surface) 0%, transparent 100%)",
  surfaceBottom: "linear-gradient(0deg, var(--surface) 0%, transparent 100%)",

  // Decorative
  sunset: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
  ocean: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
  aurora: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  midnight: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  cyber: "linear-gradient(135deg, #ff00cc 0%, #333399 100%)",
  forest: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  flame: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
  candy: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",

  // Skeleton / shimmer
  shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
} as const;

export type GradientPreset = keyof typeof gradients;
