/**
 * JunDS Framework — Style Props System v2
 *
 * 모든 레이아웃/스타일을 토큰 기반 props로 제약.
 * v2: 반응형 props, 네거티브 spacing, 확장 토큰, spacing multiplier
 */

/* ═══════════════════════════ Token Scales ═══════════════════════════ */

/* ─── Spacing Scale ─── */
const SPACING: Record<string | number, string> = {
  0: "0px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
  36: "144px",
  40: "160px",
  // Named
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "96px",
};

/* ─── Color Tokens ─── */
const COLORS: Record<string, string> = {
  primary: "var(--primary)",
  "primary-hover": "var(--primary-hover)",
  "primary-light": "var(--primary-light)",
  "primary-glow": "var(--primary-glow)",
  accent: "var(--accent)",
  "accent-light": "var(--accent-light)",
  danger: "var(--danger)",
  "danger-hover": "var(--danger-hover)",
  "danger-light": "var(--danger-light)",
  success: "var(--success)",
  "success-light": "var(--success-light)",
  warning: "var(--warning)",
  "warning-light": "var(--warning-light)",
  info: "var(--info)",
  "info-light": "var(--info-light)",
  background: "var(--background)",
  foreground: "var(--foreground)",
  surface: "var(--background)",
  "surface-raised": "var(--card)",
  card: "var(--card)",
  "card-hover": "var(--card-hover)",
  border: "var(--border)",
  "border-light": "var(--border-light)",
  muted: "var(--muted)",
  "muted-light": "var(--muted-light)",
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  inherit: "inherit",
  current: "currentColor",
};

/* ─── Radius ─── */
const RADII: Record<string, string> = {
  none: "0px",
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  full: "9999px",
};

/* ─── Shadows ─── */
const SHADOWS: Record<string, string> = {
  none: "none",
  xs: "0 1px 2px rgba(0,0,0,0.05)",
  sm: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  md: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
  lg: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
  xl: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
  "2xl": "0 25px 50px rgba(0,0,0,0.15)",
  inner: "inset 0 2px 4px rgba(0,0,0,0.06)",
};

/* ─── Font Sizes ─── */
const FONT_SIZES: Record<string, string> = {
  "2xs": "0.625rem",
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
};

/* ─── Font Weights ─── */
const FONT_WEIGHTS: Record<string, number> = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

/* ─── Line Heights ─── */
const LINE_HEIGHTS: Record<string, string | number> = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

/* ─── Letter Spacings ─── */
const LETTER_SPACINGS: Record<string, string> = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
};

/* ─── Z-Index Scale ─── */
const Z_INDICES: Record<string, number> = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
};

/* ─── Transitions ─── */
const TRANSITIONS: Record<string, string> = {
  none: "none",
  fast: "all 100ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  colors: "color, background-color, border-color 200ms ease",
  transform: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  shadow: "box-shadow 200ms ease",
};

/* ─── Breakpoints ─── */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/* ═══════════════════════════ Types ═══════════════════════════ */

export type SpacingToken = keyof typeof SPACING;
export type ColorToken = keyof typeof COLORS;
export type RadiusToken = keyof typeof RADII;
export type ShadowToken = keyof typeof SHADOWS;
export type FontSizeToken = keyof typeof FONT_SIZES;
export type FontWeightToken = keyof typeof FONT_WEIGHTS;
export type LineHeightToken = keyof typeof LINE_HEIGHTS;
export type LetterSpacingToken = keyof typeof LETTER_SPACINGS;
export type ZIndexToken = keyof typeof Z_INDICES | number;
export type TransitionToken = keyof typeof TRANSITIONS | boolean;

/** 반응형 값: 단일값 또는 브레이크포인트별 객체 */
export type Responsive<T> = T | Partial<Record<"base" | BreakpointKey, T>>;

export interface StyleProps {
  // Spacing (반응형 지원)
  p?: Responsive<SpacingToken>;
  px?: Responsive<SpacingToken>;
  py?: Responsive<SpacingToken>;
  pt?: Responsive<SpacingToken>;
  pr?: Responsive<SpacingToken>;
  pb?: Responsive<SpacingToken>;
  pl?: Responsive<SpacingToken>;
  m?: Responsive<SpacingToken>;
  mx?: Responsive<SpacingToken>;
  my?: Responsive<SpacingToken>;
  mt?: Responsive<SpacingToken>;
  mr?: Responsive<SpacingToken>;
  mb?: Responsive<SpacingToken>;
  ml?: Responsive<SpacingToken>;
  gap?: Responsive<SpacingToken>;
  rowGap?: Responsive<SpacingToken>;
  columnGap?: Responsive<SpacingToken>;
  // Sizing
  w?: Responsive<string | number>;
  h?: Responsive<string | number>;
  minW?: string | number;
  minH?: string | number;
  maxW?: string | number;
  maxH?: string | number;
  // Color
  bg?: Responsive<ColorToken>;
  color?: Responsive<ColorToken>;
  borderColor?: ColorToken;
  // Display & Layout (반응형 지원)
  display?: Responsive<
    "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-block" | "none" | "contents"
  >;
  direction?: Responsive<"row" | "column" | "row-reverse" | "column-reverse">;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: "wrap" | "nowrap" | "wrap-reverse";
  flex?: string | number;
  grow?: number;
  shrink?: number;
  // Grid
  cols?: Responsive<number | string>;
  rows?: number | string;
  colSpan?: number;
  rowSpan?: number;
  // Position
  position?: "relative" | "absolute" | "fixed" | "sticky" | "static";
  top?: SpacingToken;
  right?: SpacingToken;
  bottom?: SpacingToken;
  left?: SpacingToken;
  zIndex?: ZIndexToken;
  // Border
  radius?: Responsive<RadiusToken>;
  border?: boolean | string;
  borderWidth?: number;
  // Effects
  shadow?: ShadowToken;
  opacity?: number;
  overflow?: "hidden" | "auto" | "scroll" | "visible";
  cursor?: "pointer" | "default" | "not-allowed" | "grab" | "grabbing" | "text" | "move";
  // Typography
  fontSize?: Responsive<FontSizeToken>;
  fontWeight?: FontWeightToken;
  textAlign?: Responsive<"left" | "center" | "right">;
  lineHeight?: LineHeightToken | number | string;
  letterSpacing?: LetterSpacingToken;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  textDecoration?: "underline" | "line-through" | "none";
  // Transition
  transition?: TransitionToken;
  // User interaction
  userSelect?: "none" | "text" | "all" | "auto";
  pointerEvents?: "none" | "auto";
}

/* ═══════════════════════════ Resolvers ═══════════════════════════ */

function resolveSpacing(value: SpacingToken | undefined): string | undefined {
  if (value === undefined) return undefined;
  // Negative spacing
  if (typeof value === "number" && value < 0) {
    const abs = Math.abs(value);
    return `-${SPACING[abs] ?? `${abs * 4}px`}`;
  }
  return SPACING[value] ?? (typeof value === "number" ? `${value * 4}px` : undefined);
}

function resolveColor(value: ColorToken | undefined): string | undefined {
  if (value === undefined) return undefined;
  return COLORS[value] ?? value;
}

function resolveSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}px`;
  if (value === "full") return "100%";
  if (value === "screen") return "100vw";
  if (value === "screenH") return "100vh";
  return value;
}

function resolveZIndex(value: ZIndexToken | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  return Z_INDICES[value] ?? undefined;
}

function resolveTransition(value: TransitionToken | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value === true) return TRANSITIONS.normal;
  if (value === false) return TRANSITIONS.none;
  return TRANSITIONS[value as string] ?? value;
}

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

/* ═══════════════════════════ Responsive CSS ═══════════════════════════ */

/** 반응형 값인지 확인 */
function isResponsive<T>(
  value: Responsive<T>,
): value is Partial<Record<"base" | BreakpointKey, T>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("base" in value ||
      "sm" in value ||
      "md" in value ||
      "lg" in value ||
      "xl" in value ||
      "2xl" in value)
  );
}

/** 반응형 값에서 base(기본) 값을 추출 */
function getBaseValue<T>(value: Responsive<T>): T | undefined {
  if (isResponsive(value)) return value.base;
  return value as T;
}

/**
 * 반응형 CSS를 생성하여 <style> 태그용 문자열 반환.
 * `id`는 호출자가 hydration-safe하게 (예: useId 결과를 sanitize한 값) 전달해야 한다.
 * id를 생략하면 module-level 카운터를 쓰지만 SSR/CSR 불일치를 유발하므로 권장하지 않음.
 */
let responsiveCounter = 0;

export function generateResponsiveCSS(
  props: StyleProps,
  id?: string,
): { baseStyle: React.CSSProperties; responsiveCSS: string; className: string } | null {
  const responsiveEntries: { bp: BreakpointKey; prop: string; value: string }[] = [];

  // Check each responsive prop
  const check = (
    propName: string,
    propValue: unknown,
    resolver: (v: unknown) => string | undefined,
    cssProperty: string,
  ) => {
    if (propValue === undefined || !isResponsive(propValue)) return;
    for (const [bp, val] of Object.entries(propValue)) {
      if (bp === "base") continue;
      const resolved = resolver(val);
      if (resolved)
        responsiveEntries.push({ bp: bp as BreakpointKey, prop: cssProperty, value: resolved });
    }
  };

  // Spacing props
  const spacingProps = [
    "p",
    "px",
    "py",
    "pt",
    "pr",
    "pb",
    "pl",
    "m",
    "mx",
    "my",
    "mt",
    "mr",
    "mb",
    "ml",
    "gap",
    "rowGap",
    "columnGap",
  ] as const;
  const spacingCSSMap: Record<string, string[]> = {
    p: ["padding"],
    px: ["padding-left", "padding-right"],
    py: ["padding-top", "padding-bottom"],
    pt: ["padding-top"],
    pr: ["padding-right"],
    pb: ["padding-bottom"],
    pl: ["padding-left"],
    m: ["margin"],
    mx: ["margin-left", "margin-right"],
    my: ["margin-top", "margin-bottom"],
    mt: ["margin-top"],
    mr: ["margin-right"],
    mb: ["margin-bottom"],
    ml: ["margin-left"],
    gap: ["gap"],
    rowGap: ["row-gap"],
    columnGap: ["column-gap"],
  };

  for (const sp of spacingProps) {
    const val = props[sp];
    if (val !== undefined && isResponsive(val)) {
      for (const [bp, v] of Object.entries(val)) {
        if (bp === "base") continue;
        const resolved = resolveSpacing(v as SpacingToken);
        if (resolved) {
          for (const cssProp of spacingCSSMap[sp]) {
            responsiveEntries.push({ bp: bp as BreakpointKey, prop: cssProp, value: resolved });
          }
        }
      }
    }
  }

  // Other responsive props
  check("display", props.display, (v) => v as string, "display");
  check("direction", props.direction, (v) => v as string, "flex-direction");
  check(
    "cols",
    props.cols,
    (v) => (typeof v === "number" ? `repeat(${v}, 1fr)` : (v as string)),
    "grid-template-columns",
  );
  check("bg", props.bg, (v) => resolveColor(v as ColorToken), "background-color");
  check("color", props.color, (v) => resolveColor(v as ColorToken), "color");
  check("fontSize", props.fontSize, (v) => FONT_SIZES[v as string] ?? (v as string), "font-size");
  check("radius", props.radius, (v) => RADII[v as string] ?? (v as string), "border-radius");
  check("textAlign", props.textAlign, (v) => v as string, "text-align");
  check("w", props.w, (v) => resolveSize(v as string | number), "width");
  check("h", props.h, (v) => resolveSize(v as string | number), "height");

  if (responsiveEntries.length === 0) return null;

  const finalId = id ?? `jds-r-${++responsiveCounter}`;

  // Group by breakpoint
  const byBp: Record<string, string[]> = {};
  for (const entry of responsiveEntries) {
    const bpPx = BREAKPOINTS[entry.bp];
    const key = `${bpPx}`;
    if (!byBp[key]) byBp[key] = [];
    byBp[key].push(`${entry.prop}: ${entry.value};`);
  }

  let css = "";
  for (const [bpPx, rules] of Object.entries(byBp).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    css += `@media (min-width: ${bpPx}px) { .${finalId} { ${rules.join(" ")} } } `;
  }

  // Resolve base style (non-responsive or base values)
  const baseStyle = resolveStyleProps({
    ...props,
    // Override responsive values with their base
    ...(isResponsive(props.p) ? { p: getBaseValue(props.p) } : {}),
    ...(isResponsive(props.px) ? { px: getBaseValue(props.px) } : {}),
    ...(isResponsive(props.py) ? { py: getBaseValue(props.py) } : {}),
    ...(isResponsive(props.gap) ? { gap: getBaseValue(props.gap) } : {}),
    ...(isResponsive(props.display) ? { display: getBaseValue(props.display) } : {}),
    ...(isResponsive(props.direction) ? { direction: getBaseValue(props.direction) } : {}),
    ...(isResponsive(props.cols) ? { cols: getBaseValue(props.cols) } : {}),
    ...(isResponsive(props.bg) ? { bg: getBaseValue(props.bg) } : {}),
    ...(isResponsive(props.color) ? { color: getBaseValue(props.color) } : {}),
    ...(isResponsive(props.fontSize) ? { fontSize: getBaseValue(props.fontSize) } : {}),
    ...(isResponsive(props.radius) ? { radius: getBaseValue(props.radius) } : {}),
    ...(isResponsive(props.textAlign) ? { textAlign: getBaseValue(props.textAlign) } : {}),
    ...(isResponsive(props.w) ? { w: getBaseValue(props.w) } : {}),
    ...(isResponsive(props.h) ? { h: getBaseValue(props.h) } : {}),
  } as StyleProps);

  return { baseStyle, responsiveCSS: css, className: finalId };
}

/* ═══════════════════════════ Main Resolver ═══════════════════════════ */

/** 토큰 기반 props → CSSProperties 변환 (base 값만, 반응형은 generateResponsiveCSS 사용) */
export function resolveStyleProps(props: StyleProps): React.CSSProperties {
  const style: React.CSSProperties = {};

  // Helper to get base value for responsive-aware props
  const base = <T>(v: Responsive<T> | undefined): T | undefined => {
    if (v === undefined) return undefined;
    return (isResponsive(v) ? getBaseValue(v) : v) as T;
  };

  // Padding
  const p = base(props.p);
  const px = base(props.px);
  const py = base(props.py);
  if (p !== undefined) style.padding = resolveSpacing(p);
  if (px !== undefined) {
    style.paddingLeft = resolveSpacing(px);
    style.paddingRight = resolveSpacing(px);
  }
  if (py !== undefined) {
    style.paddingTop = resolveSpacing(py);
    style.paddingBottom = resolveSpacing(py);
  }
  if (props.pt !== undefined) style.paddingTop = resolveSpacing(base(props.pt));
  if (props.pr !== undefined) style.paddingRight = resolveSpacing(base(props.pr));
  if (props.pb !== undefined) style.paddingBottom = resolveSpacing(base(props.pb));
  if (props.pl !== undefined) style.paddingLeft = resolveSpacing(base(props.pl));

  // Margin
  const m = base(props.m);
  const mx = base(props.mx);
  const my = base(props.my);
  if (m !== undefined) style.margin = resolveSpacing(m);
  if (mx !== undefined) {
    style.marginLeft = resolveSpacing(mx);
    style.marginRight = resolveSpacing(mx);
  }
  if (my !== undefined) {
    style.marginTop = resolveSpacing(my);
    style.marginBottom = resolveSpacing(my);
  }
  if (props.mt !== undefined) style.marginTop = resolveSpacing(base(props.mt));
  if (props.mr !== undefined) style.marginRight = resolveSpacing(base(props.mr));
  if (props.mb !== undefined) style.marginBottom = resolveSpacing(base(props.mb));
  if (props.ml !== undefined) style.marginLeft = resolveSpacing(base(props.ml));

  // Gap
  const gap = base(props.gap);
  if (gap !== undefined) style.gap = resolveSpacing(gap);
  if (props.rowGap !== undefined) style.rowGap = resolveSpacing(base(props.rowGap));
  if (props.columnGap !== undefined) style.columnGap = resolveSpacing(base(props.columnGap));

  // Sizing
  const w = base(props.w);
  const h = base(props.h);
  if (w !== undefined) style.width = resolveSize(w);
  if (h !== undefined) style.height = resolveSize(h);
  if (props.minW !== undefined) style.minWidth = resolveSize(props.minW);
  if (props.minH !== undefined) style.minHeight = resolveSize(props.minH);
  if (props.maxW !== undefined) style.maxWidth = resolveSize(props.maxW);
  if (props.maxH !== undefined) style.maxHeight = resolveSize(props.maxH);

  // Colors
  const bg = base(props.bg);
  const color = base(props.color);
  if (bg !== undefined) style.backgroundColor = resolveColor(bg);
  if (color !== undefined) style.color = resolveColor(color);
  if (props.borderColor !== undefined) style.borderColor = resolveColor(props.borderColor);

  // Display & Flex
  const display = base(props.display);
  const direction = base(props.direction);
  if (display !== undefined) style.display = display;
  if (direction !== undefined) style.flexDirection = direction;
  if (props.align !== undefined) style.alignItems = ALIGN_MAP[props.align];
  if (props.justify !== undefined) style.justifyContent = JUSTIFY_MAP[props.justify];
  if (props.wrap !== undefined) style.flexWrap = props.wrap;
  if (props.flex !== undefined) style.flex = props.flex;
  if (props.grow !== undefined) style.flexGrow = props.grow;
  if (props.shrink !== undefined) style.flexShrink = props.shrink;

  // Grid
  const cols = base(props.cols);
  if (cols !== undefined)
    style.gridTemplateColumns = typeof cols === "number" ? `repeat(${cols}, 1fr)` : cols;
  if (props.rows !== undefined)
    style.gridTemplateRows =
      typeof props.rows === "number" ? `repeat(${props.rows}, 1fr)` : props.rows;
  if (props.colSpan !== undefined) style.gridColumn = `span ${props.colSpan}`;
  if (props.rowSpan !== undefined) style.gridRow = `span ${props.rowSpan}`;

  // Position
  if (props.position !== undefined) style.position = props.position;
  if (props.top !== undefined) style.top = resolveSpacing(props.top);
  if (props.right !== undefined) style.right = resolveSpacing(props.right);
  if (props.bottom !== undefined) style.bottom = resolveSpacing(props.bottom);
  if (props.left !== undefined) style.left = resolveSpacing(props.left);
  if (props.zIndex !== undefined) style.zIndex = resolveZIndex(props.zIndex);

  // Border
  const radius = base(props.radius);
  if (radius !== undefined) style.borderRadius = RADII[radius as string] ?? radius;
  if (props.border === true) {
    style.borderWidth = 1;
    style.borderStyle = "solid";
    style.borderColor = style.borderColor ?? COLORS.border;
  } else if (typeof props.border === "string") {
    style.border = props.border;
  }
  if (props.borderWidth !== undefined) {
    style.borderWidth = props.borderWidth;
    style.borderStyle = "solid";
  }

  // Effects
  if (props.shadow !== undefined) style.boxShadow = SHADOWS[props.shadow] ?? props.shadow;
  if (props.opacity !== undefined) style.opacity = props.opacity;
  if (props.overflow !== undefined) style.overflow = props.overflow;
  if (props.cursor !== undefined) style.cursor = props.cursor;

  // Typography
  const fontSize = base(props.fontSize);
  if (fontSize !== undefined) style.fontSize = FONT_SIZES[fontSize as string] ?? fontSize;
  if (props.fontWeight !== undefined)
    style.fontWeight = FONT_WEIGHTS[props.fontWeight] ?? props.fontWeight;
  const textAlign = base(props.textAlign);
  if (textAlign !== undefined) style.textAlign = textAlign;
  if (props.lineHeight !== undefined) {
    const lh = LINE_HEIGHTS[props.lineHeight as string];
    style.lineHeight = lh ?? props.lineHeight;
  }
  if (props.letterSpacing !== undefined)
    style.letterSpacing = LETTER_SPACINGS[props.letterSpacing] ?? props.letterSpacing;
  if (props.textTransform !== undefined) style.textTransform = props.textTransform;
  if (props.textDecoration !== undefined) style.textDecoration = props.textDecoration;

  // Transition
  if (props.transition !== undefined) style.transition = resolveTransition(props.transition);

  // User interaction
  if (props.userSelect !== undefined) style.userSelect = props.userSelect;
  if (props.pointerEvents !== undefined) style.pointerEvents = props.pointerEvents;

  return style;
}

/* ═══════════════════════════ Prop Splitter ═══════════════════════════ */

const STYLE_PROP_KEYS = new Set<string>([
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "gap",
  "rowGap",
  "columnGap",
  "w",
  "h",
  "minW",
  "minH",
  "maxW",
  "maxH",
  "bg",
  "color",
  "borderColor",
  "display",
  "direction",
  "align",
  "justify",
  "wrap",
  "flex",
  "grow",
  "shrink",
  "cols",
  "rows",
  "colSpan",
  "rowSpan",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
  "radius",
  "border",
  "borderWidth",
  "shadow",
  "opacity",
  "overflow",
  "cursor",
  "fontSize",
  "fontWeight",
  "textAlign",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "textDecoration",
  "transition",
  "userSelect",
  "pointerEvents",
]);

/** props 객체에서 StyleProps와 나머지를 분리 */
export function splitStyleProps<T extends Record<string, unknown>>(
  props: T,
): { styleProps: StyleProps; rest: Omit<T, keyof StyleProps> } {
  const styleProps: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (STYLE_PROP_KEYS.has(key)) {
      styleProps[key] = value;
    } else {
      rest[key] = value;
    }
  }

  return { styleProps: styleProps as StyleProps, rest: rest as Omit<T, keyof StyleProps> };
}

/** 반응형 props가 있는지 확인 */
export function hasResponsiveProps(props: StyleProps): boolean {
  for (const key of STYLE_PROP_KEYS) {
    const val = (props as Record<string, unknown>)[key];
    if (val !== undefined && isResponsive(val)) return true;
  }
  return false;
}

export {
  SPACING,
  COLORS,
  RADII,
  SHADOWS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACINGS,
  Z_INDICES,
  TRANSITIONS,
  BREAKPOINTS,
  isResponsive,
  getBaseValue,
};
