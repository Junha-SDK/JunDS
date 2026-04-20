/** junDS 애니메이션 토큰 */
export const duration = {
  instant: "0ms",
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",
  slower: "500ms",
} as const;

export const easing = {
  default: "cubic-bezier(0.16, 1, 0.3, 1)",
  linear: "linear",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

/** Tailwind 애니메이션 클래스명 */
export const animationClass = {
  fadeIn: "animate-fade-in",
  fadeInScale: "animate-fade-in-scale",
  slideUp: "animate-slide-up",
  slideIn: "animate-slide-in",
  slideInRight: "animate-slide-in-right",
  float: "animate-float",
  glow: "animate-glow",
  spinSlow: "animate-spin-slow",
  pulseSoft: "animate-pulse-soft",
  scaleIn: "animate-scale-in",
  countUp: "animate-count-up",
  progress: "animate-progress",
} as const;
